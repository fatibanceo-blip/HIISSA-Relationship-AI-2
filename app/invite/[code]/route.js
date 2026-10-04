import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const THIRTY_DAYS_SECONDS = 60 * 60 * 24 * 30;
const REFERRAL_CODE_COOKIE = "hiissa_referral_code";
const REFERRAL_VISIT_COOKIE = "hiissa_referral_visit";

export async function GET(request, context) {
  const requestUrl = new URL(request.url);
  const destination = new URL("/", requestUrl.origin);

  // First-touch attribution: once a browser has a valid referral
  // arrival cookie, a later referral click does not overwrite it.
  const existingCode = request.cookies.get(REFERRAL_CODE_COOKIE)?.value || "";
  const existingVisit = request.cookies.get(REFERRAL_VISIT_COOKIE)?.value || "";

  if (existingCode && existingVisit) {
    return NextResponse.redirect(destination);
  }

  const params = await context.params;
  const code = String(params?.code || "").trim().toUpperCase();

  if (!/^[A-Z0-9]{10}$/.test(code)) {
    return NextResponse.redirect(destination);
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabasePublishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabasePublishableKey) {
    return NextResponse.redirect(destination);
  }

  const visitToken = randomUUID();
  const supabase = createClient(
    supabaseUrl,
    supabasePublishableKey,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );

  const { data: result, error } = await supabase.rpc(
    "record_referral_visit",
    {
      p_code: code,
      p_visit_token: visitToken,
    }
  );

  const response = NextResponse.redirect(destination);

  if (!error && result === "RECORDED") {
    const cookieOptions = {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: THIRTY_DAYS_SECONDS,
    };

    response.cookies.set(
      REFERRAL_CODE_COOKIE,
      code,
      cookieOptions
    );

    response.cookies.set(
      REFERRAL_VISIT_COOKIE,
      visitToken,
      cookieOptions
    );
  }

  return response;
}
