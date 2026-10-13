// HIISSA R205: original canonical Founder approval for a PRIVATE customer
// reply draft. This action NEVER delivers/sends or marks human reply completed.
import {NextResponse} from "next/server";
import {operationalCentreStagingAllowed,verifyOperationalCentreFounder}
  from "../../../../../../../lib/admin/founder-staging-operational-centres.js";
export const dynamic="force-dynamic";
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const json=(data,status=200)=>NextResponse.json(data,{status,headers:{"Cache-Control":"private, no-store"}});
export async function POST(request){
  if(!operationalCentreStagingAllowed())return new NextResponse(null,{status:404});
  try{
    const origin=request.headers.get("origin");
    if(!origin||new URL(origin).origin!==new URL(request.url).origin)
      return json({status:"SAME_ORIGIN_REQUIRED",messageSent:false},403);
    const founder=await verifyOperationalCentreFounder(request);
    if(!founder.ok)return json({status:founder.reason,messageSent:false},founder.http);
    const raw=await request.text();
    if(raw.length>450)return json({status:"INVALID_APPROVAL_REQUEST",messageSent:false},413);
    let body;
    try{body=JSON.parse(raw)}catch{return json({status:"INVALID_APPROVAL_REQUEST",messageSent:false},400)}
    if(body?.action!=="approve_customer_reply_draft"||
      !UUID.test(String(body.requestId||""))||
      !Number.isSafeInteger(body.caseVersion)||body.caseVersion<1||
      !Number.isSafeInteger(body.draftVersion)||body.draftVersion<1)
      return json({status:"INVALID_APPROVAL_REQUEST",messageSent:false},400);
    const {data,error}=await founder.admin.rpc(
      "hiissa_customer_support_staging_approve_founder_reply_draft",{
        p_founder:founder.founderUserId,
        p_request_id:body.requestId,
        p_case_version:body.caseVersion,
        p_draft_version:body.draftVersion
      });
    if(error||!["FOUNDER_APPROVED_PENDING_EXECUTION_NOT_SENT","ALREADY_APPROVED_NOT_SENT"].includes(data?.status)||
      data?.draftVersion!==body.draftVersion||
      data?.caseVersion!==body.caseVersion||
      data?.humanReplySent!==false||data?.externalDeliveryPerformed!==false||
      data?.productionEffectEnabled!==false)
      return json({status:"FOUNDER_APPROVAL_NOT_RECORDED",messageSent:false},409);
    return json({status:"FOUNDER_APPROVED_PENDING_EXECUTION_NOT_SENT",
      registryId:"customer-communication-service-level-centre",
      approvalRecorded:true,
      approvedAt:data.approvedAt,
      caseVersion:body.caseVersion,draftVersion:body.draftVersion,
      messageSent:false,humanReplySent:false,
      externalDeliveryPerformed:false,productionEffectEnabled:false});
  }catch{return json({status:"FOUNDER_APPROVAL_UNAVAILABLE",messageSent:false},503);}
}
