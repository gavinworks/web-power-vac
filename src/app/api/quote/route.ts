import { createHmac, timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { directusUrl, type Submission } from "@/lib/directus";
import {
  QUOTE_LIMITS,
  formatPostcode,
  validateQuote,
} from "@/lib/quote-validation";

const formBotToken = process.env.DIRECTUS_FORM_BOT_TOKEN;
const signingSecret =
  process.env.QUOTE_FORM_SECRET || process.env.REVALIDATE_SECRET;

// Bot protection: a person takes a few seconds to fill the form in, and a
// form left open for more than a few hours gets a fresh token on next use.
const MIN_FILL_MS = 3_000;
const MAX_TOKEN_AGE_MS = 6 * 60 * 60 * 1000;
// Best effort only: each serverless instance keeps its own count
const RATE_LIMIT = { max: 5, windowMs: 10 * 60 * 1000 };
const recent = new Map<string, number[]>();

function sign(timestamp: string) {
  return createHmac("sha256", signingSecret ?? "")
    .update(`quote:${timestamp}`)
    .digest("base64url");
}

/** Checks the form token and returns how long the form was open, or null. */
function tokenAge(token: unknown): number | null {
  if (!signingSecret || typeof token !== "string") return null;
  const [timestamp, signature] = token.split(".");
  if (!timestamp || !signature) return null;
  const expected = Buffer.from(sign(timestamp));
  const given = Buffer.from(signature);
  if (expected.length !== given.length || !timingSafeEqual(expected, given))
    return null;
  return Date.now() - Number(timestamp);
}

function rateLimited(ip: string) {
  const now = Date.now();
  const hits = (recent.get(ip) ?? []).filter(
    (t) => now - t < RATE_LIMIT.windowMs
  );
  hits.push(now);
  recent.set(ip, hits);
  return hits.length > RATE_LIMIT.max;
}

function text(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

/**
 * GET /api/quote
 *
 * Issues a signed, timestamped token. The form fetches one when someone
 * starts filling it in and sends it back with the request.
 */
export async function GET() {
  if (!signingSecret) {
    console.error("QUOTE_FORM_SECRET (or REVALIDATE_SECRET) is not configured");
    return NextResponse.json({ error: "Form not connected" }, { status: 503 });
  }
  const timestamp = String(Date.now());
  return NextResponse.json(
    { token: `${timestamp}.${sign(timestamp)}` },
    { headers: { "Cache-Control": "no-store" } }
  );
}

/**
 * POST /api/quote
 *
 * Saves a quote request to the Directus `submissions` collection using the
 * create-only Form Bot token. The "[Website] New Quote Request" flow then
 * notifies Power-Vac in Directus and by email.
 */
export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  // Spam trap: people never see the website field, bots fill it in. Bots get
  // a normal-looking reply so they don't learn anything.
  if (text(body.website, 200)) {
    return NextResponse.json({ ok: true });
  }

  const age = tokenAge(body.token);
  if (age === null || age > MAX_TOKEN_AGE_MS) {
    return NextResponse.json(
      {
        error: "This form has expired. Please refresh the page and try again.",
      },
      { status: 400 }
    );
  }
  if (age < MIN_FILL_MS) {
    return NextResponse.json({ ok: true });
  }

  const ip =
    request.headers.get("x-nf-client-connection-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    "unknown";
  if (rateLimited(ip)) {
    return NextResponse.json(
      { error: "You’ve sent a few requests already. Please give us a ring." },
      { status: 429 }
    );
  }

  const values = {
    name: text(body.name, QUOTE_LIMITS.name),
    phone: text(body.phone, QUOTE_LIMITS.phone),
    email: text(body.email, QUOTE_LIMITS.email),
    postcode: text(body.postcode, QUOTE_LIMITS.postcode),
    message: text(body.message, QUOTE_LIMITS.message),
  };
  const errors = validateQuote(values);
  if (Object.keys(errors).length > 0) {
    return NextResponse.json(
      { error: "Please check the highlighted fields.", errors },
      { status: 400 }
    );
  }

  // Link-stuffed messages are almost always spam
  if ((values.message.match(/https?:\/\//gi) ?? []).length > 2) {
    return NextResponse.json({ ok: true });
  }

  const services = Array.isArray(body.services)
    ? body.services
        .filter((s): s is string => typeof s === "string")
        .map((s) => s.slice(0, 40))
        .slice(0, 10)
    : [];

  const submission: Submission = {
    ...values,
    postcode: formatPostcode(values.postcode),
    services,
    subject:
      `Quote request${services.length ? `: ${services.join(", ")}` : ""}`.slice(
        0,
        150
      ),
    page: text(body.page, 200),
  };

  if (!formBotToken) {
    console.error(
      "DIRECTUS_FORM_BOT_TOKEN is not configured; quote request not saved"
    );
    return NextResponse.json({ error: "Form not connected" }, { status: 503 });
  }

  try {
    const response = await fetch(`${directusUrl}/items/submissions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${formBotToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(submission),
      cache: "no-store",
    });

    if (!response.ok) {
      console.error(
        "Failed to save quote request:",
        response.status,
        await response.text()
      );
      return NextResponse.json(
        { error: "Could not save request" },
        { status: 502 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error saving quote request:", error);
    return NextResponse.json(
      { error: "Could not save request" },
      { status: 502 }
    );
  }
}
