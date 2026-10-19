import { siteConfig } from "@/config/site";
import { directusUrl } from "@/lib/directus";

/**
 * IndexNow tells Bing (and Yandex, Seznam, Naver) the moment a page changes,
 * instead of waiting for them to recrawl the sitemap. Google doesn't use it;
 * it reads the sitemap submitted in Search Console.
 *
 * The key is public by design: search engines check it against the key file
 * at /<key>.txt (public/), which proves we own the host.
 */
export const INDEXNOW_KEY = "f46333c99259f64b7ee04f36a173dfc1";

/** Pages each singleton collection appears on. */
const SINGLETON_PATHS: Record<string, string[]> = {
  global: ["/"],
  home_page: ["/"],
  services_page: ["/services"],
  before_after_page: ["/before-and-after"],
  before_after: ["/before-and-after"],
  areas_page: ["/areas"],
  news_page: ["/news"],
  contact_page: ["/contact"],
};

/** Item collections: the listing pages, plus a page per item under `prefix`. */
const ITEM_PATHS: Record<string, { listing: string[]; prefix: string }> = {
  services: { listing: ["/", "/services"], prefix: "/services/" },
  posts: { listing: ["/", "/news"], prefix: "/news/" },
  legal_pages: { listing: [], prefix: "/" },
};

/**
 * Slugs of the given items that are live. Uncached, because this runs right
 * after an edit. Drafts and deleted items aren't readable by the Public
 * policy, so they're never submitted.
 */
async function liveSlugs(collection: string, keys: string[]) {
  const params = new URLSearchParams({
    "filter[id][_in]": keys.join(","),
    "filter[status][_eq]": "published",
    fields: collection === "services" ? "slug,has_page" : "slug",
  });
  try {
    const response = await fetch(
      `${directusUrl}/items/${collection}?${params}`,
      { cache: "no-store" }
    );
    if (!response.ok) return [];
    const json = (await response.json()) as {
      data: { slug: string; has_page?: boolean }[];
    };
    return json.data
      .filter((item) => item.has_page !== false)
      .map((item) => item.slug);
  } catch {
    return [];
  }
}

/** The site paths a change to `collection` (items `keys`) affects. */
export async function pathsForChange(collection: string, keys: string[]) {
  if (SINGLETON_PATHS[collection]) return SINGLETON_PATHS[collection];
  const item = ITEM_PATHS[collection];
  if (!item) return [];
  const slugs = keys.length ? await liveSlugs(collection, keys) : [];
  return [...item.listing, ...slugs.map((slug) => `${item.prefix}${slug}`)];
}

/** Submits paths to IndexNow. Logs and carries on if the request fails. */
export async function submitToIndexNow(paths: string[]) {
  if (!paths.length) return;
  const host = new URL(siteConfig.url).host;
  const urlList = [...new Set(paths)].map((path) => `${siteConfig.url}${path}`);
  try {
    const response = await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        host,
        key: INDEXNOW_KEY,
        keyLocation: `${siteConfig.url}/${INDEXNOW_KEY}.txt`,
        urlList,
      }),
    });
    // 200 and 202 both mean accepted
    if (!response.ok) {
      console.error(`IndexNow: ${response.status} for ${urlList.join(", ")}`);
    }
  } catch (error) {
    console.error("IndexNow: request failed", error);
  }
}
