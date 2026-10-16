"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronsLeftRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BeforeAfterSliderProps {
  beforeSrc: string;
  beforeAlt: string;
  afterSrc: string;
  afterAlt: string;
  isExample: boolean;
  label: string;
  className?: string;
}

/** Drag, tap or use the arrow keys to compare a gutter before and after cleaning. */
export function BeforeAfterSlider({
  beforeSrc,
  beforeAlt,
  afterSrc,
  afterAlt,
  isExample,
  label,
  className,
}: BeforeAfterSliderProps) {
  const [split, setSplit] = useState(50);

  return (
    <div
      className={cn(
        "relative h-90 overflow-hidden rounded-[2.5rem] select-none sm:h-120 lg:h-140",
        className
      )}
    >
      <Image
        src={afterSrc}
        alt={afterAlt}
        fill
        sizes="(min-width: 1440px) 1344px, 100vw"
        className="object-cover"
      />
      <div
        className="absolute inset-0"
        style={{ clipPath: `inset(0 ${100 - split}% 0 0)` }}
      >
        <Image
          src={beforeSrc}
          alt={beforeAlt}
          fill
          sizes="(min-width: 1440px) 1344px, 100vw"
          className="object-cover"
        />
      </div>

      {/* Stock photos stay labelled until they're swapped for Tommy's own jobs */}
      {isExample && (
        <span className="bg-pv-ink/75 absolute top-6 left-6 rounded-full px-4 py-2 text-base font-bold text-white backdrop-blur-sm lg:top-8 lg:left-8">
          Example photos
        </span>
      )}
      <span className="bg-pv-navy absolute bottom-6 left-6 rounded-full px-5.5 py-3 text-lg font-extrabold text-white lg:bottom-8 lg:left-8 lg:text-[1.375rem]">
        Before
      </span>
      <span className="bg-pv-sky text-pv-navy absolute right-6 bottom-6 rounded-full px-5.5 py-3 text-lg font-extrabold lg:right-8 lg:bottom-8 lg:text-[1.375rem]">
        After
      </span>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 w-1 -translate-x-1/2 bg-white"
        style={{ left: `${split}%` }}
      >
        <span className="text-pv-navy absolute top-1/2 left-1/2 flex size-16 -translate-1/2 items-center justify-center rounded-full bg-white shadow-lg">
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
        aria-label={`${label}: slide to compare before and after`}
        className="peer absolute inset-0 size-full cursor-ew-resize appearance-none bg-transparent opacity-0"
      />
      <div
        aria-hidden="true"
        className="peer-focus-visible:outline-pv-sky pointer-events-none absolute inset-0 rounded-[2.5rem] peer-focus-visible:outline-3 peer-focus-visible:-outline-offset-3"
      />
    </div>
  );
}
