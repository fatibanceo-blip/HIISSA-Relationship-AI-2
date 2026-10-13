// HIISSA R208 mandatory old+new source security: original private Founder-approved
// reply -> original customer's My Support Requests, disabled by default.
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=path=>readFileSync(path,"utf8");
const sql=read("supabase/migrations/20261013195000_hiissa_customer_support_in_app_reply_delivery_staging.sql");
const founder=read("app/api/admin/control-room/customer-communications/reply-draft/deliver/route.js");
const myReplies=read("app/api/support/requests/replies/route.js");
const mySupport=read("app/my-hiissa/support/page.js");
const originalSupport=read("app/api/support/requests/route.js");
const originalFounder=read("app/api/admin/control-room/customer-communications/route.js");
const originalApprove=read("app/api/admin/control-room/customer-communications/reply-draft/approve/route.js");
const originalRegistry=read("lib/experience-registry.js");
const checks=(tag,src,terms)=>terms.forEach(s=>assert.ok(src.includes(s),tag+" missing "+s));
checks("subordinate original Staging receipt",sql,[
 "CREATE TABLE IF NOT EXISTS public.hiissa_customer_support_in_app_replies_staging",
 "case_id uuid PRIMARY KEY REFERENCES public.hiissa_customer_support_inbox_staging(id)",
 "customer_user_id uuid NOT NULL REFERENCES auth.users(id)",
 "approval_id uuid NOT NULL UNIQUE REFERENCES public.admin_approval_requests(id)",
 "CHECK(environment='staging')","CHECK(delivery_channel='IN_APP_STAGING')",
 "CHECK(external_effect_enabled=false)",
 "ENABLE ROW LEVEL SECURITY",
 "REVOKE ALL ON TABLE public.hiissa_customer_support_in_app_replies_staging FROM PUBLIC,anon,authenticated",
 "CREATE OR REPLACE FUNCTION public.hiissa_customer_support_staging_deliver_approved_in_app_reply",
 "SECURITY DEFINER SET search_path=''",
 "auth.role() IS DISTINCT FROM 'service_role'",
 "FROM public.admin_users WHERE user_id=p_founder",
 "FOR UPDATE",
 "v_draft.draft_version IS DISTINCT FROM p_draft_version",
 "status='approved_pending_execution'",
 "request_context->>'caseVersion'=p_expected_case_version::text",
 "request_context->>'draftVersion'=p_draft_version::text",
 "UPDATE public.admin_approval_requests SET status='verified_complete'",
 "SET lifecycle_state='RESPONDED'",
 "INSERT INTO public.admin_audit_events",
 "'hiissa_customer_support_in_app_reply_delivered_staging'",
 "'customerContentIncluded',false",
 "'emailSent',false,'smsSent',false",
 "'ALREADY_DELIVERED_IN_APP'",
 "REVOKE ALL ON FUNCTION public.hiissa_customer_support_staging_deliver_approved_in_app_reply",
 "TO service_role"
]);
checks("Founder single Staging-only delivery action hard off without Founder gate",founder,[
 "operationalCentreStagingAllowed()",
 "HIISSA_STAGING_IN_APP_SUPPORT_REPLY_DELIVERY_ENABLED",
 'process.env.VERCEL_ENV==="staging"',
 "if(!stagingDeliveryEnabled())return noStore",
 "IN_APP_DELIVERY_NOT_ACTIVATED",
 "verifyOperationalCentreFounder(request)",
 "SAME_ORIGIN_REQUIRED",
 "deliver_approved_in_app_reply",
 '"hiissa_customer_support_staging_deliver_approved_in_app_reply"',
 "emailSent:false,smsSent:false",
 "productionEffectEnabled:false"
]);
checks("Original customer identity owner only and delivered content",myReplies,[
 "operationalCentreStagingAllowed()",
 'auth.getUser(token)',
 '.eq("customer_user_id",auth.user.id)',
 '"hiissa_customer_support_in_app_replies_staging"',
 '"IN_APP_STAGING"',
 "externalEmailSent:false,externalSmsSent:false",
 'productionEffectEnabled:false'
]);
checks("Existing original customer UI retains Save and Refresh",mySupport,[
 'fetch("/api/support/requests",{method:"POST"',
 'fetch("/api/support/requests",','"Refresh saved requests"',
 'fetch("/api/support/requests/replies"',
 "Your saved support requests",
 "Reply from HIISSA Customer Support · delivered in-app",
 'repliesState==="UNAVAILABLE"',
 "No in-app customer-service replies have been delivered"
]);
checks("Original Support owner-only intake unchanged",originalSupport,[
 "verifySignedInCustomer(request)",'eq("customer_user_id",gate.userId)',
 "hiissa_customer_support_staging_receive","externalMessaging:false"
]);
checks("Original Founder aggregate-only preserved",originalFounder,[
 'authenticatedIntakePrivacy:"AGGREGATE_ONLY"',
 'existingFounderApprovalInbox:"REUSED_NOT_DUPLICATED"',
 'existingAlerts:"REUSED_NOT_DUPLICATED"',
 'externalDeliveryEnabled:false'
]);
checks("Original Founder approval gate preserved",originalApprove,[
 "verifyOperationalCentreFounder(request)",
 "hiissa_customer_support_staging_approve_founder_reply_draft",
 "FOUNDER_APPROVED_PENDING_EXECUTION_NOT_SENT"
]);
assert.ok(originalRegistry.includes('id: "customer-communication-service-level-centre"'));
const exec=sql.split("\n").filter(line=>!line.trim().startsWith("--")).join("\n");
for(const regex of [/\bDROP\s/i,/\bTRUNCATE\s/i,/\bDELETE\s+FROM\b/i,
 /\bALTER\s+TABLE\s+public\.hiissa_customer_support_inbox_staging\b/i,
 /GRANT\s+SELECT\s+ON\s+TABLE\s+public\.hiissa_customer_support_in_app_replies_staging\s+TO\s+(authenticated|anon)/i])
 assert.ok(!regex.test(exec),"Never rewrite original support or open direct rights "+regex);
for(const src of [founder,myReplies]){
 for(const bad of ["sendEmail(", "sendSMS(", "sendMail(", "twilio", "resend.emails.send"])
  assert.ok(!src.includes(bad),"In-app ONLY: external sending disallowed: "+bad);
}
assert.ok(!myReplies.includes("export async function POST"),"Customer reply reader is GET-only");
console.log("PASS SOURCE R208: original Staging Founder-only approval/locked one-time in-app delivery gated OFF, no external sends.");
console.log("PASS SOURCE R208: only original authenticated customer can see delivered reply; original Support Save/Refresh and Founder AGGREGATE_ONLY preserved.");
console.log("NOT VERIFIED: live human response delivered, in-app channel activated, real customer read, email/SMS, Founder practical response.");
