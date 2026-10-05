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
const gentleCheckInStylePath = path.join(
  root,
  "components",
  "people-experience",
  "GentleCheckIn.module.css"
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
  ["Gentle check-in policy", gentleCheckInPolicyPath],
  ["Gentle check-in component", gentleCheckInComponentPath],
  ["Gentle check-in styles", gentleCheckInStylePath],
  ["Workday Close component", workdayCloseComponentPath],
  ["Workday Close styles", workdayCloseStylePath],
  ["Staff workspace API", staffApiPath],
  ["Founder staff approval API", founderApiPath],
  ["Experience Registry", registryPath],
  ["Founder Control Room", controlRoomPath],
]) requireFile(label, file);

const route = read(routePath);
const client = read(clientPath);
const css = read(cssPath);
const gentleCheckInPolicy = read(gentleCheckInPolicyPath);
const gentleCheckInComponent = read(gentleCheckInComponentPath);
const gentleCheckInStyles = read(gentleCheckInStylePath);
const workdayCloseComponent = read(workdayCloseComponentPath);
const workdayCloseStyles = read(workdayCloseStylePath);
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
  '"@supabase/supabase-js"',
  "hiissa-record-time.js",
  "formatHiissaRecordTime",
  "formatHiissaFullRecordTime",
  "← Back to Staff & Workspaces",
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
  "Persisted Staging timestamp.",
  "last",
  "updated",
  "Received:",
  "Response due:",
  "Submitted:",
  "Returned:",
  "Verified at",
  "Verify · Record · Report",
  "StaffWelcomeMoment",
  "HIISSA · PEOPLE EXPERIENCE",
  "Founder Preview — staff identity is not being impersonated",
  "welcome.isFounderPreview",
  "welcome.displayName",
  "welcome.roleLabel",
  "welcome.motivation",
  "Enter workspace →",
  "Skip welcome",
  "URLSearchParams",
  'welcome: "1"',
  "localDate",
  "localHour",
  "timeZone",
  "GentleCheckIn",
  "checkInVisible",
  "welcome?.checkIn?.due",
  "calmStart",
  "CALM START",
  "Starting with Assigned Work only.",
  "workload, priority and performance",
  "WorkdayClose",
  "Finish for now",
  "openWorkdayClose",
  'action: "workday_close"',
  "unsavedLocalChanges",
  "Save before leaving",
  "Before you finish for now…",
]) requireText("Working Customer Support workspace", client, required);

for (const forbidden of [
  '"@supabase/ssr"',
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
  "STAFF_WELCOME_MESSAGES",
  "FOUNDER_PREVIEW_MESSAGES",
  "preferredDisplayName",
  "staffWelcomePayload",
  '"staff_workspace_visit"',
  '"FIRST_VISIT_TODAY"',
  '"WELCOME_BACK"',
  '"QUIET_RETURN"',
  '"ANTI_REPEAT"',
  'metadata.preferred_name',
  'metadata.display_name',
  'metadata.full_name',
  'metadata.name',
  '"FATI BANCE"',
  '"FOUNDER PREVIEW · CUSTOMER SUPPORT"',
  '"CUSTOMER SUPPORT"',
  "emotional_checkin_recorded: false",
  "performance_score_recorded: false",
  "managerMoodSignalCreated: false",
  "productionEffectEnabled: false",
  "prepareGentleCheckIn",
  "checkIn,",
  '"Founder Preview · Customer Support"',
  'action === "workday_close"',
  '? "view_assigned_work"',
  "workdayCloseSummary",
  '"people_experience_workday_close_opened"',
  '"finish_for_now"',
  '"WORKDAY_CLOSE_READY"',
  "externalEffectPerformed: false",
  "productionEffectPerformed: false",
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
  "founderAccessCentre",
  'status: "STAGING_BUILD_VERIFIED_FOUNDER_PRACTICAL_TEST_PENDING"',
  'primaryHome: "Founder Control Room Overview"',
  "100% authorised access across HIISSA",
  "must never silently impersonate the employee",
  'customer_support: "/staff-workspace-preview"',
  "customerSupportPrototype",
  'status: "STAGING_BUILD_VERIFIED_FOUNDER_END_TO_END_TEST_PENDING"',
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
  "HIISSA_PEOPLE_EXPERIENCE_LAYER",
  'implementationStatus:',
  "CUSTOMER_SUPPORT_STAGING_FOUNDER_PRACTICAL_TEST_PASS",
  'firstImplementedWorkspace: "customer_support"',
  "Founder Preview uses its own role-aware encouragement",
  "preferred_name / display_name / full_name / name",
  'visitAuditEvent: "staff_workspace_visit"',
  "antiRepeatMessages: true",
  "founderTypographyLeak: false",
  "FOUNDER_AND_CUSTOMER_SUPPORT_STAGING_BUILD_VERIFIED_FOUNDER_PRACTICAL_TEST_PENDING",
  "activeRule: \"DAYPART_CARE\"",
  "maximumOpportunitiesPerActiveDay: 3",
  "maximumPerDaypart: 1",
  "minimumGapMinutes: 180",
  "historical48HourRule",
  "answerRecordedInAdminAudit: false",
  "performanceScoreCreated: false",
  "managerSignalCreated: false",
  'auditOfferEvent: "people_experience_checkin_offered"',
  "Customer Support calmer start opens Assigned Work first",
  "export const HIISSA_PEOPLE_EXPERIENCE_CAPABILITY_REGISTRY",
  "hiissa.people-experience.daypart-care-cadence",
  "hiissa.people-experience.workday-close",
  "hiissa.people-experience.private-appreciation",
  "hiissa.people-experience.workload-care-signals",
  "hiissa.people-experience.protected-rest-boundaries",
  "hiissa.people-experience.protected-rest-boundaries.care-pause",
  "hiissa.people-experience.i-need-help",
  "hiissa.people-experience.growth-learning-companion",
  "hiissa.people-experience.speak-up-ideas",
  "hiissa.people-experience.milestones-seasons-human-moments",
  "hiissa.people-experience.since-you-were-away",
  "components/people-experience/WorkdayClose.js",
  "/api/admin/control-room/workday-close",
  "POST /api/staff-workspace action=workday_close",
  "staffUnsavedChangeRule",
  "people_experience_workday_close_opened",
]) requireText("Persistent staff workspace Registry contract", registry, required);

for (const required of [
  ".staffWelcomeOverlay",
  ".staffWelcomeCard",
  ".staffWelcomeName",
  ".staffWelcomeRole",
  ".staffWelcomeMessage",
  ".staffQuietWelcome",
  "@media (prefers-reduced-motion: reduce)",
  "font-family: Arial, Helvetica, sans-serif;",
  ".calmStartNotice",
]) requireText("Staff welcome styles", css, required);

for (const forbidden of [
  "ui-serif",
  'font-family: Georgia',
  '"Times New Roman"',
]) forbidText("Staff welcome styles", css, forbidden);

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
  "I'm doing well",
  "I'm okay",
  "It's a heavy day",
  "I could use a calmer start",
  "Private by default.",
  "Give me a calmer start",
  "records only that a check-in was offered, not which answer you chose",
  "Founder Preview — this demonstrates the staff check-in experience.",
]) requireText("Shared gentle check-in component", gentleCheckInComponent, required);

for (const forbidden of [
  "fetch(",
  "localStorage",
  "sessionStorage",
]) forbidText("Shared gentle check-in component", gentleCheckInComponent, forbidden);

for (const required of [
  ".overlay",
  ".card",
  ".choices",
  ".privacy",
  "@media (prefers-reduced-motion: reduce)",
  "font-family: Arial, Helvetica, sans-serif;",
]) requireText("Shared gentle check-in styles", gentleCheckInStyles, required);

for (const forbidden of [
  "ui-serif",
  '"Times New Roman"',
]) forbidText("Shared gentle check-in styles", gentleCheckInStyles, forbidden);

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
]) forbidText("Shared Workday Close component", workdayCloseComponent, forbidden);

for (const required of [
  ".overlay",
  ".card",
  ".items",
  ".itemAttention",
  ".sourceNote",
  "@media (prefers-reduced-motion: reduce)",
  "font-family: Arial, Helvetica, sans-serif;",
]) requireText("Shared Workday Close styles", workdayCloseStyles, required);

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
  "earlier local-only approval prototype remains preserved in source",
  "FOUNDER ACCESS CENTRE",
  "Departments & staff workspaces",
  "Open in Founder Preview",
  "founderReturn=staff",
  "STAFF DIRECTORY — FOUNDER SIDE",
  "NO STAFF PASSWORD REQUIRED",
]) requireText("Working Founder Inbox / access connection", controlRoom, required);

forbidText(
  "Working Founder Inbox / access connection",
  controlRoom,
  "<FounderApprovalInboxPrototype />"
);

if (errors.length) {
  console.error("\nHIISSA working Customer Support / Founder gate contract: FAIL\n");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("HIISSA working Customer Support / Founder gate contract: PASS");
console.log("- Staging-only staff route remains protected");
console.log("- Staff and Founder Preview as Role modes are separated");
console.log("- Founder browser session uses the same Supabase client storage model as Admin sign-in");
console.log("- Founder Access Centre provides the Control Room doorway into department workspaces");
console.log("- Founder preview returns to Staff & Workspaces rather than losing previous context");
console.log("- Staff work records use the shared HIISSA timestamp display standard");
console.log("- Duplicate visible Founder Approval Inbox rendering is blocked");
console.log("- Real staff requires active Customer Support role + permission");
console.log("- Draft/start/submit actions use protected same-origin APIs");
console.log("- Submit for processing creates/reuses one canonical Founder approval record");
console.log("- Founder Approve / Return / Reject uses the working persistent Staging API");
console.log("- Approval remains distinct from verified completion");
console.log("- External customer execution and Production effects remain disabled");
console.log("- Historical prototype evidence remains preserved separately");
console.log("- Customer Support staff welcome uses time-aware first/return/quiet visit intelligence");
console.log("- Real staff identity comes from authorised profile metadata; Founder Preview preserves FATI BANCE as Founder");
console.log("- Staff welcome motivation rotates without performance scoring or mood surveillance");
console.log("- Founder-only premium typography is blocked from staff welcome styles");
console.log("- Daypart Care offers at most one morning, afternoon and evening check-in while active");
console.log("- Daypart Care enforces a 180-minute minimum gap and suppresses quiet returns");
console.log("- Historical 48-hour cadence remains preserved as superseded design evidence");
console.log("- Check-in answers are not written to the Admin audit trail or performance/manager signals");
console.log("- Staff Calm Start begins with Assigned Work without changing workload or removing tabs");
console.log("- Customer Support Workday Close records a close event without mutating case state");
console.log("- Workday Close warns when browser draft/note differs from the persisted Staging record");
console.log("- Editable unsaved work offers Save before leaving");
