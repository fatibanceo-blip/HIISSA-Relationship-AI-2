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

const sharedTogetherControlRoomModules = [
  CONTROL_ROOM_MODULES.overview,
  CONTROL_ROOM_MODULES.subscriptionsAccess,
  CONTROL_ROOM_MODULES.safetyPrivacyModeration,
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
    status: "preview-under-founder-review",
    accessFamily: "together",
    entry: "/together/welcome",
    welcomeRoute: "/together/welcome",
    entitlement: "together",
    subscriptionActivation: "off",
    identityProvider: "existing-supabase-identity",
    consentRule:
      "Identity is not permission. Participant-private, shared-space and other-participant-private boundaries remain separate.",
    implementationRule:
      "Welcome surface first. Register shared destinations now; do not fake partner linking, shared conversation or consent transfer before their architecture is implemented.",
    protectedDependencies: Object.freeze([
      "free-email-journey",
      "plus-welcome",
      "guest-save-sync",
      "production-auth",
      "production-subscription-state",
      "private-my-hiissa-data",
      "together-consent-boundaries",
    ]),
    requiresBeforeCommercialRelease: Object.freeze([
      "together-entitlement-reconciliation",
      "partner-linking-architecture",
      "shared-space-permission-enforcement",
      "partial-declined-consent-safe-incomplete-resolution",
      "founder-preview-approval",
      "subscription-release-approval",
    ]),
    releaseGate:
      "founder-approval-after-preview-consent-permission-and-entitlement-reconciliation",
    controlRoom: controlRoomContract({
      modules: sharedTogetherControlRoomModules,
      healthSignals: [
        "together-welcome-route-reachable",
        "together-registered-destinations-visible",
      ],
      failureSignals: [
        "together-welcome-route-failure",
        "together-entitlement-mismatch",
        "consent-boundary-risk",
        "shared-private-routing-risk",
      ],
      recoveryClassification:
        "FOUNDER_REQUIRED_FOR_CONSENT_PRIVACY_ENTITLEMENT_OR_RELEASE_CHANGES",
      founderOversight:
        "L1 Preview health; L2 material degradation; L3 consent/privacy/entitlement/Production release changes",
      operationalScope:
        "welcome-surface-and-registered-entry-points; shared-space engine not yet implemented",
    }),
  }),

  togetherSharedConversationEntry: Object.freeze({
    id: "together.shared-conversation.entry",
    status: "visual-entry-registered-not-yet-activated",
    accessFamily: "together",
    primaryHome: "together.welcome",
    plannedDestination: "canonical-together-shared-conversation",
    entitlement: "together",
    permissionBoundary:
      "Requires explicit shared-space membership and consent architecture. Never route into ordinary personal Talk as a substitute.",
    implementationRule:
      "Do not activate until partner linking, shared-space identity/permission and consent controls are approved and implemented.",
    controlRoom: controlRoomContract({
      modules: sharedTogetherControlRoomModules,
      healthSignals: ["visual-entry-present"],
      failureSignals: [
        "visual-entry-missing-or-broken",
        "personal-talk-used-as-fake-shared-conversation",
        "shared-private-boundary-risk",
      ],
      recoveryClassification:
        "FOUNDER_REQUIRED_FOR_SHARED_SPACE_OR_CONSENT_ACTIVATION",
      founderOversight:
        "L1 visual health; L3 shared-space/consent activation or privacy changes",
      operationalScope: "visual-entry-only",
    }),
  }),

  togetherExploreEntry: Object.freeze({
    id: "together.explore.entry",
    status: "visual-entry-registered-mapping-pending",
    accessFamily: "together",
    primaryHome: "together.welcome",
    entitlement: "together",
    featureMapping:
      "pending-founder-reconciliation-of-together-experiences-and-consent-rules",
    implementationRule:
      "Reuse canonical TOGETHER experiences through the Registry; do not copy personal Explore or invent shared permissions.",
    permissionBoundary:
      "Only shared-safe experiences and data explicitly authorised for the TOGETHER space may appear.",
    controlRoom: controlRoomContract({
      modules: sharedTogetherControlRoomModules,
      healthSignals: ["visual-entry-present"],
      failureSignals: [
        "visual-entry-missing-or-broken",
        "unapproved-private-data-route",
        "duplicate-experience-implementation",
      ],
      recoveryClassification: "HUMAN_OR_FOUNDER_REQUIRED",
      founderOversight:
        "L1 visual health; L2 mapping issues; L3 consent/privacy/entitlement changes",
      operationalScope: "visual-entry-only",
    }),
  }),

  myHiissaHome: Object.freeze({
    id: "my-hiissa.home",
    status: "implemented-isolated-preview-not-connected-to-signin",
    accessFamily: "authenticated-account-home",
    entry: "/my-hiissa",
    purpose:
      "Canonical private home for a signed-in HIISSA account. It recognises identity and existing authenticated conversation history without pretending to know an access level that has not yet been resolved.",
    identityRule:
      "One person resolves to one permanent HIISSA identity across authorised browser/device sessions.",
    accessRule:
      "One account has one current HIISSA access level at a time. Higher access may include lower-level capabilities, but the interface must not present multiple simultaneous active subscriptions.",
    planState:
      "Account Access Resolver not yet implemented. Preview must not guess FREE, HIISSA+ or HIISSA TOGETHER.",
    reuses: Object.freeze([
      "existing-supabase-session",
      "api.conversations",
      "canonical-hiissa-talk",
    ]),
    plannedConnections: Object.freeze([
      "canonical-explore",
      "my-space",
      "account-access-resolver",
      "package-specific-authorised-destinations",
    ]),
    permissionBoundary:
      "Authentication proves identity only. My HIISSA must not infer subscription entitlement, TOGETHER membership, shared-space permission or access to another person's private material.",
    protectedDependencies: Object.freeze([
      "auth.signin",
      "guest-save-sync",
      "free-email-journey",
      "plus-welcome",
      "together-consent-boundaries",
      "production-auth",
      "production-subscription-state",
    ]),
    releaseGate:
      "Founder visual approval in isolated Preview before any Sign in destination is changed.",
    controlRoom: operationalIntelligence({
      modules: [
        CONTROL_ROOM_MODULES.usersIdentity,
        CONTROL_ROOM_MODULES.subscriptionsAccess,
        CONTROL_ROOM_MODULES.authenticationSync,
        CONTROL_ROOM_MODULES.failuresReliability,
        CONTROL_ROOM_MODULES.systemOperations,
        CONTROL_ROOM_MODULES.adminSecurityAudit,
      ],
      healthSignals: [
        "my-hiissa-route-reachable",
        "authenticated-session-recognised",
        "owned-conversation-summary-loads",
        "single-plan-placeholder-remains-truthful-before-resolver",
      ],
      failureSignals: [
        "my-hiissa-route-failure",
        "authenticated-session-not-recognised",
        "owned-conversation-summary-failure",
        "plan-or-permission-inferred-without-authoritative-access-source",
      ],
      recoveryClassification: "HUMAN_REQUIRED_FOR_ACCESS_OR_ROUTING_CHANGES",
      founderOversight:
        "L1 isolated Preview health; L2 material authenticated-home degradation; L3 entitlement, permission or Sign in destination changes",
      operationalScope:
        "isolated authenticated-home Preview only; no Sign in reroute and no Production release",
    }),
  }),

  canonicalSignIn: Object.freeze({
    id: "auth.signin",
    status: "implemented-existing-auth-with-preview-ux-refresh",
    accessFamily: "shared-authentication",
    route: "/talk?signin=1",
    provides: "existing-supabase-magic-link-sign-in",
    identityProvider: "existing-supabase-identity",
    implementationRule:
      "One canonical HIISSA sign-in experience; access-family entry points may provide return context but must not duplicate authentication.",
    permissionBoundary:
      "Authentication proves identity only. It does not grant TOGETHER shared-space permission, Plus entitlement or access to another person's private data.",
    protectedDependencies: Object.freeze([
      "existing-supabase-auth",
      "auth-continue",
      "auth-confirm",
      "guest-save-sync",
      "production-auth",
    ]),
    controlRoom: controlRoomContract({
      modules: [
        CONTROL_ROOM_MODULES.overview,
        CONTROL_ROOM_MODULES.usersIdentity,
        CONTROL_ROOM_MODULES.failuresReliability,
        CONTROL_ROOM_MODULES.authSync,
        CONTROL_ROOM_MODULES.systemOperations,
        CONTROL_ROOM_MODULES.adminSecurityAudit,
      ],
      healthSignals: [
        "signin-screen-reachable",
        "signin-email-input-available",
        "magic-link-request-path-available",
      ],
      failureSignals: [
        "signin-screen-route-failure",
        "magic-link-request-failure",
        "return-context-loss",
      ],
      recoveryClassification: "SAFE_WITH_LIMIT_OR_HUMAN_REQUIRED",
      founderOversight:
        "L1 normal Preview health; L2 authentication degradation; L3 identity/auth architecture or Production release changes",
      operationalScope: "signin-entry-and-routing; existing authentication backend preserved",
    }),
  }),

  togetherSignInNavigation: Object.freeze({
    id: "together.navigation.sign-in",
    status: "preview-routing",
    accessFamily: "together",
    primaryHome: "together.welcome",
    route: "/talk?signin=1&from=together",
    provides: "auth.signin",
    implementationRule:
      "Reuse canonical HIISSA sign-in and preserve return-to-TOGETHER context.",
    permissionBoundary:
      "Signing in does not create or join a TOGETHER shared space and does not grant access to another participant's private information.",
    controlRoom: controlRoomContract({
      modules: sharedTogetherControlRoomModules,
      healthSignals: [
        "together-signin-opens-canonical-signin",
        "signin-back-return-to-together-available",
      ],
      failureSignals: [
        "together-signin-route-failure",
        "signin-return-context-missing",
        "duplicate-authentication-implementation-created",
      ],
      recoveryClassification: "SAFE_WITH_LIMIT_OR_HUMAN_REQUIRED",
      founderOversight:
        "L1 Preview health; L2 routing/auth degradation; L3 permission/privacy/auth architecture changes",
      operationalScope: "navigation-routing-only",
    }),
  }),

  togetherCanonicalHomeNavigation: Object.freeze({
    id: "together.navigation.home",
    status: "preview-routing",
    accessFamily: "together",
    primaryHome: "together.welcome",
    route: "/?togetherHome=1",
    provides: "existing-main-hiissa-home",
    entitlement: "navigation-only; no entitlement change",
    implementationRule:
      "Reuse the canonical HIISSA main page and preserve TOGETHER return context; do not duplicate the home page.",
    permissionBoundary:
      "Navigation context grants no private/shared data permission and no TOGETHER entitlement.",
    controlRoom: controlRoomContract({
      modules: sharedTogetherControlRoomModules,
      healthSignals: [
        "together-bottom-home-opens-canonical-hiissa-home-with-return-context",
      ],
      failureSignals: [
        "together-bottom-home-route-failure",
        "return-to-together-context-missing",
        "duplicate-home-implementation-created",
      ],
      recoveryClassification: "SAFE_WITH_LIMIT_OR_HUMAN_REQUIRED",
      founderOversight:
        "L1 Preview health; L2 routing degradation; L3 permission/privacy/Production release changes",
      operationalScope: "navigation-routing-only",
    }),
  }),

  togetherCanonicalExploreNavigation: Object.freeze({
    id: "together.navigation.explore",
    status: "preview-routing",
    accessFamily: "together",
    primaryHome: "together.welcome",
    route: "/talk?togetherExplore=1",
    provides: "existing-explore-experience",
    entitlement: "together-context-preview; commercial entitlement not activated",
    implementationRule:
      "Reuse canonical Explore directly from TOGETHER navigation; do not duplicate Explore and do not treat this route as permission to expose private/shared-only data.",
    permissionBoundary:
      "This route opens the canonical Explore surface only. Shared TOGETHER-specific experiences remain separately permissioned and mapped.",
    controlRoom: controlRoomContract({
      modules: sharedTogetherControlRoomModules,
      healthSignals: [
        "together-bottom-explore-opens-canonical-explore-directly",
      ],
      failureSignals: [
        "together-bottom-explore-route-failure",
        "generic-public-opening-shown-instead-of-explore",
        "duplicate-explore-implementation-created",
      ],
      recoveryClassification: "SAFE_WITH_LIMIT_OR_HUMAN_REQUIRED",
      founderOversight:
        "L1 Preview health; L2 routing degradation; L3 permission/privacy/Production release changes",
      operationalScope: "navigation-routing-only",
    }),
  }),

  togetherOurSpace: Object.freeze({
    id: "together.our-space",
    status: "visual-entry-registered-mapping-pending",
    accessFamily: "together",
    primaryHome: "together.welcome",
    entitlement: "together",
    featureMapping:
      "pending-founder-reconciliation-with-shared-relationship-space-and-intentionally-contributed-material",
    permissionBoundary:
      "Our Space may contain only material authorised for the shared space; it must never expose either participant's private My HIISSA content by default.",
    implementationRule:
      "Register first; map later; reuse canonical shared-space architecture; no duplicate shared database.",
    controlRoom: controlRoomContract({
      modules: sharedTogetherControlRoomModules,
      healthSignals: ["visual-entry-present"],
      failureSignals: [
        "visual-entry-missing-or-broken",
        "private-material-exposed-to-shared-space",
        "duplicate-shared-store-created",
      ],
      recoveryClassification: "FOUNDER_REQUIRED_FOR_PRIVACY_OR_DATA_MODEL_CHANGES",
      founderOversight:
        "L1 visual health; L3 private/shared data-boundary changes",
      operationalScope: "visual-entry-only",
    }),
  }),

  togetherRelationshipTools: Object.freeze({
    id: "together.relationship-tools",
    status: "visual-entry-registered-mapping-pending",
    accessFamily: "together",
    primaryHome: "together.welcome",
    entitlement: "together",
    featureMapping:
      "pending-founder-reconciliation-with-approved-together-ecosystem",
    implementationRule:
      "Map approved canonical experiences such as connection/repair/support tools through the Registry later; do not duplicate them.",
    permissionBoundary:
      "Each tool declares whether input is private, shared, or deliberately transferred with consent.",
    controlRoom: controlRoomContract({
      modules: sharedTogetherControlRoomModules,
      healthSignals: ["visual-entry-present"],
      failureSignals: [
        "visual-entry-missing-or-broken",
        "tool-permission-boundary-missing",
        "duplicate-tool-implementation",
      ],
      recoveryClassification: "HUMAN_OR_FOUNDER_REQUIRED",
      founderOversight:
        "L1 visual health; L2 tool mapping issue; L3 consent/privacy architecture change",
      operationalScope: "visual-entry-only",
    }),
  }),

  togetherChallengesGoals: Object.freeze({
    id: "together.challenges-goals",
    status: "visual-entry-registered-mapping-pending",
    accessFamily: "together",
    primaryHome: "together.welcome",
    entitlement: "together",
    featureMapping:
      "pending-founder-reconciliation-with-shared-agreements-shared-dreams-play-and-growth-experiences",
    implementationRule:
      "Do not introduce compatibility scoring, coercive goals or private-data leakage; map approved shared experiences later.",
    permissionBoundary:
      "Participation and sharing must remain voluntary, purpose-bounded and attributable to the shared space.",
    controlRoom: controlRoomContract({
      modules: sharedTogetherControlRoomModules,
      healthSignals: ["visual-entry-present"],
      failureSignals: [
        "visual-entry-missing-or-broken",
        "coercive-or-unapproved-shared-goal-flow",
        "private-data-boundary-risk",
      ],
      recoveryClassification: "HUMAN_OR_FOUNDER_REQUIRED",
      founderOversight:
        "L1 visual health; L3 safety/privacy/consent changes",
      operationalScope: "visual-entry-only",
    }),
  }),

  togetherInsights: Object.freeze({
    id: "together.insights",
    status: "visual-entry-registered-mapping-pending",
    accessFamily: "together",
    primaryHome: "together.welcome",
    entitlement: "together",
    featureMapping:
      "pending-founder-reconciliation-with-authorised-shared-reflection-and-relationship-pulse-without-scoring",
    permissionBoundary:
      "Insights may use only material authorised for the shared purpose. No private participant content, compatibility score, diagnosis or invented conclusions.",
    implementationRule:
      "Do not infer or expose private facts merely because participants share a TOGETHER space.",
    controlRoom: controlRoomContract({
      modules: sharedTogetherControlRoomModules,
      healthSignals: ["visual-entry-present"],
      failureSignals: [
        "visual-entry-missing-or-broken",
        "unauthorised-private-material-used",
        "relationship-scoring-or-diagnostic-output",
      ],
      recoveryClassification:
        "FOUNDER_REQUIRED_FOR_PRIVACY_CONSENT_OR_INSIGHT_DATA_CHANGES",
      founderOversight:
        "L1 visual health; L3 private/shared insight or consent architecture changes",
      operationalScope: "visual-entry-only",
    }),
  }),
});
