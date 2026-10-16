import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { DynamicIcon } from "@/components/shared/dynamic-icon";
import { Headline } from "@/components/site/headline";
import { focusRing, heading } from "@/components/site/styles";
import type { Service } from "@/lib/directus";
import { cn } from "@/lib/utils";

export const KIND_LABEL: Record<Service["kind"], string> = {
  main: "The main event",
  add_on: "Add-on",
  on_request: "On request",
};

export function serviceHref(service: Service) {
  return service.has_page
    ? `/services/${service.slug}`
    : `/services#${service.slug}`;
}

/**
 * The main service as a big sky slab, the rest as smaller tiles around it.
 * The third tile is white so the grid doesn't read as one dark block.
 */
export function ServicesGrid({
  title,
  ctaText,
  services,
}: {
  title: string | null;
  ctaText: string | null;
  services: Service[];
}) {
  const main = services.find((s) => s.kind === "main");
  const extras = services.filter((s) => s !== main);

  return (
    <section
      id="services"
      className="bg-pv-navy scroll-mt-8 px-5 pt-24 pb-16 text-white lg:px-12 lg:pt-30"
    >
      <div className="mx-auto flex max-w-336 flex-col gap-12 lg:gap-14">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          {title && (
            <h2 className={heading.section}>
              <Headline text={title} />
            </h2>
          )}
          {ctaText && (
            <Link
              href="/services"
              className={cn(
                "hover:text-pv-navy flex h-15 items-center self-start rounded-full border-2 border-white px-7 text-lg font-bold transition-colors hover:bg-white sm:self-auto",
                focusRing
              )}
            >
              {ctaText}
            </Link>
          )}
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4 lg:grid-rows-[18.75rem_18.75rem]">
          {main && (
            <Link
              href={serviceHref(main)}
              className={cn(
                "bg-pv-sky text-pv-navy flex flex-col justify-between gap-10 rounded-[2.5rem] p-8 md:col-span-2 lg:row-span-2 lg:p-12",
                focusRing
              )}
            >
              <div className="flex flex-col gap-4">
                <span className="bg-pv-navy self-start rounded-full px-4 py-2 text-[0.9375rem] font-bold text-white">
                  {KIND_LABEL.main}
                </span>
                <h3 className="font-pv-display text-[clamp(3rem,5.5vw,4.75rem)] leading-[0.9] font-extrabold tracking-[-0.01em] font-stretch-75%">
                  {main.title}
                </h3>
                {main.card_summary && (
                  <p className="max-w-110 text-xl leading-normal">
                    {main.card_summary}
                  </p>
                )}
              </div>
              <div className="flex items-end justify-between">
                {main.price_from ? (
                  <p className="flex flex-col leading-none">
                    <span className="text-xl font-semibold">from just</span>
                    <span className="font-pv-display text-[clamp(4.5rem,8vw,6.5rem)] font-extrabold tracking-[-0.01em] font-stretch-75%">
                      {main.price_from}
                    </span>
                  </p>
                ) : (
                  <span />
                )}
                <span className="bg-pv-navy flex size-21 items-center justify-center rounded-full text-white">
                  <ArrowRight
                    className="motion-safe:animate-pv-nudge size-8"
                    strokeWidth={2.5}
                    aria-hidden="true"
                  />
                </span>
              </div>
            </Link>
          )}

          {extras.map((service, i) => {
            const light = i === 2;
            return (
              <Link
                key={service.id}
                href={serviceHref(service)}
                className={cn(
                  "flex min-h-60 flex-col justify-between rounded-4xl p-8 transition-transform hover:-translate-y-1",
                  light
                    ? "text-pv-navy bg-white"
                    : "bg-pv-navy-soft text-white",
                  focusRing
                )}
              >
                <DynamicIcon
                  name={service.icon}
                  className={cn(
                    "size-11",
                    light ? "text-pv-navy" : "text-pv-sky"
                  )}
                />
                <div className="flex flex-col gap-2">
                  <span
                    className={cn(
                      "text-sm font-bold tracking-wide",
                      light ? "text-pv-link" : "text-pv-sky"
                    )}
                  >
                    {KIND_LABEL[service.kind]}
                  </span>
                  <h3 className="font-pv-display text-[2.125rem] leading-none font-extrabold tracking-[-0.02em] font-stretch-80%">
                    {service.title}
                  </h3>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
