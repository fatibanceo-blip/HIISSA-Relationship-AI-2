/**
 * HIISSA Experience Registry — additive implementation checkpoint.
 * Founder lock: never modify a verified feature merely to add another one.
 * This registry describes integrations; it does not by itself isolate shared services.
 * Keep the existing Guest Save & Sync implementation and email template untouched.
 */
export const EXPERIENCE_REGISTRY = Object.freeze({
  freeEmail: Object.freeze({
    id: "free.email",
    status: "in-development",
    entry: "/free",
    sendEndpoint: "/api/free/email-link",
    continueRoute: "/free/auth/continue",
    confirmRoute: "/free/auth/confirm",
    successRoute: "/free/welcome",
    identityProvider: "existing-supabase-identity",
    deliveryProvider: "dedicated-free-email-sender",
    requires: Object.freeze(["identity", "email-delivery", "abuse-protection"]),
    protectedDependencies: Object.freeze([
      "guest-save-sync",
      "guest-handoff",
      "shared-auth-continue",
      "shared-auth-confirm",
      "production-magic-link-template",
      "production-supabase-config",
    ]),
    releaseGate: "founder-approval-after-staging-regression",
  }),
});
