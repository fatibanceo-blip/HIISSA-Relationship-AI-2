// HIISSA R208: Founder explicit IN-APP delivery pathway, original Staging only.
// Entire delivery command remains disabled unless SEPARATELY Founder-authorised
// activation gate is deliberately configured; this deployment cannot send.
import {NextResponse} from "next/server";
import {operationalCentreStagingAllowed,verifyOperationalCentreFounder}
 from "../../../../../../../lib/admin/founder-staging-operational-centres.js";
import {isInAppSupportStagingActivationConfigured,isSingleInAppSupportTestCaseActive}
 from "../../../../../../../lib/admin/staging-in-app-support-reply-activation.mjs";
export const dynamic="force-dynamic";
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const noStore=(data,status=200)=>NextResponse.json(data,{status,headers:{"Cache-Control":"private, no-store"}});
// Separate activation needs BOTH existing Staging and an exact Founder-tested
// fictional case allowlist. Never unlock all customer cases by one env toggle.
const allowedStagingTestCase=()=>process.env.HIISSA_STAGING_IN_APP_SUPPORT_REPLY_TEST_CASE_ID||"";
const stagingDeliveryEnabled=()=>isInAppSupportStagingActivationConfigured(process.env);
export async function GET(request){
 if(!operationalCentreStagingAllowed())return new NextResponse(null,{status:404});
 const founder=await verifyOperationalCentreFounder(request);
 if(!founder.ok)return noStore({status:founder.reason},founder.http);
 const requestId=new URL(request.url).searchParams.get("requestId")||"";
 const caseEnabled=isSingleInAppSupportTestCaseActive(process.env,requestId);
 return noStore({
  status:"ORIGINAL_FOUNDER_IN_APP_REPLY_DELIVERY_READINESS",
  registryId:"customer-communication-service-level-centre",
  environment:"staging",channel:"IN_APP_STAGING",
  activationStatus:caseEnabled?"READY_FOR_EXPLICIT_FOUNDER_ACTION":"NOT_ACTIVATED",
  customerInAppDeliveryActive:caseEnabled,
  emailDeliveryEnabled:false,smsDeliveryEnabled:false,productionEffectEnabled:false
 });
}
export async function POST(request){
 if(!operationalCentreStagingAllowed())return new NextResponse(null,{status:404});
 // CRITICAL: refuse BEFORE reading/modifying a case if separate Founder
 // activation was never granted. No fallback to email/SMS or Production.
 if(!stagingDeliveryEnabled())return noStore({status:"IN_APP_DELIVERY_NOT_ACTIVATED",
  replyDelivered:false,emailSent:false,smsSent:false,productionEffectEnabled:false},403);
 try{
  const origin=request.headers.get("origin");
  if(!origin||new URL(origin).origin!==new URL(request.url).origin)
   return noStore({status:"SAME_ORIGIN_REQUIRED",replyDelivered:false},403);
  const founder=await verifyOperationalCentreFounder(request);
  if(!founder.ok)return noStore({status:founder.reason,replyDelivered:false},founder.http);
  const raw=await request.text();
  if(raw.length>480)return noStore({status:"INVALID_DELIVERY_REQUEST",replyDelivered:false},413);
  let body;
  try{body=JSON.parse(raw)}catch{return noStore({status:"INVALID_DELIVERY_REQUEST",replyDelivered:false},400)}
  if(!isSingleInAppSupportTestCaseActive(process.env,body?.requestId))
    return noStore({status:"CASE_NOT_ACTIVATED_FOR_IN_APP_DELIVERY",
      replyDelivered:false,emailSent:false,smsSent:false,productionEffectEnabled:false},403);
  if(body?.action!=="deliver_approved_in_app_reply"||
   !UUID.test(String(body.requestId||""))||
   !UUID.test(String(body.approvalId||""))||
   !Number.isSafeInteger(body.caseVersion)||body.caseVersion<1||
   !Number.isSafeInteger(body.draftVersion)||body.draftVersion<1)
    return noStore({status:"INVALID_DELIVERY_REQUEST",replyDelivered:false},400);
  const {data,error}=await founder.admin.rpc(
    "hiissa_customer_support_staging_deliver_approved_in_app_reply",{
      p_founder:founder.founderUserId,
      p_request_id:body.requestId,
      p_expected_case_version:body.caseVersion,
      p_draft_version:body.draftVersion,
      p_approval_id:body.approvalId
    }
  );
  if(error)return noStore({status:"IN_APP_DELIVERY_NOT_CONFIRMED",replyDelivered:false},409);
  if(!["DELIVERED_IN_APP_AND_AUDITED","ALREADY_DELIVERED_IN_APP"].includes(data?.status)||
    data?.caseId!==body.requestId||data?.draftVersion!==body.draftVersion||
    data?.channel!=="IN_APP_STAGING"||
    data?.customerReplyVisible!==true||
    data?.emailSent!==false||data?.smsSent!==false||
    data?.productionEffectEnabled!==false)
    return noStore({status:"IN_APP_DELIVERY_NOT_VERIFIED",replyDelivered:false},503);
  return noStore({status:data.status,
    registryId:"customer-communication-service-level-centre",
    replyDelivered:true,version:data.version,deliveredAt:data.deliveredAt,
    channel:"IN_APP_STAGING",emailSent:false,smsSent:false,
    productionEffectEnabled:false});
 }catch{return noStore({status:"IN_APP_DELIVERY_UNAVAILABLE",replyDelivered:false},503)}
}
