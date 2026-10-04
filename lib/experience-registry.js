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

export const CONTROL_ROOM_MODULE_REGISTRY = Object.freeze({
  status: "founder-approved-extensible-foundation",
  currentModuleCount: 10,
  currentModulesLocked: true,
  futureExpansionAllowed: true,
  noModule11ExistsToday: true,
  founderApprovalRequiredForNewModule: true,
  principle:
    "The ten current Founder Control Room modules remain the approved architecture today. The Control Room is nevertheless registry-driven so a genuinely new future administrative domain can become Module 11 or beyond only after Founder approval, without rewriting or destabilising the existing modules.",
  extensionRule:
    "Prefer routing a new capability into an existing authorised module when it fits. Create a new module only when the capability represents a genuinely distinct administrative domain that cannot be governed safely or coherently inside the existing ten.",
  requiredFieldsForFutureModule: Object.freeze([
    "canonical-module-id",
    "public-admin-label",
    "purpose",
    "routes",
    "authorised-roles",
    "permissions",
    "data-sources",
    "experience-registry-connections",
    "health-signals",
    "failure-signals",
    "audit-rules",
    "environment-scope",
    "dependencies",
    "status",
    "display-order",
    "founder-approval-evidence",
  ]),
  lifecycle: Object.freeze([
    "DRAFT",
    "HIDDEN",
    "STAGING",
    "FOUNDER_TESTING",
    "ACTIVE",
    "RESTRICTED",
    "HIBERNATED",
  ]),
  currentModules: Object.freeze([
    CONTROL_ROOM_MODULES.overview,
    CONTROL_ROOM_MODULES.usersIdentity,
    CONTROL_ROOM_MODULES.subscriptionsAccess,
    CONTROL_ROOM_MODULES.feedbackRecommendations,
    CONTROL_ROOM_MODULES.safetyPrivacyModeration,
    CONTROL_ROOM_MODULES.failuresReliability,
    CONTROL_ROOM_MODULES.authSync,
    CONTROL_ROOM_MODULES.aiProduct,
    CONTROL_ROOM_MODULES.systemOperations,
    CONTROL_ROOM_MODULES.adminSecurityAudit,
  ]),
});

export const REGISTRY_STANDARD = Object.freeze({
  mandatory: true,
  oneCanonicalIdentityPerCapability: true,
  noDuplicateImplementationForSecondaryRoutes: true,
  entitlementSeparateFromIdentity: true,
  permissionsSeparateFromEntitlement: true,
  controlRoomContractRequired: true,
  featureOperationalVisibilityRequired: true,
  accessRegistrationHealthRequiredWhereApplicable: true,
  certificationStateRequiredForMaterialCapabilities: true,
  operationalCompletionRequiresRegistryCertificationAndControlRoom: true,
  newFeaturesControlRoomReadyFromBeginning: true,
  backfillExistingFeaturesAdditively: true,
  preserveWorkingCoreDuringBackfill: true,
  founderRule:
    "Build HIISSA so tomorrow's idea can be added without breaking today's working feature.",
  operationalCompletionRule:
    "No substantial HIISSA feature is operationally complete until it has one canonical Registry identity, an evidence-based Certification Gate state, and an appropriate Operational Intelligence / Founder Control Room contract that makes its real health, access/entry state, failures, recovery and verification visible to the Founder. Where registration, sign-in, invitation, entitlement or consent gates apply, their privacy-safe health must also be observable. Existing working features are backfilled additively without rewriting their working core; new features receive these foundations from the beginning.",
});


export const FEATURE_OPERATIONAL_VISIBILITY_STANDARD = Object.freeze({
  mandatoryForEverySubstantialFeature: true,
  controlRoomConnectionRequired: true,
  registryConnectionRequired: true,
  privacySafeOperationalEvidenceOnly: true,
  noPrivateConversationContentForRoutineHealthMonitoring: true,
  noFabricatedMetrics: true,
  founderPrinciple:
    "Every substantial HIISSA feature must be visible to the Founder Control Room so the Founder can tell whether it is available, accessible, healthy, failing, recovering and safe without opening raw infrastructure systems.",
  minimumFeatureVisibility: Object.freeze([
    "feature identity and current lifecycle/status",
    "environment and release state",
    "route/service/content availability",
    "access and entitlement health",
    "registration/onboarding/entry completion health where the feature has registration or gated entry",
    "authorised aggregate usage/activation signals where appropriate",
    "failure and degradation signals",
    "user-impact classification",
    "automatic recovery attempts and retry bounds",
    "human intervention state",
    "last verified healthy evidence",
    "relevant dependency/provider health",
    "audit trail for material operational/admin actions",
  ]),
  accessRegistrationRule:
    "Where a feature depends on account creation, sign-in, registration, invitation, entitlement, consent or another entry gate, the Control Room must expose privacy-safe health of that journey: requested/started, succeeded, failed, blocked, degraded and recovery/verification state as applicable.",
  nonApplicableRule:
    "A feature that has no registration or account-entry step must not invent registration metrics; it must expose the access/entry health that actually applies to that feature.",
  completionRule:
    "A feature is not operationally complete merely because its interface renders. Registry identity, Certification evidence and Control Room operational visibility must all exist before the feature may be called operationally complete.",
});

export const HIISSA_OPERATIONAL_INTELLIGENCE_MANDATE = Object.freeze({
  status: "founder-approved-mandatory",
  mandatoryForEveryApplicableFeature: true,
  lifecycle: Object.freeze([
    "MONITOR",
    "DETECT",
    "CLASSIFY",
    "SAFELY_RECOVER",
    "VERIFY",
    "RECORD",
    "REPORT",
  ]),
  recoveryClasses: Object.freeze([
    "SAFE_TO_AUTO_RECOVER",
    "SAFE_WITH_LIMIT",
    "HUMAN_REQUIRED",
    "FOUNDER_REQUIRED",
    "NEVER_AUTOMATE",
  ]),
  founderCommand:
    "Every substantial HIISSA feature connected to the Founder Control Room must monitor, detect, classify, safely recover where pre-authorised, verify the result, record evidence and report in human-readable form. The Founder must not be made to manually repair routine problems that HIISSA is authorised to handle safely.",
  requiredFeatureContract: Object.freeze([
    "health-signals",
    "failure-signals",
    "classification-rule",
    "safe-automatic-action",
    "retry-bounds",
    "recovery-verification",
    "automatic-stop-condition",
    "human-intervention-boundary",
    "L1-L2-L3-founder-oversight",
    "notification-requirements",
    "audit-evidence",
    "human-readable-control-room-reporting",
  ]),
  completionRule:
    "A feature is not operationally complete because its screen works. Registry identity, Certification evidence, Control Room health visibility, recovery behaviour, verification, reporting and appropriate escalation must be in place.",
});

export const FOUNDER_ALERT_GATEWAY_STANDARD = Object.freeze({
  status: "founder-approved-architecture-not-yet-live",
  sourceOfTruth: "Founder Control Room — Needs Your Attention",
  channels: Object.freeze([
    "CONTROL_ROOM",
    "SMS_TO_DEDICATED_HIISSA_FOUNDER_NUMBER",
    "FOUNDER_EMAIL",
    "APP_PUSH_WHEN_AVAILABLE",
  ]),
  privacyRule:
    "External alerts carry only the minimum information needed to identify the operational issue. Private conversation content, secrets and unnecessary personal data must not be exposed in lock-screen, SMS or routine email alerts.",
  oversightRouting: Object.freeze({
    L1: "Record in Control Room without unnecessary interruption.",
    L2: "Record and notify the Founder through configured authorised channels.",
    L3: "Record, alert the Founder and stop at the approval boundary until Founder decision where required.",
  }),
  supportAcknowledgementTarget:
    "A successfully received customer-support message should receive an automatic acknowledgement within approximately one minute.",
  supportResponseTarget:
    "The initial normal human-response target is within 24 hours unless the real configured support capacity requires an honestly stated different target.",
  supportEscalationPrinciple:
    "The issue is escalated to the authorised specialist role; the original support worker's permissions are not expanded merely because the case becomes specialised.",
});

export const ADMIN_STAFF_ACCESS_ONBOARDING_STANDARD = Object.freeze({
  status: "founder-approved-not-yet-operational",
  module: CONTROL_ROOM_MODULES.adminSecurityAudit,
  canonicalName: "HIISSA Admin Access & Staff Onboarding",
  principle:
    "No person receives HIISSA administrative access merely through verbal agreement. Access requires a controlled invitation, identity verification, evidenced policy acceptance, role requirements, Founder approval, deliberate activation and an attributable audit record.",
  mandatoryForNewAdminAccess: true,
  founderApprovalBeforeActivation: true,
  noSelfGrant: true,
  founderRoleNotAssignableThroughOrdinaryStaffInvitation: true,
  invitationDoesNotGrantAccess: true,
  adminGateChangesOnlyAfterApprovedActivation: true,
  minimumNecessaryDataOnly: true,
  roleSpecificOnboardingRequired: true,
  policyVersionEvidenceRequired: true,
  periodicAccessReviewRequired: true,
  offboardingRequired: true,
  stagingAndProductionAuthoritySeparate: true,
  stages: Object.freeze([
    "INVITED",
    "FORM_STARTED",
    "IDENTITY_VERIFICATION_PENDING",
    "POLICIES_ACCEPTED",
    "ROLE_REQUIREMENTS_COMPLETE",
    "FOUNDER_REVIEW",
    "APPROVED",
    "ACCESS_ACTIVE",
    "REJECTED",
    "WITHDRAWN",
    "SUSPENDED",
    "ACCESS_REMOVED",
  ]),
  evidence: Object.freeze([
    "inviter",
    "invitee-verified-identity",
    "work-contact-and-role-scope",
    "policy-and-rule-version-identifiers",
    "acceptance-date-time",
    "required-training-or-check-state",
    "Founder-decision",
    "assigned-role",
    "environment-scope",
    "activation-date-time",
    "later-role-change-suspension-or-removal",
  ]),
  policyAreas: Object.freeze([
    "confidentiality",
    "acceptable-use",
    "privacy-and-data-handling",
    "security-and-credential-protection",
    "least-privilege-obligations",
    "customer-information-boundaries",
    "incident-reporting",
    "role-specific-safeguarding-where-applicable",
    "acknowledgement-that-material-admin-actions-are-audited",
  ]),
  legalReadinessRule:
    "Final policy, employment/contractor, electronic-acceptance and jurisdiction-specific wording must receive appropriate professional/legal review before live staff onboarding is activated.",
  operationalHealth: Object.freeze([
    "invitation-delivery-health",
    "expired-or-invalid-invitation-state",
    "identity-verification-health",
    "policy-acceptance-completion",
    "role-requirement-completion",
    "Founder-review-queue",
    "approved-access-provisioning",
    "failed-or-partial-provisioning",
    "periodic-access-review-due",
    "suspension-and-offboarding-completion",
  ]),
});

export const ADMIN_STAFF_ONBOARDING_WORKFLOW = Object.freeze({
  status: "founder-approved-detailed-design-not-yet-live",
  canonicalName: "HIISSA Admin Access & Staff Onboarding",
  secureApplicantExperienceContract: "STAFF_SECURE_ONBOARDING_EXPERIENCE_STANDARD",
  invitation: Object.freeze({
    createdBy: "Founder or separately authorised MANAGE ADMIN ACCESS role",
    requiredInputs: Object.freeze([
      "work-email",
      "proposed-role",
      "department-or-function",
      "environment-scope",
      "reason-for-access",
      "optional-access-start-date",
      "optional-access-end-date-when-time-bounded",
    ]),
    previewRequiredBeforeSend: true,
    simulatedPrototypeMustNotSendExternally: true,
    liveStatusEvidence: Object.freeze([
      "SENT",
      "DELIVERED",
      "OPENED",
      "STARTED",
      "EXPIRED",
      "REVOKED",
    ]),
    resendAndRevokeControlsRequired: true,
    messageMustExplain: Object.freeze([
      "this is an invitation to complete onboarding, not a grant of Admin access",
      "proposed role and environment scope",
      "secure link expiry",
      "identity verification requirement",
      "policy and role-requirement acceptance",
      "Founder review before activation",
      "where to ask a question before accepting",
    ]),
    security:
      "Invitation token must be single-purpose, time-bounded, revocable and unusable as Admin access by itself.",
  }),
  applicantForm: Object.freeze({
    requiredFields: Object.freeze([
      "legal-or-contractual-name",
      "preferred-display-name",
      "verified-work-email",
      "work-contact-number-where-required",
      "job-title-or-contractor-function",
      "department-or-team",
      "country-or-working-jurisdiction-where-needed-for-policy-routing",
      "proposed-role-confirmation",
      "conflict-or-access-concern-declaration",
      "accessibility-or-onboarding-support-needs-optional",
    ]),
    dataMinimisationRule:
      "Collect only information genuinely needed to establish identity, employment/contracting context, role suitability, policy routing, access administration and audit. Do not collect unrelated personal information.",
  }),
  policyAcceptance: Object.freeze({
    commonPolicySet: Object.freeze([
      "HIISSA confidentiality and private-information handling",
      "acceptable use of Admin systems",
      "privacy and data-protection responsibilities",
      "security, credential and device protection",
      "least-privilege and need-to-know obligations",
      "customer-information boundaries",
      "incident and suspected-breach reporting",
      "Admin actions are attributable and audited",
      "no credential sharing and no impersonation",
      "access must stop when role, contract or authorisation ends",
    ]),
    roleSpecificExamples: Object.freeze({
      customer_support: Object.freeze([
        "service-problem access only",
        "no routine access to private relationship conversations",
        "escalate specialist problems rather than expanding own permissions",
      ]),
      technical_operations: Object.freeze([
        "operational diagnostics without raw private conversation access",
        "bounded approved recovery only",
        "no unapproved Production changes",
      ]),
      safety_safeguarding: Object.freeze([
        "specialist safeguarding rules and escalation",
        "minimum-necessary access",
        "jurisdiction-specific training/checks where applicable",
      ]),
      privacy_data_protection: Object.freeze([
        "data-rights handling",
        "authorised review only",
        "export/erasure workflows require applicable approvals",
      ]),
    }),
    evidence:
      "Store policy identifier, version, presented date/time, authenticated acceptance date/time and any required role-specific training/check evidence.",
    noBundledConsent:
      "Do not hide materially different obligations inside one vague checkbox. Present policy groups clearly enough that acceptance is meaningful and auditable.",
  }),
  founderReview: Object.freeze({
    summaryMustShow: Object.freeze([
      "verified identity and work contact",
      "proposed role and department",
      "requested environment scope",
      "reason for access",
      "policy acceptance completeness",
      "policy versions accepted",
      "role-specific training/check state",
      "requested start/end date where applicable",
      "permission preview for the proposed role",
      "NEVER ACCESS and specialist-gated boundaries",
      "conflicts, missing evidence or warnings",
      "previous HIISSA Admin access history where applicable",
    ]),
    decisions: Object.freeze({
      APPROVE:
        "Creates an approved provisioning instruction only after step-up/confirmation. Access becomes active only when provisioning and verification both succeed.",
      RETURN:
        "Sends the application back for correction or missing evidence without granting access.",
      REJECT:
        "Closes the request without granting access and records the Founder decision and reason category.",
    }),
    founderConfirmation:
      "Approval of live Admin access is a sensitive action and must use step-up/confirmation appropriate to the environment and risk.",
  }),
  activation: Object.freeze({
    order: Object.freeze([
      "Founder approval recorded",
      "permission engine re-evaluates proposed role/scope",
      "Admin gate eligibility is provisioned",
      "role assignment is provisioned",
      "environment scope is provisioned",
      "verification confirms intended access and denied boundaries",
      "audit event is written",
      "staff member receives activation notice",
    ]),
    failureRule:
      "Partial provisioning must not be treated as success. Stop, mark Needs Attention, preserve evidence and either safely roll back or require authorised human repair.",
  }),
  notifications: Object.freeze({
    applicant: Object.freeze([
      "invitation sent",
      "invitation expiring",
      "application returned for correction",
      "application approved and access activated",
      "application rejected",
      "access suspended or removed",
    ]),
    founder: Object.freeze([
      "application ready for review",
      "identity or policy verification failure requiring attention",
      "provisioning failure",
      "periodic review due",
      "suspension/offboarding failure",
    ]),
    gateway:
      "Founder alerts use the shared Founder Alert Gateway and may reach Control Room, Founder email, dedicated HIISSA Founder SMS number and later app push according to L1/L2/L3 severity.",
  }),
  periodicReview: Object.freeze({
    mustReview: Object.freeze([
      "person still requires Admin access",
      "role still matches current duties",
      "environment scope still necessary",
      "time-bounded grants have not overstayed",
      "required policies/training remain current",
      "no unresolved security or access concern",
    ]),
    noSilentRenewal:
      "High-risk or time-bounded authority must not silently continue beyond its approved review/expiry rules.",
  }),
  offboarding: Object.freeze({
    actions: Object.freeze([
      "suspend or remove Admin gate eligibility as appropriate",
      "revoke active role assignments and access grants",
      "invalidate outstanding invitations or exceptional grants",
      "record reason category and effective time",
      "verify denied access after removal",
      "preserve attributable audit history",
    ]),
    urgentRule:
      "Where continued access creates material security/privacy/safety risk, pre-authorised protective suspension may occur immediately, followed by Founder notification, audit and review.",
  }),
  accessibility:
    "The onboarding and Founder review journey must support accessible keyboard/screen-reader interaction, clear language, visible focus, non-colour-only status, scalable presentation and reasonable support needs without weakening security.",
  completionRule:
    "The workflow is not operationally complete until invitation, verification, policy evidence, Founder decision, provisioning, denied-boundary verification, audit, notifications, periodic review and offboarding have all passed Certification Gate testing in Staging.",
});

export const UNIVERSAL_FOUNDER_SUBMISSION_GATE = Object.freeze({
  status: "founder-approved-mandatory-latest-human-staff-rule",
  supersedesForHumanStaffSubmission:
    "Earlier wording that only consequential staff work required Founder approval is preserved historically but is superseded for completed human staff submissions by this stronger Founder instruction.",
  rule:
    "Every human staff work item that reaches its submit, completion or final-effect stage must automatically pass through HIISSA to the Founder before final execution. Staff may perform authorised preparation, investigation, drafting and save-draft work inside role boundaries, but submission itself must not create final external or material effect.",
  staffSubmitLabel: "Submit for processing",
  staffSubmittedConfirmation: "Submitted for processing",
  founderRoute: "Founder Command / Approval Inbox",
  founderDecisions: Object.freeze(["APPROVE", "RETURN_FOR_CHANGES", "REJECT"]),
  executionRule:
    "Only after Founder approval may HIISSA move the work into its controlled execution stage; execution must then be verified, recorded and reported before completion is claimed.",
  staffVisibility:
    "Staff see honest processing states appropriate to their work. They do not need access to the private Founder decision machinery and must never be falsely told an external action was sent or completed before it actually occurred.",
  hiissaAutomationBoundary:
    "This universal gate applies to human staff submissions. Separately pre-authorised safe HIISSA automatic recovery continues under MONITOR → DETECT → CLASSIFY → SAFELY RECOVER → VERIFY → RECORD → REPORT until its classification requires human or Founder intervention.",
});

export const STAFF_WORKSPACE_SHELL_STANDARD = Object.freeze({
  status: "founder-approved-fictional-staging-design-to-build",
  canonicalName: "HIISSA Staff Workspace",
  founderIsNotOrdinaryStaffWorkspace: true,
  sharedShell: Object.freeze([
    "role and authorised department identity",
    "assigned work",
    "work in progress",
    "saved drafts",
    "submitted for processing",
    "returned for changes",
    "completed authorised outcomes",
    "staff notifications",
    "secure sign out",
  ]),
  workspaces: Object.freeze([
    Object.freeze({ id: "technical_operations", label: "Technical Operations" }),
    Object.freeze({ id: "customer_support", label: "Customer Support" }),
    Object.freeze({ id: "finance_subscriptions", label: "Finance & Subscriptions" }),
    Object.freeze({ id: "safety_safeguarding", label: "Safety & Safeguarding" }),
    Object.freeze({ id: "privacy_data_protection", label: "Privacy & Data Protection" }),
    Object.freeze({ id: "content_moderation", label: "Content & Moderation" }),
    Object.freeze({ id: "product_quality", label: "Product & Quality" }),
  ]),
  permissionRule:
    "Each staff member sees only the workspaces, records, tools and actions deliberately authorised for their active role and environment.",
  universalSubmissionGate: "UNIVERSAL_FOUNDER_SUBMISSION_GATE",
  testingRule:
    "Build and Founder-test fictional Staging staff identities and work items before any real employee is onboarded or any real external action is enabled.",
});

export const FOUNDER_PROVIDER_SUBSCRIPTION_SPEND_STANDARD = Object.freeze({
  status: "founder-approved-staging-register-live-feeds-partial",
  canonicalName: "Founder Provider, Subscription & Spend Register",
  primaryModule: CONTROL_ROOM_MODULES.systemOperations,
  relatedModules: Object.freeze([
    CONTROL_ROOM_MODULES.overview,
    CONTROL_ROOM_MODULES.subscriptionsAccess,
    CONTROL_ROOM_MODULES.failuresReliability,
    CONTROL_ROOM_MODULES.aiProduct,
    CONTROL_ROOM_MODULES.adminSecurityAudit,
  ]),
  purpose:
    "Give the Founder one complete operational and financial view of HIISSA's external services, API capacity, recurring subscriptions, renewals, usage, credits, provider health and business-tool commitments.",
  distinction:
    "Customer HIISSA subscriptions belong primarily to Subscriptions & Access. HIISSA's own provider/tool subscriptions and infrastructure spend belong primarily to System & Operations, with failures in Reliability and AI-provider usage/cost also visible in AI & Product Intelligence.",
  founderVisibility: Object.freeze([
    "provider or subscription name",
    "purpose and dependency",
    "current plan when verified",
    "billing cycle",
    "renewal or next-payment date when verified",
    "currency",
    "recurring commitment when verified",
    "usage and current-period spend when verified",
    "API credits, quota or capacity when the provider exposes reliable data",
    "low-credit or low-capacity threshold",
    "payment or billing status",
    "provider health",
    "last successful data refresh",
    "source of billing/usage evidence",
    "responsible operational owner",
    "notes and audit history",
  ]),
  privacyAndSecurity: Object.freeze([
    "never display API keys, passwords, raw tokens or full payment-card details",
    "payment method display must be masked or descriptive only",
    "billing access is Founder/authorised-finance information",
    "do not infer or fabricate a balance, renewal date, cost or plan when no verified source exists",
  ]),
  alertPolicy: Object.freeze({
    capacityThresholds: Object.freeze(["25% remaining", "10% remaining", "5% remaining", "EXHAUSTED"]),
    renewalWindows: Object.freeze(["30 days", "14 days", "7 days", "1 day"]),
    billingSignals: Object.freeze([
      "payment failed",
      "unexpected spend increase",
      "quota or rate limit approaching",
      "credit or prepaid balance low",
      "service suspended or degraded",
      "renewal due",
    ]),
    founderChannels:
      "Control Room notification plus configured Founder email and dedicated HIISSA phone notification according to severity and channel availability.",
  }),
  moneySafety:
    "Monitoring, reminders and preparation may be automatic. Automatic purchase, top-up, plan upgrade, renewal change or other money-moving action is NOT authorised merely by this standard and requires the applicable Founder approval.",
  providerRegister: Object.freeze([
    Object.freeze({
      id: "openai-api",
      label: "OpenAI API",
      category: "AI runtime provider",
      evidence: "OPENAI_API_KEY is configured for the current HIISSA environment.",
      currentFinancialSource: "LIVE BILLING/CREDIT SOURCE NOT YET CONNECTED TO CONTROL ROOM",
      requiredView: "credit/capacity, usage, spend, limits, billing status and low-credit warning",
    }),
    Object.freeze({
      id: "vercel",
      label: "Vercel",
      category: "Hosting, deployments and runtime infrastructure",
      evidence: "HIISSA Vercel team/project and real billing-usage records are available to authorised development tooling.",
      currentFinancialSource: "CONTROL ROOM LIVE BILLING FEED NOT YET CONNECTED",
      requiredView: "plan, recurring commitment, usage charges, current-period spend, renewal/billing state and capacity",
    }),
    Object.freeze({
      id: "supabase",
      label: "Supabase",
      category: "Database, authentication and storage foundation",
      evidence: "HIISSA organisation currently reports Free plan; Production and Staging projects are ACTIVE_HEALTHY.",
      currentFinancialSource: "PLAN VERIFIED; CONTROL ROOM LIVE BILLING FEED NOT YET CONNECTED",
      requiredView: "plan, projects, database/storage usage, limits, spend if any, renewal/billing state and health",
    }),
    Object.freeze({
      id: "resend",
      label: "Resend",
      category: "Transactional email",
      evidence: "hiissa.com is verified for sending and account usage/limits are available.",
      currentFinancialSource: "USAGE SOURCE VERIFIED; CONTROL ROOM LIVE FEED NOT YET CONNECTED",
      requiredView: "email quota/usage, domains, plan/limits, billing state, renewal and delivery-provider health",
    }),
    Object.freeze({
      id: "cloudflare",
      label: "Cloudflare",
      category: "DNS and Turnstile/security dependency",
      evidence: "Cloudflare DNS and Turnstile are confirmed parts of the current HIISSA setup.",
      currentFinancialSource: "BILLING/PLAN SOURCE NOT YET CONNECTED",
      requiredView: "DNS/domain dependency, Turnstile health, plan/cost if applicable, renewal and service alerts",
    }),
    Object.freeze({
      id: "hiissa-domain",
      label: "hiissa.com domain",
      category: "Domain / brand infrastructure",
      evidence: "hiissa.com is operational and verified for HIISSA email; Cloudflare DNS is confirmed.",
      currentFinancialSource: "REGISTRAR/BILLING SOURCE REQUIRES VERIFICATION",
      requiredView: "registrar, renewal date, renewal cost, auto-renew state, DNS health and expiry warning",
    }),
    Object.freeze({
      id: "github",
      label: "GitHub",
      category: "Source-code and repository operations",
      evidence: "HIISSA repository is actively connected to development and deployment workflows.",
      currentFinancialSource: "PLAN/BILLING SOURCE NOT YET CONNECTED",
      requiredView: "plan if paid, recurring cost, renewal, repository/service health and access ownership",
    }),
    Object.freeze({
      id: "chatgpt",
      label: "ChatGPT",
      category: "Founder/business operating tool",
      evidence: "Founder identifies ChatGPT as a recurring paid operating subscription.",
      currentFinancialSource: "MANUAL/ACCOUNT BILLING SOURCE UNTIL SECURELY CONNECTED",
      requiredView: "plan, monthly/annual cost, next payment date and business-expense history",
    }),
  ]),
  extensibility:
    "Future providers and subscriptions must be addable from a controlled Founder/Finance interface without redesigning the ten-module architecture. New records start unverified until their source, plan, cost and renewal evidence are confirmed.",
  failureRouting:
    "Credit exhaustion, failed payment or provider outage creates a Reliability event; AI-provider cost/quality also appears in AI & Product Intelligence; urgent Founder action surfaces in Overview / Needs Your Attention.",
});

export const RECOMMEND_SHARE_REFERRAL_STANDARD = Object.freeze({
  status: "founder-approved-interface-prototype-not-yet-live",
  canonicalName: "Recommend / Share HIISSA + Referral",
  userFacingName: "Invite someone to HIISSA",
  existingArchitecturePreserved: true,
  principle: "Share HIISSA. Never your story.",
  doorwayRule:
    "Referral is an additive growth and attribution layer behind the existing Recommend / Share HIISSA feature. It must not become a competing duplicate control beside Share.",
  shareChoices: Object.freeze([
    "WHATSAPP",
    "MESSAGES_TEXT",
    "EMAIL",
    "COPY_LINK",
    "QR_CODE",
    "NATIVE_PHONE_SHARE",
  ]),
  channelBehaviour: Object.freeze({
    WHATSAPP:
      "Open the device/app WhatsApp share path with a prepared HIISSA invitation message and privacy-safe invitation/referral link.",
    MESSAGES_TEXT:
      "Open the device messaging/SMS composer with a prepared HIISSA invitation message and privacy-safe invitation/referral link.",
    EMAIL:
      "Open the device email composer with a prepared invitation/referral link. The referral email itself is NOT an authentication Magic Link.",
    COPY_LINK:
      "Copy the privacy-safe invitation/referral URL and confirm that the invitation link was copied.",
    QR_CODE:
      "Display a scannable invitation QR representation for the privacy-safe invitation/referral URL, with copy-link fallback.",
    NATIVE_PHONE_SHARE:
      "Use the device-native share sheet so the user can choose another compatible app.",
  }),
  authBoundary:
    "Referral/invitation links bring the recipient to HIISSA. If the recipient later chooses to create or sign into an account, the existing HIISSA Magic-Link authentication flow may be used separately. Referral links and authentication Magic Links must never be conflated.",
  privacyRules: Object.freeze([
    "never include private conversation content",
    "never include relationship history",
    "never include reflections, journal content or private activity",
    "never expose account secrets or authentication credentials",
    "do not infer that a specific person is vulnerable and target them for referral",
  ]),
  referralAttribution:
    "Authenticated users may later receive a privacy-safe referral identity/link so HIISSA can attribute a genuine visit/join milestone without exposing the referrer's private HIISSA data.",
  rewardPhasing: Object.freeze([
    "STAGE_1_REFERRAL_FOUNDATION",
    "STAGE_2_REWARDED_REFERRALS_AFTER_PAID_PLANS_OPERATIONAL",
    "STAGE_3_AMBASSADOR_AND_PARTNER_PROGRAMME",
  ]),
  rewardSafety:
    "Do not reward link spam or raw invitation volume. Any future reward must depend on a Founder-approved genuine referral milestone and include anti-abuse controls.",
  myHiissaFutureHome:
    "My HIISSA may later include a quiet Invites & Rewards area for sent invitations, joined referrals and Founder-approved rewards.",
  controlRoomRouting:
    "Referral growth analytics belongs in existing authorised Control Room views and must not create Module 11. Referral performance can surface through Overview, Feedback & Recommendations / growth insight, Subscriptions & Access conversion, and Product Intelligence as appropriate.",
  prototypeRule:
    "The current Staging share interface is a visual interaction prototype only. It must not create a real referral record, send a real email/SMS/WhatsApp message, award a reward, or expose a live user identity until each action is separately certified.",
});

export const FOUNDER_APPROVAL_INBOX_STANDARD = Object.freeze({
  status: "founder-approved-interactive-staging-prototype-not-live",
  canonicalName: "Founder Command / Approval Inbox",
  sourceOfTruthRule:
    "The Approval Inbox is a shared Founder view over one underlying approval record. It must not duplicate the same consequential action into separate independent approval records merely because that action is visible from several authorised modules.",
  intakeRule:
    "Only actions classified as requiring Founder approval enter the approval queue. Routine role-authorised work remains attributable and auditable but must not create unnecessary approval noise.",
  requiredDecisionPack: Object.freeze([
    "who prepared the action",
    "originating module and action type",
    "what is being requested",
    "why it is requested",
    "who or what may be affected",
    "risk and warnings",
    "authorised evidence",
    "what HIISSA has already checked",
    "what changes if approved",
    "whether it can be reversed",
    "what happens if rejected",
    "HIISSA recommendation where appropriate",
  ]),
  founderDecisions: Object.freeze([
    "APPROVE",
    "RETURN_FOR_CHANGES",
    "REJECT",
  ]),
  actionRule:
    "A Founder decision must be attributable, step-up protected where the real action requires it, auditable, idempotent, and must not create material or external effect until the downstream authorised execution and verification stage succeeds.",
  returnRule:
    "Return for Changes sends the work back to its authorised preparer with the Founder note and preserves the original proposal and audit history.",
  rejectRule:
    "Reject closes the pending proposal without carrying out the proposed consequential effect and records the decision reason.",
  approvalRule:
    "Approve authorises the next controlled execution stage only; approval is not the same as verified completion.",
  visibility: Object.freeze([
    "PENDING",
    "RETURNED_FOR_CHANGES",
    "APPROVED_PENDING_EXECUTION",
    "EXECUTING",
    "VERIFIED_COMPLETE",
    "FAILED_NEEDS_ATTENTION",
    "REJECTED",
    "CANCELLED",
  ]),
  simulationRule:
    "The current Staging prototype uses labelled fictional approval items and local screen state only. It must not send messages, alter access, move money, publish content, change Production or write a real Founder decision.",
});

export const FOUNDER_CONTROL_ROOM_STRENGTHENING_PACKAGE = Object.freeze({
  status: "founder-approved-shared-capabilities-not-yet-live",
  noNewModuleCreated: true,
  oneSourceOfTruth: true,
  principle:
    "The Founder should never have to discover a serious Admin problem accidentally. HIISSA must surface material risk, explain it in plain English, show what it has already done, state whether Founder action is required, and provide the safest authorised action directly from the Control Room.",
  capabilities: Object.freeze([
    Object.freeze({
      id: "founder-approval-inbox",
      name: "Founder Command / Approval Inbox",
      status: "FOUNDER_APPROVED_NOT_YET_LIVE",
      modules: Object.freeze([
        CONTROL_ROOM_MODULES.overview,
        CONTROL_ROOM_MODULES.adminSecurityAudit,
      ]),
      purpose:
        "One shared Needs Your Approval queue for consequential Admin actions across all authorised modules without creating duplicate source records.",
      minimumView: Object.freeze([
        "who prepared the action",
        "what is being requested",
        "why it is requested",
        "who or what may be affected",
        "risk and warnings",
        "authorised evidence",
        "HIISSA recommendation where appropriate",
        "Approve Return Reject controls according to authority",
      ]),
    }),
    Object.freeze({
      id: "founder-emergency-pause",
      name: "Founder Emergency Pause Controls",
      status: "FOUNDER_APPROVED_NOT_YET_LIVE",
      modules: Object.freeze([
        CONTROL_ROOM_MODULES.overview,
        CONTROL_ROOM_MODULES.failuresReliability,
        CONTROL_ROOM_MODULES.systemOperations,
        CONTROL_ROOM_MODULES.adminSecurityAudit,
      ]),
      purpose:
        "Allow the Founder to temporarily pause an authorised department action, feature, integration or outgoing-action class while investigating material uncertainty or risk.",
      rules: Object.freeze([
        "reason required",
        "scope must be explicit",
        "audit required",
        "affected capability must be visibly marked paused",
        "restore path must be controlled and verified",
        "historical evidence must not be deleted",
      ]),
    }),
    Object.freeze({
      id: "staff-session-device-control",
      name: "Staff Session & Device Control",
      status: "FOUNDER_APPROVED_NOT_YET_LIVE",
      modules: Object.freeze([
        CONTROL_ROOM_MODULES.usersIdentity,
        CONTROL_ROOM_MODULES.authSync,
        CONTROL_ROOM_MODULES.adminSecurityAudit,
      ]),
      purpose:
        "Make suspension real by showing authorised Admin sessions/devices and allowing permitted Force Sign Out or Revoke Sessions actions with verification.",
      noCosmeticBlocking: true,
    }),
    Object.freeze({
      id: "preview-as-role",
      name: "Preview as Role",
      status: "FOUNDER_APPROVED_NOT_YET_LIVE",
      modules: Object.freeze([
        CONTROL_ROOM_MODULES.adminSecurityAudit,
      ]),
      purpose:
        "Let the Founder safely preview which Control Room modules, resources and actions a proposed role would receive before approval.",
      prohibition:
        "Preview as Role must never impersonate the worker, open their private account, or become an invisible login-as-user capability.",
    }),
    Object.freeze({
      id: "founder-decision-pack",
      name: "Founder Decision Pack",
      status: "FOUNDER_APPROVED_NOT_YET_LIVE",
      modules: Object.freeze([
        CONTROL_ROOM_MODULES.overview,
        CONTROL_ROOM_MODULES.adminSecurityAudit,
      ]),
      purpose:
        "Prepare sensitive decisions in plain English so the Founder does not have to interpret raw technical systems.",
      questions: Object.freeze([
        "What is being requested?",
        "Why?",
        "What changes if I approve?",
        "Who may be affected?",
        "What could go wrong?",
        "What has HIISSA already checked?",
        "Can it be reversed?",
        "What happens if I reject?",
      ]),
    }),
    Object.freeze({
      id: "customer-communication-service-level-centre",
      name: "Customer Communication & Service-Level Centre",
      status: "FOUNDER_APPROVED_NOT_YET_LIVE",
      modules: Object.freeze([
        CONTROL_ROOM_MODULES.overview,
        CONTROL_ROOM_MODULES.usersIdentity,
        CONTROL_ROOM_MODULES.feedbackRecommendations,
        CONTROL_ROOM_MODULES.failuresReliability,
      ]),
      purpose:
        "Track support communication from receipt through acknowledgement, assignment, response due, response, waiting and resolution while protecting unrelated private HIISSA content.",
      lifecycle: Object.freeze([
        "RECEIVED",
        "AUTOMATIC_ACKNOWLEDGEMENT_SENT",
        "ASSIGNED",
        "HUMAN_RESPONSE_DUE",
        "RESPONDED",
        "WAITING_FOR_CUSTOMER",
        "RESOLVED",
      ]),
      acknowledgementTarget: "approximately one minute after successful receipt",
      overdueRule:
        "HIISSA warns before the promised human-response target is missed and escalates overdue cases through the Founder Alert Gateway according to configured severity.",
    }),
    Object.freeze({
      id: "staff-trust-training-access-review",
      name: "Staff Trust, Training & Access Review",
      status: "FOUNDER_APPROVED_NOT_YET_LIVE",
      modules: Object.freeze([
        CONTROL_ROOM_MODULES.usersIdentity,
        CONTROL_ROOM_MODULES.adminSecurityAudit,
      ]),
      purpose:
        "Give the Founder an evidence-based staff access review showing current policy/training/access readiness without creating a subjective employee score.",
      visibility: Object.freeze([
        "policies accepted and versions",
        "required training completed",
        "last access review",
        "next review due",
        "temporary permissions",
        "access expiry",
        "unresolved security or access concerns",
        "role changes",
      ]),
      noOpaqueTrustScore: true,
    }),
    Object.freeze({
      id: "admin-security-anomaly-alerts",
      name: "Security Anomaly Alerts",
      status: "FOUNDER_APPROVED_NOT_YET_LIVE",
      modules: Object.freeze([
        CONTROL_ROOM_MODULES.overview,
        CONTROL_ROOM_MODULES.failuresReliability,
        CONTROL_ROOM_MODULES.authSync,
        CONTROL_ROOM_MODULES.adminSecurityAudit,
      ]),
      purpose:
        "Surface unusual Admin security behaviour for review without automatically accusing a person of wrongdoing.",
      examples: Object.freeze([
        "repeated denied actions",
        "attempts outside assigned role scope",
        "unusual export attempts",
        "repeated failed step-up checks",
        "self-grant attempts",
        "unusual spikes in privileged actions",
      ]),
      defaultLanguage:
        "Unusual Admin activity detected — review recommended.",
    }),
    Object.freeze({
      id: "daily-founder-brief",
      name: "Daily Founder Brief",
      status: "FOUNDER_APPROVED_NOT_YET_LIVE",
      modules: Object.freeze([
        CONTROL_ROOM_MODULES.overview,
      ]),
      purpose:
        "Give the Founder one concise management view of what HIISSA fixed automatically, what is healthy, what failed, support items due, staff approvals, access reviews, feedback and anything genuinely requiring Founder attention.",
      externalDeliveryOptional: true,
    }),
    Object.freeze({
      id: "temporary-deputy-mode",
      name: "Founder Continuity / Temporary Deputy Mode",
      status: "RESERVED_NOT_ENABLED",
      modules: Object.freeze([
        CONTROL_ROOM_MODULES.adminSecurityAudit,
      ]),
      purpose:
        "Future narrowly scoped, explicitly granted and time-limited delegated authority when the Founder cannot personally act for a defined period.",
      boundaries: Object.freeze([
        "never creates a second Founder",
        "never transfers Founder ownership",
        "explicit scope only",
        "explicit duration only",
        "automatic expiry",
        "full audit",
        "revocable by Founder",
        "requires separate Founder decision before implementation or activation",
      ]),
    }),
  ]),
  routingRule:
    "These are shared capabilities routed into the existing ten Founder Control Room modules. They do not create Module 11 and must reuse one underlying source of truth where an event appears in several authorised views.",
  privacyRule:
    "Operational visibility must remain minimum-necessary and privacy-safe; routine Admin health must not expose unrelated private relationship conversation content.",
});

export const FOUNDER_ADMIN_AUTHORITY_AND_STAFF_ACTION_GATE = Object.freeze({
  status: "founder-approved-mandatory-not-yet-operational",
  module: CONTROL_ROOM_MODULES.adminSecurityAudit,
  founderAuthority:
    "The Founder retains full authorised oversight and control across the Founder Control Room and all current departments/modules. Ordinary staff onboarding cannot create, inherit, remove, suspend, demote or override Founder authority.",
  founderBoundary:
    "Full Founder Control Room authority means all legitimate administrative capabilities. It does not require exposing raw passwords, secrets or unnecessary private conversation content where the Control Room can provide a safer authorised operational view.",
  staffActionPrinciple:
    "All staff activity is attributable and auditable. Routine authorised viewing, investigation, drafting and internal preparation may proceed within role boundaries. Consequential actions that create material, external, financial, access, publication, privacy, safety or user-impacting effect must stop at the configured Founder approval gate before effect.",
  consequentialExamples: Object.freeze([
    "sending an externally consequential customer communication when Founder sign-off is configured",
    "granting changing suspending or removing Admin access",
    "Production configuration or release authority",
    "financial subscription refund or entitlement action above approved routine bounds",
    "publishing public-facing material where Founder approval is required",
    "material privacy data-rights or safeguarding decisions",
    "exceptional-access or break-glass decisions",
  ]),
  founderDecisions: Object.freeze([
    "APPROVE",
    "RETURN_FOR_CHANGES",
    "REJECT",
  ]),
  founderControls: Object.freeze([
    "FULL_CONTROL_ROOM_OVERSIGHT",
    "FOUNDER_APPROVAL_GATE",
    "IMMEDIATE_STAFF_SUSPENSION",
    "CHANGE_ROLE_OR_SCOPE",
    "REMOVE_ADMIN_ACCESS",
    "AUDIT_OVERSIGHT",
  ]),
  noStaffOverride: true,
  noStaffFounderCreation: true,
  noStaffFounderSuspension: true,
  noSelfApprovalForSensitiveAction: true,
  hiissaAutomationRule:
    "The Founder approval gate does not stop separately pre-authorised safe HIISSA automatic recovery. HIISSA continues MONITOR → DETECT → CLASSIFY → SAFELY RECOVER → VERIFY → RECORD → REPORT until a recovery classification reaches HUMAN_REQUIRED, FOUNDER_REQUIRED or NEVER_AUTOMATE.",
});

export const STAFF_ACCESS_SUSPENSION_AND_OFFBOARDING_STANDARD = Object.freeze({
  status: "founder-approved-not-yet-live",
  module: CONTROL_ROOM_MODULES.adminSecurityAudit,
  principle:
    "The Founder may immediately suspend, restrict, change or remove a staff member's Admin access when there is suspected malpractice, unexplained activity, role change, security/privacy/safety concern, contract end or another legitimate management reason.",
  actions: Object.freeze({
    SUSPEND:
      "Temporarily block Admin access while preserving the person's identity, role history and complete audit evidence for investigation and possible restoration.",
    CHANGE_ROLE:
      "Replace or reduce the person's approved role/scope through a controlled permission review; do not silently accumulate old permissions.",
    REMOVE_ACCESS:
      "End Admin eligibility and revoke active role/access grants while preserving historical audit records.",
  }),
  suspensionMust: Object.freeze([
    "block Admin Gate eligibility or equivalent active Admin entry",
    "revoke or pause active role permissions and exceptional grants as applicable",
    "invalidate active privileged sessions where technically appropriate",
    "stop new privileged actions",
    "record who suspended access, when, and a reason category",
    "verify that restricted Admin access is actually denied",
    "preserve historical audit evidence",
    "surface recovery or reinstatement requirements",
  ]),
  urgentProtectiveRule:
    "Where continued access creates material security, privacy or safety risk, pre-authorised protective suspension may occur immediately, followed by Founder notification, audit and review.",
  founderProtection:
    "Ordinary staff cannot use staff suspension/offboarding controls against the Founder or alter Founder authority.",
});

export const STAFF_SECURE_ONBOARDING_EXPERIENCE_STANDARD = Object.freeze({
  status: "founder-approved-detailed-design-not-yet-live",
  entryPrinciple:
    "The invitation email is the secure doorway to onboarding; the onboarding form itself is not embedded in email.",
  invitationCta: "Start HIISSA Staff Onboarding",
  invitationAccessRule:
    "The secure invitation grants access only to the protected onboarding journey for that invitation. It does not grant access to the Admin Control Room.",
  applicantJourney: Object.freeze([
    "INVITATION_RECEIVED",
    "SECURE_LINK_OPENED",
    "WELCOME_AND_ROLE_EXPLANATION",
    "INTENDED_PERSON_VERIFICATION",
    "ONBOARDING_CHECKLIST",
    "STAFF_DETAILS",
    "POLICIES_AND_ROLE_REQUIREMENTS",
    "REVIEW_APPLICATION",
    "SUBMIT_FOR_FOUNDER_REVIEW",
    "AWAITING_FOUNDER_REVIEW",
    "RETURNED_FOR_CHANGES_OR_APPROVED_OR_REJECTED",
    "ACCESS_ACTIVATION_ONLY_AFTER_APPROVAL_AND_VERIFICATION",
  ]),
  checklist: Object.freeze([
    "Your details",
    "Role information",
    "Policies",
    "Role requirements",
    "Review",
    "Submit",
  ]),
  saveAndResumeRequired: true,
  progressPreservedWithinInvitation: true,
  returnedApplicationRule:
    "If the Founder returns the application, the invitee should resume from the relevant incomplete/correctable part rather than restarting the whole onboarding journey.",
  applicantStatusVisibility: Object.freeze([
    "DELIVERED",
    "OPENED",
    "STARTED",
    "PART_COMPLETE",
    "SUBMITTED",
    "UNDER_REVIEW",
    "RETURNED_FOR_CHANGES",
    "APPROVED_PENDING_ACTIVATION",
    "ACCESS_ACTIVE",
    "REJECTED",
    "EXPIRED",
    "REVOKED",
  ]),
  submissionMessage:
    "Your HIISSA onboarding has been submitted successfully. No Admin access has been granted yet. Your application is awaiting Founder review.",
  activationMessageRule:
    "Only after Founder approval, successful provisioning and verification should the invitee receive confirmation that Admin access is active and instructions for secure sign-in.",
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
  youngHiissa: Object.freeze({
    id: "young-hiissa",
    certificationManaged: true,
    status: "founder-approved-architecture-not-publicly-released",
    publicLabel: "Young HIISSA",
    family: "protected-young-person-experience",
    explorePlacement:
      "Explore HIISSA — protected Young HIISSA discovery entry. Exact visible placement and age/jurisdiction gating must be confirmed before activation.",
    primaryPurpose:
      "Provide a protected, developmentally appropriate HIISSA experience for young people while reusing canonical HIISSA intelligence and strengthening safeguarding, adaptive communication, safe-person support and age-appropriate growth.",
    preservedArchitecture: Object.freeze([
      "Protect Me",
      "Help Me Grow",
      "Understand Myself",
      "Help With Others",
      "Talk",
      "Mos Space",
      "Play",
      "Get Help",
      "morning encouragement",
      "Home / Explore / My HIISSA connections",
    ]),
    implementationRule:
      "Young HIISSA Talk/Voice reuses existing canonical Talk/Voice rather than creating another AI brain. Age, safeguarding, disclosure, guardian, jurisdiction and accessibility boundaries remain separate gates.",
    activationStatus: "NOT_PUBLICLY_ACTIVATED",
    certification: certificationContract({
      stage: "DESIGN_APPROVED",
      designDecision:
        "Founder reconfirmed Young HIISSA as one of the additional Explore HIISSA experiences to preserve and later activate under its protected young-person architecture.",
      knownGaps: [
        "public-entry-design-not-yet-certified",
        "final-age-and-jurisdiction-gates-pending",
        "full-young-person-release-gates-not-complete",
        "production-release-not-authorised",
      ],
    }),
    controlRoom: controlRoomContract({
      modules: [
        CONTROL_ROOM_MODULES.overview,
        CONTROL_ROOM_MODULES.usersIdentity,
        CONTROL_ROOM_MODULES.subscriptionsAccess,
        CONTROL_ROOM_MODULES.safetyPrivacyModeration,
        CONTROL_ROOM_MODULES.failuresReliability,
        CONTROL_ROOM_MODULES.aiProduct,
        CONTROL_ROOM_MODULES.systemOperations,
        CONTROL_ROOM_MODULES.adminSecurityAudit,
      ],
      healthSignals: [
        "young-hiissa-entry-health",
        "young-hiissa-age-gate-health",
        "young-hiissa-adaptive-communication-health",
        "young-hiissa-safeguarding-pathway-health",
        "young-hiissa-voice-accessibility-health",
      ],
      failureSignals: [
        "young-hiissa-age-gate-failure",
        "young-hiissa-safeguarding-pathway-failure",
        "young-hiissa-disclosure-integrity-regression",
        "young-hiissa-inappropriate-adult-routing",
        "young-hiissa-accessibility-regression",
      ],
      recoveryClassification: "HUMAN_REQUIRED_FOR_SAFETY_OR_ACCESS_CHANGES",
      founderOversight:
        "L1 operational health; L2 developmental/accessibility degradation; L3 safeguarding, age, guardian, jurisdiction or Production changes",
      operationalScope: "protected-young-person-experience",
    }),
  }),

  hiissaRest: Object.freeze({
    id: "hiissa.rest",
    certificationManaged: true,
    status: "founder-approved-concept-interface-preserved-not-publicly-released",
    publicLabel: "HIISSA Rest",
    family: "rest-sleep-calming-experience",
    explorePlacement:
      "Explore HIISSA — primarily Reset / Listen, with authorised discovery from other appropriate Explore surfaces.",
    primaryPurpose:
      "Create short, calming HIISSA rest experiences using rotating audio, atmosphere and visual motion for rest, winding down and sleep-supportive moments without pretending to provide medical treatment.",
    founderApprovedExperience: Object.freeze([
      "fresh rotating short-form rest experiences",
      "calming background sound",
      "animated restorative visuals",
      "sleep/rest supportive atmosphere",
      "approximately five-minute experiences where appropriate",
      "anti-repeat freshness rather than one static video",
      "HIISSA-original experience rather than copying another creator",
    ]),
    implementationRule:
      "Use controlled media/content, freshness/rotation, accessibility equivalents and evidence-safe wellness language. Do not make medical sleep-treatment claims.",
    activationStatus: "NOT_PUBLICLY_ACTIVATED",
    certification: certificationContract({
      stage: "DESIGN_APPROVED",
      designDecision:
        "Founder approved HIISSA Rest, its concept direction and sample interface, and reconfirmed it as one of the additional Explore HIISSA experiences.",
      knownGaps: [
        "content-library-not-yet-built",
        "rotation-engine-not-yet-wired",
        "access-allocation-not-finalised",
        "founder-preview-test-not-yet-run",
        "production-release-not-authorised",
      ],
    }),
    controlRoom: controlRoomContract({
      modules: [
        CONTROL_ROOM_MODULES.overview,
        CONTROL_ROOM_MODULES.subscriptionsAccess,
        CONTROL_ROOM_MODULES.feedbackRecommendations,
        CONTROL_ROOM_MODULES.safetyPrivacyModeration,
        CONTROL_ROOM_MODULES.failuresReliability,
        CONTROL_ROOM_MODULES.aiProduct,
        CONTROL_ROOM_MODULES.systemOperations,
        CONTROL_ROOM_MODULES.adminSecurityAudit,
      ],
      healthSignals: [
        "hiissa-rest-media-availability",
        "hiissa-rest-freshness-rotation-health",
        "hiissa-rest-audio-playback-health",
        "hiissa-rest-accessibility-equivalent-health",
      ],
      failureSignals: [
        "hiissa-rest-media-failure",
        "hiissa-rest-repeat-staleness",
        "hiissa-rest-audio-unavailable",
        "hiissa-rest-unsafe-health-claim",
        "hiissa-rest-accessibility-regression",
      ],
      recoveryClassification: "SAFE_WITH_LIMIT_OR_HUMAN_REQUIRED",
      founderOversight:
        "L1 content/media health; L2 repeated quality/accessibility degradation; L3 safety, entitlement or Production changes",
      operationalScope: "rest-media-and-experience-health",
    }),
  }),

  hiissaAlongside: Object.freeze({
    id: "hiissa.alongside",
    certificationManaged: true,
    status: "founder-approved-concept-not-publicly-released",
    publicLabel: "HIISSA Alongside",
    family: "spoken-life-companion-experience",
    explorePlacement:
      "Explore HIISSA — primarily Listen, with authorised secondary discovery through Grow, Reset and other appropriate Explore contexts.",
    tagline:
      "HIISSA for the moments when life is already happening.",
    primaryPurpose:
      "Turn ordinary moments into meaningful ones through spoken companionship, perspective, learning, stories, cultural tales and encouragement while the user is walking, moving, commuting, working, doing chores, resting or simply listening.",
    contexts: Object.freeze([
      "Walk with HIISSA",
      "Move with HIISSA",
      "Commute with HIISSA",
      "Life with HIISSA",
      "Learn with HIISSA",
      "Reset with HIISSA",
      "Just stay with me",
    ]),
    experienceFamilies: Object.freeze([
      "Companion Journeys",
      "Stories & Tales",
      "HIISSA With You",
      "Carry This With You",
    ]),
    storiesAndTales: Object.freeze({
      includes: [
        "African Tales",
        "Stories from the World",
        "HIISSA original stories",
      ],
      culturalRule:
        "Do not flatten cultures into stereotypes. Traditional material requires appropriate provenance/context/review; original HIISSA stories must not be falsely represented as authentic folklore.",
    }),
    spokenCompanionOptions: Object.freeze([
      "Lift me up",
      "Remind me who I am",
      "Help me keep going",
      "Give me perspective",
      "Speak hope into this moment",
      "Help me believe in tomorrow",
      "Just talk to me",
    ]),
    durationModel: Object.freeze([
      "5 minutes",
      "10 minutes",
      "20 minutes",
      "30 minutes",
      "Stay with me",
    ]),
    globalAdaptationRule:
      "Adapt language, examples, pacing and cultural context only from verified language/cultural capability and user-selected or intentionally supplied preferences; never infer culture merely from location.",
    drivingSafetyRule:
      "Driving context must use an eyes-free safe mode: no typing requests, no visual exercises, minimal decisions and no deliberately overwhelming emotional deep-dives.",
    accessDirection:
      "Full libraries and longer/personalised journeys may support subscription value; FREE should retain a meaningful rotating taste. Exact entitlement allocation remains a separate Founder decision.",
    activationStatus: "NOT_PUBLICLY_ACTIVATED",
    certification: certificationContract({
      stage: "DESIGN_APPROVED",
      designDecision:
        "Founder approved HIISSA Alongside, including companion journeys, Stories & Tales, African Tales, HIISSA With You and Carry This With You, and reconfirmed it as an additional Explore HIISSA experience.",
      knownGaps: [
        "visual-interface-not-yet-founder-approved",
        "content-governance-library-not-yet-built",
        "cultural-review-workflow-not-yet-implemented",
        "voice-duration-engine-not-yet-implemented",
        "final-entitlement-allocation-pending",
        "production-release-not-authorised",
      ],
    }),
    controlRoom: controlRoomContract({
      modules: [
        CONTROL_ROOM_MODULES.overview,
        CONTROL_ROOM_MODULES.subscriptionsAccess,
        CONTROL_ROOM_MODULES.feedbackRecommendations,
        CONTROL_ROOM_MODULES.safetyPrivacyModeration,
        CONTROL_ROOM_MODULES.failuresReliability,
        CONTROL_ROOM_MODULES.aiProduct,
        CONTROL_ROOM_MODULES.systemOperations,
        CONTROL_ROOM_MODULES.adminSecurityAudit,
      ],
      healthSignals: [
        "hiissa-alongside-audio-health",
        "hiissa-alongside-content-freshness",
        "hiissa-alongside-language-quality",
        "hiissa-alongside-cultural-review-state",
        "hiissa-alongside-duration-session-health",
        "hiissa-alongside-driving-safe-mode-health",
      ],
      failureSignals: [
        "hiissa-alongside-audio-failure",
        "hiissa-alongside-repetitive-content",
        "hiissa-alongside-language-quality-regression",
        "hiissa-alongside-cultural-integrity-risk",
        "hiissa-alongside-driving-interaction-risk",
        "hiissa-alongside-unsupported-health-or-life-claim",
      ],
      recoveryClassification: "SAFE_WITH_LIMIT_OR_HUMAN_REQUIRED",
      founderOversight:
        "L1 playback/content health; L2 language/cultural/accessibility degradation; L3 safety, cultural-integrity, entitlement or Production changes",
      operationalScope: "spoken-life-companion-experience",
    }),
  }),


  accessDiscovery: Object.freeze({
    id: "access.discovery",
    certificationManaged: true,
    status: "founder-approved-isolated-implementation",
    accessFamily: "cross-access-discovery",
    publicLabel: "Go further with HIISSA",
    entry: "/access",
    primaryPurpose:
      "Provide HIISSA FREE users with one calm, transparent place to understand HIISSA Guest, HIISSA+ and HIISSA TOGETHER without forcing a subscription or jumping directly to one paid experience.",
    founderDecision:
      "Founder approved the Go further with HIISSA interface as HIISSA's main access-discovery and conversion doorway. It must show all relevant access paths, preserve a visible Continue with HIISSA FREE option, and use value-led marketing psychology rather than pressure.",
    conversionPrinciples: Object.freeze([
      "reassure-belonging-before-selling",
      "show-value-before-upgrade",
      "preserve-free-access-at-all-times",
      "present-guest-plus-together-side-by-side",
      "no-distress-exploitation",
      "no-fabricated-pricing-or-entitlements",
      "help-me-choose-without-manipulation",
    ]),
    routes: Object.freeze({
      continueFree: "/free-access",
      guest: "/free",
      plus: "/plus/welcome",
      together: "/together/welcome",
    }),
    progressiveRevealPrinciple:
      "Prefer guided progressive reveal inside the same screen when content naturally belongs to the current journey, rather than forcing unnecessary page hops or repeated upward scrolling.",
    certification: certificationContract({
      stage: "REGISTRY_REGISTERED",
      designDecision:
        "Founder approved the visual proposal showing current FREE status, HIISSA Guest, HIISSA+, HIISSA TOGETHER, Continue with HIISSA FREE and Help me choose.",
      automatedChecks: ["free-access-guest-label-contract"],
      knownGaps: [
        "founder-preview-test-not-yet-run",
        "help-me-choose-interactive-logic-not-yet-built",
        "pricing-and-entitlement-copy-not-finalised",
        "production-release-not-authorised",
      ],
    }),
    controlRoom: controlRoomContract({
      modules: [
        CONTROL_ROOM_MODULES.overview,
        CONTROL_ROOM_MODULES.subscriptionsAccess,
        CONTROL_ROOM_MODULES.aiProduct,
        CONTROL_ROOM_MODULES.failuresReliability,
        CONTROL_ROOM_MODULES.systemOperations,
      ],
      healthSignals: [
        "access-discovery-page-reachable",
        "continue-free-route-reachable",
        "guest-route-reachable",
        "plus-route-reachable",
        "together-route-reachable",
      ],
      failureSignals: [
        "access-discovery-route-failure",
        "missing-free-continuation",
        "misrouted-access-option",
        "direct-plus-only-conversion-regression",
      ],
      recoveryClassification: "SAFE_WITH_LIMIT_OR_HUMAN_REQUIRED",
      founderOversight:
        "L1 copy/routing health; L2 material conversion-navigation degradation; L3 pricing, entitlement or Production changes",
      operationalScope: "access-discovery-interface-and-routing-only",
    }),
  }),

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
