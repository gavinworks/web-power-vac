"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Phone } from "lucide-react";
import { DynamicIcon } from "@/components/shared/dynamic-icon";
import { BeforeAfterSlider } from "@/components/site/before-after-slider";
import { CameraMonitor } from "@/components/site/camera-monitor";
import { FaqList } from "@/components/site/faq-list";
import { Headline } from "@/components/site/headline";
import { Stars } from "@/components/site/stars";
import { QuoteForm } from "@/components/site/quote-section";
import { focusRing, heading, pill, telHref } from "@/components/site/styles";
import { LEGAL_LINKS } from "@/config/site";
import { useGlobal } from "@/context/GlobalContext";
import {
  getImageUrl,
  type BeforeAfterItem,
  type BeforeAfterPage,
  type CampaignPage,
  type Service,
} from "@/lib/directus";
import { editable } from "@/lib/editable";
import { cn } from "@/lib/utils";

const COLLECTION = "campaign_pages";

/**
 * A Google Ads landing page. Built from the research in
 * .docs/google-ads/2026-11-02-landing-page-research.md: the headline repeats
 * the ad, proof sits under it, calling and the form are equally easy, and
 * there's no menu to wander off through. Every claim on it must be true.
 */
export function CampaignView({
  page,
  services,
  beforeAfter,
  beforeAfterLabels,
}: {
  page: CampaignPage;
  services: Service[];
  beforeAfter: BeforeAfterItem | null;
  beforeAfterLabels: BeforeAfterPage | null;
}) {
  const { global, contact } = useGlobal();
  const edit = (fields: string | string[], mode?: "popover" | "drawer") =>
    editable(COLLECTION, page.id, fields, mode);
  const logo = getImageUrl(global?.logo ?? null);
  const heroImage = getImageUrl(page.hero_image);
  const camera = getImageUrl(page.hero_camera_image);
  const ownerImage = getImageUrl(page.owner_image);
  const before = beforeAfter && getImageUrl(beforeAfter.before_image);
  const after = beforeAfter && getImageUrl(beforeAfter.after_image);
  const tel = contact.phone ? telHref(contact.phone) : null;
  // Gutter cleaning and its add-ons: repairs and driveways are separate jobs
  const formServices = services
    .filter((s) => s.kind === "main" || s.kind === "add_on")
    .map((s) => s.form_label);

  // The sticky bar on phones only appears once the hero's own buttons have
  // scrolled away, so the two never show at once
  const heroActions = useRef<HTMLDivElement>(null);
  const [showBar, setShowBar] = useState(false);
  useEffect(() => {
    const el = heroActions.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) =>
      setShowBar(!entry.isIntersecting && entry.boundingClientRect.top < 0)
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const callButton = (className?: string) =>
    tel && (
      <a
        href={tel}
        className={cn(pill.sky, "justify-center", focusRing, className)}
      >
        <Phone className="size-5" strokeWidth={2.5} aria-hidden="true" />
        <span>
          {page.call_button_text}
          <span className="hidden sm:inline"> on {contact.phone}</span>
        </span>
      </a>
    );

  return (
    <>
      {/* Logo and phone only: no menu, so the page has one job */}
      <header className="bg-pv-ink px-5 pt-5 lg:px-12 lg:pt-7">
        <div className="mx-auto flex max-w-336 items-center justify-between gap-4">
          {logo && (
            <Image
              src={logo}
              alt={global?.site_name ?? "Power-Vac Gutter Cleaning"}
              width={480}
              height={468}
              loading="eager"
              sizes="(min-width: 1024px) 96px, 72px"
              className="h-auto w-18 lg:w-24"
            />
          )}
          {tel && (
            <a
              href={tel}
              className={cn(
                "text-pv-sky flex items-center gap-2.5 rounded-full text-xl font-extrabold whitespace-nowrap hover:text-white lg:text-2xl",
                focusRing
              )}
            >
              <Phone className="size-5" strokeWidth={2.5} aria-hidden="true" />
              {contact.phone}
            </a>
          )}
        </div>
      </header>

      <main>
        {/* Hero: the ad's promise, the proof, then the two ways to get in touch */}
        <section className="bg-pv-ink overflow-hidden px-5 pt-10 pb-16 text-white lg:px-12 lg:pt-14 lg:pb-24">
          <div className="mx-auto grid max-w-336 items-center gap-12 lg:grid-cols-[minmax(0,1fr)_28rem] lg:gap-16 xl:grid-cols-[minmax(0,1fr)_32rem]">
            <div className="flex flex-col gap-7">
              {page.hero_heading && (
                <h1
                  data-directus={edit("hero_heading")}
                  className="font-pv-display text-[clamp(3.5rem,9vw,8rem)] leading-[0.86] font-extrabold tracking-[-0.015em] font-stretch-75%"
                >
                  <Headline text={page.hero_heading} />
                </h1>
              )}
              {page.hero_description && (
                <p
                  data-directus={edit("hero_description")}
                  className="text-pv-haze max-w-145 text-xl leading-normal font-medium lg:text-[1.375rem]"
                >
                  {page.hero_description}
                </p>
              )}

              {page.rating && (
                <div
                  data-directus={edit(
                    [
                      "rating",
                      "rating_count",
                      "rating_source",
                      "rating_url",
                      "proof_points",
                    ],
                    "drawer"
                  )}
                  className="flex flex-col gap-2.5"
                >
                  <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-lg font-bold">
                    <Stars className="text-pv-leaf" />
                    <span>
                      {page.rating} from {page.rating_count} reviews on{" "}
                      {page.rating_url ? (
                        <a
                          href={page.rating_url}
                          target="_blank"
                          rel="noopener"
                          className={cn(
                            "hover:text-pv-sky rounded-sm underline underline-offset-4",
                            focusRing
                          )}
                        >
                          {page.rating_source}
                        </a>
                      ) : (
                        page.rating_source
                      )}
                    </span>
                  </p>
                  {page.proof_points && page.proof_points.length > 0 && (
                    <ul className="text-pv-haze flex flex-col gap-1 text-lg">
                      {page.proof_points.map((point) => (
                        <li key={point} className="flex items-start gap-2.5">
                          <DynamicIcon
                            name="CircleCheck"
                            className="text-pv-sky mt-1 size-5 shrink-0"
                          />
                          {point}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              <div
                ref={heroActions}
                className="flex flex-col gap-3 sm:flex-row sm:flex-wrap"
              >
                {callButton()}
                {page.quote_button_text && (
                  <Link
                    data-directus={edit([
                      "call_button_text",
                      "quote_button_text",
                    ])}
                    href="#quote"
                    className={cn(pill.outline, "justify-center", focusRing)}
                  >
                    {page.quote_button_text}
                  </Link>
                )}
              </div>
            </div>

            {/* Tommy's own photo, with the camera screen the customer watches */}
            {heroImage && (
              <div className="relative mx-auto w-full max-w-md lg:max-w-none">
                <div
                  data-directus={edit(
                    ["hero_image", "hero_image_alt"],
                    "drawer"
                  )}
                  className="relative aspect-3/4 overflow-hidden rounded-[2.5rem]"
                >
                  <Image
                    src={heroImage}
                    alt={page.hero_image_alt ?? ""}
                    fill
                    loading="eager"
                    sizes="(min-width: 1280px) 512px, (min-width: 1024px) 448px, 448px"
                    className="object-cover"
                  />
                </div>
                {camera && (
                  <CameraMonitor
                    editAttr={edit(
                      ["hero_camera_image", "hero_camera_image_alt"],
                      "drawer"
                    )}
                    priority
                    src={camera}
                    alt={page.hero_camera_image_alt ?? ""}
                    sizes="(min-width: 1024px) 288px, 240px"
                    className="absolute -bottom-6 -left-3 w-60 -rotate-3 sm:-left-10 lg:-left-24 lg:w-72"
                  />
                )}
                {page.hero_note && (
                  <p
                    data-directus={edit("hero_note")}
                    className="font-pv-hand text-pv-navy bg-pv-sky absolute top-6 -right-2 rotate-4 rounded-full px-5 py-2 text-[1.75rem] leading-none lg:-right-6"
                  >
                    {page.hero_note}
                  </p>
                )}
              </div>
            )}
          </div>
        </section>

        {/* How it works: a real sequence, so it's numbered */}
        {page.steps && page.steps.length > 0 && (
          <section className="bg-pv-mist px-5 py-20 lg:px-12 lg:py-28">
            <div className="mx-auto flex max-w-336 flex-col gap-12">
              {page.steps_heading && (
                <h2
                  data-directus={edit("steps_heading")}
                  className={heading.section}
                >
                  <Headline
                    text={page.steps_heading}
                    accentClassName="text-pv-link"
                  />
                </h2>
              )}
              <ol
                data-directus={edit("steps", "drawer")}
                className="grid gap-5 md:grid-cols-3"
              >
                {page.steps.map((step, i) => (
                  <li
                    key={step.title}
                    className="flex flex-col gap-3 rounded-4xl bg-white p-7 lg:p-9"
                  >
                    <span className="bg-pv-navy flex size-12 items-center justify-center rounded-full text-xl font-extrabold text-white">
                      {i + 1}
                    </span>
                    <h3 className={heading.card}>{step.title}</h3>
                    <p className="text-lg leading-normal">{step.body}</p>
                  </li>
                ))}
              </ol>
            </div>
          </section>
        )}

        {/* Before and after */}
        {beforeAfter && before && after && (
          <section className="bg-white px-5 py-20 lg:px-12 lg:py-28">
            <div className="mx-auto flex max-w-336 flex-col gap-10">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between lg:gap-12">
                {page.before_after_heading && (
                  <h2
                    data-directus={edit("before_after_heading")}
                    className={heading.section}
                  >
                    <Headline
                      text={page.before_after_heading}
                      accentClassName="text-pv-link"
                    />
                  </h2>
                )}
                {page.before_after_description && (
                  <p
                    data-directus={edit("before_after_description")}
                    className="max-w-120 text-xl leading-normal"
                  >
                    {page.before_after_description}
                  </p>
                )}
              </div>
              <BeforeAfterSlider
                beforeSrc={before}
                beforeAlt={beforeAfter.before_image_alt ?? ""}
                afterSrc={after}
                afterAlt={beforeAfter.after_image_alt ?? ""}
                isExample={beforeAfter.is_example}
                label={beforeAfter.title}
                labels={beforeAfterLabels}
              />
            </div>
          </section>
        )}

        {/* Reviews beside the form: proof where the decision is made */}
        <section
          id="quote"
          className="bg-pv-navy scroll-mt-4 px-5 py-20 text-white lg:px-12 lg:py-28"
        >
          {/* Phones: heading, form, then reviews. Desktop: reviews under the heading, form beside them */}
          <div className="mx-auto grid max-w-336 items-start gap-10 lg:grid-cols-[minmax(0,1fr)_40rem] lg:gap-x-16">
            <div className="flex flex-col gap-5 lg:col-start-1 lg:row-start-1">
              {page.form_heading && (
                <h2
                  data-directus={edit("form_heading")}
                  className={heading.section}
                >
                  <Headline text={page.form_heading} />
                </h2>
              )}
              {page.form_description && (
                <p
                  data-directus={edit("form_description")}
                  className="text-pv-haze max-w-120 text-xl leading-normal"
                >
                  {page.form_description}
                </p>
              )}
              {tel && (
                <p className="text-xl">
                  Rather talk?{" "}
                  <a
                    href={tel}
                    className={cn(
                      "text-pv-sky rounded-sm font-extrabold underline underline-offset-4 hover:text-white",
                      focusRing
                    )}
                  >
                    Call {contact.phone}
                  </a>
                </p>
              )}
            </div>

            <QuoteForm
              services={formServices}
              preselect={page.form_preselect ?? undefined}
              askEmail={false}
              className="lg:col-start-2 lg:row-span-2 lg:row-start-1"
            />

            {page.reviews && page.reviews.length > 0 && (
              <div
                data-directus={edit(["reviews_heading", "reviews"], "drawer")}
                className="flex flex-col gap-5 lg:col-start-1 lg:row-start-2"
              >
                {page.reviews_heading && (
                  <h3 className={cn(heading.card, "text-4xl")}>
                    <Headline text={page.reviews_heading} />
                  </h3>
                )}
                <ul className="flex flex-col gap-4">
                  {page.reviews.map((review) => (
                    <li key={review.name + review.date}>
                      <figure className="bg-pv-navy-soft flex flex-col gap-3 rounded-4xl p-6 lg:p-7">
                        <Stars className="text-pv-leaf" />
                        <blockquote className="text-xl leading-normal font-medium">
                          “{review.quote}”
                        </blockquote>
                        <figcaption className="text-pv-haze text-base">
                          {review.name}, {review.date}, on {page.rating_source}
                        </figcaption>
                      </figure>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>

        {/* Promises and the person behind them */}
        <section className="bg-pv-mist px-5 py-20 lg:px-12 lg:py-28">
          <div className="mx-auto grid max-w-336 items-center gap-14 lg:grid-cols-2 lg:gap-20">
            <div className="flex flex-col gap-12">
              {page.promises && page.promises.length > 0 && (
                <div
                  data-directus={edit(
                    ["promises_heading", "promises"],
                    "drawer"
                  )}
                  className="flex flex-col gap-7"
                >
                  {page.promises_heading && (
                    <h2 className={heading.section}>
                      <Headline
                        text={page.promises_heading}
                        accentClassName="text-pv-link"
                      />
                    </h2>
                  )}
                  <ul className="flex flex-col gap-4">
                    {page.promises.map((promise) => (
                      <li
                        key={promise.label}
                        className="flex items-center gap-4 text-xl font-bold"
                      >
                        <span className="bg-pv-navy flex size-12 shrink-0 items-center justify-center rounded-full">
                          <DynamicIcon
                            name={promise.icon}
                            className="text-pv-sky size-6"
                          />
                        </span>
                        {promise.label}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {(page.owner_heading || page.owner_body) && (
                <div
                  data-directus={edit(
                    ["owner_heading", "owner_body"],
                    "drawer"
                  )}
                  className="flex flex-col gap-4"
                >
                  {page.owner_heading && (
                    <h2 className={cn(heading.card, "text-4xl lg:text-5xl")}>
                      <Headline
                        text={page.owner_heading}
                        accentClassName="text-pv-link"
                      />
                    </h2>
                  )}
                  {page.owner_body && (
                    <p className="max-w-130 text-xl leading-normal">
                      {page.owner_body}
                    </p>
                  )}
                </div>
              )}
            </div>
            {ownerImage && (
              <div
                data-directus={edit(
                  ["owner_image", "owner_image_alt"],
                  "drawer"
                )}
                className="relative mx-auto aspect-3/4 w-full max-w-md overflow-hidden rounded-[2.5rem] lg:max-w-lg"
              >
                <Image
                  src={ownerImage}
                  alt={page.owner_image_alt ?? ""}
                  fill
                  sizes="(min-width: 1024px) 512px, 448px"
                  className="object-cover"
                />
              </div>
            )}
          </div>
        </section>

        {/* Areas and quick questions */}
        <section className="bg-pv-navy px-5 py-20 text-white lg:px-12 lg:py-28">
          <div className="mx-auto grid max-w-336 gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] lg:gap-20">
            {page.areas && (
              <div
                data-directus={edit(["areas_heading", "areas"], "drawer")}
                className="flex flex-col gap-5"
              >
                {page.areas_heading && (
                  <h2 className={heading.section}>
                    <Headline text={page.areas_heading} />
                  </h2>
                )}
                <p className="text-pv-haze max-w-130 text-xl leading-normal">
                  {page.areas}
                </p>
              </div>
            )}
            {page.faqs && page.faqs.length > 0 && (
              <div className="flex flex-col gap-6">
                {page.faqs_heading && (
                  <h2
                    data-directus={edit("faqs_heading")}
                    className={cn(heading.card, "text-4xl")}
                  >
                    <Headline text={page.faqs_heading} />
                  </h2>
                )}
                <FaqList faqs={page.faqs} editAttr={edit("faqs", "drawer")} />
              </div>
            )}
          </div>
        </section>
      </main>

      <footer className="bg-pv-sky text-pv-navy px-5 pt-10 pb-30 lg:px-12 lg:pb-10">
        <div className="mx-auto flex max-w-336 flex-col gap-4 text-lg font-semibold sm:flex-row sm:items-center sm:justify-between">
          <p>{global?.site_name ?? "Power-Vac Gutter Cleaning"}, Norwich</p>
          <ul className="flex gap-6">
            {LEGAL_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={cn(
                    "rounded-sm underline underline-offset-4 hover:text-white",
                    focusRing
                  )}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </footer>

      {/* Phones: calling or asking for a quote is always one tap away */}
      <div
        inert={!showBar}
        className={cn(
          "bg-pv-ink/95 fixed inset-x-0 bottom-0 z-30 grid grid-cols-2 gap-2.5 border-t border-white/15 p-3 backdrop-blur-md transition-transform duration-300 motion-reduce:transition-none lg:hidden",
          !showBar && "translate-y-full"
        )}
      >
        {tel && (
          <a
            href={tel}
            className={cn(
              "bg-pv-sky text-pv-navy flex h-14 items-center justify-center gap-2 rounded-full text-lg font-extrabold",
              focusRing
            )}
          >
            <Phone className="size-5" strokeWidth={2.5} aria-hidden="true" />
            {page.call_button_text}
          </a>
        )}
        <Link
          href="#quote"
          className={cn(
            "flex h-14 items-center justify-center rounded-full border-2 border-white text-lg font-bold text-white",
            !tel && "col-span-2",
            focusRing
          )}
        >
          {page.quote_button_text}
        </Link>
      </div>
    </>
  );
}
