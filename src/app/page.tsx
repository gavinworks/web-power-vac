import { Metadata } from "next";
import Image from "next/image";
import { Bricolage_Grotesque, Caveat } from "next/font/google";
import { ArrowRight, Mail, Phone } from "lucide-react";
import { getGlobal, getHomePage } from "@/lib/directus";
import { cn } from "@/lib/utils";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  axes: ["opsz", "wdth"],
  variable: "--font-pv-bricolage",
});

const caveat = Caveat({
  subsets: ["latin"],
  weight: "700",
  variable: "--font-pv-caveat",
});

const focusRing =
  "focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-pv-sky";

// Branch deploys and previews link through to the homepage prototype.
const showPrototypeLink = process.env.ENABLE_PROTOTYPES === "true";

export async function generateMetadata(): Promise<Metadata> {
  const homePage = await getHomePage();

  return {
    title: { absolute: homePage?.meta_title ?? "Home" },
    description: homePage?.meta_description ?? "",
  };
}

/**
 * Holding page until the full site launches. Copy comes from the home page
 * and global data, so it moves to Directus with those collections.
 */
export default async function Home() {
  const [homePage, global] = await Promise.all([getHomePage(), getGlobal()]);

  const phone = global?.phone;
  const email = global?.email_address;

  return (
    <main
      className={cn(
        bricolage.variable,
        caveat.variable,
        "relative isolate flex min-h-svh flex-col overflow-hidden bg-pv-ink font-pv-display text-white antialiased"
      )}
    >
      <div className="absolute inset-y-0 right-0 -z-20 w-full lg:w-[62%]">
        <Image
          src="/prototypes/power-vac-homepage/hero.jpg"
          alt=""
          fill
          priority
          sizes="(min-width: 1024px) 62vw, 100vw"
          className="object-cover object-[60%_50%] brightness-85 contrast-108 saturate-110"
        />
      </div>
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgb(5_13_24/0.94)_0%,rgb(5_13_24/0.8)_55%,rgb(5_13_24/0.5)_100%)] lg:bg-[linear-gradient(90deg,var(--color-pv-ink)_0%,var(--color-pv-ink)_38%,rgb(5_13_24/0.6)_55%,rgb(5_13_24/0.1)_80%)]"
      />

      <header className="mx-auto flex w-full max-w-336 items-center gap-3 px-5 pt-8 lg:px-12 lg:pt-10">
        <svg viewBox="0 0 58 44" aria-hidden="true" className="h-9 w-12">
          <path d="M4 24 L29 5 L54 24" fill="none" stroke="#ffffff" strokeWidth="5" strokeLinejoin="round" strokeLinecap="round" />
          <path d="M40 12 V4 H46 V17" fill="none" stroke="#ffffff" strokeWidth="4" />
          <rect x="24" y="19" width="10" height="10" rx="2" fill="var(--color-pv-sky)" />
          <path d="M8 34 H50 V38" fill="none" stroke="var(--color-pv-sky)" strokeWidth="4" strokeLinecap="round" />
        </svg>
        <span className="text-[1.75rem] font-extrabold font-stretch-80% tracking-[-0.01em]">
          power-vac
        </span>
      </header>

      <section className="mx-auto flex w-full max-w-336 flex-1 flex-col justify-center gap-8 px-5 py-16 lg:px-12">
        <p className="-rotate-4 self-start font-pv-hand text-3xl text-pv-sky lg:text-[2.5rem]">
          {global?.site_name ?? "Power-Vac Gutter Cleaning"}
        </p>
        <h1 className="max-w-4xl text-[clamp(3.5rem,9vw,8.5rem)] leading-[0.86] font-extrabold font-stretch-75% tracking-[-0.015em]">
          {homePage?.hero_heading ?? "Our new website is on its way."}
        </h1>
        {homePage?.hero_description && (
          <p className="max-w-150 text-lg leading-normal font-medium text-pv-haze lg:text-[1.375rem]">
            {homePage.hero_description}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-3.5">
          {homePage?.hero_cta_text && (
            <a
              href={homePage.hero_cta_link ?? "#"}
              className={cn(
                "flex h-17 items-center gap-3 rounded-full bg-pv-sky px-8.5 text-xl font-extrabold text-pv-navy transition-colors hover:bg-white",
                focusRing
              )}
            >
              <Phone className="size-5" strokeWidth={2.4} aria-hidden="true" />
              {homePage.hero_cta_text}
            </a>
          )}
          {email && (
            <a
              href={`mailto:${email}`}
              className={cn(
                "flex h-17 items-center gap-3 rounded-full border-2 border-white px-7.5 text-xl font-bold transition-colors hover:bg-white hover:text-pv-navy",
                focusRing
              )}
            >
              <Mail className="size-5" strokeWidth={2.2} aria-hidden="true" />
              Email us
            </a>
          )}
        </div>

        {showPrototypeLink && (
          <a
            href="/prototypes/power-vac-homepage"
            className={cn(
              "mt-4 flex max-w-xl items-center justify-between gap-6 self-start rounded-4xl bg-white p-6 text-pv-navy transition-transform hover:-translate-y-1 sm:p-7",
              focusRing
            )}
          >
            <span className="flex flex-col gap-1">
              <span className="text-sm font-bold text-pv-link">Design preview</span>
              <span className="text-[1.75rem] leading-none font-extrabold font-stretch-80% tracking-[-0.02em]">
                See the new homepage
              </span>
            </span>
            <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-pv-navy text-white">
              <ArrowRight className="size-6 motion-safe:animate-pv-nudge" strokeWidth={2.5} aria-hidden="true" />
            </span>
          </a>
        )}
      </section>

      <footer className="mx-auto flex w-full max-w-336 flex-col gap-2 px-5 pb-8 text-sm font-semibold text-pv-haze sm:flex-row sm:justify-between lg:px-12 lg:pb-10">
        <span>{global?.address ? `Based in ${global.address}` : null}</span>
        {phone && <span>{phone}</span>}
      </footer>
    </main>
  );
}
