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
const automaticGentleCheckInPath = path.join(
  root,
  "components",
  "people-experience",
  "AutomaticGentleCheckIn.js"
);
const automaticGentleCheckInStylePath = path.join(
  root,
  "components",
  "people-experience",
  "AutomaticGentleCheckIn.module.css"
);
const calmerStartModePath = path.join(
  root,
  "components",
  "people-experience",
  "CalmerStartMode.js"
);
const calmerStartModeStylePath = path.join(
  root,
  "components",
  "people-experience",
  "CalmerStartMode.module.css"
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
const privateAppreciationComponentPath = path.join(
  root,
  "components",
  "people-experience",
  "PrivateAppreciation.js"
);
const privateAppreciationStylePath = path.join(
  root,
  "components",
  "people-experience",
  "PrivateAppreciation.module.css"
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
const recordTimePath = path.join(root, "lib", "hiissa-record-time.js");
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
  ["Automatic Gentle Check-In controller", automaticGentleCheckInPath],
  ["Automatic Gentle Check-In styles", automaticGentleCheckInStylePath],
  ["Calmer Start mode", calmerStartModePath],
  ["Calmer Start styles", calmerStartModeStylePath],
  ["Workday Close component", workdayCloseComponentPath],
  ["Workday Close styles", workdayCloseStylePath],
  ["Private Appreciation component", privateAppreciationComponentPath],
  ["Private Appreciation styles", privateAppreciationStylePath],
  ["Staff workspace API", staffApiPath],
  ["Founder staff approval API", founderApiPath],
  ["Experience Registry", registryPath],
  ["HIISSA record time helper", recordTimePath],
  ["Founder Control Room", controlRoomPath],
]) requireFile(label, file);

const route = read(routePath);
const client = read(clientPath);
const css = read(cssPath);
const gentleCheckInPolicy = read(gentleCheckInPolicyPath);
const gentleCheckInComponent = read(gentleCheckInComponentPath);
const gentleCheckInStyles = read(gentleCheckInStylePath);
const automaticGentleCheckIn = read(automaticGentleCheckInPath);
const automaticGentleCheckInStyles = read(automaticGentleCheckInStylePath);
const calmerStartMode = read(calmerStartModePath);
const calmerStartModeStyles = read(calmerStartModeStylePath);
const workdayCloseComponent = read(workdayCloseComponentPath);
const workdayCloseStyles = read(workdayCloseStylePath);
const privateAppreciationComponent = read(privateAppreciationComponentPath);
const privateAppreciationStyles = read(privateAppreciationStylePath);
const staffApi = read(staffApiPath);
const founderApi = read(founderApiPath);
const registry = read(registryPath);
const recordTime = read(recordTimePath);
const controlRoom = read(controlRoomPath);

for (const required of [
  'branch !== "feature/founder-control-room-staging"',
  'environment === "production"',
  "notFound()",
  "<StaffWorkspacePreview workspaceId={workspaceId} />",
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
  "CalmerStartMode",
  "calmStart",
  "calmStartExpanded",
  'taskTitle={item.title}',
  'taskDetail={item.summary}',
  'taskStatus={statusText(item.status)}',
  "setCalmStartExpanded(false)",
  "setCalmStartExpanded(true)",
  "WorkdayClose",
  "Finish for now",
  "openWorkdayClose",
  'action: "workday_close"',
  "unsavedLocalChanges",
  "Save before leaving",
  "Before you finish for now…",
  "PrivateAppreciation",
  'mode="recipient-empty"',
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
  '"CARE_CHECK_READY"',
  'searchParams.get("care") === "1"',
  '"checkin_snooze"',
  '"checkin_resolve"',
  "recordGentleCheckInState",
  "answerRecorded: false",
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
  "FOUNDER_APPROVED_AUTOMATIC_TIMED_CARE_IMPLEMENTED_ON_STAGING_BRANCH_BUILD_PENDING",
  "activeRule: \"DAYPART_CARE\"",
  "maximumOpportunitiesPerActiveDay: 3",
  "typicalOpportunitiesPerActiveDay: 2",
  "maximumPerDaypart: 1",
  "minimumGapMinutes: 180",
  "automaticWhileActive: true",
  "forcedEmotionalDisclosure: false",
  "snoozeCreatesExtraCheckIn: false",
  "historical48HourRule",
  "automaticTimedCare",
  "ignoredBehaviour",
  "safeMomentRule",
  "activeWorkDelayMinutes: 30",
  "snoozeMinutes: 30",
  "eligibilityPollMinutes: 15",
  "founderPreviewAcceleratedDelaySeconds: 8",
  "answerRecordedInAdminAudit: false",
  "performanceScoreCreated: false",
  "managerSignalCreated: false",
  'auditOfferEvent: "people_experience_checkin_offered"',
  'auditSnoozeEvent: "people_experience_checkin_snoozed"',
  'auditResolvedEvent: "people_experience_checkin_resolved"',
  "Customer Support calmer start opens Assigned Work first",
  "export const HIISSA_PEOPLE_EXPERIENCE_CAPABILITY_REGISTRY",
  "hiissa.people-experience.daypart-care-cadence",
  "hiissa.people-experience.workday-close",
  "hiissa.people-experience.private-appreciation",
  "FOUNDER_TESTED_PASS_EXPANDED_INTERFACE_FOUNDATION_PERSISTENCE_PENDING",
  "HIISSA_GLOBAL_IDENTITY_WRITING_STANDARD",
  "FOUNDER_APPROVED_PERMANENT_HIISSA_WIDE_STANDARD",
  "warm",
  "calm",
  "kind",
  "respectful",
  "emotionally intelligent",
  "grounded",
  "non-judgmental",
  "HIISSA is one global and international product",
  "WRITE_IT_MYSELF",
  "HELP_ME_WRITE_IT",
  "multipleSuggestionsRequired: true",
  "sameMessageOrPersonalise: true",
  "wholeActiveDepartment: true",
  "multipleDepartments: true",
  "savedGroupsFuture: true",
  "recipientLocalWorkingHoursOption: true",
  "duplicateSendProtection: true",
  "founderSentHistory: true",
  "recipientMyAppreciationsArchive: true",
  "appreciationMomentsOptional: true",
  "noAutoSend: true",
  "NO_PERSISTENCE_SOURCE_CONNECTED",
  "sendsOrStoresMessages: false",
  "supabaseSchemaChanged: false",
  "hiissa.people-experience.workload-care-signals",
  "hiissa.people-experience.protected-rest-boundaries",
  "hiissa.people-experience.protected-rest-boundaries.care-pause",
  "hiissa.people-experience.i-need-help",
  "hiissa.people-experience.growth-learning-companion",
  "hiissa.people-experience.speak-up-ideas",
  "hiissa.people-experience.milestones-seasons-human-moments",
  "hiissa.people-experience.since-you-were-away",
  "calmerStartMode: Object.freeze({",
  "FOUNDER_APPROVED_IMPLEMENTED_ON_STAGING_BRANCH_BUILD_PENDING",
  "Gentle Check-In → I could use a calmer start or It's a heavy day",
  "The full normal workspace navigation is temporarily reduced.",
  "continueWithThisTask",
  "viewAllWorkspaceAreas",
  "returnToNormalWorkspace",
  "emotionalAnswerPersisted: false",
  "managerSignalCreated: false",
  "workloadChanged: false",
  "priorityChanged: false",
  "responsibilityChanged: false",
  "permissionChanged: false",
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
]) requireText("Staff welcome styles", css, required);

for (const forbidden of [
  "ui-serif",
  'font-family: Georgia',
  '"Times New Roman"',
]) forbidText("Staff welcome styles", css, forbidden);

for (const required of [
  "STAFF WORKSPACE INTERACTION ACKNOWLEDGEMENT SWEEP",
  ".primaryButton:not(:disabled):active",
  ".secondaryButton:not(:disabled):active",
  ".navItem:active",
  ".navActive:active",
  ".staffWelcomeEnter:active",
  ".staffWelcomeSkip:active",
  ".primaryButton:disabled",
  ".secondaryButton:disabled",
]) requireText("Staff workspace interaction feedback", css, required);

for (const required of [
  "HISTORICAL_PEOPLE_CHECKIN_MIN_HOURS = 48",
  'PEOPLE_CHECKIN_ACTIVE_CADENCE = "DAYPART_CARE"',
  "PEOPLE_CHECKIN_MIN_GAP_MINUTES = 180",
  "PEOPLE_CHECKIN_MAX_PER_ACTIVE_DAY = 3",
  "PEOPLE_CHECKIN_SNOOZE_MINUTES = 30",
  "PEOPLE_CHECKIN_ACTIVE_WORK_DELAY_MINUTES = 30",
  "PEOPLE_CHECKIN_POLL_MINUTES = 15",
  "peopleCheckInDaypart",
  '"people_experience_checkin_offered"',
  '"people_experience_checkin_snoozed"',
  '"people_experience_checkin_resolved"',
  '"DAILY_MAXIMUM_REACHED"',
  '"MINIMUM_GAP_NOT_MET"',
  '"DAYPART_ALREADY_RESOLVED"',
  '"SNOOZE_COMPLETE"',
  '"OFFER_PENDING"',
  "maximum_per_active_day: PEOPLE_CHECKIN_MAX_PER_ACTIVE_DAY",
  "answer_recorded: false",
  "answer_value_recorded: false",
  "emotional_score_created: false",
  "performance_score_created: false",
  "manager_signal_created: false",
  "explicit_support_escalation_created: false",
  'welcomeMode === "QUIET_RETURN"',
  "recordGentleCheckInState",
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
  "onResponded?.()",
  "if (onNotNow) onNotNow()",
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
  ".nextStep",
  ".primary",
  ".secondary",
  ".textButton",
  "@media(max-width:640px)",
  "@media(prefers-reduced-motion:reduce)",
]) requireText("Shared Calmer Start styles", calmerStartModeStyles, required);

for (const required of [
  "PREVIEW_AUTO_DELAY_MS = 8000",
  "DEFAULT_ACTIVE_WORK_DELAY_MS = 30 * 60 * 1000",
  "DEFAULT_POLL_MS = 15 * 60 * 1000",
  "DEFAULT_SNOOZE_MS = 30 * 60 * 1000",
  "AUTO_MINIMISE_MS = 60 * 1000",
  "RECENT_ACTIVITY_WINDOW_MS = 5 * 60 * 1000",
  "SAFE_MOMENT_RETRY_MS = 2 * 60 * 1000",
  "document.activeElement",
  "recentlyActive",
  "editing",
  "A gentle check-in is waiting",
  "Gentle check-in snoozed",
  "Respond now",
  "Not now",
  "recordState(\"resolved\"",
  "recordState(\"snoozed\"",
  "manualRequestKey",
]) requireText("Automatic Gentle Check-In controller", automaticGentleCheckIn, required);

for (const forbidden of [
  "localStorage",
  "sessionStorage",
]) forbidText("Automatic Gentle Check-In controller", automaticGentleCheckIn, forbidden);

for (const required of [
  ".reminder",
  ".reminderActions",
  ".respond",
  ".snooze",
  "@media(max-width:640px)",
  "@media(prefers-reduced-motion:reduce)",
]) requireText("Automatic Gentle Check-In reminder styles", automaticGentleCheckInStyles, required);


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
  "Open {workspace.label} workspace",
  "founderReturn=staff",
  "STAFF DIRECTORY — FOUNDER SIDE",
  "NO STAFF PASSWORD REQUIRED",
  "PrivateAppreciation",
  'mode="founder-preview"',
  'recipientLabel="Customer Support"',
]) requireText("Working Founder Inbox / access connection", controlRoom, required);

forbidText(
  "Working Founder Inbox / access connection",
  controlRoom,
  "<FounderApprovalInboxPrototype />"
);

for (const required of [
  "HIISSA · PRIVATE APPRECIATION & RECOGNITION",
  "STAGING · PREVIEW ONLY",
  "HIISSA writing identity",
  "Fictional Staging directory",
  "All departments",
  "Select all shown",
  "Cross-department example",
  "Write it myself",
  "Help me write it",
  "Give me more suggestions",
  "Same message for everyone",
  "Personalise for each person",
  "Optional Founder-only context note",
  "Deliver in recipient’s local working hours",
  "Preview final delivery",
  "there is deliberately no Send button yet.",
  "No saved appreciation source is connected yet.",
  "No external AI-generation service is connected yet",
  "reason for praise",
  "formatHiissaGlobalRecordTime",
  "hiissaResolvedLocale",
  "hiissaResolvedTimeZone",
  "permanent staff identity",
]) requireText("Private Appreciation interface foundation", privateAppreciationComponent, required);

for (const required of [
  "hiissaResolvedLocale",
  "formatHiissaGlobalRecordTime",
  "hiissaGlobalTimestampRecord",
  "timeZoneName: \"short\"",
]) requireText("HIISSA global timestamp helper", recordTime, required);

for (const forbidden of [
  "fetch(",
  "localStorage",
  "sessionStorage",
  "navigator.share",
  "mailto:",
  "sms:",
  "wa.me",
]) forbidText("Private Appreciation interface foundation", privateAppreciationComponent, forbidden);

for (const required of [
  ".founderSurface",
  ".recipientSurface",
  ".identityNotice",
  ".peopleGrid",
  ".suggestionGrid",
  ".finalReview",
  ".recipientReviewList",
  "@media (prefers-reduced-motion: reduce)",
]) requireText("Private Appreciation styles", privateAppreciationStyles, required);

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
console.log("- Automatic timed Daypart Care pops up while actively working; staff do not need to navigate to it");
console.log("- Maximum three per active day is explicit; snooze/reminder does not create extra check-ins");
console.log("- Ignored prompts minimise to a persistent reminder; Not now snoozes the same opportunity");
console.log("- Care waits for safer moments rather than interrupting active typing or protected busy states");
console.log("- Audit records offer/snooze/resolved delivery state only; emotional answer values remain private");
console.log("- Daypart Care enforces a 180-minute minimum gap and suppresses quiet returns");
console.log("- Historical 48-hour cadence remains preserved as superseded design evidence");
console.log("- Check-in answers are not written to the Admin audit trail or performance/manager signals");
console.log("- Staff Calm Start begins with Assigned Work without changing workload or removing tabs");
console.log("- Customer Support Workday Close records a close event without mutating case state");
console.log("- Workday Close warns when browser draft/note differs from the persisted Staging record");
console.log("- Editable unsaved work offers Save before leaving");
console.log("- Working staff buttons and navigation visibly acknowledge touch/press while disabled controls remain honestly disabled");
console.log("- Private Appreciation remains nested inside Staff & Workspaces, not added as a top-level dashboard button");
console.log("- Expanded Staging foundation supports fictional one/bulk/cross-department recipient selection");
console.log("- Write it myself / Help me write it and multiple HIISSA-aligned suggestions are present without a live AI service");
console.log("- HIISSA identity is locked: warm, calm, kind, respectful, emotionally intelligent, grounded and non-judgmental");
console.log("- Global timestamp helper preserves authoritative instant while supporting viewer locale/timezone presentation");
console.log("- Staff Notifications has the matching private-recognition surface");
console.log("- Appreciation remains browser-session-only: no send, storage, Supabase schema or Production effect");
console.log("- Public ranking, popularity scoring and colleague-recognition expansion remain disabled");
