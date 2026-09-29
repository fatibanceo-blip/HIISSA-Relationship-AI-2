// A5.3 preparation only: isolated, read-only readiness checks.
// This module is deliberately not wired into routes or deployed.
// A5.2 acceptance and Founder approval remain prerequisites to activation.

const STAGING_PROJECT_REF = "upcssfmilewwshyxyvdf";
const PRODUCTION_PROJECT_REF = "fozkfuuoudnumbdszkyz";

export function assessAdminStagingReadiness({
  supabaseUrl,
  publishableKey,
  deploymentBranch,
  environmentName,
} = {}) {
  const checks = [
    {
      id: "staging-project",
      passed: typeof supabaseUrl === "string" &&
        new URLSafe(supabaseUrl).hostname ===
          `${STAGING_PROJECT_REF}.supabase.co`,
      reason: "The configured Supabase URL must identify the existing Staging project.",
    },
    {
      id: "not-production",
      passed: typeof supabaseUrl === "string" &&
        !supabaseUrl.includes(PRODUCTION_PROJECT_REF),
      reason: "Production credentials must never be used for Package A Staging.",
    },
    {
      id: "publishable-key",
      passed: typeof publishableKey === "string" &&
        publishableKey.startsWith("sb_publishable_") &&
        publishableKey.length > "sb_publishable_".length,
      reason: "A modern publishable key must be configured. Key ownership needs a separate live check.",
    },
    {
      id: "package-a-branch",
      passed: deploymentBranch === "feature/admin-permissions-package-a",
      reason: "Package A must run from its dedicated branch.",
    },
    {
      id: "staging-environment",
      passed: environmentName === "staging",
      reason: "Package A must target the existing Staging environment.",
    },
  ];

  return {
    readyForLiveVerification: checks.every((check) => check.passed),
    checks,
    // This static assessment NEVER certifies deployment isolation,
    // Supabase key ownership, authenticated access or A5.2 PASS.
    liveConnectionVerified: false,
    deploymentIsolationVerified: false,
    a52Accepted: false,
  };
}

function URLSafe(value) {
  try {
    return new URL(value);
  } catch {
    return { hostname: "" };
  }
}
