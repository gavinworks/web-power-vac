import type { Metadata } from "next";
import Link from "next/link";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { FacebookIcon } from "@/components/site/icons";
import { PageHero } from "@/components/site/page-hero";
import { QuoteSection } from "@/components/site/quote-section";
import { focusRing, telHref } from "@/components/site/styles";
import { getContactPage, getGlobal, getServices } from "@/lib/directus";
import { cn } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getContactPage();
  return {
    title: page?.meta_title ?? "Contact",
    description: page?.meta_description ?? undefined,
    alternates: { canonical: "/contact" },
  };
}

const cardTitle =
  "font-pv-display text-[2rem] leading-none font-extrabold font-stretch-80% tracking-[-0.02em]";
const linkClass =
  "self-start text-xl font-bold underline-offset-4 hover:underline";

export default async function ContactPage() {
  const [page, global, services] = await Promise.all([
    getContactPage(),
    getGlobal(),
    getServices(),
  ]);

  if (!page) {
    throw new Error("Failed to fetch contact_page data from Directus");
  }

  const facebook = global?.social_media_accounts?.find(
    (s) => s.name === "Facebook"
  );

  return (
    <>
      <PageHero
        annotation={page.hero_annotation}
        heading={page.hero_heading ?? "Contact"}
        description={page.hero_description}
      />

      {/* The form is the point of this page, so it comes straight after the hero */}
      <QuoteSection
        services={services.map((s) => s.form_label)}
        className="relative z-10 -mt-14 rounded-t-[3.5rem]"
      />

      <section className="bg-pv-mist relative z-10 -mt-14 rounded-t-[3.5rem] px-5 pt-20 pb-24 lg:px-12 lg:pt-27.5 lg:pb-30">
        <ul className="mx-auto grid max-w-336 gap-5 md:grid-cols-3">
          <li className="bg-pv-sky flex flex-col gap-5 rounded-4xl p-8 lg:p-10">
            <Phone className="size-10" strokeWidth={1.8} aria-hidden="true" />
            <h2 className={cardTitle}>Call or email</h2>
            <div className="flex flex-col gap-2">
              {global?.phone && (
                <a
                  href={telHref(global.phone)}
                  className={cn(linkClass, "text-2xl", focusRing)}
                >
                  {global.phone}
                </a>
              )}
              {global?.phone_mobile && (
                <a
                  href={telHref(global.phone_mobile)}
                  className={cn(linkClass, "text-2xl", focusRing)}
                >
                  {global.phone_mobile}
                </a>
              )}
              {global?.email_address && (
                <a
                  href={`mailto:${global.email_address}`}
                  className={cn(
                    linkClass,
                    "flex items-center gap-2 text-lg break-all",
                    focusRing
                  )}
                >
                  <Mail className="size-5 shrink-0" aria-hidden="true" />
                  {global.email_address}
                </a>
              )}
              {facebook && (
                <a
                  href={facebook.link}
                  className={cn(
                    linkClass,
                    "flex items-center gap-2 text-lg",
                    focusRing
                  )}
                >
                  <FacebookIcon className="size-5" />
                  Facebook
                </a>
              )}
            </div>
          </li>

          {global?.opening_hours && global.opening_hours.length > 0 && (
            <li className="flex flex-col gap-5 rounded-4xl bg-white p-8 lg:p-10">
              <Clock
                className="text-pv-link size-10"
                strokeWidth={1.8}
                aria-hidden="true"
              />
              <h2 className={cardTitle}>
                {page.hours_heading ?? "Opening hours"}
              </h2>
              <dl className="flex flex-col gap-3 text-lg">
                {global.opening_hours.map((row) => (
                  <div key={row.days} className="flex flex-col">
                    <dt className="font-bold">{row.days}</dt>
                    <dd>{row.times}</dd>
                  </div>
                ))}
              </dl>
            </li>
          )}

          <li className="bg-pv-navy flex flex-col gap-5 rounded-4xl p-8 text-white lg:p-10">
            <MapPin
              className="text-pv-sky size-10"
              strokeWidth={1.8}
              aria-hidden="true"
            />
            <h2 className={cardTitle}>
              {page.area_heading ?? "Where we work"}
            </h2>
            {page.area_description && (
              <p className="text-pv-haze text-lg leading-normal">
                {page.area_description}
              </p>
            )}
            <Link
              href="/areas"
              className={cn(
                linkClass,
                "text-pv-sky text-lg underline",
                focusRing
              )}
            >
              See the towns we cover
            </Link>
          </li>
        </ul>
      </section>
    </>
  );
}
