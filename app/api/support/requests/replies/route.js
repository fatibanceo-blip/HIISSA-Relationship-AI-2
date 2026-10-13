// HIISSA R208: existing My Support Requests reads only messages actually
// delivered to THIS authenticated customer inside original Staging app.
// No new authentication identity, no outbound sending, no approval duplication.
// Original /api/support/requests Save and Refresh contract remains unchanged.
import {NextResponse} from "next/server";
import {createClient} from "@supabase/supabase-js";
import {operationalCentreStagingAllowed} from "../../../../../lib/admin/founder-staging-operational-centres.js";
export const dynamic="force-dynamic";
const opts={auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}};
const respond=(data,status=200)=>NextResponse.json(data,{status,headers:{
 "Cache-Control":"private, no-store","X-Content-Type-Options":"nosniff"
}});
export async function GET(request){
 if(!operationalCentreStagingAllowed())return new NextResponse(null,{status:404});
 try{
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
  const pub=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const secret=process.env.SUPABASE_SECRET_KEY;
  if(!url||!pub||!secret)return respond({status:"SUPPORT_REPLY_SOURCE_UNAVAILABLE"},503);
  const bearer=request.headers.get("authorization")||"";
  const token=bearer.startsWith("Bearer ")?bearer.slice(7).trim():"";
  if(!token)return respond({status:"SIGN_IN_REQUIRED"},401);
  // Same original Supabase JWT->getUser verification used in original Support
  // intake. Never accept userId from URL or frontend input.
  const publicClient=createClient(url,pub,opts);
  const {data:auth,error:authError}=await publicClient.auth.getUser(token);
  if(authError||!auth?.user?.id)return respond({status:"SIGN_IN_REQUIRED"},401);
  const admin=createClient(url,secret,opts);
  const {data,error}=await admin.from("hiissa_customer_support_in_app_replies_staging")
   .select("case_id,message_body,draft_version,delivered_at,delivery_channel")
   .eq("environment","staging")
   .eq("customer_user_id",auth.user.id)
   .order("delivered_at",{ascending:false}).limit(15);
  if(error)return respond({status:"SUPPORT_REPLY_SOURCE_UNAVAILABLE"},503);
  const safe=(data||[]).filter(item=>
   item.delivery_channel==="IN_APP_STAGING"&&
   typeof item.message_body==="string"&&
   item.message_body.length>=8&&item.message_body.length<=2000&&
   typeof item.case_id==="string"&&
   typeof item.delivered_at==="string")
   .map(item=>({
    requestId:item.case_id,reply:item.message_body,
    deliveredAt:item.delivered_at,draftVersion:item.draft_version
   }));
  return respond({
   status:"ORIGINAL_CUSTOMER_IN_APP_REPLIES",
   environment:"staging",registryId:"customer-communication-service-level-centre",
   replies:safe,externalEmailSent:false,externalSmsSent:false,
   productionEffectEnabled:false
  });
 }catch{return respond({status:"SUPPORT_REPLY_SOURCE_UNAVAILABLE"},503)}
}
