"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { googleAds } from "@/config/site";
import {
  onConsentOpen,
  readConsent,
  saveConsent,
  type Consent,
} from "@/lib/consent";
import {
  loadGoogleTag,
  stopGoogleTag,
  trackConversion,
} from "@/lib/google-ads";
import { cn } from "@/lib/utils";
import { focusRing } from "./styles";

const button =
  "flex h-12 flex-1 items-center justify-center rounded-full px-6 text-lg font-bold transition-colors sm:flex-none";

/**
 * Asks before any Google Ads cookie is set, loads the Google tag once the
 * visitor accepts, and counts taps on any phone number as an enquiry.
 * Renders nothing until a Google Ads tag ID is set in `src/config/site.ts`,
 * and never inside Directus previews or prototypes.
 */
export function CookieBanner() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const hidden =
    !googleAds.id ||
    pathname.startsWith("/preview") ||
    pathname.startsWith("/prototypes");

  useEffect(() => {
    if (hidden || window.self !== window.top) return;
    const consent = readConsent();
    if (consent === "granted") loadGoogleTag();
    // Reading localStorage has to wait until the page is in the browser.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    else if (consent === null) setOpen(true);

    const onTelClick = (e: MouseEvent) => {
      const link = (e.target as Element | null)?.closest?.('a[href^="tel:"]');
      if (link) trackConversion("phone");
    };
    document.addEventListener("click", onTelClick);
    const stopListening = onConsentOpen(() => setOpen(true));
    return () => {
      document.removeEventListener("click", onTelClick);
      stopListening();
    };
  }, [hidden]);

  function choose(consent: Consent) {
    const before = readConsent();
    saveConsent(consent);
    if (consent === "granted") loadGoogleTag();
    else if (before === "granted") stopGoogleTag();
    setOpen(false);
  }

  if (hidden || !open) return null;

  return (
    <section
      aria-label="Cookies"
      className="bg-pv-navy border-pv-sky/40 fixed inset-x-4 border bottom-4 z-50 flex flex-col gap-4 rounded-4xl p-6 text-white shadow-[0_1.5rem_3rem_-1rem_rgb(5_13_24/0.6)] sm:right-auto sm:bottom-6 sm:left-6 sm:max-w-md sm:p-7"
    >
      <p className="text-xl leading-snug font-bold">
        Can we use cookies to see which adverts work?
      </p>
      <p className="text-pv-haze text-base leading-normal">
        If you found us through a Google advert, a cookie tells Google when you
        get in touch, so we only keep paying for adverts that bring in work. We
        don’t use them to follow you round the web.{" "}
        <Link
          href="/cookies"
          className={cn(
            "rounded-sm font-semibold text-white underline underline-offset-4",
            focusRing
          )}
        >
          More about cookies
        </Link>
      </p>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => choose("granted")}
          className={cn(
            button,
            "bg-pv-sky text-pv-navy hover:bg-white",
            focusRing
          )}
        >
          Accept
        </button>
        <button
          type="button"
          onClick={() => choose("denied")}
          className={cn(
            button,
            "hover:text-pv-navy border-2 border-white hover:bg-white",
            focusRing
          )}
        >
          No thanks
        </button>
      </div>
    </section>
  );
}
