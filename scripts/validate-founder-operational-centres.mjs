// R90 independent regression gate for two original Founder-approved capabilities.
// A PASS here verifies static/privacy/source guards, NOT real end-to-end Founder testing.
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

for(const s of ["feature/founder-control-room-staging","upcssfmilewwshyxyvdf.supabase.co",'!=="production"',"admin_users","FOUNDER_GATE_REQUIRED",'limit(2)',"Bearer ","auth.getUser"])assert.ok(gateway.includes(s),"Staging or Founder gate missing "+s);
for(const [name,source] of [["customer",customer],["staff",staff]]){
  assert.ok(source.includes("operationalCentreStagingAllowed()"),name+" must fail closed outside Staging");
  assert.ok(source.includes("verifyOperationalCentreFounder(request)"),name+" must require Founder");
  assert.ok(source.includes('export async function GET('),name+" must be GET-only");
  assert.ok(!source.includes("export async function POST(")&&!source.includes('.insert(')&&!source.includes('.update(')&&!source.includes('.delete(')&&!source.includes('.rpc('),name+" may never mutate Staging");
  assert.ok(source.includes("hiissa_operational_incidents"),name+" must connect to canonical incident source");
  assert.ok(source.includes("SOURCE_UNAVAILABLE"),name+" must never mislabel missing data as empty/healthy");
  assert.ok(source.includes("productionEffectEnabled:false"),name+" must refuse Production effects");
}
for(const s of ["staff_work_items",'eq("workspace_id","customer_support")',"is_fictional","externalCustomerMessages:\"NOT_CONNECTED\"","automaticAcknowledgement:\"NOT_ACTIVE\"","originalAcknowledgementWording:\"RECOVERY_REQUIRED\"","humanResponseDeadline:\"RECONCILIATION_REQUIRED\"",'\"RECEIVED\"','\"WAITING_FOR_CUSTOMER\"'])assert.ok(customer.includes(s),"Customer design/data boundary missing: "+s);
for(const s of ["hiissa_employee_register","hiissa_staff_onboarding_applications","admin_role_assignments","admin_access_restrictions","NOT_CERTIFIED","NOT_CONNECTED","noOpaqueTrustScore:true","staffAccountChangesEnabled:false"])assert.ok(staff.includes(s),"Staff evidence/no-score boundary missing: "+s);
for(const s of ['id: "customer-communication-service-level-centre"','id: "staff-trust-training-access-review"',"approximately one minute after successful receipt","noOpaqueTrustScore: true"])assert.ok(registry.includes(s),"Historic approved Registry contract lost: "+s);
for(const s of ["Customer Communication & Service-Level Centre","Staff Trust, Training & Access Review","Back to Founder Control Room","Refresh verified evidence","NOT CONNECTED","No opaque trust score","No new customer message","No action has been taken","existing Founder Control Room","Source verification failed"])assert.ok(ui.includes(s),"Approved display/return/safety text missing: "+s);
assert.ok(customerPage.includes('if(process.env.VERCEL_ENV==="production")notFound();'));
assert.ok(staffPage.includes('if(process.env.VERCEL_ENV==="production")notFound();'));
assert.ok(host.includes("function FounderDailyBrief")&&host.includes("function FounderAlerts")&&host.includes('id="founder-alerts-panel"'),"Original Founder Control Room host/Alerts protection missing");
assert.ok(!ui.includes("localStorage")&&!ui.includes("setInterval")&&!ui.includes("window.confirm"),"No duplicate persistence, hidden poller or customer activation");
console.log("PASS: two read-only Founder operational centres, approved Registry identities, canonical incidents, privacy, honest missing-source states, return journeys and Production no-touch static contracts.");
console.log("NOT VERIFIED: Founder practical view, real authenticated endpoints, external customer messages or acknowledgement, real employee policies/training, full live service activation.");
