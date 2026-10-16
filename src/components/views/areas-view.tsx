import Link from "next/link";
import { Phone } from "lucide-react";
import { Headline } from "@/components/site/headline";
import { Leaf } from "@/components/site/icons";
import { PageHero } from "@/components/site/page-hero";
import { QuoteSection } from "@/components/site/quote-section";
import { focusRing, heading, pill, telHref } from "@/components/site/styles";
import { TrustBadges } from "@/components/site/trust-badges";
import type { AreasPage, Global, Service } from "@/lib/directus";
import { editable } from "@/lib/editable";
import { cn } from "@/lib/utils";

export interface AreasViewProps {
  page: AreasPage;
  global: Global | null;
  services: Service[];
}

/** The areas page, shared by the live route and its Directus preview. */
export function AreasView({ page, global, services }: AreasViewProps) {
  const edit = (fields: string | string[], mode?: "popover" | "drawer") =>
    editable("areas_page", page.id, fields, mode);

  return (
    <>
      <PageHero
        annotation={page.hero_annotation}
        heading={page.hero_heading ?? "Areas we cover"}
        description={page.hero_description}
        edit={{
          annotation: edit("hero_annotation"),
          heading: edit("hero_heading"),
          description: edit("hero_description"),
        }}
      />

      {/*
        The place names are the design: Norwich at the centre, the towns set
        large around it, the villages smaller, like names on a road map.
      */}
      <section className="bg-pv-sky text-pv-navy relative z-10 -mt-14 overflow-hidden rounded-t-[3.5rem] px-5 pt-20 pb-28 lg:px-12 lg:pt-27.5 lg:pb-36">
        <Leaf
          fill="var(--color-pv-navy)"
          className="absolute top-24 right-10 w-12 rotate-12 opacity-80"
        />
        <div className="mx-auto flex max-w-336 flex-col gap-16 lg:gap-20">
          {page.city && (
            <div
              data-directus={edit(["city_annotation", "city"])}
              className="flex flex-col gap-2"
            >
              {page.city_annotation && (
                <p className="font-pv-hand -rotate-3 self-start text-3xl lg:text-4xl">
                  {page.city_annotation}
                </p>
              )}
              <h2 className="font-pv-display text-[clamp(5rem,17vw,16rem)] leading-[0.8] font-extrabold tracking-[-0.025em] text-white font-stretch-75%">
                {page.city}
              </h2>
            </div>
          )}

          {page.towns && page.towns.length > 0 && (
            <div
              data-directus={edit(["towns_heading", "towns"], "drawer")}
              className="flex flex-col gap-6"
            >
              {page.towns_heading && (
                <h2 className="text-xl font-bold">{page.towns_heading}</h2>
              )}
              <ul className="flex flex-wrap items-baseline gap-x-8 gap-y-1 lg:gap-x-12">
                {page.towns.map((town, i) => (
                  <li
                    key={town}
                    className={cn(
                      "font-pv-display text-[clamp(2.75rem,6vw,5.25rem)] leading-[0.95] font-extrabold tracking-[-0.015em] font-stretch-75%",
                      i % 3 === 1 && "text-white"
                    )}
                  >
                    {town}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {page.villages && page.villages.length > 0 && (
            <div
              data-directus={edit(["villages_heading", "villages"], "drawer")}
              className="border-pv-navy/20 flex flex-col gap-6 border-t-2 pt-10"
            >
              {page.villages_heading && (
                <h2 className="text-xl font-bold">{page.villages_heading}</h2>
              )}
              <ul className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3 lg:grid-cols-5">
                {page.villages.map((village) => (
                  <li
                    key={village}
                    className="font-pv-display text-2xl leading-tight font-extrabold tracking-[-0.01em] font-stretch-80% lg:text-[1.75rem]"
                  >
                    {village}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>

      <section className="bg-pv-mist relative -mt-14 rounded-t-[3.5rem] px-5 pt-20 pb-24 lg:px-12 lg:pt-27.5 lg:pb-30">
        <div className="mx-auto grid max-w-336 items-center gap-14 lg:grid-cols-2 lg:gap-16">
          <div className="flex flex-col gap-7">
            {page.coverage_heading && (
              <h2
                data-directus={edit("coverage_heading")}
                className={heading.section}
              >
                <Headline
                  text={page.coverage_heading}
                  accentClassName="text-pv-link"
                />
              </h2>
            )}
            {page.coverage_description && (
              <p
                data-directus={edit("coverage_description")}
                className="max-w-130 text-xl leading-normal font-medium"
              >
                {page.coverage_description}
              </p>
            )}
            <div className="flex flex-wrap gap-3.5">
              {global?.phone && (
                <a
                  href={telHref(global.phone)}
                  className={cn(
                    pill.navy,
                    "h-17 gap-3 px-8 text-xl",
                    focusRing
                  )}
                >
                  <Phone
                    className="size-5"
                    strokeWidth={2.4}
                    aria-hidden="true"
                  />
                  {global.phone}
                </a>
              )}
              {page.coverage_cta_text && (
                <Link
                  href="#quote"
                  data-directus={edit("coverage_cta_text")}
                  className={cn(
                    "border-pv-navy hover:bg-pv-navy flex h-17 items-center rounded-full border-2 px-7.5 text-xl font-bold transition-colors hover:text-white",
                    focusRing
                  )}
                >
                  {page.coverage_cta_text}
                </Link>
              )}
            </div>
          </div>
          <TrustBadges
            points={global?.promises ?? []}
            editAttr={editable("global", global?.id, "promises", "drawer")}
          />
        </div>
      </section>

      <QuoteSection services={services.map((s) => s.form_label)} />
    </>
  );
}
