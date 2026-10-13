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


// R188: defend new standalone PRIVATE selector and the existing aggregate-only
// Founder host TOGETHER on every future staging prebuild. Source checks do not
// certify signed-in browser access or human/staff workflow.
const privateSelector=read("app/api/admin/control-room/customer-communications/private-intake-selector/route.js");
requireText("Private Founder selector boundary",privateSelector,[
  "operationalCentreStagingAllowed()",
  "verifyOperationalCentreFounder(request)",
  '.from("hiissa_customer_support_inbox_staging")',
  '.select("id,version,lifecycle_state,acknowledgement_state,assigned_department,created_at")',
  '.eq("environment","staging")',
  '.limit(20)',
  "PRIVATE_STAGING_SELECTOR_READ_ONLY",
  'audience:"ORIGINAL_FOUNDER_ONLY"',
  "caseMetadataOnly:true",
  "acknowledgementEnabled:false",
  "responseDeadlineApproved:false",
  "staffAccessGranted:false",
  "externalDeliveryPerformed:false",
  "productionEffectEnabled:false",
  '"Cache-Control":"private, no-store"'
]);
for(const forbidden of [
  ".insert(", ".update(", ".delete(", ".rpc(", "message_body",
  'select("*")', "customer_user_id", "client_nonce", "sendEmail",
  "sendMessage", "createClient(", "SUPABASE_SECRET_KEY"
]){
  // These three field names appear exclusively in the comments explaining
  // why they must not even be fetched. Inspect executable lines only.
  const executable=privateSelector.split("\n").filter(line=>!line.trim().startsWith("//")).join("\n");
  assert.ok(!executable.includes(forbidden),"Private selector must remain metadata-only: "+forbidden);
}
assert.ok(!privateSelector.includes("export async function POST"),
  "Private selector cannot mutate or route cases");
assert.ok(!oldFounderApi.includes("stagingAuthenticatedRecentRequests"),
  "New private selector must never weaken the original Founder AGGREGATE_ONLY response");
console.log("PASS: R188 separate Founder-only STAGING metadata selector is read-only and excludes customer contents/identity.");
console.log("PASS: R188 selector remains separate from original Founder aggregate-only oversight; new + original host guarded together.");
console.log("NOT VERIFIED: practical Founder selector browser login, case routing, staff lifecycle, acknowledgement or Production.");

// R190: mandatory old+new Founder-only private case UI and original-host regression.
await import("./validate-hiissa-founder-private-cases.mjs");

// R201: ORIGINAL Founder target and protective OLD+NEW executable UTC/time-zone regression.
await import("./validate-hiissa-human-response-target-staging.mjs");

// R203: source protection for original-case Founder-only reply drafts with NO send.
await import("./validate-hiissa-customer-reply-draft-staging.mjs");

// R205: existing HIISSA AI reuses original Founder/Support case and canonical approval.
await import("./validate-hiissa-customer-existing-ai-founder-approval-staging.mjs");
