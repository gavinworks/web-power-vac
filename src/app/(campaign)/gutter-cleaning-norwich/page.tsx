import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CampaignView } from "@/components/campaign/campaign-view";
import {
  getBeforeAfterItems,
  getBeforeAfterPage,
  getCampaignPage,
  getServices,
} from "@/lib/directus";

const SLUG = "gutter-cleaning-norwich";

// Only reached from Google Ads: kept out of search so it never competes
// with the homepage for "gutter cleaning Norwich"
export async function generateMetadata(): Promise<Metadata> {
  const page = await getCampaignPage(SLUG);
  return {
    title: { absolute: page?.meta_title ?? "Gutter cleaning in Norwich" },
    description: page?.meta_description ?? undefined,
    robots: { index: false, follow: false },
  };
}

export default async function GutterCleaningNorwichPage() {
  const [page, services, beforeAfterItems, beforeAfterPage] = await Promise.all(
    [
      getCampaignPage(SLUG),
      getServices(),
      getBeforeAfterItems(),
      getBeforeAfterPage(),
    ]
  );

  if (!page) notFound();

  return (
    <CampaignView
      page={page}
      services={services}
      beforeAfter={beforeAfterItems[0] ?? null}
      beforeAfterLabels={beforeAfterPage}
    />
  );
}
