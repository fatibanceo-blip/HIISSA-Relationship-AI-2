import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function blocked(status = 404) { return new NextResponse(null, { status }); }
function json(payload, status = 200) { return NextResponse.json(payload, { status, headers: { "Cache-Control": "private, no-store" } }); }
function environmentAllowed() {
  const branch = process.env.VERCEL_GIT_COMMIT_REF || "";
  const environment = process.env.VERCEL_TARGET_ENV || process.env.VERCEL_ENV || "";
  return branch === "feature/founder-control-room-staging" && environment !== "production";
}
function clients() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || !process.env.SUPABASE_SECRET_KEY) return null;
  const auth = { persistSession:false, autoRefreshToken:false, detectSessionInUrl:false };
  return {
    verify:createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,{auth}),
    admin:createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SECRET_KEY,{auth}),
  };
}
async function founder(request) {
  const c=clients(); if(!c) return {ok:false,status:503,reason:"STAGING_ADMIN_DATA_NOT_CONFIGURED"};
  const h=request.headers.get("authorization")||"";
  const token=h.startsWith("Bearer ")?h.slice(7).trim():"";
  if(!token) return {ok:false,status:401,reason:"UNAUTHENTICATED"};
  const {data,error}=await c.verify.auth.getUser(token);
  if(error||!data?.user) return {ok:false,status:401,reason:"UNAUTHENTICATED"};
  const {data:adminRow,error:adminError}=await c.admin.from("admin_users").select("user_id").eq("user_id",data.user.id).maybeSingle();
  if(adminError||!adminRow) return {ok:false,status:403,reason:"FOUNDER_GATE_REQUIRED"};
  return {ok:true,id:data.user.id,admin:c.admin};
}
function safeRole(value){return String(value||"staff").replaceAll("_"," ").replace(/\b\w/g,(m)=>m.toUpperCase());}
async function inventory(admin){
  const {data,error}=await admin.rpc("founder_staff_session_inventory");
  if(error) throw error;
  const byUser=new Map();
  for(const row of data||[]){
    if(!byUser.has(row.user_id)) byUser.set(row.user_id,{targetKey:row.user_id,role:safeRole(row.role_id),sessions:[]});
    if(row.session_id) byUser.get(row.user_id).sessions.push({sessionKey:row.session_id,createdAt:row.session_created_at,lastActiveAt:row.session_updated_at});
  }
  return [...byUser.values()].map((item,index)=>({...item,label:`${item.role} staff ${index+1}`,sessionCount:item.sessions.length}));
}
export async function GET(request){
  if(!environmentAllowed()) return blocked();
  const f=await founder(request); if(!f.ok) return json({status:f.reason},f.status);
  try {
    const staff=await inventory(f.admin);
    const {data:accessRows,error:accessError}=await f.admin.rpc("founder_staff_access_inventory");
    if(accessError) throw accessError;
    const accessByUser=new Map((accessRows||[]).map(row=>[row.user_id,row]));
    for(const person of staff){const access=accessByUser.get(person.targetKey); person.accessState=access?.access_state||"active"; person.accessChangedAt=access?.changed_at||null;}
    for(const row of accessRows||[]){if(!staff.some(p=>p.targetKey===row.user_id)) staff.push({targetKey:row.user_id,role:safeRole(row.role_id),sessions:[],label:`${safeRole(row.role_id)} staff ${staff.length+1}`,sessionCount:Number(row.session_count||0),accessState:row.access_state||"active",accessChangedAt:row.changed_at||null});}
    return json({
      status:"MONITORING", scope:"staging-staff-session-device-control", staff,
      boundaries:{
        founderSessionsTargetable:false, productionEffect:false, physicalDeviceIdentityAvailable:false,
        sessionMeaning:"A session is a signed-in browser/app session. HIISSA does not claim it uniquely identifies a physical device.",
        accessTokenBoundary:"Revoked refresh sessions cannot refresh again; an already-issued access token can remain valid until its normal expiry."
      }
    });
  } catch(error){ console.error("Staff session inventory failed",error); return json({status:"SOURCE_UNAVAILABLE"},503); }
}
export async function POST(request){
  if(!environmentAllowed()) return blocked();
  const f=await founder(request); if(!f.ok) return json({status:f.reason},f.status);
  let body={}; try{body=await request.json();}catch{}
  const targetUserId=String(body.targetUserId||"").trim();
  const targetSessionId=body.targetSessionId?String(body.targetSessionId).trim():null;
  const reason=String(body.reason||"").trim();
  const accessAction=String(body.accessAction||"").trim();
  if(!targetUserId||reason.length<10) return json({status:"REASON_AND_TARGET_REQUIRED"},400);
  if(targetUserId===f.id) return json({status:"FOUNDER_SELF_REVOCATION_BLOCKED"},400);
  try{
    if(["suspend","restore","permanently_revoke"].includes(accessAction)){
      const {data:changed,error:changeError}=await f.admin.rpc("founder_change_staff_access",{target_user_id:targetUserId,requested_action:accessAction,action_reason:reason,founder_user_id:f.id});
      if(changeError) throw changeError;
      const result=changed?.[0]||{};
      const {error:auditError}=await f.admin.from("admin_audit_events").insert({
        event_type:accessAction==="suspend"?"founder_staff_access_suspended":accessAction==="restore"?"founder_staff_access_restored":"founder_staff_access_permanently_revoked",
        actor_user_id:f.id,target_user_id:targetUserId,module_id:"admin-security-audit",resource_id:"staff-access",
        action_id:accessAction,outcome:"recorded",oversight_level:3,environment:"staging",
        details:{reason,new_state:result.new_state,revoked_session_count:Number(result.revoked_sessions||0),founder_lockout_protection:true,historical_evidence_preserved:true,production_effect:false}
      });
      if(auditError) throw auditError;
      return json({status:"ACCESS_CHANGE_RECORDED_AND_EXECUTED",accessState:result.new_state,revokedSessionCount:Number(result.revoked_sessions||0),historicalEvidencePreserved:true,productionEffect:false});
    }
    const {data,error}=await f.admin.rpc("founder_revoke_staff_session",{target_user_id:targetUserId,target_session_id:targetSessionId});
    if(error) throw error;
    const revoked=Number(data?.[0]?.revoked_count||0);
    const {error:auditError}=await f.admin.from("admin_audit_events").insert({
      event_type:"founder_staff_session_revoked",actor_user_id:f.id,target_user_id:targetUserId,
      module_id:"admin-security-audit",resource_id:"staff-session",action_id:targetSessionId?"revoke_one_session":"force_sign_out_all_sessions",
      outcome:"recorded",oversight_level:3,environment:"staging",
      details:{reason,revoked_session_count:revoked,physical_device_identity_claimed:false,production_effect:false}
    });
    if(auditError) throw auditError;
    return json({status:"RECORDED_AND_EXECUTED",revokedSessionCount:revoked,productionEffect:false});
  }catch(error){console.error("Staff session revocation failed",error); return json({status:"REVOCATION_FAILED"},500);}
}
