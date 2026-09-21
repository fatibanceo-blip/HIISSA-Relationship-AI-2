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

  if (!tokenHash || !type) {
    return NextResponse.redirect(
      new URL(
        "/?auth_error=invalid_link",
        requestUrl.origin
      )
    );
  }

  // This is the exact response that will return
  // the authenticated browser to HIISSA.
  const response = NextResponse.redirect(
    new URL(next, requestUrl.origin)
  );

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

  return response;
}
