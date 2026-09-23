import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { getPages } from "@/lib/directus";

/**
 * POST /api/revalidate-visual-editor
 *
 * Called by the Directus visual editor on save.
 * Maps collection names to site paths for targeted revalidation.
 *
 * Add your collections to COLLECTION_PATH_MAP as you build pages.
 */

// Map Directus collections to the site paths they affect
const COLLECTION_PATH_MAP: Record<string, string[]> = {
  home_page: ["/"],
  global: ["/"], // Global affects header/footer — add all page paths here
  // Add more mappings as you create pages:
  // about_page: ["/about"],
  // contact_page: ["/contact"],
};

// Get dynamic page paths from CMS
async function getDynamicPagePaths(): Promise<string[]> {
  const pages = await getPages();
  return pages.map((p) => `/${p.slug}`);
}

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

    let paths: string[] = [];

    if (collection === "pages") {
      // For dynamic collections, fetch all paths + revalidate layout for nav
      paths = await getDynamicPagePaths();
      revalidatePath("/", "layout");
    } else {
      paths = COLLECTION_PATH_MAP[collection] || [];
    }

    if (paths.length === 0 && collection !== "pages") {
      return NextResponse.json(
        { error: "Unknown collection", collection },
        { status: 400 }
      );
    }

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
    return NextResponse.json(
      { error: "Revalidation failed" },
      { status: 500 }
    );
  }
}
