import { House, Leaf, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

const PROMISES = [
  {
    label: "Fully insured",
    icon: ShieldCheck,
    className:
      "bg-pv-navy text-white -rotate-8 lg:absolute lg:left-7.5 lg:top-2.5 lg:size-70",
    iconClass: "text-pv-sky",
  },
  {
    label: "Eco-friendly method",
    icon: Leaf,
    className:
      "bg-white text-pv-navy rotate-9 lg:absolute lg:right-5 lg:top-22.5 lg:size-65",
    iconClass: "text-pv-link",
  },
  {
    label: "Local & reliable",
    icon: House,
    className:
      "bg-pv-leaf text-pv-navy -rotate-4 lg:absolute lg:left-37.5 lg:top-80 lg:size-72.5",
    iconClass: "text-pv-navy",
  },
];

export function Areas() {
  return (
    <section
      id="areas"
      className="scroll-mt-8 bg-pv-sky px-5 pt-24 pb-38 text-pv-navy lg:px-12 lg:pt-30 lg:pb-44"
    >
      <div className="mx-auto grid max-w-336 items-center gap-14 lg:grid-cols-2 lg:gap-16">
        <div className="flex flex-col gap-7">
          <p className="-rotate-3 self-start font-pv-hand text-4xl lg:text-[2.5rem]">
            where you&rsquo;ll find us
          </p>
          <h2 className="font-pv-display text-[clamp(4rem,9vw,8rem)] leading-[0.86] font-extrabold font-stretch-75% tracking-[-0.015em]">
            Norwich
            <br />
            <span className="text-white">&amp; the whole</span>
            <br />
            of Norfolk
          </h2>
          <p className="max-w-140 text-xl leading-normal font-medium lg:text-[1.375rem]">
            Based in Norwich and covering all of Norfolk and the surrounding
            areas. From the Broads to the coast, if it&rsquo;s got gutters,
            we&rsquo;ll come.
          </p>
        </div>

        <ul className="flex flex-wrap justify-center gap-4 lg:relative lg:block lg:h-155">
          {PROMISES.map(({ label, icon: Icon, className, iconClass }) => (
            <li
              key={label}
              className={cn(
                "flex size-44 flex-col items-center justify-center gap-2.5 rounded-full p-4 text-center sm:size-52",
                className
              )}
            >
              <Icon className={cn("size-10 lg:size-14", iconClass)} strokeWidth={1.8} aria-hidden="true" />
              <span className="max-w-[8ch] font-pv-display text-2xl leading-[0.95] font-extrabold font-stretch-75% tracking-[-0.02em] lg:text-[2.5rem]">
                {label}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
