"use client";

import { useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { EMAIL, PHONE_DISPLAY, PHONE_HREF, focusRing } from "./shared";

const SERVICES = ["Gutter clean", "Downpipes", "Fascia & soffits", "Roof", "Repairs"];

const inputClass =
  "h-14 rounded-2xl border-2 border-pv-line bg-[#f4fbfe] px-4.5 text-lg font-medium text-pv-navy focus:border-pv-link focus:outline-none";

export function QuoteForm() {
  const [selected, setSelected] = useState<string[]>(["Gutter clean"]);
  const [sentTo, setSentTo] = useState<string | null>(null);

  function toggle(service: string) {
    setSelected((s) =>
      s.includes(service) ? s.filter((x) => x !== service) : [...s, service]
    );
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // Prototype only: nothing is sent. The live site posts to Directus submissions.
    const data = new FormData(e.currentTarget);
    setSentTo(String(data.get("name") || "there").split(" ")[0]);
  }

  return (
    <section
      id="quote"
      className="scroll-mt-8 bg-pv-navy px-5 py-24 text-white lg:px-12 lg:py-30"
    >
      <div className="mx-auto grid max-w-336 items-start gap-14 lg:grid-cols-[1fr_43.75rem] lg:gap-16">
        <div className="flex flex-col gap-7">
          <h2 className="font-pv-display text-[clamp(4rem,9vw,7.5rem)] leading-[0.86] font-extrabold font-stretch-75% tracking-[-0.015em]">
            Let&rsquo;s get
            <br />
            you <span className="text-pv-sky">flowing</span>
          </h2>
          <p className="max-w-130 text-xl leading-normal text-pv-haze lg:text-[1.375rem]">
            A free, no-obligation quote. Send the form and you&rsquo;ll get a
            confirmation email straight away. Or just give us a ring.
          </p>
          <a
            href={PHONE_HREF}
            className={cn(
              "self-start rounded-lg font-pv-display text-[clamp(3rem,6vw,4.5rem)] leading-none font-extrabold font-stretch-75% tracking-[-0.01em] text-pv-sky hover:text-white",
              focusRing
            )}
          >
            {PHONE_DISPLAY}
          </a>
          <a
            href={`mailto:${EMAIL}`}
            className={cn("self-start text-lg font-semibold break-all underline underline-offset-4", focusRing)}
          >
            {EMAIL}
          </a>
        </div>

        <div className="rounded-[2.5rem] bg-white p-6 text-pv-navy sm:p-11">
          <AnimatePresence mode="wait" initial={false}>
            {sentTo ? (
              <motion.div
                key="sent"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex min-h-120 flex-col items-start justify-center gap-5"
                role="status"
              >
                <span className="flex size-18 items-center justify-center rounded-full bg-pv-sky">
                  <Check className="size-9" strokeWidth={3} aria-hidden="true" />
                </span>
                <h3 className="font-pv-display text-5xl leading-none font-extrabold font-stretch-75%">
                  Quote request sent
                </h3>
                <p className="max-w-110 text-lg leading-normal">
                  Thanks, {sentTo}. A confirmation email is on its way, and
                  we&rsquo;ll be in touch with your price. Need us sooner? Call{" "}
                  {PHONE_DISPLAY}.
                </p>
                <button
                  type="button"
                  onClick={() => setSentTo(null)}
                  className={cn("rounded-md font-bold text-pv-link underline underline-offset-4", focusRing)}
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
                    <input name="name" type="text" required autoComplete="name" className={inputClass} />
                  </label>
                  <label className="flex flex-col gap-2 font-bold">
                    Phone
                    <input name="phone" type="tel" required autoComplete="tel" className={inputClass} />
                  </label>
                  <label className="flex flex-col gap-2 font-bold">
                    Email
                    <input name="email" type="email" required autoComplete="email" className={inputClass} />
                  </label>
                  <label className="flex flex-col gap-2 font-bold">
                    Postcode
                    <input name="postcode" type="text" required autoComplete="postal-code" className={inputClass} />
                  </label>
                </div>

                <fieldset className="flex flex-col gap-2.5">
                  <legend className="mb-2.5 font-bold">What can we help with?</legend>
                  <div className="flex flex-wrap gap-2.5">
                    {SERVICES.map((service) => {
                      const on = selected.includes(service);
                      return (
                        <label
                          key={service}
                          className={cn(
                            "flex h-12 cursor-pointer items-center gap-2.5 rounded-full border-2 px-4.5 font-semibold transition-colors has-focus-visible:outline-3 has-focus-visible:outline-offset-2 has-focus-visible:outline-pv-link",
                            on ? "border-pv-sky bg-pv-sky font-bold" : "border-pv-line hover:border-pv-sky"
                          )}
                        >
                          <input
                            type="checkbox"
                            name="services"
                            value={service}
                            checked={on}
                            onChange={() => toggle(service)}
                            className="size-4.5 accent-pv-navy"
                          />
                          {service}
                        </label>
                      );
                    })}
                  </div>
                </fieldset>

                <label className="flex flex-col gap-2 font-bold">
                  Anything we should know?
                  <textarea
                    name="message"
                    rows={3}
                    className={cn(inputClass, "h-auto resize-none py-3.5")}
                  />
                </label>

                <button
                  type="submit"
                  className={cn(
                    "h-17 rounded-full bg-pv-navy font-pv-display text-[1.375rem] font-extrabold text-white transition-colors hover:bg-pv-link",
                    focusRing
                  )}
                >
                  Send my quote request
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
