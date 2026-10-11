// HIISSA R90: Founder-only, read-only Staging evidence gateway for two approved centres.
// Existing admin_users membership is preserved; no new credentials, permissions, or sources.
import {createClient} from "@supabase/supabase-js";

const STAGING_BRANCH="feature/founder-control-room-staging";
const STAGING_PROJECT="upcssfmilewwshyxyvdf.supabase.co";
const clientOptions={auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}};

export function operationalCentreStagingAllowed(){
  return process.env.VERCEL_GIT_COMMIT_REF===STAGING_BRANCH &&
    (process.env.VERCEL_TARGET_ENV || process.env.VERCEL_ENV)!=="production" &&
    String(process.env.NEXT_PUBLIC_SUPABASE_URL || "").includes(STAGING_PROJECT);
}

export async function verifyOperationalCentreFounder(request){
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publicKey=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const secret=process.env.SUPABASE_SECRET_KEY;
  if(!url||!publicKey||!secret)return {ok:false,http:503,reason:"STAGING_ADMIN_DATA_NOT_CONFIGURED"};
  const header=request.headers.get("authorization") || "";
  const token=header.startsWith("Bearer ")?header.slice(7).trim():"";
  if(!token)return {ok:false,http:401,reason:"UNAUTHENTICATED"};
  const publicClient=createClient(url,publicKey,clientOptions);
  const admin=createClient(url,secret,clientOptions);
  const {data:user,error:authError}=await publicClient.auth.getUser(token);
  if(authError||!user?.user)return {ok:false,http:401,reason:"UNAUTHENTICATED"};
  // Matches the existing single legacy Founder gate, without granting a new role.
  // Multiple members or a mismatch must fail closed until separate Founder approval.
  const {data:members,error:memberError}=await admin.from("admin_users").select("user_id").limit(2);
  if(memberError||members?.length!==1||members[0]?.user_id!==user.user.id)
    return {ok:false,http:403,reason:"FOUNDER_GATE_REQUIRED"};
  return {ok:true,admin};
}
