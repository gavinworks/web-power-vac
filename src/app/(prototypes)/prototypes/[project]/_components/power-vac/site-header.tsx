"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, Phone, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  HouseMark,
  NAV_LINKS,
  PHONE_DISPLAY,
  PHONE_HREF,
  focusRing,
} from "./shared";

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <div className="absolute inset-x-4 top-5 z-20 mx-auto max-w-336 lg:inset-x-12 lg:top-7">
      <header className="flex h-17 items-center justify-between rounded-full border border-white/20 bg-pv-ink/60 pr-2 pl-5 text-white backdrop-blur-md lg:h-21 lg:pr-3 lg:pl-8">
        <a
          href="#"
          className={cn("flex items-center gap-3 rounded-full", focusRing)}
        >
          <HouseMark className="h-8 w-11 lg:h-9 lg:w-12" roof="#ffffff" />
          <span className="font-pv-display text-2xl font-extrabold font-stretch-80% tracking-[-0.01em] whitespace-nowrap lg:text-[1.75rem]">
            power-vac
          </span>
        </a>

        <nav aria-label="Main" className="hidden xl:block">
          <ul className="flex gap-1 text-[1.0625rem] font-semibold whitespace-nowrap 2xl:gap-1.5">
            {NAV_LINKS.map((link, i) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  aria-current={i === 0 ? "page" : undefined}
                  className={cn(
                    "block rounded-full px-3.5 py-3 transition-colors hover:bg-white/10 2xl:px-4.5",
                    i === 0 && "bg-white/15",
                    focusRing
                  )}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <a
            href={PHONE_HREF}
            className={cn(
              "flex h-13 items-center gap-2.5 rounded-full bg-pv-sky px-4 font-extrabold whitespace-nowrap text-pv-navy transition-colors hover:bg-white sm:px-6.5 lg:h-15 lg:text-lg",
              focusRing
            )}
          >
            <Phone className="size-4.5" strokeWidth={2.4} aria-hidden="true" />
            <span className="sr-only sm:not-sr-only">{PHONE_DISPLAY}</span>
          </a>
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
      </header>

      <AnimatePresence>
        {open && (
          <motion.nav
            id="mobile-menu"
            aria-label="Main"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="mt-2 rounded-4xl bg-white p-3 text-pv-navy shadow-2xl xl:hidden"
          >
            <ul className="flex flex-col">
              {NAV_LINKS.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "block rounded-2xl px-4 py-3.5 font-pv-display text-2xl font-extrabold font-stretch-80% hover:bg-pv-mist",
                      focusRing
                    )}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </div>
  );
}
