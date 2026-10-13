// HIISSA R185 mandatory prebuild: NEW genuine customer department-routing
// source + original staging intake / Founder privacy / host regression.
// SOURCE GUARDS only. No DB mutation, no Founder practical PASS certification.
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>readFileSync(p,"utf8");
const sql=read("supabase/migrations/20261013094500_customer_support_founder_department_route_staging.sql");
const api=read("app/api/admin/control-room/customer-communications/route-department/route.js");
const oldFounderApi=read("app/api/admin/control-room/customer-communications/route.js");
const existingSupport=read("app/api/support/requests/route.js");
const oldFounderView=read("app/admin/control-room/FounderOperationalCentreView.js");
const oldIntakeSql=read("supabase/migrations/20261012203100_hiissa_customer_support_authenticated_intake_staging.sql");
function requireText(name,src,terms){
 for(const term of terms)assert.ok(src.includes(term),name+": missing "+term);
}
requireText("Atomic Staging route migration",sql,[
 "create or replace function public.hiissa_customer_support_staging_route_department(",
 "security definer",
 "set search_path = ''",
 "if auth.role() is distinct from 'service_role'",
 "for update",
 "STAGING_SUPPORT_STALE_VERSION",
 "STAGING_SUPPORT_ALREADY_ROUTED",
 "STAGING_SUPPORT_STATE_NOT_ELIGIBLE",
 "v_item.lifecycle_state is distinct from 'RECEIVED'",
 "v_item.acknowledgement_state is distinct from 'NOT_SENT'",
 "v_item.external_effect_enabled is distinct from false",
 "assigned_department='customer_support'",
 "version=version+1",
 "insert into public.admin_audit_events",
 "'hiissa_customer_support_routed_staging'",
 "outwardDelivered',false",
 "'lifecycleState','RECEIVED'",
 "revoke all on function public.hiissa_customer_support_staging_route_department",
 "grant execute on function public.hiissa_customer_support_staging_route_department",
 "to service_role"
]);
assert.ok(!/\b(drop\s+|truncate\s+|delete\s+from\s+|alter\s+table\s+)/i.test(
  sql.split("\n").filter(s=>!s.trim().startsWith("--")).join("\n")),
  "Migration may not modify original table or delete historical data");
requireText("Founder-gated internal department route",api,[
 "operationalCentreStagingAllowed()",
 "verifyOperationalCentreFounder(request)",
 "request.headers.get(\"origin\")",
 "new URL(origin).origin!==new URL(request.url).origin",
 'body?.action!=="route_to_customer_support"',
 "UUID.test(String(body?.requestId||\"\"))",
 "Number.isSafeInteger(body?.version)",
 'founder.admin.rpc(',
 '"hiissa_customer_support_staging_route_department"',
 "p_founder:founder.founderUserId",
 'data?.status!=="RECORDED_AND_AUDITED"',
 "data?.externalDeliveryPerformed!==false",
 'productionEffectEnabled:false',
 '"Cache-Control":"private, no-store"'
]);
for(const forbidden of [
 ".insert(",".update(",".delete(","service_role_key","message_body",
 "sendEmail","emailTo","sendMessage","sendAcknowledgement",
 "new SupabaseClient","createClient("
])assert.ok(!api.includes(forbidden),"New route must not bypass existing gateway/outbound guard: "+forbidden);
requireText("PREEXISTING Founder AGGREGATE_ONLY dashboard",oldFounderApi,[
 'authenticatedIntakePrivacy:"AGGREGATE_ONLY"',
 'stagingAuthenticatedCustomerRequests:inboxTotal.count',
 'stagingAuthenticatedReceivedCount:inboxReceived.count',
 'stagingAuthenticatedAcknowledgementNotSent:inboxNotSent.count',
 "operationalCentreStagingAllowed()",
 "verifyOperationalCentreFounder(request)",
 'externalDeliveryEnabled:false'
]);
assert.ok(!oldFounderApi.includes("stagingAuthenticatedRecentRequests"),
  "Original Founder dashboard cannot reveal individually identifiable customer status");
requireText("Original Founder view unchanged aggregate status",oldFounderView,[
 "Authenticated Staging customer requests",
 "Received — awaiting safe processing",
 "Acknowledgements not sent",
 "CustomerPracticeActions",
 "StaffPracticeActions",
 "Open existing Founder Alerts and Activity Timeline"
]);
requireText("PREEXISTING authenticated intake source still secure",existingSupport,[
 "verifySignedInCustomer(request)",
 'eq("customer_user_id",gate.userId)',
 "hiissa_customer_support_staging_receive",
 "externalMessaging:false"
]);
requireText("PREEXISTING original customer receipt audit",oldIntakeSql,[
 "hiissa_customer_support_staging_receive",
 "insert into public.admin_audit_events",
 "unique(customer_user_id,client_nonce)"
]);
console.log("PASS: New Staging Founder-only department-routing RPC/API are audit-atomic, locked to customer_support and no delivery.");
console.log("PASS: Original Support receipt, aggregate-only Founder dashboard, staff host and protected case privacy remain guarded.");
console.log("NOT VERIFIED: actual Founder request routing, real staff assignment, acknowledgement delivery, SLA, full service lifecycle or Production.");
