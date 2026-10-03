import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request) {
  if (process.env.VERCEL_GIT_COMMIT_REF !== "feature/founder-control-room-staging" ||
      process.env.VERCEL_ENV === "production") {
    return new NextResponse(null, { status: 404 });
  }

  let response = NextResponse.json({ signedIn: false }, {
    headers: { "Cache-Control": "no-store" }
  });
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (items) => {
          for (const { name, value, options } of items) {
            response.cookies.set(name, value, options);
          }
        }
      }
    }
  );
  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    return response;
  }
  response = NextResponse.json({
    signedIn: true,
    accountIdSuffix: data.user.id.slice(-8),
    founderAccess: "not assigned",
    nextStep: "Confirm this is your existing HIISSA Staging account."
  }, { headers: { "Cache-Control": "no-store" } });
  return response;
}
