import { NextRequest, NextResponse } from "next/server";
import { directusUrl, type Submission } from "@/lib/directus";

const formBotToken = process.env.DIRECTUS_FORM_BOT_TOKEN;

// Match the character limits on the Directus submissions fields
const LIMITS = {
  name: 80,
  email: 250,
  phone: 30,
  postcode: 10,
  message: 2000,
} as const;

function text(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

/**
 * POST /api/quote
 *
 * Saves a quote request to the Directus `submissions` collection using the
 * create-only Form Bot token. A Directus flow emails it to Power-Vac.
 */
export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  // Spam trap: people never see the website field, bots fill it in
  if (text(body.website, 200)) {
    return NextResponse.json({ ok: true });
  }

  const services = Array.isArray(body.services)
    ? body.services
        .filter((s): s is string => typeof s === "string")
        .map((s) => s.slice(0, 40))
        .slice(0, 10)
    : [];

  const submission: Submission = {
    name: text(body.name, LIMITS.name),
    email: text(body.email, LIMITS.email),
    phone: text(body.phone, LIMITS.phone),
    postcode: text(body.postcode, LIMITS.postcode).toUpperCase(),
    services,
    subject:
      `Quote request${services.length ? `: ${services.join(", ")}` : ""}`.slice(
        0,
        150
      ),
    message: text(body.message, LIMITS.message),
  };

  if (
    !submission.name ||
    !submission.phone ||
    !submission.postcode ||
    !/^\S+@\S+\.\S+$/.test(submission.email)
  ) {
    return NextResponse.json(
      { error: "Please fill in your name, phone, email and postcode." },
      { status: 400 }
    );
  }

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
