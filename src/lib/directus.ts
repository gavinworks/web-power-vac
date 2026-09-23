import { createDirectus, rest, staticToken } from "@directus/sdk";

// ============================================================================
// MOCK DATA SUPPORT
// ============================================================================

// Lazy import mock data only when needed
async function getMockModule() {
  return import("./mock-data");
}

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================
// Define your Directus collection types here.
// These should match your Directus collection fields exactly.
// ============================================================================

export interface DirectusFile {
  id: string;
  filename_download: string;
  title: string | null;
  type: string;
}

/**
 * Global settings — singleton collection for site-wide data.
 * Contains contact info, social media, and shared content.
 */
export interface Global {
  id: number;
  site_name: string | null;
  site_description: string | null;
  phone: string | null;
  email_address: string | null;
  address: string | null;
  office_hours_days: string | null;
  office_hours_times: string | null;
  social_media_accounts: SocialMediaAccount[] | null;
}

export interface SocialMediaAccount {
  name: string;
  icon: string;
  link: string;
}

/**
 * Home page — singleton collection.
 * Add fields here as you build out your home page in Directus.
 */
export interface HomePage {
  id: number;
  meta_title: string | null;
  meta_description: string | null;
  hero_heading: string | null;
  hero_description: string | null;
  hero_cta_text: string | null;
  hero_cta_link: string | null;
}

/**
 * Example regular collection for dynamic pages (e.g., services, posts, projects).
 * Rename and modify this to match your project needs.
 */
export interface Page {
  id: string;
  status: string;
  sort: number;
  slug: string;
  meta_title: string | null;
  meta_description: string | null;
  title: string;
  description: string | null;
}

// ============================================================================
// SCHEMA
// ============================================================================
// Register all collections here. This gives you type safety with the SDK.
// ============================================================================

interface Schema {
  global: Global;
  home_page: HomePage;
  pages: Page[];
}

// ============================================================================
// CLIENT SETUP
// ============================================================================

export const directusUrl =
  process.env.NEXT_PUBLIC_DIRECTUS_URL || "http://localhost:8055";
const directusToken = process.env.DIRECTUS_STATIC_TOKEN || "";

export const directus = createDirectus<Schema>(directusUrl)
  .with(rest())
  .with(staticToken(directusToken));

// ============================================================================
// FILE HELPERS
// ============================================================================

/**
 * Get the proxied URL for a Directus file.
 * Files are served via /files/:id which proxies to Directus via next.config.ts rewrites.
 */
export function getFileUrl(file: DirectusFile | string): string {
  const fileId = typeof file === "string" ? file : file.id;
  return `/files/${fileId}`;
}

// ============================================================================
// FETCH WITH RETRY — Build & Deploy Resilience
// ============================================================================
// All live ISR fetchers must use fetchWithRetry() instead of bare fetch().
// Retries network errors and 5xx; does NOT retry 4xx (permissions, not found).
// See .docs/how-to/ and CLAUDE.md "Build & Deploy Resilience" for details.
// ============================================================================

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

async function fetchWithRetry(
  url: string,
  options: RequestInit & { next?: { revalidate: number } },
  label: string
): Promise<Response | null> {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(url, options);

      // Don't retry client errors (4xx) — these won't self-resolve
      if (response.ok) return response;
      if (response.status >= 400 && response.status < 500) {
        console.error(`${label}: ${response.status} ${response.statusText}`);
        return null;
      }

      // Server error (5xx) — retry
      console.warn(
        `${label}: ${response.status} (attempt ${attempt}/${MAX_RETRIES})`
      );
    } catch (error) {
      // Network error — retry
      console.warn(
        `${label}: network error (attempt ${attempt}/${MAX_RETRIES})`,
        error
      );
    }

    if (attempt < MAX_RETRIES) {
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
    }
  }

  console.error(`${label}: all ${MAX_RETRIES} attempts failed`);
  return null;
}

// ============================================================================
// DATA FETCHERS — ISR (public, cached)
// ============================================================================
// Pattern: use fetchWithRetry() with `next: { revalidate: 3600 }`.
// Directus webhook calls /api/revalidate to clear cache on content changes.
//
// When migrating a fetcher from mock to live, replace the mock body with:
//
//   const response = await fetchWithRetry(
//     `${directusUrl}/items/collection_name`,
//     { next: { revalidate: 3600 } },
//     "getFunctionName"
//   );
//   if (!response) return null;
//   const json = await response.json();
//   return json.data;
//
// Also add a throw in the page component if the data is critical:
//
//   if (!pageData) {
//     throw new Error("Failed to fetch page_data from Directus");
//   }
// ============================================================================

/**
 * Fetch global settings.
 * Currently returns mock data — replace body with Directus fetch once collection is migrated.
 */
export async function getGlobal(): Promise<Global | null> {
  const mock = await getMockModule();
  return mock.mockGlobal;
}

/**
 * Fetch home page data.
 * Currently returns mock data — replace body with Directus fetch once collection is migrated.
 */
export async function getHomePage(): Promise<HomePage | null> {
  const mock = await getMockModule();
  return mock.mockHomePage;
}

/**
 * Fetch all pages (regular collection).
 * Currently returns mock data — replace body with Directus fetch once collection is migrated.
 */
export async function getPages(): Promise<Page[]> {
  const mock = await getMockModule();
  return mock.mockPages;
}

/**
 * Fetch a single page by slug.
 * Currently returns mock data — replace body with Directus fetch once collection is migrated.
 */
export async function getPage(slug: string): Promise<Page | null> {
  const mock = await getMockModule();
  return mock.mockPages.find((p) => p.slug === slug) || null;
}

// ============================================================================
// DATA FETCHERS — PREVIEW (authenticated, uncached)
// ============================================================================
// Pattern: fetch with Bearer token + cache: "no-store" for live preview.
// Used by preview routes at /preview/[page].
// ============================================================================

/**
 * Fetch home page data with token auth for visual editor preview.
 * Always fetches fresh data (no caching).
 */
export async function getHomePagePreview(
  token: string
): Promise<HomePage | null> {
  try {
    const response = await fetch(`${directusUrl}/items/home_page`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    if (!response.ok) {
      console.error(
        "Failed to fetch home_page preview:",
        response.statusText
      );
      return null;
    }

    const json = await response.json();
    return json.data;
  } catch (error) {
    console.error("Error fetching home_page preview:", error);
    return null;
  }
}

/**
 * Fetch global data with token auth for visual editor preview.
 */
export async function getGlobalPreview(
  token: string
): Promise<Global | null> {
  try {
    const response = await fetch(`${directusUrl}/items/global`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    if (!response.ok) {
      console.error("Failed to fetch global preview:", response.statusText);
      return null;
    }

    const json = await response.json();
    return json.data;
  } catch (error) {
    console.error("Error fetching global preview:", error);
    return null;
  }
}

/**
 * Fetch a single page by slug with token auth for visual editor preview.
 */
export async function getPagePreview(
  token: string,
  slug: string
): Promise<Page | null> {
  try {
    const response = await fetch(
      `${directusUrl}/items/pages?filter[slug][_eq]=${slug}`,
      {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      console.error("Failed to fetch page preview:", response.statusText);
      return null;
    }

    const json = await response.json();
    return json.data?.[0] || null;
  } catch (error) {
    console.error("Error fetching page preview:", error);
    return null;
  }
}
