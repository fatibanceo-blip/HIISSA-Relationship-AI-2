// HIISSA R185 — isolated Staging-only Founder internal department routing.
// Existing original Founder dashboard AGGREGATE_ONLY privacy is unchanged.
// NEVER acknowledges, messages, grants staff access or sets unapproved SLA.
import {NextResponse} from "next/server";
import {
  operationalCentreStagingAllowed,
  verifyOperationalCentreFounder
} from "../../../../../../lib/admin/founder-staging-operational-centres.js";

export const dynamic="force-dynamic";
const json=(body,status=200)=>NextResponse.json(body,{
  status,headers:{"Cache-Control":"private, no-store"}
});
const hidden=()=>new NextResponse(null,{status:404});
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function POST(request){
  if(!operationalCentreStagingAllowed())return hidden();
  try{
    const origin=request.headers.get("origin");
    if(!origin||new URL(origin).origin!==new URL(request.url).origin)
      return json({status:"SAME_ORIGIN_REQUIRED",externalDeliveryPerformed:false},403);
    const founder=await verifyOperationalCentreFounder(request);
    if(!founder.ok)return json({status:founder.reason,externalDeliveryPerformed:false},founder.http);

    // Bounded, fixed-action request. This endpoint is NOT connected to the
    // approved aggregate-only Founder dashboard or any unapproved staff UI.
    const raw=await request.text();
    if(raw.length>512)return json({status:"INVALID_ROUTE_REQUEST",externalDeliveryPerformed:false},413);
    let body;
    try{body=JSON.parse(raw)}catch{return json({status:"INVALID_ROUTE_REQUEST",externalDeliveryPerformed:false},400)}
    if(body?.action!=="route_to_customer_support"||
      !UUID.test(String(body?.requestId||""))||
      !Number.isSafeInteger(body?.version)||body.version<1)
      return json({status:"INVALID_ROUTE_REQUEST",externalDeliveryPerformed:false},400);

    const {data,error}=await founder.admin.rpc(
      "hiissa_customer_support_staging_route_department",{
        p_founder:founder.founderUserId,
        p_request_id:body.requestId,
        p_expected_version:body.version
      }
    );
    if(error||data?.status!=="RECORDED_AND_AUDITED"||
      data?.externalDeliveryPerformed!==false)
      return json({status:"ROUTING_NOT_RECORDED",externalDeliveryPerformed:false},409);
    return json({
      status:"RECORDED_AND_AUDITED",
      department:"customer_support",
      lifecycleState:"RECEIVED",
      acknowledgementState:"NOT_SENT",
      version:data.version,
      externalDeliveryPerformed:false,
      productionEffectEnabled:false
    });
  }catch{
    return json({status:"ROUTING_UNAVAILABLE",externalDeliveryPerformed:false},503);
  }
}
