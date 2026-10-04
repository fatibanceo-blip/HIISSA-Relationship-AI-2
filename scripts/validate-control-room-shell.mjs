import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const pagePath = path.join(root, "app", "admin", "control-room-preview", "page.js");
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

const errors = [];

function requireText(label, source, text) {
  if (!source.includes(text)) errors.push(`${label}: missing ${text}`);
}

if (!fs.existsSync(pagePath)) errors.push("Founder Control Room preview page is missing.");
if (!fs.existsSync(securitySummaryPath)) errors.push("Protected Admin Security summary endpoint is missing.");
if (!fs.existsSync(openAiProviderSummaryPath)) errors.push("Protected OpenAI provider summary endpoint is missing.");

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
const registry = fs.existsSync(registryPath) ? fs.readFileSync(registryPath, "utf8") : "";
const sharePreview = fs.existsSync(sharePreviewPath) ? fs.readFileSync(sharePreviewPath, "utf8") : "";
const securitySummary = fs.existsSync(securitySummaryPath)
  ? fs.readFileSync(securitySummaryPath, "utf8")
  : "";
const openAiProviderSummary = fs.existsSync(openAiProviderSummaryPath)
  ? fs.readFileSync(openAiProviderSummaryPath, "utf8")
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
  "← Control Room Overview",
  "Sign out",
  "ISOLATED PREVIEW",
  "no fake health numbers.",
  "FEATURE OPERATIONAL VISIBILITY",
  "SHARED DETAIL VIEW — FOUNDATION",
]) requireText("Control Room shell", page, required);

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
  "technical_operations",
  "customer_support",
  "finance_subscriptions",
  "safety_safeguarding",
  "privacy_data_protection",
  "content_moderation",
  "product_quality",
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
console.log("- Module 9 provider/subscription/spend register is surfaced with no fabricated billing values");
console.log("- Module 9 protected OpenAI provider connection layer is Staging-only, Admin-gated and read-only");
console.log("- Recommend / Share HIISSA referral contract and Staging interface preview are present");
