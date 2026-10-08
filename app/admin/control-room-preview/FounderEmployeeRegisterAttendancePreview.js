"use client";

import {useCallback,useEffect,useMemo,useState} from "react";
import {createClient} from "@supabase/supabase-js";
import {HIISSA_PROTOTYPE_STAFF} from "../../../lib/hiissa-prototype-staff-directory.js";
import {filterHiissaEmployeeRegister,summarizeHiissaEmployeeDepartments} from "../../../lib/hiissa-employee-register-prototype-view.js";
import styles from "./FounderEmployeeRegisterAttendancePreview.module.css";

const apiClient=(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)
  ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) : null;
const tabs=[["register","Employee Register"],["attendance","Attendance"],["department","Department Overview"],["reports","Reports"]];
const demo=HIISSA_PROTOTYPE_STAFF.map(person=>({
  employee_id:person.id,display_name:person.name,department:person.departmentLabel,
  role_label:person.role,employment_state:"Not recorded",engagement_type:"Not recorded",
  start_date:null,locale:person.locale,timeZone:person.timeZone,isFictional:true
}));
function safeCsv(value) {
  const s=String(value ?? "");
  const guarded=/^[=+@\-\t\r]/.test(s)?"'"+s:s;
  return '"'+guarded.replaceAll('"','""')+'"';
}
function csvFor(rows) {
  return [["Name","Reference","Department","Role","Engagement Type","Employment State","Start Date"],...rows.map(p=>[
    p.display_name,p.isFictional?"FICTIONAL PROTOTYPE "+p.employee_id:p.employee_id,
    p.department,p.role_label,p.engagement_type,p.employment_state,p.start_date || "Not recorded"
  ])].map(row=>row.map(safeCsv).join(",")).join("\r\n");
}

export default function FounderEmployeeRegisterAttendancePreview() {
  const [tab,setTab]=useState("register");
  const [source,setSource]=useState("demo");
  const [remote,setRemote]=useState(null);
  const [state,setState]=useState("loading");
  const [error,setError]=useState("");
  const [search,setSearch]=useState("");
  const [department,setDepartment]=useState("all");
  const [type,setType]=useState("all");
  const [status,setStatus]=useState("all");
  const [selected,setSelected]=useState("");
  const [downloadMessage,setDownloadMessage]=useState("");

  const reload=useCallback(async()=>{
    setState("loading");setError("");
    try {
      if(!apiClient) throw new Error("UNCONFIGURED");
      const {data:{session}}=await apiClient.auth.getSession();
      if(!session?.access_token) throw new Error("SIGN_IN_REQUIRED");
      const response=await fetch("/api/admin/control-room/employee-register",{
        method:"GET",cache:"no-store",credentials:"same-origin",
        headers:{Authorization:"Bearer "+session.access_token}
      });
      const data=await response.json().catch(()=>null);
      if(!response.ok || data?.status!=="READY") throw new Error(data?.status||"READ_FAILED");
      setRemote(data);setState("ready");
    }catch(e){
      setState("error");
      setError(e?.message==="SIGN_IN_REQUIRED"?"Sign in to your Founder Control Room to view verified employee records.":
        "Employee Register data is not available yet. The demonstration directory remains separate.");
    }
  },[]);
  useEffect(()=>{reload();},[reload]);

  const rows=source==="demo"?demo:(remote?.employees||[]);
  const attendance=remote?.attendanceEvents||[];
  const departments=useMemo(()=>[...new Set(rows.map(p=>p.department).filter(Boolean))].sort(),[rows]);
  const visible=useMemo(()=>filterHiissaEmployeeRegister(rows,{search,department,type,status}),[rows,search,department,type,status]);
  const breakdown=useMemo(()=>summarizeHiissaEmployeeDepartments(visible),[visible]);
  const detail=visible.find(p=>p.employee_id===selected);
  const report=csvFor(visible);
  function exportReport(){
    if(!visible.length){setDownloadMessage("There are no matching records to export.");return;}
    const blob=new Blob([report],{type:"text/csv;charset=utf-8"});
    const href=URL.createObjectURL(blob);
    const a=document.createElement("a");
    a.href=href;a.download=source==="demo"?"hiissa-FICTIONAL-prototype-test-employees.csv":"hiissa-staging-employee-register.csv";
    document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(href);
    setDownloadMessage("Report exported from the selected "+(source==="demo"?"fictional":"verified Staging")+" data source.");
  }
  return <section className={styles.shell} id="staff-employee-register-attendance" aria-labelledby="employee-register-title">
    <header className={styles.hero}>
      <div className={styles.breadcrumb}>Founder Control Room <span>›</span> Staff &amp; Workspaces <span>›</span> Employee Register &amp; Attendance</div>
      <div className={styles.heroRow}>
        <div><div className={styles.kicker}>STAFF &amp; WORKSPACES</div><h3 id="employee-register-title">Employee Register &amp; Attendance</h3>
          <p>View the team, departments, employment records and separately evidenced attendance.</p></div>
        <strong className={styles.pill}>STAGING · FOUNDER ONLY</strong>
      </div>
    </header>
    <div className={styles.modeBox}>
      <label><span>Data source</span><select value={source} onChange={e=>{setSource(e.target.value);setDepartment("all");setType("all");setStatus("all");setSelected("");setSearch("");}}>
        <option value="demo">Prototype employees (10) — Fictional demonstration team</option><option value="staging">Verified Staging records (real employees)</option>
      </select></label>
      <p>{source==="demo"?"10 PROTOTYPE EMPLOYEES FOR STAGING TESTING · NO REAL RECORDS. All departments includes all ten test profiles; selecting one department narrows the same test roster. These are not actual hires or attendance facts.":
        "Real Staging source, Founder-authorised read only. No employee or attendance actions are activated by this view."}</p>
      {source==="staging"?<button type="button" className={styles.ghostButton} onClick={reload} disabled={state==="loading"}>↻ Refresh Staging data</button>:null}
    </div>
    {state==="error"&&source==="staging"?<p role="alert" className={styles.error}>{error}</p>:null}
    {state==="loading"&&source==="staging"?<p role="status" className={styles.notice}>Checking verified Staging data…</p>:null}
    <div className={styles.metricGrid}>
      <article className={styles.metric}><span>♧</span><div>{source==="demo"?"Prototype Employees":"Total Staff"}<strong>{source==="demo"?demo.length:state==="ready"?remote.realEmployeeCount:"—"}</strong><small>{source==="demo"?"Ten test employees · not real hires":"Verified employee records only"}</small></div></article>
      <article className={styles.metric}><span>✓</span><div>Present Today<strong>—</strong><small>Awaiting certified attendance rules</small></div></article>
      <article className={styles.metric}><span>◷</span><div>On Leave<strong>—</strong><small>No verified leave classification</small></div></article>
      <article className={styles.metric}><span>▣</span><div>Not Checked In<strong>—</strong><small>Cannot infer from sign-in or roster</small></div></article>
    </div>
    <nav className={styles.tabs} aria-label="Employee Register and Attendance sections">
      {tabs.map(([id,label])=><button type="button" key={id} className={tab===id?styles.activeTab:styles.tab}
       aria-pressed={tab===id} onClick={()=>{setTab(id);setDownloadMessage("");}}>{label}</button>)}
    </nav>
    <div className={styles.panel}>
      <div className={styles.heading}>
        <div><div className={styles.kicker}>FOUNDER STAFF MANAGEMENT</div><h4>{tabs.find(([id])=>id===tab)?.[1]}</h4></div>
        <div className={styles.actions}>
          {tab==="reports"?<button type="button" onClick={exportReport} className={styles.actionButton} disabled={!visible.length}>↓ Export CSV</button>:null}
          <a className={styles.actionButton} href="/admin/control-room?view=modules&focus=staff-onboarding#module10-staff-access">Existing Staff Onboarding ↗</a>
        </div>
      </div>
      <div className={styles.filters}>
        <label><span>Search name, role or reference</span><input type="search" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search the selected data source"/></label>
        <label><span>Department</span><select value={department} onChange={e=>setDepartment(e.target.value)}><option value="all">All departments</option>{departments.map(d=><option key={d} value={d}>{d}</option>)}</select></label>
        <label><span>Engagement</span><select value={type} onChange={e=>setType(e.target.value)}><option value="all">All engagement types</option>{[...new Set(rows.map(p=>p.engagement_type))].map(x=><option key={x} value={x}>{x}</option>)}</select></label>
        <label><span>Employment state</span><select value={status} onChange={e=>setStatus(e.target.value)}><option value="all">All states</option>{[...new Set(rows.map(p=>p.employment_state))].map(x=><option key={x} value={x}>{x}</option>)}</select></label>
      </div>
      {tab==="register"?<>
        {source==="demo"?<p className={styles.notice}>{visible.length} of {rows.length} prototype employees match the current search and department filters.</p>:null}
        {source==="staging"&&state==="ready"&&remote.realEmployeeCount===0?<p className={styles.notice}>No real employee records exist in Staging yet. Use the existing approved onboarding journey; staff records must wait for appropriate approval and confirmation.</p>:null}
        <div className={styles.tableWrap}><table className={styles.table}><thead><tr><th>Name</th><th>Reference</th><th>Role</th><th>Department</th><th>Engagement</th><th>Employment</th><th>Start date</th><th>Action</th></tr></thead>
          <tbody>{visible.map(person=><tr key={person.employee_id}>
            <td><strong>{person.display_name}</strong>{person.isFictional?<small>FICTIONAL</small>:null}</td>
            <td><small>{person.isFictional?"Prototype ID: ":"Internal ID: "}{person.employee_id}</small></td>
            <td>{person.role_label}</td><td>{person.department}</td><td>{person.engagement_type}</td>
            <td>{person.employment_state==="Not recorded"?"Not recorded":person.employment_state}</td><td>{person.start_date||"—"}</td>
            <td><button type="button" className={styles.inlineButton} aria-expanded={selected===person.employee_id}
              onClick={()=>setSelected(old=>old===person.employee_id?"":person.employee_id)}>View</button></td>
          </tr>)}</tbody></table></div>
        {!visible.length && (source==="demo"||state==="ready")?<p className={styles.empty}>No matching {source==="demo"?"prototype employees":"Staging employee records"}. Try clearing your filters.</p>:null}
        {detail?<div className={styles.detail} aria-live="polite"><strong>{detail.display_name}</strong><p>{detail.department} · {detail.role_label}</p>
          <p>{detail.isFictional?"Prototype ID — not an issued employee ID":"Internal record UUID — not a public staff number"}: {detail.employee_id}</p>
          <p>Attendance is never inferred from employment status. Account access is managed separately.</p>
        </div>:null}
      </>:null}
      {tab==="attendance"?<div className={styles.contentBlock}>
        <strong>{source==="demo"?"Attendance not connected":"Verified attendance event history"}</strong>
        <p>{source==="demo"?"No fictional staff attendance events exist. Fictional team members are not considered present, absent or on leave.":
          "Only independently recorded Staging attendance events appear below. Present/leave/not checked-in totals require a separately certified classification and timezone policy."}</p>
        {source==="staging"&&state==="ready"&&attendance.length>0?
          <div className={styles.eventList}>{attendance.map(event=><div key={event.attendance_event_id}><strong>{event.attendance_kind.replaceAll("_"," ")}</strong><span>{event.occurred_at} · Employee {event.employee_id}</span></div>)}</div>:
          <p className={styles.empty}>No verified attendance events to show.</p>}
      </div>:null}
      {tab==="department"?<div className={styles.contentBlock}>
        <p>{source==="demo"?"The bars below count the matching prototype employees after filters; they are not real staffing levels.":"Department counts follow the selected filters on verified Staging employee records."}</p>
        <p>{visible.length} matching {source==="demo"?"prototype employees":"verified employees"} across {breakdown.length} {breakdown.length===1?"department":"departments"}.</p>
        {breakdown.length?<div className={styles.departmentList}>{breakdown.map(item=><div key={item.name}>
          <div className={styles.barHeading}><strong>{item.name}</strong><span>{item.count}</span></div>
          <div className={styles.barTrack}><div style={{width:(visible.length?item.count/visible.length*100:0)+"%"}}/></div>
        </div>)}</div>:<p className={styles.empty}>No departments match these filters.</p>}
      </div>:null}
      {tab==="reports"?<div className={styles.contentBlock}>
        <h5>Department and employee report</h5>
        <p>Search and filters above determine exactly which {source==="demo"?"fictional":"verified Staging"} rows are included. Export creates a CSV file; it does not contact anyone or modify records.</p>
        <p><strong>{visible.length}</strong> matching {source==="demo"?"fictional":"real Staging"} records.</p>
        {visible.length===0?<p className={styles.empty}>No records available to export.</p>:null}
        {downloadMessage?<p role="status" className={styles.notice}>{downloadMessage}</p>:null}
      </div>:null}
    </div>
    <footer className={styles.footer}><strong>HIISSA protected separation</strong><p>The approved onboarding form is unchanged. Applicant, employee, attendance and Staff Access are separate. No new employee can be added, permission granted, or attendance recorded from this read-only view. Production is untouched.</p></footer>
  </section>;
}
