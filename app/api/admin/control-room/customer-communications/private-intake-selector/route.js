// HIISSA R188: dormant, isolated Founder-only STAGING selector for safe internal
// handling. This is NOT the original aggregate-only Founder dashboard.
// It exposes only per-case opaque reference, version and workflow metadata to
// the already-authorised Founder, never customer message, identity or email.
// It is READ ONLY: no routing, acknowledgement, outbound delivery, SLA or staff grant.
import {NextResponse} from "next/server";
import {
  operationalCentreStagingAllowed,
  verifyOperationalCentreFounder
} from "../../../../../../lib/admin/founder-staging-operational-centres.js";

export const dynamic="force-dynamic";
const result=(body,status=200)=>NextResponse.json(body,{
  status,headers:{"Cache-Control":"private, no-store","X-Content-Type-Options":"nosniff"}
});
const hidden=()=>new NextResponse(null,{status:404});

export async function GET(request){
  if(!operationalCentreStagingAllowed())return hidden();
  try{
    const founder=await verifyOperationalCentreFounder(request);
    if(!founder.ok)return result({status:founder.reason,externalDeliveryPerformed:false},founder.http);

    // Never use SELECT *. In particular, do not fetch subject, message_body,
    // client_nonce or customer_user_id even into server memory.
    const {data,error}=await founder.admin
      .from("hiissa_customer_support_inbox_staging")
      .select("id,version,lifecycle_state,acknowledgement_state,assigned_department,created_at")
      .eq("environment","staging")
      .order("created_at",{ascending:false})
      .limit(20);
    if(error||!Array.isArray(data))
      return result({status:"PRIVATE_SELECTOR_SOURCE_UNAVAILABLE",externalDeliveryPerformed:false},503);

    const items=data.map(item=>({
      requestId:item.id,
      version:item.version,
      lifecycleState:item.lifecycle_state,
      acknowledgementState:item.acknowledgement_state,
      assignedDepartment:item.assigned_department||null,
      receivedAt:item.created_at
    }));
    return result({
      status:"PRIVATE_STAGING_SELECTOR_READ_ONLY",
      registryId:"customer-communication-service-level-centre",
      audience:"ORIGINAL_FOUNDER_ONLY",
      caseMetadataOnly:true,
      items,
      additionalResultsNotShown:items.length===20,
      acknowledgementEnabled:false,
      responseDeadlineApproved:false,
      staffAccessGranted:false,
      externalDeliveryPerformed:false,
      productionEffectEnabled:false
    });
  }catch{
    return result({status:"PRIVATE_SELECTOR_SOURCE_UNAVAILABLE",externalDeliveryPerformed:false},503);
  }
}
