import { NextResponse } from "next/server";
import { assessAdminStagingReadiness } from "../../../../lib/admin/staging-readiness.js";

// Temporary A5.2 read-only diagnostic. No credentials, user data or raw
// configuration values are returned. This route is not an Admin API.
export const dynamic = "force-dynamic";

export async function GET() {
  const branch = process.env.VERCEL_GIT_COMMIT_REF || "";
  const environment = process.env.VERCEL_TARGET_ENV || process.env.VERCEL_ENV || "";
  // This diagnostic must not exist as a usable endpoint outside the
  // approved Package A Staging deployment.
  if (branch !== "feature/founder-control-room-staging" || environment !== "staging") {
    return new NextResponse(null, { status: 404 });
  }

  const assessment = assessAdminStagingReadiness({
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    publishableKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    deploymentBranch: branch,
    environmentName: environment,
  });

  // Health endpoint is read-only; a successful response confirms that the
  // deployed publishable key is accepted by the configured Staging Auth API.
  let authHealthPassed = false;
  if (assessment.readyForLiveVerification) {
    try {
      const response = await fetch(
        "https://upcssfmilewwshyxyvdf.supabase.co/auth/v1/health",
        {
          headers: { apikey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY },
          cache: "no-store",
          redirect: "error",
          signal: AbortSignal.timeout(8000),
        }
      );
      authHealthPassed = response.ok;
    } catch {
      authHealthPassed = false;
    }
  }

  const passed = assessment.readyForLiveVerification && authHealthPassed;
  return NextResponse.json(
    {
      diagnostic: "Package A Staging A5.2",
      status: passed ? "PASS" : "HOLD",
      checks: assessment.checks.map(({ id, passed: ok }) => ({ id, passed: ok })),
      authHealthPassed,
      // Does not test server-secret ownership, DB writes or RLS.
      scope: "read-only deployed public-key and Auth health verification",
    },
    { status: passed ? 200 : 503, headers: { "Cache-Control": "no-store" } }
  );
}
