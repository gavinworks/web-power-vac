import type { Metadata } from "next";
import { AreasView } from "@/components/views/areas-view";
import { getAreasPage, getGlobal, getServices } from "@/lib/directus";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getAreasPage();
  return {
    title: page?.meta_title ?? "Areas we cover",
    description: page?.meta_description ?? undefined,
    alternates: { canonical: "/areas" },
  };
}

export default async function AreasPage() {
  const [page, global, services] = await Promise.all([
    getAreasPage(),
    getGlobal(),
    getServices(),
  ]);

  if (!page) {
    throw new Error("Failed to fetch areas_page data from Directus");
  }

  return <AreasView page={page} global={global} services={services} />;
}
