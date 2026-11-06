/**
 * The visitor's cookie choice, kept in localStorage. Nothing from Google
 * loads until they accept.
 */
export type Consent = "granted" | "denied";

const KEY = "pv-cookie-consent";
const CHANGE = "pv-consent-change";
const OPEN = "pv-consent-open";

export function readConsent(): Consent | null {
  try {
    const value = window.localStorage.getItem(KEY);
    return value === "granted" || value === "denied" ? value : null;
  } catch {
    return null;
  }
}

export function saveConsent(consent: Consent) {
  try {
    window.localStorage.setItem(KEY, consent);
  } catch {
    // Storage blocked: the choice lasts for this page view only.
  }
  window.dispatchEvent(new CustomEvent<Consent>(CHANGE, { detail: consent }));
}

export function onConsentChange(handler: (consent: Consent) => void) {
  const listener = (e: Event) => handler((e as CustomEvent<Consent>).detail);
  window.addEventListener(CHANGE, listener);
  return () => window.removeEventListener(CHANGE, listener);
}

/** Reopen the banner, from the "Cookie settings" link in the footer. */
export function openConsentSettings() {
  window.dispatchEvent(new Event(OPEN));
}

export function onConsentOpen(handler: () => void) {
  window.addEventListener(OPEN, handler);
  return () => window.removeEventListener(OPEN, handler);
}
