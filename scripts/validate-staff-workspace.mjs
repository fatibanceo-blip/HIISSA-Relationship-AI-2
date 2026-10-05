import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const routePath = path.join(root, "app", "staff-workspace-preview", "page.js");
const clientPath = path.join(
  root,
  "app",
  "staff-workspace-preview",
  "StaffWorkspacePreview.js"
);
const cssPath = path.join(
  root,
  "app",
  "staff-workspace-preview",
  "page.module.css"
);
const staffApiPath = path.join(root, "app", "api", "staff-workspace", "route.js");
const founderApiPath = path.join(
  root,
  "app",
  "api",
  "admin",
  "control-room",
  "staff-approval-inbox",
  "route.js"
);
const registryPath = path.join(root, "lib", "experience-registry.js");
const controlRoomPath = path.join(
  root,
  "app",
  "admin",
  "control-room-preview",
  "page.js"
);

const errors = [];

function read(file) {
  return fs.existsSync(file) ? fs.readFileSync(file, "utf8") : "";
}

function requireFile(label, file) {
  if (!fs.existsSync(file)) errors.push(`${label}: file is missing`);
}

function requireText(label, source, text) {
  if (!source.includes(text)) errors.push(`${label}: missing ${text}`);
}

function forbidText(label, source, text) {
  if (source.includes(text)) errors.push(`${label}: forbidden ${text}`);
}

for (const [label, file] of [
  ["Staff workspace route", routePath],
  ["Staff workspace client", clientPath],
  ["Staff workspace styles", cssPath],
  ["Staff workspace API", staffApiPath],
  ["Founder staff approval API", founderApiPath],
  ["Experience Registry", registryPath],
  ["Founder Control Room", controlRoomPath],
]) requireFile(label, file);

const route = read(routePath);
const client = read(clientPath);
const staffApi = read(staffApiPath);
const founderApi = read(founderApiPath);
const registry = read(registryPath);
const controlRoom = read(controlRoomPath);

for (const required of [
  'branch !== "feature/founder-control-room-staging"',
  'environment === "production"',
  "notFound()",
  "<StaffWorkspacePreview />",
]) requireText("Staff workspace protected route", route, required);

for (const required of [
  "HIISSA STAFF WORKSPACE",
  "Customer Support",
  "STAGING · WORKING TEST",
  "actor?.displayIdentity",
  "Assigned Work",
  "Work in Progress",
  "Saved Drafts",
  "Submitted for Processing",
  "Returned Work",
  "Completed Outcomes",
  "Notifications",
  "Secure sign out",
  'fetch("/api/staff-workspace"',
  "Draft saved in the Staging database.",
  "One canonical approval request now exists",
  "UNIVERSAL_FOUNDER_SUBMISSION_GATE.staffSubmitLabel",
  "UNIVERSAL_FOUNDER_SUBMISSION_GATE.staffSubmittedConfirmation",
  "UNIVERSAL_FOUNDER_SUBMISSION_GATE.founderRoute",
  "External execution is still disabled.",
  "Approval is not verified completion",
  "Production effect: None",
  "Verify · Record · Report",
]) requireText("Working Customer Support workspace", client, required);

for (const forbidden of [
  "mailto:",
  "sms:",
  "wa.me",
  "navigator.share(",
  "window.open(",
  "https://api.",
]) forbidText("Working Customer Support workspace", client, forbidden);

for (const required of [
  'branch === "feature/founder-control-room-staging"',
  'environment !== "production"',
  'verificationClient.auth.getUser(accessToken)',
  '.from("admin_users")',
  '.from("admin_role_assignments")',
  '.from("admin_permission_rules")',
  'role_id", ROLE_ID',
  'action_id", actionId',
  'mode: "FOUNDER_PREVIEW"',
  'mode: "STAFF"',
  '.from("staff_work_items")',
  'rpc("hiissa_staff_save_work_item"',
  'rpc("hiissa_staff_submit_for_processing"',
  "CUSTOMER_SUPPORT_ROLE_REQUIRED",
  "STAFF_ACTION_NOT_AUTHORISED",
  "externalEffectPerformed: false",
  "productionEffectPerformed: false",
  '"Cache-Control": "no-store"',
]) requireText("Protected staff workspace API", staffApi, required);

for (const forbidden of [
  "mailto:",
  "sms:",
  "wa.me",
  "navigator.share",
  "OPENAI_API_KEY",
]) forbidText("Protected staff workspace API", staffApi, forbidden);

for (const required of [
  'branch === "feature/founder-control-room-staging"',
  'environment !== "production"',
  'verificationClient.auth.getUser(accessToken)',
  '.from("admin_users")',
  '.from("admin_approval_requests")',
  '.from("staff_work_items")',
  'rpc(',
  '"hiissa_founder_resolve_staff_work"',
  '"approve"',
  '"return_for_changes"',
  '"reject"',
  "approvalIsVerifiedCompletion: false",
  "externalExecutionEnabled: false",
  "productionEffectEnabled: false",
  '"Cache-Control": "no-store"',
]) requireText("Protected Founder staff approval API", founderApi, required);

for (const required of [
  "export const STAFF_WORKSPACE_SHELL_STANDARD",
  'status: "founder-approved-fictional-staging-persistent-workflow-implementation-in-progress"',
  "customerSupportPrototype",
  'status: "PERSISTENT_STAGING_WORKFLOW_IMPLEMENTED_BUILD_PENDING"',
  'route: "/staff-workspace-preview"',
  'workspaceId: "customer_support"',
  "persistentWorkflow",
  "20261005054230_working_customer_support_founder_gate_staging",
  "public.staff_work_items",
  "public.admin_approval_requests",
  "public.admin_approval_decisions",
  "public.admin_audit_events",
  'staffApi: "/api/staff-workspace"',
  'founderApi: "/api/admin/control-room/staff-approval-inbox"',
  "FOUNDER_PREVIEW",
  "APPROVE_PENDING_EXECUTION",
  "Submit for processing",
  "Submitted for processing",
  "Founder Command / Approval Inbox",
  "NONE_IN_CURRENT_WORKING_STAGING_LAYER",
  'productionEffect: "NONE"',
  "zero leftover verification rows",
  "export const UNIVERSAL_FOUNDER_SUBMISSION_GATE",
]) requireText("Persistent staff workspace Registry contract", registry, required);

for (const required of [
  "<WorkingStaffApprovalInbox />",
  "FOUNDER COMMAND / APPROVAL INBOX — WORKING STAGING QUEUE",
  'fetch("/api/admin/control-room/staff-approval-inbox"',
  'href="/staff-workspace-preview"',
  "Approve",
  "Return for Changes",
  "Reject",
  "ONE CANONICAL APPROVAL RECORD",
  "EXTERNAL EXECUTION DISABLED",
  "Historical local-only approval examples remain below",
]) requireText("Working Founder Inbox connection", controlRoom, required);

if (errors.length) {
  console.error("\nHIISSA working Customer Support / Founder gate contract: FAIL\n");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("HIISSA working Customer Support / Founder gate contract: PASS");
console.log("- Staging-only staff route remains protected");
console.log("- Staff and Founder Preview as Role modes are separated");
console.log("- Real staff requires active Customer Support role + permission");
console.log("- Draft/start/submit actions use protected same-origin APIs");
console.log("- Submit for processing creates/reuses one canonical Founder approval record");
console.log("- Founder Approve / Return / Reject uses the working persistent Staging API");
console.log("- Approval remains distinct from verified completion");
console.log("- External customer execution and Production effects remain disabled");
console.log("- Historical prototype evidence remains preserved separately");
