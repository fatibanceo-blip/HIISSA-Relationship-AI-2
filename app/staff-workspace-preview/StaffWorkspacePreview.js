"use client";

import { useMemo, useState } from "react";
import {
  STAFF_WORKSPACE_SHELL_STANDARD,
  UNIVERSAL_FOUNDER_SUBMISSION_GATE,
} from "../../lib/experience-registry.js";
import styles from "./page.module.css";

const TABS = [
  ["assigned", "Assigned Work"],
  ["in-progress", "Work in Progress"],
  ["drafts", "Saved Drafts"],
  ["submitted", "Submitted for Processing"],
  ["returned", "Returned Work"],
  ["completed", "Completed Outcomes"],
  ["notifications", "Notifications"],
];

const FICTIONAL_CASE = Object.freeze({
  id: "CS-SIM-001",
  title: "Account access guidance",
  category: "Account & Access",
  priority: "Normal",
  received: "09:10 · fictional",
  acknowledged: "09:11 · fictional",
  responseDue: "14:00 · fictional",
  summary:
    "A fictional customer says they cannot find where to update an account preference. No real person, email address, account identifier or private HIISSA conversation is used.",
});

const RETURNED_EXAMPLE = Object.freeze({
  id: "CS-SIM-RET-001",
  title: "Clarify account-support wording",
  reason:
    "Founder simulation note: explain the next step more clearly before processing.",
  status: "RETURNED FOR CHANGES · FICTIONAL",
});

const COMPLETED_EXAMPLE = Object.freeze({
  id: "CS-SIM-DONE-001",
  title: "General navigation guidance",
  result:
    "Fictional example of a previously verified outcome. No external message was sent by this prototype.",
  status: "VERIFIED COMPLETE · FICTIONAL EXAMPLE",
});

function StatusPill({ children }) {
  return <span className={styles.statusPill}>{children}</span>;
}

function SummaryCard({ label, value, detail }) {
  return (
    <article className={styles.summaryCard}>
      <span>{label}</span>
      <strong>{value}</strong>
      <p>{detail}</p>
    </article>
  );
}

export default function StaffWorkspacePreview() {
  const [activeTab, setActiveTab] = useState("assigned");
  const [caseState, setCaseState] = useState("ASSIGNED");
  const [draft, setDraft] = useState("");
  const [internalNote, setInternalNote] = useState("");
  const [notice, setNotice] = useState("");
  const [signedOut, setSignedOut] = useState(false);

  const workspace = useMemo(
    () =>
      STAFF_WORKSPACE_SHELL_STANDARD.workspaces.find(
        (item) => item.id === "customer_support"
      ),
    []
  );

  function startWork() {
    setCaseState("IN_PROGRESS");
    setNotice("Fictional work item moved to Work in Progress.");
    setActiveTab("in-progress");
  }

  function saveDraft() {
    if (!draft.trim()) {
      setNotice("Add a fictional draft response before saving.");
      return;
    }

    setCaseState("SAVED_DRAFT");
    setNotice("Draft saved inside this fictional Staging prototype only.");
    setActiveTab("drafts");
  }

  function submitForProcessing() {
    if (!draft.trim()) {
      setNotice("Add a fictional draft response before submitting.");
      return;
    }

    setCaseState("SUBMITTED_FOR_PROCESSING");
    setNotice(UNIVERSAL_FOUNDER_SUBMISSION_GATE.staffSubmittedConfirmation);
    setActiveTab("submitted");
  }

  function resetCase() {
    setCaseState("ASSIGNED");
    setDraft("");
    setInternalNote("");
    setNotice("Fictional case reset. No external action occurred.");
    setActiveTab("assigned");
  }

  if (signedOut) {
    return (
      <main className={styles.page}>
        <section className={styles.signedOutCard}>
          <div className={styles.kicker}>HIISSA STAFF WORKSPACE · STAGING</div>
          <h1>Fictional staff session ended</h1>
          <p>
            This only ended the local prototype session. No real staff account,
            Admin permission, customer record or production session was changed.
          </p>
          <button
            type="button"
            className={styles.primaryButton}
            onClick={() => setSignedOut(false)}
          >
            Restart fictional workspace
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <section className={styles.shell}>
        <header className={styles.header}>
          <div>
            <div className={styles.kicker}>HIISSA STAFF WORKSPACE</div>
            <h1>Customer Support</h1>
            <p className={styles.subtitle}>
              Fictional Staging prototype for testing staff work before any real
              employee or real customer action is enabled.
            </p>
          </div>

          <div className={styles.headerActions}>
            <StatusPill>STAGING · FICTIONAL ONLY</StatusPill>
            <button
              type="button"
              className={styles.secondaryButton}
              onClick={() => setSignedOut(true)}
            >
              Secure sign out
            </button>
          </div>
        </header>

        <section className={styles.identityStrip}>
          <div>
            <span>STAFF IDENTITY</span>
            <strong>Sample Customer Support Worker</strong>
          </div>
          <div>
            <span>AUTHORISED ROLE</span>
            <strong>{workspace?.label || "Customer Support"}</strong>
          </div>
          <div>
            <span>ENVIRONMENT</span>
            <strong>Staging only</strong>
          </div>
          <div>
            <span>ACCESS BOUNDARY</span>
            <strong>Customer Support workspace only</strong>
          </div>
        </section>

        <section className={styles.safetyNotice}>
          <strong>No real customer action can happen here.</strong>
          <p>
            This prototype contains only fictional work. Staff can investigate,
            prepare, draft and save. Final staff submission must pass through the
            Founder gate before any future real execution. This screen cannot send
            email, text a customer, alter an account, publish content, move money or
            change Production.
          </p>
        </section>

        <div className={styles.workspaceGrid}>
          <nav className={styles.nav} aria-label="Customer Support workspace">
            <div className={styles.navHeading}>My workspace</div>
            {TABS.map(([id, label]) => (
              <button
                type="button"
                key={id}
                className={activeTab === id ? styles.navActive : styles.navItem}
                onClick={() => setActiveTab(id)}
              >
                {label}
              </button>
            ))}
          </nav>

          <section className={styles.content}>
            {notice ? (
              <div
                className={
                  caseState === "SUBMITTED_FOR_PROCESSING"
                    ? styles.successNotice
                    : styles.inlineNotice
                }
                role="status"
              >
                <strong>{notice}</strong>
                {caseState === "SUBMITTED_FOR_PROCESSING" ? (
                  <p>
                    Nothing has been sent to a customer. In the live certified
                    design, HIISSA would route one underlying approval record to
                    the {UNIVERSAL_FOUNDER_SUBMISSION_GATE.founderRoute}. Staff
                    cannot approve their own submission.
                  </p>
                ) : null}
              </div>
            ) : null}

            {activeTab === "assigned" ? (
              <AssignedWork
                caseState={caseState}
                onStart={startWork}
                onOpen={() => setActiveTab("in-progress")}
              />
            ) : null}

            {activeTab === "in-progress" ? (
              <WorkEditor
                caseState={caseState}
                draft={draft}
                internalNote={internalNote}
                setDraft={setDraft}
                setInternalNote={setInternalNote}
                onSave={saveDraft}
                onSubmit={submitForProcessing}
              />
            ) : null}

            {activeTab === "drafts" ? (
              <SavedDraft
                draft={draft}
                caseState={caseState}
                onContinue={() => setActiveTab("in-progress")}
                onSubmit={submitForProcessing}
              />
            ) : null}

            {activeTab === "submitted" ? (
              <SubmittedWork
                draft={draft}
                caseState={caseState}
                onReset={resetCase}
              />
            ) : null}

            {activeTab === "returned" ? <ReturnedWork /> : null}
            {activeTab === "completed" ? <CompletedWork /> : null}
            {activeTab === "notifications" ? <Notifications /> : null}
          </section>
        </div>

        <footer className={styles.footer}>
          <div>
            <strong>Universal Founder Submission Gate</strong>
            <span>
              {UNIVERSAL_FOUNDER_SUBMISSION_GATE.staffSubmitLabel} →{" "}
              {UNIVERSAL_FOUNDER_SUBMISSION_GATE.founderRoute}
            </span>
          </div>
          <div>
            <strong>Prototype evidence level</strong>
            <span>
              Architecture/behaviour approved · visual treatment requires Founder
              preview acceptance
            </span>
          </div>
        </footer>
      </section>
    </main>
  );
}

function AssignedWork({ caseState, onStart, onOpen }) {
  return (
    <>
      <section className={styles.pageHeading}>
        <div>
          <div className={styles.kicker}>ASSIGNED WORK</div>
          <h2>Work assigned to your authorised role</h2>
          <p>
            Only fictional Customer Support work is shown in this first Staging
            workspace.
          </p>
        </div>
        <StatusPill>1 FICTIONAL ITEM</StatusPill>
      </section>

      <article className={styles.caseCard}>
        <div className={styles.caseTop}>
          <div>
            <span className={styles.caseId}>{FICTIONAL_CASE.id}</span>
            <h3>{FICTIONAL_CASE.title}</h3>
          </div>
          <StatusPill>{caseState.replaceAll("_", " ")}</StatusPill>
        </div>

        <p>{FICTIONAL_CASE.summary}</p>

        <div className={styles.metaGrid}>
          <span>Category: {FICTIONAL_CASE.category}</span>
          <span>Priority: {FICTIONAL_CASE.priority}</span>
          <span>Received: {FICTIONAL_CASE.received}</span>
          <span>Response due: {FICTIONAL_CASE.responseDue}</span>
        </div>

        <div className={styles.actions}>
          {caseState === "ASSIGNED" ? (
            <button
              type="button"
              className={styles.primaryButton}
              onClick={onStart}
            >
              Start work
            </button>
          ) : (
            <button
              type="button"
              className={styles.primaryButton}
              onClick={onOpen}
            >
              Open current work
            </button>
          )}
        </div>
      </article>

      <section className={styles.summaryGrid}>
        <SummaryCard
          label="RECEIVED"
          value={FICTIONAL_CASE.received}
          detail="Fictional service-centre timing."
        />
        <SummaryCard
          label="ACKNOWLEDGED"
          value={FICTIONAL_CASE.acknowledged}
          detail="Prototype status only; no acknowledgement was actually sent."
        />
        <SummaryCard
          label="HUMAN RESPONSE DUE"
          value={FICTIONAL_CASE.responseDue}
          detail="Used to test the approved response-due concept."
        />
        <SummaryCard
          label="RESOLUTION"
          value="OPEN · FICTIONAL"
          detail="No real support case exists."
        />
      </section>
    </>
  );
}

function WorkEditor({
  caseState,
  draft,
  internalNote,
  setDraft,
  setInternalNote,
  onSave,
  onSubmit,
}) {
  return (
    <>
      <section className={styles.pageHeading}>
        <div>
          <div className={styles.kicker}>WORK IN PROGRESS</div>
          <h2>{FICTIONAL_CASE.title}</h2>
          <p>
            Prepare the response inside your role. Submission does not send it.
          </p>
        </div>
        <StatusPill>{caseState.replaceAll("_", " ")}</StatusPill>
      </section>

      <section className={styles.caseSummary}>
        <strong>Fictional customer summary</strong>
        <p>{FICTIONAL_CASE.summary}</p>
        <div className={styles.privacyLine}>
          Minimum necessary context only · unrelated private HIISSA conversations
          are not available to this workspace.
        </div>
      </section>

      <label className={styles.field}>
        <span>Draft response</span>
        <textarea
          rows={9}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Write a fictional Customer Support response here…"
        />
      </label>

      <label className={styles.field}>
        <span>Internal support note · not customer-facing</span>
        <textarea
          rows={4}
          value={internalNote}
          onChange={(event) => setInternalNote(event.target.value)}
          placeholder="Optional fictional internal note…"
        />
      </label>

      <section className={styles.submissionGate}>
        <div>
          <div className={styles.kicker}>MANDATORY HUMAN-STAFF GATE</div>
          <strong>Staff cannot perform the final external action.</strong>
          <p>
            Save as draft if work is not finished. When it is ready, submit it to
            HIISSA for Founder processing. The Founder decision is separate from
            verified execution.
          </p>
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={onSave}
          >
            Save draft
          </button>
          <button
            type="button"
            className={styles.primaryButton}
            onClick={onSubmit}
          >
            {UNIVERSAL_FOUNDER_SUBMISSION_GATE.staffSubmitLabel}
          </button>
        </div>
      </section>
    </>
  );
}

function SavedDraft({ draft, caseState, onContinue, onSubmit }) {
  return (
    <>
      <section className={styles.pageHeading}>
        <div>
          <div className={styles.kicker}>SAVED DRAFTS</div>
          <h2>Work preserved before submission</h2>
          <p>A saved draft has no external effect.</p>
        </div>
        <StatusPill>{caseState.replaceAll("_", " ")}</StatusPill>
      </section>

      {draft ? (
        <article className={styles.caseCard}>
          <span className={styles.caseId}>{FICTIONAL_CASE.id}</span>
          <h3>{FICTIONAL_CASE.title}</h3>
          <div className={styles.draftPreview}>{draft}</div>
          <div className={styles.actions}>
            <button
              type="button"
              className={styles.secondaryButton}
              onClick={onContinue}
            >
              Continue editing
            </button>
            <button
              type="button"
              className={styles.primaryButton}
              onClick={onSubmit}
            >
              {UNIVERSAL_FOUNDER_SUBMISSION_GATE.staffSubmitLabel}
            </button>
          </div>
        </article>
      ) : (
        <div className={styles.emptyState}>No fictional draft has been saved yet.</div>
      )}
    </>
  );
}

function SubmittedWork({ draft, caseState, onReset }) {
  const submitted = caseState === "SUBMITTED_FOR_PROCESSING";

  return (
    <>
      <section className={styles.pageHeading}>
        <div>
          <div className={styles.kicker}>SUBMITTED FOR PROCESSING</div>
          <h2>Waiting for the Founder gate</h2>
          <p>
            A staff submission is not a sent customer response and is not verified
            completion.
          </p>
        </div>
        <StatusPill>
          {submitted ? "AWAITING FOUNDER PROCESSING" : "NO SUBMISSION"}
        </StatusPill>
      </section>

      {submitted ? (
        <>
          <section className={styles.successPanel}>
            <strong>
              {UNIVERSAL_FOUNDER_SUBMISSION_GATE.staffSubmittedConfirmation}
            </strong>
            <p>
              HIISSA would now route the work to the{" "}
              {UNIVERSAL_FOUNDER_SUBMISSION_GATE.founderRoute}. The Founder may
              Approve, Return for Changes or Reject from the Founder side. Those
              controls never appear in this staff workspace.
            </p>
          </section>

          <article className={styles.caseCard}>
            <span className={styles.caseId}>{FICTIONAL_CASE.id}</span>
            <h3>{FICTIONAL_CASE.title}</h3>
            <div className={styles.draftPreview}>{draft}</div>
            <div className={styles.metaGrid}>
              <span>State: Submitted for processing</span>
              <span>External send: Not performed</span>
              <span>Founder decision: Pending in simulation</span>
              <span>Production effect: None</span>
            </div>
          </article>

          <section className={styles.flowStrip}>
            <span className={styles.flowComplete}>Staff prepared work</span>
            <span className={styles.flowComplete}>Submitted for processing</span>
            <span>Founder decision</span>
            <span>Controlled execution</span>
            <span>Verify · Record · Report</span>
          </section>

          <button
            type="button"
            className={styles.secondaryButton}
            onClick={onReset}
          >
            Reset fictional case
          </button>
        </>
      ) : (
        <div className={styles.emptyState}>
          No fictional work has been submitted for processing yet.
        </div>
      )}
    </>
  );
}

function ReturnedWork() {
  return (
    <>
      <section className={styles.pageHeading}>
        <div>
          <div className={styles.kicker}>RETURNED WORK</div>
          <h2>Founder-returned items come back with context</h2>
          <p>
            Returned work remains attributable and can be corrected without losing
            the earlier proposal.
          </p>
        </div>
        <StatusPill>FICTIONAL EXAMPLE</StatusPill>
      </section>

      <article className={styles.caseCard}>
        <span className={styles.caseId}>{RETURNED_EXAMPLE.id}</span>
        <h3>{RETURNED_EXAMPLE.title}</h3>
        <p>{RETURNED_EXAMPLE.reason}</p>
        <div className={styles.metaGrid}>
          <span>{RETURNED_EXAMPLE.status}</span>
          <span>No external action occurred</span>
        </div>
      </article>
    </>
  );
}

function CompletedWork() {
  return (
    <>
      <section className={styles.pageHeading}>
        <div>
          <div className={styles.kicker}>COMPLETED OUTCOMES</div>
          <h2>Only verified outcomes belong here</h2>
          <p>
            Founder approval alone is never displayed as completed execution.
          </p>
        </div>
        <StatusPill>FICTIONAL EXAMPLE</StatusPill>
      </section>

      <article className={styles.caseCard}>
        <span className={styles.caseId}>{COMPLETED_EXAMPLE.id}</span>
        <h3>{COMPLETED_EXAMPLE.title}</h3>
        <p>{COMPLETED_EXAMPLE.result}</p>
        <div className={styles.metaGrid}>
          <span>{COMPLETED_EXAMPLE.status}</span>
          <span>Prototype evidence only</span>
        </div>
      </article>
    </>
  );
}

function Notifications() {
  return (
    <>
      <section className={styles.pageHeading}>
        <div>
          <div className={styles.kicker}>STAFF NOTIFICATIONS</div>
          <h2>Role-relevant work notices only</h2>
          <p>
            Staff do not need access to private Founder decision machinery or
            unrelated Control Room information.
          </p>
        </div>
        <StatusPill>FICTIONAL</StatusPill>
      </section>

      <div className={styles.notificationList}>
        <article>
          <strong>Response target approaching · fictional</strong>
          <p>CS-SIM-001 has a fictional response target at 14:00.</p>
        </article>
        <article>
          <strong>Returned work available · fictional</strong>
          <p>One sample item demonstrates the Return for Changes pathway.</p>
        </article>
        <article>
          <strong>Permission boundary active</strong>
          <p>
            This workspace is limited to Customer Support simulation records and
            cannot expose other staff roles or private Founder controls.
          </p>
        </article>
      </div>
    </>
  );
}
