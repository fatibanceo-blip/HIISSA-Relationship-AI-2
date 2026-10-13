// HIISSA R190: additive, source-level OLD+NEW regression guard for the Founder
// private case references page. Does NOT certify browser access or service actions.
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=path=>readFileSync(path,"utf8");
const page=read("app/admin/control-room/customer-communications/private-cases/page.js");
const screen=read("app/admin/control-room/customer-communications/private-cases/FounderPrivateCases.js");
const selector=read("app/api/admin/control-room/customer-communications/private-intake-selector/route.js");
const originalHost=read("app/admin/control-room/FounderOperationalCentreView.js");
const originalAggregate=read("app/api/admin/control-room/customer-communications/route.js");
const protectedCustomer=read("app/api/support/requests/route.js");
const existingFounderGate=read("lib/admin/founder-staging-operational-centres.js");
function has(label,code,terms){for(const term of terms)assert.ok(code.includes(term),label+": missing "+term);}
has("New staging route",page,[
 'if(process.env.VERCEL_ENV==="production")notFound();',
 'FounderPrivateCases','dynamic="force-dynamic"'
]);
has("Private Founder metadata-only screen",screen,[
 'import {createClient} from "@supabase/supabase-js";', 'browserClient=createClient(url,key)',
 'reason.name="FounderSignInRequired"', 'state.needsSignIn?"SIGN IN REQUIRED"',
 'href="/admin/login"',
 'existingSessionClient()', 'client.auth.getSession()', 'Authorization:"Bearer "+data.session.access_token',
 'API="/api/admin/control-room/customer-communications/private-intake-selector"',
 'body?.status!=="PRIVATE_STAGING_SELECTOR_READ_ONLY"',
 'body?.audience!=="ORIGINAL_FOUNDER_ONLY"',
 'body?.caseMetadataOnly!==true','body?.productionEffectEnabled!==false',
 'body?.externalDeliveryPerformed!==false','!Array.isArray(body?.items)',
 'body.items.length>20','controller.abort()','cache:"no-store"',
 'formatHiissaGlobalRecordTime(item.receivedAt)',
 'state.verified&&state.items.length===0',
 'state.more','Founder Overview', 'role="alert"',
 'case references','read-only','← Back to Customer Communication Centre'
]);
const executable=screen.split("\n").filter(l=>!l.trim().startsWith("//")).join("\n");
assert.ok(!screen.includes("createBrowserClient")&&!screen.includes('from "@supabase/ssr"'),
  "New private page must reuse ORIGINAL Founder login session, not a different SSR cookie store.");
for(const bad of [
 'subject','message_body','customer_user_id','client_nonce',
 '.insert(','.update(','.delete(','.rpc(', 'sendEmail',
 'approveStaff','createUser', 'localStorage'
]) assert.ok(!executable.includes(bad),"Private screen must not access message/identity, mutate, grant role or persist token: "+bad);
has("Old-to-new Founder navigation",originalHost,[
 'Open private Founder case handling (Staging)',
 'href="/admin/control-room/customer-communications/private-cases"',
 'CustomerPracticeActions','StaffPracticeActions',
 'Authenticated Staging customer requests',
 'Open existing Founder Alerts and Activity Timeline'
]);
has("Original aggregate-only Founder privacy",originalAggregate,[
 'authenticatedIntakePrivacy:"AGGREGATE_ONLY"',
 'stagingAuthenticatedCustomerRequests:inboxTotal.count',
 'externalDeliveryEnabled:false'
]);
assert.ok(!originalAggregate.includes("stagingAuthenticatedRecentRequests"),
 "No individual private customer detail may enter original aggregate Founder dashboard");
has("Original customer intake and Save/Refresh ownership",protectedCustomer,[
 'verifySignedInCustomer(request)',
 'eq("customer_user_id",gate.userId)',
 'hiissa_customer_support_staging_receive',
 'externalMessaging:false'
]);
has("Existing Founder identity",existingFounderGate,[
 'operationalCentreStagingAllowed()',
 'verifyOperationalCentreFounder(request)',
 '.from("admin_users").select("user_id").limit(2)'
]);
has("Secure existing metadata selector",selector,[
 'operationalCentreStagingAllowed()','verifyOperationalCentreFounder(request)',
 'select("id,version,lifecycle_state,acknowledgement_state,assigned_department,created_at")',
 'eq("environment","staging")','limit(20)',
 'caseMetadataOnly:true', 'staffAccessGranted:false','externalDeliveryPerformed:false'
]);
// R193 canonical shared source: add-on must use the ORIGINAL protected
// aggregate oversight and Registry, not its own operational duplicate.
has("Original Founder control integration",screen,[
 'REGISTRY_ID="customer-communication-service-level-centre"',
 'ORIGINAL_OVERSIGHT="/api/admin/control-room/customer-communications"',
 'body?.registryId!==REGISTRY_ID',
 'oldBody?.registryId!==REGISTRY_ID',
 'oldBody?.authenticatedIntakePrivacy!=="AGGREGATE_ONLY"',
 'oldBody?.canonicalIncidentFeedVerified!==true',
 'oldBody?.existingFounderApprovalInbox!=="REUSED_NOT_DUPLICATED"',
 'oldBody?.existingAlerts!=="REUSED_NOT_DUPLICATED"',
 'oldBody?.productionEffectEnabled!==false',
 '!Number.isSafeInteger(oldBody?.openIncidentCount)',
 'oversightError="Original Founder monitoring could not be verified.',
 'Incident counts are unknown',
 'Original Founder Alerts and Activity Timeline',
 'state.oversight?',
 'One Customer Communication Centre',
 'formatHiissaGlobalRecordTime(state.oversight.checkedAt)'
]);
has("Old Founder aggregate actually owns canonical monitoring",originalAggregate,[
 'registryId:"customer-communication-service-level-centre"',
 'canonicalIncidentFeedVerified:true',
 'openIncidentCount:',
 'existingFounderApprovalInbox:"REUSED_NOT_DUPLICATED"',
 'existingAlerts:"REUSED_NOT_DUPLICATED"'
]);
assert.ok(!screen.includes('.from("hiissa_operational_incidents")') &&
  !screen.includes('.from("admin_audit_events")') &&
  !screen.includes('.from("admin_approval_requests")'),
  "No duplicate incident/audit/approval direct reads in private page");
// R195: The existing protected Founder case subview now offers a deliberate
// TWO-STEP, Founder-confirmed Staging-only route via pre-existing R185 API;
// original read-only selector and aggregate monitoring remain unchanged.
const route=read("app/api/admin/control-room/customer-communications/route-department/route.js");
const sql=read("supabase/migrations/20261013094500_customer_support_founder_department_route_staging.sql");
has("Existing restricted audit-atomic route API",route,[
 'operationalCentreStagingAllowed()',
 'verifyOperationalCentreFounder(request)',
 'request.headers.get("origin")',
 'body?.action!=="route_to_customer_support"',
 'hiissa_customer_support_staging_route_department',
 'p_founder:founder.founderUserId',
 'p_expected_version:body.version',
 'status:"RECORDED_AND_AUDITED"',
 'externalDeliveryPerformed:false',
 'productionEffectEnabled:false'
]);
has("Existing fixed action audited database transaction",sql,[
 "if auth.role() is distinct from 'service_role'",
 "for update",
 "STAGING_SUPPORT_STALE_VERSION",
 "STAGING_SUPPORT_ALREADY_ROUTED",
 "STAGING_SUPPORT_STATE_NOT_ELIGIBLE",
 "v_item.lifecycle_state is distinct from 'RECEIVED'",
 "v_item.acknowledgement_state is distinct from 'NOT_SENT'",
 "assigned_department='customer_support'",
 "version=version+1",
 "insert into public.admin_audit_events",
 "'hiissa_customer_support_routed_staging'",
 "'lifecycleState','RECEIVED'",
 "'acknowledgementSent',false",
 "'outwardDelivered',false",
 "to service_role"
]);
has("Founder-confirmed two-step routing on SAME private subview",screen,[
 'ROUTE_ACTION="/api/admin/control-room/customer-communications/route-department"',
 'const [routeReviewId,setRouteReviewId]=useState(null)',
 'const [routeBusy,setRouteBusy]=useState(false)',
 'const routeVerification=useRef(null)',
 'function routingAllowed(item)',
 'state.verified&&!state.loading',
 'item?.lifecycleState==="RECEIVED"',
 'item?.acknowledgementState==="NOT_SENT"',
 '!item?.assignedDepartment',
 'routeReviewId!==item.requestId)return',
 'client.auth.getSession()',
 'method:"POST",cache:"no-store",credentials:"same-origin"',
 '"Authorization":"Bearer "+data.session.access_token',
 'action:"route_to_customer_support"',
 'requestId:item.requestId',
 'version:item.version',
 'result?.status!=="RECORDED_AND_AUDITED"',
 'result?.externalDeliveryPerformed!==false',
 'result?.productionEffectEnabled!==false',
 'result?.version!==item.version+1',
 'routeVerification.current={id:item.requestId,version:result.version}',
 'match.assignedDepartment==="customer_support"',
 'match.version===expected.version',
 'Cancel — leave case unchanged',
 'Confirm internal routing in Staging',
 'Review internal route to Customer Support',
 'do not repeat the action until its status is clear',
 'not assign an employee'
]);
const allFetchUrls=[...screen.matchAll(/(?:const (?:API|ORIGINAL_OVERSIGHT|ROUTE_ACTION|DRAFT_ACTION))="([^"]+)"/g)].map(m=>m[1]);
assert.deepEqual(allFetchUrls,[
 "/api/admin/control-room/customer-communications/private-intake-selector",
 "/api/admin/control-room/customer-communications",
 "/api/admin/control-room/customer-communications/route-department",
 "/api/admin/control-room/customer-communications/reply-draft"
],"Only canonical private GET, aggregate GET, audited internal route and protected reply draft within SAME original Centre");
assert.ok(!screen.includes('window.confirm')&&!screen.includes('setInterval'),
 "New Founder confirmation stays within current page; no hidden poller or browser confirm");
assert.ok(!route.includes('sendMessage')&&!route.includes('sendAcknowledgement')&&!route.includes('.update('),
 "Internal route API cannot send external messages or bypass existing RPC");
console.log("PASS SOURCE: R195 two deliberate Founder clicks, original session, approved audit-atomic internal-only route, independent saved-version recheck, prior hosts protected.");
console.log("NOT VERIFIED: Founder practical route POST/GET and exact-one audit after action; no case has been routed by building this UI.");
console.log("PASS SOURCE: R193 private subview shares ORIGINAL aggregate Control Room, Registry and canonical incidents/Alerts; refuses fabricated monitoring.");
console.log("PASS SOURCE: R190 separate Founder-only private case page, existing read-only GET only.");
console.log("PASS SOURCE: original aggregate Founder dashboard and owned customer Support Save/Refresh retained.");
console.log("NOT VERIFIED: practical original Founder authenticated browser, 401/403/404/503, human support lifecycle or Production.");
