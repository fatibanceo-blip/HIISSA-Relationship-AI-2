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

requireFile("Staff workspace route", routePath);
requireFile("Staff workspace client", clientPath);
requireFile("Staff workspace styles", cssPath);
requireFile("Experience Registry", registryPath);
requireFile("Founder Control Room", controlRoomPath);

const route = read(routePath);
const client = read(clientPath);
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
  "STAGING · FICTIONAL ONLY",
  "Sample Customer Support Worker",
  "Customer Support workspace only",
  "Assigned Work",
  "Work in Progress",
  "Saved Drafts",
  "Submitted for Processing",
  "Returned Work",
  "Completed Outcomes",
  "Notifications",
  "Secure sign out",
  "No real customer action can happen here.",
  "UNIVERSAL_FOUNDER_SUBMISSION_GATE.staffSubmitLabel",
  "UNIVERSAL_FOUNDER_SUBMISSION_GATE.staffSubmittedConfirmation",
  "UNIVERSAL_FOUNDER_SUBMISSION_GATE.founderRoute",
  "cannot approve their own submission.",
  "Nothing has been sent to a customer.",
  "Approve, Return for Changes or Reject",
  "Architecture/behaviour approved · visual treatment requires Founder",
  "External send: Not performed",
  "Production effect: None",
  "Verify · Record · Report",
]) requireText("Fictional Customer Support workspace", client, required);

for (const forbidden of [
  "fetch(",
  "mailto:",
  "sms:",
  "wa.me",
  "window.open(",
  "navigator.share(",
  "prototypeApprove",
  'decide("APPROVED',
]) forbidText("Fictional Customer Support workspace", client, forbidden);

for (const required of [
  "export const STAFF_WORKSPACE_SHELL_STANDARD",
  'status: "founder-approved-fictional-staging-design-to-build"',
  "customerSupportPrototype",
  'status: "IMPLEMENTED_ISOLATED_BUILD_PENDING"',
  'route: "/staff-workspace-preview"',
  'workspaceId: "customer_support"',
  "Submit for processing",
  "Submitted for processing",
  "Founder Command / Approval Inbox",
  "NONE_IN_CURRENT_PROTOTYPE",
  'productionEffect: "NONE"',
  "one underlying approval record",
  "visual treatment only",
  "export const UNIVERSAL_FOUNDER_SUBMISSION_GATE",
]) requireText("Staff workspace Registry contract", registry, required);

for (const required of [
  'href="/staff-workspace-preview"',
  "Open fictional Customer Support workspace",
  "FOUNDER COMMAND / APPROVAL INBOX — SIMULATION ONLY",
]) requireText("Founder Inbox workspace connection", controlRoom, required);

if (errors.length) {
  console.error("\nHIISSA fictional Customer Support workspace contract: FAIL\n");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("HIISSA fictional Customer Support workspace contract: PASS");
console.log("- Protected Staging-only staff route is present");
console.log("- Customer Support is the first detailed fictional staff workspace");
console.log("- Shared shell lifecycle is present");
console.log("- Exact Submit for processing / Submitted for processing wording is preserved");
console.log("- Staff submission routes conceptually to the existing Founder Command / Approval Inbox");
console.log("- Staff-side Founder approval controls are absent");
console.log("- No fetch, external send, native share or Production action is enabled");
console.log("- One-source-of-truth Founder approval boundary is registered");
console.log("- Visual treatment remains Founder-preview pending");
