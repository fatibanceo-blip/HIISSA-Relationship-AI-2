// HIISSA R203 original Customer Centre draft guards; automated source, not live test.
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>readFileSync(p,"utf8");
const sql=read("supabase/migrations/20261013184500_hiissa_customer_support_founder_reply_draft_staging.sql");
const api=read("app/api/admin/control-room/customer-communications/reply-draft/route.js");
const ui=read("app/admin/control-room/customer-communications/private-cases/FounderPrivateCases.js");
const old=read("app/api/admin/control-room/customer-communications/route.js");
const support=read("app/api/support/requests/route.js");
const registry=read("lib/experience-registry.js");
const check=(name,src,fragments)=>fragments.forEach(t=>assert.ok(src.includes(t),name+": "+t));
check("private audited SQL source",sql,[
 "CREATE TABLE IF NOT EXISTS public.hiissa_customer_support_reply_drafts_staging",
 "case_id uuid PRIMARY KEY REFERENCES public.hiissa_customer_support_inbox_staging",
 "ENABLE ROW LEVEL SECURITY",
 "REVOKE ALL ON TABLE public.hiissa_customer_support_reply_drafts_staging FROM PUBLIC,anon,authenticated",
 "SECURITY DEFINER SET search_path=''",
 "auth.role() IS DISTINCT FROM 'service_role'",
 "FROM public.admin_users WHERE user_id=p_founder",
 "FOR UPDATE","STAGING_SUPPORT_DRAFT_STALE_VERSION",
 "INSERT INTO public.admin_audit_events",
 "'hiissa_customer_support_founder_reply_draft_saved_staging'",
 "'customerContentIncluded',false","'messageDelivered',false",
 "'humanResponseSent',false","'outwardDelivered',false",
 "REVOKE ALL ON FUNCTION public.hiissa_customer_support_staging_save_founder_reply_draft",
 "TO service_role"
]);
const runnable=sql.split("\n").filter(s=>!s.trim().startsWith("--")).join("\n");
for(const expr of [/\bDROP\b/i,/\bTRUNCATE\b/i,/\bDELETE\s+FROM\b/i,
 /\bALTER TABLE public\.hiissa_customer_support_inbox_staging\b/i,
 /\bUPDATE public\.hiissa_customer_support_inbox_staging\b/i])
 assert.ok(!expr.test(runnable),"Never edit original customer data: "+expr);
check("old Founder gate and private-only response",api,[
 "operationalCentreStagingAllowed()","verifyOperationalCentreFounder(request)",
 "SAME_ORIGIN_REQUIRED","export async function GET",
 "export async function POST","p_founder:founder.founderUserId",
 '"hiissa_customer_support_staging_save_founder_reply_draft"',
 'data?.status!=="PRIVATE_DRAFT_SAVED_AND_AUDITED"',
 'humanReplySent:false','customerContentDelivered:false',
 'productionEffectEnabled:false'
]);
for(const bad of ["sendEmail(", "sendSMS(",".update(",'from("admin_approval_requests")'])
 assert.ok(!api.includes(bad),"No external delivery or new approval process: "+bad);
check("same original Founder page draft",ui,[
 'DRAFT_ACTION="/api/admin/control-room/customer-communications/reply-draft"',
 'Prepare private customer reply draft',
 'Save private draft — do not send',
 'PRIVATE reply draft saved and verified.',
 'action:"save_founder_private_reply_draft"',
 'Confirm internal routing in Staging',
 'Cancel — leave case unchanged'
]);
check("original aggregate Founder protected",old,[
 'authenticatedIntakePrivacy:"AGGREGATE_ONLY"',
 'existingFounderApprovalInbox:"REUSED_NOT_DUPLICATED"',
 'existingAlerts:"REUSED_NOT_DUPLICATED"','externalDeliveryEnabled:false'
]);
check("original customer Save/Refresh protected",support,[
 "verifySignedInCustomer(request)",'eq("customer_user_id",gate.userId)',
 "hiissa_customer_support_staging_receive","externalMessaging:false"
]);
assert.ok(registry.includes('id: "customer-communication-service-level-centre"'));
console.log("PASS SOURCE R203: private draft, service-only atomic audit, original Founder/Support/Registry, NO send.");
console.log("NOT VERIFIED: actual Founder draft save/refresh, human reply delivery, staff response, actual live SLA.");
