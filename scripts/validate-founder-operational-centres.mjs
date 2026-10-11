// R95 extended regression gate for two original Founder-approved active Staging practice workflows.
// A PASS verifies source-level Staging guards and action intent, NOT real Founder end-to-end acceptance.
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=path=>readFileSync(path,"utf8");
const gateway=read("lib/admin/founder-staging-operational-centres.js");
const customer=read("app/api/admin/control-room/customer-communications/route.js");
const staff=read("app/api/admin/control-room/staff-trust-review/route.js");
const ui=read("app/admin/control-room/FounderOperationalCentreView.js");
const customerPage=read("app/admin/control-room/customer-communications/page.js");
const staffPage=read("app/admin/control-room/staff-trust-review/page.js");
const registry=read("lib/experience-registry.js");
const host=read("app/admin/control-room-preview/page.js");
const forms=read("app/admin/control-room/FounderPracticeActions.js");
const migration=read("supabase/migrations/20261011203000_founder_operational_centres_staging_actions.sql");

for(const s of ["feature/founder-control-room-staging","upcssfmilewwshyxyvdf.supabase.co",'!=="production"',"admin_users","FOUNDER_GATE_REQUIRED",'limit(2)',"Bearer ","auth.getUser"])assert.ok(gateway.includes(s),"Staging or Founder gate missing "+s);
for(const [name,source] of [["customer",customer],["staff",staff]]){
  assert.ok(source.includes("operationalCentreStagingAllowed()"),name+" must fail closed outside Staging");
  assert.ok(source.includes("verifyOperationalCentreFounder(request)"),name+" must require Founder");
  assert.ok(source.includes('export async function GET('),name+" must retain authenticated source-truth GET");
  assert.ok(source.includes("export async function POST("),name+" must implement actual Founder working Staging actions");
  assert.ok(source.includes('request.headers.get("origin")'),name+" must require same-origin write");
  assert.ok(source.includes('new URL(origin).origin!==new URL(request.url).origin'),name+" must reject cross-origin writes");
  assert.ok(source.includes("SAME_ORIGIN_REQUIRED"),name+" must reject unknown origin");
  assert.ok(source.includes("founder.founderUserId"),name+" must attribute actor to verified Founder");
  assert.ok(source.includes("STALE_RECORD_REFRESH"),name+" must fail closed on stale write");
  assert.ok(source.includes('status:"RECORDED_AND_AUDITED"'),name+" must only claim success after atomic action+audit RPC");
  assert.ok(!source.includes('.insert(')&&!source.includes('.update(')&&!source.includes('.delete('),name+" must not bypass audited functions with ad hoc writes");
  assert.ok(source.includes("hiissa_operational_incidents"),name+" must connect to canonical incident source");
  assert.ok(source.includes("SOURCE_UNAVAILABLE"),name+" must never mislabel missing data as empty/healthy");
  assert.ok(source.includes("productionEffectEnabled:false"),name+" must refuse Production effects");
}
for(const s of ["staff_work_items",'eq("workspace_id","customer_support")',"is_fictional","externalCustomerMessages:\"NOT_CONNECTED\"","automaticAcknowledgement:\"NOT_ACTIVE\"","originalAcknowledgementWording:\"RECOVERY_REQUIRED\"","humanResponseDeadline:\"RECONCILIATION_REQUIRED\"",'\"RECEIVED\"','\"WAITING_FOR_CUSTOMER\"'])assert.ok(customer.includes(s),"Customer design/data boundary missing: "+s);
for(const s of ["hiissa_employee_register","hiissa_staff_onboarding_applications","admin_role_assignments","founder_staff_access_inventory","NOT_CERTIFIED","NOT_CONNECTED","noOpaqueTrustScore:true","staffAccountChangesEnabled:false"])assert.ok(staff.includes(s),"Staff evidence/no-score boundary missing: "+s);
for(const s of ['id: "customer-communication-service-level-centre"','id: "staff-trust-training-access-review"',"approximately one minute after successful receipt","noOpaqueTrustScore: true"])assert.ok(registry.includes(s),"Historic approved Registry contract lost: "+s);
for(const s of ["Customer Communication & Service-Level Centre","Staff Trust, Training & Access Review","Back to Founder Control Room","Refresh verified evidence","NOT CONNECTED","No opaque trust score","Founder-only Staging practice actions","No action has been taken","existing Founder Control Room","Source verification failed"])assert.ok(ui.includes(s),"Approved display/return/safety text missing: "+s);
assert.ok(customerPage.includes('if(process.env.VERCEL_ENV==="production")notFound();'));
assert.ok(staffPage.includes('if(process.env.VERCEL_ENV==="production")notFound();'));
assert.ok(host.includes("function FounderDailyBrief")&&host.includes("function FounderAlerts")&&host.includes('id="founder-alerts-panel"'),"Original Founder Control Room host/Alerts protection missing");
assert.ok(!ui.includes("localStorage")&&!ui.includes("setInterval")&&!ui.includes("window.confirm"),"No duplicate persistence, hidden poller or customer activation");
for(const s of ["hiissa_support_request_staging","hiissa_support_staging_founder_command",'["create","assign","save_internal_note"]',"automaticAcknowledgementSent:false","externalDeliveryPerformed:false"])assert.ok(customer.includes(s),"Customer working-action/strict delivery boundary missing: "+s);
for(const s of ["hiissa_staff_review_staging","hiissa_staff_review_staging_founder_command",'["record","verify_practice","request_correction"]',"HIISSA_PROTOTYPE_STAFF.some","realStaffCertificationPerformed:false","permissionsChanged:false"])assert.ok(staff.includes(s),"Staff working-action/real-staff non-effect missing: "+s);
for(const s of ["CustomerPracticeActions","StaffPracticeActions",'method:"POST"',"Saved in Staging with a matching Admin audit event.","Not saved:","setRevision(n=>n+1)"])assert.ok(ui.includes(s),"UI must perform actual action and visible result: "+s);
for(const s of ["Create and save practice request","Assign to Customer Support","Save internal note","Record and save practice evidence","Verify fictional practice record","Request correction","onAction","disabled={busy"])assert.ok(forms.includes(s),"Interactive form action missing: "+s);
for(const s of ["create table if not exists public.hiissa_support_request_staging","create table if not exists public.hiissa_staff_review_staging","enable row level security","revoke all","to service_role","insert into public.admin_audit_events","p_version is distinct from v_row.version","APPROVED_COPY_NOT_RECOVERED"])assert.ok(migration.includes(s),"Staging DB access/audit/version/acknowledgement contract missing: "+s);
assert.ok(!/\bdrop\s+table\b|\btruncate\s+table\b|\bdelete\s+from\b/i.test(migration.split("\n").filter(line=>!line.trim().startsWith("--")).join("\n")),"Staging migration must be additive");

// R99 Founder-authorised diagnosis: protect exact original security, both legacy routes,
// and only the new Staff page's safe fixed source/error classification.
for(const token of [
  "STAFF_DIAGNOSTIC_SOURCES",
  "STAFF-SOURCE AUTH-401",
  "STAFF-SOURCE ACCESS-403",
  "STAFF-SOURCE STAGING-404",
  "STAFF-SOURCE CONFIG-503",
  "STAFF-SOURCE READ-503",
  "STAFF-SOURCE REQUEST-503",
  "STAFF-SOURCE SERVER-",
  "STAFF-SOURCE RESPONSE-",
  "describeStaffSourceFailure(response.status,data)",
  "Object.prototype.hasOwnProperty.call(STAFF_DIAGNOSTIC_SOURCES,value)",
  "if(!customer)throw"
])assert.ok(ui.includes(token),"Staff exact-safe diagnostic is missing "+token);
for(const token of [
  "SOURCE_UNAVAILABLE", "unverifiedSources:missing",
  "SOURCE_READ_FAILED", "verifyOperationalCentreFounder(request)",
  "operationalCentreStagingAllowed()", "founder.ok",
  "productionEffectEnabled:false"
])assert.ok(staff.includes(token),"Staff secure fail-closed source diagnostic missing "+token);
assert.ok(!ui.includes("data.error.message")&&!staff.includes("error.message}"),"Raw backend error details must never be rendered");
assert.ok(staff.includes('founder.admin.rpc("founder_staff_access_inventory")'),"Reuse exact existing authorised Founder access inventory");
assert.ok(!staff.includes('from("admin_access_restrictions")'),"Do not query the existing protected access restriction table directly");
assert.ok(staff.includes('accessRestrictionsSource:"EXISTING_FOUNDER_ACCESS_INVENTORY"'),"Original access inventory provenance must be explicit");
assert.ok(staff.includes('recordedAccessRestrictions:null'),"Do not misrepresent current inventory count as historical restrictions");
assert.ok(staff.includes("currentRestrictedStaffCount:"), "Provide current restricted staff aggregate only");
assert.ok(staff.includes('r.access_state!=="active"'),"Current restricted staff count must use existing authorised access state");
console.log("PASS: Staff restrictions now use original authorised Founder access inventory; protected table grants unchanged; source-truth aggregate preserved.");
console.log("PASS: Staff source failure classified in secure Founder UI; original Staging-only and permissions controls retained. Real Founder fix verification remains pending.");

console.log("PASS: two Founder active Staging practice workflows source-constrained, audit+RLS, original Registry identities, canonical incidents, visible saved outcomes, protected Control Room and no Production effect.");
console.log("NOT VERIFIED: Founder practical POST+GET flow, real authenticated persistence test, customer receipt/outbound acknowledgement, actual human-response SLA, real employee policy/training certifications, full original feature completion.");
