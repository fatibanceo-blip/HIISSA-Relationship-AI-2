import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {createHash} from "node:crypto";
import {validateNewIncident, validateIncidentTransition} from "../lib/admin/operational-incident-staging.js";
import {projectFounderCanonicalIncidentAlerts} from "../lib/admin/founder-canonical-incident-alert-projection.js";
const blobSha=s=>createHash("sha1").update("blob "+Buffer.byteLength(s)+"\0"+s).digest("hex");
// Founder permission 2026-10-09: explicitly authorised minimal Staging Alerts addition.
// Previous protected baseline: d123b707477854d1811f6f7e2534248c5c7ba056 (preserved in Git history).
const host=readFileSync("app/admin/control-room-preview/page.js","utf8");
assert.equal(blobSha(host),"5f499eb56e31287981878558d7658045d89f8f20","Protected original Founder host must remain unchanged");
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
