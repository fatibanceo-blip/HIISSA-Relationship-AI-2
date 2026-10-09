import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {createHash} from "node:crypto";
import {validateNewIncident, validateIncidentTransition} from "../lib/admin/operational-incident-staging.js";
const blobSha=s=>createHash("sha1").update("blob "+Buffer.byteLength(s)+"\0"+s).digest("hex");
const host=readFileSync("app/admin/control-room-preview/page.js","utf8");
assert.equal(blobSha(host),"d123b707477854d1811f6f7e2534248c5c7ba056","Protected original Founder host must remain unchanged");
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
console.log("Shared incident foundation static and transition validator: PASS");
console.log("Founder approved host SHA preserved; no public write route; Staging-only checks present.");
