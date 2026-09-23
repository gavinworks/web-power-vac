import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

const revalidateSecret = process.env.REVALIDATE_SECRET;

/**
 * POST /api/revalidate?secret=YOUR_SECRET
 *
 * Called by Directus webhook on content changes.
 * Clears the entire Next.js cache so ISR pages regenerate on next request.
 *
 * Directus webhook config:
 *   URL: https://yoursite.com/api/revalidate?secret=YOUR_SECRET
 *   Method: POST
 *   Trigger: items.create, items.update, items.delete
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
