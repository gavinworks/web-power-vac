import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { getPosts, getServices } from "@/lib/directus";

/**
 * POST /api/revalidate-visual-editor
 *
 * Called by the Directus visual editor on save.
 * Maps collection names to site paths for targeted revalidation.
 *
 * Add your collections to COLLECTION_PATH_MAP as you build pages.
 */

const STATIC_PATHS = [
  "/",
  "/services",
  "/before-and-after",
  "/areas",
  "/news",
  "/contact",
  "/privacy",
  "/cookies",
];

// Map Directus collections to the site paths they affect
const COLLECTION_PATH_MAP: Record<string, string[]> = {
  // The homepage's camera screen also appears on the main service's page
  home_page: ["/", "/services/gutter-vacuum-cleaning"],
  // The slider labels appear on the homepage too
  before_after_page: ["/", "/before-and-after"],
  before_after: ["/", "/before-and-after"],
  areas_page: ["/areas"],
  contact_page: ["/contact"],
  legal_pages: ["/privacy", "/cookies"],
};

// Collections whose items have their own pages, plus the static pages they appear on
async function getDynamicPaths(collection: string): Promise<string[] | null> {
  if (collection === "services") {
    const services = await getServices();
    // The homepage, services page and every quote form list the services
    return [
      ...STATIC_PATHS,
      ...services.filter((s) => s.has_page).map((s) => `/services/${s.slug}`),
    ];
  }
  if (collection === "services_page") {
    // Its shared labels and price card copy appear on every service page
    const services = await getServices();
    return [
      "/",
      "/services",
      ...services.filter((s) => s.has_page).map((s) => `/services/${s.slug}`),
    ];
  }
  if (collection === "posts" || collection === "news_page") {
    // news_page holds the labels used on every article
    const posts = await getPosts();
    return ["/", "/news", ...posts.map((p) => `/news/${p.slug}`)];
  }
  return null;
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

    // Global (header, footer, quote form) and the areas list (structured data) affect every page
    if (collection === "global") {
      revalidatePath("/", "layout");
      return NextResponse.json({
        revalidated: true,
        collection,
        paths: ["/ (layout)"],
        timestamp: Date.now(),
      });
    }

    const paths =
      (await getDynamicPaths(collection)) ??
      COLLECTION_PATH_MAP[collection] ??
      [];

    if (paths.length === 0) {
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
    return NextResponse.json({ error: "Revalidation failed" }, { status: 500 });
  }
}
