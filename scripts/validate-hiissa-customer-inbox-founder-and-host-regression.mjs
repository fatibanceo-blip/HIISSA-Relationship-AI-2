// HIISSA R180 — Founder mandatory NEW feature + EXISTING host combined regression.
// Source-level guard; it DOES NOT replace real browser / authenticated API / end-to-end tests.
// All checks fail closed before Next.js staging build. No auth/Production side effects.
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {createHash} from "node:crypto";
const read=p=>readFileSync(p,"utf8");
const gitBlob=p=>{
  const b=readFileSync(p);
  return createHash("sha1").update(Buffer.from("blob "+b.length+"\0")).update(b).digest("hex");
};
const unchangedHost=Object.freeze({
  "app/admin/control-room-preview/page.js":"25aaf38be6a5a754ec44cacc2e49108ab2d3a6e6",
  "app/admin/control-room-preview/FounderOperationalCentresDashboard.js":"5e93e24c654893216fe6e203254076f54aada447",
  "app/admin/control-room/FounderPracticeActions.js":"b8ed00fcac964040542cea8b7ac5d5d6eeea9605",
  "app/api/admin/control-room/staff-trust-review/route.js":"a64e788601b68002982865ad1bf9ed4e594db793"
});
for(const [file,expected] of Object.entries(unchangedHost)){
  assert.equal(gitBlob(file),expected,"Existing working host/dependent source unexpectedly changed: "+file+
    ". Review exact Founder approval, test host and new feature together, then deliberately update baseline.");
}
const client=read("app/admin/control-room/FounderOperationalCentreView.js");
const start=client.indexOf("function StaffContent(");
const end=client.indexOf("function Metric(");
assert.ok(start>=0&&end>start,"Original staff/Founder component boundary lost");
const staffPart=client.slice(start,end);
let digest=2166136261;
for(const char of staffPart){
  digest^=char.charCodeAt(0);
  digest=Math.imul(digest,16777619)>>>0;
}
assert.equal(staffPart.length,2221,"Original existing StaffContent section changed");
assert.equal(digest.toString(16).padStart(8,"0"),"813acd65",
  "Original already-working StaffContent section changed while adding customer status; requires review and retest");
const route=read("app/api/admin/control-room/customer-communications/route.js");
const requireTokens=(label,code,tokens)=>{for(const token of tokens)
  assert.ok(code.includes(token),label+": required source contract missing "+token);};
requireTokens("Customer protected Founder API",route,[
  "operationalCentreStagingAllowed()","verifyOperationalCentreFounder(request)",
  'founder.admin.from("hiissa_customer_support_inbox_staging")',
  '.select("id",{count:"exact",head:true})',
  '.eq("lifecycle_state","RECEIVED")',
  '.eq("acknowledgement_state","NOT_SENT")',
  "inboxTotal.error","inboxReceived.error","inboxNotSent.error",
  "Number.isSafeInteger(inboxTotal.count)",
  "stagingAuthenticatedCustomerRequests:inboxTotal.count",
  "stagingAuthenticatedReceivedCount:inboxReceived.count",
  "stagingAuthenticatedAcknowledgementNotSent:inboxNotSent.count",
  "stagingAuthenticatedRecentRequests:(inbox.data||[]).map",
  "stagingAuthenticatedRecentLimit:35",
  'authenticatedIntakePrivacy:"AGGREGATE_AND_STATUS_ONLY"',
  'status:"SOURCE_UNAVAILABLE"',
  'automaticAcknowledgement:"NOT_ACTIVE"',
  'externalDeliveryEnabled:false',
  'productionEffectEnabled:false',
  "canonicalIncidentFeedVerified:true",
  "existingFounderApprovalInbox",
  "existingAlerts",
  'status:"RECORDED_AND_AUDITED"'
]);
const sourceRead=route.split('      founder.admin.from("hiissa_customer_support_inbox_staging")')[1]?.split("    ]);")[0]||"";
assert.ok(sourceRead.includes('.select("id,lifecycle_state,acknowledgement_state,assigned_department,response_due_at,created_at")'),
  "Existing authenticated inbox read may return ONLY status-safe selected columns");
for(const forbidden of ["customer_user_id","message_body","subject","email","access_token","refresh_token"]){
  assert.ok(!sourceRead.includes(forbidden),"Authenticated inbox status read reveals forbidden "+forbidden);
}
requireTokens("Founder status view",client,[
  'Authenticated Staging customer requests',
  'Received — awaiting safe processing',
  'Acknowledgements not sent',
  'Authenticated Staging support inbox · status only',
  'No customer names, email addresses or private message content appear here.',
  'No customer details are displayed.',
  'Not approved or set',
  "stagingAuthenticatedRecentRequests.map",
  'CustomerPracticeActions',
  'StaffPracticeActions',
  'Open existing Founder Alerts and Activity Timeline',
  'Back to Founder Control Room',
  "SOURCE UNAVAILABLE"
]);
for(const forbidden of ["request.message_body","request.subject","request.customer_user_id","request.email"]){
  assert.ok(!client.includes(forbidden),"Founder inbox UI privacy breach: "+forbidden);
}
console.log("PASS: REAL Staging customer receipt oversight shows exact unbounded counts, privacy-safe 35 recent statuses, and fail-closed source verification.");
console.log("PASS: PRE-EXISTING Founder dashboard host, staff trust API, Founder practice actions and unchanged staff content baselines protected together with new Customer queue.");
console.log("NOT VERIFIED: actual Founder browser count=1, incoming external customer channels, real outgoing acknowledgement/human response, full lifecycle, Production activation.");
