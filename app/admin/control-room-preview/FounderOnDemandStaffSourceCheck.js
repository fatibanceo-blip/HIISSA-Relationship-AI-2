"use client";
import {useRef,useState} from "react";
import {createClient} from "@supabase/supabase-js";

// One existing source monitor, two approved Founder entrances.
// No fake faults, credentials, staff actions, recovery or notifications.
const client=process.env.NEXT_PUBLIC_SUPABASE_URL&&process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  ?createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY):null;
const endpoint="/api/admin/control-room/operational-incidents/check-staff-session-source";
const initial={kind:"idle",title:"Not checked yet",detail:"Ask HIISSA to verify the real Staging staff-session sources.",
  did:"No check has been requested.",next:"This optional check is manual, not scheduled monitoring.",checkedAt:""};

function interpret(response,data){
  const safe=data?.productionEffectEnabled===false;
  const readable=data?.sourceState==="READABLE_EMPTY"||data?.sourceState==="READABLE_RECORDS_PRESENT";
  const counts=Number.isInteger(data?.sourceCounts?.staffSessions)&&data.sourceCounts.staffSessions>=0
    &&Number.isInteger(data?.sourceCounts?.staffAccess)&&data.sourceCounts.staffAccess>=0;
  if(response.ok&&safe&&data?.status==="MONITORING"&&readable&&counts
    &&data?.sourceFlags?.staffSessions===true&&data?.sourceFlags?.staffAccess===true
    &&data?.incidentAction==="NONE"){
    const empty=data.sourceState==="READABLE_EMPTY";
    return {kind:"checked",title:"Monitoring — sources are readable",
      detail:empty?"Both Staging sources responded. No active staff-session or access records were returned; a verified empty result is not a fault."
        :"Both real Staging staff-session sources are responding and their records can be read.",
      did:"HIISSA securely checked the sources. No staff access was changed and no incident was needed.",
      next:"No action needed for this source check. You can ask HIISSA to check again later."};
  }
  if(safe&&data?.status==="SOURCE_FAILURE_INCIDENT_RECORDED"&&data?.incidentPersistence==="INSERT_ACCEPTED")
    return {kind:"attention",title:"Needs attention — source not readable",
      detail:"HIISSA could not read one or more real Staging staff-session sources.",
      did:"HIISSA recorded the problem in the existing incident history for technical review. Staff access was not changed.",
      next:"Automatic repair and direct notification for this check are not connected. Any consequential repair needs separate approval."};
  if(safe&&data?.status==="SOURCE_FAILURE_ALREADY_RECORDED"&&data?.incidentPersistence==="DUPLICATE_SUPPRESSED")
    return {kind:"attention",title:"Needs attention — previously recorded problem",
      detail:"HIISSA still cannot verify one or more real staff-session sources.",
      did:"HIISSA recognised an existing incident instead of recording a duplicate. No staff access was changed.",
      next:"Technical review is still needed. Automatic repair and direct notification are not connected."};
  if(data?.status==="INCIDENT_PERSISTENCE_FAILED")
    return {kind:"unknown",title:"Problem detected — recording not confirmed",
      detail:"The Staging checker found an unreadable staff-session source, but could not confirm that the problem was saved in the incident history.",
      did:"HIISSA tried to record the genuine source failure. Recording is unverified; no repair or staff access change was performed.",
      next:"Do not repeat the check blindly. Technical review is required before another test."};
  if(response.status===401||data?.status==="UNAUTHENTICATED")
    return {kind:"unknown",title:"Founder sign-in needs checking",
      detail:"HIISSA could not confirm the signed-in session for this protected check.",
      did:"The protected source check was not authorised. No staff access change was requested.",
      next:"Use your existing Founder sign-in; do not share any password or access code."};
  if(response.status===403||data?.status==="FOUNDER_GATE_REQUIRED")
    return {kind:"unknown",title:"Founder permission could not be confirmed",
      detail:"The checking service did not verify the required Founder-only permission for this request.",
      did:"HIISSA's existing permission protection stopped the check. No access was granted or changed.",
      next:"This needs a secure permissions review. Do not create another account or change your staff permissions."};
  if(response.status===404)
    return {kind:"unknown",title:"Staging check is not available here",
      detail:"HIISSA's protected checking service could not be reached at the approved Staging location. The exact configuration cause is not yet established.",
      did:"The check was not verified. HIISSA has not assumed the staff sources are healthy.",
      next:"The technical setup of this Staging check needs review. Do not use another environment or attempt staff changes."};
  if(data?.status==="STAGING_ADMIN_DATA_NOT_CONFIGURED")
    return {kind:"unknown",title:"Staging check connection needs attention",
      detail:"The protected checking service reports that a required Staging connection is not configured.",
      did:"HIISSA stopped safely before checking staff-session data. It did not assume success.",
      next:"The technical connection needs review. Do not enter credentials or change settings yourself."};
  if(data?.status==="STAFF_SOURCE_MONITOR_UNAVAILABLE"||data?.status==="MONITOR_CLIENT_UNAVAILABLE")
    return {kind:"unknown",title:"HIISSA's secure checker is unavailable",
      detail:"The Staging checking service could not complete its work. This does not by itself show that the database is broken.",
      did:"HIISSA stopped without claiming a verified result.",
      next:"The checking service needs a technical review before another test."};
  if(response.status===400||data?.status==="REQUEST_BODY_NOT_ALLOWED")
    return {kind:"unknown",title:"Check request was rejected safely",
      detail:"The Staging checking service rejected an unexpected request. No valid check result was returned.",
      did:"HIISSA did not accept the request or assume the staff sources are healthy.",
      next:"The testing control needs a technical review; do not send information or codes to the service."};
  if(!response.ok)
    return {kind:"unknown",title:"Check service returned an error",
      detail:"HIISSA's secure Staging check did not return a confirmed result. The underlying cause is still being investigated.",
      did:"No verified source result is available. HIISSA has not assumed success.",
      next:"Technical review is needed before you try again."};
  return {kind:"unknown",title:"Check answer was incomplete",
    detail:"The Staging checking service responded, but its answer did not contain enough verified information to confirm that the staff sources are readable.",
    did:"HIISSA rejected an incomplete result rather than showing a false healthy message.",
    next:"The check's response needs a technical review before another attempt."};
}

export default function FounderOnDemandStaffSourceCheck({authenticated,location="staff"}){
  const running=useRef(false);
  const [result,setResult]=useState(initial);
  const [checking,setChecking]=useState(false);
  async function runCheck(){
    if(running.current)return;
    running.current=true;setChecking(true);
    setResult({kind:"checking",title:"HIISSA is checking…",detail:"Reading the real Staging sources securely.",
      did:"Please wait for the result.",next:"No staff access will be changed.",checkedAt:""});
    try{
      if(!authenticated||!client){
        setResult({...interpret({ok:false},{status:"UNAUTHENTICATED"}),checkedAt:""});return;
      }
      const {data:{session},error}=await client.auth.getSession();
      if(error||!session?.access_token){
        setResult({...interpret({ok:false},{status:"UNAUTHENTICATED"}),checkedAt:""});return;
      }
      const response=await fetch(endpoint,{
        method:"POST",credentials:"same-origin",cache:"no-store",
        headers:{Authorization:"Bearer "+session.access_token}
        // Deliberately empty request: no fake source faults, staff IDs or secrets.
      });
      const data=await response.json().catch(()=>null);
      const checkedAt=data?.checkedAt&&Number.isFinite(Date.parse(data.checkedAt))
        ?new Date(data.checkedAt).toLocaleString():new Date().toLocaleString();
      setResult({...interpret(response,data),checkedAt});
    }catch{
      setResult({kind:"unknown",title:"Check could not finish",detail:"HIISSA could not confirm the source check.",
        did:"A successful result has not been assumed.",next:"Review incident history before retrying; the earlier request might have reached the server.",
        checkedAt:new Date().toLocaleString()});
    }finally{running.current=false;setChecking(false);}
  }
  const tone=result.kind==="attention"?"#fff2e5":result.kind==="unknown"?"#fff9eb":"#f0f7ef";
  return <section aria-label="Founder on-demand Staging staff source check" style={panel}>
    <div style={heading}>
      <div><div style={eyebrow}>FOUNDER ONLY · STAGING TEST</div><h3 style={title}>Ask HIISSA to check staff sessions</h3></div>
      <span style={pill}>{location==="overview"?"QUICK CHECK":"STAFF AREA CHECK"}</span>
    </div>
    <p style={paragraph}>HIISSA handles the technical check for you. This reads staff-session information only. It does not sign anyone out, change access or touch the live app.</p>
    <button type="button" style={button} onClick={runCheck} disabled={checking||!authenticated}
      aria-busy={checking} aria-label="Ask HIISSA to check Staging staff-session sources">
      {checking?"Checking safely…":result.kind==="idle"?"Check now":"Check again"}
    </button>
    {!authenticated?<p style={footnote}>Sign in as Founder to use this protected check.</p>:null}
    <div role="status" aria-live="polite" aria-atomic="true" style={{...resultPanel,background:tone}}>
      <strong style={{color:"#245b48"}}>{result.title}</strong>
      <p style={paragraph}>{result.detail}</p>
      <p style={line}><b>What HIISSA did:</b> {result.did}</p>
      <p style={line}><b>Next:</b> {result.next}</p>
      {result.checkedAt?<small style={footnote}>Checked/attempted: {result.checkedAt} (your local time)</small>:null}
    </div>
    <p style={footnote}>This is an immediate manual source check. Automatic scheduling, repair and direct notifications are not yet active for this check. Technical details remain protected.</p>
  </section>;
}
const panel={border:"1px solid rgba(49,91,70,.16)",borderRadius:20,padding:20,background:"linear-gradient(145deg,#fffefa,#f6faf5)",margin:"18px 0",color:"#315446"};
const heading={display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:12,flexWrap:"wrap"};
const eyebrow={fontWeight:850,fontSize:10,letterSpacing:1.1,color:"#527565"};
const title={fontSize:"clamp(17px,3.5vw,21px)",margin:"6px 0 0",lineHeight:1.25,color:"#245b48"};
const pill={fontSize:10,padding:"7px 10px",borderRadius:999,border:"1px solid #c9daca",color:"#315f4c",fontWeight:850};
const paragraph={lineHeight:1.6,fontSize:13,margin:"10px 0",color:"#526c5e"};
const button={minHeight:44,padding:"12px 18px",border:"1px solid #245b48",borderRadius:12,background:"#245b48",color:"#fff",fontWeight:850,fontSize:14,cursor:"pointer"};
const resultPanel={border:"1px solid #d3dfd2",borderRadius:14,padding:15,marginTop:15};
const line={fontSize:13,lineHeight:1.55,margin:"8px 0",color:"#415d4c"};
const footnote={display:"block",fontSize:11,color:"#63776b",lineHeight:1.55,marginTop:10};
