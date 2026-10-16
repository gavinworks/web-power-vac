export const focusRing =
  "focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-pv-sky";

/** The one pill button, in its three fills. */
export const pill = {
  sky: "flex h-17 items-center gap-3 rounded-full bg-pv-sky px-8.5 text-xl font-extrabold text-pv-navy transition-colors hover:bg-white",
  outline:
    "flex h-17 items-center rounded-full border-2 border-white px-7.5 text-xl font-bold transition-colors hover:bg-white hover:text-pv-navy",
  navy: "flex h-15 items-center rounded-full bg-pv-navy px-7 text-lg font-bold text-white transition-colors hover:bg-pv-link",
};

/** Section heading sizes from the homepage, reused on every page. */
export const heading = {
  display:
    "font-pv-display text-[clamp(3.75rem,10.4vw,9.375rem)] leading-[0.86] font-extrabold font-stretch-75% tracking-[-0.015em]",
  section:
    "font-pv-display text-[clamp(3.5rem,7vw,6rem)] leading-[0.9] font-extrabold font-stretch-75% tracking-[-0.01em]",
  card: "font-pv-display text-3xl leading-tight font-extrabold font-stretch-80% tracking-[-0.02em]",
};

/** Turn a display phone number into a tel: link. */
export function telHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}
