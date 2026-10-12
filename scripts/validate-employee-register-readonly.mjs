import fs from "node:fs";
import assert from "node:assert/strict";
import {createHash} from "node:crypto";
import {HIISSA_PROTOTYPE_STAFF,HIISSA_PROTOTYPE_STAFF_DEPARTMENTS} from "../lib/hiissa-prototype-staff-directory.js";
import {filterHiissaEmployeeRegister,summarizeHiissaEmployeeDepartments} from "../lib/hiissa-employee-register-prototype-view.js";
const read=path=>fs.readFileSync(path,"utf8");
const blobSha=text=>createHash("sha1").update("blob "+Buffer.byteLength(text)).update(Buffer.from([0])).update(text).digest("hex");
// Founder approved 2026-10-09: additive Alerts-only host change.
// Historical immutable host baseline d123b707477854d1811f6f7e2534248c5c7ba056 remains preserved in Git history.
const onboarding=read("app/admin/control-room-preview/page.js");
// Founder-approved 10 October 2026: accept ONLY the exact local Staff & Workspaces Back link.
// Retain the original protected host fingerprint after removing those authorised JSX additions.
const approvedNavigatorId='        id="staff-workspaces-areas"\n';
const approvedLocalBack=[
  '        <a className={styles.sectionBackLink} href="#staff-workspaces-areas">',
  "          ← Back to Staff & Workspaces",
  "        </a>",
].join("\n")+"\n";
for(const [label,fragment] of [["navigator ID",approvedNavigatorId],["local Back link",approvedLocalBack]]){
  assert.equal(onboarding.split(fragment).length-1,1,`Exactly one approved ${label} must exist`);
}
// 11 October 2026 — Founder explicitly approved two quick-check placements.
// Exact removals reconstitute the SAME original protected host SHA; unrelated
// mutations still fail the immutable baseline below.
const approvedQuickCheckImport='import FounderOnDemandStaffSourceCheck from "./FounderOnDemandStaffSourceCheck.js";\n';
const approvedOverviewQuickCheck='      <FounderOnDemandStaffSourceCheck authenticated={authenticated} location="overview" />\n\n';
const approvedStaffQuickCheck='        <FounderOnDemandStaffSourceCheck authenticated={authenticated} location="staff" />\n';
for(const [label,fragment] of [
  ["Founder quick-check import",approvedQuickCheckImport],
  ["Founder Overview quick-check",approvedOverviewQuickCheck],
  ["Founder Staff quick-check",approvedStaffQuickCheck]
]){
  assert.equal(onboarding.split(fragment).length-1,1,"Exactly one approved "+label+" is required");
}
// R74 Founder approval: independently preserve the identical original host
// SHA. Only six explicit, exact Staff-alert navigation fragments are allowed.
const directStaffAlertFragment1="import {isFounderStaffSecuritySourceIncident} from \"../../../lib/admin/founder-canonical-incident-alert-projection.js\";\n";
const directStaffAlertFragment2="              onOpenStaffAccessSecurity={() => {\n                choosePrimary(\"staff\");\n                window.requestAnimationFrame(() => {\n                  const destination=document.getElementById(\"staff-access-security\");\n                  if(!destination)return;\n                  destination.focus({preventScroll:true});\n                  destination.scrollIntoView({behavior:\"smooth\",block:\"start\"});\n                });\n              }}\n";
const directStaffAlertFragment3="  onOpenStaffAccessSecurity,\n";
const directStaffAlertFragment4="  const staffSourceIncidentVisible=canonicalIncidents.verified &&\n    canonicalIncidents.items.some(isFounderStaffSecuritySourceIncident);\n";
const directStaffAlertFragment5="            {staffSourceIncidentVisible ? (\n              <button type=\"button\" className={styles.alertAction} onClick={onOpenStaffAccessSecurity}>\n                Open Staff Access & Security →\n              </button>\n            ) : null}\n";
const directStaffAlertFragment6="      <div id=\"staff-access-security\" tabIndex={-1} role=\"region\" aria-label=\"Staff Access & Security\">";
// Founder R79 approved ONLY this exact Alerts header click behavior. Keep the
// two original host SHA validators independently active, not rebased.
const originalFounderAlertsHeaderClick="              onClick={() => setToolPanel((value) => value === \"alerts\" ? \"\" : \"alerts\")}";
const approvedFounderAlertsHeaderClick="              onClick={() => {\n                setToolPanel(\"alerts\");\n                window.requestAnimationFrame(() => {\n                  window.requestAnimationFrame(() => {\n                    const panel = document.getElementById(\"founder-alerts-panel\");\n                    if (!panel) return;\n                    panel.focus({ preventScroll: true });\n                    panel.scrollIntoView({ behavior: \"smooth\", block: \"start\" });\n                  });\n                });\n              }}";
assert.equal(onboarding.split(approvedFounderAlertsHeaderClick).length-1,1,
  "The single authorised header Alerts open-and-focus click handler must exist");
assert.equal(onboarding.split(originalFounderAlertsHeaderClick).length-1,0,
  "Original toggle must be fully replaced in the Staging host");
assert.ok(onboarding.includes('onClose={() => setToolPanel("")}'),
  "Existing dedicated Founder Alerts Close button must remain");
assert.equal(onboarding.split(directStaffAlertFragment1).length-1,1,"Exactly one Founder-approved alert eligibility import");
assert.equal(onboarding.split(directStaffAlertFragment2).length-1,1,"Exactly one Founder-approved alert direct staff callback");
assert.equal(onboarding.split(directStaffAlertFragment3).length-1,1,"Exactly one Founder-approved alert callback prop");
assert.equal(onboarding.split(directStaffAlertFragment4).length-1,1,"Exactly one Founder-approved alert validated condition");
assert.equal(onboarding.split(directStaffAlertFragment5).length-1,1,"Exactly one Founder-approved alert contextual button");
assert.equal(onboarding.split(directStaffAlertFragment6).length-1,1,"Exactly one Founder-approved accessible Staff destination");

// R143 narrowly approved additive customer/staff operational-centre entries.
// The original Founder host fingerprint below remains IDENTICAL after removing
// exactly these three independently asserted additions.
const approvedOperationalImport="import FounderOperationalCentresDashboard from \"./FounderOperationalCentresDashboard.js\";\n";
const approvedOperationalOverview="      <FounderOperationalCentresDashboard authenticated={authenticated} kind=\"customer\" />\n\n";
const approvedOperationalStaff="        <FounderOperationalCentresDashboard authenticated={authenticated} kind=\"staff\" />\n";
for(const [label,fragment] of [
  ["operational import",approvedOperationalImport],
  ["customer Overview",approvedOperationalOverview],
  ["staff Access & Security",approvedOperationalStaff]
])assert.equal(onboarding.split(fragment).length-1,1,"Exact approved operational addition required: "+label);

const protectedOnboarding=onboarding.replace(approvedNavigatorId,"").replace(approvedLocalBack,"")
  .replace(approvedQuickCheckImport,"").replace(approvedOverviewQuickCheck,"").replace(approvedStaffQuickCheck,"")
  .replace(directStaffAlertFragment1,"")
  .replace(directStaffAlertFragment2,"")
  .replace(directStaffAlertFragment3,"")
  .replace(directStaffAlertFragment4,"")
  .replace(directStaffAlertFragment5,"")
  .replace(directStaffAlertFragment6,'      <div id="staff-access-security">')
  .replace(approvedFounderAlertsHeaderClick,originalFounderAlertsHeaderClick)
  .replace(approvedOperationalImport,"")
  .replace(approvedOperationalOverview,"")
  .replace(approvedOperationalStaff,"");
assert.equal(blobSha(protectedOnboarding),"f2337383d9c41e5b79edbad8795a12d8661a2f13",
  "STOP: Founder-approved onboarding host differs beyond the specifically approved Back link");
const applicant=read("lib/experience-registry.js");
assert.ok(applicant.includes('export const ADMIN_STAFF_ONBOARDING_WORKFLOW = Object.freeze({'));
assert.ok(applicant.includes('export const STAFF_SECURE_ONBOARDING_EXPERIENCE_STANDARD = Object.freeze({'));
const api=read("app/api/admin/control-room/employee-register/route.js");
assert.ok(api.includes('branch==="feature/founder-control-room-staging"'));
assert.ok(api.includes('target!=="production"'));
assert.ok(api.includes('auth.getUser(token)'));
assert.ok(api.includes('from("admin_users")'));
assert.ok(api.includes('from("hiissa_employee_register")'));
assert.ok(api.includes('from("hiissa_staff_onboarding_applications")'));
assert.ok(api.includes('from("hiissa_attendance_events")'));
assert.ok(!api.includes("export async function POST"));
assert.ok(!api.includes("export async function PATCH"));
assert.ok(!api.includes("export async function DELETE"));
const preview=read("app/admin/control-room-preview/FounderEmployeeRegisterAttendancePreview.js");
const authenticatedShell=read("app/admin/control-room/AuthenticatedControlRoom.js");
const expectedOnboardingShortcut="/admin/control-room?view=modules&focus=staff-onboarding#module10-staff-access";
assert.ok(preview.includes(expectedOnboardingShortcut),"Existing Staff Onboarding shortcut must request exact module focus");
assert.ok(authenticatedShell.includes('query.get("focus") === "staff-onboarding"'),"Only explicit onboarding shortcut should activate module focus");
assert.ok(authenticatedShell.includes('query.get("view") === "modules"'),"Do not alter unrelated primary views");
assert.ok(authenticatedShell.includes('window.location.hash === "#module10-staff-access"'),"Require protected subsection target");
assert.ok(authenticatedShell.includes('aria-label="Founder Control Room modules"'),"Use existing navigation instead of replacing approved shell");
assert.ok(authenticatedShell.includes('=== "Security & Audit"'),"Select existing Module 10");
assert.ok(authenticatedShell.includes('document.getElementById("module10-staff-access")'),"Focus approved onboarding section, not generic Modules");
assert.ok(authenticatedShell.includes('attempts < 300'),"Navigation retry must be bounded");
assert.ok(authenticatedShell.includes("role=\"alert\""),"Navigation failures must be visible rather than silently inert");
for(const label of ["Employee Register","Attendance","Department Overview","Reports","Verified Staging records","Fictional demonstration team","Prototype Employees","No verified attendance events","Not recorded","Prototype ID","NO REAL RECORDS"]){
  assert.ok(preview.includes(label),"Missing truth-safe preview text: "+label);
}
assert.ok(preview.includes('const [source,setSource]=useState("demo");'));
assert.ok(preview.includes("filterHiissaEmployeeRegister(rows,{search,department,type,status})"));
assert.ok(preview.includes("summarizeHiissaEmployeeDepartments(visible)"));
assert.ok(preview.includes('method:"GET"'));
assert.ok(preview.includes("HIISSA_PROTOTYPE_STAFF"));
assert.ok(!preview.includes('method:"POST"'));
assert.ok(!preview.includes(".insert("));
assert.ok(!preview.includes(".update("));
const schema=read("supabase/migrations/20261008161359_hiissa_founder_employee_attendance_foundation_staging.sql");
for(const name of ["hiissa_staff_onboarding_applications","hiissa_employee_register","hiissa_attendance_events"])
  assert.ok(schema.includes("create table if not exists public."+name));
assert.ok(schema.includes("from public, anon, authenticated"));
assert.ok(!schema.includes("grant select on table public.hiissa_employee_register to authenticated"));
const prototype=HIISSA_PROTOTYPE_STAFF.map(p=>({employee_id:p.id,display_name:p.name,department:p.departmentLabel,role_label:p.role,engagement_type:"Not recorded",employment_state:"Not recorded"}));
assert.equal(filterHiissaEmployeeRegister(prototype,{department:"all"}).length,10);
assert.deepEqual(filterHiissaEmployeeRegister(prototype,{search:"Sarah"}).map(p=>p.employee_id),["demo-sarah"]);
assert.deepEqual(filterHiissaEmployeeRegister(prototype,{search:"jOhN"}).map(p=>p.employee_id),["demo-john"]);
assert.equal(filterHiissaEmployeeRegister(prototype,{department:"Finance & Subscriptions",search:"Sarah"}).length,0);
assert.equal(filterHiissaEmployeeRegister(prototype,{type:"Not recorded",status:"Not recorded"}).length,10);
const bars=summarizeHiissaEmployeeDepartments(prototype);
assert.equal(bars.length,7);
assert.equal(bars.reduce((n,p)=>n+p.count,0),10);
for(const group of HIISSA_PROTOTYPE_STAFF_DEPARTMENTS){
  const matching=filterHiissaEmployeeRegister(prototype,{department:group.label});
  assert.equal(matching.length,group.people.length,"Wrong count in "+group.label);
  assert.ok(matching.every(p=>p.department===group.label));
  assert.equal(summarizeHiissaEmployeeDepartments(matching).length,1);
  assert.equal(summarizeHiissaEmployeeDepartments(matching)[0].count,matching.length);
}
assert.equal(summarizeHiissaEmployeeDepartments(filterHiissaEmployeeRegister(prototype,{search:"Sarah"}))[0].count,1);
assert.equal(filterHiissaEmployeeRegister(prototype,{search:"Unlisted Person"}).length,0);
console.log("Prototype filter gate: PASS — All departments=10, Sarah/John, seven department filters, filtered chart counts");
console.log("Employee Register Staging live-read gate: PASS — Founder-only GET, honest source separation, protected onboarding blob and RLS migration contracts");

/* Additive Founder canonical-incident screen protections, part of mandatory prebuild. */
const incidentApi=read("app/api/admin/control-room/operational-incidents/route.js");
assert.ok(preview.includes("<CanonicalOperationalIncidentReadOnly />"),"Shared incident feed must appear in existing Employee Register");
assert.ok(preview.includes("Recorded operational incidents — Staging only"),"Truthful incident title");
assert.ok(preview.includes("No recorded incidents in the shared Staging register. This is not proof"),"No false healthy empty source");
assert.ok(preview.includes("Recorded incident source unavailable — this is not a healthy or empty result."),"Read errors fail closed");
assert.ok(preview.includes("Global alert-badge delivery, scheduled checks and automatic recovery are not yet connected or certified."),"No falsely completed alerts");
assert.ok(preview.includes('fetch("/api/admin/control-room/operational-incidents"'),"Reuse existing canonical incident GET");
assert.ok(preview.includes('method:"GET",cache:"no-store",credentials:"same-origin"'),"Read-only, no-cache");
assert.ok(preview.includes("!session?.access_token"),"No anonymous incident visibility");
assert.ok(preview.includes('aria-live="polite"'),"Live accessible feedback");
assert.ok(preview.includes("Refresh recorded incidents"),"User-controlled refresh");
assert.ok(incidentApi.includes("export async function GET")&&!incidentApi.includes("export async function POST"),"Incident reader remains GET-only");
assert.ok(incidentApi.includes("FOUNDER_GATE_REQUIRED")&&incidentApi.includes("UNAUTHENTICATED"),"Founder gate unchanged");
assert.ok(incidentApi.includes("hiissa_operational_incidents"),"Canonical incident source unchanged");
assert.ok(preview.includes("Operational source health — real Staging records only"),"Original source-health section remains");
assert.ok(preview.includes("MONITORING · All three sources are readable"),"Original source-health display remains");
console.log("Additive Founder canonical incident read display: STATIC PROTECTION PASS; live Founder acceptance pending.");
