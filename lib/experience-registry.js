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


export const FEATURE_CERTIFICATION_GATE = Object.freeze({
  mandatoryForNewOrMateriallyChangedCapabilities: true,
  stages: Object.freeze([
    "DESIGN_APPROVED",
    "REGISTRY_REGISTERED",
    "IMPLEMENTED_ISOLATED",
    "AUTOMATED_CHECKS_PASS",
    "PREVIEW_DEPLOYED",
    "FOUNDER_TESTED",
    "REGRESSION_PASS",
    "CONNECTED",
    "PRODUCTION_RELEASED",
  ]),
  connectionRule:
    "A Founder-approved surface must not connect a door to a new or materially changed capability until the canonical target is registered, implemented in isolation, automatically checked where applicable, Preview-tested, Founder-tested and regression-checked.",
  evidenceRule:
    "Rendered UI alone is not certification. Evidence must distinguish route health, behaviour, data/permission correctness, Founder acceptance and release status.",
  failureRule:
    "A failed certification step blocks connection/release. Fix the failed capability in isolation; do not compensate by changing unrelated working features.",
  statusRule:
    "PROPOSED, FOUNDER-APPROVED, IMPLEMENTED IN CODE, DEPLOYED PREVIEW-STAGING, FOUNDER-TESTED and PRODUCTION-RELEASED remain distinct states.",
  protectedChangeRule:
    "Existing Founder-approved or verified behaviour is protected. Any proposed material change requires explicit Founder approval before implementation.",
});

function certificationContract({
  stage,
  designDecision,
  automatedChecks = [],
  previewEvidence = [],
  founderTest = "NOT_RUN",
  regression = "NOT_RUN",
  connection = "NOT_CONNECTED",
  release = "NOT_RELEASED",
  knownGaps = [],
}) {
  return Object.freeze({
    stage,
    designDecision,
    automatedChecks: Object.freeze(automatedChecks),
    previewEvidence: Object.freeze(previewEvidence),
    founderTest,
    regression,
    connection,
    release,
    knownGaps: Object.freeze(knownGaps),
  });
}

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

  canonicalTalk: Object.freeze({
    id: "talk.canonical",
    certificationManaged: true,
    status: "implemented-existing-certification-backfill",
    accessFamily: "shared-capability",
    route: "/talk",
    implementationSource: "app/talk/page.js",
    userJob:
      "Open the canonical personal HIISSA conversation experience. Talk is conversation, not the account home and not account settings.",
    reuseRule:
      "Guest, FREE, HIISSA+ and authorised personal entry points reuse this Talk capability rather than creating separate chat engines.",
    knownCurrentBehaviour:
      "Authenticated /talk currently auto-renders a legacy Welcome back / Continue my conversations / My Account block before the Talk surface.",
    protectedDependencies: Object.freeze([
      "guest-save-sync",
      "authenticated-conversation-persistence",
      "existing-conversation-intelligence",
      "production-talk",
    ]),
    certification: certificationContract({
      stage: "REGISTRY_REGISTERED",
      designDecision:
        "Canonical Talk is the existing conversation engine. My HIISSA may connect to it only after a clean authenticated Talk entry is certified without the legacy account-home overlay.",
      automatedChecks: ["registry-integrity"],
      knownGaps: [
        "clean-authenticated-talk-entry-not-yet-certified",
        "legacy-account-home-overlay-still-renders-for-authenticated-session",
      ],
    }),
    controlRoom: controlRoomContract({
      modules: [
        CONTROL_ROOM_MODULES.overview,
        CONTROL_ROOM_MODULES.failuresReliability,
        CONTROL_ROOM_MODULES.authSync,
        CONTROL_ROOM_MODULES.aiProduct,
        CONTROL_ROOM_MODULES.systemOperations,
      ],
      healthSignals: [
        "canonical-talk-route-reachable",
        "conversation-engine-available",
        "authenticated-conversation-persistence-available",
      ],
      failureSignals: [
        "canonical-talk-route-failure",
        "conversation-engine-failure",
        "unexpected-account-home-overlay-on-certified-clean-entry",
      ],
      recoveryClassification: "HUMAN_REQUIRED_FOR_ROUTING_OR_UI_CONTRACT_CHANGE",
      founderOversight:
        "L1 route/runtime health; L2 Talk degradation; L3 material behaviour or Production routing changes",
      operationalScope:
        "canonical personal Talk capability; certification backfill in progress",
    }),
  }),

  canonicalExplore: Object.freeze({
    id: "explore.canonical",
    certificationManaged: true,
    status: "implemented-existing-surface-neutral-entry-pending",
    accessFamily: "shared-capability",
    route: null,
    implementationSource: "app/talk/page.js showExplore surface",
    currentEntryRoutes: Object.freeze([
      "/talk?freeExplore=1",
      "/talk?plusExplore=1",
      "/talk?togetherExplore=1",
    ]),
    userJob:
      "Open the one canonical Explore HIISSA experience. Access context may change what is permitted, but must not create duplicate Explore implementations.",
    reuseRule:
      "Every authorised Explore door points to this canonical capability through an approved context-aware entry.",
    protectedDependencies: Object.freeze([
      "existing-explore-surface",
      "experience-registry",
      "access-and-permission-boundaries",
    ]),
    certification: certificationContract({
      stage: "REGISTRY_REGISTERED",
      designDecision:
        "Reuse the existing Explore surface. A neutral authenticated My HIISSA entry must be deliberately designed and certified before My HIISSA connects to Explore.",
      automatedChecks: ["registry-integrity"],
      knownGaps: [
        "neutral-authenticated-explore-entry-not-yet-defined",
        "my-hiissa-explore-door-must-remain-unconnected-until-certified",
      ],
    }),
    controlRoom: controlRoomContract({
      modules: [
        CONTROL_ROOM_MODULES.overview,
        CONTROL_ROOM_MODULES.subscriptionsAccess,
        CONTROL_ROOM_MODULES.failuresReliability,
        CONTROL_ROOM_MODULES.aiProduct,
        CONTROL_ROOM_MODULES.systemOperations,
      ],
      healthSignals: [
        "canonical-explore-surface-available",
        "registered-context-routes-resolve",
      ],
      failureSignals: [
        "canonical-explore-surface-failure",
        "duplicate-explore-implementation",
        "access-context-exposes-unauthorised-experience",
      ],
      recoveryClassification: "HUMAN_REQUIRED_FOR_ROUTING_OR_ACCESS_CHANGE",
      founderOversight:
        "L1 visual/runtime health; L2 routing degradation; L3 access/permission or Production changes",
      operationalScope:
        "canonical Explore capability; neutral My HIISSA entry pending",
    }),
  }),

  myHiissaConversations: Object.freeze({
    id: "my-hiissa.conversations",
    certificationManaged: true,
    status: "design-approved-implementation-pending",
    accessFamily: "authenticated-account-home",
    plannedRoute: "/my-hiissa/conversations",
    currentDataSource: "/api/conversations",
    legacySurface: "Previous Chats panel inside app/talk/page.js",
    userJob:
      "Show the signed-in user's authenticated conversation history, then open the selected exact conversation in canonical Talk.",
    implementationRule:
      "Reuse the existing authenticated conversations API and existing conversation records. Do not duplicate conversation storage and do not use generic /talk as a substitute for the history destination.",
    permissionBoundary:
      "Only conversations owned by the authenticated Supabase identity may be listed or opened.",
    certification: certificationContract({
      stage: "DESIGN_APPROVED",
      designDecision:
        "My Conversations is a dedicated authenticated-history entrance. Selecting an item hands off to canonical Talk with that exact owned conversation.",
      automatedChecks: ["registry-integrity"],
      knownGaps: [
        "dedicated-history-surface-not-yet-implemented",
        "exact-conversation-handoff-contract-not-yet-certified",
      ],
    }),
    controlRoom: controlRoomContract({
      modules: [
        CONTROL_ROOM_MODULES.usersIdentity,
        CONTROL_ROOM_MODULES.failuresReliability,
        CONTROL_ROOM_MODULES.authSync,
        CONTROL_ROOM_MODULES.systemOperations,
        CONTROL_ROOM_MODULES.adminSecurityAudit,
      ],
      healthSignals: [
        "owned-conversation-list-loads",
        "selected-owned-conversation-opens",
      ],
      failureSignals: [
        "conversation-history-load-failure",
        "wrong-user-conversation-exposure",
        "generic-talk-used-as-history-substitute",
      ],
      recoveryClassification: "HUMAN_REQUIRED_FOR_DATA_OR_ROUTING_FAILURE",
      founderOversight:
        "L1 route/data health; L2 material history degradation; L3 privacy/ownership or Production changes",
      operationalScope:
        "authenticated private conversation-history entrance",
    }),
  }),

  myHiissaAccount: Object.freeze({
    id: "my-hiissa.account",
    certificationManaged: true,
    status: "design-approved-implementation-pending",
    accessFamily: "authenticated-account-home",
    plannedRoute: "/my-hiissa/account",
    legacyRoute: "/talk?freeAccount=1",
    userJob:
      "Manage the already-authenticated HIISSA account: show account identity information, current-plan information when authoritative, sign out on this device, and later approved device/session controls.",
    implementationRule:
      "My Account must not ask an already-authenticated user to sign in again. The legacy /talk?freeAccount=1 panel must not be used as the final My HIISSA account destination.",
    permissionBoundary:
      "Account controls act only on the current authenticated identity/session and never grant subscription or TOGETHER permission.",
    certification: certificationContract({
      stage: "DESIGN_APPROVED",
      designDecision:
        "My Account becomes a dedicated account/settings capability owned by My HIISSA, separate from Talk and separate from the Sign in interface.",
      automatedChecks: ["registry-integrity"],
      knownGaps: [
        "dedicated-account-settings-surface-not-yet-implemented",
        "current-plan-source-of-truth-pending-account-access-resolver",
      ],
    }),
    controlRoom: controlRoomContract({
      modules: [
        CONTROL_ROOM_MODULES.usersIdentity,
        CONTROL_ROOM_MODULES.subscriptionsAccess,
        CONTROL_ROOM_MODULES.authSync,
        CONTROL_ROOM_MODULES.failuresReliability,
        CONTROL_ROOM_MODULES.adminSecurityAudit,
      ],
      healthSignals: [
        "account-settings-route-reachable",
        "current-session-recognised",
        "device-signout-available",
      ],
      failureSignals: [
        "account-settings-route-failure",
        "authenticated-user-reprompted-for-signin",
        "unauthorised-entitlement-or-account-change",
      ],
      recoveryClassification: "HUMAN_REQUIRED_FOR_ACCOUNT_OR_ACCESS_CHANGE",
      founderOversight:
        "L1 account-route health; L2 authentication/account degradation; L3 access, identity or Production changes",
      operationalScope:
        "authenticated account/settings capability",
    }),
  }),

  myHiissaHome: Object.freeze({
    id: "my-hiissa.home",
    certificationManaged: true,
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
    navigationContract: Object.freeze({
      talk: Object.freeze({
        label: "Talk to HIISSA",
        canonicalTargetId: "talk.canonical",
        connectionState: "BLOCKED_UNTIL_CLEAN_TALK_ENTRY_CERTIFIED",
      }),
      conversations: Object.freeze({
        label: "My Conversations",
        canonicalTargetId: "my-hiissa.conversations",
        connectionState: "BLOCKED_UNTIL_DEDICATED_HISTORY_IMPLEMENTED_AND_CERTIFIED",
      }),
      explore: Object.freeze({
        label: "Explore HIISSA",
        canonicalTargetId: "explore.canonical",
        connectionState: "BLOCKED_UNTIL_NEUTRAL_AUTHENTICATED_ENTRY_CERTIFIED",
      }),
      mySpace: Object.freeze({
        label: "My Space",
        connectionState: "BLOCKED_UNTIL_CANONICAL_MY_SPACE_REGISTRY_ID_IS_RECONCILED",
      }),
      account: Object.freeze({
        label: "My Account",
        canonicalTargetId: "my-hiissa.account",
        connectionState: "BLOCKED_UNTIL_ACCOUNT_SETTINGS_IMPLEMENTED_AND_CERTIFIED",
      }),
      backToHiissa: Object.freeze({
        label: "Back to HIISSA",
        route: "/",
        connectionState: "EXISTING_NAVIGATION_ONLY_SESSION_REMAINS_ACTIVE",
      }),
    }),
    releaseGate:
      "Founder visual and behaviour approval in isolated Preview plus certification/regression evidence before any Sign in destination is changed.",
    certification: certificationContract({
      stage: "IMPLEMENTED_ISOLATED",
      designDecision:
        "My HIISSA is the private authenticated home after successful Sign in, but its doors remain blocked from certification until each canonical destination passes its own contract.",
      automatedChecks: ["registry-integrity"],
      previewEvidence: [
        "isolated-route-built",
        "founder-identified-navigation-and-mobile-layout-defects",
      ],
      founderTest: "UNDER_REVIEW_NOT_PASS",
      regression: "NOT_RUN",
      connection: "NOT_CONNECTED_TO_SIGNIN",
      knownGaps: [
        "my-account-currently-points-to-legacy-talk-account-panel",
        "my-conversations-currently-points-to-generic-talk",
        "mobile-botanical-art-overlaps-welcome-copy",
        "explore-and-my-space-not-yet-canonically-connected",
      ],
    }),
    controlRoom: controlRoomContract({
      modules: [
        CONTROL_ROOM_MODULES.usersIdentity,
        CONTROL_ROOM_MODULES.subscriptionsAccess,
        CONTROL_ROOM_MODULES.authSync,
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
