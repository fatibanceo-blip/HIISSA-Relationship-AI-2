// HIISSA R221 regression: original Founder L3 case approval must be truthfully
// reloaded AFTER exact Staging in-app delivery upgrades case version/status,
// while original pre-send AI draft/approval remains unchanged.
// Source/contract coverage only; not an actual Founder send/customer practical PASS.
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>readFileSync(p,"utf8");
const founder=read("app/api/admin/control-room/customer-communications/reply-draft/route.js");
const ui=read("app/admin/control-room/customer-communications/private-cases/FounderPrivateCases.js");
const oldSource=read("app/api/admin/control-room/customer-communications/route.js");
const delivered=read("supabase/migrations/20261013195000_hiissa_customer_support_in_app_reply_delivery_staging.sql");
const followups=read("supabase/migrations/20261013204500_hiissa_customer_support_authenticated_followups_staging.sql");
function includes(label,s,items){
 for(const v of items)assert.ok(s.includes(v),label+" missing "+v);
}
includes("Canonical original completed L3 status and approved draft verification",founder,[
 'verifyOperationalCentreFounder(request)',
 '.from("hiissa_customer_support_in_app_replies_staging")',
 '.select("approval_id,draft_version,delivered_at,delivery_channel")',
 '.from("admin_approval_requests")',
 'a.status==="verified_complete"',
 'a.id===delivered.approval_id',
 'Number(a.request_context?.draftVersion)===draft.draft_version',
 'Number(a.request_context?.caseVersion)===caseRow.version-1',
 'a.status==="approved_pending_execution"',
 'Number(a.request_context?.caseVersion)===caseRow.version',
 'completedApprovalVerified=Boolean(inAppDelivered&&match)',
 '"FOUNDER_APPROVED_DELIVERED_IN_APP":"DELIVERY_APPROVAL_UNVERIFIED"',
 'approvedAt,approvalId',
 'customerContentDelivered:inAppDelivered',
 'humanReplySent:false',
 'Cache-Control'
]);
includes("Founder-private pending followups only, not text",founder,[
 '.from("hiissa_customer_support_followups_staging")',
 '.select("id",{head:true,count:"exact"})',
 '.eq("case_id",id)',
 '.eq("state","RECEIVED_PENDING_REVIEW")',
 'followupStatus,pendingFollowupCount:followupError?null:pendingFollowupCount'
]);
includes("Same original Founder screen pre/post correct display",ui,[
 'body?.customerContentDelivered!==(body?.inAppDeliveryStatus==="DELIVERED_IN_APP")',
 '"FOUNDER_APPROVED_DELIVERED_IN_APP"',
 '"DELIVERY_APPROVAL_UNVERIFIED"',
 'stored?.customerContentDelivered!==true',
 'stored?.approvalStatus!=="FOUNDER_APPROVED_DELIVERED_IN_APP"',
 'The first reply was delivered in-app to the original Staging customer.',
 'Customer follow-ups · original Founder Control Room',
 'draft.pendingFollowupCount+" customer follow-up(s) awaiting Customer Support review."',
 'original Founder Overview stays',
 'Review in-app-only delivery in Staging',
 'Confirm Staging-only in-app delivery',
 'Cancel — do not deliver',
 'draft.deliveryStatus!=="DELIVERED_IN_APP"'
]);
includes("original atomic delivery version and approval change",delivered,[
 "SET lifecycle_state='RESPONDED',updated_at=v_now,version=version+1",
 "UPDATE public.admin_approval_requests SET status='verified_complete'",
 "'hiissa_customer_support_in_app_reply_delivered_staging'",
 "'emailSent',false,'smsSent',false"
]);
includes("followup one shared original case and audit",followups,[
 "REFERENCES public.hiissa_customer_support_inbox_staging",
 "'RECEIVED_PENDING_REVIEW'",
 "'hiissa_customer_support_followup_received_staging'",
 "'customerContentIncluded',false"
]);
includes("old aggregate Founder privacy never changed",oldSource,[
 'authenticatedIntakePrivacy:"AGGREGATE_ONLY"',
 'existingFounderApprovalInbox:"REUSED_NOT_DUPLICATED"'
]);
for(const forbidden of [
 'select("message_body")','select("message_body,',
 'customer_user_id','sendEmail(','.update(','.insert(','.delete('
])assert.ok(!founder.includes(forbidden),
 "original Founder PRIVATE case GET/save cannot disclose followup contents or bypass source "+forbidden);
assert.ok(!oldSource.includes("stagingAuthenticatedRecentRequests"),
 "Original aggregate Founder must remain anonymised");
console.log("PASS SOURCE R221: original Founder L3 pending + verified_complete post-send caseVersion N+1, truthful in-app delivered state, no re-approval.");
console.log("PASS SOURCE R221: pending same-case customer followup COUNT only in Founder-private screen, original AGGREGATE_ONLY and all old customer paths protected.");
console.log("NOT VERIFIED: live Founder first message delivery, owner customer followup practical or staff resolution.");
