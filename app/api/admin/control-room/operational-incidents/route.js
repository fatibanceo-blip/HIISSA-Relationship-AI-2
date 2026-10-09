import {createClient} from "@supabase/supabase-js";
import {NextResponse} from "next/server";
export const dynamic = "force-dynamic";
const reply=(payload,status=200)=>NextResponse.json(payload,{status,headers:{"Cache-Control":"private, no-store"}});
const clientOptions={auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}};
const stagingOnly=()=>process.env.VERCEL_GIT_COMMIT_REF==="feature/founder-control-room-staging" &&
  (process.env.VERCEL_TARGET_ENV || process.env.VERCEL_ENV) !== "production" &&
  (process.env.NEXT_PUBLIC_SUPABASE_URL || "").includes("upcssfmilewwshyxyvdf.supabase.co");
export async function GET(request) {
  if (!stagingOnly()) return new NextResponse(null,{status:404});
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const secret=process.env.SUPABASE_SECRET_KEY;
  if (!url || !key || !secret) return reply({status:"STAGING_ADMIN_DATA_NOT_CONFIGURED"},503);
  const auth=request.headers.get("authorization") || "";
  const token=auth.startsWith("Bearer ")?auth.slice(7).trim():"";
  if (!token) return reply({status:"UNAUTHENTICATED"},401);
  try {
    const publicClient=createClient(url,key,clientOptions);
    const adminClient=createClient(url,secret,clientOptions);
    const {data:session,error:sessionError}=await publicClient.auth.getUser(token);
    if (sessionError || !session?.user) return reply({status:"UNAUTHENTICATED"},401);
    const {data:founder,error:founderError}=await adminClient.from("admin_users")
      .select("user_id").eq("user_id",session.user.id).maybeSingle();
    if (founderError || !founder) return reply({status:"FOUNDER_GATE_REQUIRED"},403);
    const {data, error}=await adminClient.from("hiissa_operational_incidents")
      .select("incident_id,feature_id,owner_module_id,title,summary,state,severity,oversight_level,recovery_classification,retry_attempts,max_safe_retries,verification_state,verification_reference,first_observed_at,last_observed_at,verified_at,version")
      .eq("environment","staging").order("last_observed_at",{ascending:false}).limit(40);
    if (error) return reply({status:"OPERATIONAL_INCIDENT_SOURCE_UNAVAILABLE"},503);
    const incidents=(data || []).map(item=>({
      incidentId:item.incident_id,featureId:item.feature_id,
      ownerModuleId:item.owner_module_id,title:item.title,summary:item.summary,
      state:item.state,severity:item.severity,oversightLevel:item.oversight_level,
      recoveryClassification:item.recovery_classification,
      retriesAttempted:item.retry_attempts,maxSafeRetries:item.max_safe_retries,
      verificationState:item.verification_state,
      verificationReference:item.verification_reference,
      firstObservedAt:item.first_observed_at,lastObservedAt:item.last_observed_at,
      verifiedAt:item.verified_at,version:item.version,
      founderActionRequired:item.oversight_level===3 && item.state!=="verified_resolved",
    }));
    return reply({
      status:"MONITORING",featureId:"hiissa.admin.shared-operational-incidents",
      source:"canonical-staging-incidents-and-existing-audit-trail",
      sourceState:incidents.length?"RECORDED_INCIDENTS":"READABLE_EMPTY",
      openIncidentCount:incidents.filter(i=>i.state!=="verified_resolved").length,
      incidents,
      existingAudit:"admin_audit_events",existingFounderApprovals:"admin_approval_requests",
      notificationDelivery:"NOT_YET_WIRED",automaticRecovery:"NOT_YET_WIRED",
      crossModuleDisplay:"NOT_YET_WIRED",checkedAt:new Date().toISOString(),
      privacyBoundary:"Authorised Founder operational metadata only. No private conversation data.",
      productionEffectEnabled:false,
    });
  }catch{
    return reply({status:"OPERATIONAL_INCIDENT_SOURCE_UNAVAILABLE"},503);
  }
}
