import type { Metadata } from "next";
import { BeforeAfterView } from "@/components/views/before-after-view";
import {
  getBeforeAfterItems,
  getBeforeAfterPage,
  getServices,
} from "@/lib/directus";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getBeforeAfterPage();
  return {
    title: page?.meta_title ?? "Before & after",
    description: page?.meta_description ?? undefined,
    alternates: { canonical: "/before-and-after" },
  };
}

export default async function BeforeAfterPage() {
  const [page, items, services] = await Promise.all([
    getBeforeAfterPage(),
    getBeforeAfterItems(),
    getServices(),
  ]);

  if (!page) {
    throw new Error("Failed to fetch before_after_page data from Directus");
  }

  return <BeforeAfterView page={page} items={items} services={services} />;
}
