import {NextResponse} from "next/server";
import {operationalCentreStagingAllowed,verifyOperationalCentreFounder} from "../../../../../lib/admin/founder-staging-operational-centres.js";

export const dynamic="force-dynamic";
const json=(body,status=200)=>NextResponse.json(body,{status,headers:{"Cache-Control":"private, no-store"}});
const inaccessible=()=>new NextResponse(null,{status:404});

// Feature 2: approved evidence-based review, never a subjective staff score.
// Existing Staging onboarding/register/access sources only. No employee actions.
export async function GET(request){
  if(!operationalCentreStagingAllowed())return inaccessible();
  try{
    const founder=await verifyOperationalCentreFounder(request);
    if(!founder.ok)return json({status:founder.reason},founder.http);
    const [employees,onboarding,roles,restrictions,incidents]=await Promise.all([
      founder.admin.from("hiissa_employee_register")
        .select("employee_id,display_name,department,role_label,employment_state,engagement_type,created_at")
        .eq("environment","staging").order("created_at",{ascending:false}).limit(40),
      founder.admin.from("hiissa_staff_onboarding_applications")
        .select("application_id,submission_state,submitted_at")
        .eq("environment","staging").limit(100),
      founder.admin.from("admin_role_assignments")
        .select("id,revoked_at")
        .eq("environment","staging").limit(100),
      founder.admin.from("admin_access_restrictions")
        .select("user_id,state")
        .eq("environment","staging").limit(100),
      founder.admin.from("hiissa_operational_incidents")
        .select("incident_id,state")
        .eq("environment","staging")
        .eq("feature_id","staff-trust-training-access-review").limit(50)
    ]);
    const missing=[
      employees.error?"employee-register":null,onboarding.error?"onboarding":null,
      roles.error?"role-assignments":null,restrictions.error?"access-restrictions":null,
      incidents.error?"canonical-incidents":null
    ].filter(Boolean);
    if(missing.length)return json({
      status:"SOURCE_UNAVAILABLE",unverifiedSources:missing,productionEffectEnabled:false
    },503);
    const staff=(employees.data||[]).map(p=>({
      label:p.display_name||"Name not recorded",department:p.department||"Not recorded",
      role:p.role_label||"Not recorded",engagementState:p.employment_state||"Not recorded",
      engagementType:p.engagement_type||"Not recorded",registeredAt:p.created_at||null
    }));
    const roleRows=roles.data||[];
    return json({
      status:"MONITORING",registryId:"staff-trust-training-access-review",
      ownerModules:["users-identity","admin-security-audit"],
      source:"existing-staging-employee-onboarding-access-records",
      employeeRegisterVerified:true,employeeCount:staff.length,staff,
      onboardingVerified:true,applicationCount:(onboarding.data||[]).length,
      submittedApplicationCount:(onboarding.data||[]).filter(a=>!!a.submitted_at).length,
      activeAdminRoleAssignments:roleRows.filter(r=>!r.revoked_at).length,
      recordedAccessRestrictions:(restrictions.data||[]).length,
      canonicalIncidentFeedVerified:true,
      openIncidentCount:(incidents.data||[]).filter(i=>i.state!=="verified_resolved").length,
      policiesAndVersions:"NOT_CERTIFIED",requiredTraining:"NOT_CONNECTED",
      lastAccessReview:"NOT_CERTIFIED",nextReviewDue:"NOT_CONFIGURED",
      temporaryPermissionExpiry:"NOT_CONNECTED",roleChangeHistory:"NOT_CERTIFIED",
      noOpaqueTrustScore:true,staffAccountChangesEnabled:false,productionEffectEnabled:false,
      checkedAt:new Date().toISOString(),
      privacyBoundary:"Founder-only aggregate and minimum-necessary employee identity; no email, policy evidence contents, tokens or passwords."
    });
  }catch{
    return json({status:"SOURCE_UNAVAILABLE",productionEffectEnabled:false},503);
  }
}
