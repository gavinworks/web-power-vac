import posthog from "posthog-js";
import { posthogConfig } from "@/config/site";
import type { Consent } from "@/lib/consent";

let started = false;

/**
 * Start PostHog. Until the visitor accepts cookies it runs in cookieless mode:
 * nothing is stored on their device and visitors are told apart by a hash on
 * PostHog's servers (cookieless tracking is switched on in the project
 * settings). Session replay only runs after they accept, with every form
 * field masked.
 */
export function startAnalytics(consent: Consent | null) {
  if (started || !posthogConfig.key) return;
  started = true;

  posthog.init(posthogConfig.key, {
    api_host: posthogConfig.apiHost,
    ui_host: posthogConfig.uiHost,
    capture_pageview: "history_change",
    person_profiles: "identified_only",
    cookieless_mode: "on_reject",
    // Undecided visitors start opted out, which means cookieless. Doing it
    // here rather than with opt_out_capturing() stores no opt-out marker.
    opt_out_capturing_by_default: consent !== "granted",
    disable_session_recording: consent !== "granted",
    session_recording: { maskAllInputs: true },
  });

  if (consent === "granted") posthog.opt_in_capturing();
  else if (consent === "denied") posthog.opt_out_capturing();
}

/** The visitor accepted: switch to normal cookies and start session replay. */
export function grantAnalytics() {
  if (!started) return;
  posthog.opt_in_capturing();
  posthog.startSessionRecording();
}

/** The visitor declined (or withdrew): stop replay and go back to cookieless. */
export function denyAnalytics() {
  if (!started) return;
  posthog.stopSessionRecording();
  posthog.opt_out_capturing();
}

/** Record an enquiry or other key action. */
export function trackEvent(name: string, properties?: Record<string, unknown>) {
  if (!started) return;
  posthog.capture(name, properties);
}
