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
  site_name: "Power-Vac Gutter Cleaning",
  site_description:
    "Gutter vacuum cleaning from the ground across Norwich and Norfolk.",
  phone: "01603 339225",
  email_address: "powervacguttercleaning@gmail.com",
  address: "Norwich, Norfolk",
  office_hours_days: null,
  office_hours_times: null,
  social_media_accounts: [],
};

export const mockHomePage: HomePage = {
  id: 1,
  meta_title: "Power-Vac Gutter Cleaning | Norwich & Norfolk",
  meta_description:
    "Gutter vacuum cleaning from the ground across Norwich and Norfolk. No ladders, no mess, just results.",
  hero_heading: "Our new website is on its way.",
  hero_description:
    "We vacuum the leaves, moss and muck out of gutters from the ground, across Norwich and the whole of Norfolk. Gutter cleaning from just £34.99. Call for a free, no-obligation quote.",
  hero_cta_text: "Call 01603 339225",
  hero_cta_link: "tel:01603339225",
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
