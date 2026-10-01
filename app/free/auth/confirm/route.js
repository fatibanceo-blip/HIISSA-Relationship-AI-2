import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

// FREE-only verification. Reuses the same permanent Supabase identity.
// Does not read or modify Guest handoff or existing Save & Sync routes.
export async function GET(request) {
  const incoming = new URL(request.url);
  const tokenHash = incoming.searchParams.get("token_hash");
  if (!tokenHash) return NextResponse.redirect(new URL("/free?auth_error=invalid_link",incoming.origin));
  const destination = new URL("/free/welcome",incoming.origin);
  const response = NextResponse.redirect(destination);
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    { cookies: {
      getAll() { return request.cookies.getAll(); },
      setAll(cookies) { cookies.forEach(({name,value,options})=>response.cookies.set(name,value,options)); },
    }}
  );
  const { error } = await supabase.auth.verifyOtp({ type:"email",token_hash:tokenHash });
  if (error) return NextResponse.redirect(new URL("/free?auth_error=verification_failed",incoming.origin));
  return response;
}
