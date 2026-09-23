import { NextRequest, NextResponse } from "next/server";

// CORS headers for Directus to access this API
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

// Handle preflight requests
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// Cache the tags data in memory
let tagsCache: Record<string, string[]> | null = null;
let cacheTime: number = 0;
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

async function getTags(): Promise<Record<string, string[]>> {
  const now = Date.now();

  if (tagsCache && now - cacheTime < CACHE_DURATION) {
    return tagsCache;
  }

  const response = await fetch(
    "https://cdn.jsdelivr.net/npm/lucide-static@latest/tags.json"
  );

  if (!response.ok) {
    throw new Error("Failed to fetch Lucide tags");
  }

  tagsCache = await response.json();
  cacheTime = now;

  return tagsCache!;
}

// Convert kebab-case to PascalCase (e.g., "arrow-right" -> "ArrowRight")
function toPascalCase(str: string): string {
  return str
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("");
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q")?.toLowerCase() || "";

  try {
    const tags = await getTags();

    // If no query, return popular/common icons
    if (!query) {
      const commonIcons = [
        "home", "user", "settings", "search", "menu", "x", "check",
        "arrow-right", "arrow-left", "chevron-down", "chevron-right",
        "phone", "mail", "map-pin", "star", "heart", "shield",
        "clock", "calendar", "file", "folder", "image", "camera",
      ];

      const results = commonIcons
        .filter((name) => name in tags)
        .slice(0, 20)
        .map((name) => ({
          text: toPascalCase(name),
          value: toPascalCase(name),
        }));

      return NextResponse.json({ results }, { headers: corsHeaders });
    }

    // Search by icon name and tags
    const results: { text: string; value: string; score: number }[] = [];

    for (const [iconName, iconTags] of Object.entries(tags)) {
      const pascalName = toPascalCase(iconName);
      let score = 0;

      // Exact name match (highest priority)
      if (iconName === query || pascalName.toLowerCase() === query) {
        score = 100;
      }
      // Name starts with query
      else if (iconName.startsWith(query) || pascalName.toLowerCase().startsWith(query)) {
        score = 80;
      }
      // Name contains query
      else if (iconName.includes(query) || pascalName.toLowerCase().includes(query)) {
        score = 60;
      }
      // Tag exact match
      else if (iconTags.some((tag) => tag.toLowerCase() === query)) {
        score = 40;
      }
      // Tag starts with query
      else if (iconTags.some((tag) => tag.toLowerCase().startsWith(query))) {
        score = 30;
      }
      // Tag contains query
      else if (iconTags.some((tag) => tag.toLowerCase().includes(query))) {
        score = 20;
      }

      if (score > 0) {
        results.push({
          text: pascalName,
          value: pascalName,
          score,
        });
      }
    }

    // Sort by score (descending) and limit to 30 results
    const sortedResults = results
      .sort((a, b) => b.score - a.score)
      .slice(0, 30)
      .map(({ text, value }) => ({ text, value }));

    return NextResponse.json({ results: sortedResults }, { headers: corsHeaders });
  } catch (error) {
    console.error("Icon search error:", error);
    return NextResponse.json(
      { error: "Failed to search icons", results: [] },
      { status: 500, headers: corsHeaders }
    );
  }
}
