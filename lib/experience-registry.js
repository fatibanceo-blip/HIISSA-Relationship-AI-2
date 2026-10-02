/**
 * HIISSA Experience Registry — canonical expansion foundation.
 *
 * FOUNDER MANDATORY STANDARD:
 * - Every substantial HIISSA feature/experience/major entry point gets ONE canonical registry identity.
 * - Reuse the canonical feature from multiple doors; never duplicate working implementations merely to add access.
 * - Registry identity does NOT grant entitlement or private-data permission.
 * - Every applicable registry entry must carry a Control Room operational-intelligence contract.
 * - "Contract defined" is not the same as "dashboard wired" or "Production verified".
 * - Existing working systems are backfilled additively; do not rewrite them simply to modernise metadata.
 * - Keep Guest Save & Sync, Production auth and other verified dependencies untouched unless separately approved.
 */

export const CONTROL_ROOM_MODULES = Object.freeze({
  overview: "overview-control-room",
  usersIdentity: "users-identity",
  subscriptionsAccess: "subscriptions-access",
  feedbackRecommendations: "feedback-recommendations",
  safetyPrivacyModeration: "safety-privacy-moderation",
  failuresReliability: "failures-reliability",
  authSync: "authentication-synchronisation-health",
  aiProduct: "hiissa-ai-product-intelligence",
  systemOperations: "system-operations",
  adminSecurityAudit: "admin-security-audit",
});

export const REGISTRY_STANDARD = Object.freeze({
  mandatory: true,
  oneCanonicalIdentityPerCapability: true,
  noDuplicateImplementationForSecondaryRoutes: true,
  entitlementSeparateFromIdentity: true,
  permissionsSeparateFromEntitlement: true,
  controlRoomContractRequired: true,
  backfillExistingFeaturesAdditively: true,
  founderRule:
    "Build HIISSA so tomorrow's idea can be added without breaking today's working feature.",
});

function controlRoomContract({
  modules,
  healthSignals,
  failureSignals,
  recoveryClassification,
  founderOversight,
  operationalScope = "feature",
}) {
  return Object.freeze({
    status: "contract-defined-not-yet-wired-to-full-control-room",
    operationalScope,
    modules: Object.freeze(modules),
    healthSignals: Object.freeze(healthSignals),
    failureSignals: Object.freeze(failureSignals),
    safeAutomaticBehaviour:
      "Only pre-approved, bounded, non-destructive recovery may run automatically.",
    retryBounds:
      "Retries must be explicitly bounded per capability before operational activation.",
    recoveryVerification:
      "A retry/recovery is not success until the feature is retested and evidence confirms healthy operation.",
    autoStop:
      "Stop automatic recovery when retry bounds, safety, privacy, permission or data-integrity gates are reached.",
    humanIntervention:
      "Escalate with human-readable state, impact, attempted recovery and exact authorised next action.",
    founderOversight,
    auditEvidence:
      "Record material status transitions, authorised recovery actions and verification without exposing secrets or private conversation content.",
  });
}

const sharedPlusControlRoomModules = [
  CONTROL_ROOM_MODULES.overview,
  CONTROL_ROOM_MODULES.subscriptionsAccess,
  CONTROL_ROOM_MODULES.failuresReliability,
  CONTROL_ROOM_MODULES.aiProduct,
  CONTROL_ROOM_MODULES.systemOperations,
  CONTROL_ROOM_MODULES.adminSecurityAudit,
];

export const EXPERIENCE_REGISTRY = Object.freeze({
  guestWelcome: Object.freeze({
    id: "guest.welcome",
    status: "implemented-existing",
    accessFamily: "guest",
    entry: "/talk?guest=1",
    entitlement: "guest",
    canonicalDependencies: Object.freeze([
      "existing-talk-experience",
      "existing-explore-experience",
    ]),
    protectedDependencies: Object.freeze(["guest-save-sync", "guest-handoff"]),
    controlRoom: controlRoomContract({
      modules: [
        CONTROL_ROOM_MODULES.overview,
        CONTROL_ROOM_MODULES.failuresReliability,
        CONTROL_ROOM_MODULES.authSync,
        CONTROL_ROOM_MODULES.aiProduct,
        CONTROL_ROOM_MODULES.systemOperations,
      ],
      healthSignals: [
        "guest-entry-route-reachable",
        "guest-talk-entry-available",
        "guest-explore-entry-available",
      ],
      failureSignals: [
        "guest-entry-route-failure",
        "guest-talk-entry-failure",
        "guest-explore-entry-failure",
      ],
      recoveryClassification: "SAFE_WITH_LIMIT_OR_HUMAN_REQUIRED",
      founderOversight: "L1 normally; L2/L3 when impact or authorised action requires it",
      operationalScope: "entry-and-routing-only-until-backfill-completes",
    }),
  }),

  freeEmail: Object.freeze({
    id: "free.email",
    status: "founder-tested-on-dedicated-free-preview",
    accessFamily: "free",
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
    controlRoom: controlRoomContract({
      modules: [
        CONTROL_ROOM_MODULES.overview,
        CONTROL_ROOM_MODULES.failuresReliability,
        CONTROL_ROOM_MODULES.authSync,
        CONTROL_ROOM_MODULES.systemOperations,
        CONTROL_ROOM_MODULES.adminSecurityAudit,
      ],
      healthSignals: [
        "free-entry-reachable",
        "abuse-protection-success",
        "email-request-success",
        "secure-continuation-success",
        "free-auth-confirm-success",
      ],
      failureSignals: [
        "free-entry-failure",
        "abuse-protection-failure",
        "email-delivery-failure",
        "secure-continuation-failure",
        "free-auth-confirm-failure",
      ],
      recoveryClassification: "SAFE_WITH_LIMIT_OR_HUMAN_REQUIRED",
      founderOversight: "L1 healthy evidence; L2 material degradation; L3 consequential recovery/release action",
    }),
  }),

  freeWelcome: Object.freeze({
    id: "free.welcome",
    status: "founder-tested-on-dedicated-free-preview",
    accessFamily: "free",
    entry: "/free/welcome",
    entitlement: "free",
    reuses: Object.freeze([
      "existing-talk-experience",
      "existing-explore-experience",
      "existing-my-hiissa-architecture",
    ]),
    controlRoom: controlRoomContract({
      modules: [
        CONTROL_ROOM_MODULES.overview,
        CONTROL_ROOM_MODULES.subscriptionsAccess,
        CONTROL_ROOM_MODULES.failuresReliability,
        CONTROL_ROOM_MODULES.aiProduct,
        CONTROL_ROOM_MODULES.systemOperations,
      ],
      healthSignals: [
        "authenticated-free-welcome-reachable",
        "free-navigation-contract-available",
      ],
      failureSignals: [
        "free-welcome-route-failure",
        "free-navigation-destination-failure",
        "free-entitlement-mismatch",
      ],
      recoveryClassification: "HUMAN_REQUIRED_FOR_ENTITLEMENT_CHANGES",
      founderOversight: "L1 normal health; L2 material user-impact; L3 entitlement/release changes",
      operationalScope: "welcome-and-routing; deeper feature backfill remains pending",
    }),
  }),

  plusWelcome: Object.freeze({
    id: "plus.welcome",
    status: "preview-under-founder-test",
    accessFamily: "plus",
    entry: "/plus/welcome",
    welcomeRoute: "/plus/welcome",
    entitlement: "plus",
    identityProvider: "existing-supabase-identity",
    subscriptionActivation: "off",
    reuses: Object.freeze([
      "existing-talk-experience",
      "existing-explore-experience",
      "existing-my-hiissa-architecture",
      "existing-tools-and-resources-architecture",
    ]),
    requiresBeforeCommercialRelease: Object.freeze([
      "plus-entitlement-reconciliation",
      "founder-preview-approval",
      "subscription-release-approval",
    ]),
    protectedDependencies: Object.freeze([
      "free-email-journey",
      "guest-save-sync",
      "production-auth",
      "production-subscription-state",
      "together-consent-boundaries",
    ]),
    releaseGate: "founder-approval-after-preview-and-entitlement-reconciliation",
    controlRoom: controlRoomContract({
      modules: sharedPlusControlRoomModules,
      healthSignals: [
        "plus-welcome-route-reachable",
        "plus-registered-destinations-resolve",
      ],
      failureSignals: [
        "plus-welcome-route-failure",
        "plus-destination-route-failure",
        "plus-entitlement-mismatch",
      ],
      recoveryClassification: "HUMAN_REQUIRED_FOR_ENTITLEMENT_OR_RELEASE_CHANGES",
      founderOversight: "L1 Preview health; L2 material degradation; L3 entitlement/Production release changes",
      operationalScope: "welcome-surface-and-routing-until-plus-feature-reconciliation",
    }),
  }),

  plusTalkEntry: Object.freeze({
    id: "plus.talk.entry",
    status: "preview-routing",
    accessFamily: "plus",
    primaryHome: "plus.welcome",
    route: "/talk?plusTalk=1",
    provides: "existing-talk-experience",
    implementationRule: "reuse-canonical-talk-never-duplicate",
    entitlement: "plus-context-preview; commercial entitlement not activated",
    controlRoom: controlRoomContract({
      modules: sharedPlusControlRoomModules,
      healthSignals: ["plus-talk-entry-opens-canonical-talk-directly"],
      failureSignals: [
        "plus-talk-entry-shows-generic-public-opening",
        "plus-talk-canonical-route-failure",
      ],
      recoveryClassification: "SAFE_WITH_LIMIT_OR_HUMAN_REQUIRED",
      founderOversight: "L1 Preview health; L2 routing degradation; L3 consequential release change",
      operationalScope: "routing-entry-only",
    }),
  }),

  plusExploreEntry: Object.freeze({
    id: "plus.explore.entry",
    status: "preview-routing",
    accessFamily: "plus",
    primaryHome: "plus.welcome",
    route: "/talk?plusExplore=1",
    provides: "existing-explore-experience",
    implementationRule: "reuse-canonical-explore-never-duplicate",
    entitlement: "plus-context-preview; commercial entitlement not activated",
    controlRoom: controlRoomContract({
      modules: sharedPlusControlRoomModules,
      healthSignals: ["plus-explore-entry-opens-canonical-explore-directly"],
      failureSignals: [
        "plus-explore-entry-shows-generic-public-opening",
        "plus-explore-canonical-route-failure",
      ],
      recoveryClassification: "SAFE_WITH_LIMIT_OR_HUMAN_REQUIRED",
      founderOversight: "L1 Preview health; L2 routing degradation; L3 consequential release change",
      operationalScope: "routing-entry-only",
    }),
  }),

  plusMyJourney: Object.freeze({
    id: "plus.my-journey",
    status: "visual-entry-approved-mapping-pending",
    accessFamily: "plus",
    primaryHome: "plus.welcome",
    entitlement: "plus",
    featureMapping: "pending-founder-reconciliation-and-brainstorm",
    implementationRule: "do-not-invent-or-duplicate-underlying-experiences",
    controlRoom: controlRoomContract({
      modules: sharedPlusControlRoomModules,
      healthSignals: ["visual-entry-present"],
      failureSignals: ["visual-entry-missing-or-broken"],
      recoveryClassification: "HUMAN_REQUIRED",
      founderOversight: "L1 until feature mapping is approved; later contract must be expanded",
      operationalScope: "visual-entry-only",
    }),
  }),

  plusGuidedSupport: Object.freeze({
    id: "plus.guided-support",
    status: "visual-entry-approved-mapping-pending",
    accessFamily: "plus",
    primaryHome: "plus.welcome",
    entitlement: "plus",
    featureMapping: "pending-founder-reconciliation-and-brainstorm",
    implementationRule: "do-not-invent-or-duplicate-underlying-experiences",
    controlRoom: controlRoomContract({
      modules: sharedPlusControlRoomModules,
      healthSignals: ["visual-entry-present"],
      failureSignals: ["visual-entry-missing-or-broken"],
      recoveryClassification: "HUMAN_REQUIRED",
      founderOversight: "L1 until feature mapping is approved; later contract must be expanded",
      operationalScope: "visual-entry-only",
    }),
  }),

  plusToolsResources: Object.freeze({
    id: "plus.tools-resources",
    status: "visual-entry-approved-mapping-pending",
    accessFamily: "plus",
    primaryHome: "plus.welcome",
    entitlement: "plus",
    featureMapping: "pending-founder-reconciliation-and-brainstorm",
    implementationRule: "do-not-invent-or-duplicate-underlying-experiences",
    controlRoom: controlRoomContract({
      modules: sharedPlusControlRoomModules,
      healthSignals: ["visual-entry-present"],
      failureSignals: ["visual-entry-missing-or-broken"],
      recoveryClassification: "HUMAN_REQUIRED",
      founderOversight: "L1 until feature mapping is approved; later contract must be expanded",
      operationalScope: "visual-entry-only",
    }),
  }),

  plusAnalytics: Object.freeze({
    id: "plus.my-analytics",
    status: "visual-entry-approved-mapping-pending",
    accessFamily: "plus",
    primaryHome: "plus.welcome",
    entitlement: "plus",
    featureMapping: "pending-founder-reconciliation-and-brainstorm",
    privacyRule:
      "No scoring, diagnosis or invented private conclusions; exact data contract requires Founder reconciliation.",
    implementationRule: "do-not-invent-or-duplicate-underlying-intelligence",
    controlRoom: controlRoomContract({
      modules: sharedPlusControlRoomModules,
      healthSignals: ["visual-entry-present"],
      failureSignals: ["visual-entry-missing-or-broken"],
      recoveryClassification: "HUMAN_REQUIRED",
      founderOversight: "L1 until feature/data mapping is approved; later contract must be expanded",
      operationalScope: "visual-entry-only",
    }),
  }),

  togetherWelcome: Object.freeze({
    id: "together.welcome",
    status: "visual-reference-preserved-not-yet-implemented",
    accessFamily: "together",
    plannedRoute: "/together/welcome",
    entitlement: "together",
    consentRule:
      "Partner-private, shared and other-partner-private boundaries must remain separate; identity never grants unrestricted shared/private access.",
    implementationRule:
      "Register and design before implementation; reuse canonical features; do not weaken consent boundaries.",
    controlRoom: controlRoomContract({
      modules: [
        CONTROL_ROOM_MODULES.overview,
        CONTROL_ROOM_MODULES.subscriptionsAccess,
        CONTROL_ROOM_MODULES.safetyPrivacyModeration,
        CONTROL_ROOM_MODULES.failuresReliability,
        CONTROL_ROOM_MODULES.aiProduct,
        CONTROL_ROOM_MODULES.systemOperations,
        CONTROL_ROOM_MODULES.adminSecurityAudit,
      ],
      healthSignals: ["not-applicable-until-together-welcome-is-implemented"],
      failureSignals: ["consent-boundary-risk", "shared-private-routing-risk"],
      recoveryClassification: "FOUNDER_REQUIRED_FOR_CONSENT_OR_PRIVACY_ARCHITECTURE_CHANGE",
      founderOversight: "L3 for consent/privacy architecture changes",
      operationalScope: "reserved-contract-before-implementation",
    }),
  }),
});
