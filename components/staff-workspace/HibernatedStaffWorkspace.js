"use client";

import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { useEffect, useMemo, useState } from "react";
import {
  UNIVERSAL_FOUNDER_SUBMISSION_GATE,
} from "../../lib/experience-registry.js";
import {
  formatHiissaGlobalRecordTime,
  hiissaResolvedLocale,
  hiissaResolvedTimeZone,
} from "../../lib/hiissa-record-time.js";
import {
  getHibernatedStaffWorkspace,
} from "../../lib/hibernated-staff-workspaces.js";
import GentleCheckIn from "../people-experience/GentleCheckIn.js";
import WorkdayClose from "../people-experience/WorkdayClose.js";
import PrivateAppreciation from "../people-experience/PrivateAppreciation.js";
import styles from "./HibernatedStaffWorkspace.module.css";

const TABS = Object.freeze([
  ["assigned", "Assigned Work"],
  ["in-progress", "Work in Progress"],
  ["drafts", "Saved Drafts"],
  ["submitted", "Submitted for Processing"],
  ["returned", "Returned Work"],
  ["completed", "Completed Outcomes"],
  ["notifications", "Notifications"],
]);

const STATUS_TO_TAB = Object.freeze({
  assigned: "assigned",
  in_progress: "in-progress",
  saved_draft: "drafts",
  submitted_for_processing: "submitted",
  returned_for_changes: "returned",
  verified_complete: "completed",
});

let browserSupabase = null;

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) return null;

  if (!browserSupabase) {
    browserSupabase = createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  }

  return browserSupabase;
}

function statusLabel(value) {
  return String(value || "assigned").replaceAll("_", " ").toUpperCase();
}

function currentDaypart() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 17) return "afternoon";
  return "evening";
}

function StatusPill({ children, tone = "default" }) {
  return (
    <span
      className={
        tone === "hibernated"
          ? styles.statusPillHibernated
          : tone === "working"
            ? styles.statusPillWorking
            : styles.statusPill
      }
    >
      {children}
    </span>
  );
}

function InfoCard({ label, value, detail }) {
  return (
    <article className={styles.infoCard}>
      <span>{label}</span>
      <strong>{value}</strong>
      {detail ? <p>{detail}</p> : null}
    </article>
  );
}

function EmptyState({ title, detail }) {
  return (
    <div className={styles.emptyState}>
      <strong>{title}</strong>
      <p>{detail}</p>
    </div>
  );
}

export default function HibernatedStaffWorkspace({ workspaceId }) {
  const workspace = useMemo(
    () => getHibernatedStaffWorkspace(workspaceId),
    [workspaceId]
  );

  const [authState, setAuthState] = useState("checking");
  const [activeTab, setActiveTab] = useState("assigned");
  const [status, setStatus] = useState("assigned");
  const [draft, setDraft] = useState("");
  const [internalNote, setInternalNote] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [lastActionAt, setLastActionAt] = useState(() => new Date());
  const [checkInOpen, setCheckInOpen] = useState(false);
  const [calmStart, setCalmStart] = useState(false);
  const [workdayCloseOpen, setWorkdayCloseOpen] = useState(false);

  useEffect(() => {
    let active = true;

    async function verifyFounder() {
      const supabase = getSupabase();

      if (!supabase) {
        if (active) setAuthState("unavailable");
        return;
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!active) return;

      if (!session) {
        setAuthState("signedout");
        return;
      }

      const { data: isAdmin, error: adminError } =
        await supabase.rpc("is_hiissa_admin");

      if (!active) return;

      if (adminError || !isAdmin) {
        setAuthState("blocked");
        return;
      }

      setAuthState("ready");
    }

    verifyFounder();

    return () => {
      active = false;
    };
  }, [workspaceId]);

  function recordAction(message, nextStatus = status, nextTab = null) {
    setStatus(nextStatus);
    setLastActionAt(new Date());
    setNotice(message);
    setError("");
    if (nextTab) setActiveTab(nextTab);
  }

  function startWork() {
    recordAction(
      "Fictional work moved into Work in Progress for this Founder Preview session.",
      "in_progress",
      "in-progress"
    );
  }

  function saveDraft() {
    if (!draft.trim()) {
      setError("Add a short fictional working note before saving this preview draft.");
      return;
    }

    recordAction(
      "Draft saved for this Founder Preview session only. Nothing was written to a database.",
      "saved_draft",
      "drafts"
    );
  }

  function submitForProcessing() {
    if (!draft.trim()) {
      setError("A fictional draft is required before this preview can be submitted for processing.");
      return;
    }

    recordAction(
      UNIVERSAL_FOUNDER_SUBMISSION_GATE.staffSubmittedConfirmation +
        " — preview only; no approval record or external action was created.",
      "submitted_for_processing",
      "submitted"
    );
  }

  function previewReturnedBranch() {
    recordAction(
      "Founder Preview branch loaded: returned for changes. This does not create a real Founder decision.",
      "returned_for_changes",
      "returned"
    );
  }

  function previewCompletedBranch() {
    recordAction(
      "Founder Preview branch loaded: verified completed outcome. No real execution occurred.",
      "verified_complete",
      "completed"
    );
  }

  function continueEditing() {
    recordAction(
      "Returned fictional work reopened for editing in this preview session.",
      "in_progress",
      "in-progress"
    );
  }

  function resetScenario() {
    setStatus("assigned");
    setDraft("");
    setInternalNote("");
    setNotice("Fictional preview reset to Assigned Work.");
    setError("");
    setLastActionAt(new Date());
    setActiveTab("assigned");
  }

  async function signOut() {
    const supabase = getSupabase();
    if (supabase) await supabase.auth.signOut();
    window.location.replace("/admin/login");
  }

  if (!workspace) {
    return (
      <main className={styles.page}>
        <section className={styles.gateCard}>
          <div className={styles.kicker}>HIISSA STAFF WORKSPACE · STAGING</div>
          <h1>Workspace not found</h1>
          <p>
            This department is not registered as an approved hibernated Staff Workspace.
          </p>
          <Link className={styles.secondaryButton} href="/admin/control-room?view=staff">
            ← Back to Staff & Workspaces
          </Link>
        </section>
      </main>
    );
  }

  if (authState === "checking") {
    return (
      <main className={styles.page}>
        <section className={styles.gateCard}>
          <div className={styles.kicker}>HIISSA STAFF WORKSPACE · STAGING</div>
          <h1>Checking Founder Preview access…</h1>
          <p>
            HIISSA is verifying that this hibernated workspace is being opened by an authorised Admin account.
          </p>
        </section>
      </main>
    );
  }

  if (authState === "signedout") {
    return (
      <main className={styles.page}>
        <section className={styles.gateCard}>
          <div className={styles.kicker}>HIISSA STAFF WORKSPACE · HIBERNATED</div>
          <h1>Founder sign-in required</h1>
          <p>
            This workspace is built for Staging review but remains hibernated. Ordinary staff access is not activated.
          </p>
          <div className={styles.actions}>
            <Link className={styles.primaryButton} href="/admin/login">
              Founder Admin sign in
            </Link>
            <Link className={styles.secondaryButton} href="/">
              Back to HIISSA
            </Link>
          </div>
        </section>
      </main>
    );
  }

  if (authState === "blocked" || authState === "unavailable") {
    return (
      <main className={styles.page}>
        <section className={styles.gateCard}>
          <div className={styles.kicker}>HIISSA STAFF WORKSPACE · HIBERNATED</div>
          <h1>Hibernated workspace access unavailable</h1>
          <p>
            {authState === "blocked"
              ? "This signed-in account does not have authorised Founder/Admin access to the hibernated Staging workspace."
              : "Admin authentication is not available in this environment."}
          </p>
          <Link className={styles.secondaryButton} href="/admin/login">
            Return to Admin sign in
          </Link>
        </section>
      </main>
    );
  }

  const lastAction = formatHiissaGlobalRecordTime(lastActionAt, {
    locale: hiissaResolvedLocale(),
    timeZone: hiissaResolvedTimeZone(),
  });

  const tabForStatus = STATUS_TO_TAB[status] || "assigned";
  const roleIdentity = `Founder Preview as ${workspace.label}`;
  const unsavedChanges = Boolean(
    (draft.trim() || internalNote.trim()) && status === "in_progress"
  );

  const closeItems = [
    {
      label: "Current fictional work state",
      value: statusLabel(status),
      detail:
        "This state exists only in the current Founder Preview browser session.",
      tone: status === "submitted_for_processing" ? "attention" : "good",
    },
    {
      label: "Last preview activity",
      value: lastAction,
      detail:
        "Displayed using the Founder's current locale/timezone while preserving the underlying instant.",
    },
    {
      label: "Activation state",
      value: "HIBERNATED · NOT ACTIVATED",
      detail:
        "No ordinary staff access, real employee record, external execution or Production effect is enabled.",
      tone: "good",
    },
  ];

  return (
    <main className={styles.page}>
      <section className={styles.workspace}>
        <header className={styles.hero}>
          <div>
            <div className={styles.kicker}>HIISSA STAFF WORKSPACE</div>
            <h1>{workspace.label}</h1>
            <p>
              Complete fictional Staging interface for Founder review. The workspace is built under the shared Staff Workspace Shell and remains hibernated until separate activation approval.
            </p>
          </div>
          <div className={styles.heroPills}>
            <StatusPill tone="hibernated">STAGING · HIBERNATED</StatusPill>
            <StatusPill>FOUNDER PREVIEW ONLY</StatusPill>
          </div>
        </header>

        <div className={styles.topActions}>
          <Link
            className={styles.secondaryButton}
            href="/admin/control-room?view=staff"
          >
            ← Back to Staff & Workspaces
          </Link>
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={() => setCheckInOpen(true)}
          >
            Gentle check-in preview
          </button>
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={() => setWorkdayCloseOpen(true)}
          >
            Finish for now
          </button>
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={() => window.location.reload()}
          >
            Refresh
          </button>
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={signOut}
          >
            Secure sign out
          </button>
        </div>

        <section className={styles.identityGrid} aria-label="Workspace identity and access boundary">
          <InfoCard
            label="Identity mode"
            value={roleIdentity}
            detail="Founder identity is preserved. This does not impersonate a real employee."
          />
          <InfoCard
            label="Authorised role"
            value={workspace.roleLabel}
            detail="Role-specific tools remain bounded to the approved department purpose."
          />
          <InfoCard
            label="Environment"
            value="Staging only"
            detail="No Production route or Production authority is activated."
          />
          <InfoCard
            label="Activation boundary"
            value="Built · Hibernated"
            detail="Ordinary staff access and real operational effects remain disabled."
          />
        </section>

        <section className={styles.hibernationNotice}>
          <div>
            <span className={styles.kicker}>BUILD COMPLETE THEN HIBERNATE</span>
            <strong>This interface is built so HIISSA is ready before activation.</strong>
          </div>
          <p>
            Hibernation means the workspace can be inspected and tested by the Founder in Staging, while real staff access, real data and final external/material actions stay switched off.
          </p>
        </section>

        <section className={styles.roleContract}>
          <div className={styles.rolePrinciple}>
            <span className={styles.kicker}>ROLE PRINCIPLE</span>
            <h2>{workspace.principle}</h2>
          </div>

          <div className={styles.contractGrid}>
            <article>
              <h3>Authorised work</h3>
              <ul>
                {workspace.authorisedWork.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
            <article className={styles.protectedCard}>
              <h3>Protected boundaries</h3>
              <ul>
                {workspace.protectedBoundaries.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          </div>

          <div className={styles.operatingModel}>
            <span className={styles.kicker}>ROLE-SPECIFIC OPERATING MODEL</span>
            <div>
              {workspace.operatingModel.map((item, index) => (
                <span key={item}>
                  {item}
                  {index < workspace.operatingModel.length - 1 ? " →" : ""}
                </span>
              ))}
            </div>
          </div>
        </section>

        {calmStart ? (
          <div className={styles.calmStartNotice}>
            <strong>Calmer start active for this preview.</strong>
            <span>
              HIISSA has reduced visual pressure without changing responsibilities, permissions or work priority.
            </span>
          </div>
        ) : null}

        <nav className={styles.tabs} aria-label={`${workspace.label} workspace sections`}>
          {TABS.map(([id, label]) => (
            <button
              type="button"
              key={id}
              className={activeTab === id ? styles.tabActive : styles.tab}
              onClick={() => setActiveTab(id)}
              aria-pressed={activeTab === id}
            >
              {label}
              {tabForStatus === id ? <span className={styles.currentDot} aria-label="current work state" /> : null}
            </button>
          ))}
        </nav>

        {notice ? <div className={styles.notice} role="status">{notice}</div> : null}
        {error ? <div className={styles.error} role="alert">{error}</div> : null}

        <section className={styles.tabPanel}>
          {activeTab === "assigned" ? (
            <div className={styles.workLayout}>
              <article className={styles.workCard}>
                <div className={styles.workCardTop}>
                  <div>
                    <span className={styles.kicker}>FICTIONAL STAGING WORK ITEM</span>
                    <h2>{workspace.fictionalTask.title}</h2>
                  </div>
                  <StatusPill>{status === "assigned" ? "ASSIGNED" : statusLabel(status)}</StatusPill>
                </div>
                <div className={styles.workMeta}>
                  <span>{workspace.fictionalTask.code}</span>
                  <span>{workspace.fictionalTask.category}</span>
                  <span>Priority: {workspace.fictionalTask.priority}</span>
                </div>
                <p>{workspace.fictionalTask.summary}</p>
                <div className={styles.timestamp}>
                  <strong>Preview received</strong>
                  <span>{lastAction}</span>
                </div>
                <button
                  type="button"
                  className={styles.primaryButton}
                  onClick={startWork}
                >
                  Start work
                </button>
              </article>

              <aside className={styles.boundaryCard}>
                <strong>No real-world effect</strong>
                <p>
                  This fictional task does not identify a real person, alter a real account, move money, publish content, access private conversations or affect Production.
                </p>
              </aside>
            </div>
          ) : null}

          {activeTab === "in-progress" ? (
            <div className={styles.editorCard}>
              <span className={styles.kicker}>WORK IN PROGRESS · SESSION PREVIEW</span>
              <h2>{workspace.fictionalTask.title}</h2>
              <p>{workspace.fictionalTask.draftPrompt}</p>

              <label>
                Working draft
                <textarea
                  rows={7}
                  value={draft}
                  onChange={(event) => {
                    setDraft(event.target.value.slice(0, 6000));
                    setError("");
                  }}
                  placeholder="Write a fictional, role-appropriate working draft…"
                />
              </label>

              <label>
                Internal role note
                <textarea
                  rows={4}
                  value={internalNote}
                  onChange={(event) =>
                    setInternalNote(event.target.value.slice(0, 3000))
                  }
                  placeholder="Optional internal note for this fictional preview…"
                />
              </label>

              <div className={styles.editorFooter}>
                <span>
                  Session only · not persisted · no external effect
                </span>
                <button
                  type="button"
                  className={styles.primaryButton}
                  onClick={saveDraft}
                >
                  Save draft
                </button>
              </div>
            </div>
          ) : null}

          {activeTab === "drafts" ? (
            status === "saved_draft" || draft ? (
              <article className={styles.workCard}>
                <span className={styles.kicker}>SAVED DRAFT · SESSION PREVIEW</span>
                <h2>{workspace.fictionalTask.title}</h2>
                <p className={styles.draftPreview}>
                  {draft || "No fictional draft text has been entered yet."}
                </p>
                {internalNote ? (
                  <div className={styles.internalNote}>
                    <strong>Internal note</strong>
                    <span>{internalNote}</span>
                  </div>
                ) : null}
                <div className={styles.actions}>
                  <button
                    type="button"
                    className={styles.secondaryButton}
                    onClick={() => {
                      setStatus("in_progress");
                      setActiveTab("in-progress");
                    }}
                  >
                    Continue editing
                  </button>
                  <button
                    type="button"
                    className={styles.primaryButton}
                    onClick={submitForProcessing}
                  >
                    {UNIVERSAL_FOUNDER_SUBMISSION_GATE.staffSubmitLabel}
                  </button>
                </div>
              </article>
            ) : (
              <EmptyState
                title="No saved fictional draft yet."
                detail="Start the assigned work, add a draft and save it to inspect this shared shell state."
              />
            )
          ) : null}

          {activeTab === "submitted" ? (
            <article className={styles.gatePanel}>
              <span className={styles.kicker}>UNIVERSAL FOUNDER SUBMISSION GATE</span>
              <h2>
                {status === "submitted_for_processing"
                  ? UNIVERSAL_FOUNDER_SUBMISSION_GATE.staffSubmittedConfirmation
                  : "Nothing is currently submitted in this preview."}
              </h2>
              <p>{UNIVERSAL_FOUNDER_SUBMISSION_GATE.rule}</p>

              <div className={styles.gateFlow}>
                <span>Staff preparation</span>
                <span>→</span>
                <span>Submit for processing</span>
                <span>→</span>
                <span>Founder Command / Approval Inbox</span>
                <span>→</span>
                <span>Approve / Return / Reject</span>
                <span>→</span>
                <span>Controlled execution + verification</span>
              </div>

              <div className={styles.previewScenario}>
                <strong>Founder Preview scenario controls</strong>
                <p>
                  These controls let you inspect the returned/completed branches. They are not staff permissions and do not create Founder decisions.
                </p>
                <div className={styles.actions}>
                  <button
                    type="button"
                    className={styles.secondaryButton}
                    onClick={previewReturnedBranch}
                  >
                    Preview returned outcome
                  </button>
                  <button
                    type="button"
                    className={styles.secondaryButton}
                    onClick={previewCompletedBranch}
                  >
                    Preview verified completed outcome
                  </button>
                  <button
                    type="button"
                    className={styles.textButton}
                    onClick={resetScenario}
                  >
                    Reset fictional scenario
                  </button>
                </div>
              </div>
            </article>
          ) : null}

          {activeTab === "returned" ? (
            status === "returned_for_changes" ? (
              <article className={styles.workCard}>
                <span className={styles.kicker}>RETURNED FOR CHANGES · FOUNDER PREVIEW BRANCH</span>
                <h2>{workspace.fictionalTask.title}</h2>
                <div className={styles.returnReason}>
                  <strong>Fictional Founder return note</strong>
                  <p>
                    Please make the evidence, role boundary and verification step more explicit before resubmitting.
                  </p>
                </div>
                <button
                  type="button"
                  className={styles.primaryButton}
                  onClick={continueEditing}
                >
                  Continue editing
                </button>
              </article>
            ) : (
              <EmptyState
                title="No returned fictional work in the current scenario."
                detail="Use the Founder Preview scenario control under Submitted for Processing to inspect this branch without granting staff Founder authority."
              />
            )
          ) : null}

          {activeTab === "completed" ? (
            status === "verified_complete" ? (
              <article className={styles.completedCard}>
                <span className={styles.kicker}>VERIFIED COMPLETED OUTCOME · PREVIEW BRANCH</span>
                <h2>{workspace.fictionalTask.title}</h2>
                <p>
                  This branch demonstrates how a verified completion would appear after the Founder gate and controlled execution. No real execution occurred in this hibernated preview.
                </p>
                <div className={styles.completionGrid}>
                  <InfoCard
                    label="Outcome"
                    value="VERIFIED COMPLETE · FICTIONAL"
                    detail="Preview state only."
                  />
                  <InfoCard
                    label="External effect"
                    value="NONE"
                    detail="No real action was executed."
                  />
                  <InfoCard
                    label="Production effect"
                    value="NONE"
                    detail="Production remains untouched."
                  />
                </div>
              </article>
            ) : (
              <EmptyState
                title="No verified completed fictional outcome in the current scenario."
                detail="Completion may only be claimed after the appropriate Founder gate and verification. Use the Founder Preview scenario control to inspect the completed-state interface."
              />
            )
          ) : null}

          {activeTab === "notifications" ? (
            <div className={styles.notificationsStack}>
              <article className={styles.notificationCard}>
                <span className={styles.kicker}>ROLE-RELEVANT NOTIFICATION</span>
                <h2>{workspace.label}</h2>
                <p>{workspace.roleNotification}</p>
                <small>Fictional Staging notification · no external delivery.</small>
              </article>

              <PrivateAppreciation
                mode="recipient-empty"
                isFounderPreview
              />
            </div>
          ) : null}
        </section>

        <section className={styles.activationFooter}>
          <div>
            <span className={styles.kicker}>HIBERNATION BOUNDARY</span>
            <strong>Built for review. Not activated for ordinary staff.</strong>
          </div>
          <p>
            Real employee onboarding, real role assignment, persistent department work records, live notifications, external execution and Production release remain separate Founder-controlled gates.
          </p>
        </section>
      </section>

      <GentleCheckIn
        open={checkInOpen}
        displayName="FATI BANCE"
        roleLabel={`FOUNDER PREVIEW · ${workspace.label.toUpperCase()}`}
        previewOnly
        daypart={currentDaypart()}
        privacyText="This Founder Preview selection is not staff data and is not used as a performance score or manager signal."
        onClose={() => setCheckInOpen(false)}
        onCalmStart={() => setCalmStart(true)}
      />

      <WorkdayClose
        open={workdayCloseOpen}
        identity={roleIdentity}
        heading="Before you finish this Founder Preview…"
        intro="HIISSA can summarise the fictional browser-session state without pretending anything has been persisted or executed."
        items={closeItems}
        caution={
          unsavedChanges
            ? "There is text in the Work in Progress editor that has not been saved into the preview's Saved Draft state."
            : ""
        }
        sourceNote="Hibernated Founder Preview · browser session only · no Staging database write · no Production effect."
        actions={[
          {
            label: "Return to current work",
            primary: true,
            onClick: () => {
              setWorkdayCloseOpen(false);
              setActiveTab(STATUS_TO_TAB[status] || "assigned");
            },
          },
        ]}
        onClose={() => setWorkdayCloseOpen(false)}
      />
    </main>
  );
}
