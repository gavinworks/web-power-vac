import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { kindLabel, serviceHref } from "@/components/home/services-grid";
import { DynamicIcon } from "@/components/shared/dynamic-icon";
import { FaqList } from "@/components/site/faq-list";
import { Headline } from "@/components/site/headline";
import { PageHero } from "@/components/site/page-hero";
import { QuoteSection } from "@/components/site/quote-section";
import { focusRing, heading, pill } from "@/components/site/styles";
import {
  getImageUrl,
  type Global,
  type Service,
  type ServicesPage,
} from "@/lib/directus";
import { editable } from "@/lib/editable";
import { cn } from "@/lib/utils";

export interface ServicesViewProps {
  page: ServicesPage;
  services: Service[];
  global: Global | null;
}

/** The services overview, shared by the live route and its Directus preview. */
export function ServicesView({ page, services, global }: ServicesViewProps) {
  const edit = (fields: string | string[], mode?: "popover" | "drawer") =>
    editable("services_page", page.id, fields, mode);
  const main = services.find((s) => s.kind === "main");
  const extras = services.filter((s) => s !== main);

  return (
    <>
      <PageHero
        annotation={page.hero_annotation}
        heading={page.hero_heading ?? "Services"}
        description={page.hero_description}
        image={getImageUrl(page.hero_image)}
        imageAlt={page.hero_image_alt}
        edit={{
          annotation: edit("hero_annotation"),
          heading: edit("hero_heading"),
          description: edit("hero_description"),
          image: edit(["hero_image", "hero_image_alt"], "drawer"),
        }}
      >
        {global?.quote_cta_text && (
          <div className="flex flex-wrap items-center gap-3.5">
            <Link
              href="#quote"
              data-directus={editable("global", global.id, "quote_cta_text")}
              className={cn(pill.sky, focusRing)}
            >
              {global.quote_cta_text}
              <ArrowRight
                className="size-5"
                strokeWidth={2.5}
                aria-hidden="true"
              />
            </Link>
          </div>
        )}
      </PageHero>

      {main && (
        <section className="bg-pv-mist relative z-10 -mt-14 rounded-t-[3.5rem] px-5 pt-20 pb-24 lg:px-12 lg:pt-27.5 lg:pb-30">
          <Link
            id={main.slug}
            href={serviceHref(main)}
            data-directus={editable(
              "services",
              main.id,
              ["title", "card_summary", "price_from"],
              "drawer"
            )}
            className={cn(
              "bg-pv-sky text-pv-navy mx-auto grid max-w-336 gap-10 rounded-[2.5rem] p-8 lg:grid-cols-[1fr_auto] lg:items-end lg:p-14",
              focusRing
            )}
          >
            <div className="flex flex-col gap-5">
              <span className="bg-pv-navy self-start rounded-full px-4 py-2 text-[0.9375rem] font-bold text-white">
                {kindLabel("main", page)}
              </span>
              <h2 className="font-pv-display text-[clamp(3rem,6.5vw,6rem)] leading-[0.88] font-extrabold tracking-[-0.01em] font-stretch-75%">
                {main.title}
              </h2>
              {main.card_summary && (
                <p className="max-w-130 text-xl leading-normal">
                  {main.card_summary}
                </p>
              )}
            </div>
            <div className="flex items-end justify-between gap-8 lg:flex-col lg:items-end">
              {main.price_from && (
                <p className="flex flex-col leading-none lg:items-end">
                  <span className="text-xl font-semibold">
                    {global?.price_prefix}
                  </span>
                  <span className="font-pv-display text-[clamp(4.5rem,9vw,8rem)] font-extrabold tracking-[-0.01em] font-stretch-75%">
                    {main.price_from}
                  </span>
                </p>
              )}
              <span className="bg-pv-navy flex size-21 shrink-0 items-center justify-center rounded-full text-white">
                <ArrowRight
                  className="motion-safe:animate-pv-nudge size-8"
                  strokeWidth={2.5}
                  aria-hidden="true"
                />
                <span className="sr-only">Find out more</span>
              </span>
            </div>
          </Link>
        </section>
      )}

      {extras.length > 0 && (
        <section className="bg-pv-navy px-5 pt-24 pb-28 text-white lg:px-12 lg:pt-30 lg:pb-36">
          <div className="mx-auto flex max-w-336 flex-col gap-12">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              {page.extras_heading && (
                <h2
                  data-directus={edit("extras_heading")}
                  className={heading.section}
                >
                  <Headline text={page.extras_heading} />
                </h2>
              )}
              {page.extras_description && (
                <p
                  data-directus={edit("extras_description")}
                  className="text-pv-haze max-w-130 text-xl leading-normal"
                >
                  {page.extras_description}
                </p>
              )}
            </div>

            {/* A menu of rows: each add-on reads across like a line on the flyer */}
            <ul className="flex flex-col border-t border-white/15">
              {extras.map((service) => {
                const row = (
                  <>
                    <span className="bg-pv-navy-soft flex size-16 shrink-0 items-center justify-center rounded-full lg:size-20">
                      <DynamicIcon
                        name={service.icon}
                        className="text-pv-sky size-8 lg:size-10"
                      />
                    </span>
                    <span className="flex flex-1 flex-col gap-2 lg:flex-row lg:items-center lg:gap-10">
                      <span className="flex flex-col gap-1 lg:w-[26rem] lg:shrink-0">
                        <span className="text-pv-sky text-sm font-bold tracking-wide">
                          {kindLabel(service.kind, page)}
                        </span>
                        <span className="font-pv-display text-[2.25rem] leading-none font-extrabold tracking-[-0.02em] font-stretch-80% lg:text-5xl">
                          {service.title}
                        </span>
                      </span>
                      {service.card_summary && (
                        <span className="text-pv-haze max-w-130 text-lg leading-normal">
                          {service.card_summary}
                        </span>
                      )}
                    </span>
                    {service.has_page && (
                      <span className="group-hover:border-pv-sky group-hover:bg-pv-sky group-hover:text-pv-navy hidden size-14 shrink-0 items-center justify-center rounded-full border-2 border-white/30 transition-colors sm:flex">
                        <ArrowRight
                          className="size-6"
                          strokeWidth={2.5}
                          aria-hidden="true"
                        />
                      </span>
                    )}
                  </>
                );
                const attr = editable(
                  "services",
                  service.id,
                  ["title", "icon", "card_summary"],
                  "drawer"
                );
                return (
                  <li
                    key={service.id}
                    id={service.slug}
                    className="scroll-mt-8 border-b border-white/15"
                  >
                    {service.has_page ? (
                      <Link
                        href={serviceHref(service)}
                        data-directus={attr}
                        className={cn(
                          "group flex items-start gap-5 py-8 sm:items-center lg:gap-8 lg:py-10",
                          focusRing
                        )}
                      >
                        {row}
                      </Link>
                    ) : (
                      <div
                        data-directus={attr}
                        className="flex items-start gap-5 py-8 sm:items-center lg:gap-8 lg:py-10"
                      >
                        {row}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      )}

      {page.faqs && page.faqs.length > 0 && (
        <section className="bg-pv-mist relative -mt-14 rounded-t-[3.5rem] px-5 pt-20 pb-24 lg:px-12 lg:pt-27.5 lg:pb-30">
          <div className="mx-auto grid max-w-336 gap-10 lg:grid-cols-[1fr_1.4fr] lg:gap-16">
            {page.faqs_heading && (
              <h2
                data-directus={edit("faqs_heading")}
                className={heading.section}
              >
                <Headline
                  text={page.faqs_heading}
                  accentClassName="text-pv-link"
                />
              </h2>
            )}
            <FaqList faqs={page.faqs} editAttr={edit("faqs", "drawer")} />
          </div>
        </section>
      )}

      <QuoteSection services={services.map((s) => s.form_label)} />
    </>
  );
}
