import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Phone } from "lucide-react";
import { serviceHref } from "@/components/home/services-grid";
import { DynamicIcon } from "@/components/shared/dynamic-icon";
import { CameraMonitor } from "@/components/site/camera-monitor";
import { FaqList } from "@/components/site/faq-list";
import { Headline } from "@/components/site/headline";
import { PageHero } from "@/components/site/page-hero";
import { QuoteSection } from "@/components/site/quote-section";
import { RichText } from "@/components/site/rich-text";
import { focusRing, heading, pill, telHref } from "@/components/site/styles";
import {
  getGlobal,
  getHomePage,
  getImageUrl,
  getService,
  getServices,
} from "@/lib/directus";
import { cn } from "@/lib/utils";

interface ServicePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const services = await getServices();
  return services.filter((s) => s.has_page).map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: ServicePageProps): Promise<Metadata> {
  const { slug } = await params;
  const service = await getService(slug);
  if (!service) return {};
  return {
    title: service.meta_title ?? service.title,
    description: service.meta_description ?? service.card_summary ?? undefined,
    alternates: { canonical: `/services/${service.slug}` },
  };
}

export default async function ServicePage({ params }: ServicePageProps) {
  const { slug } = await params;
  const [service, services, global, home] = await Promise.all([
    getService(slug),
    getServices(),
    getGlobal(),
    getHomePage(),
  ]);

  if (!service) notFound();

  const isMain = service.kind === "main";
  const camera = getImageUrl(home?.hero_camera_image ?? null);
  const others = services.filter((s) => s.id !== service.id);

  return (
    <>
      <PageHero
        annotation={service.hero_annotation}
        heading={service.hero_heading ?? service.title}
        description={service.hero_description}
        image={getImageUrl(service.hero_image)}
        imageAlt={service.hero_image_alt}
        // The camera is what sets Power-Vac apart, so the main service shows it up top
        aside={
          isMain && camera ? (
            <CameraMonitor
              src={camera}
              alt={home?.hero_camera_image_alt ?? ""}
              sizes="(min-width: 1280px) 480px, 420px"
              className="rotate-3"
            />
          ) : undefined
        }
      >
        <div className="flex flex-wrap items-center gap-3.5">
          <Link href="#quote" className={cn(pill.sky, focusRing)}>
            Get my free quote
            <ArrowRight
              className="size-5"
              strokeWidth={2.5}
              aria-hidden="true"
            />
          </Link>
        </div>
      </PageHero>

      <section className="bg-pv-mist relative z-10 -mt-14 rounded-t-[3.5rem] px-5 pt-20 pb-24 lg:px-12 lg:pt-27.5 lg:pb-30">
        <div className="mx-auto grid max-w-336 items-start gap-12 lg:grid-cols-[1fr_26rem] lg:gap-20">
          {service.body && <RichText html={service.body} />}

          {/* Price and contact card stays in view while reading on large screens */}
          <aside className="bg-pv-navy flex flex-col gap-6 rounded-[2.5rem] p-8 text-white lg:sticky lg:top-8 lg:p-10">
            <DynamicIcon name={service.icon} className="text-pv-sky size-12" />
            {service.price_from ? (
              <p className="flex flex-col leading-none">
                <span className="text-pv-haze text-xl font-semibold">
                  from just
                </span>
                <span className="font-pv-display text-pv-sky text-[5.5rem] font-extrabold tracking-[-0.01em] font-stretch-75%">
                  {service.price_from}
                </span>
              </p>
            ) : (
              <p className="font-pv-display text-4xl leading-none font-extrabold tracking-[-0.01em] font-stretch-80%">
                {service.kind === "add_on"
                  ? "Add it to your gutter clean"
                  : "Ask us about it"}
              </p>
            )}
            <p className="text-pv-haze text-lg leading-normal">
              {service.price_from
                ? "Every home is different, so we start with a free, no-obligation quote."
                : "The price depends on your property, so we’ll include it in your free, no-obligation quote."}
            </p>
            <div className="flex flex-col gap-3">
              <Link
                href="#quote"
                className={cn(
                  pill.sky,
                  "h-15 justify-center text-lg",
                  focusRing
                )}
              >
                Get my free quote
              </Link>
              {global?.phone && (
                <a
                  href={telHref(global.phone)}
                  className={cn(
                    pill.outline,
                    "h-15 justify-center gap-2.5 text-lg",
                    focusRing
                  )}
                >
                  <Phone
                    className="size-4.5"
                    strokeWidth={2.4}
                    aria-hidden="true"
                  />
                  {global.phone}
                </a>
              )}
            </div>
          </aside>
        </div>
      </section>

      {service.benefits && service.benefits.length > 0 && (
        <section className="bg-pv-navy px-5 pt-24 pb-28 text-white lg:px-12 lg:pt-30 lg:pb-36">
          <div className="mx-auto flex max-w-336 flex-col gap-12">
            {service.benefits_heading && (
              <h2 className={heading.section}>
                <Headline text={service.benefits_heading} />
              </h2>
            )}
            <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {service.benefits.map((benefit, i) => (
                <li
                  key={benefit.title}
                  className={cn(
                    "flex min-h-64 flex-col justify-end gap-3 rounded-4xl p-8",
                    i === 2 ? "bg-pv-sky text-pv-navy" : "bg-pv-navy-soft"
                  )}
                >
                  <h3 className={heading.card}>{benefit.title}</h3>
                  <p
                    className={cn(
                      "text-lg leading-normal",
                      i !== 2 && "text-pv-haze"
                    )}
                  >
                    {benefit.body}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <section
        className={cn(
          "bg-pv-mist relative px-5 pt-20 pb-24 lg:px-12 lg:pt-27.5 lg:pb-30",
          service.benefits?.length && "-mt-14 rounded-t-[3.5rem]"
        )}
      >
        <div className="mx-auto flex max-w-336 flex-col gap-20">
          {service.faqs && service.faqs.length > 0 && (
            <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr] lg:gap-16">
              <h2 className={heading.section}>
                Questions<span className="text-pv-link">?</span>
              </h2>
              <FaqList faqs={service.faqs} />
            </div>
          )}

          {others.length > 0 && (
            <nav aria-label="Other services" className="flex flex-col gap-6">
              <p className="font-pv-hand text-pv-link -rotate-2 self-start text-3xl lg:text-4xl">
                while we’re up there
              </p>
              <ul className="flex flex-wrap gap-3">
                {others.map((other) => (
                  <li key={other.id}>
                    <Link
                      href={serviceHref(other)}
                      className={cn(
                        "hover:bg-pv-navy flex h-15 items-center gap-3 rounded-full bg-white px-6 text-lg font-bold transition-colors hover:text-white",
                        focusRing
                      )}
                    >
                      <DynamicIcon
                        name={other.icon}
                        className="text-pv-link size-5"
                      />
                      {other.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          )}
        </div>
      </section>

      <QuoteSection
        services={services.map((s) => s.form_label)}
        preselect={service.form_label}
      />
    </>
  );
}
