"use client";

import { useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, LoaderCircle } from "lucide-react";
import { useGlobal } from "@/context/GlobalContext";
import { cn } from "@/lib/utils";
import { Headline } from "./headline";
import { focusRing, heading, telHref } from "./styles";

const inputClass =
  "h-14 rounded-2xl border-2 border-pv-line bg-[#f4fbfe] px-4.5 text-lg font-medium text-pv-navy focus:border-pv-link focus:outline-none";

type Status =
  | { state: "idle" }
  | { state: "sending" }
  | { state: "sent"; firstName: string }
  | { state: "error"; message: string };

/**
 * The quote form that closes most pages. Copy comes from the global record;
 * the service options are the services' short form labels.
 */
export function QuoteSection({
  services,
  preselect,
  className,
}: {
  services: string[];
  preselect?: string;
  className?: string;
}) {
  const { global, contact } = useGlobal();
  const [selected, setSelected] = useState<string[]>(
    preselect ? [preselect] : services.slice(0, 1)
  );
  const [status, setStatus] = useState<Status>({ state: "idle" });

  function toggle(service: string) {
    setSelected((s) =>
      s.includes(service) ? s.filter((x) => x !== service) : [...s, service]
    );
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    setStatus({ state: "sending" });

    try {
      const response = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.get("name"),
          phone: data.get("phone"),
          email: data.get("email"),
          postcode: data.get("postcode"),
          message: data.get("message"),
          website: data.get("website"),
          services: selected,
        }),
      });
      const json = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(json.error ?? "send failed");

      setStatus({
        state: "sent",
        firstName: String(data.get("name") || "there")
          .trim()
          .split(" ")[0],
      });
    } catch (error) {
      setStatus({
        state: "error",
        message:
          error instanceof Error && error.message !== "send failed"
            ? error.message
            : "Your request didn’t send. Please try again, or give us a ring.",
      });
    }
  }

  return (
    <section
      id="quote"
      className={cn(
        "bg-pv-navy scroll-mt-8 px-5 py-24 text-white lg:px-12 lg:py-30",
        className
      )}
    >
      <div className="mx-auto grid max-w-336 items-start gap-14 lg:grid-cols-[1fr_43.75rem] lg:gap-16">
        <div className="flex flex-col gap-7">
          {global?.quote_heading && (
            <h2
              className={cn(
                heading.section,
                "text-[clamp(4rem,9vw,7.5rem)] leading-[0.86]"
              )}
            >
              <Headline text={global.quote_heading} />
            </h2>
          )}
          {global?.quote_description && (
            <p className="text-pv-haze max-w-130 text-xl leading-normal lg:text-[1.375rem]">
              {global.quote_description}
            </p>
          )}
          {contact.phone && (
            <a
              href={telHref(contact.phone)}
              className={cn(
                "font-pv-display text-pv-sky self-start rounded-lg text-[clamp(3rem,6vw,4.5rem)] leading-none font-extrabold tracking-[-0.01em] font-stretch-75% hover:text-white",
                focusRing
              )}
            >
              {contact.phone}
            </a>
          )}
          {contact.email && (
            <a
              href={`mailto:${contact.email}`}
              className={cn(
                "self-start text-lg font-semibold break-all underline underline-offset-4",
                focusRing
              )}
            >
              {contact.email}
            </a>
          )}
        </div>

        <div className="text-pv-navy rounded-[2.5rem] bg-white p-6 sm:p-11">
          <AnimatePresence mode="wait" initial={false}>
            {status.state === "sent" ? (
              <motion.div
                key="sent"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex min-h-120 flex-col items-start justify-center gap-5"
                role="status"
              >
                <span className="bg-pv-sky flex size-18 items-center justify-center rounded-full">
                  <Check
                    className="size-9"
                    strokeWidth={3}
                    aria-hidden="true"
                  />
                </span>
                <h3 className="font-pv-display text-5xl leading-none font-extrabold font-stretch-75%">
                  Quote request sent
                </h3>
                <p className="max-w-110 text-lg leading-normal">
                  Thanks, {status.firstName}. {global?.quote_success_message}
                  {contact.phone && <> Need us sooner? Call {contact.phone}.</>}
                </p>
                <button
                  type="button"
                  onClick={() => setStatus({ state: "idle" })}
                  className={cn(
                    "text-pv-link rounded-md font-bold underline underline-offset-4",
                    focusRing
                  )}
                >
                  Send another request
                </button>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                exit={{ opacity: 0, y: -12 }}
                onSubmit={handleSubmit}
                className="flex flex-col gap-4.5"
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="flex flex-col gap-2 font-bold">
                    Your name
                    <input
                      name="name"
                      type="text"
                      required
                      maxLength={80}
                      autoComplete="name"
                      className={inputClass}
                    />
                  </label>
                  <label className="flex flex-col gap-2 font-bold">
                    Phone
                    <input
                      name="phone"
                      type="tel"
                      required
                      maxLength={30}
                      autoComplete="tel"
                      className={inputClass}
                    />
                  </label>
                  <label className="flex flex-col gap-2 font-bold">
                    Email
                    <input
                      name="email"
                      type="email"
                      required
                      maxLength={250}
                      autoComplete="email"
                      className={inputClass}
                    />
                  </label>
                  <label className="flex flex-col gap-2 font-bold">
                    Postcode
                    <input
                      name="postcode"
                      type="text"
                      required
                      maxLength={10}
                      autoComplete="postal-code"
                      className={inputClass}
                    />
                  </label>
                </div>

                {/* Spam trap: hidden from people, filled in by bots */}
                <label className="hidden" aria-hidden="true">
                  Website
                  <input
                    name="website"
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                  />
                </label>

                {services.length > 0 && (
                  <fieldset className="flex flex-col gap-2.5">
                    <legend className="mb-2.5 font-bold">
                      What can we help with?
                    </legend>
                    <div className="flex flex-wrap gap-2.5">
                      {services.map((service) => {
                        const on = selected.includes(service);
                        return (
                          <label
                            key={service}
                            className={cn(
                              "has-focus-visible:outline-pv-link flex h-12 cursor-pointer items-center gap-2.5 rounded-full border-2 px-4.5 font-semibold transition-colors has-focus-visible:outline-3 has-focus-visible:outline-offset-2",
                              on
                                ? "border-pv-sky bg-pv-sky font-bold"
                                : "border-pv-line hover:border-pv-sky"
                            )}
                          >
                            <input
                              type="checkbox"
                              name="services"
                              value={service}
                              checked={on}
                              onChange={() => toggle(service)}
                              className="accent-pv-navy size-4.5"
                            />
                            {service}
                          </label>
                        );
                      })}
                    </div>
                  </fieldset>
                )}

                <label className="flex flex-col gap-2 font-bold">
                  Anything we should know?
                  <textarea
                    name="message"
                    rows={3}
                    maxLength={2000}
                    className={cn(inputClass, "h-auto resize-none py-3.5")}
                  />
                </label>

                {status.state === "error" && (
                  <p
                    role="alert"
                    className="bg-pv-mist rounded-2xl px-4.5 py-3.5 font-semibold"
                  >
                    {status.message}
                    {contact.phone && (
                      <>
                        {" "}
                        <a
                          href={telHref(contact.phone)}
                          className="underline underline-offset-4"
                        >
                          {contact.phone}
                        </a>
                      </>
                    )}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={status.state === "sending"}
                  className={cn(
                    "bg-pv-navy font-pv-display hover:bg-pv-link flex h-17 items-center justify-center gap-3 rounded-full text-[1.375rem] font-extrabold text-white transition-colors disabled:opacity-70",
                    focusRing
                  )}
                >
                  {status.state === "sending" && (
                    <LoaderCircle
                      className="size-6 animate-spin"
                      aria-hidden="true"
                    />
                  )}
                  {status.state === "sending"
                    ? "Sending your request"
                    : "Send my quote request"}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
