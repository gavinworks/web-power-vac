import { cn } from "@/lib/utils";
import { focusRing } from "./shared";

const LINKS = [
  { label: "Services", href: "#services" },
  { label: "Before & after", href: "#before-after" },
  { label: "Areas", href: "#areas" },
  { label: "News", href: "#news" },
  { label: "Contact", href: "#quote" },
  { label: "Facebook", href: "https://www.facebook.com" },
];

const LEGAL = [
  { label: "Privacy", href: "#" },
  { label: "Cookies", href: "#" },
];

export function SiteFooter() {
  return (
    <footer className="overflow-hidden bg-pv-sky px-5 pt-18 pb-10 text-pv-navy lg:px-12">
      <div className="mx-auto flex max-w-336 flex-col gap-10">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between md:gap-10">
          <p className="max-w-130 font-pv-hand text-4xl leading-[1.1] lg:text-[2.5rem]">
            Cleaner gutters = a safer, longer-lasting home
          </p>
          <nav aria-label="Footer">
            {/* Mobile: a tidy two-column list with full-width tap targets. md+: two columns of three. */}
            <ul className="grid grid-cols-2 gap-x-6 border-t border-pv-navy/25 text-lg font-semibold md:grid-flow-col md:grid-rows-3 md:gap-x-14 md:border-0">
              {LINKS.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className={cn(
                      "flex h-13 items-center border-b border-pv-navy/25 whitespace-nowrap hover:text-white md:h-9 md:border-0",
                      focusRing
                    )}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <p
          aria-hidden="true"
          className="font-pv-display text-[clamp(5.5rem,23vw,18.75rem)] leading-[0.8] font-extrabold font-stretch-75% tracking-[-0.025em] whitespace-nowrap"
        >
          power-vac
        </p>
        <div className="flex flex-col gap-3 text-sm font-semibold sm:flex-row sm:items-center sm:justify-between">
          <p>© Power-Vac Gutter Cleaning, Norwich</p>
          <ul className="flex gap-5">
            {LEGAL.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  className={cn("underline underline-offset-4 hover:text-white", focusRing)}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
