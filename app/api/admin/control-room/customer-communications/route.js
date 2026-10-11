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
    const [work,incident]=await Promise.all([
      founder.admin.from("staff_work_items")
        .select("case_code,status,is_fictional,external_effect_enabled,received_at,response_due_at,submitted_at,verified_completed_at,created_at")
        .eq("environment","staging").eq("workspace_id","customer_support")
        .order("created_at",{ascending:false}).limit(30),
      founder.admin.from("hiissa_operational_incidents")
        .select("incident_id,state,severity")
        .eq("environment","staging")
        .eq("feature_id","customer-communication-service-level-centre").limit(50)
    ]);
    if(work.error||incident.error)return json({
      status:"SOURCE_UNAVAILABLE",
      internalWorkVerified:!work.error,
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
      internalWorkCount:items.length,fictionalWorkCount:items.filter(i=>i.fictional).length,items,
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
