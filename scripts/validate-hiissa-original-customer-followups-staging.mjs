// HIISSA R219 source/contract regression for the original Customer Centre:
// original signed-in customer reply after approved in-app response, no new host.
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>readFileSync(p,"utf8");
const migration=read("supabase/migrations/20261013204500_hiissa_customer_support_authenticated_followups_staging.sql");
const api=read("app/api/support/requests/followups/route.js");
const originalPage=read("app/my-hiissa/support/page.js");
const originalSupport=read("app/api/support/requests/route.js");
const originalReply=read("app/api/support/requests/replies/route.js");
const originalFounder=read("app/api/admin/control-room/customer-communications/route.js");
const originalApprove=read("app/api/admin/control-room/customer-communications/reply-draft/approve/route.js");
const originalRegistry=read("lib/experience-registry.js");
const activation=read("lib/admin/staging-in-app-support-reply-activation.mjs");
const includes=(who,source,parts)=>parts.forEach(p=>assert.ok(source.includes(p),who+" missing "+p));
includes("follow-up additive staging SQL",migration,[
 "CREATE TABLE IF NOT EXISTS public.hiissa_customer_support_followups_staging",
 "case_id uuid NOT NULL REFERENCES public.hiissa_customer_support_inbox_staging",
 "customer_user_id uuid NOT NULL REFERENCES auth.users(id)",
 "CHECK(environment='staging')","CHECK(external_effect_enabled=false)",
 "RECEIVED_PENDING_REVIEW","UNIQUE(case_id,customer_user_id,client_nonce)",
 "ENABLE ROW LEVEL SECURITY",
 "REVOKE ALL ON TABLE public.hiissa_customer_support_followups_staging FROM PUBLIC,anon,authenticated",
 "CREATE OR REPLACE FUNCTION public.hiissa_customer_support_staging_receive_customer_followup",
 "SECURITY DEFINER SET search_path=''",
 "auth.role() IS DISTINCT FROM 'service_role'",
 "customer_user_id=p_user_id FOR UPDATE",
 "v_case.lifecycle_state IS DISTINCT FROM 'RESPONDED'",
 "public.hiissa_customer_support_in_app_replies_staging",
 "delivery_channel='IN_APP_STAGING'",
 "v_saved.message_body IS DISTINCT FROM btrim(p_message)",
 "STAGING_CUSTOMER_FOLLOWUP_HOURLY_LIMIT",
 "INSERT INTO public.admin_audit_events",
 "'hiissa_customer_support_followup_received_staging'",
 "'customerContentIncluded',false",
 "'externalDeliveryPerformed',false",
 "REVOKE ALL ON FUNCTION public.hiissa_customer_support_staging_receive_customer_followup",
 "TO service_role"
]);
const sql=migration.split("\n").filter(x=>!x.trim().startsWith("--")).join("\n");
for(const bad of [
 /\bDROP\b/i,/\bTRUNCATE\b/i,/\bDELETE\s+FROM\b/i,
 /\bUPDATE\s+public\.hiissa_customer_support_inbox_staging\b/i,
 /\bUPDATE\s+public\.admin_approval_requests\b/i,
 /\bALTER\s+TABLE\s+public\.hiissa_customer_support_inbox_staging\b/i,
 /\bGRANT\s+(?:EXECUTE|SELECT|UPDATE|INSERT)[^;]*\bTO\s+(?:anon|authenticated)\b/i
])assert.ok(!bad.test(sql),"Follow-up must not mutate original case, approval or grant end-user direct access: "+bad);
includes("original support owner-only case follow-up API",api,[
 "operationalCentreStagingAllowed()",
 "auth.getUser(token)",
 'request.headers.get("origin")',
 "new URL(origin).origin!==new URL(request.url).origin",
 "isSingleInAppSupportTestCaseActive(process.env,body.requestId)",
 "hiissa_customer_support_staging_receive_customer_followup",
 'p_user_id:customer.userId',
 'p_case_id:body.requestId',
 'p_client_nonce:body.nonce',
 "ORIGINAL_CASE_FOLLOWUP_RECORDED_AND_AUDITED",
 "ALREADY_RECORDED_NO_DUPLICATE",
 "ORIGINAL_CUSTOMER_CASE_FOLLOWUPS",
 ".eq(\"customer_user_id\",customer.userId)",
 "Cache-Control",
 "externalMessageSent:false",
 "productionEffectEnabled:false"
]);
for(const bad of ["sendEmail(","sendSMS(","sendMail(",'.update(','.delete(', "new Resend(","createTransport("])
 assert.ok(!api.includes(bad),"Follow-up route must not send outward or modify preexisting source "+bad);
includes("same original customer support screen, no duplicate page",originalPage,[
 'fetch("/api/support/requests",{method:"POST"',
 'fetch("/api/support/requests",{method:"GET"',
 '"Refresh saved requests"',
 'fetch("/api/support/requests/replies"',
 'fetch("/api/support/requests/followups"',
 '"Continue this support conversation"',
 '"Send follow-up to Customer Support in Staging"',
 '"RECEIVED_PENDING_REVIEW"',
 "submitFollowup(event,item)",
 "setRefresh(n=>n+1)",
 "No email or SMS was sent"
]);
includes("original authenticated intake, owner privacy",originalSupport,[
 "verifySignedInCustomer(request)",
 "hiissa_customer_support_staging_receive",
 'eq("customer_user_id",gate.userId)',
 "externalMessaging:false"
]);
includes("original authenticated owner-only delivered reply",originalReply,[
 'auth.getUser(token)',
 '.eq("customer_user_id",auth.user.id)',
 '"hiissa_customer_support_in_app_replies_staging"',
 "externalEmailSent:false,externalSmsSent:false"
]);
includes("original aggregate Founder safe",originalFounder,[
 'authenticatedIntakePrivacy:"AGGREGATE_ONLY"',
 'existingFounderApprovalInbox:"REUSED_NOT_DUPLICATED"',
 'existingAlerts:"REUSED_NOT_DUPLICATED"'
]);
includes("existing Founder L3 unchanged",originalApprove,[
 "verifyOperationalCentreFounder(request)",
 "hiissa_customer_support_staging_approve_founder_reply_draft",
 "FOUNDER_APPROVED_PENDING_EXECUTION_NOT_SENT"
]);
includes("original Staging scope",activation,[
 'VERCEL_TARGET_ENV==="staging"',
 'VERCEL_ENV==="preview"',
 "caseId===env.HIISSA_STAGING_IN_APP_SUPPORT_REPLY_TEST_CASE_ID"
]);
assert.ok(originalRegistry.includes('id: "customer-communication-service-level-centre"'));
console.log("PASS SOURCE R219: original customer-owned same-case in-app follow-up ONLY after verified delivered answer, exact Staging test allowlist and atomic metadata audit.");
console.log("PASS SOURCE R219: original Support Save/Refresh, owner-only reply, aggregate Founder, AI approval, original Registry and no external sending protected.");
console.log("NOT VERIFIED: actual Founder first reply delivery, customer follow-up submit/read, real staff handling and original full-service completion.");
