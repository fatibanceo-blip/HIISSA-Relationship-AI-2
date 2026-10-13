// HIISSA R219 original Customer Centre: private authenticated customer reply
// to a VERIFIED in-app original response, same customer case. STAGING ONLY.
// No new account, Founder AI, support inbox, email/SMS, or Production writes.
import {NextResponse} from "next/server";
import {createClient} from "@supabase/supabase-js";
import {operationalCentreStagingAllowed} from "../../../../../lib/admin/founder-staging-operational-centres.js";
import {isSingleInAppSupportTestCaseActive} from "../../../../../lib/admin/staging-in-app-support-reply-activation.mjs";

export const dynamic="force-dynamic";
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const options={auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}};
const json=(data,status=200)=>NextResponse.json(data,{status,headers:{
 "Cache-Control":"private, no-store","X-Content-Type-Options":"nosniff"
}});
const hidden=()=>new NextResponse(null,{status:404});
async function originalCustomer(request){
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
 const pub=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
 const secret=process.env.SUPABASE_SECRET_KEY;
 if(!url||!pub||!secret)return {ok:false,status:"SOURCE_UNAVAILABLE",http:503};
 const h=request.headers.get("authorization")||"";
 const token=h.startsWith("Bearer ")?h.slice(7).trim():"";
 if(!token)return {ok:false,status:"SIGN_IN_REQUIRED",http:401};
 const auth=createClient(url,pub,options);
 const {data,error}=await auth.auth.getUser(token);
 if(error||!data?.user?.id)return {ok:false,status:"SIGN_IN_REQUIRED",http:401};
 return {ok:true,userId:data.user.id,admin:createClient(url,secret,options)};
}
export async function GET(request){
 if(!operationalCentreStagingAllowed())return hidden();
 try{
  const customer=await originalCustomer(request);
  if(!customer.ok)return json({status:customer.status},customer.http);
  const {data,error}=await customer.admin
   .from("hiissa_customer_support_followups_staging")
   .select("id,case_id,message_body,state,created_at")
   .eq("environment","staging").eq("customer_user_id",customer.userId)
   .order("created_at",{ascending:false}).limit(20);
  if(error)return json({status:"FOLLOWUP_SOURCE_UNAVAILABLE"},503);
  return json({status:"ORIGINAL_CUSTOMER_CASE_FOLLOWUPS",
    registryId:"customer-communication-service-level-centre",
    environment:"staging",
    followups:(data||[]).filter(x=>x.state==="RECEIVED_PENDING_REVIEW"&&
     typeof x.message_body==="string"&&x.message_body.length>=8&&
     x.message_body.length<=2000)
     .map(x=>({id:x.id,requestId:x.case_id,
       message:x.message_body,state:x.state,createdAt:x.created_at})),
    humanReplySent:false,externalMessageSent:false,productionEffectEnabled:false});
 }catch{return json({status:"FOLLOWUP_SOURCE_UNAVAILABLE"},503);}
}
export async function POST(request){
 if(!operationalCentreStagingAllowed())return hidden();
 try{
  const origin=request.headers.get("origin");
  if(!origin||new URL(origin).origin!==new URL(request.url).origin)
   return json({status:"SAME_ORIGIN_REQUIRED",followupRecorded:false},403);
  const customer=await originalCustomer(request);
  if(!customer.ok)return json({status:customer.status,followupRecorded:false},customer.http);
  const raw=await request.text();
  if(raw.length>3000)return json({status:"FOLLOWUP_TOO_LARGE",followupRecorded:false},413);
  let body;
  try{body=JSON.parse(raw)}catch{return json({status:"INVALID_FOLLOWUP",followupRecorded:false},400)}
  const message=typeof body?.message==="string"?body.message.trim():"";
  if(body?.action!=="reply_to_my_original_support_case"||
   !UUID.test(String(body?.requestId||""))||
   !UUID.test(String(body?.nonce||""))||
   message.length<8||message.length>2000||
   /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(message))
   return json({status:"INVALID_FOLLOWUP",followupRecorded:false},400);
  // The Founder has permitted only ONE fictional case for this Staging test.
  // No customer can use the sender to broaden the permission.
  if(!isSingleInAppSupportTestCaseActive(process.env,body.requestId))
   return json({status:"CASE_NOT_AUTHORISED_FOR_STAGING_TEST",
      followupRecorded:false},403);
  const {data,error}=await customer.admin.rpc(
   "hiissa_customer_support_staging_receive_customer_followup",{
    p_user_id:customer.userId,
    p_case_id:body.requestId,
    p_client_nonce:body.nonce,
    p_message:message
   });
  if(error){
   const s=String(error.message||"");
   return json({status:s.includes("HOURLY_LIMIT")?"FOLLOWUP_HOURLY_LIMIT":
     s.includes("NOT_OWNED")?"CASE_NOT_FOUND_OR_NOT_YOURS":
     s.includes("REPLY_NOT_DELIVERED")?"NO_DELIVERED_REPLY_FOR_THIS_CASE":
     s.includes("DUPLICATE_DIFFERENT_CONTENT")?"NONCE_ALREADY_USED_FOR_ANOTHER_REPLY":
     "FOLLOWUP_NOT_VERIFIED",followupRecorded:false},
    s.includes("HOURLY_LIMIT")?429:409);
  }
  if(!["ORIGINAL_CASE_FOLLOWUP_RECORDED_AND_AUDITED",
    "ALREADY_RECORDED_NO_DUPLICATE"].includes(data?.status)||
    data?.caseId!==body.requestId||
    data?.state!=="RECEIVED_PENDING_REVIEW"||
    data?.externalMessageSent!==false||
    data?.productionEffectEnabled!==false)
   return json({status:"FOLLOWUP_NOT_VERIFIED",followupRecorded:false},503);
  // A follow-up is recorded for internal attention, NOT a customer response
  // or a final resolution.
  return json({status:data.status,registryId:"customer-communication-service-level-centre",
    followupId:data.followupId,requestId:body.requestId,createdAt:data.createdAt,
    followupRecorded:true,state:data.state,
    humanReplySent:false,externalMessageSent:false,
    productionEffectEnabled:false});
 }catch{return json({status:"FOLLOWUP_SOURCE_UNAVAILABLE",followupRecorded:false},503)}
}
