"use client";
import {useCallback,useEffect,useState} from "react";
import Link from "next/link";
import {createClient} from "@supabase/supabase-js";
import {formatHiissaRecordTime} from "../../../lib/hiissa-record-time.js";
import {CustomerPracticeActions,StaffPracticeActions} from "./FounderPracticeActions.js";
import {FOUNDER_CONTROL_ROOM_STRENGTHENING_PACKAGE} from "../../../lib/experience-registry.js";

const client=process.env.NEXT_PUBLIC_SUPABASE_URL&&process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  ?createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY):null;
const customerUrl="/api/admin/control-room/customer-communications";
const staffUrl="/api/admin/control-room/staff-trust-review";

// R99: Founder-only, privacy-safe status diagnosis of the new Staff Review page.
// Disclose only fixed source names and status codes, never raw provider errors or secrets.
const STAFF_DIAGNOSTIC_SOURCES=Object.freeze({
  "employee-register":"Employee register",
  "onboarding":"Staff onboarding",
  "role-assignments":"Role assignments",
  "access-restrictions":"Access restrictions",
  "canonical-incidents":"Existing operational incidents",
  "practice-actions":"Staging staff practice review"
});
function describeStaffSourceFailure(httpStatus,data){
  if(httpStatus===401||data?.status==="UNAUTHENTICATED")
    return "STAFF-SOURCE AUTH-401: No valid Founder session was accepted. Return to the existing Founder sign-in, then reopen this Staging page.";
  if(httpStatus===403||data?.status==="FOUNDER_GATE_REQUIRED")
    return "STAFF-SOURCE ACCESS-403: Founder identity verification did not pass. No data was disclosed or changed.";
  if(httpStatus===404)
    return "STAFF-SOURCE STAGING-404: The Staging-only API is unavailable or its protected environment check did not pass. No action occurred.";
  if(data?.status==="STAGING_ADMIN_DATA_NOT_CONFIGURED")
    return "STAFF-SOURCE CONFIG-503: A required protected Staging connection is not configured. No data was disclosed or changed.";
  if(data?.status==="SOURCE_UNAVAILABLE"){
    const sourceNames=Array.isArray(data.unverifiedSources)?
      data.unverifiedSources.filter(value=>typeof value==="string"&&Object.prototype.hasOwnProperty.call(STAFF_DIAGNOSTIC_SOURCES,value))
        .map(value=>STAFF_DIAGNOSTIC_SOURCES[value]):[];
    if(sourceNames.length)
      return "STAFF-SOURCE READ-503: Unable to verify "+sourceNames.join(", ")+". No action occurred.";
    return "STAFF-SOURCE READ-503: A protected Staging read failed. No action occurred.";
  }
  if(data?.status==="SOURCE_READ_FAILED")
    return "STAFF-SOURCE REQUEST-503: The protected data request failed before it could be classified. No action occurred.";
  if(httpStatus>=500)
    return "STAFF-SOURCE SERVER-"+httpStatus+": The secure Staging API failed. No action occurred.";
  return "STAFF-SOURCE RESPONSE-"+httpStatus+": The secure Staging API did not return verified evidence. No action occurred.";
}

export default function FounderOperationalCentreView({kind}){
  const customer=kind==="customer";
  const [state,setState]=useState({loading:true,verified:false,result:null,error:""});
  const [revision,setRevision]=useState(0);
  const [actionBusy,setActionBusy]=useState(false);
  const [actionFeedback,setActionFeedback]=useState("");
  const reload=useCallback(()=>setRevision(n=>n+1),[]);
  useEffect(()=>{
    let active=true;
    async function load(){
      setState({loading:true,verified:false,result:null,error:""});
      try{
        if(!client)throw new Error("Admin data connection is not available.");
        const {data:{session},error:authError}=await client.auth.getSession();
        if(authError||!session?.access_token)throw new Error("Founder sign-in is needed to read this centre.");
        const response=await fetch(customer?customerUrl:staffUrl,{cache:"no-store",
          headers:{Authorization:"Bearer "+session.access_token}});
        const data=await response.json().catch(()=>null);
        if(!response.ok||data?.status!=="MONITORING"||data?.productionEffectEnabled!==false){
          if(!customer)throw new Error(describeStaffSourceFailure(response.status,data));
          throw new Error("Source verification failed. This is not a healthy or confirmed empty result.");
        }
        if(active)setState({loading:false,verified:true,result:data,error:""});
      }catch(e){if(active)setState({loading:false,verified:false,result:null,error:e?.message||"Unavailable"});}
    }
    load();
    return ()=>{active=false};
  },[customer,revision]);
  async function performAction(payload){
    if(actionBusy||!state.verified)return false;
    setActionBusy(true);
    setActionFeedback("");
    try{
      if(!client)throw new Error("Founder sign-in is required.");
      const {data:{session},error:authError}=await client.auth.getSession();
      if(authError||!session?.access_token)throw new Error("Founder sign-in expired. Please sign in again.");
      const response=await fetch(customer?customerUrl:staffUrl,{
        method:"POST",cache:"no-store",
        headers:{"Authorization":"Bearer "+session.access_token,"Content-Type":"application/json"},
        body:JSON.stringify(payload)
      });
      const result=await response.json().catch(()=>null);
      if(!response.ok||result?.status!=="RECORDED_AND_AUDITED"||result.productionEffectEnabled!==false){
        throw new Error(result?.status==="STALE_RECORD_REFRESH"?
          "The record was changed elsewhere. Refresh before another action.":
          "Action not saved: "+(result?.status||"Please check the connection."));
      }
      setActionFeedback("Saved in Staging with a matching Admin audit event. No external customer or staff access action occurred.");
      setRevision(n=>n+1);
      return true;
    }catch(error){
      setActionFeedback("Not saved: "+(error?.message||"Please try again."));
      return false;
    }finally{setActionBusy(false);}
  }
  // HIISSA assists with saved fictional training evidence; Founder decides.
  async function assistEvidence(id,version){
    if(!state.verified||!client)throw new Error("Founder verification is needed.");
    const {data:{session},error:authError}=await client.auth.getSession();
    if(authError||!session?.access_token)throw new Error("Founder sign-in expired. Please sign in again.");
    const response=await fetch("/api/admin/control-room/staff-trust-review/assist",{
      method:"POST",cache:"no-store",
      headers:{"Authorization":"Bearer "+session.access_token,"Content-Type":"application/json"},
      body:JSON.stringify({id,version})
    });
    const result=await response.json().catch(()=>null);
    if(!response.ok||result?.status!=="AI_ASSIST_REVIEW_PREPARED"||
      result?.productionEffectEnabled!==false||result?.founderDecisionRequired!==true){
      if(result?.status==="STALE_RECORD_REFRESH")throw new Error("Record changed. Refresh before asking HIISSA.");
      if(result?.status==="AI_ASSIST_NOT_CONFIGURED"||result?.status==="AI_ASSIST_TEMPORARILY_UNAVAILABLE")
        throw new Error("HIISSA is temporarily unavailable. You can still review manually.");
      throw new Error("An auditable suggestion could not be prepared. No Founder decision was changed.");
    }
    return result;
  }
  const data=state.result;
  const mode=state.loading?"CHECKING":state.verified?"MONITORING":"SOURCE UNAVAILABLE";
  return <main style={page}>
    <nav aria-label="Founder Control Room return navigation" style={nav}>
      <Link href="/admin/control-room?view=overview" style={link}>← Back to Founder Control Room</Link>
      <Link href={customer?"/admin/control-room/staff-trust-review":"/admin/control-room/customer-communications"} style={link}>
        {customer?"Staff Trust, Training & Access Review →":"Customer Communication & Service-Level Centre →"}
      </Link>
    </nav>
    <div style={head}>
      <div><small style={kicker}>HIISSA FOUNDER CONTROL ROOM · STAGING ONLY</small>
        <h1 style={title}>{customer?"Customer Communication & Service-Level Centre":"Staff Trust, Training & Access Review"}</h1>
      </div>
      <span role="status" style={pill}>{mode}</span>
    </div>
    <p style={intro}>{customer?
      "Approved customer communication journey, with truthful visibility of the existing internal Customer Support source. Customer-facing messages are not yet connected.":
      "Evidence-based oversight of the existing staff onboarding, employee and access sources. Staff readiness is never represented by an invented score."}
    </p>
    <div style={actions}>
      <button type="button" onClick={reload} disabled={state.loading} style={button}>Refresh verified evidence</button>
      <Link href="/admin/control-room?view=overview" style={link}>Open existing Founder Alerts and Activity Timeline →</Link>
    </div>
    {state.error?<div role="alert" style={warning}>{state.error} No action has been taken.</div>:null}
    {actionFeedback?<div role="status" aria-live="polite" style={notice}>{actionFeedback}</div>:null}
    {customer?<CustomerContent data={data} loading={state.loading} onAction={performAction} busy={actionBusy}/>:<StaffContent data={data} loading={state.loading} onAction={performAction} onAssist={assistEvidence} busy={actionBusy}/>}
    <section style={notice}>
      <strong>Original approved features are preserved</strong>
      <p>Founder-only Staging practice actions now save genuine internal records and Admin audit events. Real customer messages, automatic acknowledgement, real staff access changes and all Production effects remain disabled. The original Experience Registry identities remain unchanged; actions return to the existing Founder Control Room.</p>
    </section>
  </main>;
}

function CustomerContent({data,loading,onAction,busy}){
  return <>
    <section aria-label="Approved customer communication lifecycle" style={section}>
      <h2 style={subtitle}>Original approved customer message journey</h2>
      <ol style={steps}>
        {["RECEIVED","AUTOMATIC ACKNOWLEDGEMENT SENT","ASSIGNED","HUMAN RESPONSE DUE","RESPONDED","WAITING FOR CUSTOMER","RESOLVED"]
        .map(stage=><li key={stage}>{stage}</li>)}
      </ol>
      <p><strong>Automatic acknowledgement:</strong> Target approximately one minute after successful receipt. The precise earlier approved sentence is still being recovered; no outgoing acknowledgement is active.</p>
      <p><strong>Human-response deadline:</strong> Historical approval requires reconciliation. No unverified deadline is enforced or advertised.</p>
    </section>
    <CustomerPracticeActions data={data} onAction={onAction} busy={busy}/>
    <section style={section}>
      <h2 style={subtitle}>Genuine Staging operational evidence</h2>
      <div style={cards}>
        <Metric name="Internal Customer Support work" value={data?String(data.internalWorkCount):loading?"Checking…":"Unverified"}/>
        <Metric name="Fictional practice items" value={data?String(data.fictionalWorkCount):loading?"Checking…":"Unverified"}/>
        <Metric name="Recorded feature incidents" value={data?String(data.openIncidentCount):loading?"Checking…":"Unverified"}/>
        <Metric name="Real incoming customer messages" value="NOT CONNECTED"/>
      </div>
      {data?.items?.length?<div style={list}>
        {data.items.map((item,i)=><article key={item.caseCode+"-"+i} style={itemStyle}>
          <strong>{item.fictional?"FICTIONAL STAGING PRACTICE":"INTERNAL STAFF WORK"} · {item.caseCode}</strong>
          <p>Existing work stage: {item.stage.replaceAll("_"," ")}. External action enabled: {item.externalEffectEnabled?"Source says enabled — investigate before action":"No"}.</p>
          <small>Recorded: {stamp(item.createdAt)} · Response due: {item.responseDueAt?stamp(item.responseDueAt):"Not set"}</small>
        </article>)}
      </div>:<p>{data?"No internal Customer Support work items were returned by the verified source. This does not mean the real customer message source exists.":"Internal items are not shown until verified."}</p>}
    </section>
  </>;
}
function StaffContent({data,loading,onAction,onAssist,busy}){
  return <>
    <section style={section}>
      <h2 style={subtitle}>Current Staging staff evidence</h2>
      <div style={cards}>
        <Metric name="Verified employee register entries" value={data?String(data.employeeCount):loading?"Checking…":"Unverified"}/>
        <Metric name="Staging onboarding applications" value={data?String(data.applicationCount):loading?"Checking…":"Unverified"}/>
        <Metric name="Active recorded Admin role assignments" value={data?String(data.activeAdminRoleAssignments):loading?"Checking…":"Unverified"}/>
        <Metric name="Recorded feature incidents" value={data?String(data.openIncidentCount):loading?"Checking…":"Unverified"}/>
      </div>
      {data?.staff?.length?<div style={list}>{data.staff.map((person,i)=><article key={i} style={itemStyle}>
        <strong>{person.label}</strong>
        <p>{person.department} · {person.role} · {person.engagementState}</p>
        <small>Registered: {stamp(person.registeredAt)}</small>
      </article>)}</div>:<p>{data?"No genuine employee is currently recorded in the verified Staging register. Fictional prototype staff are not real employees.":"Employee records are hidden until verified."}</p>}
    </section>
    <StaffPracticeActions data={data} onAction={onAction} onAssist={onAssist} busy={busy}/>
    <section style={section}>
      <h2 style={subtitle}>Original approved review responsibilities</h2>
      <div style={list}>{[
        ["Policies accepted and versions","NOT CERTIFIED"],
        ["Required training completed","NOT CONNECTED"],
        ["Last access review","NOT CERTIFIED"],
        ["Next access review due","NOT CONFIGURED"],
        ["Temporary permissions and expiry","NOT CONNECTED"],
        ["Unresolved security/access concerns","Verified incidents above only"],
        ["Role changes","NOT CERTIFIED"],
      ].map(([label,value])=><div key={label} style={itemStyle}><strong>{label}</strong><span style={{display:"block",marginTop:6}}>{value}</span></div>)}</div>
      <p>No opaque trust score. No inference that training or acceptance is complete. No staff action or access permission is changed.</p>
    </section>
  </>;
}
function Metric({name,value}){return <div style={metric}><small>{name}</small><strong>{value}</strong></div>;}
function stamp(x){try{return x?formatHiissaRecordTime(x):"Not recorded"}catch{return "Not recorded"}}
const page={padding:"26px clamp(16px,4vw,48px)",margin:"0 auto",maxWidth:1150,background:"#f8faf7",color:"#2b493b",minHeight:"100vh",fontFamily:"system-ui, sans-serif"};
const nav={display:"flex",justifyContent:"space-between",gap:14,flexWrap:"wrap"};
const link={color:"#245b48",fontWeight:750,textDecoration:"underline",fontSize:14};
const head={display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:12,marginTop:28};
const kicker={fontWeight:850,letterSpacing:1.2,color:"#506a59"};
const title={fontSize:"clamp(23px,3vw,35px)",margin:"8px 0"};
const subtitle={fontSize:19,marginTop:0};
const intro={maxWidth:820,lineHeight:1.65};
const pill={border:"1px solid #b6c9ba",borderRadius:30,padding:"8px 12px",fontSize:12,fontWeight:800};
const actions={display:"flex",gap:20,alignItems:"center",margin:"20px 0",flexWrap:"wrap"};
const button={padding:"12px 18px",border:"1px solid #245b48",borderRadius:12,color:"#fff",background:"#245b48",cursor:"pointer",fontWeight:700};
const section={background:"#fff",border:"1px solid #d8e4d8",borderRadius:16,padding:22,marginTop:22,lineHeight:1.6};
const steps={display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(170px,1fr))",gap:12,paddingLeft:25};
const cards={display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(175px,1fr))",gap:12};
const metric={padding:16,borderRadius:12,background:"#edf3ed",display:"grid",gap:7};
const list={display:"grid",gap:10,marginTop:16};
const itemStyle={padding:13,border:"1px solid #dce7dc",borderRadius:11,background:"#fbfcfb"};
const warning={padding:16,marginTop:20,border:"1px solid #a9774a",background:"#fff5e8",borderRadius:12};
const notice={padding:18,marginTop:26,background:"#eaf2eb",borderRadius:12,lineHeight:1.6};
