import { ArrowRight, Droplets, House, PanelTop, Wrench } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { focusRing } from "./shared";

const EXTRAS: {
  title: string;
  kind: "Add-on" | "On request";
  icon: LucideIcon;
  light?: boolean;
}[] = [
  { title: "Downpipe unblocking", kind: "Add-on", icon: Droplets },
  { title: "Fascia & soffit cleaning", kind: "Add-on", icon: PanelTop },
  { title: "Roof cleaning", kind: "Add-on", icon: House, light: true },
  { title: "Minor roofline repairs", kind: "On request", icon: Wrench },
];

export function Services() {
  return (
    <section
      id="services"
      className="scroll-mt-8 bg-pv-navy px-5 pt-24 pb-16 text-white lg:px-12 lg:pt-30"
    >
      <div className="mx-auto flex max-w-336 flex-col gap-12 lg:gap-14">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <h2 className="font-pv-display text-[clamp(3.5rem,7vw,6rem)] leading-[0.9] font-extrabold font-stretch-75% tracking-[-0.01em]">
            Everything up
            <br />
            on the <span className="text-pv-sky">roofline</span>
          </h2>
          <a
            href="#"
            className={cn(
              "flex h-15 items-center self-start rounded-full border-2 border-white px-7 text-lg font-bold transition-colors hover:bg-white hover:text-pv-navy sm:self-auto",
              focusRing
            )}
          >
            All services
          </a>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4 lg:grid-rows-[18.75rem_18.75rem]">
          <a
            href="#"
            className={cn(
              "flex flex-col justify-between gap-10 rounded-[2.5rem] bg-pv-sky p-8 text-pv-navy md:col-span-2 lg:row-span-2 lg:p-12",
              focusRing
            )}
          >
            <div className="flex flex-col gap-4">
              <span className="self-start rounded-full bg-pv-navy px-4 py-2 text-[0.9375rem] font-bold text-white">
                The main event
              </span>
              <h3 className="font-pv-display text-[clamp(3rem,5.5vw,4.75rem)] leading-[0.9] font-extrabold font-stretch-75% tracking-[-0.01em]">
                Gutter vacuum cleaning
              </h3>
              <p className="max-w-110 text-xl leading-normal">
                Vacuum cleaned from the ground. Leaves, moss, silt and debris
                out, water flowing again.
              </p>
            </div>
            <div className="flex items-end justify-between">
              <p className="flex flex-col leading-none">
                <span className="text-xl font-semibold">from just</span>
                <span className="font-pv-display text-[clamp(4.5rem,8vw,6.5rem)] font-extrabold font-stretch-75% tracking-[-0.01em]">
                  £34.99
                </span>
              </p>
              <span className="flex size-21 items-center justify-center rounded-full bg-pv-navy text-white">
                <ArrowRight className="size-8 motion-safe:animate-pv-nudge" strokeWidth={2.5} aria-hidden="true" />
              </span>
            </div>
          </a>

          {EXTRAS.map(({ title, kind, icon: Icon, light }) => (
            <a
              key={title}
              href="#"
              className={cn(
                "flex min-h-60 flex-col justify-between rounded-4xl p-8 transition-transform hover:-translate-y-1",
                light ? "bg-white text-pv-navy" : "bg-pv-navy-soft text-white",
                focusRing
              )}
            >
              <Icon
                className={cn("size-11", light ? "text-pv-navy" : "text-pv-sky")}
                strokeWidth={1.8}
                aria-hidden="true"
              />
              <div className="flex flex-col gap-2">
                <span
                  className={cn(
                    "text-sm font-bold tracking-wide",
                    light ? "text-pv-link" : "text-pv-sky"
                  )}
                >
                  {kind}
                </span>
                <h3 className="font-pv-display text-[2.125rem] leading-none font-extrabold font-stretch-80% tracking-[-0.02em]">
                  {title}
                </h3>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
