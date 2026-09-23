## Root Cause Analysis

**It IS the same timing issue** — `apply()` fires before Directus has set up its postMessage listener — but the `window.onload` fix only solves it for the preview pane, not the standalone visual editor module. Here's why:

### How `apply()` works internally

1. Creates a `MessageBridge` singleton (one-time, with a permanent `message` event listener)
2. Sends `connect` postMessage to the parent Directus frame
3. Polls up to **10 times at 100ms intervals** (max 1 second) for Directus to respond with `confirm`
4. **If confirm arrives in time**: scans DOM for `data-directus` elements, registers them in a global `State.items` array, returns a control object `{remove, enable, disable}`
5. **If confirm times out**: returns `undefined` — **no items are registered**, `State.items` stays empty

### What the pencil toggle does

When you click the pencil icon, Directus sends a `showEditableElements` postMessage. The bridge receives it and calls `State.highlightItems(true)`, which iterates over `State.items` and toggles CSS visibility on each overlay. **If `State.items` is empty (because `apply()` timed out), there's nothing to toggle.**

### Why preview pane works but visual editor module doesn't

**Preview pane** — When you open an item to edit, Directus is already fully loaded. The preview pane iframe is just another component on an already-initialized page. By the time the iframe loads, hydrates, and `window.onload` fires, Directus's postMessage listener has been ready for a while. The `connect` → `confirm` handshake succeeds within the 1-second window.

**Visual editor module** (`/admin/visual/[url]`) — When you navigate to this module, Directus is loading the module page and creating the iframe concurrently. The iframe starts loading immediately, but the module's postMessage listener may not be set up yet. Our server-rendered page is very fast — it's pre-built HTML that hydrates quickly, `window.onload` fires early, `apply()` sends `connect`, but Directus isn't listening yet. The 1-second handshake window expires, `apply()` returns `undefined`, no items are registered.

### Why the official Directus tutorial doesn't have this problem

The [official Next.js tutorial](https://directus.io/docs/tutorials/getting-started/integrating-the-directus-visual-editor-with-nextjs) uses **client-side data fetching**:

```javascript
useEffect(() => {
  async function fetchData() {
    const result = await client.request(readItems('pages', {...}));
    setHomePageData(result);
    const navData = await client.request(readItems('navigation', {...}));
    setNavigationData(navData);
    initializeVisualEditor(); // Only called AFTER client-side fetches
  }
  fetchData();
}, []);
```

Those `client.request()` calls take hundreds of milliseconds to complete. By the time `apply()` runs, Directus's module has had plenty of time to set up its listener. The data fetching acts as **implicit delay** — the same role `window.onload` was supposed to fill for us.

Our architecture is different: we use ISR/server-rendering, so the page arrives fully rendered. There's no client-side data fetching to slow things down. `window.onload` fires almost immediately, and `apply()` runs too early.

### The secondary bug

Line 45 in `visual-editor.ts`: `isApplied = true` runs regardless of whether `apply()` returned a control object or `undefined`. So even if the handshake fails, `isApplied` blocks all future initialization attempts — the user would have to do a full page refresh.

---

**In summary**: The `window.onload` fix was the right idea (delay `apply()` to give Directus time) and provides enough delay for the preview pane. But for the standalone visual editor module, our server-rendered pages are so fast that `window.onload` doesn't buy enough time, and the 1-second handshake window expires before Directus is ready.

Sources:

- [Directus Visual Editor Docs](https://directus.io/docs/guides/content/visual-editor)
- [Studio Module Docs](https://directus.io/docs/guides/content/visual-editor/studio-module)
- [Frontend Library Docs](https://directus.io/docs/guides/content/visual-editor/frontend-library)
- [Next.js Integration Tutorial](https://directus.io/docs/tutorials/getting-started/integrating-the-directus-visual-editor-with-nextjs)
- [visual-editing GitHub Repo](https://github.com/directus/visual-editing)
