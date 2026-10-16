"use client";

import {
  useRef,
  useState,
  type FocusEvent,
  type FormEvent,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Check, CircleAlert, LoaderCircle } from "lucide-react";
import { useGlobal } from "@/context/GlobalContext";
import { editable } from "@/lib/editable";
import {
  QUOTE_LIMITS,
  validateQuote,
  validateQuoteField,
  type QuoteField,
  type QuoteValues,
} from "@/lib/quote-validation";
import { cn } from "@/lib/utils";
import { Headline } from "./headline";
import { focusRing, heading, telHref } from "./styles";

const inputClass =
  "h-14 rounded-2xl border-2 border-pv-line bg-[#f4fbfe] px-4.5 text-lg font-medium text-pv-navy focus:border-pv-link focus:outline-none aria-invalid:border-red-700 aria-invalid:bg-red-50";

type Status =
  | { state: "idle" }
  | { state: "sending" }
  | { state: "sent"; firstName: string }
  | { state: "error"; message: string };

type Errors = Partial<Record<QuoteField, string>>;

const EMPTY: QuoteValues = {
  name: "",
  phone: "",
  email: "",
  postcode: "",
  message: "",
};

/** A labelled input with its error message underneath, announced when it appears. */
function Field({
  id,
  label,
  error,
  children,
  className,
}: {
  id: string;
  label: string;
  error?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <label htmlFor={id} className="font-bold">
        {label}
      </label>
      {children}
      {error && (
        <p
          id={`${id}-error`}
          className="flex items-start gap-1.5 text-[0.9375rem] leading-snug font-semibold text-red-700"
        >
          <CircleAlert
            className="mt-0.5 size-4 shrink-0"
            strokeWidth={2.5}
            aria-hidden="true"
          />
          {error}
        </p>
      )}
    </div>
  );
}

/**
 * The quote form that closes most pages. Copy comes from the global record;
 * the service options are the services' short form labels.
 *
 * Each field is checked when you leave it, and again as you type once it has
 * shown an error. Bots are kept out by a hidden field, a signed token that
 * shows how long the form was open, and a rate limit on the server.
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
  const pathname = usePathname();
  const formRef = useRef<HTMLFormElement>(null);
  const tokenRef = useRef<Promise<string | null> | null>(null);
  const [values, setValues] = useState<QuoteValues>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<Partial<Record<QuoteField, boolean>>>(
    {}
  );
  const [selected, setSelected] = useState<string[]>(
    preselect ? [preselect] : services.slice(0, 1)
  );
  const [status, setStatus] = useState<Status>({ state: "idle" });
  const edit = (fields: string | string[]) =>
    editable("global", global?.id, fields);

  // Fetched once, when someone starts filling the form in
  function getToken() {
    tokenRef.current ??= fetch("/api/quote", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((json: { token?: string } | null) => json?.token ?? null)
      .catch(() => null);
    return tokenRef.current;
  }

  function update(field: QuoteField, value: string) {
    setValues((v) => ({ ...v, [field]: value }));
    // Once a field has shown an error, re-check it as they type so it clears
    if (touched[field]) {
      setErrors((e) => ({
        ...e,
        [field]: validateQuoteField(field, value) ?? undefined,
      }));
    }
  }

  function handleBlur(e: FocusEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const field = e.target.name as QuoteField;
    // Leaving an empty field you never typed in shouldn't shout at you
    if (!values[field] && !touched[field]) return;
    setTouched((t) => ({ ...t, [field]: true }));
    setErrors((errs) => ({
      ...errs,
      [field]: validateQuoteField(field, values[field]) ?? undefined,
    }));
  }

  function toggle(service: string) {
    setSelected((s) =>
      s.includes(service) ? s.filter((x) => x !== service) : [...s, service]
    );
  }

  function inputProps(field: QuoteField) {
    const id = `quote-${field}`;
    return {
      id,
      name: field,
      value: values[field],
      onChange: (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      ) => update(field, e.target.value),
      onBlur: handleBlur,
      "aria-invalid": errors[field] ? true : undefined,
      "aria-describedby": errors[field] ? `${id}-error` : undefined,
    };
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const found = validateQuote(values);
    setErrors(found);
    setTouched({
      name: true,
      phone: true,
      email: true,
      postcode: true,
      message: true,
    });
    const firstInvalid = (Object.keys(EMPTY) as QuoteField[]).find(
      (f) => found[f]
    );
    if (firstInvalid) {
      formRef.current
        ?.querySelector<HTMLElement>(`[name="${firstInvalid}"]`)
        ?.focus();
      return;
    }

    setStatus({ state: "sending" });
    const data = new FormData(e.currentTarget);

    try {
      const token = await getToken();
      const response = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          website: data.get("website"),
          services: selected,
          page: pathname,
          token,
        }),
      });
      const json = await response.json().catch(() => ({}));
      if (!response.ok) {
        if (json.errors) setErrors(json.errors);
        throw new Error(json.error ?? "send failed");
      }

      setStatus({
        state: "sent",
        firstName: values.name.trim().split(" ")[0] || "there",
      });
      setValues(EMPTY);
      setTouched({});
      tokenRef.current = null;
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
              data-directus={edit("quote_heading")}
              className={cn(
                heading.section,
                "text-[clamp(4rem,9vw,7.5rem)] leading-[0.86]"
              )}
            >
              <Headline text={global.quote_heading} />
            </h2>
          )}
          {global?.quote_description && (
            <p
              data-directus={edit("quote_description")}
              className="text-pv-haze max-w-130 text-xl leading-normal lg:text-[1.375rem]"
            >
              {global.quote_description}
            </p>
          )}
          {contact.phone && (
            <a
              href={telHref(contact.phone)}
              data-directus={edit("phone")}
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
              data-directus={edit("email_address")}
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
                <h3
                  data-directus={edit("quote_success_heading")}
                  className="font-pv-display text-5xl leading-none font-extrabold font-stretch-75%"
                >
                  {global?.quote_success_heading}
                </h3>
                <p
                  data-directus={edit("quote_success_message")}
                  className="max-w-110 text-lg leading-normal"
                >
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
                ref={formRef}
                exit={{ opacity: 0, y: -12 }}
                onSubmit={handleSubmit}
                onFocus={() => void getToken()}
                noValidate
                className="flex flex-col gap-4.5"
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field id="quote-name" label="Your name" error={errors.name}>
                    <input
                      {...inputProps("name")}
                      type="text"
                      required
                      maxLength={QUOTE_LIMITS.name}
                      autoComplete="name"
                      className={inputClass}
                    />
                  </Field>
                  <Field id="quote-phone" label="Phone" error={errors.phone}>
                    <input
                      {...inputProps("phone")}
                      type="tel"
                      required
                      maxLength={QUOTE_LIMITS.phone}
                      autoComplete="tel"
                      inputMode="tel"
                      className={inputClass}
                    />
                  </Field>
                  <Field id="quote-email" label="Email" error={errors.email}>
                    <input
                      {...inputProps("email")}
                      type="email"
                      required
                      maxLength={QUOTE_LIMITS.email}
                      autoComplete="email"
                      className={inputClass}
                    />
                  </Field>
                  <Field
                    id="quote-postcode"
                    label="Postcode"
                    error={errors.postcode}
                  >
                    <input
                      {...inputProps("postcode")}
                      type="text"
                      required
                      maxLength={QUOTE_LIMITS.postcode}
                      autoComplete="postal-code"
                      autoCapitalize="characters"
                      className={cn(inputClass, "uppercase")}
                    />
                  </Field>
                </div>

                {/* Spam trap: hidden from people, filled in by bots */}
                <div className="hidden" aria-hidden="true">
                  <label htmlFor="quote-website">Website</label>
                  <input
                    id="quote-website"
                    name="website"
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                  />
                </div>

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

                <Field
                  id="quote-message"
                  label="Anything we should know?"
                  error={errors.message}
                >
                  <textarea
                    {...inputProps("message")}
                    rows={3}
                    maxLength={QUOTE_LIMITS.message}
                    className={cn(inputClass, "h-auto resize-none py-3.5")}
                  />
                </Field>

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
                  data-directus={edit("quote_submit_text")}
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
                    : global?.quote_submit_text}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
