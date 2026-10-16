"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { CameraMonitor } from "@/components/site/camera-monitor";
import { Headline } from "@/components/site/headline";
import { Leaf } from "@/components/site/icons";
import { SiteHeader } from "@/components/site/site-header";
import { focusRing, pill } from "@/components/site/styles";
import { useGlobal } from "@/context/GlobalContext";
import { getImageUrl, type HomePage } from "@/lib/directus";
import { editable } from "@/lib/editable";
import { cn } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1] as const;

export function Hero({ page }: { page: HomePage }) {
  const reduce = useReducedMotion();
  const { global } = useGlobal();
  const image = getImageUrl(page.hero_image);
  const camera = getImageUrl(page.hero_camera_image);
  const headingLines = (page.hero_heading ?? "").split("\n");
  const edit = (fields: string | string[], mode?: "popover" | "drawer") =>
    editable("home_page", page.id, fields, mode);

  // One orchestrated load sequence: copy rises line by line, then the price sticker lands.
  const rise: Variants = {
    hidden: reduce ? { opacity: 1 } : { opacity: 0, y: 36 },
    show: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: reduce
        ? { duration: 0 }
        : { duration: 0.8, ease: EASE, delay: 0.15 + i * 0.1 },
    }),
  };

  const monitor = camera && (
    <CameraMonitor
      editAttr={edit(["hero_camera_image", "hero_camera_image_alt"], "drawer")}
      src={camera}
      alt={page.hero_camera_image_alt ?? ""}
      priority
      sizes="(min-width: 1280px) 480px, (min-width: 1024px) 420px, 384px"
    />
  );

  return (
    <section className="bg-pv-ink relative isolate min-h-212 overflow-hidden text-white lg:min-h-250">
      {image && (
        <div
          data-directus={edit(["hero_image", "hero_image_alt"], "drawer")}
          className="absolute inset-y-0 right-0 -z-20 w-full lg:w-[69.5%]"
        >
          <Image
            src={image}
            alt={page.hero_image_alt ?? ""}
            fill
            priority
            sizes="(min-width: 1024px) 70vw, 100vw"
            className="object-cover object-[60%_50%] brightness-85 contrast-108 saturate-110"
          />
        </div>
      )}
      {/* Fade the photo into the ink so the headline always reads */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgb(5_13_24/0.92)_0%,rgb(5_13_24/0.72)_50%,rgb(5_13_24/0.4)_100%)] lg:bg-[linear-gradient(90deg,var(--color-pv-ink)_0%,var(--color-pv-ink)_31%,rgb(5_13_24/0.7)_45%,rgb(5_13_24/0.15)_68%,rgb(5_13_24/0.35)_100%)]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgb(5_13_24/0.7)_0%,transparent_22%,transparent_70%,rgb(5_13_24/0.85)_100%)]"
      />

      <Leaf
        fill="var(--color-pv-leaf)"
        className="absolute top-42.5 left-[48.6%] hidden w-11 lg:block"
      />
      <Leaf
        fill="var(--color-pv-leaf)"
        className="absolute bottom-27 left-[42.4%] hidden w-11 lg:block"
      />
      <Leaf
        fill="var(--color-pv-sky)"
        className="absolute bottom-16 left-22 w-10"
      />

      <SiteHeader />

      <div className="mx-auto max-w-360 px-5 pt-40 pb-72 lg:px-12 lg:pt-50 lg:pb-24">
        <div className="flex max-w-190 flex-col gap-7 lg:gap-8">
          {page.hero_annotation && (
            <motion.p
              variants={rise}
              initial="hidden"
              animate="show"
              custom={0}
              data-directus={edit("hero_annotation")}
              className="font-pv-hand text-pv-sky -rotate-4 self-start text-3xl lg:text-[2.5rem]"
            >
              {page.hero_annotation}
            </motion.p>
          )}
          <h1
            data-directus={edit("hero_heading")}
            className="font-pv-display text-[clamp(3.75rem,10.4vw,9.375rem)] leading-[0.86] font-extrabold tracking-[-0.015em] font-stretch-75%"
          >
            {headingLines.map((line, i) => (
              <motion.span
                key={i}
                variants={rise}
                initial="hidden"
                animate="show"
                custom={i + 1}
                className="block"
              >
                <Headline text={line} />
              </motion.span>
            ))}
          </h1>
          {monitor && (
            <motion.div
              variants={rise}
              initial="hidden"
              animate="show"
              custom={headingLines.length + 1}
              className="max-w-sm -rotate-2 lg:hidden"
            >
              {monitor}
            </motion.div>
          )}
          {page.hero_description && (
            <motion.p
              variants={rise}
              initial="hidden"
              animate="show"
              custom={headingLines.length + 2}
              data-directus={edit("hero_description")}
              className="text-pv-haze max-w-150 text-lg leading-normal font-medium lg:text-[1.375rem]"
            >
              {page.hero_description}
            </motion.p>
          )}
          <motion.div
            variants={rise}
            initial="hidden"
            animate="show"
            custom={headingLines.length + 3}
            className="flex flex-wrap items-center gap-3.5"
          >
            {page.hero_cta_text && (
              <Link
                data-directus={edit(["hero_cta_text", "hero_cta_link"])}
                href={page.hero_cta_link ?? "#quote"}
                className={cn(pill.sky, focusRing)}
              >
                {page.hero_cta_text}
                <ArrowRight
                  className="size-5"
                  strokeWidth={2.5}
                  aria-hidden="true"
                />
              </Link>
            )}
            {page.hero_secondary_cta_text && (
              <Link
                data-directus={edit([
                  "hero_secondary_cta_text",
                  "hero_secondary_cta_link",
                ])}
                href={page.hero_secondary_cta_link ?? "/services"}
                className={cn(pill.outline, focusRing)}
              >
                {page.hero_secondary_cta_text}
              </Link>
            )}
          </motion.div>
        </div>
      </div>

      {/* Desktop: the live feed sits over the photo, where the eye lands after the headline */}
      {monitor && (
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 40, rotate: 8 }}
          animate={{ opacity: 1, y: 0, rotate: 3 }}
          transition={
            reduce ? { duration: 0 } : { duration: 0.9, ease: EASE, delay: 0.6 }
          }
          className="absolute top-56 right-16 hidden w-105 lg:block xl:right-24 xl:w-120"
        >
          {monitor}
        </motion.div>
      )}
      {page.hero_camera_note && (
        <div
          aria-hidden="true"
          data-directus={edit("hero_camera_note")}
          className="absolute top-140 right-90 hidden w-85 lg:block xl:top-150 xl:right-110"
        >
          <svg viewBox="0 0 200 120" className="mb-1 ml-30 w-40 text-white">
            <path
              d="M4 116 C 60 100, 150 70, 190 6"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <path
              d="M190 6 l-20 8 M190 6 l2 21"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
          <p className="font-pv-hand -rotate-6 text-[2.125rem] leading-none">
            {page.hero_camera_note}
          </p>
        </div>
      )}

      {global?.price_from && (
        <motion.div
          initial={reduce ? false : { opacity: 0, scale: 0.6, rotate: -50 }}
          animate={{ opacity: 1, scale: 1, rotate: -10 }}
          transition={
            reduce
              ? { duration: 0 }
              : { type: "spring", stiffness: 140, damping: 14, delay: 0.85 }
          }
          data-directus={editable(
            "global",
            global.id,
            ["price_prefix", "price_from", "sticker_text"],
            "drawer"
          )}
          className="bg-pv-sky text-pv-navy absolute right-5 bottom-20 flex size-40 items-center justify-center rounded-full lg:right-27.5 lg:bottom-22.5 lg:size-62.5"
        >
          {global.sticker_text && (
            <svg
              viewBox="0 0 250 250"
              aria-hidden="true"
              className="absolute inset-0 size-full"
            >
              <defs>
                <path
                  id="pv-ring"
                  d="M125 125 m-100 0 a100 100 0 1 1 200 0 a100 100 0 1 1 -200 0"
                />
              </defs>
              <text
                className="font-pv-display"
                fontSize="17"
                fontWeight="700"
                letterSpacing="3"
                fill="currentColor"
              >
                <textPath href="#pv-ring">
                  {global.sticker_text} {global.sticker_text}
                </textPath>
              </text>
            </svg>
          )}
          <p className="flex flex-col items-center leading-none">
            <span className="text-xs font-semibold lg:text-lg">
              {global.price_prefix}
            </span>
            <span className="font-pv-display text-[2.5rem] font-extrabold font-stretch-75% lg:text-[3.875rem]">
              {global.price_from}
            </span>
          </p>
        </motion.div>
      )}
    </section>
  );
}
