# How To: Implement Directus Visual Editor in Next.js

## Overview

The Directus Visual Editor allows content editors to browse your live site and click on elements to edit them directly. Unlike Live Preview (which shows a preview alongside the edit form), Visual Editor lets you click directly on content to open edit popovers.

This guide covers the complete implementation including the challenges encountered and their solutions.

## How Visual Editor Works

The visual editor works in **two places** in Directus:

1. **Visual Editor module** (full-page browser in the Directus sidebar) — browse your live site and click elements to edit
2. **Preview pane** (alongside the edit form) — the preview iframe also supports click-to-edit, because preview routes use the same shared components with `setAttr()` and go through the root layout with `VisualEditorWrapper`

**Flow:**

1. Editor opens Visual Editor in Directus sidebar (or opens a collection item's preview pane)
2. Your site loads in the iframe
3. Editor toggles "Editable Elements" to see what can be edited
4. Clicking an element opens a popover/drawer to edit that field
5. Saving triggers your `onSaved` callback
6. Page refreshes to show updated content

```
┌────────────────────────────────────────────────────────┐
│                 Directus Visual Editor                  │
│  ┌──────────────────────────────────────────────────┐  │
│  │            Your Live Site                         │  │
│  │                                                   │  │
│  │    ┌─────────────────────────┐                   │  │
│  │    │ [Edit] Hero Heading     │ ◄── Click to edit │  │
│  │    │                         │                   │  │
│  │    │ The Installation        │                   │  │
│  │    │ Specialists             │                   │  │
│  │    └─────────────────────────┘                   │  │
│  │                                                   │  │
│  └──────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────┘
```

## Prerequisites

- Next.js 13+ with App Router
- **Directus v11.16.0+** — required by `@directus/visual-editing` v2.0.0 for field access checks. Older Directus versions silently ignore the `checkFieldAccess` message, causing all editable elements to remain inert (no overlays, no edit buttons). See `HOW_TO_UPGRADE_DIRECTUS_PACKAGES.md` for details.
- ISR revalidation endpoint already set up (see HOW_TO_USE_ISR.md)

---

## Step 1: Install the Visual Editing Package

```bash
npm install @directus/visual-editing
# or
pnpm add @directus/visual-editing
```

---

## Step 2: Create Visual Editor Initialization Module

```typescript
// src/lib/visual-editor.ts

import { apply, setAttr, remove } from "@directus/visual-editing";
import { directusUrl } from "./directus";

let isApplied = false;

/**
 * Sends lightweight probe messages to the parent Directus frame until it responds
 * with a "confirm" — proving its postMessage listener is ready. This guarantees
 * that apply() will succeed on the first attempt.
 *
 * For the preview pane (Directus already loaded), resolves on the first probe.
 * For the visual editor module (Directus loading concurrently), waits until ready.
 */
function waitForDirectus(): Promise<void> {
  return new Promise((resolve) => {
    const origin = new URL(directusUrl).origin;

    function onMessage(event: MessageEvent) {
      if (event.origin !== origin) return;
      if (event.data?.action === "confirm") {
        clearInterval(probeInterval);
        window.removeEventListener("message", onMessage);
        resolve();
      }
    }

    window.addEventListener("message", onMessage);

    // Send first probe immediately, then every 500ms
    window.parent.postMessage({ action: "connect" }, directusUrl);
    const probeInterval = setInterval(() => {
      window.parent.postMessage({ action: "connect" }, directusUrl);
    }, 500);
  });
}

async function triggerRevalidation(collection: string): Promise<boolean> {
  try {
    const response = await fetch("/api/revalidate-visual-editor", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ collection }),
    });

    if (!response.ok) {
      console.error("Revalidation request failed:", response.status);
      return false;
    }

    const data = await response.json();
    console.log("Revalidation successful:", data);
    return true;
  } catch (error) {
    console.error("Revalidation error:", error);
    return false;
  }
}

export async function initializeVisualEditor() {
  if (typeof window === "undefined" || isApplied) return;
  if (window.self === window.top) return;

  try {
    await waitForDirectus();

    const result = await apply({
      directusUrl,
      onSaved: async ({ collection }) => {
        // Trigger revalidation and wait for it to complete
        await triggerRevalidation(collection);

        // Delay to ensure Directus has committed the change
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Force reload with cache-busting to get fresh content
        const url = new URL(window.location.href);
        url.searchParams.set("_t", Date.now().toString());
        window.location.href = url.toString();
      },
    });

    if (result) {
      isApplied = true;
    }
  } catch (error) {
    console.error("Failed to initialize visual editor:", error);
  }
}

export function cleanupVisualEditor() {
  if (typeof window !== "undefined" && isApplied) {
    remove();
    isApplied = false;
  }
}

export { setAttr };
```

### Key Points About `initializeVisualEditor`

- **Iframe check (`window.self === window.top`):** Skips all visual editor logic when the page is not inside an iframe. Normal visitors browsing your site directly never load the visual editor library — only the Directus iframe does.
- **Pre-handshake probe (`waitForDirectus()`):** Before calling `apply()`, sends lightweight `{ action: "connect" }` probes every 500ms and waits for Directus to respond with `{ action: "confirm" }`. This guarantees `apply()` succeeds on the first attempt. For the preview pane the probe resolves instantly; for the standalone visual editor module it waits until Directus is ready.
- **`apply()` return value:** The `apply()` function returns `undefined` if the handshake fails. `isApplied` is only set to `true` when `apply()` returns a control object — not unconditionally. This allows re-initialization if the first attempt fails. The global `remove()` import from `@directus/visual-editing` handles cleanup regardless.

### Key Points About `onSaved`

The `onSaved` callback receives an object with:

- `collection`: Name of the collection being edited
- `item`: Primary key of the item
- `payload`: The changed values

**Critical:** When you provide `onSaved`, you override the default reload behavior. You must handle page refresh yourself.

---

## Step 3: Create Visual Editor Revalidation Endpoint

The Visual Editor needs its own revalidation endpoint because:

1. It's called from client-side JavaScript (can't use webhook secret)
2. It needs to revalidate immediately before page reload
3. It receives collection name from `onSaved` callback

```typescript
// src/app/api/revalidate-visual-editor/route.ts

import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

// Map Directus collections to site paths
const COLLECTION_PATH_MAP: Record<string, string[]> = {
  home_page: ["/"],
  about_page: ["/about-us"],
  global: ["/", "/about-us"], // Global affects all pages
  // Add more collections as needed
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { collection } = body;

    if (!collection) {
      return NextResponse.json(
        { error: "Collection is required" },
        { status: 400 }
      );
    }

    // Get paths to revalidate for this collection
    const paths = COLLECTION_PATH_MAP[collection];

    if (!paths || paths.length === 0) {
      return NextResponse.json(
        { error: "Unknown collection", collection },
        { status: 400 }
      );
    }

    // Revalidate all paths for this collection
    for (const path of paths) {
      revalidatePath(path);
    }

    return NextResponse.json({
      revalidated: true,
      collection,
      paths,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error("Visual editor revalidation error:", error);
    return NextResponse.json({ error: "Revalidation failed" }, { status: 500 });
  }
}
```

---

## Step 4: Create Visual Editor Wrapper Component

This component initializes the Visual Editor on all pages:

```typescript
// src/components/visual-editor-wrapper.tsx

"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  initializeVisualEditor,
  cleanupVisualEditor,
} from "@/lib/visual-editor";

interface VisualEditorWrapperProps {
  children: React.ReactNode;
}

/**
 * Wrapper component that initializes Directus Visual Editor.
 * Only activates when the page is loaded inside the Directus Visual Editor iframe.
 *
 * Uses usePathname() as a dependency so the visual editor re-initializes
 * when navigating between pages inside the iframe (client-side navigation).
 */
export function VisualEditorWrapper({ children }: VisualEditorWrapperProps) {
  const pathname = usePathname();

  useEffect(() => {
    if (document.readyState === "complete") {
      initializeVisualEditor();
    } else {
      window.addEventListener("load", initializeVisualEditor);
      return () => {
        window.removeEventListener("load", initializeVisualEditor);
        cleanupVisualEditor();
      };
    }

    return () => {
      cleanupVisualEditor();
    };
  }, [pathname]);

  return <>{children}</>;
}
```

### Why `window.onload` and `usePathname`?

**`window.onload`:** The `apply()` function from `@directus/visual-editing` sends a `connect` postMessage to the parent Directus frame and waits up to 1 second for a `confirm` reply. With server-rendered Next.js pages, the iframe hydrates extremely fast — often before the Directus Visual Editor module has set up its own postMessage listener. Waiting for `window.onload` gives Directus time to be ready. The `waitForDirectus()` probe in `initializeVisualEditor()` provides an additional safety net beyond `window.onload`.

**`usePathname`:** The wrapper lives in the root layout. When a user navigates between pages inside the visual editor iframe, Next.js performs a client-side soft navigation — the layout persists and page components swap out, but the `useEffect` wouldn't re-run with an empty `[]` dependency. This would leave the library's internal `State.items` referencing DOM elements from the previous page. Adding `pathname` as a dependency triggers cleanup (clears old items/overlays, resets `isApplied`) then re-initialization (scans the new page's DOM for `data-directus` elements).

For the preview pane, `pathname` never changes (you're editing a single page), so the effect runs exactly once on mount — identical to an empty dependency array.

---

## Step 5: Add Wrapper to Root Layout

```typescript
// src/app/layout.tsx

import { VisualEditorWrapper } from "@/components/visual-editor-wrapper";
import { GlobalProvider } from "@/context/GlobalContext";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const global = await getGlobal();

  return (
    <html lang="en">
      <body>
        <GlobalProvider global={global}>
          <VisualEditorWrapper>{children}</VisualEditorWrapper>
        </GlobalProvider>
      </body>
    </html>
  );
}
```

---

## Step 6: Add `data-directus` Attributes to Components

The `setAttr` function creates attributes that tell the Visual Editor which field to edit when clicked.

### Attribute Options

```typescript
setAttr({
  collection: "collection_name", // Directus collection
  item: "1", // Item ID (string)
  fields: "field_name", // Single field or array of fields
  mode: "popover" | "modal" | "drawer", // Edit UI mode
});
```

**Modes:**

- `popover`: Small inline popup (best for simple text)
- `modal`: Full overlay dialog (best for images, rich text)
- `drawer`: Side panel (best for multiple related fields)

### Example: Hero Component

```typescript
// src/components/shared/hero.tsx

"use client";

import { setAttr } from "@/lib/visual-editor";

export function Hero({
  badgeText,
  heading,
  description,
  benefits,
  // ...other props
}) {
  return (
    <section>
      {/* Badge - simple text, use popover */}
      <span
        data-directus={setAttr({
          collection: "home_page",
          item: "1",
          fields: "hero_badge_text",
          mode: "popover",
        })}
      >
        {badgeText}
      </span>

      {/* Heading - simple text, use popover */}
      <h1
        data-directus={setAttr({
          collection: "home_page",
          item: "1",
          fields: "hero_heading",
          mode: "popover",
        })}
      >
        {heading}
      </h1>

      {/* Description - simple text, use popover */}
      <p
        data-directus={setAttr({
          collection: "home_page",
          item: "1",
          fields: "hero_description",
          mode: "popover",
        })}
      >
        {description}
      </p>

      {/* Benefits array - use drawer for complex data */}
      <ul
        data-directus={setAttr({
          collection: "home_page",
          item: "1",
          fields: "hero_benefits",
          mode: "drawer",
        })}
      >
        {benefits?.map((benefit) => (
          <li key={benefit.text}>{benefit.text}</li>
        ))}
      </ul>

      {/* Multiple related fields - use array */}
      <div
        data-directus={setAttr({
          collection: "home_page",
          item: "1",
          fields: ["hero_stat_1_value", "hero_stat_1_label"],
          mode: "popover",
        })}
      >
        <span>{stat1Value}</span>
        <span>{stat1Label}</span>
      </div>
    </section>
  );
}
```

---

## Step 7: Configure Visual Editor URL in Directus

1. Go to **Settings** in Directus sidebar
2. Scroll down to **Visual Editor** section
3. Click **Create New**
4. Enter your site URL: `https://your-site.com/`
5. Save

**Important:** Use your live site URL, not a preview URL. The Visual Editor browses your actual site.

---

## Step 8: Configure CORS (Self-Hosted Directus)

Add these environment variables to your Directus instance:

```yaml
CORS_ENABLED: "true"
CORS_ORIGIN: "https://your-site.com"
CONTENT_SECURITY_POLICY_DIRECTIVES__FRAME_SRC: "https://your-site.com"
```

---

## Challenges & Solutions

### Challenge 1: Content Not Updating After Save

**Symptom:** Save completes, page reloads, but old content still shows.

**Cause:** ISR caching serves stale content even after reload.

**Solution:** Implement the revalidation endpoint and call it in `onSaved` with a cache-busting redirect:

```typescript
onSaved: async ({ collection }) => {
  await triggerRevalidation(collection);
  await new Promise((resolve) => setTimeout(resolve, 500));
  const url = new URL(window.location.href);
  url.searchParams.set("_t", Date.now().toString());
  window.location.href = url.toString();
},
```

### Challenge 2: Visual Editor Not Loading/Showing Elements

**Symptom:** Toggle "Editable Elements" shows nothing.

**Cause:** Visual Editor code only on preview routes, not live site.

**Solution:** The Visual Editor must run on your **live site**, not preview routes. Add `VisualEditorWrapper` to your root layout so it initializes on all pages.

### Challenge 3: onSaved Not Triggering Properly

**Symptom:** Save doesn't trigger page refresh.

**Cause:** Misunderstanding of default behavior.

**Key insight from Directus docs:**

> "When no `onSaved` callback is provided, the current page will be reloaded using `window.location.reload()`"
>
> "If you provide the callback, you override the default reload behavior entirely and must handle any necessary page updates yourself."

**Solution:** When you provide `onSaved`, YOU must handle the reload. The Visual Editor won't reload automatically.

### Challenge 4: Stale Content After Save

**Symptom:** Editor saves a change, the page reloads, but the old content still shows.

**Cause:** Multiple caching layers can serve stale content — ISR server cache, browser cache, and a race condition where the page reloads before Directus has fully committed the write.

**Never use `window.location.reload()`** — it serves the browser-cached version of the page and bypasses ISR revalidation entirely.

**Working solution:** Revalidate the ISR cache, wait 500ms for Directus to commit, then redirect with a cache-busting query parameter:

```typescript
onSaved: async ({ collection }) => {
  await triggerRevalidation(collection);
  await new Promise((resolve) => setTimeout(resolve, 500));
  const url = new URL(window.location.href);
  url.searchParams.set("_t", Date.now().toString());
  window.location.href = url.toString();
},
```

**Why each step matters:**
1. `await triggerRevalidation()` — tells Next.js to invalidate the ISR cached page
2. 500ms delay — gives Directus time to fully commit the write
3. Cache-busting `?_t=<timestamp>` — forces a fresh network request, bypassing the browser cache

### Challenge 5: Different Layouts Between Visual Editor and Live Site

**Symptom:** Visual Editor shows different/broken layout compared to live site.

**Cause:** This happens when preview routes use different components than the live site.

**Solution:** Ensure both live site AND any preview routes use the exact same shared components. Don't create separate preview-specific components.

### Challenge 6: Empty Pages After Deploy (Build-Time Fetch Failure)

**Symptom:** After a deploy, the live site shows fallback/default values instead of CMS content (e.g., "Fraser Water Services" instead of the actual heading, missing sections). Content returns after triggering revalidation or redeploying.

**Cause:** During the Netlify build, `next build` pre-renders all static pages by calling ISR fetchers (`getHomePage()`, `getGlobal()`, etc.). If Directus is temporarily slow or unreachable at that moment, the fetch returns `null` and the static page is baked into the deploy with empty data. The 3600s ISR revalidation would eventually self-heal, but visitors see a broken page until then.

**Solution:** Two complementary defences:

**1. Retry logic in fetchers** — Catches transient blips (cold starts, brief network issues):

```typescript
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

async function fetchWithRetry(
  url: string,
  options: RequestInit & { next?: { revalidate: number } },
  label: string
): Promise<Response | null> {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(url, options);

      // Don't retry client errors (4xx) — these won't self-resolve
      if (response.ok) return response;
      if (response.status >= 400 && response.status < 500) {
        console.error(`${label}: ${response.status} ${response.statusText}`);
        return null;
      }

      // Server error (5xx) — retry
      console.warn(
        `${label}: ${response.status} (attempt ${attempt}/${MAX_RETRIES})`
      );
    } catch (error) {
      // Network error — retry
      console.warn(
        `${label}: network error (attempt ${attempt}/${MAX_RETRIES})`,
        error
      );
    }

    if (attempt < MAX_RETRIES) {
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
    }
  }

  console.error(`${label}: all ${MAX_RETRIES} attempts failed`);
  return null;
}
```

Then use it in your ISR fetchers:

```typescript
export async function getHomePage(): Promise<HomePage | null> {
  const response = await fetchWithRetry(
    `${directusUrl}/items/home_page`,
    { next: { revalidate: 3600 } },
    "getHomePage"
  );

  if (!response) return null;
  const json = await response.json();
  return json.data;
}
```

**2. Fail the build if critical data is missing** — If retries are exhausted and data is still `null`, throw an error in the page component so the build fails. Netlify keeps the previous working deploy live, so visitors never see a broken page:

```typescript
export default async function Home() {
  const [homePage, global] = await Promise.all([getHomePage(), getGlobal()]);

  if (!homePage) {
    throw new Error("Failed to fetch home_page data from Directus");
  }

  // ... render page
}
```

**How this works at each stage:**

| Stage                      | Retry succeeds               | Retry fails + throw                                            |
| -------------------------- | ---------------------------- | -------------------------------------------------------------- |
| `next build` (deploy)      | Page renders with data       | Build fails, Netlify keeps previous deploy                     |
| ISR revalidation (runtime) | Page updates with fresh data | Next.js serves stale cached page, retries on next revalidation |

**Key point:** The throw is safe during ISR revalidation — Next.js catches it and continues serving the stale cached version until the next successful revalidation. No visitors see an error page.

---

## Testing Visual Editor

1. Deploy your site with all changes
2. Open Directus → Click **Visual Editor** in sidebar
3. Your site loads in the iframe
4. Click **Toggle Editable Elements** in top toolbar
5. Hover over content - edit icons should appear
6. Click an element to open edit popover
7. Make a change and save
8. Page should reload with updated content

### Debugging

Check browser console (inside the iframe) for:

- `"Revalidation successful"` - confirms revalidation worked
- Any errors during `initializeVisualEditor()`

---

## Adding Visual Editing to New Components

1. **Import setAttr:**

   ```typescript
   import { setAttr } from "@/lib/visual-editor";
   ```

2. **Add data-directus to each editable element:**

   ```typescript
   <h1
     data-directus={setAttr({
       collection: "your_collection",
       item: "1",  // or dynamic ID
       fields: "field_name",
       mode: "popover",
     })}
   >
     {content}
   </h1>
   ```

3. **Update collection path map:**
   ```typescript
   // In /api/revalidate-visual-editor/route.ts
   const COLLECTION_PATH_MAP: Record<string, string[]> = {
     your_collection: ["/your-page"],
     // ...
   };
   ```

---

## File Structure

```
src/
├── app/
│   ├── layout.tsx                  # Includes VisualEditorWrapper
│   ├── api/
│   │   └── revalidate-visual-editor/
│   │       └── route.ts            # Visual Editor revalidation
│   └── ...
├── components/
│   ├── visual-editor-wrapper.tsx   # Initializes Visual Editor
│   └── shared/
│       ├── hero.tsx                # Has data-directus attributes
│       ├── services.tsx            # Has data-directus attributes
│       └── ...
└── lib/
    ├── directus.ts                 # Directus URL export
    └── visual-editor.ts            # apply(), setAttr(), onSaved logic
```

---

## Security Considerations

1. **Revalidation endpoint is public:** It only invalidates cache (low risk). For extra security, add origin checking.

2. **Visual Editor only works in Directus iframe:** The `apply()` function only activates when loaded inside Directus.

3. **No data modification:** The endpoint doesn't modify content, only cache.

---

## Summary: Visual Editor vs Live Preview

| Feature     | Live Preview                           | Visual Editor                 |
| ----------- | -------------------------------------- | ----------------------------- |
| Location    | Sidebar panel when editing             | Full-page browser in Directus |
| Interaction | View + click to edit (via `setAttr`)   | Click to edit                 |
| URL         | `/preview/page?token=...`              | Your live site URL            |
| Caching     | `cache: "no-store"`                    | ISR + revalidation            |
| Components  | Same as live site                      | Same as live site             |

**Note:** The preview pane supports click-to-edit because preview routes use the same shared components (with `setAttr()` attributes) and go through the root layout which includes `VisualEditorWrapper`. This means both the Visual Editor module and the preview pane benefit from the visual editing setup.

---

## References

- [Directus Visual Editor Documentation](https://directus.io/docs/guides/content/visual-editor)
- [Directus Frontend Library](https://directus.io/docs/guides/content/visual-editor/frontend-library)
- [@directus/visual-editing npm](https://www.npmjs.com/package/@directus/visual-editing)
- [Integrating Visual Editor with Next.js](https://directus.io/docs/tutorials/getting-started/integrating-the-directus-visual-editor-with-nextjs)
