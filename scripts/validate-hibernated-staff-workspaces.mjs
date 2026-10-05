import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const files = {
  registry: path.join(root, "lib", "experience-registry.js"),
  catalog: path.join(root, "lib", "hibernated-staff-workspaces.js"),
  component: path.join(root, "components", "staff-workspace", "HibernatedStaffWorkspace.js"),
  styles: path.join(root, "components", "staff-workspace", "HibernatedStaffWorkspace.module.css"),
  page: path.join(root, "app", "staff-workspace-preview", "page.js"),
  wrapper: path.join(root, "app", "staff-workspace-preview", "StaffWorkspacePreview.js"),
  controlRoom: path.join(root, "app", "admin", "control-room-preview", "page.js"),
  calmerStartMode: path.join(root, "components", "people-experience", "CalmerStartMode.js"),
  calmerStartStyles: path.join(root, "components", "people-experience", "CalmerStartMode.module.css"),
};

function read(file) {
  if (!fs.existsSync(file)) {
    throw new Error(`Missing required hibernated workspace file: ${file}`);
  }
  return fs.readFileSync(file, "utf8");
}

function requireText(label, content, required) {
  if (!content.includes(required)) {
    throw new Error(`${label} is missing required contract text: ${required}`);
  }
}

function forbidText(label, content, forbidden) {
  if (content.includes(forbidden)) {
    throw new Error(`${label} contains forbidden behaviour: ${forbidden}`);
  }
}

const registry = read(files.registry);
const catalog = read(files.catalog);
const component = read(files.component);
const styles = read(files.styles);
const page = read(files.page);
const wrapper = read(files.wrapper);
const controlRoom = read(files.controlRoom);
const calmerStartMode = read(files.calmerStartMode);
const calmerStartStyles = read(files.calmerStartStyles);

const ids = [
  "technical_operations",
  "finance_subscriptions",
  "safety_safeguarding",
  "privacy_data_protection",
  "content_moderation",
  "product_quality",
];

for (const id of ids) {
  requireText("Hibernated staff workspace catalog", catalog, `${id}: Object.freeze({`);
  requireText("Founder Access Centre hibernated routes", controlRoom, `workspace=${id}&founderReturn=staff`);
}

for (const required of [
  "HIISSA_BUILD_COMPLETE_THEN_HIBERNATE_STANDARD",
  "FOUNDER_APPROVED_PERMANENT_MANDATORY_HIISSA_WIDE_STANDARD",
  "Not activated must never be used as a reason to leave an approved interface half-built",
  "STAGING_VERIFIED_READY_FOR_PRODUCTION_HIBERNATION_DECISION",
  "PRODUCTION_DEPLOYED_HIBERNATED_NOT_ACTIVATED",
  "definitiveVisualReference",
  "Explore HIISSA",
  "Production deployment and Production activation are two different Founder-controlled decisions",
  "approvedHibernateBuildQueue",
  "mandatory build targets, not indefinite placeholders",
  "calmerStartMode: Object.freeze({",
  "FOUNDER_APPROVED_IMPLEMENTED_ON_STAGING_BRANCH_BUILD_PENDING",
  "continueWithThisTask",
  "viewAllWorkspaceAreas",
  "returnToNormalWorkspace",
  "Production hibernation requires a later separate Founder deployment approval.",
  "automaticTimedCare",
  "maximumOpportunitiesPerActiveDay: 3",
  "automaticWhileActive: true",
  "snoozeCreatesExtraCheckIn: false",
  "ignoredBehaviour",
  "safeMomentRule",
]) requireText("Build-complete then hibernate Registry contract", registry, required);

for (const required of [
  "Technical Operations provides technical oversight",
  "Finance manages HIISSA's commercial relationship",
  "Safety & Safeguarding provides qualified human judgement",
  "Privacy authority is responsibility",
  "HIISSA moderates governed content and behaviour",
  "Product & Quality determines whether HIISSA genuinely helps people",
  "Payment ≠ Subscription ≠ Entitlement ≠ Identity",
  "SENT, RECEIVED, ACCEPTED and ACTIONED",
  "No unqualified DELETE EVERYTHING control",
  "AI confidence is not proof",
  "Metrics measure human purpose",
]) requireText("Role-specific hibernated workspace catalog", catalog, required);

for (const required of [
  "is_hiissa_admin",
  "FOUNDER PREVIEW ONLY",
  "STAGING · BUILT",
  "Assigned Work",
  "Work in Progress",
  "Saved Drafts",
  "Submitted for Processing",
  "Returned Work",
  "Completed Outcomes",
  "Notifications",
  "Start work",
  "Save draft",
  "Submit for processing",
  "Founder Preview scenario controls",
  "Preview returned outcome",
  "Preview verified completed outcome",
  "Replay gentle check-in preview",
  "AutomaticGentleCheckIn",
  "CalmerStartMode",
  "calmStartExpanded",
  'taskTitle={workspace.fictionalTask.title}',
  'taskDetail={workspace.fictionalTask.summary}',
  'taskStatus={statusLabel(status)}',
  "onContinueTask",
  "onShowAll",
  "onExit",
  'enabled={authState === "ready"}',
  "manualRequestKey={checkInManualKey}",
  "pause={workdayCloseOpen}",
  "Finish for now",
  "PrivateAppreciation",
  "No real-world effect",
  "STAGING BUILT · PRODUCTION NOT DEPLOYED",
  "STAGING · BUILT",
  "Staging built · Founder testing",
  "Production hibernation is a later, separately approved deployment state.",
  "This is not yet a hibernated Production feature.",
  "PRODUCTION hibernation",
  "browser session only",
]) requireText("Staging Staff Workspace engine", component, required);

for (const required of [
  "HIISSA · CALMER START",
  "Calmer Start is on.",
  "reduce non-urgent visual pressure",
  "Your responsibilities, priority and performance records have not changed.",
  "YOUR NEXT STEP",
  "Continue with this task",
  "View all workspace areas",
  "Return to normal workspace",
  "Other work is still safe and available when you’re ready.",
  "changes presentation only",
  "does not remove work, lower priority or",
  "create a manager signal",
]) requireText("Shared Calmer Start mode", calmerStartMode, required);

for (const required of [
  ".mode",
  ".header",
  ".nextStep",
  ".actions",
  ".primary",
  ".secondary",
  ".textButton",
  "@media(max-width:640px)",
  "@media(prefers-reduced-motion:reduce)",
]) requireText("Shared Calmer Start styles", calmerStartStyles, required);

for (const forbidden of [
  "fetch(",
  "localStorage",
  "sessionStorage",
  "navigator.share",
  "mailto:",
  "sms:",
  "wa.me",
]) forbidText("Staging Staff Workspace engine", component, forbidden);

for (const required of [
  "searchParams",
  "workspaceId",
  "environment === \"production\"",
]) requireText("Staging workspace route", page, required);

for (const required of [
  "HibernatedStaffWorkspace",
  'workspaceId !== "customer_support"',
  "<CustomerSupportWorkspacePreview />",
]) requireText("Staff Workspace shared-shell wrapper", wrapper, required);

for (const required of [
  "STAGING BUILT · FOUNDER TESTING",
  "technical_operations",
  "finance_subscriptions",
  "safety_safeguarding",
  "privacy_data_protection",
  "content_moderation",
  "product_quality",
]) requireText("Founder Access Centre Staging status", controlRoom, required);

for (const required of [
  ".hero",
  ".identityGrid",
  ".roleContract",
  ".tabs",
  ".tabActive",
  ".workCard",
  ".gatePanel",
  ".activationFooter",
  "@media (max-width:680px)",
  "@media (prefers-reduced-motion:reduce)",
]) requireText("Hibernated Staff Workspace styles", styles, required);

console.log("HIISSA Staging staff workspace certification: PASS");
console.log("- Six remaining approved departments use one shared Staff Workspace engine");
console.log("- Every department has role-specific authorised work and protected boundaries");
console.log("- Founder/Admin verification gates Staging previews; Production hibernation and ordinary staff activation remain separate later gates");
console.log("- Shared journey includes Assigned → In Progress → Draft → Submitted → Returned/Completed preview branches → Notifications");
console.log("- Universal Founder submission gate remains visible; scenario controls do not grant staff Founder authority");
console.log("- Gentle Check-In, Workday Close and Private Appreciation receiving surfaces are present");
console.log("- Calmer Start reduces the workspace to one next step, then allows deliberate expansion or return to normal workspace");
console.log("- Staging Founder previews auto-offer Gentle Check-In after a short test delay and keep manual replay only as a test control");
console.log("- The same maximum-three/daypart/snooze/privacy contract is inherited from the shared People Experience Registry");
console.log("- No database persistence, external execution, Production deployment or Production effect is introduced by the Staging preview engine");
console.log("- Global/mobile/reduced-motion presentation protections are present");
