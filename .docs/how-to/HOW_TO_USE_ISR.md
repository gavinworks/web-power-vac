# How To: Implement ISR with Next.js and Directus

## Overview

Incremental Static Regeneration (ISR) allows you to create or update static pages after your site has been built. This gives you the performance benefits of static generation while keeping content fresh.

This guide covers implementing ISR with Next.js and Directus, including automatic cache invalidation when content changes.

## How ISR Works

1. **Build time**: Pages are pre-rendered as static HTML
2. **Request time**: Static pages are served from CDN (fast)
3. **Revalidation**: When content changes in Directus, a webhook triggers cache invalidation
4. **Regeneration**: Next request rebuilds the page with fresh content

## Prerequisites

- Next.js 13+ with App Router
- Directus instance (Cloud or self-hosted)
- Hosting platform that supports ISR (Netlify, Vercel, etc.)

---

## Step 1: Configure Fetch with Revalidation

In your data fetching functions, add the `revalidate` option to enable time-based fallback revalidation:

```typescript
// src/lib/directus.ts

export const directusUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL || "http://localhost:8055";

export async function getHomePage(): Promise<HomePage | null> {
  try {
    const response = await fetch(`${directusUrl}/items/home_page`, {
      next: {
        revalidate: 3600, // Fallback: revalidate every hour if webhook fails
      },
    });

    if (!response.ok) {
      console.error("Failed to fetch home_page:", response.statusText);
      return null;
    }

    const json = await response.json();
    return json.data;
  } catch (error) {
    console.error("Error fetching home_page:", error);
    return null;
  }
}
```

**Key points:**
- `revalidate: 3600` means pages will refresh at most every hour as a fallback
- For instant updates, we use on-demand revalidation via webhook (next step)
- Use public access in Directus (no token needed for read-only fetches)

---

## Step 2: Create Revalidation API Endpoint

Create an API route that Directus can call to invalidate specific paths:

```typescript
// src/app/api/revalidate/route.ts

import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

// Map Directus collections to site paths
const COLLECTION_PATH_MAP: Record<string, string[]> = {
  home_page: ["/"],
  about_page: ["/about-us"],
  global: ["/", "/about-us", "/contact-us"], // Global affects all pages
  // Add more collections as needed
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { secret, collection } = body;

    // Verify the secret to prevent unauthorized revalidation
    if (secret !== process.env.REVALIDATION_SECRET) {
      return NextResponse.json(
        { error: "Invalid secret" },
        { status: 401 }
      );
    }

    if (!collection) {
      return NextResponse.json(
        { error: "Collection is required" },
        { status: 400 }
      );
    }

    // Get paths to revalidate for this collection
    const paths = COLLECTION_PATH_MAP[collection];

    if (!paths || paths.length === 0) {
      // Unknown collection - revalidate home as fallback
      revalidatePath("/");
      return NextResponse.json({
        revalidated: true,
        paths: ["/"],
        message: "Unknown collection, revalidated home",
      });
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
    console.error("Revalidation error:", error);
    return NextResponse.json(
      { error: "Revalidation failed" },
      { status: 500 }
    );
  }
}
```

---

## Step 3: Set Environment Variables

Add these to your hosting platform and local `.env.local`:

```bash
# .env.local
NEXT_PUBLIC_DIRECTUS_URL=https://your-directus-instance.com
REVALIDATION_SECRET=your-secure-random-string
```

Generate a secure secret:
```bash
openssl rand -base64 32
```

---

## Step 4: Create Directus Flow for Revalidation

In Directus, create a Flow that triggers revalidation when content changes.

### 4.1 Create the Flow

1. Go to **Settings** → **Flows**
2. Click **Create Flow**
3. Configure the trigger:

**Trigger Setup:**
- **Type**: Event Hook
- **Scope**: Items
- **Collections**: Select all CMS collections (e.g., `home_page`, `about_page`, `global`)
- **Actions**: `create`, `update`, `delete`

### 4.2 Add Webhook Operation

1. Add an operation after the trigger
2. **Type**: Webhook / Request URL
3. Configure:

```
Method: POST
URL: https://your-site.com/api/revalidate
```

**Headers:**
```json
{
  "Content-Type": "application/json"
}
```

**Request Body:**
```json
{
  "secret": "your-secure-random-string",
  "collection": "{{$trigger.collection}}"
}
```

### 4.3 Flow Diagram

```
┌─────────────────────┐
│   Event Hook        │
│   (create/update/   │
│    delete)          │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   Webhook Request   │
│   POST /api/        │
│   revalidate        │
└─────────────────────┘
```

---

## Step 5: Configure Directus Permissions

Ensure your collections have public read access:

1. Go to **Settings** → **Access Control** → **Public**
2. For each CMS collection, enable:
   - **Read**: All fields needed for display
3. Save

This allows Next.js to fetch content without authentication tokens.

---

## Step 6: Netlify-Specific Configuration

If using Netlify, ISR works via their on-demand builders. No special configuration needed, but ensure:

1. **Build command**: `next build`
2. **Publish directory**: `.next`
3. The Netlify adapter is configured (usually automatic with `@netlify/plugin-nextjs`)

---

## Testing ISR

### Test 1: Verify Static Generation
```bash
pnpm build
```
Check the output - pages should show as `○ (Static)`:
```
Route (app)                      Revalidate  Expire
├ ○ /                                    1h      1y
├ ○ /about-us                            1h      1y
```

### Test 2: Verify Webhook Revalidation

1. Deploy your site
2. Edit content in Directus
3. Save the changes
4. Check the Flow runs (in Directus Flows → Logs)
5. Visit your site - content should be updated

### Test 3: Check Revalidation Logs

Add logging to your revalidation endpoint:
```typescript
console.log("Revalidation triggered:", { collection, paths });
```

Check your hosting platform's function logs.

---

## Troubleshooting

### Content not updating after save

1. **Check Flow logs**: Directus → Flows → Your Flow → Logs
2. **Verify webhook URL**: Must be your production URL, not localhost
3. **Check secret**: Must match between Directus and environment variable
4. **Check collection mapping**: Ensure collection name matches `COLLECTION_PATH_MAP`

### 401 Unauthorized errors

- Verify `REVALIDATION_SECRET` matches in both Directus Flow and hosting env vars

### Pages still showing old content

- CDN may have cached the page - wait a few seconds and refresh
- Check if `revalidatePath()` is being called with correct path
- Verify the path in `COLLECTION_PATH_MAP` matches your actual routes

### Flow not triggering

- Check Flow is enabled (toggle in Flow settings)
- Verify collections are selected in trigger scope
- Check action types include `update`

---

## Adding New Pages

When adding new CMS-managed pages:

1. Create the collection in Directus
2. Add fetch function in `directus.ts` with `revalidate` option
3. Add collection to `COLLECTION_PATH_MAP` in revalidation endpoint
4. Add collection to Directus Flow trigger scope
5. Set public read permissions

---

## Architecture Summary

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Directus  │────▶│  Flow        │────▶│  Next.js    │
│   (Edit)    │     │  (Webhook)   │     │  /api/      │
│             │     │              │     │  revalidate │
└─────────────┘     └──────────────┘     └──────┬──────┘
                                                │
                                                ▼
                                         ┌─────────────┐
                                         │ revalidate  │
                                         │ Path("/")   │
                                         └──────┬──────┘
                                                │
                                                ▼
                                         ┌─────────────┐
                                         │ Next request│
                                         │ rebuilds    │
                                         │ page        │
                                         └─────────────┘
```

---

## References

- [Next.js ISR Documentation](https://nextjs.org/docs/app/building-your-application/data-fetching/incremental-static-regeneration)
- [Directus Flows Documentation](https://directus.io/docs/guides/flows)
- [Netlify On-Demand Builders](https://docs.netlify.com/configure-builds/on-demand-builders/)
