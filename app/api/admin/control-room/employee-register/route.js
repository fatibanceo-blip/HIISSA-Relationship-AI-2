import {createClient} from "@supabase/supabase-js";
import {NextResponse} from "next/server";

export const dynamic = "force-dynamic";
function answer(payload,status=200) {
  return NextResponse.json(payload,{status,headers:{"Cache-Control":"no-store, private"}});
}
function allowed() {
  const branch=process.env.VERCEL_GIT_COMMIT_REF || "";
  const target=process.env.VERCEL_TARGET_ENV || process.env.VERCEL_ENV || "";
  return branch==="feature/founder-control-room-staging" && target!=="production";
}
export async function GET(request) {
  if(!allowed()) return new NextResponse(null,{status:404});
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publicKey=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const secret=process.env.SUPABASE_SECRET_KEY;
  if(!url || !publicKey || !secret) return answer({status:"EMPLOYEE_DATA_NOT_CONFIGURED"},503);

  const bearer=request.headers.get("authorization") || "";
  const token=bearer.startsWith("Bearer ") ? bearer.slice(7).trim() : "";
  if(!token) return answer({status:"UNAUTHENTICATED"},401);
  const options={auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}};
  const authClient=createClient(url,publicKey,options);
  const adminClient=createClient(url,secret,options);

  try {
    const {data:userData,error:userError}=await authClient.auth.getUser(token);
    if(userError || !userData?.user) return answer({status:"UNAUTHENTICATED"},401);
    const {data:founder,error:founderError}=await adminClient.from("admin_users")
      .select("user_id").eq("user_id",userData.user.id).maybeSingle();
    if(founderError || !founder) return answer({status:"FOUNDER_GATE_REQUIRED"},403);

    const [people,attendance,applications]=await Promise.all([
      adminClient.from("hiissa_employee_register")
        .select("employee_id,display_name,department,role_label,employment_state,engagement_type,start_date,archived_at,created_at",{count:"exact"})
        .eq("environment","staging").order("created_at",{ascending:false}).limit(100),
      adminClient.from("hiissa_attendance_events")
        .select("attendance_event_id,employee_id,attendance_kind,occurred_at,recorded_at",{count:"exact"})
        .eq("environment","staging").order("occurred_at",{ascending:false}).limit(100),
      adminClient.from("hiissa_staff_onboarding_applications")
        .select("application_id,submission_state,created_at",{count:"exact"})
        .eq("environment","staging").in("submission_state",["submitted","under_review"])
        .order("created_at",{ascending:false}).limit(100)
    ]);
    if(people.error || attendance.error || applications.error) {
      console.error("HIISSA_EMPLOYEE_READ_FAILED",{
        employeeReadFailed:Boolean(people.error),
        attendanceReadFailed:Boolean(attendance.error),
        applicationReadFailed:Boolean(applications.error)
      });
      return answer({status:"EMPLOYEE_REGISTER_READ_FAILED"},503);
    }
    return answer({
      status:"READY",scope:"staging-founder-readonly",source:"verified-staging-tables",
      realEmployeeCount:people.count ?? 0,attendanceEventCount:attendance.count ?? 0,
      pendingApplicationCount:applications.count ?? 0,
      employees:people.data || [],attendanceEvents:attendance.data || [],
      // No inferred "present today", leave or not-checked-in states: attendance policy is pending.
      attendanceDailyClassification:"NOT_CERTIFIED",
      returnedLimit:100
    });
  } catch {
    console.error("HIISSA_EMPLOYEE_READ_EXCEPTION",{scope:"staging-founder-readonly"});
    return answer({status:"EMPLOYEE_REGISTER_UNAVAILABLE"},503);
  }
}
