## Option 1: Pre-handshake probing (recommended)

**The idea:** Separate "is Directus ready?" from "register editable elements." Before calling `apply()`, send lightweight `connect` probe messages to the parent frame and listen for `confirm`. Only call `apply()` once we **know** Directus is listening.

**How it works:**

1. On page load (useEffect), start a simple loop: send `{action: 'connect'}` via `window.parent.postMessage()` every ~500ms
2. Simultaneously, set up a one-time `message` event listener watching for any response from the Directus origin
3. The moment Directus responds (with `confirm`), clear the interval, remove the listener
4. NOW call `apply()` — which creates the bridge, sends its own `connect`, gets instant `confirm` (Directus is confirmed ready), scans DOM, registers items, returns control object
5. `apply()` succeeds on the first attempt, every time

**Why it's guaranteed to work:**

- Directus's module UI and postMessage listener initialize together. The user physically **cannot** click the pencil until the module UI has loaded — and by that point, our probe has already gotten a response and `apply()` has already registered all items
- The probes are a single `postMessage` call — no DOM scanning, no item creation, no observers. They're as lightweight as it gets
- It's event-driven: stops the instant Directus responds. No arbitrary timeouts or guesswork
- It also works for the preview pane (Directus responds to the very first probe because it's already loaded)

**Why this isn't the polling we removed:**

The previous retry approach called `apply()` repeatedly — which scans the entire DOM, creates EditableElement instances, overlay rects, and rect observers on every attempt. That was expensive and wasteful. This sends a 30-byte postMessage and listens for a response. The expensive `apply()` runs exactly once.

**Why `window.onload` becomes unnecessary:**

The `waitForDirectus()` probe handles all timing. We don't need to guess whether `window.onload` provides enough delay — we wait for the actual signal. The wrapper simplifies to just calling `initializeVisualEditor()` in the useEffect.

---

## Preview pane impact assessment

Option 1 doesn't require removing `window.onload`. We can keep `window.onload` as the trigger that starts the process — the only change is what happens *inside* `initializeVisualEditor()`.

Today's flow (preview pane):
1. `window.onload` fires → `initializeVisualEditor()` → `apply()` → instant `confirm` (Directus already loaded) → items registered

Option 1 flow (preview pane):
1. `window.onload` fires → `initializeVisualEditor()` → probe sends `connect` → instant `confirm` (Directus already loaded) → probe resolves → `apply()` → instant `confirm` again → items registered

For the preview pane, the probe resolves on the **first message** because Directus is already fully loaded. The added latency is a single postMessage round-trip within the same browser — sub-millisecond. Functionally identical to today.

**What actually changes for each context:**

| | Preview pane (today) | Preview pane (option 1) | Visual editor module (today) | Visual editor module (option 1) |
|---|---|---|---|---|
| `window.onload` | Yes | Yes (kept) | Yes | Yes (kept) |
| Probe before apply() | No | Yes (resolves instantly) | No | Yes (resolves when Directus ready) |
| `apply()` succeeds | Yes | Yes | Sometimes no | Yes (guaranteed) |

The `window.onload` wrapper stays untouched. The `VisualEditorWrapper` component doesn't change. The only file that changes is `visual-editor.ts` — `initializeVisualEditor()` gains a `waitForDirectus()` step before `apply()`. For the preview pane, that step completes instantly. For the visual editor module, it waits until Directus is ready.

**In short:** Option 1 adds a safety net *before* `apply()`. For the preview pane, the net catches nothing (Directus is already there). For the visual editor module, it catches the timing gap. The preview pane path is functionally unchanged.

---

## Implementation

Changes made to `src/lib/visual-editor.ts`:

1. **Added `waitForDirectus()`** (lines 14–35) — sends a lightweight `{ action: "connect" }` probe to the parent frame every 500ms. Listens for Directus to respond with `{ action: "confirm" }`. Resolves the instant that response arrives, then cleans up (clears interval, removes listener). For the preview pane this resolves immediately; for the visual editor module it waits until Directus is ready.

2. **Added `await waitForDirectus()` before `apply()`** (line 66) — `apply()` now only runs after we've confirmed Directus is listening, so its 1-second handshake window will always succeed.

3. **Fixed secondary bug** (lines 79–81) — `isApplied` is now only set to `true` if `apply()` returns a control object, not unconditionally. This was the bug that blocked all future initialization attempts even when the handshake had failed.

---

## Testing results

The pre-handshake probe fix solved the original problem: the visual editor module's pencil toggle now works reliably on first load, every time. The preview pane visual editor is unaffected and continues to work as before.

However, testing revealed a **second, separate issue**: after navigating between pages within the visual editor module (e.g., clicking a nav link from `/case-studies` to `/about`), the pencil toggle stops showing editable regions until the page is refreshed. Notably, only a regular refresh is needed — not a hard refresh — and the pencil works immediately after that single refresh.

### Root cause: stale state after client-side navigation

When you click a link inside the iframe, Next.js performs a **client-side soft navigation**. The page components swap out but the root layout — including `VisualEditorWrapper` — stays mounted. The JavaScript module state persists, so:

1. `isApplied` remains `true` from the first page
2. The library's internal `State.items` still references DOM elements from the **previous** page that no longer exist
3. The new page's `data-directus` elements are never scanned or registered
4. When the pencil is toggled, the library iterates `State.items` and tries to show overlays on elements that are gone

A regular refresh works because it reloads everything from scratch — `isApplied` resets to `false`, the full `waitForDirectus()` → `apply()` flow runs again on the fresh DOM, and all new elements are registered.

This is a different problem from the original timing issue. The probe fix addresses *when* `apply()` runs relative to Directus readiness. This issue is about `apply()` not re-running at all after client-side navigation because the wrapper's `useEffect` has an empty dependency array and `isApplied` blocks re-entry.

### Proposed fix: re-initialize on route change

Add `usePathname()` from `next/navigation` to the `VisualEditorWrapper` component and include it in the `useEffect` dependency array. When the pathname changes:

1. React runs the effect's cleanup → `cleanupVisualEditor()` → calls `remove()` (clears old items/overlays) and resets `isApplied` to `false`
2. React re-runs the effect → `initializeVisualEditor()` → `waitForDirectus()` resolves instantly (Directus already connected) → `apply()` scans the new DOM → registers new elements

The change is three lines in `VisualEditorWrapper`:
- Import `usePathname` from `next/navigation`
- `const pathname = usePathname();`
- Change `}, []);` to `}, [pathname]);`

**Why this is safe for the preview pane:** In preview, you're editing a single page — `pathname` never changes, so the effect runs exactly once on mount, identical to today.

**Why it works:** The `@directus/visual-editing` MessageBridge is a singleton that persists across `remove()`/`apply()` cycles. `remove()` clears the items and overlays but the bridge stays connected. The subsequent `apply()` reuses the existing bridge, gets instant `confirm`, and scans the fresh DOM. No new connections, no probing delay.

### Implementation

Changes made to `src/components/visual-editor-wrapper.tsx`:

1. **Added `usePathname` import** — imported from `next/navigation`, which is the App Router's built-in hook for reading the current URL pathname in client components.

2. **Added `const pathname = usePathname();`** — reads the current pathname inside the component body, making it available as a reactive value that updates on every client-side navigation.

3. **Changed `useEffect` dependency from `[]` to `[pathname]`** — the empty array meant the effect ran once on mount and never again. With `pathname` as a dependency, React's effect lifecycle now handles navigation automatically:
   - When pathname changes, React runs the previous effect's **cleanup function** first → `cleanupVisualEditor()` → calls `remove()` to clear stale items/overlays and resets `isApplied` to `false`
   - Then React re-runs the effect → since `document.readyState` is already `"complete"` (page loaded long ago), it takes the `if` branch and calls `initializeVisualEditor()` directly → `waitForDirectus()` resolves instantly (Directus already connected from first load) → `apply()` scans the new page's DOM → registers all new `data-directus` elements → `isApplied` set to `true`

No changes to `src/lib/visual-editor.ts` — the existing `cleanupVisualEditor()` and `initializeVisualEditor()` functions handle the full cleanup/re-init cycle without modification.
