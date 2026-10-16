"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, Phone, X } from "lucide-react";
import { NAV_LINKS } from "@/config/site";
import { useGlobal } from "@/context/GlobalContext";
import { getImageUrl } from "@/lib/directus";
import { editable } from "@/lib/editable";
import { cn } from "@/lib/utils";
import { focusRing, telHref } from "./styles";

function isCurrent(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

/** Floats over the dark hero at the top of every page. */
export function SiteHeader() {
  const { global, contact } = useGlobal();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const logo = getImageUrl(global?.logo ?? null);

  // Close the mobile menu after navigating
  useEffect(() => setOpen(false), [pathname]);

  return (
    <header className="absolute inset-x-4 top-5 z-20 mx-auto max-w-336 lg:inset-x-12 lg:top-7">
      <div className="flex items-center gap-4 lg:gap-6">
        {/* The badge stands on its own beside the bar: it is a round seal and too detailed to squeeze into a slim pill */}
        <Link
          href="/"
          aria-label={`${global?.site_name ?? "Power-Vac"} home`}
          data-directus={editable(
            "global",
            global?.id,
            ["logo", "site_name"],
            "drawer"
          )}
          className={cn("shrink-0 rounded-full", focusRing)}
        >
          {logo && (
            <Image
              src={logo}
              alt={global?.site_name ?? "Power-Vac Gutter Cleaning"}
              width={480}
              height={468}
              priority
              className="h-auto w-20 drop-shadow-[0_8px_20px_rgb(0_0_0/0.5)] sm:w-24 lg:w-32"
            />
          )}
        </Link>

        <div className="bg-pv-ink/60 ml-auto flex h-17 items-center justify-between gap-2 rounded-full border border-white/20 p-2 text-white backdrop-blur-md lg:h-21 lg:pr-3 xl:flex-1 xl:pl-3">
          <nav aria-label="Main" className="hidden xl:block">
            <ul className="flex gap-1 text-[1.0625rem] font-semibold whitespace-nowrap 2xl:gap-1.5">
              {NAV_LINKS.map((link) => {
                const current = isCurrent(pathname, link.href);
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      aria-current={current ? "page" : undefined}
                      className={cn(
                        "block rounded-full px-3.5 py-3 transition-colors hover:bg-white/10 2xl:px-4.5",
                        current && "bg-white/15",
                        focusRing
                      )}
                    >
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex items-center gap-2">
            {contact.phone && (
              <a
                href={telHref(contact.phone)}
                data-directus={editable("global", global?.id, "phone")}
                className={cn(
                  "bg-pv-sky text-pv-navy flex h-13 items-center gap-2.5 rounded-full px-4 font-extrabold whitespace-nowrap transition-colors hover:bg-white sm:px-6.5 lg:h-15 lg:text-lg",
                  focusRing
                )}
              >
                <Phone
                  className="size-4.5"
                  strokeWidth={2.4}
                  aria-hidden="true"
                />
                <span className="sr-only sm:not-sr-only">{contact.phone}</span>
              </a>
            )}
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? "Close menu" : "Open menu"}
              className={cn(
                "flex size-13 items-center justify-center rounded-full bg-white/10 lg:size-15 xl:hidden",
                focusRing
              )}
            >
              {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            id="mobile-menu"
            aria-label="Main"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="text-pv-navy mt-2 rounded-4xl bg-white p-3 shadow-2xl xl:hidden"
          >
            <ul className="flex flex-col">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={
                      isCurrent(pathname, link.href) ? "page" : undefined
                    }
                    onClick={() => setOpen(false)}
                    className={cn(
                      "font-pv-display hover:bg-pv-mist aria-[current=page]:bg-pv-mist block rounded-2xl px-4 py-3.5 text-2xl font-extrabold font-stretch-80%",
                      focusRing
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
