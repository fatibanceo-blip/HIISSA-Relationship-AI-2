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
  certificationStateRequiredForMaterialCapabilities: true,
  operationalCompletionRequiresRegistryCertificationAndControlRoom: true,
  newFeaturesControlRoomReadyFromBeginning: true,
  backfillExistingFeaturesAdditively: true,
  preserveWorkingCoreDuringBackfill: true,
  founderRule:
    "Build HIISSA so tomorrow's idea can be added without breaking today's working feature.",
  operationalCompletionRule:
    "No substantial HIISSA feature is operationally complete until it has one canonical Registry identity, an evidence-based Certification Gate state, and an appropriate Operational Intelligence / Founder Control Room contract. Existing working features are backfilled additively without rewriting their working core; new features receive these foundations from the beginning.",
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
  freeAccessHome: Object.freeze({
    id: "free.access.home",
    certificationManaged: true,
    status: "founder-approved-isolated-implementation",
    accessFamily: "free-access",
    publicLabel: "HIISSA FREE",
    accountRequired: false,
    entry: "/free-access",
    primaryPurpose:
      "Give no-account users a calm HIISSA home before Talk so they can discover the product, sample selected experiences and choose their next action without being forced directly into conversation.",
    founderDecision:
      "The first Main card is HIISSA FREE / FREE Access. It requires no account. It must open a dedicated FREE Access home before canonical Talk or Explore.",
    reuses: Object.freeze([
      "talk.canonical",
      "explore.canonical",
      "existing-hiissa-experience-universe",
    ]),
    accessPrinciple:
      "Meaningful breadth/taste of HIISSA remains available without account; exact limits stay feature-by-feature and must not exploit distress or degrade core safety, privacy, accessibility or responsible reasoning.",
    protectedDependencies: Object.freeze([
      "guest-save-sync",
      "existing-authentication",
      "plus-preview",
      "together-preview",
      "my-hiissa",
      "production",
    ]),
    certification: certificationContract({
      stage: "REGISTRY_REGISTERED",
      designDecision:
        "Founder approved a dedicated HIISSA FREE Access hub with Talk, Explore, Learn about HIISSA and a gentle future-access path. Main visual structure stays unchanged except approved wording and routing.",
      automatedChecks: ["free-access-guest-label-contract"],
      knownGaps: [
        "exact-feature-by-feature-free-access-limits-remain-to-be-defined",
        "founder-preview-test-not-yet-run",
        "production-release-not-authorised",
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
        "free-access-home-reachable",
        "free-access-talk-route-reachable",
        "free-access-explore-route-reachable",
        "free-access-back-to-main-available",
      ],
      failureSignals: [
        "free-access-home-route-failure",
        "free-access-talk-context-loss",
        "free-access-explore-context-loss",
        "free-access-labelled-as-account-required",
      ],
      recoveryClassification: "SAFE_WITH_LIMIT_OR_HUMAN_REQUIRED",
      founderOversight:
        "L1 isolated routing/label health; L2 material navigation degradation; L3 access-model, auth or Production changes",
      operationalScope: "free-access-home-and-routing-only",
    }),
  }),

  freeAccessTalkEntry: Object.freeze({
    id: "free.access.talk.entry",
    certificationManaged: true,
    status: "founder-approved-isolated-implementation",
    accessFamily: "free-access",
    primaryHome: "free.access.home",
    route: "/talk?freeAccessTalk=1",
    canonicalTargetId: "talk.canonical",
    accountRequired: false,
    implementationRule:
      "Reuse canonical Talk, preserve FREE Access origin and provide a visible Back to HIISSA FREE control. Do not duplicate Talk.",
    certification: certificationContract({
      stage: "REGISTRY_REGISTERED",
      designDecision:
        "FREE Access Talk is reached from the dedicated FREE Access hub rather than directly from Main.",
      automatedChecks: ["free-access-guest-label-contract"],
      knownGaps: ["founder-preview-test-not-yet-run", "production-release-not-authorised"],
    }),
    controlRoom: controlRoomContract({
      modules: [
        CONTROL_ROOM_MODULES.overview,
        CONTROL_ROOM_MODULES.failuresReliability,
        CONTROL_ROOM_MODULES.aiProduct,
        CONTROL_ROOM_MODULES.systemOperations,
      ],
      healthSignals: ["free-access-talk-opens-canonical-talk", "free-access-talk-back-visible"],
      failureSignals: ["free-access-talk-route-failure", "free-access-talk-back-missing"],
      recoveryClassification: "SAFE_WITH_LIMIT_OR_HUMAN_REQUIRED",
      founderOversight: "L1 Preview health; L2 navigation degradation; L3 Production changes",
      operationalScope: "navigation-routing-only",
    }),
  }),

  freeAccessExploreEntry: Object.freeze({
    id: "free.access.explore.entry",
    certificationManaged: true,
    status: "founder-approved-isolated-implementation",
    accessFamily: "free-access",
    primaryHome: "free.access.home",
    route: "/talk?freeAccessExplore=1",
    canonicalTargetId: "explore.canonical",
    accountRequired: false,
    implementationRule:
      "Reuse canonical Explore, preserve FREE Access origin and provide a visible Back to HIISSA FREE control. Exact feature limits remain feature-by-feature.",
    certification: certificationContract({
      stage: "REGISTRY_REGISTERED",
      designDecision:
        "FREE Access Explore lets users discover HIISSA breadth without forcing subscription or account creation.",
      automatedChecks: ["free-access-guest-label-contract"],
      knownGaps: [
        "exact-feature-by-feature-free-access-limits-remain-to-be-defined",
        "founder-preview-test-not-yet-run",
        "production-release-not-authorised",
      ],
    }),
    controlRoom: controlRoomContract({
      modules: [
        CONTROL_ROOM_MODULES.overview,
        CONTROL_ROOM_MODULES.failuresReliability,
        CONTROL_ROOM_MODULES.aiProduct,
        CONTROL_ROOM_MODULES.systemOperations,
      ],
      healthSignals: ["free-access-explore-opens-canonical-explore", "free-access-explore-back-visible"],
      failureSignals: ["free-access-explore-route-failure", "free-access-explore-back-missing"],
      recoveryClassification: "SAFE_WITH_LIMIT_OR_HUMAN_REQUIRED",
      founderOversight: "L1 Preview health; L2 navigation degradation; L3 Production changes",
      operationalScope: "navigation-routing-only",
    }),
  }),

  guestAccountEntry: Object.freeze({
    id: "guest.account.entry",
    certificationManaged: true,
    status: "founder-approved-semantic-relabel-isolated",
    accessFamily: "guest-account",
    publicLabel: "HIISSA Guest",
    accountRequired: true,
    entry: "/free",
    legacyTechnicalRouteName: "free",
    reusesExistingIdentityFlow: "free.email",
    implementationRule:
      "Keep the existing tested email, Turnstile, secure continuation and Supabase identity mechanics unchanged; update only the user-facing access name from HIISSA FREE to HIISSA Guest.",
    certification: certificationContract({
      stage: "REGISTRY_REGISTERED",
      designDecision:
        "Founder clarified that the second Main card is HIISSA Guest and is the account-based path. Existing technical /free routes are retained initially to avoid destabilising working authentication.",
      automatedChecks: ["free-access-guest-label-contract"],
      knownGaps: ["founder-preview-test-not-yet-run", "production-release-not-authorised"],
    }),
    controlRoom: controlRoomContract({
      modules: [
        CONTROL_ROOM_MODULES.overview,
        CONTROL_ROOM_MODULES.authSync,
        CONTROL_ROOM_MODULES.failuresReliability,
        CONTROL_ROOM_MODULES.systemOperations,
        CONTROL_ROOM_MODULES.adminSecurityAudit,
      ],
      healthSignals: [
        "guest-account-entry-reachable",
        "guest-account-email-security-flow-preserved",
        "guest-account-auth-confirm-preserved",
      ],
      failureSignals: [
        "guest-account-entry-route-failure",
        "guest-account-email-flow-regression",
        "guest-account-auth-confirm-regression",
      ],
      recoveryClassification: "HUMAN_REQUIRED_FOR_AUTH_CHANGES",
      founderOversight: "L1 healthy flow; L2 material degradation; L3 auth or Production changes",
      operationalScope: "semantic-label-and-entry-routing; auth mechanics protected",
    }),
  }),

  guestAccountHome: Object.freeze({
    id: "guest.account.home",
    certificationManaged: true,
    status: "founder-approved-semantic-relabel-isolated",
    accessFamily: "guest-account",
    publicLabel: "HIISSA Guest",
    accountRequired: true,
    entry: "/free/welcome",
    legacyTechnicalRouteName: "free/welcome",
    reusesExistingImplementation: "free.welcome",
    implementationRule:
      "Retain the tested authenticated home implementation and permissions while changing its user-facing access label to HIISSA Guest. Do not rewrite authentication, storage or My HIISSA.",
    certification: certificationContract({
      stage: "REGISTRY_REGISTERED",
      designDecision:
        "Founder approved the existing authenticated welcome/dashboard as the HIISSA Guest home, with the same layout and working capabilities but corrected label.",
      automatedChecks: ["free-access-guest-label-contract"],
      knownGaps: ["founder-preview-test-not-yet-run", "production-release-not-authorised"],
    }),
    controlRoom: controlRoomContract({
      modules: [
        CONTROL_ROOM_MODULES.overview,
        CONTROL_ROOM_MODULES.authSync,
        CONTROL_ROOM_MODULES.failuresReliability,
        CONTROL_ROOM_MODULES.aiProduct,
        CONTROL_ROOM_MODULES.systemOperations,
      ],
      healthSignals: ["guest-account-home-reachable", "guest-account-navigation-context-preserved"],
      failureSignals: ["guest-account-home-route-failure", "guest-account-labelled-free"],
      recoveryClassification: "SAFE_WITH_LIMIT_OR_HUMAN_REQUIRED",
      founderOversight: "L1 Preview health; L2 navigation degradation; L3 auth/Production changes",
      operationalScope: "authenticated-home-label-and-routing-only",
    }),
  }),

  guestAccountTalkEntry: Object.freeze({
    id: "guest.account.talk.entry",
    certificationManaged: true,
    status: "founder-approved-isolated-implementation",
    accessFamily: "guest-account",
    primaryHome: "guest.account.home",
    route: "/talk?guestAccountTalk=1",
    canonicalTargetId: "talk.canonical",
    implementationRule:
      "Reuse canonical Talk and preserve an explicit return-to-HIISSA-Guest context. Do not duplicate Talk.",
    certification: certificationContract({
      stage: "REGISTRY_REGISTERED",
      designDecision:
        "Authenticated HIISSA Guest Talk keeps its Guest origin and returns to the Guest home.",
      automatedChecks: ["free-access-guest-label-contract"],
      knownGaps: ["founder-preview-test-not-yet-run", "production-release-not-authorised"],
    }),
    controlRoom: controlRoomContract({
      modules: [CONTROL_ROOM_MODULES.overview, CONTROL_ROOM_MODULES.failuresReliability, CONTROL_ROOM_MODULES.systemOperations],
      healthSignals: ["guest-account-talk-opens-canonical-talk", "guest-account-talk-back-visible"],
      failureSignals: ["guest-account-talk-route-failure", "guest-account-talk-back-missing"],
      recoveryClassification: "SAFE_WITH_LIMIT_OR_HUMAN_REQUIRED",
      founderOversight: "L1 Preview health; L2 navigation degradation; L3 Production changes",
      operationalScope: "navigation-routing-only",
    }),
  }),

  guestAccountExploreEntry: Object.freeze({
    id: "guest.account.explore.entry",
    certificationManaged: true,
    status: "founder-approved-isolated-implementation",
    accessFamily: "guest-account",
    primaryHome: "guest.account.home",
    route: "/talk?guestAccountExplore=1",
    canonicalTargetId: "explore.canonical",
    implementationRule:
      "Reuse canonical Explore and preserve an explicit return-to-HIISSA-Guest context. Do not duplicate Explore.",
    certification: certificationContract({
      stage: "REGISTRY_REGISTERED",
      designDecision:
        "Authenticated HIISSA Guest Explore keeps its Guest origin and returns to the Guest home.",
      automatedChecks: ["free-access-guest-label-contract"],
      knownGaps: ["founder-preview-test-not-yet-run", "production-release-not-authorised"],
    }),
    controlRoom: controlRoomContract({
      modules: [CONTROL_ROOM_MODULES.overview, CONTROL_ROOM_MODULES.failuresReliability, CONTROL_ROOM_MODULES.systemOperations],
      healthSignals: ["guest-account-explore-opens-canonical-explore", "guest-account-explore-back-visible"],
      failureSignals: ["guest-account-explore-route-failure", "guest-account-explore-back-missing"],
      recoveryClassification: "SAFE_WITH_LIMIT_OR_HUMAN_REQUIRED",
      founderOversight: "L1 Preview health; L2 navigation degradation; L3 Production changes",
      operationalScope: "navigation-routing-only",
    }),
  }),

  guestWelcome: Object.freeze({
    id: "guest.welcome",
    status: "legacy-technical-compatibility-no-account-path",
    canonicalSuccessorId: "free.access.home",
    userFacingAccessName: "HIISSA FREE Access",
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
    status: "legacy-technical-route-reused-by-guest-account",
    canonicalSuccessorId: "guest.account.entry",
    userFacingAccessName: "HIISSA Guest",
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
    status: "legacy-technical-route-reused-by-guest-account",
    canonicalSuccessorId: "guest.account.home",
    userFacingAccessName: "HIISSA Guest",
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

  freeTalkEntry: Object.freeze({
    id: "free.talk.entry",
    certificationManaged: true,
    status: "registry-registered-navigation-repair-pending-implementation",
    accessFamily: "free",
    primaryHome: "free.welcome",
    route: "/talk?freeTalk=1",
    canonicalTargetId: "talk.canonical",
    provides: "existing-talk-experience",
    implementationRule:
      "Reuse canonical Talk from HIISSA FREE and preserve an explicit return-to-HIISSA-FREE context. Do not duplicate Talk.",
    protectedDependencies: Object.freeze([
      "guest-save-sync",
      "guest-handoff",
      "production-auth",
      "plus-preview",
      "together-preview",
      "my-hiissa",
    ]),
    certification: certificationContract({
      stage: "REGISTRY_REGISTERED",
      designDecision:
        "Founder approved an isolated navigation repair so the existing HIISSA FREE Talk entry keeps its FREE origin and provides a visible Back to HIISSA FREE path without changing canonical Talk or authentication.",
      automatedChecks: ["free-navigation-contract"],
      knownGaps: [
        "implementation-pending-on-isolated-repair-branch",
        "preview-founder-test-not-yet-run",
        "production-release-not-authorised",
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
        "free-talk-entry-opens-canonical-talk",
        "free-talk-return-to-free-visible",
      ],
      failureSignals: [
        "free-talk-entry-route-failure",
        "free-talk-return-context-missing",
        "duplicate-talk-implementation-created",
      ],
      recoveryClassification: "SAFE_WITH_LIMIT_OR_HUMAN_REQUIRED",
      founderOversight:
        "L1 isolated repair health; L2 navigation degradation; L3 auth, entitlement or Production changes",
      operationalScope: "navigation-routing-only",
    }),
  }),

  freeExploreEntry: Object.freeze({
    id: "free.explore.entry",
    certificationManaged: true,
    status: "registry-registered-navigation-repair-pending-implementation",
    accessFamily: "free",
    primaryHome: "free.welcome",
    route: "/talk?freeExplore=1",
    canonicalTargetId: "explore.canonical",
    provides: "existing-explore-experience",
    implementationRule:
      "Reuse canonical Explore from HIISSA FREE and preserve an explicit return-to-HIISSA-FREE context. Do not duplicate Explore.",
    protectedDependencies: Object.freeze([
      "guest-save-sync",
      "guest-handoff",
      "production-auth",
      "plus-preview",
      "together-preview",
      "my-hiissa",
    ]),
    certification: certificationContract({
      stage: "REGISTRY_REGISTERED",
      designDecision:
        "Founder approved an isolated navigation repair so the existing HIISSA FREE Explore entry keeps its FREE origin and provides a visible Back to HIISSA FREE path without changing canonical Explore.",
      automatedChecks: ["free-navigation-contract"],
      knownGaps: [
        "implementation-pending-on-isolated-repair-branch",
        "preview-founder-test-not-yet-run",
        "production-release-not-authorised",
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
        "free-explore-entry-opens-canonical-explore",
        "free-explore-return-to-free-visible",
      ],
      failureSignals: [
        "free-explore-entry-route-failure",
        "free-explore-return-context-missing",
        "duplicate-explore-implementation-created",
      ],
      recoveryClassification: "SAFE_WITH_LIMIT_OR_HUMAN_REQUIRED",
      founderOversight:
        "L1 isolated repair health; L2 navigation degradation; L3 auth, entitlement or Production changes",
      operationalScope: "navigation-routing-only",
    }),
  }),

  freeCanonicalHomeNavigation: Object.freeze({
    id: "free.navigation.home",
    certificationManaged: true,
    status: "registry-registered-navigation-repair-pending-implementation",
    accessFamily: "free",
    primaryHome: "free.welcome",
    route: "/",
    provides: "existing-main-hiissa-home",
    entitlement: "navigation-only; no entitlement change",
    implementationRule:
      "Provide a clearly visible Back to HIISSA control from the authenticated FREE welcome and reuse the canonical Main page.",
    permissionBoundary:
      "Navigation back to Main grants no additional entitlement and no private-data permission.",
    certification: certificationContract({
      stage: "REGISTRY_REGISTERED",
      designDecision:
        "Founder approved a visible top Back to HIISSA control on the authenticated FREE welcome while preserving the existing Main page and bottom return link.",
      automatedChecks: ["free-navigation-contract"],
      knownGaps: [
        "implementation-pending-on-isolated-repair-branch",
        "preview-founder-test-not-yet-run",
        "production-release-not-authorised",
      ],
    }),
    controlRoom: controlRoomContract({
      modules: [
        CONTROL_ROOM_MODULES.overview,
        CONTROL_ROOM_MODULES.subscriptionsAccess,
        CONTROL_ROOM_MODULES.failuresReliability,
        CONTROL_ROOM_MODULES.systemOperations,
      ],
      healthSignals: ["free-welcome-top-back-opens-canonical-main"],
      failureSignals: [
        "free-welcome-top-back-missing",
        "free-welcome-main-route-failure",
        "duplicate-main-home-implementation-created",
      ],
      recoveryClassification: "SAFE_WITH_LIMIT_OR_HUMAN_REQUIRED",
      founderOversight:
        "L1 isolated repair health; L2 navigation degradation; L3 entitlement or Production changes",
      operationalScope: "navigation-routing-only",
    }),
  }),

  plusWelcome: Object.freeze({
    id: "plus.welcome",
    status: "founder-tested-preview-routing-pass",
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
    status: "founder-tested-preview-routing-pass",
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
    status: "founder-tested-preview-routing-pass",
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

  plusCanonicalHomeNavigation: Object.freeze({
    id: "plus.navigation.home",
    status: "founder-tested-preview-routing-pass",
    accessFamily: "plus",
    primaryHome: "plus.welcome",
    route: "/",
    provides: "existing-main-hiissa-home",
    entitlement: "navigation-only; no entitlement change",
    implementationRule:
      "Reuse the canonical HIISSA Main page from the HIISSA+ welcome; do not duplicate the public home.",
    permissionBoundary:
      "Navigation back to Main grants no additional entitlement and no private-data permission.",
    controlRoom: controlRoomContract({
      modules: sharedPlusControlRoomModules,
      healthSignals: ["plus-welcome-back-opens-canonical-main"],
      failureSignals: [
        "plus-welcome-back-route-failure",
        "duplicate-main-home-implementation-created",
      ],
      recoveryClassification: "SAFE_WITH_LIMIT_OR_HUMAN_REQUIRED",
      founderOversight:
        "L1 Preview health; L2 routing degradation; L3 entitlement or Production release changes",
      operationalScope: "navigation-routing-only",
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
    status: "founder-tested-preview-welcome-navigation-pass-shared-features-protected",
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
    status: "connected-preview-founder-tested-regression-pass",
    accessFamily: "shared-capability",
    route: "/talk",
    myHiissaEntryRoute: "/talk?myHiissaTalk=1",
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
      stage: "CONNECTED",
      designDecision:
        "Canonical Talk is the existing conversation engine. My HIISSA uses a neutral additive entry that suppresses the legacy account-home overlay only for that My HIISSA context.",
      automatedChecks: ["registry-integrity", "my-hiissa-routing-contract", "complete-account-journey-contract"],
      previewEvidence: [
        "my-hiissa-neutral-talk-entry-implemented",
        "founder-opened-canonical-talk-from-my-hiissa",
        "back-to-my-hiissa-context-visible",
        "legacy-account-home-overlay-absent",
      ],
      founderTest: "PASS",
      regression: "PASS_IN_CURRENT_PREVIEW_BUILD_AND_FOUNDER_RETEST",
      connection: "CONNECTED_IN_PREVIEW",
      knownGaps: [
        "my-hiissa-context-not-production-released",
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
    status: "connected-preview-founder-tested-regression-pass",
    accessFamily: "shared-capability",
    route: "/talk?myHiissaExplore=1",
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
      stage: "CONNECTED",
      designDecision:
        "Reuse the existing Explore surface through a neutral authenticated My HIISSA query entry. No second Explore implementation is created.",
      automatedChecks: ["registry-integrity", "my-hiissa-routing-contract", "complete-account-journey-contract"],
      previewEvidence: [
        "my-hiissa-neutral-explore-entry-implemented",
        "founder-opened-canonical-explore-from-my-hiissa",
        "back-to-my-hiissa-context-preserved",
        "single-existing-explore-surface-reused",
      ],
      founderTest: "PASS",
      regression: "PASS_IN_CURRENT_PREVIEW_BUILD_AND_FOUNDER_RETEST",
      connection: "CONNECTED_IN_PREVIEW",
      knownGaps: [
        "my-hiissa-context-not-production-released",
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
    status: "connected-preview-founder-tested-empty-state-regression-pass",
    accessFamily: "authenticated-account-home",
    route: "/my-hiissa/conversations",
    currentDataSource: "/api/conversations",
    legacySurface: "Previous Chats panel inside app/talk/page.js",
    userJob:
      "Show the signed-in user's authenticated conversation history, then open the selected exact conversation in canonical Talk.",
    implementationRule:
      "Reuse the existing authenticated conversations API and existing conversation records. Do not duplicate conversation storage and do not use generic /talk as a substitute for the history destination.",
    permissionBoundary:
      "Only conversations owned by the authenticated Supabase identity may be listed or opened.",
    certification: certificationContract({
      stage: "FOUNDER_TESTED",
      designDecision:
        "My Conversations is a dedicated authenticated-history entrance using the existing owned-conversation API. Selecting an item hands off to canonical Talk with that exact conversation id.",
      automatedChecks: ["registry-integrity", "my-hiissa-routing-contract", "complete-account-journey-contract"],
      previewEvidence: [
        "dedicated-history-route-implemented",
        "owned-conversation-list-reuses-existing-api",
        "exact-conversation-handoff-route-implemented",
        "founder-opened-dedicated-my-conversations-route",
        "truthful-nothing-to-continue-empty-state-observed",
      ],
      founderTest: "PASS",
      regression: "PASS_IN_CURRENT_PREVIEW_BUILD_FOR_ROUTE_CONTRACT",
      connection: "CONNECTED_IN_PREVIEW",
      knownGaps: [
        "exact-existing-conversation-handoff-not-observed-because-test-account-had-no-history-to-open",
        "not-production-released",
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
    status: "connected-preview-founder-tested-regression-pass",
    accessFamily: "authenticated-account-home",
    route: "/my-hiissa/account",
    legacyRoute: "/talk?freeAccount=1",
    userJob:
      "Manage the already-authenticated HIISSA account: show account identity information, current-plan information when authoritative, sign out on this device, and later approved device/session controls.",
    implementationRule:
      "My Account must not ask an already-authenticated user to sign in again. The legacy /talk?freeAccount=1 panel must not be used as the final My HIISSA account destination.",
    permissionBoundary:
      "Account controls act only on the current authenticated identity/session and never grant subscription or TOGETHER permission.",
    certification: certificationContract({
      stage: "CONNECTED",
      designDecision:
        "My Account is a dedicated account/settings capability owned by My HIISSA. It shows the current authenticated email as information and supports local device sign-out without reauthentication.",
      automatedChecks: ["registry-integrity", "my-hiissa-routing-contract", "complete-account-journey-contract"],
      previewEvidence: [
        "dedicated-account-settings-route-implemented",
        "authenticated-email-displayed-as-information",
        "local-device-signout-control-implemented",
        "founder-confirmed-account-does-not-reprompt-for-signin",
        "founder-confirmed-local-signout-returns-to-public-main",
        "founder-confirmed-browser-back-does-not-resurrect-private-account",
      ],
      founderTest: "PASS",
      regression: "PASS_IN_CURRENT_PREVIEW_BUILD_AND_FOUNDER_RETEST",
      connection: "CONNECTED_IN_PREVIEW",
      knownGaps: [
        "current-plan-source-of-truth-pending-account-access-resolver",
        "not-production-released",
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
    status: "connected-preview-founder-tested-regression-pass",
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
        connectionState: "CONNECTED_PREVIEW_FOUNDER_TESTED_REGRESSION_PASS",
      }),
      conversations: Object.freeze({
        label: "My Conversations",
        canonicalTargetId: "my-hiissa.conversations",
        connectionState: "CONNECTED_PREVIEW_FOUNDER_TESTED_REGRESSION_PASS",
      }),
      explore: Object.freeze({
        label: "Explore HIISSA",
        canonicalTargetId: "explore.canonical",
        connectionState: "CONNECTED_PREVIEW_FOUNDER_TESTED_REGRESSION_PASS",
      }),
      mySpace: Object.freeze({
        label: "My Space",
        connectionState: "BLOCKED_UNTIL_CANONICAL_MY_SPACE_REGISTRY_ID_IS_RECONCILED",
      }),
      account: Object.freeze({
        label: "My Account",
        canonicalTargetId: "my-hiissa.account",
        connectionState: "CONNECTED_PREVIEW_FOUNDER_TESTED_REGRESSION_PASS",
      }),
      backToHiissa: Object.freeze({
        label: "Back to HIISSA",
        route: "/",
        connectionState: "FOUNDER_TESTED_PASS_SESSION_REMAINS_ACTIVE",
      }),
    }),
    releaseGate:
      "Normal Sign in is connected to My HIISSA in isolated Preview and the Founder-tested account navigation checkpoint has passed. Production release remains separately gated and is not authorised.",
    certification: certificationContract({
      stage: "CONNECTED",
      designDecision:
        "My HIISSA is the single authenticated account home for the normal general HIISSA Sign in journey in isolated Preview. Canonical Talk remains conversation-only and the obsolete authenticated home block has been removed from generic Talk.",
      automatedChecks: ["registry-integrity"],
      previewEvidence: [
        "isolated-route-built",
        "founder-identified-navigation-and-mobile-layout-defects",
        "dedicated-account-and-conversation-destinations-implemented",
        "neutral-talk-and-explore-entries-implemented",
        "botanical-art-moved-into-reserved-layout-column",
      ],
      founderTest: "PASS",
      regression: "PASS_IN_CURRENT_PREVIEW_BUILD_AND_FOUNDER_RETEST",
      connection: "CONNECTED_IN_PREVIEW_FOUNDER_TESTED_REGRESSION_PASS",
      knownGaps: [
        "my-space-canonical-destination-not-yet-reconciled",
        "account-access-resolver-not-yet-implemented",
        "production-release-not-authorised",
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
        "isolated authenticated-home Preview with normal Sign in routed to My HIISSA; no Production release",
    }),
  }),

  accountJourney: Object.freeze({
    id: "account.journey",
    certificationManaged: true,
    status: "connected-preview-founder-tested-regression-pass",
    accessFamily: "authenticated-account-navigation",
    purpose:
      "One connected HIISSA account journey from signed-out Main through canonical Sign in and authentication into My HIISSA, across account destinations and back navigation, then through local-device sign out to signed-out Main again.",
    requiredSequence: Object.freeze([
      "SIGNED_OUT_MAIN",
      "SIGN_IN",
      "MAGIC_LINK",
      "CONTINUE_SECURELY",
      "MY_HIISSA_HOME",
      "ACCOUNT",
      "TALK",
      "EXPLORE",
      "CONVERSATIONS",
      "BACK_TO_MY_HIISSA",
      "BACK_TO_MAIN",
      "SIGN_OUT_THIS_DEVICE",
      "SIGNED_OUT_MAIN_AGAIN",
    ]),
    navigationRule:
      "The account journey is certified as one system, not as disconnected screens. A passing individual surface does not certify the journey.",
    identityRule:
      "One canonical HIISSA Sign in creates or resumes one authenticated HIISSA identity session. Authentication remains separate from entitlement and TOGETHER shared-space permission.",
    signedInMainRule:
      "When the complete navigation connection is implemented, the public Main page must distinguish signed-out Sign in from the signed-in My HIISSA entry without signing the user out or changing access level.",
    privateHomeRule:
      "My HIISSA is the authenticated account home. Signed-out access must resolve through the one canonical Sign-in journey rather than exposing a disconnected private-home state.",
    signOutRule:
      "Sign out on this device uses local-device sign out and returns to the Main opening page in a signed-out state.",
    protectedDependencies: Object.freeze([
      "public-main-approved-interface",
      "auth.signin",
      "auth-continue",
      "auth-confirm",
      "my-hiissa.home",
      "my-hiissa.account",
      "my-hiissa.conversations",
      "talk.canonical",
      "explore.canonical",
      "guest-save-sync",
      "free-email-journey",
      "plus-preview",
      "together-preview",
      "production-auth",
      "production-main",
    ]),
    certification: certificationContract({
      stage: "CONNECTED",
      designDecision:
        "Founder approved expanding the Certification Gate so the full account navigation is tested as one contract: signed-out Main → Sign in → Magic Link → Continue securely → My HIISSA → Account/Talk/Explore/Conversations → back to My HIISSA → back to Main → sign out this device → signed-out Main.",
      automatedChecks: [
        "registry-integrity",
        "my-hiissa-routing",
        "complete-account-journey-contract",
      ],
      previewEvidence: [
        "journey-contract-registered",
        "existing-individual-surfaces-remain-separately-testable",
        "complete-connected-journey-preview-build-ready",
      ],
      founderTest: "PASS",
      regression: "PASS_IN_CURRENT_PREVIEW_BUILD_AND_FOUNDER_RETEST",
      connection: "CONNECTED_IN_PREVIEW_FOUNDER_TESTED_REGRESSION_PASS",
      knownGaps: [
        "production-release-not-authorised",
        "account-access-resolver-remains-separate-future-capability",
        "my-space-canonical-destination-remains-separate-registry-task",
      ],
    }),
    controlRoom: controlRoomContract({
      modules: [
        CONTROL_ROOM_MODULES.overview,
        CONTROL_ROOM_MODULES.usersIdentity,
        CONTROL_ROOM_MODULES.authSync,
        CONTROL_ROOM_MODULES.failuresReliability,
        CONTROL_ROOM_MODULES.systemOperations,
        CONTROL_ROOM_MODULES.adminSecurityAudit,
      ],
      healthSignals: [
        "complete-account-journey-contract-present",
        "signin-to-my-hiissa-handoff-healthy",
        "my-hiissa-destination-return-paths-healthy",
        "signed-out-private-routes-resolve-through-canonical-signin",
        "local-device-signout-returns-to-signed-out-main",
      ],
      failureSignals: [
        "journey-step-disconnected",
        "duplicate-or-legacy-account-home-resurfaces",
        "signed-in-user-reprompted-unnecessarily",
        "signed-out-user-exposed-private-home",
        "private-child-route-creates-duplicate-signin-interface",
        "signout-does-not-return-to-signed-out-main",
      ],
      recoveryClassification: "HUMAN_REQUIRED_FOR_NAVIGATION_OR_AUTH_CHANGES",
      founderOversight:
        "L1 Preview journey health; L2 material account-navigation degradation; L3 authentication, Production or protected-interface changes",
      operationalScope:
        "complete authenticated account journey contract in isolated Preview only; no Production release",
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
    previewPostAuthenticationRouting: Object.freeze({
      normalGeneralSignIn: "/my-hiissa",
      free: "/free/welcome",
      guestSaveSyncHandoff: "/",
      historyRule:
        "For normal general Sign in only, the one-time Continue securely page is replaced in browser history before authentication confirmation. If browser history later revisits the general Sign-in URL while the same valid session exists, HIISSA replaces that stale Sign-in entry with My HIISSA. PLUS and TOGETHER return contexts, FREE and Guest Save & Sync navigation semantics remain unchanged in this repair.",
    }),
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
