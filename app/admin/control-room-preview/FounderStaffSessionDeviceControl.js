"use client";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const client = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) : null;

export default function FounderStaffSessionDeviceControl({ authenticated }) {
  const [state,setState]=useState({loading:Boolean(authenticated),staff:[],error:""});
  const [reason,setReason]=useState({});
  const [busy,setBusy]=useState("");
  const [notice,setNotice]=useState("");

  async function accessToken(){
    if(!authenticated||!client) return "";
    const {data:{session}}=await client.auth.getSession();
    return session?.access_token||"";
  }
  async function load(){
    const token=await accessToken();
    if(!token){setState({loading:false,staff:[],error:"Founder session could not be verified."});return;}
    const response=await fetch("/api/admin/control-room/staff-session-device-control",{cache:"no-store",credentials:"same-origin",headers:{Authorization:`Bearer ${token}`}});
    const data=await response.json().catch(()=>null);
    if(!response.ok||!data){setState({loading:false,staff:[],error:"Staff session evidence could not be loaded."});return;}
    setState({loading:false,staff:Array.isArray(data.staff)?data.staff:[],error:""});
  }
  useEffect(()=>{load().catch(()=>setState({loading:false,staff:[],error:"Staff session evidence could not be loaded."}));},[authenticated]);

  async function forceSignOut(person,sessionKey){
    const key=sessionKey||person.targetKey;
    const why=String(reason[key]||"").trim();
    if(why.length<10){setNotice("Enter a clear reason of at least 10 characters.");return;}
    const token=await accessToken(); if(!token){setNotice("Founder session could not be verified.");return;}
    setBusy(key); setNotice("");
    try{
      const response=await fetch("/api/admin/control-room/staff-session-device-control",{method:"POST",cache:"no-store",credentials:"same-origin",headers:{Authorization:`Bearer ${token}`,"Content-Type":"application/json"},body:JSON.stringify({targetUserId:person.targetKey,targetSessionId:sessionKey||null,reason:why})});
      const data=await response.json().catch(()=>null);
      if(!response.ok||!data){setNotice("HIISSA could not complete this Staging Force Sign Out.");return;}
      setNotice(`Staging Force Sign Out executed and audited. ${data.revokedSessionCount} session${data.revokedSessionCount===1?"":"s"} revoked. Production effect: none.`);
      setReason((current)=>({...current,[key]:""})); await load();
    } finally { setBusy(""); }
  }

  return <section id="founder-staff-session-device-control" style={section}>
    <div style={heading}><div><div style={kicker}>STAFF SESSION & DEVICE CONTROL · STAGING</div><h3 style={title}>See active staff sessions and force a controlled sign-out</h3></div><span style={pill}>FOUNDER ONLY</span></div>
    <p style={copy}>This control is limited to active Staging staff identities. It never targets the Founder, never changes Production, and never pretends a browser/app session proves the identity of a physical device.</p>
    <div style={cards}><Card title="ACTIVE STAGING STAFF" value={state.loading?"Checking…":String(state.staff.length)} text="Only active Staging staff role assignments are eligible."/><Card title="DEVICE EVIDENCE" value="Session-level" text="HIISSA identifies Auth sessions, not the physical phone or computer."/><Card title="PRODUCTION EFFECT" value="None" text="This control is restricted to Staging."/></div>
    <div style={note}><strong>Important boundary.</strong> Force Sign Out revokes the selected refresh session, or all refresh sessions for that staff identity. An already-issued access token may remain valid until its normal expiry.</div>
    {state.error?<div style={note}><strong>Could not verify session state.</strong> {state.error}</div>:null}
    {!state.loading&&!state.staff.length?<div style={item}><strong>No active Staging staff identity is currently assigned</strong><p>HIISSA will not invent a staff account or session just to test this control. Practical revocation evidence remains conditional until a genuine Staging staff identity exists.</p></div>:null}
    {state.staff.map(person=><div style={item} key={person.targetKey}><strong>{person.label} · {person.sessionCount} active session{person.sessionCount===1?"":"s"}</strong><p>Role: {person.role}. No token, password, IP address or private conversation content is shown.</p>{person.sessions.map((session,index)=><div style={sessionBox} key={session.sessionKey}><strong>Session {index+1}</strong><p>Last active: {new Date(session.lastActiveAt).toLocaleString()}</p><textarea style={field} rows={2} value={reason[session.sessionKey]||""} onChange={e=>setReason(cur=>({...cur,[session.sessionKey]:e.target.value}))} placeholder="Why must this staff session be signed out?"/><button style={button} disabled={busy===session.sessionKey||(reason[session.sessionKey]||"").trim().length<10} onClick={()=>forceSignOut(person,session.sessionKey)}>{busy===session.sessionKey?"Signing out…":"Force Sign Out this session"}</button></div>)}</div>)}
    {notice?<div style={success}><strong>{notice}</strong></div>:null}
  </section>;
}
function Card({title,value,text}){return <div style={card}><small>{title}</small><strong style={{fontSize:24}}>{value}</strong><p>{text}</p></div>}
const section={marginTop:24,padding:24,border:"1px solid rgba(49,91,70,.15)",borderRadius:22,background:"#fffefa",color:"#345347"};
const heading={display:"flex",justifyContent:"space-between",gap:16,alignItems:"flex-start",flexWrap:"wrap"};
const kicker={fontSize:12,fontWeight:900,letterSpacing:1.2}; const title={margin:"6px 0 0"}; const copy={lineHeight:1.6};
const pill={fontSize:11,fontWeight:900,padding:"7px 10px",borderRadius:999,border:"1px solid rgba(49,91,70,.2)"};
const cards={display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:12,margin:"18px 0"};
const card={display:"grid",gap:8,padding:16,border:"1px solid rgba(49,91,70,.12)",borderRadius:16};
const note={padding:14,borderRadius:14,background:"#f5f1df",margin:"12px 0",lineHeight:1.5};
const item={padding:16,border:"1px solid rgba(49,91,70,.12)",borderRadius:16,marginTop:12};
const sessionBox={padding:14,borderRadius:14,background:"#f7faf7",marginTop:10};
const field={width:"100%",boxSizing:"border-box",padding:10,borderRadius:10,border:"1px solid rgba(49,91,70,.25)",margin:"8px 0"};
const button={padding:"10px 14px",borderRadius:10,border:"1px solid #8a4d4d",background:"#fff",fontWeight:800,cursor:"pointer"};
const success={padding:14,borderRadius:14,background:"#edf7ef",marginTop:12};
