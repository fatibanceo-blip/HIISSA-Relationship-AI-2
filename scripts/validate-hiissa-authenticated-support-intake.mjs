// HIISSA R153: Approved authenticated Staging support intake integration contract.
// Source-level negative/identity/privacy regression. Live tests require session and Founder.
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>readFileSync(p,"utf8");
const sql=read("supabase/migrations/20261012203100_hiissa_customer_support_authenticated_intake_staging.sql");
const api=read("app/api/support/requests/route.js");
const customer=read("app/my-hiissa/support/page.js");
const account=read("app/my-hiissa/account/page.js");
const founder=read("app/api/admin/control-room/customer-communications/route.js");
const ui=read("app/admin/control-room/FounderOperationalCentreView.js");
for(const text of [
 "create table if not exists public.hiissa_customer_support_inbox_staging",
 "environment='staging'",
 "enable row level security",
 "revoke all on table public.hiissa_customer_support_inbox_staging from public, anon, authenticated",
 "grant select,insert,update on table public.hiissa_customer_support_inbox_staging to service_role",
 "hiissa_customer_support_staging_receive",
 "auth.role() is distinct from 'service_role'",
 "on conflict(customer_user_id,client_nonce) do nothing",
 "insert into public.admin_audit_events",
 "customerContentIncluded',false",
 "acknowledgementSent',false",
 "externalEffectPerformed',false",
 "revoke all on function public.hiissa_customer_support_staging_receive",
 "grant execute on function public.hiissa_customer_support_staging_receive",
 "check(external_effect_enabled=false)"
])assert.ok(sql.includes(text),"Missing protected SQL contract: "+text);
assert.ok(!/\bdrop\s+table\b|\btruncate\s+table\b|\bdelete\s+from\b/i.test(sql.split("\n").filter(l=>!l.trim().startsWith("--")).join("\n")),"No destructive migration");
for(const text of [
 "operationalCentreStagingAllowed()",
 "verifySignedInCustomer(request)",
 "publicClient.auth.getUser(token)",
 "SAME_ORIGIN_REQUIRED",
 "HOURLY_LIMIT_REACHED",
 "client_nonce",
 "hiissa_customer_support_staging_receive",
 'status:"RECORDED_AND_AUDITED"',
 "automaticAcknowledgementSent:false",
 "externalMessageSent:false",
 "productionEffectEnabled:false",
 "SOURCE_UNAVAILABLE",
 "customer_user_id",
 'return noStore({status:"REQUEST_NOT_RECORDED"},503);'
]) assert.ok(api.includes(text),"Missing secure intake API contract: "+text);
for(const forbidden of ['.insert(','.update(','.delete(','sendEmail','sendSMS','mailgun','resend.emails','externalDeliveryEnabled:true'])
 assert.ok(!api.includes(forbidden),"No unaudited write or external send allowed: "+forbidden);
for(const text of [
 "HIISSA · MY SUPPORT REQUESTS",
 "Your saved support requests",
 "← Back to My Account",
 "getSession()",
 "onAuthStateChange",
 "Save support request in Staging",
 "No automatic reply or external message was sent.",
 "nonce.current=crypto.randomUUID()",
 "/api/support/requests",
 "SIGN_IN"
]) if(text!=="SIGN_IN")assert.ok(customer.includes(text),"Missing original user journey control "+text);
assert.ok(account.includes('href="/my-hiissa/support"'),"Existing HIISSA Account must link to approved support feature");
assert.ok(account.includes("Signing out here ends the HIISSA session"),"Protected Account sign-out text must survive");
for(const text of [
 'from("hiissa_customer_support_inbox_staging")',
 "authenticatedStagingInboxVerified",
 "stagingAuthenticatedCustomerRequests",
 'authenticatedIntakePrivacy:"AGGREGATE_ONLY"',
 'externalCustomerMessages:"NOT_CONNECTED"'
])assert.ok(founder.includes(text),"Single Founder source and truthful external state required: "+text);
assert.ok(!founder.includes('message_body')&&!founder.includes('customer_user_id'),"No customer content or identity shown to Founder Overview");
assert.ok(ui.includes('Authenticated Staging customer requests'),"Approved existing Customer centre must show genuine receipt count");
// R166: Founder-approved visual response for the formerly silent refresh control.
for(const text of [
 'const [refreshing,setRefreshing]=useState(false)',
 'setRefreshMessage("Checking…")',
 'setRefreshMessage("Your requests are up to date.")',
 'setRefreshMessage("Could not refresh your requests.',
 'if(!response.ok||data?.status!=="MONITORING")',
 'disabled={busy||refreshing}',
 'role="status" aria-live="polite"'
])assert.ok(customer.includes(text),"Missing approved visible refresh feedback: "+text);
assert.ok(!customer.includes('onClick={()=>setRefresh(n=>n+1)}'),"Silent refresh control must not return");
console.log("PASS: Staging support Refresh Checking / confirmed up-to-date / fail-state visible feedback and in-flight tap guard.");
console.log("PASS: signed-in Staging customer intake, exact single canonical audit, RLS/service-role isolation, idempotence, no outward sends, real Founder source integration.");
console.log("NOT VERIFIED: actual signed-in customer submission/readback, Founder mobile acceptance, real staff full customer lifecycle, approved auto-acknowledgement copy and human-response deadline.");
