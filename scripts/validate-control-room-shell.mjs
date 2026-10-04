import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const pagePath = path.join(root, "app", "admin", "control-room-preview", "page.js");
const registryPath = path.join(root, "lib", "experience-registry.js");
const securitySummaryPath = path.join(
  root,
  "app",
  "api",
  "admin",
  "control-room",
  "security-summary",
  "route.js"
);

const errors = [];

function requireText(label, source, text) {
  if (!source.includes(text)) errors.push(`${label}: missing ${text}`);
}

if (!fs.existsSync(pagePath)) errors.push("Founder Control Room preview page is missing.");
if (!fs.existsSync(securitySummaryPath)) errors.push("Protected Admin Security summary endpoint is missing.");

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

const page = fs.existsSync(pagePath) ? fs.readFileSync(pagePath, "utf8") : "";
const registry = fs.existsSync(registryPath) ? fs.readFileSync(registryPath, "utf8") : "";
const securitySummary = fs.existsSync(securitySummaryPath)
  ? fs.readFileSync(securitySummaryPath, "utf8")
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
  "MODULE 4 — LIVE STAGING READ-ONLY",
  'adminDataClient.rpc("get_hiissa_feedback_stats")',
  'adminDataClient.rpc("get_hiissa_written_feedback")',
  'adminDataClient.rpc("get_hiissa_admin_public_reviews")',
  "Separate permission only",
]) requireText("Feedback & Recommendations module", page, required);

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
  "SUBMIT_FOR_FOUNDER_REVIEW",
  "APPLICANT STATUS — SIMULATION",
  "AWAITING FOUNDER REVIEW",
  "Switch to Founder Review",
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
  "Submit for Founder Review",
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
