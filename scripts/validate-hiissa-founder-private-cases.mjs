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
 '.insert(','.update(','.delete(','.rpc(', 'method:"POST"','sendEmail',
 'approveStaff','createUser', 'localStorage'
]) assert.ok(!executable.includes(bad),"Private screen must not access message/identity, mutate, grant role or persist token: "+bad);
has("Old-to-new Founder navigation",originalHost,[
 'Open private Founder case references (read-only Staging)',
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
console.log("PASS SOURCE: R193 private subview shares ORIGINAL aggregate Control Room, Registry and canonical incidents/Alerts; refuses fabricated monitoring.");
console.log("PASS SOURCE: R190 separate Founder-only private case page, existing read-only GET only.");
console.log("PASS SOURCE: original aggregate Founder dashboard and owned customer Support Save/Refresh retained.");
console.log("NOT VERIFIED: practical original Founder authenticated browser, 401/403/404/503, human support lifecycle or Production.");
