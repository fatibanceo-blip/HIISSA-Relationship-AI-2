"use client";

import {useMemo, useState} from "react";
import {
  HIISSA_PROTOTYPE_STAFF,
  HIISSA_PROTOTYPE_STAFF_DEPARTMENTS,
} from "../../../lib/hiissa-prototype-staff-directory.js";
import styles from "./FounderEmployeeRegisterAttendancePreview.module.css";

// Founder-approved DESIGN PREVIEW, not a real employee register.
// No real employee records, attendance writes, session changes, network calls or persistence.
export default function FounderEmployeeRegisterAttendancePreview() {
  const [tab, setTab] = useState("register");
  const [department, setDepartment] = useState("all");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState("");

  const visible = useMemo(() => HIISSA_PROTOTYPE_STAFF.filter(person =>
    (department === "all" || person.departmentId === department) &&
    (person.name + " " + person.role + " " + person.departmentLabel)
      .toLowerCase().includes(query.trim().toLowerCase())
  ), [department, query]);
  const selected = HIISSA_PROTOTYPE_STAFF.find(person => person.id === selectedId) || null;

  return (
    <section className={styles.shell} id="staff-employee-register-attendance" aria-labelledby="employee-register-title">
      <header className={styles.hero}>
        <span className={styles.eyebrow}>FOUNDER CONTROL ROOM · STAFF &amp; WORKSPACES</span>
        <h3 id="employee-register-title">Employee Register &amp; Attendance</h3>
        <p>One future home for employee details and attendance, with employment, presence and account access kept separate.</p>
        <strong className={styles.heroLabel}>STAGING DESIGN PREVIEW · TEN FICTIONAL PEOPLE · NO REAL RECORDS</strong>
      </header>

      <div className={styles.intro}>
        <div>
          <span className={styles.kicker}>DESIGN STATUS</span>
          <strong>Concept approved · first preview built for Founder review</strong>
          <p>This is a visual demonstration only. No employee has been onboarded and no staff ID, attendance entry or employment status has been issued.</p>
        </div>
        <div className={styles.stat}>
          <span className={styles.kicker}>FICTIONAL PROFILES</span>
          <strong>{HIISSA_PROTOTYPE_STAFF.length}</strong>
          <small>Shared with Staff Access and Private Appreciation</small>
        </div>
      </div>

      <div className={styles.tabs} role="group" aria-label="Employee Register and Attendance preview sections">
        <button type="button" aria-pressed={tab === "register"} className={tab === "register" ? styles.activeTab : styles.tab} onClick={() => setTab("register")}>Employee Register</button>
        <button type="button" aria-pressed={tab === "attendance"} className={tab === "attendance" ? styles.activeTab : styles.tab} onClick={() => setTab("attendance")}>Attendance</button>
      </div>

      <div className={styles.filters}>
        <label>
          <span>Find a fictional staff member</span>
          <input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search name, role or department" />
        </label>
        <label>
          <span>Department</span>
          <select value={department} onChange={event => setDepartment(event.target.value)}>
            <option value="all">All departments</option>
            {HIISSA_PROTOTYPE_STAFF_DEPARTMENTS.map(d => <option key={d.id} value={d.id}>{d.label}</option>)}
          </select>
        </label>
      </div>

      {tab === "register" ? (
        <div className={styles.body}>
          <div className={styles.heading}>
            <div><span className={styles.kicker}>ILLUSTRATIVE STAFF DIRECTORY</span><h4>Employee Register</h4></div>
            <span>{visible.length} fictional profile{visible.length === 1 ? "" : "s"} shown</span>
          </div>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead><tr><th scope="col">Person</th><th scope="col">Department &amp; role</th><th scope="col">Employment</th><th scope="col">Details</th></tr></thead>
              <tbody>
                {visible.map(person => (
                  <tr key={person.id}>
                    <td><strong>{person.name}</strong><small>Prototype ID: {person.id}</small></td>
                    <td>{person.departmentLabel}<small>{person.role}</small></td>
                    <td><span className={styles.unknown}>Not recorded</span></td>
                    <td><button type="button" className={styles.detailButton} aria-expanded={selectedId === person.id} onClick={() => setSelectedId(old => old === person.id ? "" : person.id)}>{selectedId === person.id ? "Close details" : "View details"}</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!visible.length ? <p role="status" className={styles.empty}>No fictional profiles match. Clear your search or choose All departments.</p> : null}
          {selected ? (
            <div className={styles.personDetail} aria-live="polite">
              <div><span className={styles.kicker}>FICTIONAL PERSON · READ-ONLY</span><h4>{selected.name}</h4></div>
              <dl>
                <div><dt>Department</dt><dd>{selected.departmentLabel}</dd></div>
                <div><dt>Role</dt><dd>{selected.role}</dd></div>
                <div><dt>Prototype ID</dt><dd>{selected.id} — not an issued employee number</dd></div>
                <div><dt>Employment state</dt><dd>Not recorded</dd></div>
                <div><dt>Attendance</dt><dd>Not connected or recorded</dd></div>
                <div><dt>Account access</dt><dd>Separate Staff Access controls; no data linked here</dd></div>
                <div><dt>Locale / time zone</dt><dd>{selected.locale} · {selected.timeZone}</dd></div>
              </dl>
              <p>This details view cannot hire, edit, suspend, archive or authenticate anybody.</p>
            </div>
          ) : null}
        </div>
      ) : (
        <div className={styles.body} aria-live="polite">
          <span className={styles.kicker}>ATTENDANCE · DESIGN ONLY</span>
          <h4>Attendance overview</h4>
          <div className={styles.attendanceState}>
            <strong>Attendance not connected</strong>
            <p>There are no recorded shifts, check-ins, absences or leave decisions in this preview. Showing a fictional person does not establish that they work for HIISSA or attended work.</p>
            <p>Filtered illustrative people: <strong>{visible.length}</strong>. No attendance status is inferred for any of them.</p>
          </div>
          <div className={styles.journey}>
            <div><strong>1. Authorised onboarding</strong><p>Create a real employee identity and unique ID only after separate approval.</p></div>
            <div><strong>2. Attendance evidence</strong><p>Record presence or absence independently of employment and system access.</p></div>
            <div><strong>3. Founder oversight</strong><p>Show privacy-safe history, source, timezone, permissions and review status.</p></div>
            <div><strong>4. Departure &amp; archive</strong><p>Keep the required employment and audit history without silently deleting it.</p></div>
          </div>
          <p className={styles.disclaimer}>These are concept-stage journeys, not working attendance functions or approved final interface wording.</p>
        </div>
      )}

      <footer className={styles.footer}>
        <strong>Protected boundaries</strong>
        <p>Fictional Staging data only. No database, attendance API, employee login, payroll, permission mutation, real audit history, Production release or activation. Operational health and alert connections are design contracts, not live monitoring.</p>
      </footer>
    </section>
  );
}
