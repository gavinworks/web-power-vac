import { AreasSection } from "@/components/home/areas-section";
import { BeforeAfterSection } from "@/components/home/before-after-section";
import { Hero } from "@/components/home/hero";
import { HowItWorks } from "@/components/home/how-it-works";
import { NewsSection } from "@/components/home/news-section";
import { ServicesGrid } from "@/components/home/services-grid";
import { QuoteSection } from "@/components/site/quote-section";
import type {
  BeforeAfterItem,
  BeforeAfterPage,
  Global,
  HomePage,
  Post,
  Service,
  ServicesPage,
} from "@/lib/directus";

export interface HomeViewProps {
  page: HomePage;
  global: Global | null;
  services: Service[];
  servicesPage: ServicesPage | null;
  beforeAfter: BeforeAfterItem[];
  beforeAfterPage: BeforeAfterPage | null;
  posts: Post[];
}

/** The homepage, shared by the live route and its Directus preview. */
export function HomeView({
  page,
  global,
  services,
  servicesPage,
  beforeAfter,
  beforeAfterPage,
  posts,
}: HomeViewProps) {
  const facebook = global?.social_media_accounts?.find(
    (s) => s.name === "Facebook"
  );

  return (
    <>
      <Hero page={page} />
      <HowItWorks
        pageId={page.id}
        title={page.steps_heading}
        annotation={page.steps_annotation}
        steps={page.steps ?? []}
      />
      <ServicesGrid
        pageId={page.id}
        title={page.services_heading}
        ctaText={page.services_cta_text}
        services={services}
        labels={servicesPage}
        pricePrefix={global?.price_prefix ?? null}
      />
      <BeforeAfterSection
        pageId={page.id}
        title={page.before_after_heading}
        annotation={page.before_after_annotation}
        item={beforeAfter[0]}
        labels={beforeAfterPage}
      />
      <AreasSection
        pageId={page.id}
        globalId={global?.id}
        annotation={page.areas_annotation}
        title={page.areas_heading}
        description={page.areas_description}
        ctaText={page.areas_cta_text}
        points={global?.promises ?? []}
      />
      <NewsSection
        pageId={page.id}
        title={page.news_heading}
        ctaText={page.news_cta_text}
        facebookText={page.facebook_card_text}
        posts={posts}
        facebookUrl={facebook?.link ?? null}
      />
      <QuoteSection services={services.map((s) => s.form_label)} />
    </>
  );
}
