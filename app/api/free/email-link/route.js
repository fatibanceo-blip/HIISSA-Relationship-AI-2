import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { EXPERIENCE_REGISTRY } from "../../../../lib/experience-registry";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Dedicated FREE sender. Never changes Supabase's shared Magic Link template.
// Intentionally unavailable until Staging-only credentials and abuse protection
// are configured and verified. Do not expose the Supabase secret to the client.
export async function POST(request) {
  if (process.env.HIISSA_FREE_EMAIL_ENABLED !== "true") {
    return NextResponse.json({ error: "FREE email is not enabled in this environment." }, { status: 503 });
  }

  const required = [
    "NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_SECRET_KEY",
    "RESEND_API_KEY", "HIISSA_FREE_EMAIL_FROM", "TURNSTILE_SECRET_KEY",
    "HIISSA_FREE_EMAIL_ORIGIN",
  ];
  if (required.some((name) => !process.env[name])) {
    return NextResponse.json({ error: "FREE email configuration is incomplete." }, { status: 503 });
  }

  const origin = process.env.HIISSA_FREE_EMAIL_ORIGIN;
  let approvedOrigin;
  try {
    approvedOrigin = new URL(origin);
    if (approvedOrigin.protocol !== "https:" || approvedOrigin.origin !== origin.replace(/\/$/, "")) throw Error();
  } catch {
    return NextResponse.json({ error: "FREE email origin is invalid." }, { status: 503 });
  }

  // Origin is only a supplementary browser check; Turnstile is mandatory.
  const requestOrigin = request.headers.get("origin");
  if (requestOrigin !== approvedOrigin.origin) {
    return NextResponse.json({ error: "Request origin is not permitted." }, { status: 403 });
  }

  const raw = await request.text();
  if (raw.length > 4096) return NextResponse.json({ error: "Request too large." }, { status: 413 });
  let body;
  try { body = JSON.parse(raw); } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const captcha = typeof body?.captcha === "string" ? body.captcha : "";
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !captcha) {
    return NextResponse.json({ error: "Enter a valid email and complete the security check." }, { status: 400 });
  }

  const challenge = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ secret: process.env.TURNSTILE_SECRET_KEY, response: captcha }),
    cache: "no-store",
  }).then((r) => r.json()).catch(() => null);
  if (!challenge?.success || (challenge.hostname && challenge.hostname !== approvedOrigin.hostname)) {
    return NextResponse.json({ error: "Security verification failed. Please try again." }, { status: 403 });
  }

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SECRET_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
  const { data, error } = await admin.auth.admin.generateLink({ type: "magiclink", email });
  const tokenHash = data?.properties?.hashed_token;
  if (error || !tokenHash) {
    // Avoid revealing whether the address belongs to an account.
    return NextResponse.json({ error: "We could not send your link. Please try again later." }, { status: 503 });
  }

  const link = new URL(EXPERIENCE_REGISTRY.freeEmail.continueRoute, approvedOrigin);
  link.searchParams.set("token_hash", tokenHash);
  link.searchParams.set("type", "email");
  const safeLink = link.toString().replaceAll("&", "&amp;");
  const sent = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.HIISSA_FREE_EMAIL_FROM,
      to: [email],
      subject: "Your HIISSA Guest sign-in link",
      html: `<h2>Welcome to HIISSA Guest</h2><p>Open this link in the browser you want to use. You will choose when to complete sign-in.</p><p><a href="${safeLink}">Continue to HIISSA Guest</a></p><p>If you did not request this, you can ignore this email.</p>`,
    }),
    cache: "no-store",
  }).catch(() => null);

  if (!sent?.ok) {
    return NextResponse.json({ error: "We could not send your link. Please try again later." }, { status: 503 });
  }
  return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
}
