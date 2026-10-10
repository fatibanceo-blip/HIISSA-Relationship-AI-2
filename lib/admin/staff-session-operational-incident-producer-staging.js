/**
 * HIISSA — narrow Staff Session & Device Control operational source monitor.
 * STAGING ONLY. Exactly the two real backend RPC sources already used by the
 * Founder staff access route. No sessions/staff rows leave this helper.
 * No action on staff, synthetic incident, scheduled runner or recovery.
 */
import {recordNewIncident} from "./operational-incident-staging.js";

const SOURCES=Object.freeze([
  {key:"staffSessions",rpc:"founder_staff_session_inventory"},
  {key:"staffAccess",rpc:"founder_staff_access_inventory"}
]);
const INCIDENT_KEY="hiissa.admin.staff-session-source.unreadable";
const FEATURE_ID="staff-session-device-control";

async function checkSource(db,source){
  try{
    const {data,error}=await db.rpc(source.rpc);
    return error||!Array.isArray(data)
      ? {readable:false,count:null}
      : {readable:true,count:data.length};
  }catch{
    return {readable:false,count:null};
  }
}

export async function checkStaffSessionOperationalSources(db){
  if(!db||typeof db.rpc!=="function")return {
    ok:false,status:"MONITOR_CLIENT_UNAVAILABLE",sourceState:"NOT_CHECKED",
    flags:null,counts:null,failedSources:[]
  };
  const settled=await Promise.allSettled(SOURCES.map(source=>checkSource(db,source)));
  const flags={},counts={},failedSources=[];
  SOURCES.forEach((source,index)=>{
    const value=settled[index].status==="fulfilled"
      ? settled[index].value : {readable:false,count:null};
    flags[source.key]=value.readable;
    counts[source.key]=value.readable?value.count:null;
    if(!value.readable)failedSources.push(source.key);
  });
  const readable=failedSources.length===0;
  const allEmpty=readable&&Object.values(counts).every(value=>value===0);
  return {ok:readable,status:readable?"MONITORING":"SOURCE_READ_FAILED",
    sourceState:readable?(allEmpty?"READABLE_EMPTY":"READABLE_RECORDS_PRESENT"):"SOURCE_READ_FAILED",
    flags,counts:readable?counts:null,failedSources};
}

export async function monitorStaffSessionOperationalSources(serviceClient){
  const source=await checkStaffSessionOperationalSources(serviceClient);
  if(source.sourceState==="NOT_CHECKED")return {
    ...source,incidentAction:"NONE",incidentPersistence:"NOT_ATTEMPTED",
    notificationDelivery:"NOT_YET_WIRED",automaticRecovery:"NOT_ACTIVE"
  };
  if(source.ok)return {
    ...source,incidentAction:"NONE",incidentPersistence:"NO_INCIDENT_NEEDED",
    notificationDelivery:"NOT_YET_WIRED",automaticRecovery:"NOT_ACTIVE"
  };
  // Evidence comes ONLY from the real RPC failures. Never accept client data
  // or include identities, session keys, device identifiers, emails or PII.
  const recorded=await recordNewIncident(serviceClient,{
    incidentKey:INCIDENT_KEY,featureId:FEATURE_ID,
    ownerModuleId:"admin-security-audit",
    title:"Staff access operational source unreadable",
    summary:"The Staging Staff Session or Staff Access inventory source could not be read. Staff access was not changed; the source must be checked before trusting the roster.",
    severity:"unavailable",oversightLevel:2,
    recoveryClassification:"HUMAN_REQUIRED",maxSafeRetries:0
  });
  if(!recorded.ok)return {
    ...source,status:"INCIDENT_PERSISTENCE_FAILED",
    incidentAction:"FAILED_CLOSED",incidentPersistence:"NOT_VERIFIED",
    notificationDelivery:"NOT_YET_WIRED",automaticRecovery:"NOT_ACTIVE"
  };
  return {...source,
    status:recorded.status==="RECORDED"
      ?"SOURCE_FAILURE_INCIDENT_RECORDED":"SOURCE_FAILURE_ALREADY_RECORDED",
    incidentAction:recorded.status,
    incidentPersistence:recorded.status==="RECORDED"?"INSERT_ACCEPTED":"DUPLICATE_SUPPRESSED",
    notificationDelivery:"NOT_YET_WIRED",automaticRecovery:"NOT_ACTIVE"
  };
}
