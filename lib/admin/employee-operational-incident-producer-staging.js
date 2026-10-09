/**
 * STAGING ONLY — isolated source-backed operational incident producer.
 * No scheduling, automatic recovery, notifications or staff-data mutations.
 * Never read staff/personnel row content; only exact aggregate counts.
 * Reuse the canonical incident helper and the existing transaction audit trigger.
 */
import {recordNewIncident} from "./operational-incident-staging.js";

const CHECKS = Object.freeze([
  {name:"employees",table:"hiissa_employee_register",column:"employee_id"},
  {name:"onboarding",table:"hiissa_staff_onboarding_applications",column:"application_id"},
  {name:"awaiting_review",table:"hiissa_staff_onboarding_applications",column:"application_id"},
  {name:"attendance",table:"hiissa_attendance_events",column:"attendance_event_id"},
]);

const INCIDENT_KEY="hiissa.employee.operational-sources.unreadable";
const SOURCE_FEATURE_ID="hiissa.founder.employee-register-attendance-preview";

async function exactCount(db,check) {
  let query=db.from(check.table)
    .select(check.column,{count:"exact",head:true})
    .eq("environment","staging");
  if(check.name==="awaiting_review") {
    query=query.in("submission_state",["submitted","under_review"]);
  }
  const {count,error}=await query;
  if(error || !Number.isSafeInteger(count) || count<0) return {readable:false,count:null};
  return {readable:true,count};
}

export async function checkEmployeeOperationalSources(db) {
  if(!db || typeof db.from!=="function") {
    return {ok:false,status:"MONITOR_CLIENT_UNAVAILABLE",sourceState:"NOT_CHECKED",
      flags:null,failedSources:[],counts:null};
  }
  // A rejected query is a real read failure, not a licence to fabricate zero counts.
  const results=await Promise.allSettled(CHECKS.map(check=>exactCount(db,check)));
  const flags={},counts={},failedSources=[];
  CHECKS.forEach((check,i)=>{
    const result=results[i].status==="fulfilled"?results[i].value:{readable:false,count:null};
    flags[check.name]=result.readable;
    counts[check.name]=result.readable?result.count:null;
    if(!result.readable) failedSources.push(check.name);
  });
  const allReadable=failedSources.length===0;
  const allEmpty=allReadable && Object.values(counts).every(count=>count===0);
  return {ok:allReadable,status:allReadable?"MONITORING":"SOURCE_READ_FAILED",
    sourceState:allReadable?(allEmpty?"READABLE_EMPTY":"READABLE_RECORDS_PRESENT"):"SOURCE_READ_FAILED",
    flags,failedSources,counts:allReadable?counts:null};
}

export async function monitorEmployeeOperationalSources(serviceClient) {
  const source=await checkEmployeeOperationalSources(serviceClient);
  if(source.status==="MONITOR_CLIENT_UNAVAILABLE") {
    return {...source,incidentAction:"NONE",incidentPersistence:"NOT_ATTEMPTED"};
  }
  if(source.ok) {
    return {...source,incidentAction:"NONE",incidentPersistence:"NO_INCIDENT_NEEDED",
      notificationDelivery:"NOT_YET_WIRED",automaticRecovery:"NOT_ACTIVE"};
  }
  // Fixed metadata from trusted server-side checks. No request-body input or PII.
  const result=await recordNewIncident(serviceClient,{
    incidentKey:INCIDENT_KEY,featureId:SOURCE_FEATURE_ID,
    ownerModuleId:"failures-reliability",
    title:"Employee operational source read failed",
    summary:"At least one Staging Employee Register, onboarding or attendance aggregate source read failed. No personnel data was changed.",
    severity:"unavailable",oversightLevel:2,
    recoveryClassification:"HUMAN_REQUIRED",maxSafeRetries:0
  });
  if(!result.ok) {
    return {...source,status:"INCIDENT_PERSISTENCE_FAILED",
      incidentAction:"FAILED_CLOSED",incidentPersistence:"NOT_VERIFIED",
      notificationDelivery:"NOT_YET_WIRED",automaticRecovery:"NOT_ACTIVE"};
  }
  return {...source,status:result.status==="RECORDED"?"SOURCE_FAILURE_INCIDENT_RECORDED":"SOURCE_FAILURE_ALREADY_RECORDED",
    incidentAction:result.status,incidentPersistence:result.status==="RECORDED"?"INSERT_ACCEPTED":"DUPLICATE_SUPPRESSED",
    notificationDelivery:"NOT_YET_WIRED",automaticRecovery:"NOT_ACTIVE"};
}
