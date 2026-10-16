import Link from "next/link";
import { Headline } from "@/components/site/headline";
import { focusRing } from "@/components/site/styles";
import { TrustBadges } from "@/components/site/trust-badges";
import type { TrustPoint } from "@/lib/directus";
import { editable } from "@/lib/editable";
import { cn } from "@/lib/utils";

export function AreasSection({
  pageId,
  globalId,
  annotation,
  title,
  description,
  ctaText,
  points,
}: {
  pageId: number;
  globalId: number | undefined;
  annotation: string | null;
  title: string | null;
  description: string | null;
  ctaText: string | null;
  points: TrustPoint[];
}) {
  return (
    <section
      id="areas"
      className="bg-pv-sky text-pv-navy scroll-mt-8 px-5 pt-24 pb-38 lg:px-12 lg:pt-30 lg:pb-44"
    >
      <div className="mx-auto grid max-w-336 items-center gap-14 lg:grid-cols-2 lg:gap-16">
        <div className="flex flex-col gap-7">
          {annotation && (
            <p
              data-directus={editable("home_page", pageId, "areas_annotation")}
              className="font-pv-hand -rotate-3 self-start text-4xl lg:text-[2.5rem]"
            >
              {annotation}
            </p>
          )}
          {title && (
            <h2
              data-directus={editable("home_page", pageId, "areas_heading")}
              className="font-pv-display text-[clamp(4rem,9vw,8rem)] leading-[0.86] font-extrabold tracking-[-0.015em] font-stretch-75%"
            >
              {/* On sky, accented words go white */}
              <Headline text={title} accentClassName="text-white" />
            </h2>
          )}
          {description && (
            <p
              data-directus={editable("home_page", pageId, "areas_description")}
              className="max-w-140 text-xl leading-normal font-medium lg:text-[1.375rem]"
            >
              {description}
            </p>
          )}
          {ctaText && (
            <Link
              href="/areas"
              data-directus={editable("home_page", pageId, "areas_cta_text")}
              className={cn(
                "bg-pv-navy hover:text-pv-navy flex h-15 items-center self-start rounded-full px-7 text-lg font-bold text-white transition-colors hover:bg-white",
                focusRing
              )}
            >
              {ctaText}
            </Link>
          )}
        </div>
        <TrustBadges
          points={points}
          editAttr={editable("global", globalId, "promises", "drawer")}
        />
      </div>
    </section>
  );
}
