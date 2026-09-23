import { cn } from "@/lib/utils";
import { NAV_LINKS, focusRing } from "./shared";
import { PrototypeLink } from "./prototype-link";

const PAGES = NAV_LINKS.filter((link) => link.href !== "/");

const LEGAL = [
  { label: "Privacy", href: "/privacy" },
  { label: "Cookies", href: "/cookies" },
];

const linkClass =
  "flex h-13 items-center border-b border-pv-navy/25 whitespace-nowrap hover:text-white md:h-9 md:border-0";

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
              {PAGES.map((link) => (
                <li key={link.label}>
                  <PrototypeLink href={link.href} page={link.label} className={cn(linkClass, focusRing)}>
                    {link.label}
                  </PrototypeLink>
                </li>
              ))}
              <li>
                <a href="https://www.facebook.com" className={cn(linkClass, focusRing)}>
                  Facebook
                </a>
              </li>
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
                <PrototypeLink
                  href={link.href}
                  page={link.label}
                  className={cn("underline underline-offset-4 hover:text-white", focusRing)}
                >
                  {link.label}
                </PrototypeLink>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
