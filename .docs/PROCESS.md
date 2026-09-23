# Page Build Process

End-to-end workflow for building a new page — from mock data design through Directus migration, preview routes, and visual editor testing.

---

## Phase 1: Design with Mock Data

Build the page using hardcoded mock data so the client can review and approve the design before any CMS work begins.

### 1. Define the type

Add the interface to `src/lib/directus.ts`:

```typescript
export interface ExamplePage {
  id: number;
  meta_title: string | null;
  meta_description: string | null;
  page_title: string | null;
  // ... all fields the page needs
}
```

Add to the Schema:

```typescript
interface Schema {
  example_page: ExamplePage; // singleton
}
```

### 2. Add mock data

Add the page data to `src/lib/mock-data.ts`:

```typescript
export const mockExamplePage: ExamplePage = {
  id: 1,
  meta_title: "Example Page",
  meta_description: "Description for search engines.",
  page_title: "Example Page",
  // ... all fields with realistic content
};
```

### 3. Write the mock fetcher

In `src/lib/directus.ts`, create a fetcher that returns mock data:

```typescript
export async function getExamplePage(): Promise<ExamplePage | null> {
  return getMockModule().then((m) => m.mockExamplePage);
}
```

### 4. Build the page

Create `src/app/example/page.tsx` as a server component:

```typescript
export async function generateMetadata(): Promise<Metadata> {
  const data = await getExamplePage();
  return {
    title: data?.meta_title ?? "Example",
    description: data?.meta_description ?? "",
  };
}

export default async function ExamplePage() {
  const data = await getExamplePage();
  if (!data) throw new Error("Failed to fetch example_page data");
  // Render components with data props
}
```

### 5. Client review

Deploy to a branch/preview URL. Client reviews and approves the design. Only proceed to Phase 2 once approved.

---

## Phase 2: Create Directus Collection

### 1. Check existing schema

Always verify the collection's current state via MCP before making changes:

```
MCP directus > collections (read)
MCP directus > fields (read, collection: "example_page")
```

### 2. Create field groups

Use `group-detail` (NOT `presentation-divider`) to organise fields into collapsible groups. `presentation-divider` renders a visual line but does NOT contain child fields — only `group-detail` is a proper container that shows fields nested inside it.

```json
{
  "field": "seo",
  "type": "alias",
  "meta": {
    "interface": "group-detail",
    "special": ["alias", "no-data", "group"],
    "options": { "start": "open" },
    "width": "full"
  },
  "schema": null
}
```

Standard groups:

| Group | Fields |
|-------|--------|
| SEO | `meta_title`, `meta_description` |
| Page Hero | `page_title` |
| Section-specific | Fields for each content section |

Create groups first, then fields within each group (set `"group": "group_field_name"` on each child field).

### 3. Create text fields

Every text field must have:

- **Field note** — purpose and character limit (e.g., "Page heading. Max 80 characters.")
- **RegExp validation** — `^.{0,N}$` where N is the max character count
- **Custom validation message** — e.g., "Heading must be 80 characters or less."
- **`softLength` in interface options** — shows the live character counter in the editing UI

Standard character limits:

| Type | Max | RegExp |
|------|-----|--------|
| Heading / Title | 80 | `^.{0,80}$` |
| Short text / Tagline | 150 | `^.{0,150}$` |
| Description / Summary | 250 | `^.{0,250}$` |
| Body / Long text | 500 | `^.{0,500}$` |
| Rich text / WYSIWYG | No limit | — |

### 4. Create repeater fields

Consult `.docs/fields/REPEATERS.md` for the correct format. Critical rule: `field` and `type` must be duplicated inside `meta` for sub-fields.

### 5. Image fields — do NOT create via API

Image/file fields must be created manually in the Directus UI. After creating all other fields, report back with:

- Field name (e.g., `intro_image`)
- Which group it belongs to
- Position within the group
- Field note to add

Upload images to the Directus file library via API, then assign the UUID after the field is manually created.

### 6. Grant public read access

Ensure the Directus public role has read access to the collection. ISR fetchers do not use auth headers — they rely on public permissions.

### 7. Add to Revalidate Cache flow

Update the Directus "Revalidate Cache" flow's `collections` array to include the new collection. Use MCP to read the flow, then update it.

---

## Phase 3: Types, Fetchers & Revalidation

### 1. Replace mock fetcher with ISR fetcher

In `src/lib/directus.ts`, replace the mock fetcher body with a Directus fetch using `fetchWithRetry`:

```typescript
export async function getExamplePage(): Promise<ExamplePage | null> {
  try {
    const response = await fetchWithRetry(
      `${directusUrl}/items/example_page`,
      { next: { revalidate: 3600 } }
    );
    if (!response.ok) return null;
    const json = await response.json();
    return json.data ?? null;
  } catch {
    return null;
  }
}
```

No auth headers — public collections use unauthenticated requests.

### 2. Add preview fetcher

```typescript
export async function getExamplePagePreview(
  token: string
): Promise<ExamplePage | null> {
  try {
    const response = await fetch(`${directusUrl}/items/example_page`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!response.ok) return null;
    const json = await response.json();
    return json.data ?? null;
  } catch {
    return null;
  }
}
```

### 3. Delete mock data

Remove the mock data for this collection from `src/lib/mock-data.ts`. The `mock-data.ts` file itself is permanent infrastructure — only delete the specific mock entries for the migrated collection.

### 4. Update revalidation map

In `src/app/api/revalidate-visual-editor/route.ts`, add the collection to `COLLECTION_PATH_MAP`:

```typescript
const COLLECTION_PATH_MAP: Record<string, string[]> = {
  example_page: ["/example"],
  global: ["/", "/about", "/services", "/case-studies", "/example"],
};
```

---

## Phase 4: Shared Components with Visual Editor

### 1. Create "use client" components

All components that use `setAttr()` must be client components. Create them in `src/components/[page-name]/`:

```typescript
"use client";

import { setAttr } from "@/lib/visual-editor";

interface PageHeroProps {
  pageTitle: string;
}

export function PageHero({ pageTitle }: PageHeroProps) {
  return (
    <h1
      data-directus={setAttr({
        collection: "example_page",
        item: "1",           // "1" for singletons
        fields: "page_title",
        mode: "popover",     // "popover" for simple fields, "drawer" for complex
      })}
    >
      {pageTitle}
    </h1>
  );
}
```

### 2. setAttr() patterns

- **Single field:** `fields: "field_name"`
- **Multiple fields (e.g., CTA text + link):** `fields: ["cta_text", "cta_link"]`
- **Repeater/JSON fields:** `fields: "repeater_field"`, `mode: "drawer"`
- **Singleton item:** `item: "1"` (always string, not number)

### 3. Create barrel export

Add `src/components/[page-name]/index.ts`:

```typescript
export { PageHero } from "./page-hero";
export { IntroSection } from "./intro-section";
// ... all components
```

### 4. Use shared components in both live and preview pages

The same components are used by both the live page (`src/app/example/page.tsx`) and the preview page (`src/app/preview/example/page.tsx`). This is what makes the visual editor work in both the preview pane and the standalone module — `setAttr()` annotations are present in both contexts.

---

## Phase 5: Preview Route

### 1. Create preview page

Create `src/app/preview/example/page.tsx`:

```typescript
export const dynamic = "force-dynamic";
export const revalidate = 0;

interface PreviewPageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function ExamplePreview({ searchParams }: PreviewPageProps) {
  const { token } = await searchParams;

  if (!token) {
    redirect("/example");
  }

  const [data, global] = await Promise.all([
    getExamplePagePreview(token),
    getGlobalPreview(token),
  ]);

  return (
    <GlobalProvider global={global}>
      <main>
        {/* Same components as live page */}
      </main>
    </GlobalProvider>
  );
}
```

### 2. Configure preview URL in Directus

On the collection in Directus (Settings > Data Model > example_page > Preview URL):

```
https://YOUR_SITE_URL/preview/example?token=PREVIEW_USER_TOKEN
```

The token is the static token of the dedicated Preview User in Directus.

---

## Phase 6: Populate Content

### 1. Migrate content from mock data to Directus

Use MCP or API to populate the singleton with the content from the hardcoded/mock page:

```
MCP directus > items (update, collection: "example_page", key: "1", data: { ... })
```

### 2. Upload images

Upload images to the Directus file library via API, then assign the file UUID to the image field:

```
MCP directus > files (import, url: "...", data: { title: "...", folder: "..." })
MCP directus > items (update, collection: "example_page", key: "1", data: { intro_image: "file-uuid" })
```

---

## Phase 7: Build & Deploy

### 1. Verify build

```bash
pnpm build
```

The build must pass cleanly. If the singleton data is missing or the Directus public role lacks read access, the ISR fetcher returns null and the page component throws — failing the build intentionally so Netlify keeps the previous working deploy.

### 2. Commit and push

Before staging files, check `.gitignore` to avoid staging ignored paths (which causes errors and wastes time):

```bash
git check-ignore <path>        # test a single path
git check-ignore .docs/ src/   # test multiple paths
```

Any path that is gitignored must not be included in `git add`. Only stage files that are tracked or untracked-but-not-ignored.

Commit all changes and push to trigger a Netlify deploy.

---

## Phase 8: Testing

Test in this exact order. Each step depends on the previous one working.

### 1. Live page

Visit the live page on the deployed site. Verify it renders identically to the mock data version — all content, images, and layout should match.

### 2. Preview pane

In Directus, open the collection item and check the preview pane (the iframe alongside the edit form):

- Content should render with live data
- Editing a field and clicking "Save" should update the preview after a brief reload

### 3. Preview pane visual editor

Still in the preview pane:

- Click the pencil icon — editable regions should highlight immediately
- Click an editable region — the popover/drawer editor should open
- Edit a field, save — the preview should reload with the updated content

### 4. Standalone visual editor module

Navigate to the standalone visual editor at `/admin/visual/https://YOUR_SITE_URL/example`:

- The page should load in the iframe
- Click the pencil icon — editable regions should highlight on the first click (no refresh needed)
- Navigate to another page using links within the iframe
- Click the pencil icon again — editable regions should highlight without needing a refresh
- Edit a field via popover/drawer, save — the page should reload with updated content

### What to check if things don't work

| Symptom | Likely cause |
|---------|-------------|
| Page renders but no data | Directus public role missing read access on the collection |
| Preview shows "page not found" | Preview route not deployed yet, or preview URL misconfigured in Directus |
| Preview shows empty data | Preview User token missing read access, or token mismatch |
| Pencil icon does nothing (preview pane) | `setAttr()` missing on components, or components aren't "use client" |
| Pencil icon does nothing (visual editor module, first load) | `waitForDirectus()` probe issue — check browser console for errors |
| Pencil icon stops working after navigating | `usePathname()` dependency missing in `VisualEditorWrapper` |
| Edits don't appear after save | Collection missing from `COLLECTION_PATH_MAP` in revalidation endpoint |

---

## Key Files Reference

| File | Purpose |
|------|---------|
| `src/lib/directus.ts` | Types, schema, ISR fetchers, preview fetchers |
| `src/lib/mock-data.ts` | Mock data for pages not yet migrated |
| `src/lib/visual-editor.ts` | `waitForDirectus()` probe, `apply()` wrapper, `setAttr` re-export |
| `src/components/visual-editor-wrapper.tsx` | Root layout wrapper with `usePathname()` for re-init on navigation |
| `src/app/api/revalidate-visual-editor/route.ts` | Collection-to-path revalidation map |
| `src/components/[page]/` | Shared "use client" components with `setAttr()` |
| `src/app/[page]/page.tsx` | Live server component |
| `src/app/preview/[page]/page.tsx` | Preview route with token auth |

## Visual Editor Architecture

Two fixes ensure the visual editor works reliably in all contexts:

1. **Pre-handshake probing** (`visual-editor.ts`) — `waitForDirectus()` sends lightweight `{ action: "connect" }` probes every 500ms until Directus responds with `{ action: "confirm" }`. Only then does `apply()` run. This solves the timing issue where ISR pages hydrate before Directus has set up its postMessage listener.

2. **Route change re-initialization** (`visual-editor-wrapper.tsx`) — `usePathname()` from `next/navigation` is included in the `useEffect` dependency array. When the user navigates between pages inside the iframe (client-side soft navigation), React's effect cleanup calls `cleanupVisualEditor()` (clears stale DOM references, resets `isApplied`), then re-runs the effect to call `initializeVisualEditor()` (probe resolves instantly since Directus is already connected, `apply()` scans fresh DOM).

See `.docs/troubleshooting/VEM_CLICKABLE_REGIONS_FIX_ATTEMPT_1.md` for the full investigation.
