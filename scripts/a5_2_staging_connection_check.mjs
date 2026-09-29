#!/usr/bin/env node
// A5.2: manually run only after separate Founder approval.
// No deployment, database writes, authentication changes, or secret output.
const EXPECTED_STAGING = "https://upcssfmilewwshyxyvdf.supabase.co";
const FORBIDDEN_PRODUCTION = "https://fozkfuuoudnumbdszkyz.supabase.co";
const url = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").replace(/\/$/, "");
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "";
function result(name, ok) {
  console.log(`${ok ? "PASS" : "FAIL"}: ${name}`);
  if (!ok) process.exitCode = 1;
}
result("Supabase URL points exclusively to the approved Staging project", url === EXPECTED_STAGING && url !== FORBIDDEN_PRODUCTION);
result("Modern publishable key is configured", key.startsWith("sb_publishable_"));
if (process.exitCode) {
  console.error("STOP: configuration preflight failed; no network requests made.");
  process.exit(1);
}
try {
  const response = await fetch(`${EXPECTED_STAGING}/auth/v1/health`, {
    headers: { apikey: key },
    signal: AbortSignal.timeout(10000),
    redirect: "error"
  });
  result("Read-only Staging Auth health request succeeded", response.ok);
} catch {
  result("Read-only Staging Auth health request succeeded", false);
}
console.log("This read-only check requires no server secret and does NOT verify Preview deployment isolation.");
