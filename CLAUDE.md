# Power Vac

## Stack

- **Framework**: Next.js 16 (App Router, React 19)
- **CMS**: Directus (headless, hosted on Railway)
- **Styling**: Tailwind CSS v4 with shadcn/ui design tokens
- **Language**: TypeScript (strict mode)
- **Package Manager**: pnpm
- **Hosting**: Netlify (with ISR via @netlify/plugin-nextjs)
- **Animations**: Framer Motion
- **UI Primitives**: Radix UI
- **Icons**: Lucide React / Iconify

## Architecture

### Data Flow

```
Directus CMS → fetch (ISR, 3600s fallback) → Static pages on Netlify
Content edit  → Directus webhook → /api/revalidate → Cache cleared → Next visitor gets fresh page
Visual editor → /api/revalidate-visual-editor → Targeted path revalidation → Iframe reload
```

### Key Files

| File | Purpose |
|------|---------|
| `src/lib/directus.ts` | Directus SDK setup, type definitions, all data fetchers (ISR + preview) |
| `src/lib/mock-data.ts` | Mock data for development without Directus |
| `src/lib/visual-editor.ts` | Directus visual editor initialization and revalidation |
| `src/lib/utils.ts` | `cn()` utility for Tailwind class merging |
| `src/context/GlobalContext.tsx` | React Context for global data (contact info, etc.) |
| `src/components/visual-editor-wrapper.tsx` | Initializes visual editor when loaded in Directus iframe |
| `src/config/site.ts` | Static site configuration (name, URL) |
| `src/app/api/revalidate/route.ts` | Webhook endpoint for cache invalidation |
| `src/app/api/revalidate-visual-editor/route.ts` | Visual editor save handler with collection-to-path mapping |
| `.docs/PROCESS.md` | End-to-end page build workflow (mock → Directus → preview → visual editor → test) |
| `.docs/how-to/` | Step-by-step implementation guides (ISR, previews, visual editor) |

### How-To Documentation

The `.docs/how-to/` directory contains detailed step-by-step guides for implementing key Directus integrations. **Always consult these guides before implementing:**

| Guide | When to read it |
|-------|----------------|
| `HOW_TO_USE_ISR.md` | Setting up ISR fetchers, revalidation webhooks, Directus flows |
| `HOW_TO_IMPLEMENT_DIRECTUS_PREVIEWS.md` | Adding live preview routes, token setup, preview URLs |
| `HOW_TO_IMPLEMENT_DIRECTUS_VISUAL_EDITOR.md` | Adding visual editor support — `setAttr()`, wrapper, revalidation endpoint, common challenges |

The `.docs/troubleshooting/` directory contains root cause analyses and fix documentation for visual editor timing issues. Consult these when debugging visual editor problems — they document the exact issue, why it happens, and how it was solved.

The `.docs/PROCESS.md` file documents the end-to-end workflow for building a new page — from mock data design through Directus migration, preview routes, visual editor setup, and testing. **Always follow this process when building a new page.** It defines the phase order (mock design → Directus collection → fetchers → shared components → preview route → populate → build → test) and includes a testing checklist with troubleshooting for common failures.

These guides document real implementation experience including challenges encountered and their solutions. They are the authoritative reference — do not guess or improvise when these guides cover the topic.

### Mock Data Mode

Each data fetcher in `src/lib/directus.ts` is in one of two states:

- **Mock** — returns data from `src/lib/mock-data.ts` (no Directus fetch). Used for new pages being designed for client sign-off, or collections not yet migrated.
- **Live** — fetches from Directus (no mock reference). Used once a collection is created, populated, and approved.

**Designing a new page:** When asked to design a new page (e.g. "design a landing page using mock data"), create the page component, add mock data to `mock-data.ts`, and write the fetcher to return mock data. The page works locally and on Netlify without any Directus collection. This lets the client review and approve the design before any CMS work begins.

**Migrating to Directus:** Follow these steps in order:

1. Create the collection in Directus and set public read access on all needed fields
2. Populate the collection with content
3. In `src/lib/directus.ts`, replace the fetcher's mock body with a live Directus fetch using `fetchWithRetry()`:
   ```typescript
   // Before (mock):
   export async function getHomePage(): Promise<HomePage | null> {
     const mock = await getMockModule();
     return mock.mockHomePage;
   }

   // After (live):
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
4. Add a `throw` in the page component if the data is critical (singletons like home, about):
   ```typescript
   if (!homePage) {
     throw new Error("Failed to fetch home_page data from Directus");
   }
   ```
5. Delete the corresponding mock data export from `src/lib/mock-data.ts`
6. Remove any unused type imports from `mock-data.ts`
7. Add the collection to the revalidation flow in Directus (see "Directus Flows Setup")
8. Restart dev server and verify live data renders correctly

The `mock-data.ts` file and `getMockModule()` are permanent infrastructure — never delete them entirely.

## Patterns

### ISR Data Fetching

All public data uses ISR with a 1-hour fallback:

```typescript
const response = await fetch(`${directusUrl}/items/collection_name`, {
  next: { revalidate: 3600 },
});
```

**No auth headers on ISR fetchers.** Public/ISR fetchers do NOT use `Authorization` headers or the static token. They rely on the Directus **public role** having read access to the collection. If an ISR fetch returns empty or 403, the fix is to grant the public role read permissions in Directus — not to add auth headers to the fetcher. Only preview fetchers use token auth.

Directus webhooks call `/api/revalidate?secret=YOUR_SECRET` to clear cache immediately on content changes. The 3600s is only a safety net.

### Build & Deploy Resilience

When Netlify deploys the site, `next build` pre-renders all static pages by fetching data from Directus. If Directus is temporarily unreachable (cold start, brief outage), fetchers return `null` and pages are baked with empty content. Two defences prevent this:

**1. Retry logic in fetchers** — All live ISR fetchers use `fetchWithRetry()` (3 attempts, 1s delay). Network errors and 5xx are retried; 4xx are not (they won't self-resolve).

```typescript
// When migrating a fetcher from mock to live, use fetchWithRetry:
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

**2. Build failure on missing critical data** — Page components throw if critical singleton data is `null` after retries. This fails the build, so Netlify keeps the previous working deploy live:

```typescript
if (!homePage) {
  throw new Error("Failed to fetch home_page data from Directus");
}
```

| Stage | Retry succeeds | Retry fails + throw |
|-------|---------------|-------------------|
| `next build` (deploy) | Page renders with data | Build fails, Netlify keeps previous deploy |
| ISR revalidation (runtime) | Page updates with fresh data | Next.js serves stale cached page, retries on next revalidation |

The throw is safe during ISR revalidation — Next.js catches it and continues serving the stale cached version. No visitors see an error page.

### Preview Data Fetching

Preview routes use token auth with no caching:

```typescript
const response = await fetch(`${directusUrl}/items/collection_name`, {
  headers: { Authorization: `Bearer ${token}` },
  cache: "no-store",
});
```

Preview pages must set:

```typescript
export const dynamic = "force-dynamic";
export const revalidate = 0;
```

#### Directus Preview Setup

For live preview to work, the preview URL on each Directus collection must contain a hard-coded token. This requires a dedicated user in Directus:

1. **Create a "Preview User"** in Directus (Settings > Users) with a static token
2. **Assign the Preview User to the Public access policy** — this gives it read access to published content, plus you can grant it access to draft/unpublished items for preview purposes
3. **Configure the preview URL** on each collection (Settings > Data Model > [Collection] > Preview URL) using the token:
   ```
   https://YOUR_SITE_URL/preview/page-slug?token=PREVIEW_USER_TOKEN
   ```
   The token is hard-coded directly in the preview URL — Directus passes this URL to the iframe, and the Next.js preview route reads the token from the query string to authenticate its fetch requests.

When setting up previews for a new project, ensure this user exists and the token is embedded in the collection's preview URL. If preview returns empty data or 403s, check that the Preview User has the correct access policy and that the token in the URL matches the user's static token.

### Preview vs Visual Editor — Two Separate Features

These are **independent Directus features** that must not be conflated:

| Feature | What it does | Key files | When to implement |
|---------|-------------|-----------|-------------------|
| **Live Preview** | Shows an iframe of the Next.js site inside Directus so editors can see draft content before publishing | Preview routes (`/preview/...`), preview fetchers with token auth | **First** — get this working before touching visual editor |
| **Visual Editor** | Overlays click-to-edit regions on the preview iframe so editors can edit fields inline | `setAttr()`, `@directus/visual-editing`, `visual-editor-wrapper.tsx` | **Second** — only after live preview is confirmed working |

**Implementation order:** Always get live preview working and verified first. Only then add visual editor attributes (`setAttr()`) and the visual editor wrapper. Never try to implement both at the same time — preview is the foundation that the visual editor builds on.

**Preview pane interactivity:** Once the visual editor is set up, the preview pane (alongside the edit form) also supports click-to-edit — because preview routes use the same shared components with `setAttr()` and go through the root layout with `VisualEditorWrapper`.

### Troubleshooting — Check Permissions First

When preview, visual editor, or any data fetching feature isn't working, the cause is **almost always a Directus permissions issue** — not a code bug. Before investigating code:

1. **Stop and ask the developer** to check Directus permissions on the relevant collection (Settings > Access Control > Public role or the role used by the static token)
2. Common permission issues:
   - Collection not readable by the public role or API token role
   - Specific fields not included in the role's field permissions
   - Preview token role missing read access to draft/unpublished items
3. **Only after permissions are confirmed correct** should you investigate code-level issues

**Never "fix" ISR fetchers by adding auth headers.** If a public page returns empty data or errors, the answer is almost certainly that the Directus public role lacks read access to the collection — not that the fetcher needs a `Bearer` token. Adding static token auth to ISR fetchers is wrong and breaks the architecture (public pages should not depend on a server-side secret for basic reads).

Do not spend time debugging fetch errors, empty responses, or 403s in code — ask about permissions first.

### Visual Editor Integration

Apply `setAttr()` to any element you want editable in the Directus visual editor:

```tsx
import { setAttr } from "@/lib/visual-editor";

<h2
  data-directus={setAttr({
    collection: "collection_name",
    item: item.id,
    fields: "field_name",
    mode: "popover", // "popover" for inline edit, "drawer" for full form
  })}
>
  {item.field_name}
</h2>
```

### Visual Editor Reload Strategy

The `onSaved` callback in `src/lib/visual-editor.ts` must use a **cache-busting URL redirect** with a **500ms delay** — never `window.location.reload()`. Without this, the browser can serve a cached version of the page or race with Directus's write commit, causing the editor to not see their change until they manually refresh.

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
1. `await triggerRevalidation()` — tells Next.js to invalidate the cached page
2. 500ms delay — gives Directus time to fully commit the write
3. Cache-busting `?_t=<timestamp>` — forces a fresh network request, bypassing the browser cache

### Visual Editor Initialization Timing

There are two timing challenges for the visual editor:

**1. Directus readiness (solved by pre-handshake probing):** The `apply()` function sends a `connect` postMessage to the parent Directus frame and waits up to 1 second for a `confirm` reply. With ISR/server-rendered pages, the iframe hydrates so fast that this 1-second window expires before Directus has set up its postMessage listener — especially in the standalone visual editor module (`/admin/visual/[url]`) where Directus and the iframe load concurrently.

The `initializeVisualEditor()` function in `visual-editor.ts` calls `waitForDirectus()` before `apply()`. This sends lightweight `{ action: "connect" }` probe messages every 500ms and listens for Directus to respond with `{ action: "confirm" }`. Only once confirmed does it call `apply()`, guaranteeing first-attempt success. For the preview pane (where Directus is already loaded), the probe resolves instantly.

**2. Client-side navigation (solved by `usePathname()`):** The `VisualEditorWrapper` lives in the root layout. When a user navigates between pages inside the visual editor iframe, Next.js performs a client-side soft navigation — the layout persists, the page components swap out, but the `useEffect` doesn't re-run if its dependency array is empty. This leaves the library's `State.items` referencing stale DOM elements from the previous page, so the pencil toggle has nothing to show.

Adding `usePathname()` as a dependency triggers React's effect cleanup (`cleanupVisualEditor()` → resets `isApplied`, clears old items) followed by re-initialization (`initializeVisualEditor()` → `waitForDirectus()` resolves instantly → `apply()` scans fresh DOM).

```tsx
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
```

The `initializeVisualEditor()` function must also include `if (window.self === window.top) return;` to skip all visual editor logic when not inside an iframe (normal browsing).

See `.docs/troubleshooting/VEM_CLICKABLE_REGIONS_FIX_ATTEMPT_1.md` for the full investigation, root cause analysis, and implementation details.

### File Proxy

Directus files are served through a Next.js rewrite to hide the backend URL:

```typescript
import { getFileUrl } from "@/lib/directus";

// Returns "/files/abc123" which rewrites to "${directusUrl}/assets/abc123"
const url = getFileUrl(file);
```

### Global Context

Global data (contact info, shared settings) is fetched once in the root layout and provided via React Context:

```tsx
// In any client component:
import { useGlobal } from "@/context/GlobalContext";

const { contact, global } = useGlobal();
```

## Adding a New Page

### Singleton Page (e.g., About, Contact)

1. **Define types** in `src/lib/directus.ts`:
   ```typescript
   export interface AboutPage {
     id: number;
     meta_title: string | null;
     // ... fields matching your Directus collection
   }
   ```

2. **Add to Schema**:
   ```typescript
   interface Schema {
     about_page: AboutPage; // singleton
   }
   ```

3. **Create fetchers** — one ISR, one preview:
   ```typescript
   export async function getAboutPage(): Promise<AboutPage | null> { ... }
   export async function getAboutPagePreview(token: string): Promise<AboutPage | null> { ... }
   ```

4. **Add mock data** in `src/lib/mock-data.ts`

5. **Create page** at `src/app/about/page.tsx`

6. **Create preview** at `src/app/preview/about/page.tsx`

7. **Update revalidation map** in `src/app/api/revalidate-visual-editor/route.ts`:
   ```typescript
   const COLLECTION_PATH_MAP = {
     about_page: ["/about"],
     global: ["/", "/about"], // add to global too
   };
   ```

### Dynamic Collection (e.g., Services, Posts)

Same as above, but:
- Use a regular collection (not singleton) with `status` and `slug` fields
- Add `generateStaticParams()` to the page for SSG
- Handle dynamic paths in the revalidation endpoint (see `pages` example)

## Conventions

### Code Style

- Server Components by default; only add `"use client"` when needed (interactivity, hooks, browser APIs)
- Use `cn()` for conditional className merging — never string concatenation
- Framer Motion for entrance animations, scroll reveal, stagger effects
- Components are functional with TypeScript interfaces for props

### Naming

- **Directus collections**: `snake_case` — e.g., `home_page`, `about_page`
- **Directus fields**: `snake_case` — e.g., `hero_heading`, `meta_title`
- **React components**: `PascalCase` — e.g., `PageHeader`, `ContactForm`
- **Files**: `kebab-case.tsx` — e.g., `visual-editor-wrapper.tsx`
- **Singleton collections** for page content, regular collections for lists

### File Organization

- Shared/reusable components: `src/components/shared/` with barrel exports via `index.ts`
- Page-specific components: co-located in the page directory or `src/components/[feature]/`
- All Directus types and fetchers: `src/lib/directus.ts` (single source of truth)
- Site config constants: `src/config/site.ts`

### Environment Variables

| Variable | Scope | Purpose |
|----------|-------|---------|
| `NEXT_PUBLIC_DIRECTUS_URL` | Public | Directus API URL |
| `DIRECTUS_STATIC_TOKEN` | Server | Read access token for public collections |
| `DIRECTUS_FORM_BOT_TOKEN` | Server | Token for form submissions to Directus |
| `REVALIDATE_SECRET` | Server | Webhook authentication secret |
| `ENABLE_PROTOTYPES` | Server | Enable prototype routes (controlled by Netlify deploy contexts) |

## Prototypes

Prototype pages live at `src/app/(prototypes)/prototypes/[project]/`.

- Only accessible when `ENABLE_PROTOTYPES=true` (branch deploys and deploy previews)
- Never visible on the production site (main branch)
- Use real components with hardcoded data — no Directus dependency
- Store prototype assets in `public/prototypes/[project-name]/`
- Work on branches like `prototype/client-name`, push to get a Netlify preview URL

See README.md for the full prototype workflow.

### Automated Prototype Creation

When the developer asks you to create a prototype (e.g., "create a home page prototype for Acme Corp"), follow this process:

#### Step 1: Check Prerequisites

**Frontend Design Skill (Required)**

Before building any prototype, check that the `frontend-design` skill is installed by running `/skills`. If it is NOT listed, stop and tell the developer:

> The `frontend-design` plugin is required for prototype creation. Install it by running:
> `/plugin install frontend-design`

Do not proceed with prototype creation until the `frontend-design` skill is confirmed installed. **Always invoke the `frontend-design` skill when building prototypes** — it ensures distinctive, production-grade UI that avoids generic AI aesthetics.

**Playwright MCP (Required for site scraping)**

Before scraping any existing site, check that the Playwright MCP server is available. If it's not configured, tell the developer to add it to their Claude Code MCP settings:

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["-y", "@playwright/mcp"]
    }
  }
}
```

Do not proceed with site scraping until Playwright MCP is confirmed working. If the developer can't set it up, skip to step 3 and work without the existing site content.

#### Step 2: Gather Design Context

Check the `inspiration/` directory for a folder matching the prototype being created (e.g., `inspiration/home/` for a home page). The inspiration folder has three possible sources of guidance, checked in this priority order:

1. **`config.json`** — structured design direction including:
   - `source_url`: The client's existing website to scrape for content and structure
   - `colors`: Brand colours to use (primary, secondary, accent, etc.)
   - `fonts`: Font preferences for headings and body text
   - `direction`: Free-text description of the design direction
   - `critical_points`: Array of must-have requirements
   - `sections`: Ordered list of page sections to include

2. **`screenshots/`** — visual design inspiration images. Read these and use them as visual reference for layout, style, and component patterns. These could be screenshots of competitor sites, Dribbble shots, or design mockups.

3. **No inspiration found** — proceed using your front-end expertise alone, based on the project's existing Tailwind theme and component patterns.

Use **all available sources together**. If there's a config.json AND screenshots, use both. If only screenshots, use those. If nothing, use your best judgement.

#### Step 3: Scrape Existing Site (if source_url provided)

If `config.json` contains a `source_url`, use Playwright MCP to:

1. Navigate to the existing site's corresponding page
2. Take screenshots of the existing site and save them to `inspiration/[page]/screenshots/existing-site/` — these serve as a reference and are used later in the comparison report. Capture at minimum:
   - Full page screenshot (desktop viewport)
   - Mobile viewport screenshot
   - Key sections individually if the page is long
3. Understand the content structure (headings, text, images, sections)
4. Capture the navigation items (these will be decorative only — no actual routing unless the developer adds more prototype pages)
5. Note any key content that should be carried over to the prototype

**Do not copy content verbatim** — understand the structure and content themes, then create the prototype with the design direction from the inspiration folder.

#### Step 4: Build the Prototype

Create the prototype following this structure:

1. **Component file(s)** in `src/app/(prototypes)/prototypes/[project]/_components/`
2. **Register** in the PROTOTYPES map in `src/app/(prototypes)/prototypes/[project]/page.tsx`
3. **Assets** (if any) in `public/prototypes/[project-name]/`

When building the prototype:

- **Invoke the `frontend-design` skill** — this is mandatory for all prototype work to ensure high-quality, distinctive UI
- Use the project's existing Tailwind theme and design tokens
- Use Framer Motion for animations (entrance, scroll reveal, stagger)
- Use `cn()` for conditional class merging
- Navigation should be rendered but links are decorative (`href="#"`) unless pointing to other registered prototypes
- All content is hardcoded — no CMS dependency
- The prototype should look and feel production-ready, not like a wireframe
- Respect the `critical_points` from config.json — these are non-negotiable requirements
- Follow the `sections` order from config.json if provided
- Apply `colors` and `fonts` from config.json if provided — integrate them into the component's Tailwind classes or CSS variables

#### Step 5: Generate Comparison Report (On Request)

**Do not generate the report automatically after building the prototype.** The developer needs time to review, test, and refine the prototype first. Only generate the report when the developer explicitly asks — e.g., "generate the comparison report" or "create the report for the home page prototype".

Save the report to `inspiration/[page]/report.md`.

The report should be structured, professional, and suitable for sharing directly with the client. Use this format:

```markdown
# Prototype Comparison Report: [Page Name]

**Client:** [Client name]
**Date:** [Date]
**Existing page:** [source_url]
**Prototype preview:** [localhost or Netlify URL]

## Executive Summary

[2-3 sentences on why the prototype is an improvement]

## Performance

### Load Time & Speed
- Existing site: [observations from Playwright — page weight, render time, number of requests]
- Prototype: [Next.js static generation, optimised images, minimal JS bundle]
- **Improvement:** [specific gains — e.g., "Estimated 60% reduction in page weight"]

### Core Web Vitals (Estimated)
| Metric | Existing Site | Prototype | Impact |
|--------|--------------|-----------|--------|
| LCP (Largest Contentful Paint) | [estimate] | [estimate] | [improvement] |
| CLS (Cumulative Layout Shift) | [estimate] | [estimate] | [improvement] |
| FID/INP (Interaction) | [estimate] | [estimate] | [improvement] |

## Accessibility

- [Specific accessibility improvements — semantic HTML, contrast ratios, ARIA labels, keyboard navigation, heading hierarchy, alt text]
- [Issues found on the existing site that the prototype addresses]

## Visual & UX Improvements

- [Key visual changes and why they benefit users]
- [Layout improvements]
- [Mobile responsiveness differences]
- [Navigation clarity]
- [Call-to-action visibility and placement]

## How This Better Serves Your Users

- [Connect improvements to the client's business goals from critical_points and direction]
- [How the changes help users complete their intended actions]
- [Trust signals, clarity, conversion path improvements]

## Key Differences at a Glance

| Aspect | Existing Site | Prototype |
|--------|--------------|-----------|
| [aspect] | [current] | [improved] |

## Technical Notes

- Built with Next.js (static generation for fast load times)
- Tailwind CSS for consistent, responsive design
- Framer Motion for smooth, performant animations
- Optimised image handling via Next.js Image component
- Semantic HTML5 structure for accessibility and SEO
```

When gathering data for the report:

1. **Use Playwright MCP** to analyse the existing site — check page weight, number of resources, render behaviour, accessibility issues (missing alt text, poor contrast, heading hierarchy, etc.)
2. **Be specific** with numbers and observations, not vague claims
3. **Connect every improvement to user benefit** — don't just say "faster", explain why faster matters for this client's users
4. **Be honest** — if the existing site does something well, acknowledge it
5. **If no source_url** was provided, skip the comparison aspects and write a shorter report focusing on the design decisions, accessibility approach, and technical benefits of the prototype

#### Fallback Chain Summary

```
inspiration/[page]/config.json exists?
  YES → Use colours, direction, critical points, sections, fonts
        source_url in config?
          YES → Playwright MCP available?
                  YES → Scrape existing site for content/structure
                  NO  → Ask developer to install Playwright MCP, or skip
          NO  → Skip scraping
  NO  → Check for screenshots

inspiration/[page]/screenshots/ has images?
  YES → Use as visual design reference
  NO  → Skip

Neither config nor screenshots found?
  → Invoke the frontend-design skill and use project theme defaults
```

## Directus Field Configuration

When creating or updating Directus fields, **always** configure proper validation, notes, and constraints. Every text field must have guardrails so content editors know the limits and get clear feedback.

### Required for Every Text Field

1. **Field note** — Add a helpful note describing the field's purpose and character limit. Shown below the field in the Directus editor.
   - Example: `"Short description for the hero section. Max 250 characters."`

2. **Validation rule** — Use a RegExp validation to enforce character limits:
   - Pattern: `^.{0,N}$` where `N` is the max character count
   - Example for 250 chars: field **Matches RegExp** `^.{0,250}$`

3. **Custom validation message** — A human-readable message explaining the constraint:
   - Example: `"Description must be 250 characters or less."`

4. **`softLength` interface option** — Shows a live character counter in the Directus editing UI. Set this to the same value as your RegExp limit. Without it, editors won't see a counter — the RegExp only prevents saving.
   - Example: `"options": { "softLength": 250 }`

### Recommended Character Limits by Field Type

| Field Type | Max Characters | RegExp | Example Fields |
|-----------|---------------|--------|----------------|
| Heading / Title | 80 | `^.{0,80}$` | `hero_heading`, `meta_title`, `page_title` |
| Short text / Tagline | 150 | `^.{0,150}$` | `hero_tagline`, `card_subtitle` |
| Description / Summary | 250 | `^.{0,250}$` | `hero_description`, `meta_description`, `section_intro` |
| Body / Long text | 500 | `^.{0,500}$` | `about_text`, `service_description` |
| Rich text / WYSIWYG | No RegExp limit | — | `page_content`, `blog_body` (use Directus's built-in rich text editor) |

These are defaults — adjust limits based on the specific design requirements. If a design constrains space (e.g., a card with 2 lines max), set the limit tighter.

### Example: Creating a Field via Directus API

```json
{
  "field": "hero_description",
  "type": "text",
  "meta": {
    "interface": "input-multiline",
    "note": "Short description displayed below the hero heading. Max 250 characters.",
    "options": {
      "softLength": 250
    },
    "validation": {
      "_and": [
        {
          "hero_description": {
            "_regex": "^.{0,250}$"
          }
        }
      ]
    },
    "validation_message": "Description must be 250 characters or less."
  }
}
```

### Image / File Fields

**Do NOT create image or file fields via the API or MCP.** The Directus UI creates file fields as an atomic operation (field + relation to `directus_files` + interface registration) in a single transaction. Creating these via the API requires two separate calls (field, then relation), which can leave the system in an inconsistent state — in one case it caused a login-blocking loop.

**What you CAN do:**
- Upload images to the Directus file library via the API (file import / upload endpoints)
- Assign an existing file UUID to an image field via the API (e.g., `PATCH /items/collection { "image_field": "file-uuid" }`)

**Uploading files — use the Directus URL, not the production site URL.** File uploads go directly to Directus (`NEXT_PUBLIC_DIRECTUS_URL`), not the Next.js site URL. The Next.js `/files/:id` route is a read-only proxy rewrite — it cannot accept uploads.

**What you CANNOT do:**
- Create the image/file field itself via the API or MCP
- Create the relation to `directus_files` via the API or MCP

**Workflow when a collection needs image fields:**

1. Create all non-image fields via the API/MCP as normal
2. Upload any images to the Directus file library via the API
3. Report back to the developer with a list of image fields to add manually, including:
   - Field name (e.g., `intro_image`)
   - Which group it belongs to (e.g., "Intro")
   - Position within the group (e.g., "after `intro_cta_link`, last field in group")
   - Field note to add (e.g., "Image displayed alongside the intro text.")
   - The uploaded file UUID to assign after creation
4. Once the developer confirms the fields are created, assign the uploaded images via the API

### Dynamic Icon Fields (Lucide Icons)

When a Directus collection needs an icon field (e.g., repeater items for services, features, stats, social media), use the **`input-autocomplete-api`** interface backed by the project's icon search API.

#### How It Works

```
Content editor types in Directus → Autocomplete queries /api/icons/search?q={{value}}
→ API searches Lucide icon names/tags → Returns matches → Editor picks icon
→ Stored as PascalCase string (e.g., "ArrowRight") → Rendered by <DynamicIcon />
```

#### Directus Field Configuration

- **Interface**: `input-autocomplete-api`
- **Field width**: Half Width
- **Note**: `"Search for icons or browse all at https://lucide.dev/icons"`
- **Interface Options**:
  - **URL**: `https://YOUR_SITE_URL/api/icons/search?q={{value}}`
  - **Results Path**: `results`
  - **Text Path**: `text`
  - **Value Path**: `value`
  - **Trigger**: `Throttle`
  - **Rate**: `300`

#### Example: Creating an Icon Field via Directus API

```json
{
  "field": "icon",
  "type": "string",
  "meta": {
    "interface": "input-autocomplete-api",
    "width": "half",
    "note": "Search for icons or browse all at https://lucide.dev/icons",
    "options": {
      "url": "https://YOUR_SITE_URL/api/icons/search?q={{value}}",
      "resultsPath": "results",
      "textPath": "text",
      "valuePath": "value",
      "trigger": "throttle",
      "rate": 300
    }
  }
}
```

#### Key Files

| File | Purpose |
|------|---------|
| `src/app/api/icons/search/route.ts` | API endpoint — searches Lucide icons by name/tags via CDN, returns `{ results: [{ text, value }] }` with CORS headers for Directus |
| `src/components/shared/dynamic-icon.tsx` | Client component — renders a Lucide icon by PascalCase name string using `@iconify/react` |

#### Frontend Usage

```tsx
import { DynamicIcon } from "@/components/shared/dynamic-icon";

// Icon name comes from Directus data (e.g., "ArrowRight", "Shield", "Home")
<DynamicIcon name={item.icon} className="h-6 w-6 text-orange-600" />
```

#### Dependencies

- **`@iconify/react`** — Runtime icon rendering (converts PascalCase name to `lucide:kebab-case` and fetches the SVG)

## Repeater (List) Fields

**Always consult `.docs/fields/REPEATERS.md` before creating or updating repeater fields.** It contains the complete reference for types, interfaces, options, and the correct API format.

**Critical:** When creating repeater sub-fields via the API, `field` and `type` must be **duplicated inside `meta`**. The Directus UI reads from `meta.field` and `meta.type`, not the top-level properties. Without them, the field editor shows empty field names, no type, and no interface.

```json
{
  "field": "icon",
  "name": "Icon",
  "type": "string",
  "meta": {
    "field": "icon",
    "type": "string",
    "interface": "input",
    "width": "half",
    "options": { "softLength": 80 }
  }
}
```

## Directus MCP Server

A Directus MCP server should be configured so you can query the Directus schema and collections directly. This helps when adding new pages or keeping type definitions in `src/lib/directus.ts` in sync with the actual Directus schema. See README.md for MCP setup instructions.

### MCP-First Rule

**Always use the Directus MCP server as the primary method for all Directus operations.** Never default to bash/curl for Directus interactions. The MCP server is the correct tool — bash is only a last-resort fallback.

### Before Making Changes

**Always check existing schemas and data first.** Before creating, updating, or deleting any Directus collection, field, or item:

1. Use the MCP server to read the current schema/state
2. Confirm what exists before making changes
3. Never assume a collection or field exists or doesn't exist — verify first

### When MCP Fails

If a Directus MCP operation fails, follow this escalation path in order:

1. **Check you're using the right MCP tool** — verify the tool name and operation match what you're trying to do (e.g., read vs create vs update)
2. **Check the data format/structure** — verify field names, data types, required fields, and JSON structure match what the MCP tool expects. Re-read the schema if needed
3. **Retry the MCP operation** with corrected tool/data
4. **Only if MCP still fails after the above checks**, fall back to bash with curl using the Directus REST API and the `DIRECTUS_STATIC_TOKEN`:
   ```bash
   curl -H "Authorization: Bearer $DIRECTUS_STATIC_TOKEN" \
     -H "Content-Type: application/json" \
     "${NEXT_PUBLIC_DIRECTUS_URL}/items/collection_name"
   ```

The bash/curl fallback is a **last resort only**. Always explain why MCP failed before resorting to it.

## Directus Flows Setup

When connecting a Directus instance to the project, set up these flows to enable cache revalidation and form submission notifications.

### Prerequisites — Directus Environment Variables

These environment variables must be configured in the Directus instance (not the Next.js `.env.local`):

| Variable | Purpose |
|----------|---------|
| `NEXTJS_URL` | The deployed Next.js site URL (e.g., `https://example.com`) |
| `REVALIDATE_SECRET` | Must match the `REVALIDATE_SECRET` in the Next.js `.env.local` |

Set these in your Directus instance settings (Settings > Project Settings > Environment Variables, or via your hosting platform's env config).

### Flow 1: Revalidate Cache

This flow calls the Next.js `/api/revalidate` endpoint whenever content changes in Directus, so the site always shows fresh content without waiting for the 1-hour ISR fallback.

**Create the flow using the Directus MCP `flows` tool:**

```json
{
  "action": "create",
  "data": {
    "name": "[Website] Revalidate Cache",
    "icon": "bolt",
    "description": "Triggers Next.js cache revalidation when content changes",
    "status": "active",
    "trigger": "event",
    "options": {
      "type": "action",
      "scope": ["items.create", "items.update", "items.delete"],
      "collections": ["global"]
    }
  }
}
```

Add every content collection to the `collections` array as you create them (e.g., `home_page`, `about_page`, `services`, etc.). The `global` collection should always be included.

**Create the operation using the `operations` tool:**

```json
{
  "action": "create",
  "data": {
    "flow": "<flow-uuid-from-above>",
    "key": "revalidate_cache",
    "name": "Call Next.js Revalidate",
    "type": "request",
    "position_x": 19,
    "position_y": 1,
    "options": {
      "method": "POST",
      "url": "{{$env.NEXTJS_URL}}/api/revalidate?secret={{$env.REVALIDATE_SECRET}}",
      "headers": []
    },
    "resolve": null,
    "reject": null
  }
}
```

**Link the flow to its entry operation:**

```json
{
  "action": "update",
  "key": "<flow-uuid>",
  "data": {
    "operation": "<operation-uuid>"
  }
}
```

**Maintenance:** Whenever you add a new content collection to Directus, update this flow's `collections` array to include it. Use the MCP `flows` tool to read the flow, then update it.

### Flow 2: Contact Form Submission Email

This flow sends an email notification when a new item is created in the `submissions` collection (i.e., when someone submits the contact form).

**Step 1 — Create the flow:**

```json
{
  "action": "create",
  "data": {
    "name": "[Website] New Contact Submission Email",
    "icon": "mail",
    "description": "Send email notification when new contact form submission is received",
    "status": "active",
    "trigger": "event",
    "options": {
      "type": "action",
      "scope": ["items.create"],
      "collections": ["submissions"]
    }
  }
}
```

**Step 2 — Create the "Build Email HTML" operation (exec):**

This operation builds a styled HTML email from the submission data. Customise the HTML template, colours, and Directus URL to match the project.

```json
{
  "action": "create",
  "data": {
    "flow": "<flow-uuid>",
    "key": "build_email_html",
    "name": "Build Email HTML",
    "type": "exec",
    "position_x": 19,
    "position_y": 1,
    "options": {
      "code": "module.exports = async function(data) {\n  const submission = data.$trigger.payload;\n  const submissionId = data.$trigger.key;\n  \n  const htmlContent = `\n    <h1 style=\"color: #1e293b; font-size: 24px; margin-bottom: 8px;\">New Contact Form Submission</h1>\n    <p style=\"color: #64748b; font-size: 16px; line-height: 1.6; margin-bottom: 24px;\">Someone has submitted the contact form on the website.</p>\n    \n    <div style=\"background-color: #f8fafc; border-radius: 8px; padding: 24px; margin: 24px 0;\">\n      <h2 style=\"color: #3b82f6; font-size: 18px; margin: 0 0 16px 0;\">Contact Details</h2>\n      <table style=\"width: 100%; border-collapse: collapse;\">\n        <tr>\n          <td style=\"padding: 8px 0; color: #64748b; font-size: 14px; width: 100px;\">Name:</td>\n          <td style=\"padding: 8px 0; color: #1e293b; font-size: 14px; font-weight: 600;\">${submission.name}</td>\n        </tr>\n        <tr>\n          <td style=\"padding: 8px 0; color: #64748b; font-size: 14px;\">Email:</td>\n          <td style=\"padding: 8px 0; color: #1e293b; font-size: 14px;\"><a href=\"mailto:${submission.email}\" style=\"color: #3b82f6; text-decoration: none;\">${submission.email}</a></td>\n        </tr>\n        <tr>\n          <td style=\"padding: 8px 0; color: #64748b; font-size: 14px;\">Phone:</td>\n          <td style=\"padding: 8px 0; color: #1e293b; font-size: 14px;\"><a href=\"tel:${submission.phone}\" style=\"color: #3b82f6; text-decoration: none;\">${submission.phone}</a></td>\n        </tr>\n      </table>\n    </div>\n    \n    <div style=\"background-color: #eff6ff; border-radius: 8px; padding: 24px; margin: 24px 0; border-left: 4px solid #3b82f6;\">\n      <h2 style=\"color: #1d4ed8; font-size: 18px; margin: 0 0 12px 0;\">Subject</h2>\n      <p style=\"color: #1e293b; font-size: 16px; font-weight: 600; margin: 0;\">${submission.subject}</p>\n    </div>\n    \n    <div style=\"background-color: #f8fafc; border-radius: 8px; padding: 24px; margin: 24px 0;\">\n      <h2 style=\"color: #475569; font-size: 18px; margin: 0 0 12px 0;\">Message</h2>\n      <p style=\"color: #1e293b; font-size: 14px; line-height: 1.6; margin: 0; white-space: pre-wrap;\">${submission.message}</p>\n    </div>\n    \n    <div style=\"margin: 32px 0;\">\n      <a href=\"mailto:${submission.email}?subject=Re: ${encodeURIComponent(submission.subject)}\" style=\"display: inline-block; background-color: #3b82f6; color: white; padding: 12px 32px; border-radius: 6px; text-decoration: none; font-weight: 500; font-size: 16px;\">Reply to ${submission.name}</a>\n    </div>\n    \n    <p style=\"color: #9ca3af; font-size: 12px; line-height: 1.5; margin-top: 24px;\">This is an automated notification.</p>\n  `;\n  \n  return { htmlContent };\n}"
    },
    "resolve": null,
    "reject": null
  }
}
```

**Step 3 — Create the "Send Email" operation (mail):**

```json
{
  "action": "create",
  "data": {
    "flow": "<flow-uuid>",
    "key": "send_notification_email",
    "name": "Send Notification Email",
    "type": "mail",
    "position_x": 37,
    "position_y": 1,
    "options": {
      "to": ["recipient@example.com"],
      "subject": "Contact Form: {{$trigger.payload.subject}}",
      "type": "template",
      "template": "base",
      "data": {
        "url": "example.com",
        "html": "{{build_email_html.htmlContent}}"
      }
    },
    "resolve": null,
    "reject": null
  }
}
```

Update `to` with the client's email address and `url` with the site domain.

**Step 4 — Link everything:**

```json
// Link build_email_html → send_notification_email
{
  "action": "update",
  "key": "<build_email_html-operation-uuid>",
  "data": {
    "resolve": "<send_notification_email-operation-uuid>"
  }
}

// Set flow entry point
{
  "action": "update",
  "key": "<flow-uuid>",
  "data": {
    "operation": "<build_email_html-operation-uuid>"
  }
}
```

### Flow Creation Order (Important)

Always follow this order when creating flows with the Directus MCP:

1. **Create the flow** (returns flow UUID)
2. **Create all operations** with `resolve: null` and `reject: null` (returns operation UUIDs)
3. **Link operations** by updating `resolve`/`reject` with the UUIDs from step 2
4. **Set the flow entry point** by updating the flow's `operation` field with the first operation's UUID

This order is required because operations must exist before they can be referenced by UUID.

### Submissions Collection Setup

The contact form flow expects a `submissions` collection with these fields:

| Field | Type | Interface | Notes |
|-------|------|-----------|-------|
| `name` | string | input | Required. Max 80 chars. |
| `email` | string | input | Required. Max 250 chars. |
| `phone` | string | input | Required. Max 30 chars. |
| `subject` | string | input | Required. Max 150 chars. |
| `message` | text | input-multiline | Required. Max 2000 chars. |

Create a dedicated Directus user/role ("Form Bot") with **create-only** permissions on the `submissions` collection. Use its static token as `DIRECTUS_FORM_BOT_TOKEN` in `.env.local`. This ensures the form endpoint can only create submissions — not read, update, or delete them.

## Critical Rules

- **Frontend design skill**: ALWAYS invoke the `frontend-design` skill when doing any UI/design work — building pages, creating components, styling layouts, prototypes, or any task that involves visual frontend output. Check it's installed via `/skills` first; if not, prompt the developer to run `/plugin install frontend-design` before proceeding.
- **Tailwind v4 canonical classes**: ALWAYS use canonical Tailwind v4 class names instead of arbitrary value syntax. For example, write `z-1` not `z-[1]`, `mt-4` not `mt-[16px]`. Tailwind v4 supports bare values natively — using the bracket syntax when a canonical class exists will trigger `suggestCanonicalClasses` linter errors.
- **Directus field validation**: ALWAYS add a field note, RegExp validation (`^.{0,N}$`), and a custom validation message to every text field created in Directus. Never create a text field without character limit validation. See "Directus Field Configuration" section for details and recommended limits.
- **ISR resilience**: When migrating a fetcher from mock to live, ALWAYS use `fetchWithRetry()` and add a `throw` in the page component if the data is critical. See "Build & Deploy Resilience" for the pattern.
- **How-to guides**: ALWAYS read the relevant `.docs/how-to/` guide before implementing ISR, previews, or visual editor. These are the authoritative reference.

## Do NOT

- **Do not use bash/curl for Directus operations unless MCP has failed** — always try MCP first, debug MCP issues, and only fall back to bash as a last resort
- **Do not modify Directus schemas without reading them first** — always check existing state via MCP before making changes
- **Do not hardcode content** — all content comes from Directus or mock data
- **Do not use Pages Router patterns** — no `getServerSideProps` or `getStaticProps`, use App Router
- **Do not skip `setAttr()`** on editable content elements — the visual editor depends on it
- **Do not cache preview routes** — always `force-dynamic` + `revalidate = 0`
- **Do not commit `.env.local`** — use `.env.example` as reference
- **Do not install with npm or yarn** — this project uses pnpm
- **Do not conflate live preview with visual editor** — they are separate features; implement preview first, then visual editor
- **Do not debug data fetching issues without first asking about Directus permissions** — permission misconfiguration is the most common cause of preview/editor/fetch failures
- **Do not add auth headers to ISR/public fetchers** — public pages use unauthenticated requests; if data is missing, the Directus public role needs read access, not a Bearer token
- **Do not use bare `fetch()` in live ISR fetchers** — always use `fetchWithRetry()` for resilience against Directus cold starts and transient failures
- **Do not implement previews or visual editor without reading the how-to guides first** — consult `.docs/how-to/` before implementing; they document real challenges and solutions
- **Do not modify Directus permissions or access policies** — never add, change, or remove public read access, role permissions, or access policies via the API or MCP. When a task requires permission changes, report what's needed to the developer and let them handle it manually in the Directus UI
- **Do not upload files to the production site URL** — file uploads go to the Directus URL (`NEXT_PUBLIC_DIRECTUS_URL`), not the Next.js site; the `/files/:id` route is a read-only proxy

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
