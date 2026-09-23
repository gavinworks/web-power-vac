"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const STEPS = [
  {
    title: "Ask for a quote",
    body: "Ring, message us on Facebook or use the form. Free, and no obligation.",
  },
  {
    title: "We vacuum from the ground",
    body: "A SkyVac pole reaches up to the gutter and sucks everything out. Your lawn stays clean.",
  },
  {
    title: "See the difference",
    body: "Before and after photos land with you, so you know it's done right.",
  },
];

// Staggered card heights along the pipe (xl and up).
const OFFSET = ["xl:mt-32.5", "xl:mt-0", "xl:mt-37.5"];

const RADIUS = 50; // corner radius of the pipe bends
const CLEARANCE = 40; // gap between card 2 and the pipe's low run

interface Pipe {
  d: string;
  height: number;
}

/**
 * Draws the pipe from the cards' real positions, so it always runs through the
 * gaps and under card 2 however much the card text wraps.
 */
function tracePipe(list: HTMLOListElement): Pipe | null {
  const box = list.getBoundingClientRect();
  const cards = Array.from(list.querySelectorAll("li")).map((li) => {
    const r = li.getBoundingClientRect();
    return { l: r.left - box.left, r: r.right - box.left, t: r.top - box.top, b: r.bottom - box.top };
  });
  if (cards.length !== 3) return null;
  const [c1, c2, c3] = cards;

  const startX = 40;
  const endX = box.width - 44;
  const topLeft = Math.max(20, c1.t - 60);
  const topRight = Math.max(20, c3.t - 70);
  const low = c2.b + CLEARANCE;
  const gap1 = (c1.r + c2.l) / 2;
  const gap2 = (c2.r + c3.l) / 2;
  const R = RADIUS;

  const d = [
    `M${startX} ${topLeft}`,
    `H${gap1 - R} Q${gap1} ${topLeft} ${gap1} ${topLeft + R}`,
    `V${low - R} Q${gap1} ${low} ${gap1 + R} ${low}`,
    `H${gap2 - R} Q${gap2} ${low} ${gap2} ${low - R}`,
    `V${topRight + R} Q${gap2} ${topRight} ${gap2 + R} ${topRight}`,
    `H${endX}`,
  ].join(" ");

  const cardsBottom = Math.max(...cards.map((c) => c.b));
  return { d, height: Math.ceil(Math.max(cardsBottom, low + 16)) };
}

export function HowItWorks() {
  const listRef = useRef<HTMLOListElement>(null);
  const [pipe, setPipe] = useState<Pipe | null>(null);

  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const wide = window.matchMedia("(min-width: 80rem)");

    const measure = () => setPipe(wide.matches ? tracePipe(list) : null);

    measure();
    const observer = new ResizeObserver(measure);
    list.querySelectorAll("li").forEach((li) => observer.observe(li));
    observer.observe(list);
    wide.addEventListener("change", measure);
    return () => {
      observer.disconnect();
      wide.removeEventListener("change", measure);
    };
  }, []);

  return (
    <section className="relative z-10 -mt-14 rounded-t-[3.5rem] bg-pv-mist px-5 pt-20 pb-24 text-pv-navy lg:px-12 lg:pt-27.5 lg:pb-30">
      <div className="mx-auto flex max-w-336 flex-col gap-12 lg:gap-16">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <h2 className="font-pv-display text-[clamp(3.5rem,7vw,6rem)] leading-[0.9] font-extrabold font-stretch-75% tracking-[-0.01em]">
            How a clean
            <br />
            flows
          </h2>
          <p className="-rotate-3 self-start font-pv-hand text-3xl text-pv-link sm:self-auto lg:text-4xl">
            three steps, zero ladders
          </p>
        </div>

        <ol
          ref={listRef}
          style={pipe ? { minHeight: pipe.height } : undefined}
          className="relative flex flex-col gap-5 border-l-[1.25rem] border-pv-navy pl-6 xl:flex-row xl:items-start xl:gap-25 xl:border-l-0 xl:pr-33.5 xl:pl-0"
        >
          {pipe && (
            <svg
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 size-full overflow-visible"
            >
              <path d={pipe.d} fill="none" stroke="var(--color-pv-navy)" strokeWidth="28" strokeLinecap="round" />
              <path
                d={pipe.d}
                fill="none"
                stroke="var(--color-pv-sky)"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray="2 22"
              />
            </svg>
          )}
          {STEPS.map((step, i) => {
            const dark = i === 1;
            return (
              <li
                key={step.title}
                className={cn(
                  "relative flex flex-col gap-3 rounded-4xl p-8 xl:max-w-85 xl:flex-1",
                  dark ? "bg-pv-navy text-white" : "bg-white",
                  OFFSET[i]
                )}
              >
                <span
                  aria-hidden="true"
                  className="flex size-14 items-center justify-center rounded-full bg-pv-sky font-pv-display text-[1.75rem] font-extrabold text-pv-navy"
                >
                  {i + 1}
                </span>
                <h3 className="font-pv-display text-3xl leading-tight font-extrabold font-stretch-80% tracking-[-0.02em]">
                  {step.title}
                </h3>
                <p className={cn("text-lg leading-normal", dark && "text-pv-haze")}>
                  {step.body}
                </p>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
