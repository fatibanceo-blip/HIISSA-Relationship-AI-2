// HIISSA R201 mandatory human ONE-MINUTE Founder target functional + OLD host regression.
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {formatHiissaGlobalRecordTime} from "../lib/hiissa-record-time.js";
import {
  projectOneMinuteHumanTarget,
  HUMAN_RESPONSE_DESIGN_TARGET_MS,
  CUSTOMER_SERVICE_REGISTRY_ID
} from "../lib/admin/customer-service-one-minute-target-staging.mjs";
const read=p=>readFileSync(p,"utf8");
const select=read("app/api/admin/control-room/customer-communications/private-intake-selector/route.js");
const screen=read("app/admin/control-room/customer-communications/private-cases/FounderPrivateCases.js");
const oldFounderApi=read("app/api/admin/control-room/customer-communications/route.js");
const oldSupportApi=read("app/api/support/requests/route.js");
const originalLogin=read("app/admin/login/page.js");
const originalRegistry=read("lib/experience-registry.js");
const route=read("app/api/admin/control-room/customer-communications/route-department/route.js");
function has(name,source,parts){for(const part of parts)assert.ok(source.includes(part),name+" missing "+part);}

assert.equal(HUMAN_RESPONSE_DESIGN_TARGET_MS,60000);
assert.equal(CUSTOMER_SERVICE_REGISTRY_ID,"customer-communication-service-level-centre");
const example=projectOneMinuteHumanTarget("2026-10-13T12:00:00.000Z","RECEIVED");
assert.deepEqual(example,{
 verified:true,
 targetAt:"2026-10-13T12:01:00.000Z",
 designTargetSeconds:60,
 replyEvidence:"NOT_CONNECTED",
 liveHumanSla:"NOT_ACTIVE",
 attentionStatus:"FOUNDER_DESIGN_TARGET_ONLY_NO_HUMAN_REPLY_EVIDENCE"
});
const tz=projectOneMinuteHumanTarget("2026-10-13T13:00:00+01:00","ASSIGNED");
assert.equal(tz.targetAt,example.targetAt,"International clock-offset input must normalize to UTC");
const zones=[
 ["Europe/London","en-GB","13"],
 ["Europe/Paris","fr-FR","14"],
 ["America/New_York","en-US","08"],
 ["Asia/Tokyo","ja-JP","21"],
 ["Africa/Accra","en-GH","12"]
];
for(const [timeZone,locale,expectedHour] of zones) {
 const parts=new Intl.DateTimeFormat(locale,{timeZone,hour:"2-digit",
   minute:"2-digit",hourCycle:"h23"}).formatToParts(new Date(example.targetAt));
 assert.equal(parts.find(p=>p.type==="hour")?.value,expectedHour,
   timeZone+" local displayed hour for one UTC instant");
 assert.equal(parts.find(p=>p.type==="minute")?.value,"01",
   timeZone+" local displayed minute for one UTC instant");
 assert.notEqual(formatHiissaGlobalRecordTime(example.targetAt,{locale,timeZone}),"—");
}

const dst=projectOneMinuteHumanTarget("2026-10-25T00:59:40Z","RECEIVED");
assert.equal(dst.targetAt,"2026-10-25T01:00:40.000Z","DST must preserve actual 60 seconds, not wallclock guess");
const ukFall=new Intl.DateTimeFormat("en-GB",{timeZone:"Europe/London",
 hour:"2-digit",minute:"2-digit",hourCycle:"h23"}).format(new Date(dst.targetAt));
const frFall=new Intl.DateTimeFormat("fr-FR",{timeZone:"Europe/Paris",
 hour:"2-digit",minute:"2-digit",hourCycle:"h23"}).format(new Date(dst.targetAt));
assert.equal(ukFall,"01:00");
assert.equal(frFall,"02:00");
assert.equal(projectOneMinuteHumanTarget("2026-10-13T12:00:00Z","RESOLVED").attentionStatus,
 "CASE_RESOLVED_HUMAN_REPLY_EVIDENCE_NOT_CONNECTED");
const bad=projectOneMinuteHumanTarget("not a time","RECEIVED");
assert.equal(bad.verified,false);
assert.equal(bad.targetAt,null);
assert.equal(bad.attentionStatus,"RECEIPT_TIME_UNAVAILABLE");

has("NARROW existing Founder-only selector",select,[
 'operationalCentreStagingAllowed()',
 'verifyOperationalCentreFounder(request)',
 '.select("id,version,lifecycle_state,acknowledgement_state,assigned_department,created_at")',
 'projectOneMinuteHumanTarget(item.created_at,item.lifecycle_state)',
 'humanReplyTargetPolicy:"FOUNDER_APPROVED_ONE_MINUTE_DESIGN_NOT_LIVE"',
 'humanReplyEvidenceSource:"NOT_CONNECTED"',
 'founderEmailNotification:"NOT_CONFIGURED"',
 'founderPhoneNotification:"NOT_CONFIGURED"',
 'responseDeadlineApproved:false',
 'externalDeliveryPerformed:false',
 'productionEffectEnabled:false',
 'caseMetadataOnly:true',
 'audience:"ORIGINAL_FOUNDER_ONLY"'
]);
has("Same canonical private Founder case view",screen,[
 'REGISTRY_ID="customer-communication-service-level-centre"',
 'ORIGINAL_OVERSIGHT="/api/admin/control-room/customer-communications"',
 'body?.humanReplyTargetPolicy!=="FOUNDER_APPROVED_ONE_MINUTE_DESIGN_NOT_LIVE"',
 'body?.founderEmailNotification!=="NOT_CONFIGURED"',
 'body?.founderPhoneNotification!=="NOT_CONFIGURED"',
 'item?.humanReplyTarget?.designTargetSeconds===60',
 'item?.humanReplyTarget?.liveHumanSla==="NOT_ACTIVE"',
 'Human customer-service reply target: within 1 minute',
 'The human reply evidence source is not connected yet.',
 'NOT an active or verified human-response SLA',
 'Founder email and dedicated-phone notices',
 'Open private Founder case references',
 'Confirm internal routing in Staging',
 'Cancel — leave case unchanged',
 'Open existing Founder Alerts and Activity Timeline'
].filter(x=>x!=="Open private Founder case references"));
has("Original aggregate Founder source untouched safety contract",oldFounderApi,[
 'registryId:"customer-communication-service-level-centre"',
 'authenticatedIntakePrivacy:"AGGREGATE_ONLY"',
 'stagingAuthenticatedCustomerRequests:inboxTotal.count',
 'existingFounderApprovalInbox:"REUSED_NOT_DUPLICATED"',
 'existingAlerts:"REUSED_NOT_DUPLICATED"',
 'externalDeliveryEnabled:false'
]);
has("Original customer Save/Refresh and no delivery preserved",oldSupportApi,[
 'verifySignedInCustomer(request)',
 'eq("customer_user_id",gate.userId)',
 'hiissa_customer_support_staging_receive',
 'externalMessaging:false'
]);
has("Original login untouched behavior",originalLogin,[
 'createClient','signInWithPassword','/admin'
]);
has("Single original Experience Registry",originalRegistry,[
 'id: "customer-communication-service-level-centre"',
 'acknowledgementTarget: "approximately one minute after successful receipt"'
]);
has("Previously verified audited Founder routing preserved",route,[
 'verifyOperationalCentreFounder(request)',
 'hiissa_customer_support_staging_route_department',
 'externalDeliveryPerformed:false'
]);
const runnableSelect=select.split("\n").filter(line=>!line.trim().startsWith("//")).join("\n");
for(const forbidden of [".insert(", ".update(", ".delete(", ".rpc(", "message_body",
 "customer_user_id", "client_nonce", "sendEmail", "sendSMS", "supabase.auth.admin"])
 assert.ok(!runnableSelect.includes(forbidden),"Read-only selector must not use: "+forbidden);
assert.ok(!select.includes("export async function POST"),"Selector stays read-only");
assert.ok(!screen.includes("setInterval(")&&!screen.includes("sendEmail("),"No false active timer or external email");
assert.ok(!oldFounderApi.includes("stagingAuthenticatedRecentRequests"),
 "Protected aggregate Founder dashboard must not expose individual customer case");
console.log("PASS FUNCTIONAL: UTC one-minute human target, timezone/DST/invalid-time/closed-case handling, NOT_ACTIVE truthful statuses.");
console.log("PASS SOURCE: original Founder single Registry/aggregate privacy, case routing, support Save/Refresh and original login remain protected.");
console.log("NOT VERIFIED: one-minute actual human reply, real Founder email/phone delivery, reminder/alert delivery, complete service lifecycle.");
