import type { Metadata } from "next";
import { AreasSection } from "@/components/home/areas-section";
import { BeforeAfterSection } from "@/components/home/before-after-section";
import { Hero } from "@/components/home/hero";
import { HowItWorks } from "@/components/home/how-it-works";
import { NewsSection } from "@/components/home/news-section";
import { ServicesGrid } from "@/components/home/services-grid";
import { QuoteSection } from "@/components/site/quote-section";
import {
  getBeforeAfterItems,
  getGlobal,
  getHomePage,
  getPosts,
  getServices,
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
  const [page, global, services, beforeAfter, posts] = await Promise.all([
    getHomePage(),
    getGlobal(),
    getServices(),
    getBeforeAfterItems(),
    getPosts(),
  ]);

  if (!page) {
    throw new Error("Failed to fetch home_page data from Directus");
  }

  const facebook = global?.social_media_accounts?.find(
    (s) => s.name === "Facebook"
  );

  return (
    <>
      <Hero page={page} />
      <HowItWorks
        title={page.steps_heading}
        annotation={page.steps_annotation}
        steps={page.steps ?? []}
      />
      <ServicesGrid
        title={page.services_heading}
        ctaText={page.services_cta_text}
        services={services}
      />
      <BeforeAfterSection
        title={page.before_after_heading}
        annotation={page.before_after_annotation}
        item={beforeAfter[0]}
      />
      <AreasSection
        annotation={page.areas_annotation}
        title={page.areas_heading}
        description={page.areas_description}
        ctaText={page.areas_cta_text}
        points={global?.promises ?? []}
      />
      <NewsSection
        title={page.news_heading}
        posts={posts}
        facebookUrl={facebook?.link ?? null}
      />
      <QuoteSection services={services.map((s) => s.form_label)} />
    </>
  );
}
