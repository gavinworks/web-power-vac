import { revalidatePath } from "next/cache";
import { after, NextRequest, NextResponse } from "next/server";
import { pathsForChange, submitToIndexNow } from "@/lib/indexnow";

const revalidateSecret = process.env.REVALIDATE_SECRET;

/**
 * POST /api/revalidate?secret=YOUR_SECRET
 *
 * Called by Directus webhook on content changes.
 * Clears the entire Next.js cache so ISR pages (and the sitemap) regenerate
 * on the next request, then tells IndexNow which pages changed.
 *
 * Directus webhook config:
 *   URL: https://yoursite.com/api/revalidate?secret=YOUR_SECRET
 *   Method: POST
 *   Trigger: items.create, items.update, items.delete
 *   Body: {"collection": "<collection>", "keys": [<item ids>]}
 */
export async function POST(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get("secret");

  if (!revalidateSecret) {
    console.error("REVALIDATE_SECRET is not configured");
    return NextResponse.json(
      { error: "Server configuration error" },
      { status: 500 }
    );
  }

  if (secret !== revalidateSecret) {
    return NextResponse.json({ error: "Invalid secret" }, { status: 401 });
  }

  try {
    revalidatePath("/", "layout");
    // Route handlers sit outside the layout tree, so clear the sitemap by name
    revalidatePath("/sitemap.xml");

    const body = await request.json().catch(() => ({}));
    const collection =
      typeof body.collection === "string" ? body.collection : "";
    const keys: string[] = Array.isArray(body.keys)
      ? body.keys.map(String)
      : [];
    if (collection && process.env.NODE_ENV === "production") {
      after(async () =>
        submitToIndexNow(await pathsForChange(collection, keys))
      );
    }

    return NextResponse.json({
      revalidated: true,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error("Error revalidating:", error);
    return NextResponse.json(
      { error: "Failed to revalidate" },
      { status: 500 }
    );
  }
}
