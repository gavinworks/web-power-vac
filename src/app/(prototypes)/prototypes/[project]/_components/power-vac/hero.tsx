"use client";

import Image from "next/image";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { SiteHeader } from "./site-header";
import { ASSETS, Leaf, focusRing } from "./shared";
import { PrototypeLink } from "./prototype-link";

const EASE = [0.22, 1, 0.36, 1] as const;

export function Hero() {
  const reduce = useReducedMotion();

  // One orchestrated load sequence: copy rises line by line, then the price sticker lands.
  const rise: Variants = {
    hidden: reduce ? { opacity: 1 } : { opacity: 0, y: 36 },
    show: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: reduce ? { duration: 0 } : { duration: 0.8, ease: EASE, delay: 0.15 + i * 0.1 },
    }),
  };

  return (
    <section className="relative isolate min-h-212 overflow-hidden bg-pv-ink text-white lg:min-h-250">
      <div className="absolute inset-y-0 right-0 -z-20 w-full lg:w-[69.5%]">
        <Image
          src={`${ASSETS}/hero.jpg`}
          alt="A SkyVac vacuum pole reaching into a gutter full of leaves and moss"
          fill
          priority
          sizes="(min-width: 1024px) 70vw, 100vw"
          className="object-cover object-[60%_50%] brightness-85 contrast-108 saturate-110"
        />
      </div>
      {/* Fade the photo into the ink so the headline always reads */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgb(5_13_24/0.92)_0%,rgb(5_13_24/0.72)_50%,rgb(5_13_24/0.4)_100%)] lg:bg-[linear-gradient(90deg,var(--color-pv-ink)_0%,var(--color-pv-ink)_31%,rgb(5_13_24/0.7)_45%,rgb(5_13_24/0.15)_68%,rgb(5_13_24/0.35)_100%)]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgb(5_13_24/0.7)_0%,transparent_22%,transparent_70%,rgb(5_13_24/0.85)_100%)]"
      />

      <Leaf fill="var(--color-pv-leaf)" className="absolute top-42.5 left-[48.6%] hidden w-11 lg:block" />
      <Leaf fill="var(--color-pv-leaf)" className="absolute bottom-27 left-[42.4%] hidden w-11 lg:block" />
      <Leaf fill="var(--color-pv-sky)" className="absolute bottom-16 left-22 w-10" />

      <SiteHeader />

      <div className="mx-auto max-w-360 px-5 pt-40 pb-72 lg:px-12 lg:pt-50 lg:pb-24">
        <div className="flex max-w-190 flex-col gap-7 lg:gap-8">
          <motion.p
            variants={rise}
            initial="hidden"
            animate="show"
            custom={0}
            className="-rotate-4 self-start font-pv-hand text-3xl text-pv-sky lg:text-[2.5rem]"
          >
            Norwich&rsquo;s gutter vacuum people
          </motion.p>
          <h1 className="font-pv-display text-[clamp(3.75rem,10.4vw,9.375rem)] leading-[0.86] font-extrabold font-stretch-75% tracking-[-0.015em]">
            {["Gutters cleared.", "Ladders", "not required."].map((line, i) => (
              <motion.span
                key={line}
                variants={rise}
                initial="hidden"
                animate="show"
                custom={i + 1}
                className={cn("block", i === 1 && "text-pv-sky")}
              >
                {line}
              </motion.span>
            ))}
          </h1>
          <motion.p
            variants={rise}
            initial="hidden"
            animate="show"
            custom={4}
            className="max-w-150 text-lg leading-normal font-medium text-pv-haze lg:text-[1.375rem]"
          >
            We vacuum the leaves, moss and muck out of your gutters from the
            ground. No ladders, no mess, and before &amp; after photos so you
            can see the difference.
          </motion.p>
          <motion.div
            variants={rise}
            initial="hidden"
            animate="show"
            custom={5}
            className="flex flex-wrap items-center gap-3.5"
          >
            <a
              href="#quote"
              className={cn(
                "flex h-17 items-center gap-3 rounded-full bg-pv-sky px-8.5 text-xl font-extrabold text-pv-navy transition-colors hover:bg-white",
                focusRing
              )}
            >
              Get my free quote
              <ArrowRight className="size-5" strokeWidth={2.5} aria-hidden="true" />
            </a>
            <PrototypeLink
              href="/services"
              page="Services"
              className={cn(
                "flex h-17 items-center rounded-full border-2 border-white px-7.5 text-xl font-bold transition-colors hover:bg-white hover:text-pv-navy",
                focusRing
              )}
            >
              Our services
            </PrototypeLink>
          </motion.div>
        </div>
      </div>

      {/* SkyVac annotation, desktop only: the arrow points at the pole in the photo */}
      <div aria-hidden="true" className="absolute top-59 right-10 hidden w-62.5 lg:block">
        <p className="-rotate-6 font-pv-hand text-[2.125rem] leading-none">
          meet the SkyVac: our ladder-free secret
        </p>
        <svg viewBox="0 0 200 160" className="mt-2 -ml-35 w-50 text-white">
          <path d="M196 4 C 150 66, 60 106, 4 150" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          <path d="M4 150 l22 -2 M4 150 l6 -20" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>
      </div>

      <motion.div
        initial={reduce ? false : { opacity: 0, scale: 0.6, rotate: -50 }}
        animate={{ opacity: 1, scale: 1, rotate: -10 }}
        transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 140, damping: 14, delay: 0.85 }}
        className="absolute right-5 bottom-20 flex size-40 items-center justify-center rounded-full bg-pv-sky text-pv-navy lg:right-27.5 lg:bottom-22.5 lg:size-62.5"
      >
        <svg viewBox="0 0 250 250" aria-hidden="true" className="absolute inset-0 size-full">
          <defs>
            <path id="pv-ring" d="M125 125 m-100 0 a100 100 0 1 1 200 0 a100 100 0 1 1 -200 0" />
          </defs>
          <text className="font-pv-display" fontSize="17" fontWeight="700" letterSpacing="3" fill="currentColor">
            <textPath href="#pv-ring">NO LADDERS • NO MESS • JUST RESULTS • NO LADDERS • </textPath>
          </text>
        </svg>
        <p className="flex flex-col items-center leading-none">
          <span className="text-xs font-semibold lg:text-lg">from just</span>
          <span className="font-pv-display text-[2.5rem] font-extrabold font-stretch-75% lg:text-[3.875rem]">
            £34.99
          </span>
        </p>
      </motion.div>
    </section>
  );
}
