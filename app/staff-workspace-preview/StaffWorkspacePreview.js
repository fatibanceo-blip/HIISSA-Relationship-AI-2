"use client";

import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { useEffect, useMemo, useState } from "react";
import {
  STAFF_WORKSPACE_SHELL_STANDARD,
  UNIVERSAL_FOUNDER_SUBMISSION_GATE,
} from "../../lib/experience-registry.js";
import {
  formatHiissaFullRecordTime,
  formatHiissaRecordTime,
} from "../../lib/hiissa-record-time.js";
import GentleCheckIn from "../../components/people-experience/GentleCheckIn.js";
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

function formatDateTime(value) {
  return formatHiissaRecordTime(value);
}

function statusText(value) {
  return String(value || "unknown").replaceAll("_", " ").toUpperCase();
}

function localDateString(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function suggestedTab(status) {
  if (status === "in_progress") return "in-progress";
  if (status === "saved_draft") return "drafts";
  if (status === "submitted_for_processing") return "submitted";
  if (status === "returned_for_changes") return "returned";
  if (
    status === "approved_pending_execution" ||
    status === "executing"
  ) {
    return "submitted";
  }
  if (status === "verified_complete") return "completed";
  return "assigned";
}

export default function StaffWorkspacePreview() {
  const workspace = useMemo(
    () =>
      STAFF_WORKSPACE_SHELL_STANDARD.workspaces.find(
        (item) => item.id === "customer_support"
      ),
    []
  );

  const [authState, setAuthState] = useState("checking");
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [actor, setActor] = useState(null);
  const [item, setItem] = useState(null);
  const [activeTab, setActiveTab] = useState("assigned");
  const [draft, setDraft] = useState("");
  const [internalNote, setInternalNote] = useState("");
  const [welcome, setWelcome] = useState(null);
  const [welcomeVisible, setWelcomeVisible] = useState(false);
  const [checkInVisible, setCheckInVisible] = useState(false);
  const [calmStart, setCalmStart] = useState(false);

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) {
      setAuthState("unavailable");
      setLoading(false);
      return;
    }

    let active = true;

    supabase.auth
      .getSession()
      .then(({ data, error: sessionError }) => {
        if (!active) return;
        if (sessionError) {
          setAuthState("unavailable");
          setLoading(false);
          return;
        }

        const nextSession = data.session || null;
        setSession(nextSession);
        setAuthState(nextSession ? "ready" : "signedout");

        if (!nextSession) setLoading(false);
      })
      .catch(() => {
        if (!active) return;
        setAuthState("unavailable");
        setLoading(false);
      });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, nextSession) => {
        if (!active) return;
        setSession(nextSession || null);
        setAuthState(nextSession ? "ready" : "signedout");
      }
    );

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!session?.access_token) return;
    loadWorkspace(session.access_token, true, true);
  }, [session?.access_token]);

  async function loadWorkspace(
    accessToken = session?.access_token,
    chooseTab = false,
    includeWelcome = false
  ) {
    if (!accessToken) return;

    setLoading(true);
    setError("");

    try {
      let endpoint = "/api/staff-workspace";

      if (includeWelcome) {
        const now = new Date();
        const params = new URLSearchParams({
          welcome: "1",
          localDate: localDateString(now),
          localHour: String(now.getHours()),
          timeZone:
            Intl.DateTimeFormat().resolvedOptions().timeZone || "local-device",
        });
        endpoint += `?${params.toString()}`;
      }

      const response = await fetch(endpoint, {
        method: "GET",
        cache: "no-store",
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.item) {
        setError(
          data?.status === "CUSTOMER_SUPPORT_ROLE_REQUIRED"
            ? "This account is not authorised for the Customer Support workspace. Staff need an active Customer Support role. The Founder should open this workspace from the Founder Control Room so HIISSA can verify Founder Preview access."
            : "The protected Staging staff record could not be loaded."
        );
        setLoading(false);
        return;
      }

      setActor(data.actor);
      if (includeWelcome && data.welcome?.status === "READY") {
        setWelcome(data.welcome);
        const showFullWelcome = Boolean(data.welcome.showFullWelcome);
        setWelcomeVisible(showFullWelcome);
        setCheckInVisible(!showFullWelcome && Boolean(data.welcome.checkIn?.due));
      }
      setItem(data.item);
      setDraft(data.item.draftResponse || "");
      setInternalNote(data.item.internalNote || "");
      if (chooseTab) setActiveTab(suggestedTab(data.item.status));
      setLoading(false);
    } catch {
      setError("The protected Staging staff record could not be loaded.");
      setLoading(false);
    }
  }

  async function perform(action, payload = {}) {
    if (!session?.access_token || !item?.id) return null;

    setBusy(action);
    setError("");
    setNotice("");

    try {
      const response = await fetch("/api/staff-workspace", {
        method: "POST",
        cache: "no-store",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action,
          itemId: item.id,
          ...payload,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.item) {
        const message =
          data?.status === "STAFF_DRAFT_REQUIRED"
            ? "Write and save a draft response before submitting it for processing."
            : data?.status === "STAFF_WORK_ITEM_LOCKED"
              ? "This work item is locked at its current processing stage."
              : "The Staging work item could not be updated.";
        setError(message);
        setBusy("");
        return null;
      }

      setActor(data.actor || actor);
      setItem(data.item);
      setDraft(data.item.draftResponse || "");
      setInternalNote(data.item.internalNote || "");

      if (action === "start") {
        setNotice("Work started and persisted in Staging.");
        setActiveTab("in-progress");
      } else if (action === "save") {
        setNotice("Draft saved in the Staging database.");
        setActiveTab("drafts");
      } else if (action === "submit") {
        setNotice(UNIVERSAL_FOUNDER_SUBMISSION_GATE.staffSubmittedConfirmation);
        setActiveTab("submitted");
      }

      setBusy("");
      return data.item;
    } catch {
      setError("The Staging work item could not be updated.");
      setBusy("");
      return null;
    }
  }

  async function signOut() {
    const supabase = getSupabase();
    if (!supabase) return;
    await supabase.auth.signOut();
    setSession(null);
    setAuthState("signedout");
    setItem(null);
    setActor(null);
    setWelcome(null);
    setWelcomeVisible(false);
    setCheckInVisible(false);
    setCalmStart(false);
    setLoading(false);
  }

  if (authState === "checking" || loading) {
    return (
      <main className={styles.page}>
        <section className={styles.signedOutCard}>
          <div className={styles.kicker}>HIISSA STAFF WORKSPACE · STAGING</div>
          <h1>Checking protected workspace…</h1>
          <p>
            HIISSA is verifying the signed-in Staging identity and authorised role.
          </p>
        </section>
      </main>
    );
  }

  if (authState !== "ready" || !session) {
    return (
      <main className={styles.page}>
        <section className={styles.signedOutCard}>
          <div className={styles.kicker}>HIISSA STAFF WORKSPACE · STAGING</div>
          <h1>Sign in before opening the working workspace</h1>
          <p>
            The working version is no longer an anonymous screen. Founder testing
            uses the authorised Admin account in Preview as Role mode. A future
            staff test account must have an active Customer Support role assignment.
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

  if (error && !item) {
    return (
      <main className={styles.page}>
        <section className={styles.signedOutCard}>
          <div className={styles.kicker}>HIISSA STAFF WORKSPACE · STAGING</div>
          <h1>Workspace access is protected</h1>
          <p>{error}</p>
          <div className={styles.actions}>
            <button
              type="button"
              className={styles.secondaryButton}
              onClick={() => loadWorkspace(session.access_token, true, true)}
            >
              Retry
            </button>
            <button
              type="button"
              className={styles.secondaryButton}
              onClick={signOut}
            >
              Sign out
            </button>
          </div>
        </section>
      </main>
    );
  }

  if (!item) return null;

  return (
    <main className={styles.page}>
      <StaffWelcomeMoment
        welcome={welcome}
        visible={welcomeVisible}
        onDismiss={() => {
          setWelcomeVisible(false);
          if (welcome?.checkIn?.due) setCheckInVisible(true);
        }}
      />
      <GentleCheckIn
        open={checkInVisible}
        displayName={welcome?.displayName || actor?.displayIdentity || ""}
        roleLabel={welcome?.roleLabel || workspace?.label || "CUSTOMER SUPPORT"}
        choices={welcome?.checkIn?.choices}
        privacyText={welcome?.checkIn?.privacy}
        previewOnly={Boolean(welcome?.checkIn?.previewOnly)}
        onClose={() => setCheckInVisible(false)}
        onCalmStart={() => {
          setActiveTab("assigned");
          setCalmStart(true);
          setCheckInVisible(false);
        }}
      />
      <section className={styles.shell}>
        {welcome && !welcomeVisible && welcome.mode === "QUIET_RETURN" ? (
          <div className={styles.staffQuietWelcome} role="status">
            <span>{welcome.greeting},</span>
            <strong>{welcome.displayName}</strong>
            <span className={styles.staffQuietRole}>{welcome.roleLabel}</span>
          </div>
        ) : null}
        <header className={styles.header}>
          <div>
            <div className={styles.kicker}>HIISSA STAFF WORKSPACE</div>
            <h1>Customer Support</h1>
            <p className={styles.subtitle}>
              Working Staging workflow with persistent records and the mandatory
              Founder submission gate. All current case data remains fictional.
            </p>
          </div>

          <div className={styles.headerActions}>
            <StatusPill>STAGING · WORKING TEST</StatusPill>
            {actor?.mode === "FOUNDER_PREVIEW" ? (
              <Link className={styles.secondaryButton} href="/admin/control-room?view=staff">
                ← Back to Staff & Workspaces
              </Link>
            ) : null}
            <button
              type="button"
              className={styles.secondaryButton}
              onClick={() => loadWorkspace(session.access_token, true, false)}
              disabled={Boolean(busy)}
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
        </header>

        <section className={styles.identityStrip}>
          <div>
            <span>IDENTITY MODE</span>
            <strong>{actor?.displayIdentity || "Protected Staging identity"}</strong>
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
            <strong>{actor?.accessBoundary || "Customer Support only"}</strong>
          </div>
        </section>

        <section className={styles.safetyNotice}>
          <strong>Working workflow. External execution is still disabled.</strong>
          <p>
            Start, draft, save, submit, Founder Return/Approve/Reject and audit
            states now persist in the Staging database. No customer email/text is
            sent, no account is altered, no money moves and Production remains
            untouched.
          </p>
        </section>

        {calmStart ? (
          <section className={styles.calmStartNotice} role="status">
            <div>
              <div className={styles.kicker}>CALM START</div>
              <strong>Starting with Assigned Work only.</strong>
              <p>
                Nothing has been removed and your workload, priority and performance
                records are unchanged. All normal workspace tabs remain available.
              </p>
            </div>
            <button
              type="button"
              className={styles.secondaryButton}
              onClick={() => setCalmStart(false)}
            >
              Show normal workspace
            </button>
          </section>
        ) : null}

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
                  item.status === "submitted_for_processing"
                    ? styles.successNotice
                    : styles.inlineNotice
                }
                role="status"
              >
                <strong>{notice}</strong>
                {item.status === "submitted_for_processing" ? (
                  <p>
                    One canonical approval request now exists in the Founder
                    Command / Approval Inbox. Nothing has been sent externally.
                  </p>
                ) : null}
              </div>
            ) : null}

            {error ? (
              <div className={styles.errorNotice} role="alert">
                <strong>{error}</strong>
              </div>
            ) : null}

            {activeTab === "assigned" ? (
              <AssignedWork
                item={item}
                busy={busy}
                onStart={() => perform("start")}
                onOpen={() => setActiveTab("in-progress")}
              />
            ) : null}

            {activeTab === "in-progress" ? (
              <WorkEditor
                item={item}
                draft={draft}
                internalNote={internalNote}
                setDraft={setDraft}
                setInternalNote={setInternalNote}
                busy={busy}
                onSave={() =>
                  perform("save", {
                    draftResponse: draft,
                    internalNote,
                  })
                }
                onSubmit={async () => {
                  const saved = await perform("save", {
                    draftResponse: draft,
                    internalNote,
                  });
                  if (saved) await perform("submit");
                }}
              />
            ) : null}

            {activeTab === "drafts" ? (
              <SavedDraft
                item={item}
                draft={draft}
                busy={busy}
                onContinue={() => setActiveTab("in-progress")}
                onSubmit={() => perform("submit")}
              />
            ) : null}

            {activeTab === "submitted" ? (
              <SubmittedWork item={item} draft={draft} />
            ) : null}

            {activeTab === "returned" ? (
              <ReturnedWork
                item={item}
                onContinue={() => setActiveTab("in-progress")}
              />
            ) : null}

            {activeTab === "completed" ? <CompletedWork item={item} /> : null}

            {activeTab === "notifications" ? <Notifications item={item} /> : null}
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
            <strong>Persistent Staging state</strong>
            <span>
              Status: {statusText(item.status)} · Version {item.version} · last
              updated <span title={formatHiissaFullRecordTime(item.updatedAt)}>{formatDateTime(item.updatedAt)}</span>
            </span>
          </div>
        </footer>
      </section>
    </main>
  );
}

function StaffWelcomeMoment({ welcome, visible, onDismiss }) {
  if (!welcome || !visible) return null;

  return (
    <div
      className={styles.staffWelcomeOverlay}
      role="dialog"
      aria-modal="true"
      aria-label="HIISSA staff welcome"
    >
      <section className={styles.staffWelcomeCard}>
        <div className={styles.staffWelcomeAccent} aria-hidden="true" />
        <div className={styles.staffWelcomeKicker}>HIISSA · PEOPLE EXPERIENCE</div>
        {welcome.isFounderPreview ? (
          <div className={styles.staffPreviewNotice}>
            Founder Preview — staff identity is not being impersonated
          </div>
        ) : null}
        <div className={styles.staffWelcomeGreeting}>{welcome.greeting}</div>
        <div className={styles.staffWelcomeName}>{welcome.displayName}</div>
        <div className={styles.staffWelcomeRole}>{welcome.roleLabel}</div>
        <p className={styles.staffWelcomeMessage}>{welcome.motivation}</p>
        {welcome.mode === "WELCOME_BACK" ? (
          <p className={styles.staffWelcomeReturn}>
            Good to have you back. Your authorised workspace is ready where you left it.
          </p>
        ) : null}
        <button
          type="button"
          className={styles.staffWelcomeEnter}
          onClick={onDismiss}
        >
          Enter workspace →
        </button>
        <button
          type="button"
          className={styles.staffWelcomeSkip}
          onClick={onDismiss}
        >
          Skip welcome
        </button>
      </section>
    </div>
  );
}

function AssignedWork({ item, busy, onStart, onOpen }) {
  return (
    <>
      <section className={styles.pageHeading}>
        <div>
          <div className={styles.kicker}>ASSIGNED WORK</div>
          <h2>Work assigned to your authorised role</h2>
          <p>
            This record is persistent Staging data, but the case itself is
            deliberately fictional.
          </p>
        </div>
        <StatusPill>1 WORKING TEST ITEM</StatusPill>
      </section>

      <article className={styles.caseCard}>
        <div className={styles.caseTop}>
          <div>
            <span className={styles.caseId}>{item.caseCode}</span>
            <h3>{item.title}</h3>
          </div>
          <StatusPill>{statusText(item.status)}</StatusPill>
        </div>

        <p>{item.summary}</p>

        <div className={styles.metaGrid}>
          <span>Category: {item.category}</span>
          <span>Priority: {item.priority}</span>
          <span>Received: <span title={formatHiissaFullRecordTime(item.receivedAt)}>{formatDateTime(item.receivedAt)}</span></span>
          <span>Response due: <span title={formatHiissaFullRecordTime(item.responseDueAt)}>{formatDateTime(item.responseDueAt)}</span></span>
        </div>

        <div className={styles.actions}>
          {item.status === "assigned" ? (
            <button
              type="button"
              className={styles.primaryButton}
              onClick={onStart}
              disabled={Boolean(busy)}
            >
              {busy === "start" ? "Starting…" : "Start work"}
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
          value={<span title={formatHiissaFullRecordTime(item.receivedAt)}>{formatDateTime(item.receivedAt)}</span>}
          detail="Persisted Staging timestamp."
        />
        <SummaryCard
          label="ACKNOWLEDGED"
          value="TEST RECORD READY"
          detail="No external acknowledgement is sent in this Staging layer."
        />
        <SummaryCard
          label="HUMAN RESPONSE DUE"
          value={<span title={formatHiissaFullRecordTime(item.responseDueAt)}>{formatDateTime(item.responseDueAt)}</span>}
          detail="Persisted response-due target."
        />
        <SummaryCard
          label="CURRENT STATE"
          value={statusText(item.status)}
          detail="Loaded from the canonical staff work record."
        />
      </section>
    </>
  );
}

function WorkEditor({
  item,
  draft,
  internalNote,
  setDraft,
  setInternalNote,
  busy,
  onSave,
  onSubmit,
}) {
  const locked = [
    "submitted_for_processing",
    "approved_pending_execution",
    "executing",
    "verified_complete",
    "rejected",
    "cancelled",
  ].includes(item.status);

  return (
    <>
      <section className={styles.pageHeading}>
        <div>
          <div className={styles.kicker}>WORK IN PROGRESS</div>
          <h2>{item.title}</h2>
          <p>
            Drafts now persist in Staging. Submission still cannot send a customer
            response.
          </p>
        </div>
        <StatusPill>{statusText(item.status)}</StatusPill>
      </section>

      {item.status === "returned_for_changes" && item.founderNote ? (
        <section className={styles.successPanel}>
          <strong>Returned for changes</strong>
          <p>Founder note: {item.founderNote}</p>
        </section>
      ) : null}

      <section className={styles.caseSummary}>
        <strong>Fictional customer summary</strong>
        <p>{item.summary}</p>
        <div className={styles.privacyLine}>
          Minimum necessary fictional context only · unrelated private HIISSA
          conversations are unavailable to this workspace.
        </div>
      </section>

      <label className={styles.field}>
        <span>Draft response</span>
        <textarea
          rows={9}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Write the fictional Customer Support response here…"
          disabled={locked}
        />
      </label>

      <label className={styles.field}>
        <span>Internal support note · not customer-facing</span>
        <textarea
          rows={4}
          value={internalNote}
          onChange={(event) => setInternalNote(event.target.value)}
          placeholder="Optional Staging internal note…"
          disabled={locked}
        />
      </label>

      <section className={styles.submissionGate}>
        <div>
          <div className={styles.kicker}>MANDATORY HUMAN-STAFF GATE</div>
          <strong>Staff cannot perform the final external action.</strong>
          <p>
            Save Draft writes to Staging. Submit for processing creates or reuses
            the one canonical Founder approval record.
          </p>
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={onSave}
            disabled={Boolean(busy) || locked}
          >
            {busy === "save" ? "Saving…" : "Save draft"}
          </button>
          <button
            type="button"
            className={styles.primaryButton}
            onClick={onSubmit}
            disabled={Boolean(busy) || locked || !draft.trim()}
          >
            {busy ? "Processing…" : UNIVERSAL_FOUNDER_SUBMISSION_GATE.staffSubmitLabel}
          </button>
        </div>
      </section>
    </>
  );
}

function SavedDraft({ item, draft, busy, onContinue, onSubmit }) {
  return (
    <>
      <section className={styles.pageHeading}>
        <div>
          <div className={styles.kicker}>SAVED DRAFTS</div>
          <h2>Persisted work before submission</h2>
          <p>Refresh or reopen the Staging workspace and this draft remains.</p>
        </div>
        <StatusPill>{statusText(item.status)}</StatusPill>
      </section>

      {draft ? (
        <article className={styles.caseCard}>
          <span className={styles.caseId}>{item.caseCode}</span>
          <h3>{item.title}</h3>
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
              disabled={Boolean(busy)}
            >
              {busy === "submit"
                ? "Submitting…"
                : UNIVERSAL_FOUNDER_SUBMISSION_GATE.staffSubmitLabel}
            </button>
          </div>
        </article>
      ) : (
        <div className={styles.emptyState}>No persisted draft exists yet.</div>
      )}
    </>
  );
}

function SubmittedWork({ item, draft }) {
  const pending = item.status === "submitted_for_processing";
  const approved = item.status === "approved_pending_execution";

  return (
    <>
      <section className={styles.pageHeading}>
        <div>
          <div className={styles.kicker}>SUBMITTED FOR PROCESSING</div>
          <h2>
            {pending
              ? "Waiting for Founder decision"
              : approved
                ? "Founder approved · execution still disabled"
                : "Submission status"}
          </h2>
          <p>
            Approval is not verified completion and cannot send a customer response
            from this Staging layer.
          </p>
        </div>
        <StatusPill>{statusText(item.status)}</StatusPill>
      </section>

      <section className={styles.successPanel}>
        <strong>
          {pending
            ? UNIVERSAL_FOUNDER_SUBMISSION_GATE.staffSubmittedConfirmation
            : statusText(item.status)}
        </strong>
        <p>
          Approval request: {item.approvalRequestId ? "persisted" : "not present"}.
          External execution: disabled. Production effect: none.
        </p>
      </section>

      <article className={styles.caseCard}>
        <span className={styles.caseId}>{item.caseCode}</span>
        <h3>{item.title}</h3>
        <div className={styles.draftPreview}>{draft || "—"}</div>
        <div className={styles.metaGrid}>
          <span>State: {statusText(item.status)}</span>
          <span>Submitted: <span title={formatHiissaFullRecordTime(item.submittedAt)}>{formatDateTime(item.submittedAt)}</span></span>
          <span>External send: Not performed</span>
          <span>Production effect: None</span>
        </div>
      </article>

      <section className={styles.flowStrip}>
        <span className={styles.flowComplete}>Staff prepared work</span>
        <span className={styles.flowComplete}>Submitted for processing</span>
        <span className={approved ? styles.flowComplete : ""}>
          Founder decision
        </span>
        <span>Controlled execution</span>
        <span>Verify · Record · Report</span>
      </section>
    </>
  );
}

function ReturnedWork({ item, onContinue }) {
  const returned = item.status === "returned_for_changes";

  return (
    <>
      <section className={styles.pageHeading}>
        <div>
          <div className={styles.kicker}>RETURNED WORK</div>
          <h2>Founder-returned items come back with the decision note</h2>
          <p>
            The same canonical work item and approval history are preserved.
          </p>
        </div>
        <StatusPill>{returned ? "RETURNED FOR CHANGES" : "NONE PENDING"}</StatusPill>
      </section>

      {returned ? (
        <article className={styles.caseCard}>
          <span className={styles.caseId}>{item.caseCode}</span>
          <h3>{item.title}</h3>
          <p>
            <strong>Founder note:</strong> {item.founderNote || "No note supplied."}
          </p>
          <div className={styles.metaGrid}>
            <span>Returned: <span title={formatHiissaFullRecordTime(item.returnedAt)}>{formatDateTime(item.returnedAt)}</span></span>
            <span>No external action occurred</span>
          </div>
          <div className={styles.actions}>
            <button
              type="button"
              className={styles.primaryButton}
              onClick={onContinue}
            >
              Continue returned work
            </button>
          </div>
        </article>
      ) : (
        <div className={styles.emptyState}>
          This work item is not currently returned for changes.
        </div>
      )}
    </>
  );
}

function CompletedWork({ item }) {
  const complete = item.status === "verified_complete";

  return (
    <>
      <section className={styles.pageHeading}>
        <div>
          <div className={styles.kicker}>COMPLETED OUTCOMES</div>
          <h2>Only verified execution can appear as complete</h2>
          <p>Founder approval alone never moves work into this section.</p>
        </div>
        <StatusPill>{complete ? "VERIFIED COMPLETE" : "NONE"}</StatusPill>
      </section>

      {complete ? (
        <article className={styles.caseCard}>
          <span className={styles.caseId}>{item.caseCode}</span>
          <h3>{item.title}</h3>
          <p>Verified at <span title={formatHiissaFullRecordTime(item.verifiedCompletedAt)}>{formatDateTime(item.verifiedCompletedAt)}</span></p>
        </article>
      ) : (
        <div className={styles.emptyState}>
          No verified external execution exists in this Staging workflow.
        </div>
      )}
    </>
  );
}

function Notifications({ item }) {
  const notices = [
    {
      title: "Current work state",
      text: `${item.caseCode}: ${statusText(item.status)}.`,
    },
    item.status === "returned_for_changes"
      ? {
          title: "Founder returned work",
          text: item.founderNote || "Changes were requested.",
        }
      : null,
    item.status === "submitted_for_processing"
      ? {
          title: "Founder decision pending",
          text: "The canonical submission is waiting in the Founder Command / Approval Inbox.",
        }
      : null,
    {
      title: "External execution protection",
      text: "Customer sending and Production effects remain disabled.",
    },
  ].filter(Boolean);

  return (
    <>
      <section className={styles.pageHeading}>
        <div>
          <div className={styles.kicker}>STAFF NOTIFICATIONS</div>
          <h2>Role-relevant Staging notices</h2>
          <p>
            Staff do not receive private Founder controls or unrelated operational
            data.
          </p>
        </div>
        <StatusPill>WORKING STAGING</StatusPill>
      </section>

      <div className={styles.notificationList}>
        {notices.map((notice) => (
          <article key={notice.title}>
            <strong>{notice.title}</strong>
            <p>{notice.text}</p>
          </article>
        ))}
      </div>
    </>
  );
}
