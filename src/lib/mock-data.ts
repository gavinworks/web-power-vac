import { Global, HomePage, Page } from "./directus";

/**
 * Mock data for collections not yet migrated to Directus.
 *
 * Each fetcher in directus.ts is either "mock" (returns data from here)
 * or "live" (fetches from Directus). Migrating a collection means replacing
 * the mock fetcher body with a Directus fetch and deleting the mock data here.
 *
 * This file is permanent infrastructure — new pages can be designed with
 * mock data first for client sign-off, then migrated to Directus once approved.
 */

export const mockGlobal: Global = {
  id: 1,
  site_name: "Power Vac",
  site_description: "A Next.js site powered by Directus",
  phone: "0123 456 7890",
  email_address: "hello@example.com",
  address: "123 Example Street\nLondon\nSW1A 1AA",
  office_hours_days: "Mon-Fri",
  office_hours_times: "9am-5pm",
  social_media_accounts: [],
};

export const mockHomePage: HomePage = {
  id: 1,
  meta_title: "Power Vac | Home",
  meta_description: "Welcome to Power Vac",
  hero_heading: "Welcome to Power Vac",
  hero_description:
    "This is your starter project. Content is coming from mock data. Migrate this fetcher to Directus once your collection is set up.",
  hero_cta_text: "Get Started",
  hero_cta_link: "/contact",
};

export const mockPages: Page[] = [
  {
    id: "1",
    status: "published",
    sort: 1,
    slug: "about",
    meta_title: "About Us",
    meta_description: "Learn more about us",
    title: "About Us",
    description: "This is an example page loaded from mock data.",
  },
  {
    id: "2",
    status: "published",
    sort: 2,
    slug: "services",
    meta_title: "Our Services",
    meta_description: "What we offer",
    title: "Our Services",
    description: "This is another example page loaded from mock data.",
  },
];
