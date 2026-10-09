/**
 * Staging-only Founder-authorised explicit source monitor.
 * The original read-only employee GET and Founder dashboard remain unchanged.
 * No public cron, unauthenticated write, body-supplied false fault or Production effect.
 */
import {createClient} from "@supabase/supabase-js";
import {NextResponse} from "next/server";
import {monitorEmployeeOperationalSources} from "../../../../../lib/admin/employee-operational-incident-producer-staging.js";

export const dynamic="force-dynamic";
const clientOptions={auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}};
const reply=(payload,status=200)=>NextResponse.json(payload,{status,headers:{"Cache-Control":"private, no-store"}});
function stagingOnly(){
  try {
    const url=new URL(process.env.NEXT_PUBLIC_SUPABASE_URL||"");
    return process.env.VERCEL_GIT_COMMIT_REF==="feature/founder-control-room-staging" &&
      (process.env.VERCEL_TARGET_ENV||process.env.VERCEL_ENV)!=="production" &&
      url.protocol==="https:" && url.hostname==="upcssfmilewwshyxyvdf.supabase.co";
  } catch {return false;}
}
export async function POST(request){
  if(!stagingOnly()) return new NextResponse(null,{status:404});
  const publicKey=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const secret=process.env.SUPABASE_SECRET_KEY;
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
  if(!publicKey||!secret||!url) return reply({status:"STAGING_ADMIN_DATA_NOT_CONFIGURED"},503);
  // Never accept client-supplied symptoms, fake counts or personnel content.
  if(Number(request.headers.get("content-length")||0)>0 || request.headers.get("transfer-encoding"))
    return reply({status:"REQUEST_BODY_NOT_ALLOWED"},400);
  const bearer=request.headers.get("authorization")||"";
  const match=/^Bearer ([^\\s]+)$/.exec(bearer);
  if(!match) return reply({status:"UNAUTHENTICATED"},401);
  try {
    const verifier=createClient(url,publicKey,clientOptions);
    const server=createClient(url,secret,clientOptions);
    const {data:identity,error:identityError}=await verifier.auth.getUser(match[1]);
    if(identityError||!identity?.user) return reply({status:"UNAUTHENTICATED"},401);
    const {data:founder,error:founderError}=await server.from("admin_users")
      .select("user_id").eq("user_id",identity.user.id).maybeSingle();
    if(founderError||!founder) return reply({status:"FOUNDER_GATE_REQUIRED"},403);
    const result=await monitorEmployeeOperationalSources(server);
    const status=result.sourceState==="SOURCE_READ_FAILED"||!result.ok?503:200;
    return reply({
      status:result.status,sourceState:result.sourceState,sourceFlags:result.flags,
      checkedAt:new Date().toISOString(),incidentAction:result.incidentAction,
      incidentPersistence:result.incidentPersistence,
      existingFounderTimeline:"admin_audit_events",
      notificationDelivery:result.notificationDelivery||"NOT_YET_WIRED",
      automaticRecovery:result.automaticRecovery||"NOT_ACTIVE",
      monitoringSchedule:"NOT_YET_WIRED",productionEffectEnabled:false,
      privacyBoundary:"Read-only aggregate source checks; Founder operational metadata only."
    },status);
  } catch {
    return reply({status:"EMPLOYEE_SOURCE_MONITOR_UNAVAILABLE",
      incidentPersistence:"NOT_VERIFIED",productionEffectEnabled:false},503);
  }
}
