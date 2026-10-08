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
 const [selectedMany,setSelectedMany]=useState([]);
 const [search,setSearch]=useState("");
 const [pickerOpen,setPickerOpen]=useState(false);
 const [review,setReview]=useState(null);
 const [statusFilter,setStatusFilter]=useState("all");
 const [people,setPeople]=useState(initial);
 const [reason,setReason]=useState("");
 const [department,setDepartment]=useState("all");
 const [showSampleTools,setShowSampleTools]=useState(false);
 const [reasonChoice,setReasonChoice]=useState("");
 const [events,setEvents]=useState([]);
 const [message,setMessage]=useState("");
 const person=examples.find(p=>p.id===selected);
 const departments=[...new Set(examples.map(p=>p.role))];
 const current=people[selected];
 const visible=examples.filter(p=>(department==="all"||p.role===department)&&(p.name+" "+p.role).toLowerCase().includes(search.toLowerCase()));
 const counts={active:examples.filter(p=>people[p.id].status==="active").length,suspended:examples.filter(p=>people[p.id].status==="suspended").length,permanently_revoked:examples.filter(p=>people[p.id].status==="permanently_revoked").length};
 function bulk(action){
  const chosen=examples.filter(p=>selectedMany.includes(p.id));
  const why=reasonChoice==="Other reason"?reason.trim():reasonChoice;
  if(!chosen.length||why.length<10){setMessage("Select staff and a valid reason before reviewing.");return;}
  if(chosen.some(p=>action==="restore"?people[p.id].status!=="suspended":action==="force_sign_out"?people[p.id].status!=="active"||!people[p.id].sessions:people[p.id].status!=="active")){setMessage("One or more selected staff are not eligible for this action. Review their status.");return;}
  setReview({action,chosen,why});setMessage("");
 }
 function confirmBulk(){
  if(!review)return;
  if(review.action==="permanently_revoke"&&!window.confirm("SIMULATION ONLY: permanently revoke "+review.chosen.length+" sample identities?"))return;
  const at=new Date().toISOString();
  setPeople(old=>{const next={...old};for(const p of review.chosen){const cur=next[p.id];next[p.id]=review.action==="force_sign_out"?{...cur,sessions:0}:review.action==="restore"?{status:"active",sessions:0}:{status:review.action==="suspend"?"suspended":"permanently_revoked",sessions:0};}return next;});
  setEvents(old=>[...review.chosen.map(p=>({name:p.name,action:review.action,reason:review.why,at})),...old]);
  setReview(null);setSelectedMany([]);setReasonChoice("");setReason("");setMessage("Sample bulk action completed. No real accounts were changed.");
 }
 function act(action){
  if(!person)return;
  if((reasonChoice==="Other reason"?reason.trim():reasonChoice).length<10){setMessage("Please enter a reason of at least 10 characters.");return;}
  if(current.status==="permanently_revoked"){setMessage("This identity is permanently revoked. Normal actions cannot restore it.");return;}
  if(action==="restore"&&current.status!=="suspended"){setMessage("Only a suspended identity can be restored.");return;}
  if(action==="permanently_revoke"&&!window.confirm("SIMULATION ONLY: permanently revoke this sample staff member? No real account is affected."))return;
  const next=action==="force_sign_out"?{...current,sessions:0}:action==="restore"?{status:"active",sessions:0}:{status:action==="suspend"?"suspended":"permanently_revoked",sessions:0};
  setPeople(old=>({...old,[selected]:next}));
  setEvents(old=>[{name:person.name,action,reason:reasonChoice==="Other reason"?reason.trim():reasonChoice,at:new Date().toISOString()},...old]);
  setReason("");setReasonChoice("");setMessage("Sample action completed. No real staff account or Production data was changed.");
 }
 function reset(){
  if(!person)return;
  setPeople(old=>({...old,[selected]:{status:"active",sessions:1}}));
  setEvents(old=>[{name:person.name,action:"reset_sample",reason:"Reset fictional test state only",at:new Date().toISOString()},...old]);
  setMessage("Sample reset for another demonstration. This cannot reset real revocations.");
 }
 return <section style={panel}>
  <div style={{background:"linear-gradient(125deg,#294d3f,#567864)",color:"white",padding:22,borderRadius:15}}><small style={{letterSpacing:2}}>FOUNDER CONTROL ROOM · ACCESS & SECURITY</small><h3 style={{fontSize:24,margin:"8px 0"}}>Staff Access Overview & History</h3><p>Professional staff access oversight, with clear decisions and accountability.</p><strong>INTERACTIVE SAMPLE · FICTIONAL STAFF ONLY</strong></div>
  <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(125px,1fr))",gap:10,marginTop:16}}>{[["Total staff",examples.length,"all"],["Active",counts.active,"active"],["Suspended",counts.suspended,"suspended"],["Permanently revoked",counts.permanently_revoked,"permanently_revoked"]].map(([label,value,key])=><button key={key} style={{...button,textAlign:"left",background:statusFilter===key?"#e1eee5":"white"}} onClick={()=>setStatusFilter(key)}><small>{label}</small><div style={{fontSize:27}}>{value}</div></button>)}</div>
  <div style={detail}><strong>Access status by staff member</strong>{examples.filter(p=>statusFilter==="all"||people[p.id].status===statusFilter).map(p=><p key={p.id}>{p.name} · {p.role} · <strong>{people[p.id].status.replaceAll("_"," ")}</strong></p>)}<small>Counts reflect sample identities, not real staff.</small></div>
  <p>Choose a sample staff member to test every button. These fictional identities are not real staff accounts. Changes and history are demonstrations only and are not saved to the real audit database.</p>
  <label htmlFor="sample-department-filter">Choose department</label><select id="sample-department-filter" style={field} value={department} onChange={e=>{setDepartment(e.target.value);setSelected("");}}><option value="all">All departments</option>{departments.map(d=><option key={d} value={d}>{d}</option>)}</select>
  <label htmlFor="sample-staff-search">Find and choose staff</label><input id="sample-staff-search" style={field} value={search} onFocus={()=>setPickerOpen(true)} onChange={e=>{setSearch(e.target.value);setPickerOpen(true);}} placeholder="Tap to see staff, or type a name" aria-expanded={pickerOpen} aria-controls="sample-staff-picker"/>
  <p style={{fontSize:13}}>Tap the search box to open the staff list. Tick individual names, or use Select all shown. Selection remains when you change departments.</p>
  <div style={actions}><button type="button" style={button} onClick={()=>{setPickerOpen(true);setSelectedMany(old=>[...new Set([...old,...visible.map(p=>p.id)])]);}}>Select all shown ({visible.length})</button><button type="button" style={button} onClick={()=>{setSelectedMany([]);setReview(null);}}>Clear selection</button><button type="button" style={button} onClick={()=>setPickerOpen(v=>!v)}>{pickerOpen?"Hide":"Show"} staff list</button></div>
  <div style={detail}><strong>Selected staff · {selectedMany.length}</strong><p style={{fontSize:13}}>These selections stay selected across departments. Clear selection removes all ticks, not staff access.</p>{selectedMany.length?examples.filter(p=>selectedMany.includes(p.id)).map(p=><div key={p.id} style={{display:"flex",justifyContent:"space-between",gap:8,alignItems:"center",padding:"7px 0"}}><span>{p.name} · {p.role}</span><button type="button" style={button} aria-label={"Remove "+p.name} onClick={()=>{setSelectedMany(old=>old.filter(id=>id!==p.id));setReview(null);}}>Remove</button></div>):<p>No staff selected yet.</p>}</div>
  {pickerOpen?<div id="sample-staff-picker" style={detail}><strong>Choose specific staff · {visible.length} shown</strong>{visible.length?visible.map(p=><label key={p.id} style={{display:"block",padding:12,borderBottom:"1px solid #dbe5dd"}}><input type="checkbox" checked={selectedMany.includes(p.id)} onChange={e=>{setSelectedMany(old=>e.target.checked?[...new Set([...old,p.id])]:old.filter(id=>id!==p.id));setReview(null);}}/> {p.name} · {p.role} · {people[p.id].status}</label>):<p>No matching staff. Try a different name or department.</p>}</div>:null}
  <div style={actions}>{visible.map(p=><button key={p.id} type="button" style={selected===p.id?chosen:button} onClick={()=>{setSelected(p.id);setReason("");setMessage("");}}>{p.name}</button>)}</div>
  {person?<div style={detail}>
   <h4>{person.name}</h4>
   <p>Department: {person.role}</p>
   <p>Access status: <strong>{current.status.replaceAll("_"," ").toUpperCase()}</strong> · Sample sessions: {current.sessions}</p>
   <label htmlFor="sample-staff-access-reason">Reason for action</label>
   <select id="sample-staff-access-reason" style={field} value={reasonChoice} onChange={e=>setReasonChoice(e.target.value)}><option value="">Choose a reason</option>{["Security precaution","Pending investigation","Temporary leave or absence","Security issue resolved","Approved return to work","Confirmed serious misconduct","Serious security breach","Other reason"].map(r=><option key={r} value={r}>{r}</option>)}</select>
   {reasonChoice==="Other reason"?<textarea rows={2} style={field} value={reason} onChange={e=>setReason(e.target.value)} placeholder="Explain the reason (10+ characters)"/>:null}
   <div style={actions}>
    <button type="button" style={button} disabled={!current.sessions||current.status!=="active"} onClick={()=>act("force_sign_out")}>Force Sign Out</button>
    <button type="button" style={button} disabled={current.status!=="active"} onClick={()=>act("suspend")}>Suspend Access</button>
    <button type="button" style={button} disabled={current.status!=="suspended"} onClick={()=>act("restore")}>Restore Access</button>
    <button type="button" style={danger} disabled={current.status==="permanently_revoked"} onClick={()=>act("permanently_revoke")}>Permanently Revoke Access</button>

   </div>
   <p>Permanent revocation disables normal access actions. Reset Sample Only restarts the fictional demonstration, never a genuine revocation.</p>
  </div>:<p>Select a sample name above to open its controls.</p>}
  <div style={detail}><strong>Bulk sample actions · review required</strong><p>Select multiple sample staff above, then choose a reason in the selected staff controls.</p><div style={actions}>{["force_sign_out","suspend","restore","permanently_revoke"].map(a=><button key={a} style={a==="permanently_revoke"?danger:button} onClick={()=>bulk(a)}>{a.replaceAll("_"," ")}</button>)}</div>{review?<div style={detail}><strong>Review {review.chosen.length} sample staff</strong><p>{review.action.replaceAll("_"," ")} · {review.why}</p>{review.chosen.map(p=><p key={p.id}>{p.name} · {p.role}</p>)}<button style={danger} onClick={confirmBulk}>Confirm sample action</button> <button style={button} onClick={()=>setReview(null)}>Cancel</button></div>:null}</div>
  <div style={detail}><button type="button" style={button} onClick={()=>setShowSampleTools(!showSampleTools)}>{showSampleTools?"Hide":"Show"} sample testing tools</button>{showSampleTools&&person?<button type="button" style={button} onClick={reset}>Reset Sample Only</button>:null}</div>
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
