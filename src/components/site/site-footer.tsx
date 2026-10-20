"use client";

import Link from "next/link";
import { LEGAL_LINKS, NAV_LINKS } from "@/config/site";
import { useGlobal } from "@/context/GlobalContext";
import { editable } from "@/lib/editable";
import { cn } from "@/lib/utils";
import { focusRing, telHref } from "./styles";

const PAGES = NAV_LINKS.filter((link) => link.href !== "/");

const linkClass =
  "flex h-13 items-center border-b border-pv-navy/25 whitespace-nowrap hover:text-white md:h-9 md:border-0";

export function SiteFooter() {
  const { global, contact } = useGlobal();
  const socials = contact.socialMedia.filter((s) => s.link);
  const edit = (fields: string | string[], mode?: "popover" | "drawer") =>
    editable("global", global?.id, fields, mode);

  return (
    <footer className="bg-pv-sky text-pv-navy overflow-hidden px-5 pt-18 pb-10 lg:px-12">
      <div className="mx-auto flex max-w-336 flex-col gap-10">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between md:gap-10">
          <div className="flex flex-col gap-6">
            {global?.footer_tagline && (
              <p
                data-directus={edit("footer_tagline")}
                className="font-pv-hand max-w-130 text-4xl leading-[1.1] lg:text-[2.5rem]"
              >
                {global.footer_tagline}
              </p>
            )}
            <div
              data-directus={edit(
                ["phone", "phone_second", "email_address"],
                "drawer"
              )}
              className="flex flex-col gap-1 text-lg font-semibold"
            >
              {contact.phone && (
                <a
                  href={telHref(contact.phone)}
                  className={cn("self-start hover:text-white", focusRing)}
                >
                  {contact.phone}
                </a>
              )}
              {global?.phone_second && (
                <a
                  href={telHref(global.phone_second)}
                  className={cn("self-start hover:text-white", focusRing)}
                >
                  {global.phone_second}
                </a>
              )}
              {contact.email && (
                <a
                  href={`mailto:${contact.email}`}
                  className={cn(
                    "self-start break-all hover:text-white",
                    focusRing
                  )}
                >
                  {contact.email}
                </a>
              )}
            </div>
          </div>
          <nav aria-label="Footer">
            {/* Mobile: a tidy two-column list with full-width tap targets. md+: columns of three. */}
            <ul className="border-pv-navy/25 grid grid-cols-2 gap-x-6 border-t text-lg font-semibold md:grid-flow-col md:grid-rows-3 md:gap-x-14 md:border-0">
              {PAGES.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={cn(linkClass, focusRing)}>
                    {link.label}
                  </Link>
                </li>
              ))}
              {socials.map((social) => (
                <li key={social.link}>
                  <a
                    href={social.link}
                    rel="noopener"
                    data-directus={edit("social_media_accounts", "drawer")}
                    className={cn(linkClass, focusRing)}
                  >
                    {social.name}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <p
          aria-hidden="true"
          className="font-pv-display text-[clamp(5.5rem,23vw,18.75rem)] leading-[0.8] font-extrabold tracking-[-0.025em] whitespace-nowrap font-stretch-75%"
        >
          power-vac
        </p>
        <div className="flex flex-col gap-3 text-sm font-semibold sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()}{" "}
            {global?.site_name ?? "Power-Vac Gutter Cleaning"}, Norwich
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-8">
            <ul className="flex gap-5">
              {LEGAL_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={cn(
                      "underline underline-offset-4 hover:text-white",
                      focusRing
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            {/* Agency credit, the same on every Build 76 site, so it lives in code */}
            <p>
              Made with{" "}
              <span role="img" aria-label="love">
                ❤️
              </span>{" "}
              by{" "}
              <a
                href="https://www.build76.co.uk/"
                className={cn(
                  "underline underline-offset-4 hover:text-white",
                  focusRing
                )}
              >
                Build 76
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
