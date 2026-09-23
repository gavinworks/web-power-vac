# How To: Upgrade Directus Packages

## Current Versions

| Package | Version | Minimum Directus Server |
|---------|---------|------------------------|
| `@directus/sdk` | ^21.2.0 | v11.16.0 |
| `@directus/visual-editing` | ^2.0.0 | **v11.16.0** (hard requirement) |

## Why v11.16.0 Is Required

`@directus/visual-editing` v2.0.0 introduced a **field access check** before activating editable elements. After `apply()` completes the handshake, the library sends a `checkFieldAccess` message to the parent Directus frame. Directus responds with `activateElements` containing the element keys that the current user has permission to edit. Only those elements get overlays and edit buttons.

**Directus v11.16.0+** is the first version that understands and responds to `checkFieldAccess`. Older versions silently ignore it, which means no `activateElements` response is ever sent, and **all editable elements remain inert** — no overlays, no hover effects, no edit buttons. The visual editor appears completely broken with no errors in the console.

## Upgrading an Existing Project

### Step 1: Check Your Directus Version

Log into your Directus admin panel. The version is shown at the bottom of the sidebar, or query the API:

```bash
curl "${NEXT_PUBLIC_DIRECTUS_URL}/server/info" | jq '.data.directus.version'
```

### Step 2: Upgrade Directus Server (if below v11.16.0)

If your Directus instance is self-hosted (e.g., on Railway), update the Docker image or package version to v11.16.0 or later.

**Docker (Railway / self-hosted):**

Update your `Dockerfile` or service config to use the new image tag:

```dockerfile
FROM directus/directus:11.16.0
```

Or if you pin to latest:

```dockerfile
FROM directus/directus:latest
```

**If using Directus Cloud:** Check your plan's version. Directus Cloud typically auto-updates, but verify you're on v11.16.0+ before upgrading the frontend packages.

**Important:** Back up your database before upgrading Directus. Directus runs automatic migrations on startup, but it's good practice to snapshot first.

### Step 3: Upgrade Frontend Packages

```bash
pnpm update @directus/sdk @directus/visual-editing
```

Verify the installed versions:

```bash
pnpm list @directus/sdk @directus/visual-editing
```

### Step 4: Test the Visual Editor

1. Deploy the updated site (or run `pnpm dev` locally)
2. Open Directus → Visual Editor module
3. Toggle "Editable Elements" — overlays should appear on elements with `data-directus` attributes
4. Click an element to confirm the edit popover opens
5. Save a change and confirm the page reloads with updated content

If the pencil toggle shows nothing, check:
- Directus is v11.16.0+ (the most likely cause)
- The user/role has read access to the fields being edited (v2.0.0 respects field-level permissions)

## What Changed in Each Package

### @directus/visual-editing v1.2.0 → v2.0.0

**Breaking change:** Two-phase element activation with field access checks.

| | v1.2.0 | v2.0.0 |
|---|---|---|
| Element activation | Immediate — all `data-directus` elements get overlays unconditionally | Permission-gated — elements wait for `activateElements` from Directus |
| Minimum Directus | Any version with visual editor support | **v11.16.0+** |
| Public API | `apply()`, `remove()`, `setAttr()`, `enable()`, `disable()` | Unchanged — same signatures, same exports |
| Handshake timing | 10 polls × 100ms = 1s max | Unchanged — same timing window |
| Client-side nav | No automatic cleanup of stale items | Unchanged — still requires manual re-init |

**What did NOT change:**
- The `apply()` handshake mechanism (still 1-second timeout) — our `waitForDirectus()` pre-handshake probe is still needed
- The `EditableStore.items` stale state after soft navigation — our `usePathname()` re-initialization is still needed
- The `onSaved` callback shape and behavior
- The `setAttr()` function signature

**No code changes required** in `visual-editor.ts`, `visual-editor-wrapper.tsx`, or any component using `setAttr()`. The upgrade is a version bump + Directus server version check.

### @directus/sdk v21.1.0 → v21.2.0

Minor, non-breaking update:
- Deployment module now has RBAC
- Provider webhooks replace polling for deployment status updates
- `ReadProviderOutput` type gains a `label` field

No changes to `readItems`, `readItem`, `readSingleton`, authentication, or token handling. No code changes required.

## Troubleshooting After Upgrade

### Visual editor elements don't show overlays

**Most likely cause:** Directus server is below v11.16.0. The `checkFieldAccess` message goes unanswered, so no elements are activated. Upgrade Directus first.

**Second most likely cause:** The user's role lacks read access to specific fields. v2.0.0 respects field-level permissions — if a field isn't readable by the current user, its element won't get an overlay. Check the role's field permissions in Settings → Access Control.

### Visual editor worked before, now completely blank

If it was working on v1.2.0 and broke after upgrading to v2.0.0, the Directus server version is almost certainly the issue. Roll back `@directus/visual-editing` to `^1.2.0` in `package.json` until the Directus server is upgraded:

```bash
pnpm add @directus/visual-editing@^1.2.0
```

### Pencil toggle works on some elements but not others

This is the field access check doing its job. The user doesn't have edit permission on those fields. Check the role's permissions in Directus → Settings → Access Control → [Role] → [Collection] → Fields.
