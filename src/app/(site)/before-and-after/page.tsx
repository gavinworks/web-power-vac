import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BeforeAfterSlider } from "@/components/site/before-after-slider";
import { CameraMonitor } from "@/components/site/camera-monitor";
import { Headline } from "@/components/site/headline";
import { PageHero } from "@/components/site/page-hero";
import { QuoteSection } from "@/components/site/quote-section";
import { focusRing, heading, pill } from "@/components/site/styles";
import {
  getBeforeAfterItems,
  getBeforeAfterPage,
  getImageUrl,
  getServices,
} from "@/lib/directus";
import { cn } from "@/lib/utils";

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

  const camera = getImageUrl(page.camera_image);
  const heroImage = getImageUrl(items[0]?.after_image ?? null);

  return (
    <>
      <PageHero
        annotation={page.hero_annotation}
        heading={page.hero_heading ?? "Before & after"}
        description={page.hero_description}
        image={heroImage}
        imageAlt={items[0]?.after_image_alt}
      />

      <section className="bg-pv-navy relative z-10 -mt-14 rounded-t-[3.5rem] px-5 pt-20 pb-24 text-white lg:px-12 lg:pt-27.5 lg:pb-30">
        <div className="mx-auto flex max-w-336 flex-col gap-10">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            {page.gallery_heading && (
              <h2 className={heading.section}>
                <Headline text={page.gallery_heading} />
              </h2>
            )}
            {page.gallery_note && (
              <p className="text-pv-haze max-w-100 text-lg leading-normal">
                {page.gallery_note}
              </p>
            )}
          </div>

          <ul className="flex flex-col gap-14">
            {items.map((item) => {
              const before = getImageUrl(item.before_image);
              const after = getImageUrl(item.after_image);
              if (!before || !after) return null;
              return (
                <li key={item.id} className="flex flex-col gap-5">
                  <BeforeAfterSlider
                    beforeSrc={before}
                    beforeAlt={item.before_image_alt ?? ""}
                    afterSrc={after}
                    afterAlt={item.after_image_alt ?? ""}
                    isExample={item.is_example}
                    label={item.title}
                  />
                  <div className="flex flex-col gap-1 px-2 sm:flex-row sm:items-baseline sm:justify-between">
                    <h3 className="font-pv-display text-3xl leading-tight font-extrabold tracking-[-0.02em] font-stretch-80%">
                      {item.title}
                    </h3>
                    {(item.service || item.location) && (
                      <p className="text-pv-sky font-semibold">
                        {[item.service, item.location]
                          .filter(Boolean)
                          .join(", ")}
                      </p>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {camera && (
        <section className="bg-pv-sky text-pv-navy relative -mt-14 rounded-t-[3.5rem] px-5 pt-20 pb-28 lg:px-12 lg:pt-27.5 lg:pb-36">
          <div className="mx-auto grid max-w-336 items-center gap-12 lg:grid-cols-2 lg:gap-20">
            <div className="flex flex-col gap-7">
              {page.camera_heading && (
                <h2 className={heading.section}>
                  <Headline
                    text={page.camera_heading}
                    accentClassName="text-white"
                  />
                </h2>
              )}
              {page.camera_description && (
                <p className="max-w-130 text-xl leading-normal font-medium">
                  {page.camera_description}
                </p>
              )}
              <Link
                href="/services/gutter-vacuum-cleaning"
                className={cn(pill.navy, "gap-3 self-start", focusRing)}
              >
                How we clean your gutters
                <ArrowRight
                  className="size-5"
                  strokeWidth={2.5}
                  aria-hidden="true"
                />
              </Link>
            </div>
            <CameraMonitor
              src={camera}
              alt={page.camera_image_alt ?? ""}
              sizes="(min-width: 1024px) 640px, 100vw"
              className="-rotate-2"
            />
          </div>
        </section>
      )}

      <QuoteSection services={services.map((s) => s.form_label)} />
    </>
  );
}
