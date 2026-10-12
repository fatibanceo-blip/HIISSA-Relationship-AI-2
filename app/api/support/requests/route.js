// Founder-approved genuine signed-in support receipt: EXISTING isolated Staging ONLY.
// No real email, staff approval, AI response, acknowledgement delivery or Production effects.
// Does not touch protected customer conversation history or staff work simulation.
import {NextResponse} from "next/server";
import {createClient} from "@supabase/supabase-js";
import {operationalCentreStagingAllowed} from "../../../../lib/admin/founder-staging-operational-centres.js";

export const dynamic="force-dynamic";
const noStore=(body,status=200)=>NextResponse.json(body,{status,headers:{"Cache-Control":"private, no-store"}});
const hidden=()=>new NextResponse(null,{status:404});
const options={auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}};
const ID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

async function verifySignedInCustomer(request){
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
 const pub=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
 const secret=process.env.SUPABASE_SECRET_KEY;
 if(!url||!pub||!secret)return {ok:false,http:503,status:"SUPPORT_STAGING_UNAVAILABLE"};
 const header=request.headers.get("authorization")||"";
 const token=header.startsWith("Bearer ")?header.slice(7).trim():"";
 if(!token)return {ok:false,http:401,status:"SIGN_IN_REQUIRED"};
 const publicClient=createClient(url,pub,options);
 const {data,error}=await publicClient.auth.getUser(token);
 if(error||!data?.user)return {ok:false,http:401,status:"SIGN_IN_REQUIRED"};
 return {ok:true,userId:data.user.id,admin:createClient(url,secret,options)};
}
export async function GET(request){
 if(!operationalCentreStagingAllowed())return hidden();
 try{
  const gate=await verifySignedInCustomer(request);
  if(!gate.ok)return noStore({status:gate.status},gate.http);
  const {data,error}=await gate.admin.from("hiissa_customer_support_inbox_staging")
   .select("id,subject,lifecycle_state,acknowledgement_state,created_at,updated_at")
   .eq("environment","staging").eq("customer_user_id",gate.userId)
   .order("created_at",{ascending:false}).limit(15);
  if(error)return noStore({status:"SOURCE_UNAVAILABLE"},503);
  return noStore({status:"MONITORING",requests:data||[],
   acknowledgementDelivery:"NOT_ACTIVE",responseDeadline:"NOT_VERIFIED",
   externalMessaging:false,environment:"staging"});
 }catch{return noStore({status:"SOURCE_UNAVAILABLE"},503);}
}
export async function POST(request){
 if(!operationalCentreStagingAllowed())return hidden();
 try{
  const origin=request.headers.get("origin");
  if(!origin||new URL(origin).origin!==new URL(request.url).origin)
   return noStore({status:"SAME_ORIGIN_REQUIRED"},403);
  const gate=await verifySignedInCustomer(request);
  if(!gate.ok)return noStore({status:gate.status},gate.http);
  const raw=await request.text();
  if(raw.length>5000)return noStore({status:"REQUEST_TOO_LARGE"},413);
  let data;
  try{data=JSON.parse(raw);}catch{return noStore({status:"INVALID_REQUEST"},400);}
  const subject=typeof data?.subject==="string"?data.subject.trim():"";
  const message=typeof data?.message==="string"?data.message.trim():"";
  const nonce=data?.nonce;
  if(subject.length<5||subject.length>120||message.length<5||message.length>2000||
     !ID.test(String(nonce||""))||/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(subject+message))
   return noStore({status:"INVALID_SUPPORT_DETAILS"},400);
  // Bounded capacity protects original Staging without claiming full spam controls.
  const since=new Date(Date.now()-3600*1000).toISOString();
  const {count,error:countError}=await gate.admin.from("hiissa_customer_support_inbox_staging")
    .select("id",{head:true,count:"exact"})
    .eq("environment","staging").eq("customer_user_id",gate.userId)
    .gte("created_at",since);
  if(countError)return noStore({status:"SOURCE_UNAVAILABLE"},503);
  if((count||0)>=5)return noStore({status:"HOURLY_LIMIT_REACHED"},429);
  const {data:result,error}=await gate.admin.rpc("hiissa_customer_support_staging_receive",{
    p_user_id:gate.userId,p_client_nonce:nonce,p_subject:subject,p_message:message
  });
  if(error||!result?.id)return noStore({status:"REQUEST_NOT_RECORDED"},503);
  return noStore({status:"RECORDED_AND_AUDITED",result:{
   id:result.id,createdAt:result.createdAt,lifecycleState:result.state
  },automaticAcknowledgementSent:false,humanResponseDeadlineVerified:false,
   externalMessageSent:false,productionEffectEnabled:false});
 }catch{return noStore({status:"REQUEST_NOT_RECORDED"},503);}
}
