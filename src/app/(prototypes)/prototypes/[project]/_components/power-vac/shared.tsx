export const ASSETS = "/prototypes/power-vac-homepage";

export const PHONE_DISPLAY = "01603 339225";
export const PHONE_HREF = "tel:01603339225";
export const EMAIL = "powervacguttercleaning@gmail.com";

export const focusRing =
  "focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-pv-sky";

export const NAV_LINKS = [
  { label: "Home", href: "#" },
  { label: "Services", href: "#services" },
  { label: "Before & after", href: "#before-after" },
  { label: "Areas", href: "#areas" },
  { label: "News", href: "#news" },
  { label: "Contact", href: "#quote" },
];

export function HouseMark({
  className,
  roof = "currentColor",
  accent = "var(--color-pv-sky)",
}: {
  className?: string;
  roof?: string;
  accent?: string;
}) {
  return (
    <svg viewBox="0 0 58 44" aria-hidden="true" className={className}>
      <path
        d="M4 24 L29 5 L54 24"
        fill="none"
        stroke={roof}
        strokeWidth="5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <path d="M40 12 V4 H46 V17" fill="none" stroke={roof} strokeWidth="4" />
      <rect x="24" y="19" width="10" height="10" rx="2" fill={accent} />
      <path
        d="M8 34 H50 V38"
        fill="none"
        stroke={accent}
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <circle cx="12" cy="12" r="11" fill="#ffffff" />
      <path
        d="M13.3 20v-6.2h2.1l.3-2.5h-2.4V9.8c0-.7.2-1.2 1.2-1.2h1.3V6.4c-.2 0-1-.1-1.9-.1-1.9 0-3.2 1.2-3.2 3.3v1.8H8.6v2.5h2.1V20z"
        fill="#1877f2"
      />
    </svg>
  );
}

export function Leaf({ className, fill }: { className?: string; fill: string }) {
  return (
    <svg viewBox="0 -3 46 27" aria-hidden="true" className={className}>
      <path d="M0 8 c18 -10 40 -4 44 14 c-20 6 -34 4 -44 -14z" fill={fill} />
    </svg>
  );
}
