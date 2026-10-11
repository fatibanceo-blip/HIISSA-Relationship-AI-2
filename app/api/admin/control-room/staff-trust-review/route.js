import {HIISSA_PROTOTYPE_STAFF} from "../../../../../lib/hiissa-prototype-staff-directory.js";
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
    const [employees,onboarding,roles,restrictions,incidents,practice]=await Promise.all([
      founder.admin.from("hiissa_employee_register")
        .select("employee_id,display_name,department,role_label,employment_state,engagement_type,created_at")
        .eq("environment","staging").order("created_at",{ascending:false}).limit(40),
      founder.admin.from("hiissa_staff_onboarding_applications")
        .select("application_id,submission_state,submitted_at")
        .eq("environment","staging").limit(100),
      founder.admin.from("admin_role_assignments")
        .select("id,revoked_at")
        .eq("environment","staging").limit(100),
      // Reuse the existing authorised Founder-only staff access inventory RPC.
      // Existing protected admin_access_restrictions intentionally denies
      // direct SELECT to service_role; NEVER change its grants or RLS.
      founder.admin.rpc("founder_staff_access_inventory"),
      founder.admin.from("hiissa_operational_incidents")
        .select("incident_id,state")
        .eq("environment","staging")
        .eq("feature_id","staff-trust-training-access-review").limit(50),
      founder.admin.from("hiissa_staff_review_staging")
        .select("id,staff_reference,review_area,evidence_reference,evidence_note,due_on,state,founder_review_note,created_at,reviewed_at,updated_at,version")
        .eq("environment","staging").order("created_at",{ascending:false}).limit(35)
    ]);
    const missing=[
      employees.error?"employee-register":null,onboarding.error?"onboarding":null,
      roles.error?"role-assignments":null,restrictions.error?"access-restrictions":null,
      incidents.error?"canonical-incidents":null,practice.error?"practice-actions":null
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
      actionSourceVerified:true,stagingPracticeReviews:practice.data||[],
      fictionalRoster:HIISSA_PROTOTYPE_STAFF.map(p=>({id:p.id,name:p.name,role:p.role,department:p.departmentLabel})),
      onboardingVerified:true,applicationCount:(onboarding.data||[]).length,
      submittedApplicationCount:(onboarding.data||[]).filter(a=>!!a.submitted_at).length,
      activeAdminRoleAssignments:roleRows.filter(r=>!r.revoked_at).length,
      // This pre-existing inventory contains CURRENT non-Founder access states,
      // not every historical restriction row. Do not conflate those metrics.
      recordedAccessRestrictions:null,
      currentRestrictedStaffCount:(restrictions.data||[]).filter(r=>r.access_state!=="active").length,
      accessRestrictionsSource:"EXISTING_FOUNDER_ACCESS_INVENTORY",
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
    // Fail closed. Return a fixed diagnosis without exposing provider errors,
    // customer/staff content, tokens, SQL, or an internal stack trace.
    return json({status:"SOURCE_READ_FAILED",productionEffectEnabled:false},503);
  }
}

// Existing Founder-only canonical-fictional Staging directory is the permitted test source.
// Every response status is a real persisted practice review + canonical Admin audit event.
// No real employment, training certification or staff permission is changed by these actions.
export async function POST(request){
  if(!operationalCentreStagingAllowed())return inaccessible();
  try{
    const origin=request.headers.get("origin");
    if(!origin || new URL(origin).origin!==new URL(request.url).origin)
      return json({status:"SAME_ORIGIN_REQUIRED"},403);
    const founder=await verifyOperationalCentreFounder(request);
    if(!founder.ok)return json({status:founder.reason},founder.http);
    const raw=await request.text();
    if(raw.length>5000)return json({status:"PAYLOAD_TOO_LARGE"},413);
    let body;
    try{body=JSON.parse(raw)}catch{return json({status:"INVALID_REQUEST"},400);}
    const action=String(body?.action||"");
    if(!["record","verify_practice","request_correction"].includes(action))
      return json({status:"UNAPPROVED_ACTION"},400);
    const reference=String(body?.staffReference||"").trim();
    const area=String(body?.reviewArea||"").trim();
    const evidence=String(body?.evidenceReference||"").trim();
    const note=String(body?.evidenceNote||"").trim();
    const founderNote=String(body?.founderNote||"").trim();
    const id=String(body?.id||"");
    const version=body?.version;
    const uuid=/^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/i;
    const areas=["POLICY_ACCEPTANCE","TRAINING_EVIDENCE","ACCESS_REVIEW",
      "TEMPORARY_PERMISSION","SECURITY_CONCERN","ROLE_CHANGE"];
    const dueOn=String(body?.dueOn||"").trim();
    if(action==="record" && (
       !HIISSA_PROTOTYPE_STAFF.some(p=>p.id===reference)||!areas.includes(area)||
       evidence.length<8||evidence.length>240||note.length<10||note.length>1500||
       (dueOn&&!/^\d{4}-\d{2}-\d{2}$/.test(dueOn))
    ))return json({status:"VALID_FICTIONAL_STAFF_EVIDENCE_REQUIRED"},400);
    if(action!=="record" && (!uuid.test(id)||!Number.isSafeInteger(version)||version<1||
      founderNote.length<8||founderNote.length>1000))
      return json({status:"VALID_REVIEW_REASON_REQUIRED"},400);
    const {data,error}=await founder.admin.rpc("hiissa_staff_review_staging_founder_command",{
      p_actor:founder.founderUserId,p_action:action,
      p_id:action==="record"?null:id,
      p_staff_reference:action==="record"?reference:null,
      p_review_area:action==="record"?area:null,
      p_evidence_reference:action==="record"?evidence:null,
      p_evidence_note:action==="record"?note:null,
      p_due_on:action==="record"&&dueOn?dueOn:null,
      p_founder_note:action==="record"?null:founderNote,
      p_version:action==="record"?null:version
    });
    if(error){
      const stale=String(error.message||"").includes("REVIEW_STALE_VERSION");
      return json({status:stale?"STALE_RECORD_REFRESH":"ACTION_NOT_RECORDED"},stale?409:400);
    }
    return json({status:"RECORDED_AND_AUDITED",result:data,practiceOnly:true,
      realStaffCertificationPerformed:false,permissionsChanged:false,productionEffectEnabled:false});
  }catch{return json({status:"ACTION_NOT_RECORDED"},503);}
}
