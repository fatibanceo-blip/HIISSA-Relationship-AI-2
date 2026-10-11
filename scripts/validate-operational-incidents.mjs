import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {createHash} from "node:crypto";
import vm from "node:vm";
import {validateNewIncident, validateIncidentTransition} from "../lib/admin/operational-incident-staging.js";
import {projectFounderCanonicalIncidentAlerts} from "../lib/admin/founder-canonical-incident-alert-projection.js";
import {isFounderStaffSecuritySourceIncident} from "../lib/admin/founder-canonical-incident-alert-projection.js";
const blobSha=s=>createHash("sha1").update("blob "+Buffer.byteLength(s)+"\0"+s).digest("hex");
// Founder permission 2026-10-09: explicitly authorised minimal Staging Alerts addition.
// Previous protected baseline: d123b707477854d1811f6f7e2534248c5c7ba056 (preserved in Git history).
const host=readFileSync("app/admin/control-room-preview/page.js","utf8");
// Founder-approved 10 October 2026: allow ONLY the exact local Staff & Workspaces Back control.
// The protected original host must remain byte-identical after stripping these two additions.
const approvedNavigatorId='        id="staff-workspaces-areas"\n';
const approvedLocalBack=[
  '        <a className={styles.sectionBackLink} href="#staff-workspaces-areas">',
  "          ← Back to Staff & Workspaces",
  "        </a>",
].join("\n")+"\n";
for(const [label,addition] of [["navigator ID",approvedNavigatorId],["local Back control",approvedLocalBack]]){
  assert.equal(host.split(addition).length-1,1,`Exactly one approved ${label} must exist`);
}
// Founder approved 11 October 2026: precisely one common quick-check import
// and two JSX placements. Removing ONLY these exact fragments restores
// the same immutable original Founder host SHA; no other host edits permitted.
const allowedFounderCheckImport='import FounderOnDemandStaffSourceCheck from "./FounderOnDemandStaffSourceCheck.js";\n';
const allowedOverviewCheck='      <FounderOnDemandStaffSourceCheck authenticated={authenticated} location="overview" />\n\n';
const allowedStaffCheck='        <FounderOnDemandStaffSourceCheck authenticated={authenticated} location="staff" />\n';
for(const [label,fragment] of [
  ["manual-check shared import",allowedFounderCheckImport],
  ["manual-check Overview placement",allowedOverviewCheck],
  ["manual-check Staff placement",allowedStaffCheck]
])assert.equal(host.split(fragment).length-1,1,"Exactly one Founder-approved "+label+" required");
// Founder-approved 11 Oct later R74: only the specific Staff-source alert
// destination/action may differ. Subtract exact documented fragments,
// keeping the original immutable Founder host SHA unchanged.
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
assert.equal(host.split(approvedFounderAlertsHeaderClick).length-1,1,
  "The single authorised header Alerts open-and-focus click handler must exist");
assert.equal(host.split(originalFounderAlertsHeaderClick).length-1,0,
  "Original toggle must be fully replaced in the Staging host");
assert.ok(host.includes('onClose={() => setToolPanel("")}'),
  "Existing dedicated Founder Alerts Close button must remain");
assert.equal(host.split(directStaffAlertFragment1).length-1,1,"Exactly one Founder-approved alert eligibility import");
assert.equal(host.split(directStaffAlertFragment2).length-1,1,"Exactly one Founder-approved alert direct staff callback");
assert.equal(host.split(directStaffAlertFragment3).length-1,1,"Exactly one Founder-approved alert callback prop");
assert.equal(host.split(directStaffAlertFragment4).length-1,1,"Exactly one Founder-approved alert validated condition");
assert.equal(host.split(directStaffAlertFragment5).length-1,1,"Exactly one Founder-approved alert contextual button");
assert.equal(host.split(directStaffAlertFragment6).length-1,1,"Exactly one Founder-approved accessible Staff destination");
const protectedOriginalHost=host.replace(approvedNavigatorId,"").replace(approvedLocalBack,"")
  .replace(allowedFounderCheckImport,"").replace(allowedOverviewCheck,"").replace(allowedStaffCheck,"")
  .replace(directStaffAlertFragment1,"")
  .replace(directStaffAlertFragment2,"")
  .replace(directStaffAlertFragment3,"")
  .replace(directStaffAlertFragment4,"")
  .replace(directStaffAlertFragment5,"")
  .replace(directStaffAlertFragment6,"      <div id=\"staff-access-security\">")
  .replace(approvedFounderAlertsHeaderClick,originalFounderAlertsHeaderClick);
assert.equal(blobSha(protectedOriginalHost),"f2337383d9c41e5b79edbad8795a12d8661a2f13",
  "Founder host must match immutable original SHA after removing ONLY explicitly approved Back and Staff source-check additions");
// Isolated, deterministic test of the EXACT Staging handler with no browser,
// database, session, staff or external calls. Test the first AND repeat taps.
{
  const states=[],focus=[],scroll=[];
  const panel={focus:(options)=>focus.push(options),scrollIntoView:(options)=>scroll.push(options)};
  const context={
    setToolPanel:(next)=>states.push(next),
    window:{requestAnimationFrame:(fn)=>fn()},
    document:{getElementById:(id)=>id==="founder-alerts-panel"?panel:null}
  };
  assert.ok(approvedFounderAlertsHeaderClick.trim().startsWith("onClick={"));
  const expression=approvedFounderAlertsHeaderClick.trim().slice("onClick={".length,-1);
  const click=vm.runInNewContext("("+expression+")",context);
  click();click();
  assert.deepEqual(states,["alerts","alerts"],"Both Alerts taps must open, never toggle-close");
  assert.equal(focus.length,2,"Both taps must focus the existing Alerts panel");
  assert.equal(scroll.length,2,"Both taps must scroll the existing Alerts panel into view");
  assert.ok(focus.every(x=>x.preventScroll===true));
  assert.ok(scroll.every(x=>x.behavior==="smooth"&&x.block==="start"));
}
console.log("Founder R79 Alerts header first/repeat click scroll-focus isolated behavior and unchanged immutable Founder original SHA: PASS");

const migration=readFileSync("supabase/migrations/20261009101553_shared_operational_incidents_staging.sql","utf8");
const route=readFileSync("app/api/admin/control-room/operational-incidents/route.js","utf8");
for(const requirement of [
  "create table if not exists public.hiissa_operational_incidents",
  "from public, anon, authenticated", "enable row level security",
  "into public.admin_audit_events",
  "environment = 'staging'",
]) assert.ok(migration.includes(requirement),requirement);
assert.ok(!migration.includes("drop table public.admin_audit_events"));
assert.ok(!migration.includes("create table if not exists public.admin_approval_requests"));
assert.ok(route.includes("export async function GET"));
assert.ok(!route.includes("export async function POST"));
assert.ok(route.includes("FOUNDER_GATE_REQUIRED") && route.includes("status:404"));
const existingTimeline=readFileSync("app/api/admin/control-room/activity-timeline/route.js","utf8");
assert.ok(existingTimeline.includes('hiissa_operational_incident_state_change'),"Operational history must appear in existing Founder timeline");
assert.ok(existingTimeline.includes('Operational recovery independently verified'),"Verified and attempted recoveries must not be confused");
const valid={incidentKey:"check.voice.latency",featureId:"hiissa.voice.live",ownerModuleId:"failures-reliability",title:"Voice response unavailable",summary:"Technical voice service did not answer.",severity:"degraded",oversightLevel:2,recoveryClassification:"SAFE_WITH_LIMIT",maxSafeRetries:2};
assert.equal(validateNewIncident(valid).ok,true);
assert.equal(validateNewIncident({...valid,ownerModuleId:"new-module-11"}).ok,false);
assert.equal(validateNewIncident({...valid,oversightLevel:3,maxSafeRetries:1}).ok,false);
assert.equal(validateNewIncident({...valid,incidentKey:"private email@example.com"}).ok,false);
const current={state:"verification_pending",oversight_level:2,verification_state:"pending",recovery_classification:"SAFE_WITH_LIMIT",retry_attempts:0,max_safe_retries:2};
assert.equal(validateIncidentTransition(current,"verified_resolved","").ok,false);
assert.equal(validateIncidentTransition(current,"verified_resolved","verified-check-20261009").ok,true);
assert.equal(validateIncidentTransition({...current,state:"needs_attention"},"verified_resolved","verified-check-20261009").ok,false);
assert.equal(validateIncidentTransition({...current,state:"investigating",recovery_classification:"NEVER_AUTOMATE"},"recovery_attempted").ok,false);
assert.equal(validateIncidentTransition({...current,state:"investigating",retry_attempts:2},"recovery_attempted").ok,false);
assert.ok(!existingTimeline.includes('return "HIISSA detected an operational problem"'),"Incident detection must not be misreported as automatic handling");
console.log("Shared incident foundation static and transition validator: PASS");
console.log("Founder approved host SHA preserved; no public write route; Staging-only checks present.");

/* New approval-gated canonical incident alert projection tests (zero mock DB writes). */
const fixture=(incidents)=>({status:"MONITORING",sourceState:incidents.length?"RECORDED_INCIDENTS":"READABLE_EMPTY",
  incidents,openIncidentCount:incidents.filter(x=>x.state!=="verified_resolved").length});
const incident=(incidentId,state,severity)=>({incidentId,state,severity,title:"Source check",oversightLevel:2});
const sample=[incident("real-incident-001","needs_attention","degraded"),incident("real-incident-002","verification_pending","critical"),incident("real-incident-003","verified_resolved","critical")];
assert.deepEqual(projectFounderCanonicalIncidentAlerts(fixture([])).verified,true);
assert.equal(projectFounderCanonicalIncidentAlerts(fixture([])).attentionCount,0);
assert.equal(projectFounderCanonicalIncidentAlerts(fixture([])).criticalCount,0);
assert.equal(projectFounderCanonicalIncidentAlerts(fixture(sample)).attentionCount,2);
assert.equal(projectFounderCanonicalIncidentAlerts(fixture(sample)).criticalCount,1);
assert.equal(projectFounderCanonicalIncidentAlerts(fixture(sample)).items.length,2);
assert.equal(projectFounderCanonicalIncidentAlerts(null).verified,false);
assert.equal(projectFounderCanonicalIncidentAlerts({...fixture(sample),openIncidentCount:0}).verified,false);
assert.equal(projectFounderCanonicalIncidentAlerts(fixture([incident("real-incident-001","fake_state","critical")])).verified,false);
assert.equal(projectFounderCanonicalIncidentAlerts(fixture([sample[0],sample[0]])).verified,false);
assert.ok(host.includes('useFounderCanonicalIncidentAlerts(authenticated,60000)'),"Header must poll canonical source without disturbing existing eight");
assert.ok(host.includes('const canonicalIncidents=useFounderCanonicalIncidentAlerts(authenticated)'),"Panel must load same canonical source");
assert.ok(host.includes('The recorded incident source could not be confirmed. Do not treat it as zero or healthy.'),"Failed source not healthy");
assert.ok(host.includes('combinedCriticalCount=summary.criticalCount+incidentAlerts.criticalCount'),"Keep old verified critical count and add new");
assert.ok(host.includes('combinedAttentionCount=summary.attentionCount+incidentAlerts.attentionCount'),"Keep old attention count and add new");
assert.ok(host.includes('onOpenRecordedIncidents={()'),"Real incident navigation must be available");
assert.ok(host.includes('fetch("/api/admin/control-room/operational-incidents"'),"Read existing canonical Founder-gated endpoint");
assert.ok(host.includes('method:"GET",cache:"no-store",credentials:"same-origin"'),"No stale anonymous GET");
console.log("Staging Founder canonical alert integration projection, empty/error/verified/critical tests: PASS");


/* R74: Actual Founder alert route is visible ONLY for a verified, unresolved
   canonical Staff Session source incident; this test never inserts live rows. */
const staffPayload={
  status:"MONITORING",sourceState:"RECORDED_INCIDENTS",openIncidentCount:1,
  incidents:[{incidentId:"fixture-staff-source-001",featureId:"staff-session-device-control",
    ownerModuleId:"admin-security-audit",title:"Staff access operational source unreadable",
    state:"needs_attention",severity:"unavailable",oversightLevel:2}]
};
const staffProjected=projectFounderCanonicalIncidentAlerts(staffPayload);
assert.equal(staffProjected.verified,true);
assert.equal(staffProjected.attentionCount,1);
assert.equal(isFounderStaffSecuritySourceIncident(staffProjected.items[0]),true);
assert.equal(isFounderStaffSecuritySourceIncident({...staffProjected.items[0],featureId:"other-feature"}),false);
assert.equal(isFounderStaffSecuritySourceIncident({...staffProjected.items[0],ownerModuleId:"other-module"}),false);
assert.equal(isFounderStaffSecuritySourceIncident({...staffProjected.items[0],title:"Other failure"}),false);
assert.equal(isFounderStaffSecuritySourceIncident({...staffProjected.items[0],state:"verified_resolved"}),false);
assert.equal(projectFounderCanonicalIncidentAlerts(null).verified,false);
assert.equal(projectFounderCanonicalIncidentAlerts(fixture([])).items.some(isFounderStaffSecuritySourceIncident),false);
assert.ok(host.includes('const staffSourceIncidentVisible=canonicalIncidents.verified &&'));
assert.ok(host.includes('canonicalIncidents.items.some(isFounderStaffSecuritySourceIncident)'));
assert.ok(host.includes('onOpenStaffAccessSecurity={() => {'));
assert.ok(host.includes('destination.focus({preventScroll:true})'));
assert.ok(host.includes('Open Staff Access & Security →'));
assert.ok(host.includes('id="staff-access-security" tabIndex={-1} role="region" aria-label="Staff Access & Security"'));
assert.ok(host.includes('Open recorded incidents →'),"Keep original generic incident entrance");
console.log("R74 Founder Staff-source alert direct access: mock verified/empty/invalid/resolved, context navigation and unchanged original host PASS");

/* The combined-source critical count is the ONLY critical toast reset authority. */
assert.ok(host.includes("const combinedPanelCriticalCount=criticalCount+canonicalIncidents.criticalCount"),"Panel critical header incorporates canonical critical incidents");
assert.ok(host.includes("criticalMessage || canonicalIncidents.criticalMessage"),"Preserve existing critical message priority");
assert.ok(host.includes('setDismissedCriticalKey("");'),"Combined critical reset keeps old dismiss semantics");
assert.ok(!host.includes('else if (criticalCount === 0) {\n          setCriticalVisible(false);'),"No old eight-source-only reset that suppresses genuine canonical critical notices");
console.log("Combined critical badge + panel + dismissal protection: PASS");
