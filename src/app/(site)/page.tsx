import type { Metadata } from "next";
import { HomeView } from "@/components/views/home-view";
import {
  getBeforeAfterItems,
  getBeforeAfterPage,
  getGlobal,
  getHomePage,
  getPosts,
  getServices,
  getServicesPage,
} from "@/lib/directus";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getHomePage();
  return {
    title: { absolute: page?.meta_title ?? "Power-Vac Gutter Cleaning" },
    description: page?.meta_description ?? undefined,
    alternates: { canonical: "/" },
  };
}

export default async function Home() {
  const [
    page,
    global,
    services,
    servicesPage,
    beforeAfter,
    beforeAfterPage,
    posts,
  ] = await Promise.all([
    getHomePage(),
    getGlobal(),
    getServices(),
    getServicesPage(),
    getBeforeAfterItems(),
    getBeforeAfterPage(),
    getPosts(),
  ]);

  if (!page) {
    throw new Error("Failed to fetch home_page data from Directus");
  }

  return (
    <HomeView
      page={page}
      global={global}
      services={services}
      servicesPage={servicesPage}
      beforeAfter={beforeAfter}
      beforeAfterPage={beforeAfterPage}
      posts={posts}
    />
  );
}
