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
 * An image field. In Directus this is a file id (or an expanded file object).
 * Mock data uses a local path under /public instead, e.g. "/images/hero.jpg".
 */
export type ImageField = DirectusFile | string | null;

/** Repeater row: a heading with a short paragraph. */
export interface TitledText {
  title: string;
  body: string;
}

export interface Faq {
  question: string;
  answer: string;
}

export interface OpeningHours {
  days: string;
  times: string;
}

/** Repeater row: a trust point shown as a round badge (icon is a Lucide name). */
export interface TrustPoint {
  label: string;
  icon: string;
}

export interface SocialMediaAccount {
  name: string;
  icon: string;
  link: string;
}

/**
 * Headline fields accept two bits of markup so editors can keep the design:
 * a new line starts a new line, and *words in asterisks* turn sky blue.
 */
type Headline = string;

/**
 * Global settings — singleton collection for site-wide data.
 * Contact details, opening hours, trust points and the quote section that
 * closes most pages.
 */
export interface Global {
  id: number;
  site_name: string | null;
  site_description: string | null;
  logo: ImageField;
  phone: string | null;
  phone_mobile: string | null;
  email_address: string | null;
  address: string | null;
  opening_hours: OpeningHours[] | null;
  price_from: string | null;
  sticker_text: string | null;
  promises: TrustPoint[] | null;
  social_media_accounts: SocialMediaAccount[] | null;
  quote_heading: Headline | null;
  quote_description: string | null;
  quote_success_message: string | null;
  footer_tagline: string | null;
}

/** Home page — singleton collection. */
export interface HomePage {
  id: number;
  meta_title: string | null;
  meta_description: string | null;
  hero_annotation: string | null;
  hero_heading: Headline | null;
  hero_description: string | null;
  hero_cta_text: string | null;
  hero_cta_link: string | null;
  hero_secondary_cta_text: string | null;
  hero_secondary_cta_link: string | null;
  hero_image: ImageField;
  hero_image_alt: string | null;
  hero_camera_image: ImageField;
  hero_camera_image_alt: string | null;
  hero_camera_note: string | null;
  steps_heading: Headline | null;
  steps_annotation: string | null;
  steps: TitledText[] | null;
  services_heading: Headline | null;
  services_cta_text: string | null;
  before_after_heading: Headline | null;
  before_after_annotation: string | null;
  areas_annotation: string | null;
  areas_heading: Headline | null;
  areas_description: string | null;
  areas_cta_text: string | null;
  news_heading: Headline | null;
}

/** Services overview page — singleton collection. */
export interface ServicesPage {
  id: number;
  meta_title: string | null;
  meta_description: string | null;
  hero_annotation: string | null;
  hero_heading: Headline | null;
  hero_description: string | null;
  hero_image: ImageField;
  hero_image_alt: string | null;
  extras_heading: Headline | null;
  extras_description: string | null;
  faqs_heading: Headline | null;
  faqs: Faq[] | null;
}

export type ServiceKind = "main" | "add_on" | "on_request";

/**
 * Services — regular collection. Each published service with `has_page`
 * gets its own page at /services/[slug].
 */
export interface Service {
  id: string;
  status: string;
  sort: number;
  slug: string;
  title: string;
  form_label: string;
  kind: ServiceKind;
  icon: string;
  card_summary: string | null;
  price_from: string | null;
  has_page: boolean;
  meta_title: string | null;
  meta_description: string | null;
  hero_annotation: string | null;
  hero_heading: Headline | null;
  hero_description: string | null;
  hero_image: ImageField;
  hero_image_alt: string | null;
  body: string | null; // rich text (HTML)
  benefits_heading: Headline | null;
  benefits: TitledText[] | null;
  faqs: Faq[] | null;
}

/** Before and after page — singleton collection. */
export interface BeforeAfterPage {
  id: number;
  meta_title: string | null;
  meta_description: string | null;
  hero_annotation: string | null;
  hero_heading: Headline | null;
  hero_description: string | null;
  gallery_heading: Headline | null;
  gallery_note: string | null;
  camera_heading: Headline | null;
  camera_description: string | null;
  camera_image: ImageField;
  camera_image_alt: string | null;
}

/** Before and after photo pairs — regular collection. */
export interface BeforeAfterItem {
  id: string;
  status: string;
  sort: number;
  title: string;
  location: string | null;
  service: string | null;
  before_image: ImageField;
  before_image_alt: string | null;
  after_image: ImageField;
  after_image_alt: string | null;
  is_example: boolean;
}

/** Areas page — singleton collection. */
export interface AreasPage {
  id: number;
  meta_title: string | null;
  meta_description: string | null;
  hero_annotation: string | null;
  hero_heading: Headline | null;
  hero_description: string | null;
  city: string | null;
  towns_heading: string | null;
  towns: string[] | null;
  villages_heading: string | null;
  villages: string[] | null;
  coverage_heading: Headline | null;
  coverage_description: string | null;
}

/** News page — singleton collection. */
export interface NewsPage {
  id: number;
  meta_title: string | null;
  meta_description: string | null;
  hero_annotation: string | null;
  hero_heading: Headline | null;
  hero_description: string | null;
}

/** News articles — regular collection, shown at /news/[slug]. */
export interface Post {
  id: string;
  status: string;
  slug: string;
  title: string;
  topic: string | null;
  date_published: string; // ISO date
  excerpt: string | null;
  image: ImageField;
  image_alt: string | null;
  body: string | null; // rich text (HTML)
  meta_title: string | null;
  meta_description: string | null;
}

/** Contact page — singleton collection. */
export interface ContactPage {
  id: number;
  meta_title: string | null;
  meta_description: string | null;
  hero_annotation: string | null;
  hero_heading: Headline | null;
  hero_description: string | null;
  hours_heading: string | null;
  area_heading: string | null;
  area_description: string | null;
}

/** Legal pages (privacy, cookies) — regular collection. */
export interface LegalPage {
  id: string;
  status: string;
  slug: string;
  title: string;
  meta_description: string | null;
  last_updated: string; // ISO date
  body: string | null; // rich text (HTML)
}

/** Quote form submissions — create-only for the Form Bot role. */
export interface Submission {
  id?: string;
  name: string;
  email: string;
  phone: string;
  postcode: string;
  services: string[];
  subject: string;
  message: string;
}

// ============================================================================
// SCHEMA
// ============================================================================
// Register all collections here. This gives you type safety with the SDK.
// ============================================================================

interface Schema {
  global: Global;
  home_page: HomePage;
  services_page: ServicesPage;
  services: Service[];
  before_after_page: BeforeAfterPage;
  before_after: BeforeAfterItem[];
  areas_page: AreasPage;
  news_page: NewsPage;
  posts: Post[];
  contact_page: ContactPage;
  legal_pages: LegalPage[];
  submissions: Submission[];
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

/**
 * URL for an image field. Local paths (mock data) pass straight through;
 * Directus file ids go through the /files proxy.
 */
export function getImageUrl(image: ImageField): string | null {
  if (!image) return null;
  if (typeof image === "string" && image.startsWith("/")) return image;
  return getFileUrl(image);
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
//
// Every fetcher below currently returns mock data.
// ============================================================================

export async function getGlobal(): Promise<Global | null> {
  const mock = await getMockModule();
  return mock.mockGlobal;
}

export async function getHomePage(): Promise<HomePage | null> {
  const mock = await getMockModule();
  return mock.mockHomePage;
}

export async function getServicesPage(): Promise<ServicesPage | null> {
  const mock = await getMockModule();
  return mock.mockServicesPage;
}

/** Published services, in sort order. */
export async function getServices(): Promise<Service[]> {
  const mock = await getMockModule();
  return mock.mockServices
    .filter((s) => s.status === "published")
    .sort((a, b) => a.sort - b.sort);
}

/** A published service that has its own page. */
export async function getService(slug: string): Promise<Service | null> {
  const services = await getServices();
  return services.find((s) => s.slug === slug && s.has_page) ?? null;
}

export async function getBeforeAfterPage(): Promise<BeforeAfterPage | null> {
  const mock = await getMockModule();
  return mock.mockBeforeAfterPage;
}

/** Published before and after pairs, in sort order. */
export async function getBeforeAfterItems(): Promise<BeforeAfterItem[]> {
  const mock = await getMockModule();
  return mock.mockBeforeAfterItems
    .filter((i) => i.status === "published")
    .sort((a, b) => a.sort - b.sort);
}

export async function getAreasPage(): Promise<AreasPage | null> {
  const mock = await getMockModule();
  return mock.mockAreasPage;
}

export async function getNewsPage(): Promise<NewsPage | null> {
  const mock = await getMockModule();
  return mock.mockNewsPage;
}

/** Published posts, newest first. */
export async function getPosts(): Promise<Post[]> {
  const mock = await getMockModule();
  return mock.mockPosts
    .filter((p) => p.status === "published")
    .sort((a, b) => b.date_published.localeCompare(a.date_published));
}

export async function getPost(slug: string): Promise<Post | null> {
  const posts = await getPosts();
  return posts.find((p) => p.slug === slug) ?? null;
}

export async function getContactPage(): Promise<ContactPage | null> {
  const mock = await getMockModule();
  return mock.mockContactPage;
}

export async function getLegalPage(slug: string): Promise<LegalPage | null> {
  const mock = await getMockModule();
  return (
    mock.mockLegalPages.find(
      (p) => p.slug === slug && p.status === "published"
    ) ?? null
  );
}

// ============================================================================
// DATA FETCHERS — PREVIEW (authenticated, uncached)
// ============================================================================
// Pattern: fetch with Bearer token + cache: "no-store" for live preview.
// Used by preview routes at /preview/[page]. Preview fetchers for each
// collection are added as it migrates to Directus (see .docs/PROCESS.md).
// ============================================================================
