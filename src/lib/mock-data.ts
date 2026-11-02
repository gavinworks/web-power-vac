/**
 * Mock data for collections not yet migrated to Directus.
 *
 * Each fetcher in directus.ts is either "mock" (returns data from here)
 * or "live" (fetches from Directus). Migrating a collection means replacing
 * the mock fetcher body with a Directus fetch and deleting the mock data here.
 *
 * This file is permanent infrastructure — new pages can be designed with
 * mock data first for client sign-off, then migrated to Directus once approved.
 *
 * Every Power-Vac collection was migrated to Directus on 16 October 2026
 * (B76-293). The campaign landing page (B76-451) is the only mock page.
 */

import type { CampaignPage } from "./directus";

// Images are the Directus file ids already in Tommy's library: his own
// photos (hero, owner) and the camera still the homepage uses.
export const mockCampaignPages: CampaignPage[] = [
  {
    id: "gutter-cleaning-norwich",
    status: "published",
    slug: "gutter-cleaning-norwich",
    meta_title: "Gutter cleaning in Norwich from £34.99",
    meta_description:
      "Gutter cleaning in Norwich from £34.99. Cleaned from the ground with a camera, so you can see inside your gutters. Free quote.",
    hero_heading: "Gutter cleaning\nin Norwich,\nfrom *£34.99*",
    hero_description:
      "We clean your gutters from the ground with a camera on the pole, so you can see inside them while we work. No ladders, and you get before and after photos.",
    hero_image: "2feeda2d-24fe-42d2-ae56-8be3cf59c678",
    hero_image_alt:
      "Tommy cleaning the gutters of a three-storey house from the pavement with a long vacuum pole",
    hero_camera_image: "e3e10ee8-d592-4fa0-a037-52644651053f",
    hero_camera_image_alt:
      "The camera view inside a gutter full of leaves and moss",
    hero_note: "all from the ground",
    call_button_text: "Call Tommy",
    quote_button_text: "Get a free quote",
    rating: "5.0",
    rating_count: 6,
    rating_source: "TrustATrader",
    rating_url:
      "https://www.trustatrader.com/traders/power-vac-gutter-cleaning-gutteringroof-cleaning-specialists-breckland",
    proof_points: [
      "Insurance checked by TrustATrader",
      "No missed appointments in the last 6 months",
    ],
    steps_heading: "How it *works*",
    steps: [
      {
        title: "Ask for a quote",
        body: "Call or fill in the form. We'll give you a fixed price before we start.",
      },
      {
        title: "We clean from the ground",
        body: "The vacuum pole reaches up to three storeys. Watch the camera screen and see every bit come out.",
      },
      {
        title: "You get the photos",
        body: "Before and after photos of your gutters, so you know the job's been done properly.",
      },
    ],
    before_after_heading: "See inside *your gutters*",
    before_after_description:
      "Most people never see inside their gutters. Our camera shows you what's up there, and what it looks like when we've finished.",
    reviews_heading: "What customers *say*",
    reviews: [
      {
        quote: "They were on time, professional and great value for money.",
        name: "Kelly",
        date: "19 October 2026",
      },
      {
        quote:
          "Very professional, explained everything in great detail. Happy to recommend.",
        name: "Madison",
        date: "1 October 2026",
      },
      {
        quote:
          "Highly recommend, great value for money, always on time, excellent outcome.",
        name: "Romany",
        date: "16 September 2026",
      },
    ],
    form_heading: "Get a free *quote*",
    form_description:
      "Tell us where you are and we'll come back to you with a price. No obligation.",
    form_preselect: "Gutter clean",
    promises_heading: "What you can *count on*",
    promises: [
      { label: "No ladders against your house", icon: "House" },
      { label: "Everything goes in the vacuum, not your garden", icon: "Leaf" },
      { label: "Before and after photos of every job", icon: "Camera" },
      { label: "Fully insured", icon: "ShieldCheck" },
    ],
    owner_heading: "A local sole trader, *not a call centre*",
    owner_body:
      "Power-Vac is Tommy, based in Norwich. When you call, you speak to the person who'll clean your gutters.",
    owner_image: "dbbfbbaf-40df-4911-95b4-be3cc3a3a369",
    owner_image_alt:
      "Tommy cleaning the back gutters of a three-storey town house from the garden",
    areas_heading: "Where we *work*",
    areas:
      "Norwich and the villages around it, including Taverham, Drayton, Hellesdon, Sprowston, Costessey, Thorpe St Andrew, Wymondham, Hethersett, Aylsham and Dereham.",
    faqs_heading: "Quick *questions*",
    faqs: [
      {
        question: "How much will it cost?",
        answer:
          "Gutter cleaning starts at £34.99. The price depends on the size of your house and how long your gutters are. We give you a fixed price before we start.",
      },
      {
        question: "Do I need to be at home?",
        answer:
          "No, as long as we can get to the gutters. If you are home, you can watch the camera screen while we clean.",
      },
      {
        question: "How long does it take?",
        answer:
          "Most houses take under an hour. Everything is done from the ground, so there's no scaffolding or ladders to set up.",
      },
    ],
  },
];
