import { DynamicIcon } from "@/components/shared/dynamic-icon";
import type { TrustPoint } from "@/lib/directus";
import { cn } from "@/lib/utils";

// Each badge keeps its own colour and tilt, in order, whatever the labels say.
const STYLES = [
  {
    badge:
      "bg-pv-navy text-white -rotate-8 lg:absolute lg:left-7.5 lg:top-2.5 lg:size-70",
    icon: "text-pv-sky",
  },
  {
    badge:
      "bg-white text-pv-navy rotate-9 lg:absolute lg:right-5 lg:top-22.5 lg:size-65",
    icon: "text-pv-link",
  },
  {
    badge:
      "bg-pv-leaf text-pv-navy -rotate-4 lg:absolute lg:left-37.5 lg:top-80 lg:size-72.5",
    icon: "text-pv-navy",
  },
];

/** The round, scattered trust badges from the homepage's areas section. */
export function TrustBadges({
  points,
  className,
  editAttr,
}: {
  points: TrustPoint[];
  className?: string;
  /** data-directus value, so the badges can be edited in the visual editor. */
  editAttr?: string;
}) {
  return (
    <ul
      data-directus={editAttr}
      className={cn(
        "flex flex-wrap justify-center gap-4 lg:relative lg:block lg:h-155",
        className
      )}
    >
      {points.slice(0, STYLES.length).map((point, i) => (
        <li
          key={point.label}
          className={cn(
            "flex size-44 flex-col items-center justify-center gap-2.5 rounded-full p-4 text-center sm:size-52",
            STYLES[i].badge
          )}
        >
          <DynamicIcon
            name={point.icon}
            className={cn("size-10 lg:size-14", STYLES[i].icon)}
          />
          <span className="font-pv-display max-w-[8ch] text-2xl leading-[0.95] font-extrabold tracking-[-0.02em] font-stretch-75% lg:text-[2.5rem]">
            {point.label}
          </span>
        </li>
      ))}
    </ul>
  );
}
