"use client";
import {useState} from "react";

const examples=[
{id:"sample-customer-support",name:"Sample Customer Support Worker",role:"Customer Support"},
{id:"sample-technical-operations",name:"Sample Technical Operations Worker",role:"Technical Operations"},
{id:"sample-finance",name:"Sample Finance Worker",role:"Finance & Subscriptions"}
];
const initial=()=>Object.fromEntries(examples.map(p=>[p.id,{status:"active",sessions:1}]));
export default function FounderStaffAccessPractice(){
 const [selected,setSelected]=useState("");
 const [people,setPeople]=useState(initial);
 const [reason,setReason]=useState("");
 const [events,setEvents]=useState([]);
 const [message,setMessage]=useState("");
 const person=examples.find(p=>p.id===selected);
 const current=people[selected];
 function act(action){
  if(!person)return;
  if(reason.trim().length<10){setMessage("Please enter a reason of at least 10 characters.");return;}
  if(current.status==="permanently_revoked"){setMessage("This identity is permanently revoked. Normal actions cannot restore it.");return;}
  if(action==="restore"&&current.status!=="suspended"){setMessage("Only a suspended identity can be restored.");return;}
  if(action==="permanently_revoke"&&!window.confirm("SIMULATION ONLY: permanently revoke this sample staff member? No real account is affected."))return;
  const next=action==="force_sign_out"?{...current,sessions:0}:action==="restore"?{status:"active",sessions:0}:{status:action==="suspend"?"suspended":"permanently_revoked",sessions:0};
  setPeople(old=>({...old,[selected]:next}));
  setEvents(old=>[{name:person.name,action,reason:reason.trim(),at:new Date().toISOString()},...old]);
  setReason("");setMessage("Sample action completed. No real staff account or Production data was changed.");
 }
 function reset(){
  if(!person)return;
  setPeople(old=>({...old,[selected]:{status:"active",sessions:1}}));
  setEvents(old=>[{name:person.name,action:"reset_sample",reason:"Reset fictional test state only",at:new Date().toISOString()},...old]);
  setMessage("Sample reset for another demonstration. This cannot reset real revocations.");
 }
 return <section style={panel}>
  <strong>INTERACTIVE STAFF ACCESS PRACTICE · SAMPLE IDENTITIES ONLY</strong>
  <p>Choose a sample staff member to test every button. These fictional identities are not real staff accounts. Changes and history are demonstrations only and are not saved to the real audit database.</p>
  <div style={actions}>{examples.map(p=><button key={p.id} type="button" style={selected===p.id?chosen:button} onClick={()=>{setSelected(p.id);setReason("");setMessage("");}}>{p.name}</button>)}</div>
  {person?<div style={detail}>
   <h4>{person.name}</h4>
   <p>Department: {person.role}</p>
   <p>Access status: <strong>{current.status.replaceAll("_"," ").toUpperCase()}</strong> · Sample sessions: {current.sessions}</p>
   <label htmlFor="sample-staff-access-reason">Reason for action</label>
   <textarea id="sample-staff-access-reason" rows={2} style={field} value={reason} onChange={e=>setReason(e.target.value)} placeholder="Enter a reason (at least 10 characters)"/>
   <div style={actions}>
    <button type="button" style={button} disabled={!current.sessions||current.status!=="active"} onClick={()=>act("force_sign_out")}>Force Sign Out</button>
    <button type="button" style={button} disabled={current.status!=="active"} onClick={()=>act("suspend")}>Suspend Access</button>
    <button type="button" style={button} disabled={current.status!=="suspended"} onClick={()=>act("restore")}>Restore Access</button>
    <button type="button" style={danger} disabled={current.status==="permanently_revoked"} onClick={()=>act("permanently_revoke")}>Permanently Revoke Access</button>
    <button type="button" style={button} onClick={reset}>Reset Sample Only</button>
   </div>
   <p>Permanent revocation disables normal access actions. Reset Sample Only restarts the fictional demonstration, never a genuine revocation.</p>
  </div>:<p>Select a sample name above to open its controls.</p>}
  {message?<p role="status" style={feedback}>{message}</p>:null}
  <div style={detail}><strong>Sample activity history</strong>{events.length?events.slice(0,10).map((e,i)=><p key={i}>{new Date(e.at).toLocaleString()} · {e.name} · {e.action.replaceAll("_"," ")} · {e.reason}</p>):<p>No sample actions recorded yet.</p>}</div>
 </section>;
}
const panel={padding:18,border:"1px solid #cad9d0",borderRadius:16,margin:"18px 0",background:"#f7faf7",color:"#345347"};
const detail={padding:14,border:"1px solid #d5dfd8",borderRadius:12,marginTop:12,background:"#fff"};
const actions={display:"flex",gap:8,flexWrap:"wrap",margin:"12px 0"};
const button={padding:"10px 14px",borderRadius:10,border:"1px solid #819b8d",background:"#fff",color:"#345347",fontWeight:700,cursor:"pointer"};
const chosen={...button,background:"#345347",color:"#fff"};
const danger={...button,background:"#7b2f2f",color:"#fff"};
const field={display:"block",width:"100%",boxSizing:"border-box",padding:10,borderRadius:10,border:"1px solid #819b8d",margin:"8px 0"};
const feedback={padding:12,borderRadius:10,background:"#e8f4ec"};
