import type { ReactNode } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Headline } from "./headline";
import { Leaf } from "./icons";
import { SiteHeader } from "./site-header";

/**
 * The dark opening band of every inner page: the homepage hero's language
 * (ink, hand-written annotation, condensed display type, photo fading into
 * the ink) at a shorter height. The next section overlaps its bottom edge.
 */
export function PageHero({
  annotation,
  heading,
  description,
  image,
  imageAlt,
  children,
  aside,
  edit,
}: {
  annotation?: string | null;
  heading: string;
  description?: string | null;
  image?: string | null;
  imageAlt?: string | null;
  /** Buttons or other content under the description. */
  children?: ReactNode;
  /** Content floated over the photo on large screens. */
  aside?: ReactNode;
  /** data-directus values for the visual editor, one per editable part. */
  edit?: {
    annotation?: string;
    heading?: string;
    description?: string;
    image?: string;
  };
}) {
  return (
    <section className="bg-pv-ink relative isolate overflow-hidden text-white">
      {image && (
        <>
          <div
            data-directus={edit?.image}
            className="absolute inset-y-0 right-0 -z-20 w-full lg:w-[62%]"
          >
            <Image
              src={image}
              alt={imageAlt ?? ""}
              fill
              priority
              sizes="(min-width: 1024px) 62vw, 100vw"
              className="object-cover object-[60%_50%] brightness-85 contrast-108 saturate-110"
            />
          </div>
          {/* Fade the photo into the ink so the headline always reads */}
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgb(5_13_24/0.94)_0%,rgb(5_13_24/0.8)_55%,rgb(5_13_24/0.55)_100%)] lg:bg-[linear-gradient(90deg,var(--color-pv-ink)_0%,var(--color-pv-ink)_38%,rgb(5_13_24/0.7)_52%,rgb(5_13_24/0.2)_78%,rgb(5_13_24/0.4)_100%)]"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgb(5_13_24/0.7)_0%,transparent_25%,transparent_70%,rgb(5_13_24/0.85)_100%)]"
          />
        </>
      )}

      <Leaf
        fill="var(--color-pv-leaf)"
        className="absolute top-44 right-[8%] hidden w-11 lg:block"
      />
      <Leaf
        fill="var(--color-pv-sky)"
        className="absolute bottom-24 left-8 w-9 lg:left-16"
      />

      <SiteHeader />

      <div className="mx-auto max-w-360 px-5 pt-40 pb-36 lg:px-12 lg:pt-56 lg:pb-44">
        <div className="flex max-w-190 flex-col gap-7 lg:gap-8">
          {annotation && (
            <p
              data-directus={edit?.annotation}
              className="font-pv-hand text-pv-sky -rotate-4 self-start text-3xl lg:text-[2.5rem]"
            >
              {annotation}
            </p>
          )}
          <h1
            data-directus={edit?.heading}
            className="font-pv-display text-[clamp(3.5rem,9vw,7.5rem)] leading-[0.86] font-extrabold tracking-[-0.015em] font-stretch-75%"
          >
            <Headline text={heading} />
          </h1>
          {description && (
            <p
              data-directus={edit?.description}
              className="text-pv-haze max-w-150 text-lg leading-normal font-medium lg:text-[1.375rem]"
            >
              {description}
            </p>
          )}
          {children}
        </div>
      </div>

      {aside && (
        <div className="absolute right-16 bottom-36 hidden w-105 lg:block xl:right-24 xl:w-120">
          {aside}
        </div>
      )}
    </section>
  );
}
