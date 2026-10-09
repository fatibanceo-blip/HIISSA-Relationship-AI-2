/**
 * Staging-only Founder canonical incident alert projection.
 * Uses only the existing Founder-gated API; no writes, fake incidents or recovery.
 * Unavailable/invalid source is UNKNOWN, never empty/healthy.
 */
const STATES=new Set(["needs_attention","investigating","recovery_attempted","verification_pending","verified_resolved","escalated"]);
export function projectFounderCanonicalIncidentAlerts(payload) {
  const unavailable={verified:false,attentionCount:0,criticalCount:0,items:[],sourceState:"UNAVAILABLE"};
  if (!payload||payload.status!=="MONITORING" ||
      !["READABLE_EMPTY","RECORDED_INCIDENTS"].includes(payload.sourceState) ||
      !Array.isArray(payload.incidents) ||
      !Number.isSafeInteger(payload.openIncidentCount) || payload.openIncidentCount<0 ||
      payload.incidents.length>40) return unavailable;
  const ids=new Set();
  for(const incident of payload.incidents) {
    if(!incident||typeof incident.incidentId!=="string"||incident.incidentId.length<8||
       ids.has(incident.incidentId)||!STATES.has(incident.state)||
       !["monitoring","needs_attention","degraded","unavailable","critical"].includes(incident.severity) ||
       typeof incident.title!=="string"||!incident.title.trim()||incident.title.length>160)
       return unavailable;
    ids.add(incident.incidentId);
  }
  const unresolved=payload.incidents.filter(item=>item.state!=="verified_resolved");
  if(unresolved.length!==payload.openIncidentCount ||
     (payload.sourceState==="READABLE_EMPTY" && payload.incidents.length!==0) ||
     (payload.sourceState==="RECORDED_INCIDENTS" && payload.incidents.length===0))return unavailable;
  const criticalCount=unresolved.filter(item=>item.severity==="critical").length;
  return {verified:true,sourceState:payload.sourceState,
    attentionCount:unresolved.length,criticalCount,
    criticalMessage:criticalCount>0?"Verified critical operational incident needs Founder review. Open Alerts for details.":"",
    items:unresolved.slice(0,5).map(item=>({
      incidentId:item.incidentId,title:item.title,
      state:item.state,severity:item.severity,oversightLevel:item.oversightLevel
    }))
  };
}
