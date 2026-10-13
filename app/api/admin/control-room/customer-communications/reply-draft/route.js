// HIISSA R203 original Staging Customer Centre: private Founder reply DRAFT.
// Not the original aggregate Overview. No staff-role grants, delivery, SLA PASS,
// acknowledgement, email, SMS, user-visible response, or Production activity.
import {NextResponse} from "next/server";
import {operationalCentreStagingAllowed,verifyOperationalCentreFounder}
  from "../../../../../../lib/admin/founder-staging-operational-centres.js";
export const dynamic="force-dynamic";
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const json=(data,status=200)=>NextResponse.json(data,{status,headers:{
 "Cache-Control":"private, no-store","X-Content-Type-Options":"nosniff"
}});
const hidden=()=>new NextResponse(null,{status:404});
export async function GET(request){
 if(!operationalCentreStagingAllowed())return hidden();
 try{
  const founder=await verifyOperationalCentreFounder(request);
  if(!founder.ok)return json({status:founder.reason},founder.http);
  const id=new URL(request.url).searchParams.get("requestId")||"";
  if(!UUID.test(id))return json({status:"INVALID_CASE_ID"},400);
  const {data:caseRow,error:caseError}=await founder.admin
    .from("hiissa_customer_support_inbox_staging")
    .select("id,version,assigned_department,lifecycle_state")
    .eq("environment","staging").eq("id",id).maybeSingle();
  if(caseError)return json({status:"PRIVATE_DRAFT_SOURCE_UNAVAILABLE"},503);
  if(!caseRow)return json({status:"CASE_NOT_FOUND"},404);
  const {data:draft,error}=await founder.admin
    .from("hiissa_customer_support_reply_drafts_staging")
    .select("draft_body,draft_version,saved_at,status")
    .eq("environment","staging").eq("case_id",id).maybeSingle();
  if(error)return json({status:"PRIVATE_DRAFT_SOURCE_UNAVAILABLE"},503);
  return json({
    status:"FOUNDER_PRIVATE_DRAFT_READ",
    registryId:"customer-communication-service-level-centre",
    caseVersion:caseRow.version,
    department:caseRow.assigned_department,
    draftVersion:draft?.draft_version||0,
    draftText:draft?.draft_body||"",
    draftSavedAt:draft?.saved_at||null,
    draftState:draft?"PRIVATE_DRAFT":"NOT_CREATED",
    audience:"ORIGINAL_FOUNDER_ONLY",
    humanReplySent:false,customerContentDelivered:false,
    productionEffectEnabled:false
  });
 }catch{return json({status:"PRIVATE_DRAFT_SOURCE_UNAVAILABLE"},503)}
}
export async function POST(request){
 if(!operationalCentreStagingAllowed())return hidden();
 try{
  const origin=request.headers.get("origin");
  if(!origin||new URL(origin).origin!==new URL(request.url).origin)
    return json({status:"SAME_ORIGIN_REQUIRED",humanReplySent:false},403);
  const founder=await verifyOperationalCentreFounder(request);
  if(!founder.ok)return json({status:founder.reason,humanReplySent:false},founder.http);
  const raw=await request.text();
  if(raw.length>3200)return json({status:"DRAFT_TOO_LARGE",humanReplySent:false},413);
  let body;
  try{body=JSON.parse(raw)}catch{return json({status:"INVALID_DRAFT_REQUEST",humanReplySent:false},400)}
  const message=typeof body?.draftText==="string"?body.draftText.trim():"";
  if(body?.action!=="save_founder_private_reply_draft"||
    !UUID.test(String(body?.requestId||""))||
    !Number.isSafeInteger(body?.caseVersion)||body.caseVersion<1||
    !Number.isSafeInteger(body?.draftVersion)||body.draftVersion<0||
    message.length<8||message.length>2000||
    /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(message))
    return json({status:"INVALID_DRAFT_REQUEST",humanReplySent:false},400);
  const {data,error}=await founder.admin.rpc(
    "hiissa_customer_support_staging_save_founder_reply_draft",{
      p_founder:founder.founderUserId,
      p_request_id:body.requestId,
      p_case_version:body.caseVersion,
      p_draft_version:body.draftVersion,
      p_draft_body:message
    }
  );
  if(error){
    const msg=String(error.message||"");
    const stale=msg.includes("STAGING_SUPPORT_STALE_VERSION")||
      msg.includes("STAGING_SUPPORT_DRAFT_STALE_VERSION");
    return json({status:stale?"STALE_DRAFT_REFRESH":"DRAFT_NOT_SAVED",
      humanReplySent:false},stale?409:400);
  }
  if(data?.status!=="PRIVATE_DRAFT_SAVED_AND_AUDITED"||
    data?.registryId!=="customer-communication-service-level-centre"||
    data?.draftVersion!==body.draftVersion+1||
    data?.caseVersion!==body.caseVersion||
    data?.humanResponseSent!==false||
    data?.messageDelivered!==false||
    data?.outwardDelivered!==false||
    data?.productionEffectEnabled!==false)
    return json({status:"DRAFT_RESULT_NOT_VERIFIED",humanReplySent:false},503);
  return json({status:"PRIVATE_DRAFT_SAVED_AND_AUDITED",
    registryId:"customer-communication-service-level-centre",
    draftVersion:data.draftVersion,caseVersion:data.caseVersion,
    savedAt:data.savedAt,
    humanReplySent:false,customerContentDelivered:false,
    productionEffectEnabled:false});
 }catch{return json({status:"PRIVATE_DRAFT_UNAVAILABLE",humanReplySent:false},503);}
}
