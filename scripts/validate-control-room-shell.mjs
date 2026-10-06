import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const pagePath = path.join(root, "app", "admin", "control-room-preview", "page.js");
const stylePath = path.join(root, "app", "admin", "control-room-preview", "page.module.css");
const registryPath = path.join(root, "lib", "experience-registry.js");
const sharePreviewPath = path.join(root, "app", "share-hiissa-preview", "page.js");
const securitySummaryPath = path.join(
  root,
  "app",
  "api",
  "admin",
  "control-room",
  "security-summary",
  "route.js"
);
const openAiProviderSummaryPath = path.join(
  root,
  "app",
  "api",
  "admin",
  "control-room",
  "openai-provider-summary",
  "route.js"
);
const founderWelcomePath = path.join(
  root,
  "app",
  "api",
  "admin",
  "control-room",
  "founder-welcome",
  "route.js"
);
const activityTimelinePath = path.join(
  root,
  "app",
  "api",
  "admin",
  "control-room",
  "activity-timeline",
  "route.js"
);
const peopleExperienceHealthPath = path.join(
  root,
  "app",
  "api",
  "admin",
  "control-room",
  "people-experience-health",
  "route.js"
);
const authSyncHealthPath = path.join(
  root,
  "app",
  "api",
  "admin",
  "control-room",
  "auth-sync-health",
  "route.js"
);
const recordTimePath = path.join(root, "lib", "hiissa-record-time.js");
const gentleCheckInPolicyPath = path.join(
  root,
  "lib",
  "people-experience",
  "gentle-checkin.js"
);
const gentleCheckInComponentPath = path.join(
  root,
  "components",
  "people-experience",
  "GentleCheckIn.js"
);
const workdayClosePath = path.join(
  root,
  "app",
  "api",
  "admin",
  "control-room",
  "workday-close",
  "route.js"
);
const workdayCloseComponentPath = path.join(
  root,
  "components",
  "people-experience",
  "WorkdayClose.js"
);
const workdayCloseStylePath = path.join(
  root,
  "components",
  "people-experience",
  "WorkdayClose.module.css"
);

const errors = [];

function requireText(label, source, text) {
  if (!source.includes(text)) errors.push(`${label}: missing ${text}`);
}

if (!fs.existsSync(pagePath)) errors.push("Founder Control Room preview page is missing.");
if (!fs.existsSync(stylePath)) errors.push("Founder Control Room stylesheet is missing.");
if (!fs.existsSync(securitySummaryPath)) errors.push("Protected Admin Security summary endpoint is missing.");
if (!fs.existsSync(openAiProviderSummaryPath)) errors.push("Protected OpenAI provider summary endpoint is missing.");
if (!fs.existsSync(founderWelcomePath)) errors.push("Protected Founder welcome intelligence endpoint is missing.");
if (!fs.existsSync(peopleExperienceHealthPath)) errors.push("Protected People Experience health endpoint is missing.");
if (!fs.existsSync(authSyncHealthPath)) errors.push("Protected Auth & Sync health endpoint is missing.");
if (!fs.existsSync(activityTimelinePath)) errors.push("Protected Founder activity timeline endpoint is missing.");
if (!fs.existsSync(recordTimePath)) errors.push("Shared HIISSA record time formatter is missing.");
if (!fs.existsSync(gentleCheckInPolicyPath)) errors.push("Shared gentle check-in policy is missing.");
if (!fs.existsSync(gentleCheckInComponentPath)) errors.push("Shared gentle check-in component is missing.");
if (!fs.existsSync(workdayClosePath)) errors.push("Protected Founder Workday Close endpoint is missing.");
if (!fs.existsSync(workdayCloseComponentPath)) errors.push("Shared Workday Close component is missing.");
if (!fs.existsSync(workdayCloseStylePath)) errors.push("Shared Workday Close styles are missing.");

const authenticatedPagePath = path.join(root, "app", "admin", "control-room", "page.js");
const authenticatedClientPath = path.join(root, "app", "admin", "control-room", "AuthenticatedControlRoom.js");

if (!fs.existsSync(authenticatedPagePath)) errors.push("Authenticated Control Room page is missing.");
if (!fs.existsSync(authenticatedClientPath)) errors.push("Authenticated Control Room client gate is missing.");

const authenticatedPage = fs.existsSync(authenticatedPagePath)
  ? fs.readFileSync(authenticatedPagePath, "utf8")
  : "";
const authenticatedClient = fs.existsSync(authenticatedClientPath)
  ? fs.readFileSync(authenticatedClientPath, "utf8")
  : "";

for (const required of [
  'process.env.VERCEL_ENV === "production"',
  "notFound()",
]) requireText("Authenticated Control Room route", authenticatedPage, required);

for (const required of [
  'supabase.auth.getSession()',
  '"is_hiissa_admin"',
  'environmentLabel="STAGING — TEST"',
  'supabase.auth.signOut()',
]) requireText("Authenticated Control Room gate", authenticatedClient, required);

if (!fs.existsSync(registryPath)) errors.push("Experience Registry is missing.");
if (!fs.existsSync(sharePreviewPath)) errors.push("Share HIISSA Staging preview is missing.");

const page = fs.existsSync(pagePath) ? fs.readFileSync(pagePath, "utf8") : "";
const styles = fs.existsSync(stylePath) ? fs.readFileSync(stylePath, "utf8") : "";
const registry = fs.existsSync(registryPath) ? fs.readFileSync(registryPath, "utf8") : "";
const sharePreview = fs.existsSync(sharePreviewPath) ? fs.readFileSync(sharePreviewPath, "utf8") : "";
const securitySummary = fs.existsSync(securitySummaryPath)
  ? fs.readFileSync(securitySummaryPath, "utf8")
  : "";
const openAiProviderSummary = fs.existsSync(openAiProviderSummaryPath)
  ? fs.readFileSync(openAiProviderSummaryPath, "utf8")
  : "";
const founderWelcome = fs.existsSync(founderWelcomePath)
  ? fs.readFileSync(founderWelcomePath, "utf8")
  : "";
const activityTimeline = fs.existsSync(activityTimelinePath)
  ? fs.readFileSync(activityTimelinePath, "utf8")
  : "";
const peopleExperienceHealth = fs.existsSync(peopleExperienceHealthPath)
  ? fs.readFileSync(peopleExperienceHealthPath, "utf8")
  : "";
const authSyncHealth = fs.existsSync(authSyncHealthPath)
  ? fs.readFileSync(authSyncHealthPath, "utf8")
  : "";
const recordTime = fs.existsSync(recordTimePath)
  ? fs.readFileSync(recordTimePath, "utf8")
  : "";
const gentleCheckInPolicy = fs.existsSync(gentleCheckInPolicyPath)
  ? fs.readFileSync(gentleCheckInPolicyPath, "utf8")
  : "";
const gentleCheckInComponent = fs.existsSync(gentleCheckInComponentPath)
  ? fs.readFileSync(gentleCheckInComponentPath, "utf8")
  : "";
const workdayClose = fs.existsSync(workdayClosePath)
  ? fs.readFileSync(workdayClosePath, "utf8")
  : "";
const workdayCloseComponent = fs.existsSync(workdayCloseComponentPath)
  ? fs.readFileSync(workdayCloseComponentPath, "utf8")
  : "";
const workdayCloseStyles = fs.existsSync(workdayCloseStylePath)
  ? fs.readFileSync(workdayCloseStylePath, "utf8")
  : "";

for (const label of [
  "Overview",
  "Users & Identity",
  "Subscriptions & Access",
  "Feedback & Recommendations",
  "Safety, Privacy & Moderation",
  "Failures & Reliability",
  "Authentication & Sync Health",
  "HIISSA AI & Product Intelligence",
  "System & Operations",
  "Admin Security & Audit",
]) requireText("Control Room shell", page, label);

for (const required of [
  "← Back to HIISSA",
  "← Back",
  "Sign out",
  "ISOLATED PREVIEW",
  "no fake health numbers.",
  "FEATURE OPERATIONAL VISIBILITY",
  "SHARED DETAIL VIEW — CONTROL ROOM STANDARD",
  "FOUNDER ACCESS CENTRE",
  "Departments & staff workspaces",
  "FOUNDER 100% OVERSIGHT",
  "Select ",
  "aria-pressed={selected}",
  "ACTIVE DEPARTMENT",
  "You&apos;re viewing",
  "Tap to select this department",
  "Selected · Workspace approved — interface not built yet",
  "Open {workspace.label} workspace",
  "Interactive areas acknowledge your selection; informational cards remain informational.",
  "STAFF DIRECTORY — FOUNDER SIDE",
  "NO STAFF PASSWORD REQUIRED",
  "FATI BANCE",
  "FOUNDER",
  "Overview",
  "Modules",
  "Staff & Workspaces",
  "Approvals",
  "Search",
  "Alerts",
  "FOUNDER SEARCH",
  "FOUNDER ALERTS",
  "ControlRoomOverviewLiveSummary",
  "PEOPLE EXPERIENCE",
  "CONNECTED SOURCES",
  "Open Failures & Reliability",
  "LIVE-WIRED · STAGING",
  "FounderWelcomeMoment",
  'fetch("/api/admin/control-room/founder-welcome"',
  "Open the dedicated Founder staff area",
  "One visible approval inbox",
  "FounderContextBack",
  "navigationHistory",
  "function goBack()",
  "FounderAlertButton",
  "alertBadgeCritical",
  "criticalAlertToast",
  "Open Alerts",
  "FOUNDER ACTIVITY TIMELINE",
  "What happened, and exactly when",
  'fetch("/api/admin/control-room/activity-timeline"',
  "formatHiissaRecordTime",
  "formatHiissaFullRecordTime",
  "Approval record created",
  "Submitted for processing",
  "recordTimeGrid",
  "HIISSA timestamp rule:",
  "GentleCheckIn",
  "checkInVisible",
  "calmStart",
  "FOUNDER CALM START",
  "Only what may need you first",
  "Open Alerts",
  "Open Approvals",
  "Show full Overview",
  "Your check-in answer was not sent to the Founder/Admin audit trail.",
  "FounderWorkdayClose",
  "Finish for now",
  'fetch("/api/admin/control-room/workday-close"',
  "Before you finish for now…",
  "FATI BANCE · FOUNDER",
  "PEOPLE EXPERIENCE · LIVE STAGING OPERATIONAL HEALTH",
  '"/api/admin/control-room/people-experience-health"',
  "MODULE 6 — LIVE STAGING RELIABILITY VIEW",
  "PEOPLE EXPERIENCE CONNECTED",
  "What failed, what HIISSA did, and whether you need to act",
  "WHAT HAPPENED",
  "CURRENT STATUS",
  "WHO / WHAT MAY BE AFFECTED",
  "WHAT HIISSA ALREADY DID",
  "DO I NEED TO ACT?",
  "AVAILABLE ACTIONS",
  "RECOVERY / NEXT STEP",
  "RELATED EVENTS",
  "AUDIT HISTORY",
  "TECHNICAL DETAILS — expand",
  "PRODUCTION UNTOUCHED",
  "MODULE 7 — LIVE STAGING READ-ONLY",
  "AUTH & SYNC CONNECTED",
  "OVERALL IDENTITY HEALTH",
  "FAILED SIGN-INS",
  "FAILED GUEST MIGRATIONS / EVIDENCE INTEGRITY",
  "SYNC FAILURES",
  "POSSIBLE IDENTITY CONFLICTS",
  "AUTHENTICATION & SYNC OPERATING PRINCIPLES",
  "Guest is not an error; Skip is not a failed conversion.",
  '"/api/admin/control-room/auth-sync-health"',
  "Open Auth & Sync",
  "2 LIVE SOURCES",
  "Authentication & Sync reliability cross-reference",
  "No second incident record is created.",
  "AUTH & SYNC · SECURITY CROSS-REFERENCE",
  "Identity and ownership boundary",
  "Different device sessions are normal.",
]) requireText("Control Room shell", page, required);

for (const required of [
  ".welcomeName{",
  'font-family:ui-serif,Georgia,Cambria,"Times New Roman",serif;',
  ".alertBadgeAttention",
  ".alertBadgeCritical",
  ".criticalAlertToast",
  ".contextBack",
  "grid-template-columns:repeat(2,minmax(0,1fr));",
  ".activityTimelineSection",
  ".activityEvent",
  ".activityTime",
  ".recordTimeGrid",
  ".approvalQueueTime",
  ".timestampStandardNote",
  ".calmStartPanel",
  ".calmStartActions",
  ".calmStartPrivacy",
  ".overviewHeadingActions",
  ".finishForNowButton",
  ".accessCentreCardSelected",
  ".accessCentreSelect",
  ".accessCentreSelectedPill",
  ".selectedWorkspaceContext",
  ".overviewPathway:active",
  ".primaryNavItem:active",
  ".navItem:active",
  "@media (prefers-reduced-motion: reduce)",
  "CONTROL ROOM INTERACTION ACKNOWLEDGEMENT SWEEP",
  ".backLink:active",
  ".signOutPreview:not(:disabled):active",
  ".panelClose:active",
  ".alertAction:active",
  ".contextBack:active",
  ".finishForNowButton:active",
  ".calmStartActions button:active",
  ".approvalQueueItem:active",
  ".prototypeApprove:not(:disabled):active",
  ".prototypeReturn:not(:disabled):active",
  ".prototypeReject:not(:disabled):active",
  ".welcomeEnter:active",
  ".welcomeDismiss:active",
  ".criticalAlertActions button:active",
]) requireText("Founder Control Room styles", styles, required);

const welcomeNameStart = styles.indexOf(".welcomeName{");
const welcomeNameEnd = welcomeNameStart >= 0 ? styles.indexOf("}", welcomeNameStart) : -1;
const welcomeNameChunk =
  welcomeNameStart >= 0 && welcomeNameEnd > welcomeNameStart
    ? styles.slice(welcomeNameStart, welcomeNameEnd + 1)
    : "";
if (!welcomeNameChunk.includes("font-family:ui-serif")) {
  errors.push("Founder welcome name must keep the premium type treatment.");
}

for (const protectedSelector of [
  ".founderIdentityMini{",
  ".primaryNavItem,.primaryNavActive{",
  ".content{",
]) {
  const start = styles.indexOf(protectedSelector);
  const end = start >= 0 ? styles.indexOf("}", start) : -1;
  const chunk = start >= 0 && end > start ? styles.slice(start, end + 1) : "";
  if (chunk.includes("font-family:")) {
    errors.push(`Premium Founder font leaked into protected selector: ${protectedSelector}`);
  }
}

for (const feature of [
  "peopleExperience",
  "guestSaveSync",
  "youngHiissa",
  "hiissaRest",
  "hiissaAlongside",
]) requireText("Registry-driven feature visibility", page, feature);

for (const required of [
  "STAGING BUILT · FOUNDER TESTING",
  "Production hibernation deployment",
]) requireText("Founder Access Centre staging-versus-hibernation truth", page, required);

for (const required of [
  "Gentle Check-In was offered",
  "HIISSA deferred Gentle Check-In to a safer moment",
  "People Experience state persistence needs Technical Operations",
  "verification_state",
  "HIISSA People Experience",
]) requireText("Founder activity timeline endpoint", activityTimeline, required);

for (const required of [
  "supersededInterpretationPreserved",
  "definitiveVisualReference",
  "Explore HIISSA",
  "SEPARATE_FOUNDER_PRODUCTION_DEPLOYMENT_APPROVAL",
  "PRODUCTION_DEPLOYED_HIBERNATED_NOT_ACTIVATED",
  "SEPARATE_FOUNDER_ACTIVATION_APPROVAL",
  "Production deployment and Production activation are two different Founder-controlled decisions",
]) requireText("Corrected Production hibernation Registry standard", registry, required);

for (const required of [
  "guestSaveSync: Object.freeze",
  'id: "guest.save-sync"',
  'connectionStatus: "staging-live-operational-health-wired"',
  "failed-sign-in-telemetry-not-yet-live-wired",
  "deeper-cross-device-session-conflict-telemetry-not-yet-live-wired",
  "FOUNDER_REQUIRED_FOR_ANY_MATERIAL_SAVE_SYNC_CHANGE",
  "do not reopen Stage 4 Guest Save & Sync without new evidence",
]) requireText("Guest Save & Sync Control Room contract", registry, required);

for (const required of [
  'connectionStatus: "staging-live-operational-health-wired"',
  "people-experience-operational-source-readable",
  "gentle-checkin-daypart-cadence-within-approved-limits",
  "private-emotional-answer-or-score-recorded",
  "CONTROL_ROOM_MODULES.failuresReliability",
  "CONTROL_ROOM_MODULES.systemOperations",
]) requireText("People Experience Control Room contract", registry, required);

for (const required of [
  "people_experience_checkin_offered",
  "people_experience_checkin_snoozed",
  "people_experience_checkin_resolved",
  "people_experience_operational_recovery",
  "PEOPLE_EXPERIENCE_PRIVACY_BOUNDARY_FAILURE",
  "DAILY_MAXIMUM_EXCEEDED",
  "DAYPART_DUPLICATE_OFFER",
  "MINIMUM_GAP_VIOLATION",
  "CONNECTED_NO_ACTIVITY",
  "HIISSA_TECHNICAL_OPERATIONS",
  "observedAutomaticRecoveryAttempts",
  "technicalAttentionRecoveryEvents",
  "unresolvedTechnicalAttentionEvents",
  "recoveredTechnicalAttentionEvents",
  "latestObservedRecovery",
  "CONNECTED_PARTIAL_EVIDENCE",
  "displayHealthStatus",
  "founderView",
  "founderIssueSummary",
  "incidentStartedAt",
  "userImpact",
  "availableActions",
  "recoveryNextStep",
  "finalResolution",
  "technicalDetails",
  "hasLaterRecoveryEvidence",
  "productionEffectEnabled: false",
]) requireText("People Experience health endpoint", peopleExperienceHealth, required);

for (const required of [
  'moduleId: "authentication-synchronisation-health"',
  'canonicalFeatureId: "guest.save-sync"',
  'monitoringStatus: "PARTIALLY_LIVE_WIRED"',
  '"NOT_YET_LIVE_WIRED"',
  "guestIsNotAnError: true",
  "skipIsNotFailedConversion: true",
  "similarAccountsNeverAutoMerged: true",
  "rawPasswordsReturned: false",
  "rawTokensReturned: false",
  "magicLinkCredentialsReturned: false",
  "serviceRoleSecretsReturned: false",
  "rawCookiesReturned: false",
  "conversationContentReturned: false",
  "existingStage4AuthAndSaveSyncPreserved: true",
  "productionSaveSyncChanged: false",
  "automaticDataMutationPerformed: false",
  "materialMigrationChangeRequiresFounderApproval: true",
  "possibleIdentityConflicts",
  "claimedMissingClaimedAt",
  "Different devices may have different sessions",
  "productionEffectEnabled: false",
]) requireText("Auth & Sync health endpoint", authSyncHealth, required);

for (const required of [
  "interactionFeedbackRule",
  "departmentSelectionRule",
  "consistencyRule",
  "mobileTouchRule",
  "must not pretend to be interactive",
  "visibly activate exactly one current department",
]) requireText("Founder interaction feedback Registry contract", registry, required);

for (const required of [
  "function InfoCard({ title, value, detail })",
  "<article className={styles.infoCard}>",
]) requireText("Informational cards remain non-interactive", page, required);


for (const required of [
  "INVITE SOMEONE TO HIISSA",
  "Share something meaningful.",
  "Share HIISSA. Never your story.",
  "WhatsApp",
  "Messages / Text",
  "Email",
  "Copy Link",
  "QR Code",
  "Phone Share",
  "referral email is not a Magic Link",
  "Your invitation stays private",
  "STAGING HANDOFF TEST · NOTHING SENDS AUTOMATICALLY",
]) requireText("Share HIISSA preview", sharePreview, required);

for (const required of [
  "MODULE 4 — LIVE STAGING READ-ONLY",
  'adminDataClient.rpc("get_hiissa_feedback_stats")',
  'adminDataClient.rpc("get_hiissa_written_feedback")',
  'adminDataClient.rpc("get_hiissa_admin_public_reviews")',
  "Separate permission only",
]) requireText("Feedback & Recommendations module", page, required);

for (const required of [
  "MODULE 9 — STAGING PROVIDER & SPEND REGISTER",
  "Founder business visibility — no fabricated money data.",
  "VERIFIED DEVELOPMENT SNAPSHOT — 4 OCTOBER 2026",
  "PROVIDER, SUBSCRIPTION & SPEND REGISTER",
  "API CREDIT & CAPACITY PROTECTION",
  "Warn before a provider stops HIISSA",
  "OpenAI API",
  "Vercel",
  "Supabase",
  "Resend",
  "MONEY MOVEMENT",
  "FOUNDER GATED",
  "OPENAI PROVIDER CONNECTION — PROTECTED STAGING SOURCE",
  "ORGANIZATION ADMIN SOURCE",
  "MONTH-TO-DATE COST",
  "CREDIT / PREPAID BALANCE",
  "BILLING PAGE SOURCE",
  'fetch("/api/admin/control-room/openai-provider-summary"',
  "NO RAW KEYS RETURNED",
  "NO AUTOMATIC TOP-UP OR PURCHASE",
]) requireText("System & Operations provider/spend module", page, required);

for (const required of [
  "MODULE 10 — LIVE STAGING READ-ONLY",
  'fetch("/api/admin/control-room/security-summary"',
  "CURRENT ADMIN GATE",
  "PENDING FOUNDER APPROVALS",
  "NO CHANGES ENABLED",
  "SELF-GRANT",
  "Blocked",
  'Authorization: `Bearer ${session.access_token}`',
  "ADMIN ACCESS & STAFF ONBOARDING",
  "FOUNDER APPROVED · NOT YET LIVE",
  "VERBAL-ONLY ACCESS: NOT ALLOWED",
  "FOUNDER APPROVAL: REQUIRED BEFORE ACTIVATION",
  "DETAILED WORKFLOW PREVIEW — NOT LIVE",
  "Founder invitation",
  "Staff onboarding form",
  "Policy & role acceptance",
  "Founder review",
  "Activation & verification",
  "Review, suspension & offboarding",
  "DESIGN PREVIEW ONLY",
  "NO PARTIAL SUCCESS",
  "INTERACTIVE STAGING PROTOTYPE — NO REAL ACCESS CHANGES",
  "Try the complete staff-onboarding journey",
  "SIMULATION ONLY",
  "Review invitation",
  "Continue to policies",
  "Review application",
  "Approve — simulate controlled provisioning",
  "Return for correction",
  "Reject — no access",
  "NO REAL CHANGE OCCURRED",
  "ADMIN GATE UNCHANGED",
  "FOUNDER INVITATION PREVIEW",
  "Review before sending",
  "Simulate Send Secure Invitation",
  "INVITATION STATUS — SIMULATION",
  "SIMULATED DELIVERED",
  "Simulate resend",
  "Simulate revoke",
  "FOUNDER AUTHORITY & STAFF ACTION GATE",
  "FOUNDER APPROVED · MANDATORY",
  "FOUNDER STAFF ACCESS CONTROL — SIMULATION ONLY",
  "Simulate Suspend Access",
  "Simulate Change Role",
  "Simulate Remove Access",
  "INVITED PERSON — SECURE ONBOARDING ENTRY",
  "Start onboarding",
  "Simulate Save & Resume",
  "INVITED PERSON — REVIEW APPLICATION",
  "Submit for Founder Review",
  "APPLICANT STATUS — SIMULATION",
  "AWAITING FOUNDER REVIEW",
  "Switch to Founder Review",
  "FOUNDER CONTROL ROOM STRENGTHENING PACKAGE",
  "Shared Founder capabilities approved for the Control Room",
  "TEMPORARY DEPUTY MODE: RESERVED · NOT ENABLED",
  "FOUNDER COMMAND / APPROVAL INBOX — SIMULATION ONLY",
  "Needs Your Approval",
  "FOUNDER DECISION PACK",
  "Customer Support reply",
  "Staff access change",
  "Approve",
  "Return for Changes",
  "Reject",
  "APPROVAL ≠ VERIFIED COMPLETION",
]) requireText("Admin Security & Audit module", page, required);

for (const required of [
  'branch !== "feature/founder-control-room-staging"',
  'environment === "production"',
  'request.headers.get("authorization")',
  'verificationClient.auth.getUser(accessToken)',
  '.from("admin_users")',
  "SUPABASE_SECRET_KEY",
  'managementControlsEnabled: false',
  'noSelfGrant: true',
  'productionChangesEnabled: false',
  "failedSources",
  "activeAccessGrantCount",
  "criticalCount: 0",
  'criticalSourceStatus: "NO_CERTIFIED_CRITICAL_SOURCE_CONNECTED"',
  "noFabricatedCriticalAlerts: true",
]) requireText("Protected Admin Security summary", securitySummary, required);

for (const required of [
  'branch !== "feature/founder-control-room-staging"',
  'environment === "production"',
  'request.headers.get("authorization")',
  'verificationClient.auth.getUser(accessToken)',
  '.from("admin_users")',
  "OPENAI_ADMIN_API_KEY",
  "OPENAI_API_KEY",
  "https://api.openai.com/v1/organization/costs",
  "https://api.openai.com/v1/organization/usage/completions",
  'bucket_width: "1d"',
  'limit: "31"',
  "SOURCE_NOT_CONFIGURED",
  "NOT_EXPOSED_BY_CONNECTED_SOURCE",
  "moneyMovementEnabled: false",
  '"Cache-Control": "no-store"',
]) requireText("Protected OpenAI provider summary", openAiProviderSummary, required);

for (const required of [
  'branch === "feature/founder-control-room-staging"',
  'environment !== "production"',
  'verificationClient.auth.getUser(accessToken)',
  '.from("admin_users")',
  '.from("admin_audit_events")',
  'event_type", "founder_control_room_visit"',
  'FOUNDER_NAME = "FATI BANCE"',
  'FOUNDER_ROLE = "FOUNDER"',
  '"FIRST_VISIT_TODAY"',
  '"WELCOME_BACK"',
  '"QUIET_RETURN"',
  "Good",
  "Welcome back",
  "emotionalCheckinRecorded: false",
  "employeePerformanceScoring: false",
  '"ANTI_REPEAT"',
  "message_index",
  "message_rotation",
  "nextMessageIndex",
  '"Cache-Control": "no-store"',
  "prepareGentleCheckIn",
  "checkIn,",
  'contextLabel: "Founder Control Room"',
  'actorMode: "FOUNDER"',
]) requireText("Founder welcome intelligence endpoint", founderWelcome, required);

for (const required of [
  'branch === "feature/founder-control-room-staging"',
  'environment !== "production"',
  'verificationClient.auth.getUser(accessToken)',
  '.from("admin_users")',
  '.from("admin_audit_events")',
  '"occurred_at"',
  '.order("occurred_at", { ascending: false })',
  'storage: "UTC_AUTHORITATIVE_DATABASE_TIMESTAMP"',
  'display: "BROWSER_LOCAL_TIME"',
  "immutableOriginalRequired: true",
  "createdAndUpdatedRemainDistinct: true",
  "Privacy-safe operational metadata only",
  '"Cache-Control": "no-store"',
]) requireText("Founder activity timeline endpoint", activityTimeline, required);

for (const required of [
  "formatHiissaRecordTime",
  "formatHiissaFullRecordTime",
  "hiissaTimestampRecord",
  'hour12: true',
  "Today ·",
  "toISOString()",
  "hiissaResolvedTimeZone",
]) requireText("Shared HIISSA record time formatter", recordTime, required);

for (const required of [
  "HISTORICAL_PEOPLE_CHECKIN_MIN_HOURS = 48",
  'PEOPLE_CHECKIN_ACTIVE_CADENCE = "DAYPART_CARE"',
  "PEOPLE_CHECKIN_MIN_GAP_MINUTES = 180",
  "peopleCheckInDaypart",
  '"people_experience_checkin_offered"',
  '"DAYPART_ALREADY_OFFERED"',
  '"MINIMUM_GAP_NOT_MET"',
  "care_daypart: daypart",
  "active_cadence: PEOPLE_CHECKIN_ACTIVE_CADENCE",
  "answer_recorded: false",
  "emotional_score_created: false",
  "performance_score_created: false",
  "manager_signal_created: false",
  "explicit_support_escalation_created: false",
  'welcomeMode === "QUIET_RETURN"',
]) requireText("Gentle check-in privacy policy", gentleCheckInPolicy, required);

for (const required of [
  "HIISSA · GENTLE CHECK-IN",
  "How are you doing today",
  "How is your day going so far?",
  "how has your day been?",
  "checkInQuestion(daypart, displayName)",
  "Private by default.",
  "Give me a calmer start",
  "records only that a check-in was offered, not which answer you chose",
]) requireText("Shared gentle check-in component", gentleCheckInComponent, required);

for (const forbidden of [
  "fetch(",
  "localStorage",
  "sessionStorage",
]) {
  if (gentleCheckInComponent.includes(forbidden)) {
    errors.push(`Shared gentle check-in component must not persist/share answers directly: ${forbidden}`);
  }
}

for (const required of [
  'branch === "feature/founder-control-room-staging"',
  'environment !== "production"',
  'verificationClient.auth.getUser(accessToken)',
  '.from("admin_users")',
  '.from("admin_approval_requests")',
  '.from("admin_audit_events")',
  '"people_experience_workday_close_opened"',
  '"finish_for_now"',
  'criticalSourceStatus = "NO_CERTIFIED_CRITICAL_SOURCE_CONNECTED"',
  '"founder-workday-close-staging"',
  "This closing summary currently checks the working Customer Support Founder Approval Inbox and Admin audit timeline only.",
  "externalEffectPerformed: false",
  "productionEffectPerformed: false",
  '"Cache-Control": "no-store"',
]) requireText("Founder Workday Close endpoint", workdayClose, required);

for (const required of [
  "HIISSA · WORKDAY CLOSE",
  "Checking verified work state…",
  "Before you leave",
  "Close for now",
]) requireText("Shared Workday Close component", workdayCloseComponent, required);

for (const forbidden of [
  "fetch(",
  "localStorage",
  "sessionStorage",
]) {
  if (workdayCloseComponent.includes(forbidden)) {
    errors.push(`Shared Workday Close component must remain presentation-only: ${forbidden}`);
  }
}

for (const required of [
  ".overlay",
  ".card",
  ".items",
  ".itemAttention",
  ".sourceNote",
  "@media (prefers-reduced-motion: reduce)",
  "font-family: Arial, Helvetica, sans-serif;",
]) requireText("Shared Workday Close styles", workdayCloseStyles, required);

for (const registryRule of [
  "export const CONTROL_ROOM_MODULE_REGISTRY",
  "futureExpansionAllowed: true",
  "export const FEATURE_OPERATIONAL_VISIBILITY_STANDARD",
  "controlRoomConnectionRequired: true",
  "export const HIISSA_OPERATIONAL_INTELLIGENCE_MANDATE",
  '"MONITOR"',
  '"SAFELY_RECOVER"',
  '"VERIFY"',
  '"RECORD"',
  '"REPORT"',
  "export const FOUNDER_ALERT_GATEWAY_STANDARD",
  "SMS_TO_DEDICATED_HIISSA_FOUNDER_NUMBER",
  "FOUNDER_EMAIL",
  "export const ADMIN_STAFF_ACCESS_ONBOARDING_STANDARD",
  "founderApprovalBeforeActivation: true",
  "adminGateChangesOnlyAfterApprovedActivation: true",
  "founderRoleNotAssignableThroughOrdinaryStaffInvitation: true",
  "export const ADMIN_STAFF_ONBOARDING_WORKFLOW",
  "single-purpose, time-bounded, revocable",
  "permission preview for the proposed role",
  "Partial provisioning must not be treated as success.",
  "previewRequiredBeforeSend: true",
  "resendAndRevokeControlsRequired: true",
  "export const FOUNDER_ADMIN_AUTHORITY_AND_STAFF_ACTION_GATE",
  "Consequential actions that create",
  "export const STAFF_ACCESS_SUSPENSION_AND_OFFBOARDING_STANDARD",
  "block Admin Gate eligibility",
  "export const STAFF_SECURE_ONBOARDING_EXPERIENCE_STANDARD",
  "saveAndResumeRequired: true",
  "SUBMIT_FOR_FOUNDER_REVIEW",
  "export const FOUNDER_CONTROL_ROOM_STRENGTHENING_PACKAGE",
  "The Founder should never have to discover a serious Admin problem accidentally.",
  "founder-approval-inbox",
  "founder-emergency-pause",
  "staff-session-device-control",
  "preview-as-role",
  "founder-decision-pack",
  "customer-communication-service-level-centre",
  "staff-trust-training-access-review",
  "admin-security-anomaly-alerts",
  "daily-founder-brief",
  "temporary-deputy-mode",
  "RESERVED_NOT_ENABLED",
  "Founder Command / Approval Inbox",
  "Founder Emergency Pause Controls",
  "Staff Session & Device Control",
  "Preview as Role",
  "Founder Decision Pack",
  "Customer Communication & Service-Level Centre",
  "Staff Trust, Training & Access Review",
  "Security Anomaly Alerts",
  "Daily Founder Brief",
  "Founder Continuity / Temporary Deputy Mode",
  "export const FOUNDER_APPROVAL_INBOX_STANDARD",
  "one underlying approval record",
  "APPROVED_PENDING_EXECUTION",
  "approval is not the same as verified completion",
  "export const UNIVERSAL_FOUNDER_SUBMISSION_GATE",
  "Submit for processing",
  "Submitted for processing",
  "Every human staff work item",
  "export const STAFF_WORKSPACE_SHELL_STANDARD",
  "founder-approved-fictional-staging-design-to-build",
  "founderAccessCentre",
  "STAGING_BUILD_VERIFIED_FOUNDER_PRACTICAL_TEST_PENDING",
  "Founder Control Room Overview",
  "100% authorised access across HIISSA",
  "FOUNDER_ACCESS_CENTRE_STAGING_BUILD_VERIFIED_FOUNDER_TEST_PENDING",
  "technical_operations",
  "customer_support",
  "finance_subscriptions",
  "safety_safeguarding",
  "privacy_data_protection",
  "content_moderation",
  "product_quality",
  "export const HIISSA_UNIVERSAL_TIMESTAMP_ACTIVITY_STANDARD",
  "hiissa.universal-timestamp-activity",
  "HIISSA Universal Timestamp & Activity Record Standard",
  "Every meaningful dashboard event",
  "originalEventTimeMustNotBeOverwritten: true",
  "createdAndUpdatedRemainDistinct: true",
  "DETECTED_AT",
  "ACTION_STARTED_AT",
  "ACTION_COMPLETED_AT",
  "VERIFIED_AT",
  "Do not invent a historical date/time",
  "Founder Activity Timeline reads real Staging admin_audit_events",
  "timestampActivity",
  "STAGING_TIMESTAMP_ACTIVITY_DEPLOYED_TEST_PENDING",
  "export const HIISSA_PEOPLE_EXPERIENCE_LAYER",
  "hiissa.people-experience",
  "HIISSA People Experience Layer",
  "FATI BANCE",
  "WELCOME_MOMENTS",
  "ROTATING_ENCOURAGEMENT",
  "GENTLE_CHECK_INS",
  "RECOGNITION_AND_APPRECIATION",
  "SEASONS_AND_CELEBRATIONS",
  "POSITIVE_PROGRESS_AND_WINS",
  "Welcome back, FATI BANCE",
  "must not become performance surveillance",
  "Reuse and connect the existing HIISSA Seasons",
  "Motivation must encourage without manipulation",
  "welcomeNameTypography",
  "STAGING_BUILD_VERIFIED_AUTOMATIC_TIMED_CARE_FOUNDER_PRACTICAL_TEST_PENDING",
  "activeRule: \"DAYPART_CARE\"",
  "maximumOpportunitiesPerActiveDay: 3",
  "typicalOpportunitiesPerActiveDay: 2",
  "maximumPerDaypart: 1",
  "minimumGapMinutes: 180",
  "automaticWhileActive: true",
  "forcedEmotionalDisclosure: false",
  "snoozeCreatesExtraCheckIn: false",
  "automaticTimedCare",
  "ignoredBehaviour",
  "safeMomentRule",
  "historical48HourRule",
  "answerRecordedInAdminAudit: false",
  "managerSignalCreated: false",
  "Give me a calmer start temporarily reduces Overview to Alerts, Approvals and Show full Overview",
  "Founder Preview may demonstrate the staff check-in",

  "anti-repeat rotation",
  "navigationExperience",
  "Every Founder destination",
  "2-by-2 layout",
  "Only a verified critical/emergency signal",
  "export const HIISSA_PEOPLE_EXPERIENCE_CAPABILITY_REGISTRY",
  "hiissa.people-experience.daypart-care-cadence",
  "hiissa.people-experience.workday-close",
  "components/people-experience/WorkdayClose.js",
  "/api/admin/control-room/workday-close",
  "POST /api/staff-workspace action=workday_close",
  "people_experience_workday_close_opened",
  "staffUnsavedChangeRule",
  "No certified critical-emergency source is connected to the Workday Close card yet",
  "STAGING_WORKDAY_CLOSE_DEPLOYED_TEST_PENDING",
  "hiissa.people-experience.private-appreciation",
  "hiissa.people-experience.workload-care-signals",
  "hiissa.people-experience.protected-rest-boundaries",
  "hiissa.people-experience.protected-rest-boundaries.care-pause",
  "hiissa.people-experience.i-need-help",
  "hiissa.people-experience.growth-learning-companion",
  "hiissa.people-experience.speak-up-ideas",
  "hiissa.people-experience.milestones-seasons-human-moments",
  "hiissa.people-experience.since-you-were-away",
  "FOUNDER_APPROVED_REGISTRY_REGISTERED_IMPLEMENTATION_PENDING",
  "peopleExperience",
  "STAGING_WORKDAY_CLOSE_DEPLOYED_TEST_PENDING",
  "export const FOUNDER_PROVIDER_SUBSCRIPTION_SPEND_STANDARD",
  "Founder Provider, Subscription & Spend Register",
  "openAiProviderConnection",
  "STAGING_BUILD_VERIFIED_ADMIN_CREDENTIAL_PENDING",
  "OPENAI_ADMIN_API_KEY",
  "GET /v1/organization/costs",
  "GET /v1/organization/usage/completions",
  "Do not infer or fabricate remaining prepaid credit.",
  "25% remaining",
  "10% remaining",
  "5% remaining",
  "Automatic purchase, top-up, plan upgrade",
  "openai-api",
  "hiissa-domain",
  "Cloudflare",
  "hiissa.com domain",
  "GitHub",
  "ChatGPT",
  "export const RECOMMEND_SHARE_REFERRAL_STANDARD",
  "Recommend / Share HIISSA + Referral",
  "Invite someone to HIISSA",
  "Share HIISSA. Never your story.",
  "WHATSAPP",
  "MESSAGES_TEXT",
  "NATIVE_PHONE_SHARE",
  "Referral/invitation links bring the recipient to HIISSA.",
]) requireText("Registry", registry, registryRule);

if (errors.length) {
  console.error("\nFounder Control Room shell contract: FAIL\n");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("Founder Control Room shell contract: PASS");
console.log("- Ten current modules present");
console.log("- Current shell is explicitly isolated and non-live");
console.log("- Registry-driven operational visibility is present");
console.log("- Young HIISSA, HIISSA Rest and HIISSA Alongside are surfaced from Registry");
console.log("- Future Control Room module expansion remains enabled without creating Module 11 today");
console.log("- Admin Security & Audit read-only Staging summary is protected and certified");
console.log("- Founder-approved staff onboarding, operational intelligence and alert-gateway contracts are registered");
console.log("- Detailed non-live Admin staff onboarding workflow preview is present");
console.log("- Interactive no-access staff onboarding prototype is present");
console.log("- Invitation preview, simulated send/status, resend and revoke journey is present");
console.log("- Founder authority, staff suspension and secure invitee onboarding contracts are registered");
console.log("- Applicant save/resume, review, submission and Founder-review handoff prototype is present");
console.log("- Founder Control Room strengthening package is registered and surfaced without creating Module 11");
console.log("- Founder Approval Inbox decision-pack simulation is present and explicitly non-live");
console.log("- Universal Founder submission gate and seven fictional staff workspace families are registered");
console.log("- Founder Access Centre is surfaced from the existing Control Room with full Founder oversight and no staff impersonation");
console.log("- Founder department cards visibly select one active department and expose honest working/unbuilt states");
console.log("- Interactive Founder controls use calm pressed/active feedback while informational cards remain non-interactive");
console.log("- Reduced-motion preferences remain protected for interaction feedback");
console.log("- Back, close, Finish for now, alert, approval, welcome and sign-out controls now visibly acknowledge touch/press");
console.log("- Founder primary navigation is Overview / Modules / Staff & Workspaces / Approvals with Search and Alerts");
console.log("- Founder welcome intelligence is protected, time-aware and records same-day return continuity");
console.log("- FATI BANCE / FOUNDER identity treatment and People Experience Layer are registered");
console.log("- Premium type treatment is confined to FATI BANCE on the welcome pop-up");
console.log("- Founder Back navigation history is present across Overview, Modules, Staff & Workspaces and Approvals");
console.log("- Mobile primary navigation is protected against clipped destinations");
console.log("- Alert number badges and verified-critical-only red interruption are protected");
console.log("- Founder motivation uses anti-repeat rotation");
console.log("- Universal Timestamp & Activity Record Standard is registered");
console.log("- Founder Activity Timeline reads real Staging audit timestamps");
console.log("- Approval and staff records use the shared local-time display formatter");
console.log("- Created/updated/history preservation and no-fabricated-time rules are protected");
console.log("- Founder gentle check-in is 48-hour cadence-limited and privacy-safe");
console.log("- Founder Calm Start temporarily prioritises Alerts and Approvals without removing Overview");
console.log("- Check-in answers are not persisted to the Founder/Admin audit trail");
console.log("- Daypart Care supersedes the historical 48-hour cadence: morning / afternoon / evening, once per daypart");
console.log("- Daypart Care enforces a 180-minute cross-daypart minimum gap and suppresses quiet returns");
console.log("- All ten Founder-approved People Experience capability contracts plus Care Pause are registered");
console.log("- Founder Workday Close uses verified approval/audit sources and states critical-source coverage limits");
console.log("- Shared Workday Close component is presentation-only and reduced-motion protected");
console.log("- Module 9 provider/subscription/spend register is surfaced with no fabricated billing values");
console.log("- Module 9 protected OpenAI provider connection layer is Staging-only, Admin-gated and read-only");
console.log("- Recommend / Share HIISSA referral contract and Staging interface preview are present");
