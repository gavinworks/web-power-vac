import type { Metadata } from "next";
import { ServicesView } from "@/components/views/services-view";
import { getGlobal, getServices, getServicesPage } from "@/lib/directus";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getServicesPage();
  return {
    title: page?.meta_title ?? "Services",
    description: page?.meta_description ?? undefined,
    alternates: { canonical: "/services" },
  };
}

export default async function ServicesPage() {
  const [page, services, global] = await Promise.all([
    getServicesPage(),
    getServices(),
    getGlobal(),
  ]);

  if (!page) {
    throw new Error("Failed to fetch services_page data from Directus");
  }

  return <ServicesView page={page} services={services} global={global} />;
}
