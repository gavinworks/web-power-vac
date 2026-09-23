# How To: Implement Directus Live Preview in Next.js

## Overview

Directus Live Preview allows content editors to see changes in real-time while editing content in the Directus admin panel. The preview appears in an iframe alongside the edit form.

This guide covers implementing token-based preview routes that bypass ISR caching to show fresh content.

## How Live Preview Works

1. Editor opens a collection item in Directus
2. Clicks the "Preview" icon in the sidebar
3. Directus loads your preview URL in an iframe with a token
4. Your preview route fetches content using the token (bypassing cache)
5. Changes appear instantly as the editor types

```
┌────────────────────────────────────────────────────────┐
│                    Directus Admin                       │
│  ┌──────────────────┐    ┌──────────────────────────┐  │
│  │  Edit Form       │    │  Preview iframe          │  │
│  │                  │    │                          │  │
│  │  Title: [____]   │    │  ┌────────────────────┐  │  │
│  │                  │    │  │  Your Site         │  │  │
│  │  Content: [___]  │    │  │  (preview route)   │  │  │
│  │                  │    │  │                    │  │  │
│  └──────────────────┘    │  └────────────────────┘  │  │
│                          └──────────────────────────┘  │
└────────────────────────────────────────────────────────┘
```

## Prerequisites

- Next.js 13+ with App Router
- Directus instance with admin access
- Existing page components that accept data as props

---

## Step 1: Create Preview Fetch Functions

Add functions that fetch content with token authentication and no caching:

```typescript
// src/lib/directus.ts

export const directusUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL || "http://localhost:8055";

/**
 * Fetch home page data with token authentication for live preview
 * Always fetches fresh data (no caching) for real-time preview
 */
export async function getHomePagePreview(token: string): Promise<HomePage | null> {
  try {
    const response = await fetch(`${directusUrl}/items/home_page`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store", // Critical: bypasses all caching
    });

    if (!response.ok) {
      console.error("Failed to fetch home_page preview:", response.statusText);
      return null;
    }

    const json = await response.json();
    return json.data;
  } catch (error) {
    console.error("Error fetching home_page preview:", error);
    return null;
  }
}

/**
 * Fetch global data with token authentication for live preview
 */
export async function getGlobalPreview(token: string): Promise<Global | null> {
  try {
    const response = await fetch(
      `${directusUrl}/items/global?fields=*,policy_documents.*,policy_documents.policy_file.*`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      console.error("Failed to fetch global preview:", response.statusText);
      return null;
    }

    const json = await response.json();
    return json.data;
  } catch (error) {
    console.error("Error fetching global preview:", error);
    return null;
  }
}
```

**Key points:**
- `cache: "no-store"` is critical - it bypasses ISR caching entirely
- Token is passed via `Authorization: Bearer` header
- Create one preview function per collection

---

## Step 2: Create Preview Routes

Create preview routes that use the same components as your live site:

```typescript
// src/app/preview/home/page.tsx

import { redirect } from "next/navigation";
import { Navigation, Hero, Services, Stats, CTA, Footer } from "@/components/shared";
import { getHomePagePreview, getGlobalPreview } from "@/lib/directus";
import { GlobalProvider } from "@/context/GlobalContext";

interface PreviewPageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function HomePreview({ searchParams }: PreviewPageProps) {
  const { token } = await searchParams;

  // Redirect to public page if no token provided
  if (!token) {
    redirect("/");
  }

  // Fetch fresh data using token
  const [homePage, global] = await Promise.all([
    getHomePagePreview(token),
    getGlobalPreview(token),
  ]);

  // Render using the SAME components as the live site
  return (
    <GlobalProvider global={global}>
      <Navigation />
      <main>
        <Hero
          badgeText={homePage?.hero_badge_text}
          heading={homePage?.hero_heading}
          description={homePage?.hero_description}
          benefits={homePage?.hero_benefits}
          stat1Value={homePage?.hero_stat_1_value}
          stat1Label={homePage?.hero_stat_1_label}
          stat2Value={homePage?.hero_stat_2_value}
          stat2Label={homePage?.hero_stat_2_label}
          stat3Value={homePage?.hero_stat_3_value}
          stat3Label={homePage?.hero_stat_3_label}
        />
        <Services
          badge={homePage?.services_badge}
          heading={homePage?.services_heading}
          description={homePage?.services_description}
          items={homePage?.services_items}
        />
        <Stats
          badge={homePage?.stats_badge}
          heading={homePage?.stats_heading}
          items={homePage?.stats_items}
        />
        <CTA
          heading={homePage?.cta_heading}
          description={homePage?.cta_description}
          benefits={homePage?.cta_benefits}
          cardHeading={homePage?.cta_card_heading}
          cardDescription={homePage?.cta_card_description}
        />
      </main>
      <Footer />
    </GlobalProvider>
  );
}
```

### Critical: Use the Same Components

**DO NOT** create separate preview-specific components. This causes:
- Layout differences between preview and live site
- Missing styles, animations, or icons
- Maintenance burden of keeping two versions in sync

**ALWAYS** reuse your existing shared components. The only difference should be:
- Data fetching (token-based, no-cache)
- Route location (`/preview/home` vs `/`)

---

## Step 3: Generate a Static Token in Directus

1. Go to **Settings** → **Access Control** → **Users**
2. Select an admin user (or create a dedicated preview user)
3. Scroll to **Token** field
4. Click **Generate** to create a static token
5. **Copy the token** and save the user
6. Store this token securely - you'll need it for the preview URL

---

## Step 4: Configure Preview URL in Directus Collection

For each collection that needs preview:

1. Go to **Settings** → **Data Model**
2. Click on your collection (e.g., `home_page`)
3. Find the **Preview URL** field
4. Enter your preview URL with the token:

```
https://your-site.com/preview/home?token=YOUR_STATIC_TOKEN
```

**Example URLs:**
| Collection | Preview URL |
|------------|-------------|
| home_page | `https://your-site.com/preview/home?token=abc123...` |
| about_page | `https://your-site.com/preview/about-us?token=abc123...` |

### Important: Hardcode the Token

The token must be hardcoded in the URL. Directus template variables like `{{$CURRENT_USER.token}}` may not work reliably. Use your static token directly.

---

## Step 5: Configure Content Security Policy (Self-Hosted)

For self-hosted Directus, add these environment variables to allow iframe embedding:

```yaml
# docker-compose.yml or Railway/hosting env vars
CONTENT_SECURITY_POLICY_DIRECTIVES__FRAME_SRC: "https://your-site.com"
```

This allows Directus to load your site in an iframe.

---

## Step 6: Test Live Preview

1. Open a collection item in Directus (e.g., Home Page)
2. Click the **Preview** icon in the sidebar (eye icon)
3. A panel should open showing your site
4. Edit a field and save
5. The preview should refresh with updated content

### Interactive Preview (Click-to-Edit)

Once the Visual Editor is also set up (see `HOW_TO_IMPLEMENT_DIRECTUS_VISUAL_EDITOR.md`), the preview pane supports click-to-edit — not just view-only preview. This works because:

- Preview routes use the **same shared components** as the live site, which include `setAttr()` data attributes
- Preview routes go through the **root layout**, which includes `VisualEditorWrapper`
- The `VisualEditorWrapper` detects it's inside a Directus iframe and initializes the visual editor

This means editors can click on editable elements directly in the preview pane to open edit popovers, just like in the Visual Editor module.

---

## Challenges & Solutions

### Challenge 1: Preview Shows Cached Content

**Symptom:** Changes don't appear in preview after saving.

**Cause:** Fetch requests are being cached despite `cache: "no-store"`.

**Solution:** Ensure you're using the preview fetch functions with:
```typescript
cache: "no-store"
```

### Challenge 2: Preview Layout Differs from Live Site

**Symptom:** Missing styling, icons, or layout elements in preview.

**Cause:** Created separate preview-specific components instead of reusing shared components.

**Solution:** Delete custom preview components and use the same shared components as the live site:

```typescript
// ❌ Wrong - separate preview component
import { HomePreviewContent } from "./home-preview-content";

// ✅ Correct - reuse shared components
import { Hero, Services, Stats, CTA } from "@/components/shared";
```

### Challenge 3: Token Variable Not Working

**Symptom:** Preview URL shows `?token=` with no value.

**Cause:** Directus template variables like `{{$CURRENT_USER.token}}` not interpolating.

**Solution:** Hardcode the static token in the URL:
```
https://your-site.com/preview/home?token=10qsk9zC2AAjZKnHil7axzXZDiWE_Qy4
```

### Challenge 4: Preview Won't Load in Iframe

**Symptom:** Blank iframe or security error.

**Cause:** Missing Content Security Policy configuration.

**Solution:** Add CSP environment variable to Directus:
```
CONTENT_SECURITY_POLICY_DIRECTIVES__FRAME_SRC=https://your-site.com
```

---

## Adding Preview to New Pages

When adding a new CMS-managed page:

1. **Create preview fetch function:**
   ```typescript
   export async function getNewPagePreview(token: string): Promise<NewPage | null> {
     // ... with cache: "no-store"
   }
   ```

2. **Create preview route:**
   ```
   src/app/preview/new-page/page.tsx
   ```

3. **Configure Directus collection:**
   - Set Preview URL: `https://your-site.com/preview/new-page?token=YOUR_TOKEN`

---

## File Structure

```
src/
├── app/
│   ├── page.tsx                    # Live home page
│   ├── about-us/
│   │   └── page.tsx                # Live about page
│   └── preview/
│       ├── home/
│       │   └── page.tsx            # Preview home page
│       └── about-us/
│           └── page.tsx            # Preview about page
├── components/
│   └── shared/
│       ├── hero.tsx                # Shared - used by both
│       ├── services.tsx            # Shared - used by both
│       └── ...
└── lib/
    └── directus.ts                 # Includes preview fetch functions
```

---

## Security Considerations

1. **Token exposure:** The static token is visible in the URL. Use a dedicated read-only user for previews if concerned.

2. **Preview routes are public:** Anyone with the URL and token can access previews. For sensitive content, consider:
   - Using short-lived tokens
   - IP restrictions
   - Additional authentication layer

3. **Token in URL history:** The token appears in browser history and server logs. For production, consider more secure token passing methods.

---

## References

- [Directus Live Preview Documentation](https://directus.io/docs/tutorials/getting-started/implementing-live-preview-in-next-js)
- [Next.js Draft Mode](https://nextjs.org/docs/app/building-your-application/configuring/draft-mode) (alternative approach)
