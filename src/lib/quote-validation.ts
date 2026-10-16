/**
 * Quote form rules, shared by the form (checked as people leave each field)
 * and /api/quote (checked again on the server). Limits match the Directus
 * `submissions` fields.
 */

export const QUOTE_LIMITS = {
  name: 80,
  email: 250,
  phone: 30,
  postcode: 10,
  message: 2000,
} as const;

export type QuoteField = "name" | "phone" | "email" | "postcode" | "message";

export interface QuoteValues {
  name: string;
  phone: string;
  email: string;
  postcode: string;
  message: string;
}

// UK numbers: 0 or +44 then 9 or 10 digits, ignoring spaces, dashes and brackets
const PHONE = /^(?:\+44|0)\d{9,10}$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
// Full UK postcode, with or without the space
const POSTCODE = /^[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}$/i;

/** The error for one field, or null when it's fine. */
export function validateQuoteField(
  field: QuoteField,
  raw: string
): string | null {
  const value = raw.trim();
  switch (field) {
    case "name":
      if (!value) return "Enter your name.";
      if (value.length < 2) return "Enter your full name.";
      if (value.length > QUOTE_LIMITS.name)
        return `Your name must be ${QUOTE_LIMITS.name} characters or less.`;
      return null;
    case "phone":
      if (!value) return "Enter a phone number so we can call you back.";
      if (!PHONE.test(value.replace(/[\s()-]/g, "")))
        return "Enter a UK phone number, like 01603 339225 or 07123 456789.";
      return null;
    case "email":
      if (!value) return "Enter your email address.";
      if (value.length > QUOTE_LIMITS.email || !EMAIL.test(value))
        return "Enter an email address like name@example.com.";
      return null;
    case "postcode":
      if (!value) return "Enter your postcode.";
      if (!POSTCODE.test(value)) return "Enter a full postcode, like NR1 1AA.";
      return null;
    case "message":
      if (value.length > QUOTE_LIMITS.message)
        return `Keep this to ${QUOTE_LIMITS.message} characters or less.`;
      return null;
  }
}

export function validateQuote(
  values: QuoteValues
): Partial<Record<QuoteField, string>> {
  const errors: Partial<Record<QuoteField, string>> = {};
  for (const field of Object.keys(values) as QuoteField[]) {
    const error = validateQuoteField(field, values[field]);
    if (error) errors[field] = error;
  }
  return errors;
}

/** Tidies a postcode into its standard form, e.g. "nr11aa" becomes "NR1 1AA". */
export function formatPostcode(value: string): string {
  const compact = value.replace(/\s+/g, "").toUpperCase();
  return compact.length > 3
    ? `${compact.slice(0, -3)} ${compact.slice(-3)}`
    : compact;
}
