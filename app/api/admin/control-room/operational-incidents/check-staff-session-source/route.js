/**
 * Explicit Founder-authorised staff-session source audit: STAGING ONLY.
 * No GET side effects, no client-supplied fake faults and no automatic cron.
 * Real staff identities and sessions never appear in responses.
 */
import {createClient} from "@supabase/supabase-js";
import {NextResponse} from "next/server";
import {monitorStaffSessionOperationalSources} from "../../../../../../lib/admin/staff-session-operational-incident-producer-staging.js";

export const dynamic="force-dynamic";
const clientOptions={auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}};
const reply=(payload,status=200)=>NextResponse.json(payload,{status,headers:{"Cache-Control":"private, no-store"}});

function stagingOnly(){
  try{
    const url=new URL(process.env.NEXT_PUBLIC_SUPABASE_URL||"");
    const target=process.env.VERCEL_TARGET_ENV||process.env.VERCEL_ENV||"";
    return process.env.VERCEL_GIT_COMMIT_REF==="feature/founder-control-room-staging" &&
      target==="staging" && url.protocol==="https:" &&
      url.hostname==="upcssfmilewwshyxyvdf.supabase.co";
  }catch{return false;}
}
export async function POST(request){
  if(!stagingOnly())return new NextResponse(null,{status:404});
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishable=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const secret=process.env.SUPABASE_SECRET_KEY;
  if(!url||!publishable||!secret)return reply({status:"STAGING_ADMIN_DATA_NOT_CONFIGURED"},503);
  // An empty request is mandatory. Reject fake-source symptoms and metadata.
  if(request.body!==null || Number(request.headers.get("content-length")||0)>0 ||
     request.headers.get("transfer-encoding"))return reply({status:"REQUEST_BODY_NOT_ALLOWED"},400);
  const auth=request.headers.get("authorization")||"";
  const match=/^Bearer (\S+)$/.exec(auth);
  if(!match)return reply({status:"UNAUTHENTICATED"},401);
  try{
    const verify=createClient(url,publishable,clientOptions);
    const server=createClient(url,secret,clientOptions);
    const {data:identity,error:identityError}=await verify.auth.getUser(match[1]);
    if(identityError||!identity?.user)return reply({status:"UNAUTHENTICATED"},401);
    // Preserve the single existing legacy Founder membership gate. Fail
    // closed on migration/identity ambiguity; do not grant staff privileges.
    const {data:admins,error:adminError}=await server.from("admin_users")
      .select("user_id").limit(2);
    if(adminError||admins?.length!==1||admins[0].user_id!==identity.user.id)
      return reply({status:"FOUNDER_GATE_REQUIRED"},403);

    const result=await monitorStaffSessionOperationalSources(server);
    return reply({
      status:result.status,sourceState:result.sourceState,sourceFlags:result.flags,
      sourceCounts:result.counts,checkedAt:new Date().toISOString(),
      incidentAction:result.incidentAction,
      incidentPersistence:result.incidentPersistence,
      existingCanonicalIncidentSource:"hiissa_operational_incidents",
      existingFounderTimeline:"admin_audit_events",
      notificationDelivery:result.notificationDelivery,
      automaticRecovery:result.automaticRecovery,
      monitoringSchedule:"NOT_YET_WIRED",productionEffectEnabled:false,
      privacyBoundary:"Staging-only aggregate staff source evidence; no user/session records returned."
    },result.ok?200:503);
  }catch{
    return reply({status:"STAFF_SOURCE_MONITOR_UNAVAILABLE",
      incidentPersistence:"NOT_VERIFIED",productionEffectEnabled:false},503);
  }
}
