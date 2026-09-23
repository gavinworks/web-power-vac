"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronsLeftRight } from "lucide-react";
import { ASSETS } from "./shared";

export function BeforeAfter() {
  const [split, setSplit] = useState(50);

  return (
    <section
      id="before-after"
      className="scroll-mt-8 bg-pv-navy px-5 pt-8 pb-24 text-white lg:px-12 lg:pb-30"
    >
      <div className="mx-auto flex max-w-336 flex-col gap-10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <h2 className="font-pv-display text-[clamp(3.5rem,7vw,6rem)] leading-[0.9] font-extrabold font-stretch-75% tracking-[-0.01em]">
            Slide. <span className="text-pv-sky">Gasp.</span>
          </h2>
          <p className="-rotate-3 self-start font-pv-hand text-3xl text-pv-sky sm:self-auto lg:text-4xl">
            every job gets before &amp; after photos
          </p>
        </div>

        <div className="relative h-90 overflow-hidden rounded-[2.5rem] select-none sm:h-120 lg:h-140">
          <Image
            src={`${ASSETS}/after.jpg`}
            alt="The same gutter, clear after cleaning"
            fill
            sizes="(min-width: 1440px) 1344px, 100vw"
            className="object-cover"
          />
          <div
            className="absolute inset-0"
            style={{ clipPath: `inset(0 ${100 - split}% 0 0)` }}
          >
            <Image
              src={`${ASSETS}/before.jpg`}
              alt="A gutter blocked with moss and leaves, before cleaning"
              fill
              sizes="(min-width: 1440px) 1344px, 100vw"
              className="object-cover"
            />
          </div>

          <span className="absolute bottom-6 left-6 rounded-full bg-pv-navy px-5.5 py-3 text-lg font-extrabold lg:bottom-8 lg:left-8 lg:text-[1.375rem]">
            Before
          </span>
          <span className="absolute right-6 bottom-6 rounded-full bg-pv-sky px-5.5 py-3 text-lg font-extrabold text-pv-navy lg:right-8 lg:bottom-8 lg:text-[1.375rem]">
            After
          </span>

          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 w-1 -translate-x-1/2 bg-white"
            style={{ left: `${split}%` }}
          >
            <span className="absolute top-1/2 left-1/2 flex size-16 -translate-1/2 items-center justify-center rounded-full bg-white text-pv-navy shadow-lg">
              <ChevronsLeftRight className="size-7" strokeWidth={2.5} />
            </span>
          </div>

          {/* A real range input drives the split, so dragging, tapping and arrow keys all work */}
          <input
            type="range"
            min={0}
            max={100}
            value={split}
            onChange={(e) => setSplit(Number(e.target.value))}
            aria-label="Compare before and after: slide to reveal more of each photo"
            className="peer absolute inset-0 size-full cursor-ew-resize appearance-none bg-transparent opacity-0"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-[2.5rem] peer-focus-visible:outline-3 peer-focus-visible:-outline-offset-3 peer-focus-visible:outline-pv-sky"
          />
        </div>
      </div>
    </section>
  );
}
