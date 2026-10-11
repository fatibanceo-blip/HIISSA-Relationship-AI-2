import {NextResponse} from "next/server";
import {operationalCentreStagingAllowed,verifyOperationalCentreFounder} from "../../../../../lib/admin/founder-staging-operational-centres.js";

export const dynamic="force-dynamic";
const json=(body,status=200)=>NextResponse.json(body,{status,headers:{"Cache-Control":"private, no-store"}});
const inaccessible=()=>new NextResponse(null,{status:404});

// Feature 1: true read-only view of pre-existing internal Customer Support work.
// The approved real inbound-customer-message source and outward acknowledgement are NOT BUILT.
export async function GET(request){
  if(!operationalCentreStagingAllowed())return inaccessible();
  try{
    const founder=await verifyOperationalCentreFounder(request);
    if(!founder.ok)return json({status:founder.reason},founder.http);
    const [work,incident,practice]=await Promise.all([
      founder.admin.from("staff_work_items")
        .select("case_code,status,is_fictional,external_effect_enabled,received_at,response_due_at,submitted_at,verified_completed_at,created_at")
        .eq("environment","staging").eq("workspace_id","customer_support")
        .order("created_at",{ascending:false}).limit(30),
      founder.admin.from("hiissa_operational_incidents")
        .select("incident_id,state,severity")
        .eq("environment","staging")
        .eq("feature_id","customer-communication-service-level-centre").limit(50),
      founder.admin.from("hiissa_support_request_staging")
        .select("id,title,request_summary,lifecycle_state,acknowledgement_state,assigned_department,internal_note,created_at,updated_at,version")
        .eq("environment","staging").order("created_at",{ascending:false}).limit(35)
    ]);
    if(work.error||incident.error||practice.error)return json({
      status:"SOURCE_UNAVAILABLE",
      internalWorkVerified:!work.error,
      practiceSourceVerified:!practice.error,
      canonicalIncidentFeedVerified:!incident.error,
      externalCustomerMessages:"NOT_CONNECTED",productionEffectEnabled:false
    },503);
    const items=(work.data||[]).map(item=>({
      caseCode:item.case_code||"Not recorded",
      stage:item.status||"NOT_RECORDED",fictional:item.is_fictional===true,
      externalEffectEnabled:item.external_effect_enabled===true,
      receivedAt:item.received_at||null,responseDueAt:item.response_due_at||null,
      submittedAt:item.submitted_at||null,verifiedCompletedAt:item.verified_completed_at||null,
      createdAt:item.created_at||null
    }));
    const incidents=incident.data||[];
    return json({
      status:"MONITORING",registryId:"customer-communication-service-level-centre",
      ownerModules:["overview","users-identity","feedback-recommendations","failures-reliability"],
      internalWorkVerified:true,internalWorkSource:"existing-staging-staff_work_items",
      internalWorkCount:items.length,
      actionSourceVerified:true,stagingPracticeCases:practice.data||[],fictionalWorkCount:items.filter(i=>i.fictional).length,items,
      canonicalIncidentFeedVerified:true,openIncidentCount:incidents.filter(i=>i.state!=="verified_resolved").length,
      externalCustomerMessages:"NOT_CONNECTED",externalDeliveryEnabled:false,
      automaticAcknowledgement:"NOT_ACTIVE",acknowledgementTarget:"approximately one minute after successful receipt",
      originalAcknowledgementWording:"RECOVERY_REQUIRED",humanResponseDeadline:"RECONCILIATION_REQUIRED",
      workflow:["RECEIVED","AUTOMATIC_ACKNOWLEDGEMENT_SENT","ASSIGNED","HUMAN_RESPONSE_DUE","RESPONDED","WAITING_FOR_CUSTOMER","RESOLVED"],
      existingFounderApprovalInbox:"REUSED_NOT_DUPLICATED",existingAlerts:"REUSED_NOT_DUPLICATED",
      checkedAt:new Date().toISOString(),productionEffectEnabled:false,
      privacyBoundary:"No customer messages, emails, personal content or authentication tokens are returned."
    });
  }catch{
    return json({status:"SOURCE_UNAVAILABLE",externalCustomerMessages:"NOT_CONNECTED",productionEffectEnabled:false},503);
  }
}

// Working Founder Staging actions: actual transactional insert/assignment/note AND canonical audit.
// No outward message, automatic acknowledgement, response SLA or production/customer data mutation.
export async function POST(request){
  if(!operationalCentreStagingAllowed())return inaccessible();
  try {
    const origin=request.headers.get("origin");
    if(!origin || new URL(origin).origin!==new URL(request.url).origin)
      return json({status:"SAME_ORIGIN_REQUIRED"},403);
    const founder=await verifyOperationalCentreFounder(request);
    if(!founder.ok)return json({status:founder.reason},founder.http);
    const raw=await request.text();
    if(raw.length>4000)return json({status:"PAYLOAD_TOO_LARGE"},413);
    let body;
    try{body=JSON.parse(raw);}catch{return json({status:"INVALID_REQUEST"},400);}
    const action=String(body?.action||"");
    if(!["create","assign","save_internal_note"].includes(action))
      return json({status:"UNAPPROVED_ACTION"},400);
    const title=String(body?.title||"").trim(),summary=String(body?.summary||"").trim();
    const note=String(body?.note||"").trim();
    const id=String(body?.id||"");
    const version=body?.version;
    const uuid=/^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/i;
    if(action==="create" && (title.length<3||title.length>160||summary.length<8||summary.length>2000))
      return json({status:"TITLE_AND_SUMMARY_REQUIRED"},400);
    if(action!=="create" && (!uuid.test(id)||!Number.isSafeInteger(version)||version<1))
      return json({status:"INVALID_CASE_OR_VERSION"},400);
    if(action==="save_internal_note" && (note.length<8||note.length>1500))
      return json({status:"VALID_INTERNAL_NOTE_REQUIRED"},400);
    const {data,error}=await founder.admin.rpc("hiissa_support_staging_founder_command",{
      p_actor:founder.founderUserId,p_action:action,
      p_id:action==="create"?null:id,
      p_title:action==="create"?title:null,p_summary:action==="create"?summary:null,
      p_note:action==="save_internal_note"?note:null,
      p_version:action==="create"?null:version
    });
    if(error){
      const stale=String(error.message||"").includes("SUPPORT_STALE_VERSION");
      return json({status:stale?"STALE_RECORD_REFRESH":"ACTION_NOT_RECORDED"},stale?409:400);
    }
    return json({status:"RECORDED_AND_AUDITED",result:data,externalDeliveryPerformed:false,
      automaticAcknowledgementSent:false,productionEffectEnabled:false});
  }catch{return json({status:"ACTION_NOT_RECORDED"},503);}
}
