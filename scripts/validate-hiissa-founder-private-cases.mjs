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
console.log("PASS SOURCE: R190 separate Founder-only private case page, existing read-only GET only.");
console.log("PASS SOURCE: original aggregate Founder dashboard and owned customer Support Save/Refresh retained.");
console.log("NOT VERIFIED: practical original Founder authenticated browser, 401/403/404/503, human support lifecycle or Production.");
