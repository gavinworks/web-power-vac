import { googleAds } from "@/config/site";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

let loaded = false;

/**
 * Load the Google tag. Only called after the visitor accepts cookies, so
 * nothing reaches Google before then. Ad personalisation (remarketing) stays
 * off: the tag is only used to count enquiries from the ads.
 */
export function loadGoogleTag() {
  if (loaded || !googleAds.id) return;
  loaded = true;

  window.dataLayer = window.dataLayer ?? [];
  window.gtag = function gtag() {
    // gtag.js expects the arguments object itself, not an array.
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer!.push(arguments);
  };
  window.gtag("consent", "default", {
    ad_storage: "granted",
    ad_user_data: "granted",
    ad_personalization: "denied",
    analytics_storage: "denied",
  });
  window.gtag("js", new Date());
  window.gtag("config", googleAds.id);

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${googleAds.id}`;
  document.head.appendChild(script);
}

/** The visitor withdrew consent: stop the tag and clear its cookies. */
export function stopGoogleTag() {
  window.gtag?.("consent", "update", {
    ad_storage: "denied",
    ad_user_data: "denied",
  });
  for (const cookie of document.cookie.split(";")) {
    const name = cookie.split("=")[0].trim();
    if (name.startsWith("_gcl") || name.startsWith("_ga")) {
      const domain = window.location.hostname.replace(/^www\./, "");
      document.cookie = `${name}=; Max-Age=0; path=/`;
      document.cookie = `${name}=; Max-Age=0; path=/; domain=.${domain}`;
    }
  }
}

/** Count an enquiry in Google Ads. Does nothing without consent. */
export function trackConversion(kind: keyof typeof googleAds.labels) {
  const label = googleAds.labels[kind];
  if (!loaded || !googleAds.id || !label || !window.gtag) return;
  window.gtag("event", "conversion", { send_to: `${googleAds.id}/${label}` });
}
