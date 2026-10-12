// Founder-approved additive Staging-only HIISSA evidence review assistant.
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>readFileSync(p,"utf8");
const route=read("app/api/admin/control-room/staff-trust-review/assist/route.js");
const core=read("app/api/admin/control-room/staff-trust-review/route.js");
const view=read("app/admin/control-room/FounderOperationalCentreView.js");
const forms=read("app/admin/control-room/FounderPracticeActions.js");
const gate=read("lib/admin/founder-staging-operational-centres.js");
const registry=read("lib/experience-registry.js");
for(const required of [
  "operationalCentreStagingAllowed()","verifyOperationalCentreFounder(request)",
  'request.headers.get("origin")','new URL(origin).origin!==new URL(request.url).origin',
  'from("hiissa_staff_review_staging")','eq("environment","staging")',
  'record.staff_kind!=="FICTIONAL_PRACTICE"',"HIISSA_PROTOTYPE_STAFF.some",
  'record.review_area!=="TRAINING_EVIDENCE"',"STALE_RECORD_REFRESH",
  "OPENAI_API_KEY","chat.completions.create",
  "approvedCourseRequirements:\"NOT_CONNECTED\"",
  'from("admin_audit_events").insert(', 'action_id:"assisted_evidence_review"',
  'training_certified:false','final_decision_performed:false',
  'outcome:"recorded"',
  'recommendation:"FOUNDER_REVIEW_REQUIRED"',
  'founderDecisionRequired:true','productionEffectEnabled:false',
  'officialCourseCriteriaConnected:false',
]) assert.ok(route.includes(required),"Protected assistant contract missing: "+required);
assert.ok(!route.includes('outcome:"draft_prepared"'),
  "Assistant audit must not use a value forbidden by the existing audit outcome constraint");
for(const words of [
  "calm, warm, kind, composed, respectful",
  "non-judgmental language",
  "Preserve the Founder's agency",
  "Do not invent achievements"
]) assert.ok(route.includes(words),"HIISSA Founder-approved identity missing "+words);
for(const marker of [
  "AUDIT_NOT_RECORDED", "AUDIT-503", "SOURCE-503", "ASSIST-503",
  "I couldn't safely prepare this review."
]) assert.ok(view.includes(marker),"Warm actionable diagnostic missing "+marker);
assert.ok(!route.includes('from("admin_access_restrictions")'),
  "Never read the original protected restriction table directly");
assert.ok(!route.includes('from("admin_role_assignments").update'),
  "Assistant must never change staff privileges");
assert.ok(!/\.update\(|\.delete\(|\.upsert\(/.test(route),
  "The assistant must never update evidence state or staff access");
for(const required of [
  'function StaffContent({data,loading,onAction,onAssist,busy})',
  'async function assistEvidence(id,version)',
  '<StaffPracticeActions data={data} onAction={onAction} onAssist={onAssist} busy={busy}/>',
  'result?.founderDecisionRequired!==true',
  'method:"POST"'
]) assert.ok(view.includes(required),"Original Founder-authenticated review integration missing: "+required);
for(const required of [
  "Review with HIISSA","not a decision","onAssist(item.id,item.version)",
  "Use suggested wording — I will check it","Verify fictional practice record",
  "Request correction","Founder review reason (required)"
]) assert.ok(forms.includes(required),"Founder choice/source evidence missing: "+required);
assert.ok(core.includes('hiissa_staff_review_staging_founder_command'),
  "Retain canonical transactionally audited Founder final approval");
assert.ok(gate.includes("FOUNDER_GATE_REQUIRED")&&
 gate.includes('const STAGING_BRANCH="feature/founder-control-room-staging"'),
 "Retain original Founder/Staging gate");
assert.ok(registry.includes('id: "staff-trust-training-access-review"'),
 "Canonical Staff Trust Registry must remain attached");
console.log("PASS: Staging-only Founder HIISSA-assisted evidence draft follows original gate and sources; no auto-approval, no external certification; original final decision retained.");
console.log("NOT VERIFIED: model availability, real authenticated click, Founder acceptance, canonical assist audit persisted, complete Training Library.");
