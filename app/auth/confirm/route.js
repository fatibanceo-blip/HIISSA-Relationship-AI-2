import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

export async function GET(request) {
  const requestUrl = new URL(request.url);

  const tokenHash =
    requestUrl.searchParams.get("token_hash");

  const type =
    requestUrl.searchParams.get("type");

  const next =
    requestUrl.searchParams.get("next") || "/";

  const handoffToken =
    requestUrl.searchParams.get("handoff") || "";

  if (!tokenHash || !type) {
    return NextResponse.redirect(
      new URL(
        "/?auth_error=invalid_link",
        requestUrl.origin
      )
    );
  }

  // Build the authenticated destination.
  // If this sign-in belongs to an approved Guest
  // Save & Sync transfer, preserve its opaque
  // one-time handoff token for the authenticated
  // claim step after sign-in succeeds.
  const destination = new URL(
    next,
    requestUrl.origin
  );

  if (handoffToken) {
    destination.searchParams.set(
      "guest_handoff",
      handoffToken
    );
  }

  // This is the exact response that will return
  // the authenticated browser to HIISSA.
  const response =
    NextResponse.redirect(destination);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },

        setAll(cookiesToSet) {
          cookiesToSet.forEach(
            ({ name, value, options }) => {
              response.cookies.set(
                name,
                value,
                options
              );
            }
          );
        },
      },
    }
  );

  const { error } =
    await supabase.auth.verifyOtp({
      type,
      token_hash: tokenHash,
    });

  if (error) {
    return NextResponse.redirect(
      new URL(
        "/?auth_error=verification_failed",
        requestUrl.origin
      )
    );
  }

  // Referral attribution is deliberately separate from
  // authentication. A referral cookie never authenticates
  // anyone. Only after the normal Magic-Link verification
  // succeeds do we attempt to connect an eligible referral
  // arrival to the authenticated account.
  const referralCode =
    request.cookies.get(
      "hiissa_referral_code"
    )?.value || "";

  const referralVisit =
    request.cookies.get(
      "hiissa_referral_visit"
    )?.value || "";

  if (
    /^[A-Z0-9]{10}$/.test(referralCode) &&
    /^[0-9a-fA-F-]{36}$/.test(referralVisit)
  ) {
    const { error: referralError } =
      await supabase.rpc(
        "claim_referral_attribution",
        {
          p_code: referralCode,
          p_visit_token: referralVisit,
        }
      );

    // Clear the short-lived attribution cookies once the
    // claim was processed. If the database call itself
    // fails, preserve them so a later secure sign-in can
    // retry rather than silently losing attribution.
    if (!referralError) {
      response.cookies.delete(
        "hiissa_referral_code"
      );

      response.cookies.delete(
        "hiissa_referral_visit"
      );
    }
  }

  return response;
}
