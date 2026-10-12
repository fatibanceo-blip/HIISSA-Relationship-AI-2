"use client";
import {useState} from "react";
import {formatHiissaRecordTime} from "../../../lib/hiissa-record-time.js";

const section={background:"#fff",border:"1px solid #d8e4d8",borderRadius:16,padding:22,marginTop:22,lineHeight:1.6};
const field={padding:12,border:"1px solid #7f9b8a",borderRadius:9,color:"#233f32",background:"#fff",font:"inherit",width:"100%",boxSizing:"border-box"};
const button={padding:"12px 18px",border:"1px solid #245b48",borderRadius:12,color:"#fff",background:"#245b48",fontWeight:700,cursor:"pointer"};
const form={display:"grid",gap:9,maxWidth:680};
const group={padding:15,marginTop:12,border:"1px solid #c9dccb",borderRadius:12,display:"grid",gap:8};
const actions={display:"flex",gap:10,flexWrap:"wrap"};
const dateText=x=>x?formatHiissaRecordTime(x):"Not recorded";

export function CustomerPracticeActions({data,onAction,busy}){
  const [title,setTitle]=useState("");
  const [summary,setSummary]=useState("");
  const [notes,setNotes]=useState({});
  const [feedback,setFeedback]=useState("");
  async function create(event){
    event.preventDefault();
    setFeedback("");
    if(title.trim().length<3||summary.trim().length<8){setFeedback("Please add a title and a full fictional description.");return;}
    if(await onAction({action:"create",title:title.trim(),summary:summary.trim()})){
      setTitle("");setSummary("");
    }
  }
  return <section style={section} aria-label="Active Staging customer support practice">
    <h2>Working Founder Customer Support actions</h2>
    <p><strong>Fictional Staging practice only.</strong> Create a request, assign it to Customer Support, and save internal notes. The saved records and audit history persist after refresh. This does not send a message to a customer or substitute for the approved automatic acknowledgement.</p>
    <form onSubmit={create} style={form}>
      <label htmlFor="practice-title">Practice request title</label>
      <input id="practice-title" style={field} value={title} onChange={e=>setTitle(e.target.value)} minLength={3} maxLength={160} required/>
      <label htmlFor="practice-summary">Practice description — no real customer information</label>
      <textarea id="practice-summary" style={field} value={summary} onChange={e=>setSummary(e.target.value)} rows={3} minLength={8} maxLength={2000} required/>
      <button type="submit" style={button} disabled={busy||!data}>Create and save practice request</button>
      {feedback?<p role="alert">{feedback}</p>:null}
    </form>
    <h3>Saved practice requests</h3>
    {!data?<p>Founder verification is required to show saved requests.</p>:
     !data.stagingPracticeCases?.length?<p>No requests recorded yet. Create one above to test the save and refresh journey.</p>:
      data.stagingPracticeCases.map(item=><article style={group} key={item.id}>
        <strong>{item.title} · FICTIONAL STAGING</strong>
        <div>{item.request_summary}</div>
        <small>Created: {dateText(item.created_at)} · Assigned: {item.assigned_department||"Not yet"} · Actual customer acknowledgement: NOT SENT</small>
        <div style={actions}><button type="button" disabled={busy||!!item.assigned_department} style={button}
          onClick={()=>onAction({action:"assign",id:item.id,version:item.version})}>Assign to Customer Support</button></div>
        <label htmlFor={"support-note-"+item.id}>Private internal practice note</label>
        <textarea style={field} rows={2} id={"support-note-"+item.id} maxLength={1500}
          value={notes[item.id]??item.internal_note??""} onChange={e=>setNotes(n=>({...n,[item.id]:e.target.value}))}/>
        <button type="button" disabled={busy} style={button}
          onClick={()=>onAction({action:"save_internal_note",id:item.id,version:item.version,
            note:notes[item.id]??item.internal_note??""})}>Save internal note</button>
      </article>)}
  </section>;
}
const areas=[
 ["POLICY_ACCEPTANCE","Policy acceptance / version"],
 ["TRAINING_EVIDENCE","Training evidence"],
 ["ACCESS_REVIEW","Access review"],
 ["TEMPORARY_PERMISSION","Temporary permission review"],
 ["SECURITY_CONCERN","Security / access concern"],
 ["ROLE_CHANGE","Role change"]
];
export function StaffPracticeActions({data,onAction,onAssist,busy}){
  const [who,setWho]=useState("");
  const [area,setArea]=useState("TRAINING_EVIDENCE");
  const [reference,setReference]=useState("");
  const [description,setDescription]=useState("");
  const [due,setDue]=useState("");
  const [reasons,setReasons]=useState({});
  const [feedback,setFeedback]=useState("");
  const [assistBusy,setAssistBusy]=useState(null);
  const [assistDrafts,setAssistDrafts]=useState({});
  const [assistErrors,setAssistErrors]=useState({});
  async function askHiissa(item){
    if(assistBusy)return;
    setAssistBusy(item.id);
    setAssistErrors(prev=>({...prev,[item.id]:""}));
    try{
      const draft=await onAssist(item.id,item.version);
      if(draft?.recordId!==item.id||draft?.version!==item.version)
        throw new Error("The source record changed. Refresh before using this suggestion.");
      setAssistDrafts(prev=>({...prev,[item.id]:draft}));
    }catch(error){
      setAssistErrors(prev=>({...prev,[item.id]:error?.message||"No review was prepared."}));
    }finally{
      setAssistBusy(null);
    }
  }

  async function create(event){
    event.preventDefault();
    setFeedback("");
    if(!who||reference.trim().length<8||description.trim().length<10){
      setFeedback("Select a fictional staff member and give the evidence reference and explanation.");return;
    }
    if(await onAction({action:"record",staffReference:who,reviewArea:area,
      evidenceReference:reference.trim(),evidenceNote:description.trim(),dueOn:due})){
      setReference("");setDescription("");setDue("");
    }
  }
  return <section style={section} aria-label="Active Founder staff evidence practice">
    <h2>Working staff evidence and Founder review</h2>
    <p><strong>Approved fictional Staging staff only.</strong> Record evidence, review the saved item, and either verify it as a fictional practice record or request correction. All results are saved and audited. This does not certify training for a real employee or grant access.</p>
    <form onSubmit={create} style={form}>
      <label htmlFor="practice-staff">Approved fictional staff member</label>
      <select id="practice-staff" style={field} value={who} onChange={e=>setWho(e.target.value)} required>
        <option value="">Select from the existing fictional directory</option>
        {(data?.fictionalRoster||[]).map(p=><option key={p.id} value={p.id}>{p.name} — {p.department}</option>)}
      </select>
      <label htmlFor="practice-area">Review category</label>
      <select id="practice-area" style={field} value={area} onChange={e=>setArea(e.target.value)}>
        {areas.map(([v,name])=><option value={v} key={v}>{name}</option>)}
      </select>
      <label htmlFor="practice-reference">Fictional evidence reference</label>
      <input id="practice-reference" style={field} value={reference} onChange={e=>setReference(e.target.value)} maxLength={240} minLength={8} required placeholder="e.g., STAGING-TRAINING-001"/>
      <label htmlFor="practice-description">Evidence explanation (no real staff information)</label>
      <textarea id="practice-description" style={field} value={description} onChange={e=>setDescription(e.target.value)} maxLength={1500} minLength={10} rows={3} required/>
      <label htmlFor="practice-due">Optional next review date</label>
      <input id="practice-due" type="date" style={field} value={due} onChange={e=>setDue(e.target.value)}/>
      <button type="submit" style={button} disabled={busy||!data}>Record and save practice evidence</button>
      {feedback?<p role="alert">{feedback}</p>:null}
    </form>
    <h3>Saved staff practice reviews</h3>
    {!data?<p>Founder verification is required.</p>:
     !data.stagingPracticeReviews?.length?<p>No staff practice reviews saved yet. Record one above to try the full review journey.</p>:
      data.stagingPracticeReviews.map(item=><article key={item.id} style={group}>
        <strong>{item.staff_reference} · {item.review_area.replaceAll("_"," ")} · {item.state}</strong>
        <div>Evidence: {item.evidence_reference} — {item.evidence_note}</div>
        <small>Recorded: {dateText(item.created_at)} · Due: {item.due_on||"Not specified"} · Reviewed: {dateText(item.reviewed_at)}</small>
        {item.founder_review_note?<div>Founder review: {item.founder_review_note}</div>:null}
        {item.review_area==="TRAINING_EVIDENCE"?<div style={{padding:14,border:"1px solid #c9dccb",borderRadius:12,display:"grid",gap:9}}>
          <strong>Optional HIISSA evidence assistant</strong>
          <small>HIISSA examines this saved fictional evidence and suggests a review. It cannot confirm real training, access external certificates, or approve for you.</small>
          <div style={actions}>
            <button type="button" style={button} disabled={busy||!!assistBusy||!onAssist}
              onClick={()=>askHiissa(item)}>
              {assistBusy===item.id?"Preparing suggestion…":"Review with HIISSA"}
            </button>
          </div>
          {assistErrors[item.id]?<p role="alert">{assistErrors[item.id]}</p>:null}
          {assistDrafts[item.id]?.version===item.version?<div style={{background:"#edf3ed",borderRadius:10,padding:13,display:"grid",gap:8}} role="status">
            <strong>HIISSA suggestion — not a decision</strong>
            <div>{assistDrafts[item.id].summary}</div>
            <strong>What still needs checking</strong>
            <ul>{(assistDrafts[item.id].missingEvidence||[]).map((x,i)=><li key={i}>{x}</li>)}</ul>
            <strong>Suggested Founder review wording</strong>
            <p>{assistDrafts[item.id].draftFounderReason}</p>
            <button type="button" style={button} onClick={()=>setReasons(prev=>({...prev,[item.id]:assistDrafts[item.id].draftFounderReason}))}>Use suggested wording — I will check it</button>
            <small>The Founder must check the original evidence and deliberately select a decision below. Using the draft never approves training.</small>
          </div>:null}
        </div>:null}
        <label htmlFor={"practice-review-reason-"+item.id}>Founder review reason (required)</label>
        <textarea id={"practice-review-reason-"+item.id} style={field} rows={2} maxLength={1000}
          value={reasons[item.id]||""} onChange={e=>setReasons(n=>({...n,[item.id]:e.target.value}))}/>
        <div style={actions}>
          <button type="button" style={button} disabled={busy||(reasons[item.id]||"").trim().length<8}
            onClick={()=>onAction({action:"verify_practice",id:item.id,version:item.version,founderNote:reasons[item.id]})}>Verify fictional practice record</button>
          <button type="button" style={button} disabled={busy||(reasons[item.id]||"").trim().length<8}
            onClick={()=>onAction({action:"request_correction",id:item.id,version:item.version,founderNote:reasons[item.id]})}>Request correction</button>
        </div>
      </article>)}
  </section>;
}
