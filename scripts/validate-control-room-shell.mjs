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

const errors = [];

function requireText(label, source, text) {
  if (!source.includes(text)) errors.push(`${label}: missing ${text}`);
}

if (!fs.existsSync(pagePath)) errors.push("Founder Control Room preview page is missing.");
if (!fs.existsSync(stylePath)) errors.push("Founder Control Room stylesheet is missing.");
if (!fs.existsSync(securitySummaryPath)) errors.push("Protected Admin Security summary endpoint is missing.");
if (!fs.existsSync(openAiProviderSummaryPath)) errors.push("Protected OpenAI provider summary endpoint is missing.");
if (!fs.existsSync(founderWelcomePath)) errors.push("Protected Founder welcome intelligence endpoint is missing.");

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
  "SHARED DETAIL VIEW — FOUNDATION",
  "FOUNDER ACCESS CENTRE",
  "Departments & staff workspaces",
  "FOUNDER 100% OVERSIGHT",
  "Open in Founder Preview",
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
]) requireText("Control Room shell", page, required);

for (const required of [
  ".welcomeName{",
  'font-family:ui-serif,Georgia,Cambria,"Times New Roman",serif;',
  ".alertBadgeAttention",
  ".alertBadgeCritical",
  ".criticalAlertToast",
  ".contextBack",
  "grid-template-columns:repeat(2,minmax(0,1fr));",
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
  "youngHiissa",
  "hiissaRest",
  "hiissaAlongside",
]) requireText("Registry-driven feature visibility", page, feature);


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
]) requireText("Founder welcome intelligence endpoint", founderWelcome, required);

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
  "anti-repeat rotation",
  "navigationExperience",
  "Every Founder destination",
  "2-by-2 layout",
  "Only a verified critical/emergency signal",
  "peopleExperience",
  "STAGING_FOUNDER_WELCOME_DEPLOYED_TEST_PENDING",
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
console.log("- Founder primary navigation is Overview / Modules / Staff & Workspaces / Approvals with Search and Alerts");
console.log("- Founder welcome intelligence is protected, time-aware and records same-day return continuity");
console.log("- FATI BANCE / FOUNDER identity treatment and People Experience Layer are registered");
console.log("- Premium type treatment is confined to FATI BANCE on the welcome pop-up");
console.log("- Founder Back navigation history is present across Overview, Modules, Staff & Workspaces and Approvals");
console.log("- Mobile primary navigation is protected against clipped destinations");
console.log("- Alert number badges and verified-critical-only red interruption are protected");
console.log("- Founder motivation uses anti-repeat rotation");
console.log("- Module 9 provider/subscription/spend register is surfaced with no fabricated billing values");
console.log("- Module 9 protected OpenAI provider connection layer is Staging-only, Admin-gated and read-only");
console.log("- Recommend / Share HIISSA referral contract and Staging interface preview are present");
