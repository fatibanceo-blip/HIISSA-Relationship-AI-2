"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import {
  formatHiissaFullRecordTime,
  formatHiissaRecordTime,
} from "../../../lib/hiissa-record-time.js";
import GentleCheckIn from "../../../components/people-experience/GentleCheckIn.js";
import styles from "./page.module.css";
import {
  CONTROL_ROOM_MODULES,
  CONTROL_ROOM_MODULE_REGISTRY,
  EXPERIENCE_REGISTRY,
  FEATURE_OPERATIONAL_VISIBILITY_STANDARD,
  ADMIN_STAFF_ACCESS_ONBOARDING_STANDARD,
  ADMIN_STAFF_ONBOARDING_WORKFLOW,
  FOUNDER_ADMIN_AUTHORITY_AND_STAFF_ACTION_GATE,
  FOUNDER_APPROVAL_INBOX_STANDARD,
  FOUNDER_CONTROL_ROOM_STRENGTHENING_PACKAGE,
  STAFF_ACCESS_SUSPENSION_AND_OFFBOARDING_STANDARD,
  STAFF_SECURE_ONBOARDING_EXPERIENCE_STANDARD,
  UNIVERSAL_FOUNDER_SUBMISSION_GATE,
  STAFF_WORKSPACE_SHELL_STANDARD,
  FOUNDER_PROVIDER_SUBSCRIPTION_SPEND_STANDARD,
  HIISSA_PEOPLE_EXPERIENCE_LAYER,
} from "../../../lib/experience-registry.js";

const MODULES = [
  {
    id: CONTROL_ROOM_MODULES.overview,
    label: "Overview",
    short: "Overview",
    purpose: "Authorised aggregate operational picture and Founder attention.",
  },
  {
    id: CONTROL_ROOM_MODULES.usersIdentity,
    label: "Users & Identity",
    short: "Users & Identity",
    purpose: "Account, identity and user administration under privacy and permission rules.",
  },
  {
    id: CONTROL_ROOM_MODULES.subscriptionsAccess,
    label: "Subscriptions & Access",
    short: "Subscriptions",
    purpose: "Plans, entitlements, access and safe subscription administration.",
  },
  {
    id: CONTROL_ROOM_MODULES.feedbackRecommendations,
    label: "Feedback & Recommendations",
    short: "Feedback",
    purpose: "Private feedback, recommendations, public-review permission and improvement signals.",
  },
  {
    id: CONTROL_ROOM_MODULES.safetyPrivacyModeration,
    label: "Safety, Privacy & Moderation",
    short: "Safety & Privacy",
    purpose: "Safeguarding, privacy, consent, moderation and referral-integrity operations.",
  },
  {
    id: CONTROL_ROOM_MODULES.failuresReliability,
    label: "Failures & Reliability",
    short: "Failures",
    purpose: "Failures, impact, bounded recovery, verification and human action.",
  },
  {
    id: CONTROL_ROOM_MODULES.authSync,
    label: "Authentication & Sync Health",
    short: "Auth & Sync",
    purpose: "Authentication, continuity, Save & Sync and migration health without exposing secrets.",
  },
  {
    id: CONTROL_ROOM_MODULES.aiProduct,
    label: "HIISSA AI & Product Intelligence",
    short: "AI & Product",
    purpose: "Quality, language, experience and product intelligence without vulnerability-as-engagement.",
  },
  {
    id: CONTROL_ROOM_MODULES.systemOperations,
    label: "System & Operations",
    short: "System & Ops",
    purpose: "Environments, releases, providers, configuration health, jobs and readiness.",
  },
  {
    id: CONTROL_ROOM_MODULES.adminSecurityAudit,
    label: "Admin Security & Audit",
    short: "Security & Audit",
    purpose: "Roles, permissions, sensitive actions, step-up and attributable audit.",
  },
];

const FEATURE_KEYS = ["youngHiissa", "hiissaRest", "hiissaAlongside"];

const FOUNDER_WORKSPACE_ROUTES = Object.freeze({
  customer_support: Object.freeze({
    href: "/staff-workspace-preview?founderReturn=staff",
    status: "WORKING STAGING",
    note: "Persistent Customer Support workflow and Founder submission gate are connected in Staging.",
  }),
});

const adminDataClient =
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
    ? createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
      )
    : null;

function statusLabel(value) {
  return String(value || "unknown").replaceAll("-", " ").toUpperCase();
}

export default function FounderControlRoomPreview({ authenticated = false, onSignOut = null, environmentLabel = "ISOLATED PREVIEW", environmentNote = "Structure and Registry wiring only — no fabricated live metrics" } = {}) {
  const moduleList = MODULES.filter(
    (module) => module.id !== CONTROL_ROOM_MODULES.overview
  );
  const [primaryView, setPrimaryView] = useState("overview");
  const [activeId, setActiveId] = useState(
    moduleList[0]?.id || CONTROL_ROOM_MODULES.usersIdentity
  );
  const [menuOpen, setMenuOpen] = useState(false);
  const [toolPanel, setToolPanel] = useState("");
  const [navigationHistory, setNavigationHistory] = useState([]);
  const [calmStart, setCalmStart] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const requestedView = new URLSearchParams(window.location.search).get("view");
    if (["overview", "modules", "staff", "approvals"].includes(requestedView)) {
      setPrimaryView(requestedView);
    }
  }, []);

  const activeModule = useMemo(
    () => MODULES.find((item) => item.id === activeId) || moduleList[0],
    [activeId]
  );

  const registeredFeatures = FEATURE_KEYS.map((key) => EXPERIENCE_REGISTRY[key]).filter(Boolean);

  function rememberCurrentView() {
    setNavigationHistory((history) => [
      ...history.slice(-11),
      { view: primaryView, activeId },
    ]);
  }

  function choosePrimary(view) {
    if (view !== primaryView) rememberCurrentView();
    setPrimaryView(view);
    setMenuOpen(false);
    setToolPanel("");
  }

  function chooseModule(id) {
    if (primaryView !== "modules" || activeId !== id) rememberCurrentView();
    setActiveId(id);
    setPrimaryView("modules");
    setMenuOpen(false);
    setToolPanel("");
  }

  function goBack() {
    setToolPanel("");
    setMenuOpen(false);

    if (navigationHistory.length > 0) {
      const previous = navigationHistory[navigationHistory.length - 1];
      setNavigationHistory((history) => history.slice(0, -1));
      setPrimaryView(previous.view);
      if (previous.activeId) setActiveId(previous.activeId);
      return;
    }

    if (primaryView === "overview") {
      window.location.assign("/admin");
      return;
    }

    setPrimaryView("overview");
  }

  return (
    <main className={styles.page}>
      <section className={styles.shell}>
        <FounderWelcomeMoment
          authenticated={authenticated}
          onCalmStart={() => {
            setPrimaryView("overview");
            setToolPanel("");
            setCalmStart(true);
          }}
        />

        <header className={styles.header}>
          <div className={styles.founderHeaderIdentity}>
            <div className={styles.kicker}>HIISSA — FOUNDER CONTROL ROOM</div>
            <div className={styles.founderHeaderNameRow}>
              <h1>Control Room</h1>
              <div className={styles.founderIdentityMini}>
                <strong>FATI BANCE</strong>
                <span>FOUNDER</span>
              </div>
            </div>
            <div className={styles.environmentRow}>
              <span className={styles.environment}>{environmentLabel}</span>
              <span className={styles.environmentNote}>{environmentNote}</span>
            </div>
          </div>

          <div className={styles.headerActions}>
            <button
              type="button"
              className={toolPanel === "search" ? styles.headerToolActive : styles.headerTool}
              onClick={() => setToolPanel((value) => value === "search" ? "" : "search")}
              aria-expanded={toolPanel === "search"}
            >
              Search
            </button>
            <FounderAlertButton
              authenticated={authenticated}
              active={toolPanel === "alerts"}
              onClick={() => setToolPanel((value) => value === "alerts" ? "" : "alerts")}
            />
            <Link href="/" className={styles.backLink}>← Back to HIISSA</Link>
            <button
              type="button"
              className={styles.signOutPreview}
              disabled={!authenticated || typeof onSignOut !== "function"}
              onClick={authenticated && typeof onSignOut === "function" ? onSignOut : undefined}
              title={authenticated ? "Sign out of this Admin session." : "Sign out will be connected only after the authenticated Control Room shell is approved."}
            >
              Sign out
            </button>
          </div>
        </header>

        <nav className={styles.primaryNav} aria-label="Founder Control Room primary navigation">
          {[
            ["overview", "Overview"],
            ["modules", "Modules"],
            ["staff", "Staff & Workspaces"],
            ["approvals", "Approvals"],
          ].map(([id, label]) => (
            <button
              type="button"
              key={id}
              className={primaryView === id ? styles.primaryNavActive : styles.primaryNavItem}
              onClick={() => choosePrimary(id)}
            >
              {label}
            </button>
          ))}
        </nav>

        {toolPanel === "search" ? (
          <FounderSearchPanel
            onClose={() => setToolPanel("")}
            onChoosePrimary={choosePrimary}
            onChooseModule={chooseModule}
          />
        ) : null}

        {toolPanel === "alerts" ? (
          <FounderAlertsPanel
            authenticated={authenticated}
            onClose={() => setToolPanel("")}
            onOpenApprovals={() => choosePrimary("approvals")}
          />
        ) : null}

        {primaryView === "modules" ? (
          <div className={styles.mobileBar}>
            <button
              type="button"
              className={styles.menuButton}
              onClick={() => setMenuOpen((value) => !value)}
              aria-expanded={menuOpen}
              aria-controls="control-room-nav"
            >
              ☰ Modules
            </button>
            <strong>{activeModule?.short || "Modules"}</strong>
          </div>
        ) : null}

        <div className={primaryView === "modules" ? styles.body : styles.bodyFull}>
          {primaryView === "modules" ? (
            <nav
              id="control-room-nav"
              className={menuOpen ? `${styles.nav} ${styles.navOpen}` : styles.nav}
              aria-label="Founder Control Room modules"
            >
              {moduleList.map((module) => (
                <button
                  type="button"
                  key={module.id}
                  className={activeId === module.id ? styles.navActive : styles.navItem}
                  onClick={() => chooseModule(module.id)}
                >
                  {module.short}
                </button>
              ))}
            </nav>
          ) : null}

          <section className={styles.content}>
            {primaryView === "overview" ? (
              <Overview
                registeredFeatures={registeredFeatures}
                authenticated={authenticated}
                calmStart={calmStart}
                onBack={goBack}
                onOpenAlerts={() => setToolPanel("alerts")}
                onOpenStaff={() => choosePrimary("staff")}
                onOpenApprovals={() => choosePrimary("approvals")}
                onShowFullOverview={() => setCalmStart(false)}
              />
            ) : null}

            {primaryView === "modules" && activeModule ? (
              <ModuleFoundation
                module={activeModule}
                authenticated={authenticated}
                onOverview={() => choosePrimary("overview")}
                onBack={goBack}
              />
            ) : null}

            {primaryView === "staff" ? (
              <>
                <FounderContextBack onBack={goBack} />
                <FounderAccessCentre authenticated={authenticated} />
              </>
            ) : null}

            {primaryView === "approvals" ? (
              <>
                <FounderContextBack onBack={goBack} />
                <WorkingStaffApprovalInbox />
              </>
            ) : null}
          </section>
        </div>
      </section>
    </main>
  );
}

function FounderContextBack({ onBack, fallbackLabel = "Previous" }) {
  return (
    <button
      type="button"
      className={styles.contextBack}
      onClick={onBack}
      aria-label={`Go back to ${fallbackLabel}`}
    >
      ← Back
    </button>
  );
}

function FounderAlertButton({ authenticated, active, onClick }) {
  const [summary, setSummary] = useState({
    loading: Boolean(authenticated),
    attentionCount: 0,
    criticalCount: 0,
    criticalMessage: "",
  });
  const [criticalVisible, setCriticalVisible] = useState(true);
  const [dismissedCriticalKey, setDismissedCriticalKey] = useState("");

  useEffect(() => {
    if (!authenticated || !adminDataClient) {
      setSummary({
        loading: false,
        attentionCount: 0,
        criticalCount: 0,
        criticalMessage: "",
      });
      return;
    }

    let mounted = true;

    async function loadAlertCount() {
      try {
        const {
          data: { session },
        } = await adminDataClient.auth.getSession();

        if (!session?.access_token || !mounted) return;

        const headers = { Authorization: `Bearer ${session.access_token}` };
        const [approvalResponse, securityResponse] = await Promise.all([
          fetch("/api/admin/control-room/staff-approval-inbox", {
            method: "GET",
            cache: "no-store",
            credentials: "same-origin",
            headers,
          }),
          fetch("/api/admin/control-room/security-summary", {
            method: "GET",
            cache: "no-store",
            credentials: "same-origin",
            headers,
          }),
        ]);

        const [approvalData, securityData] = await Promise.all([
          approvalResponse.json().catch(() => null),
          securityResponse.json().catch(() => null),
        ]);

        if (!mounted) return;

        const pendingApprovals =
          approvalResponse.ok && approvalData
            ? Number(approvalData.pendingCount || 0)
            : 0;
        const securityAttention =
          securityResponse.ok && securityData?.status === "NEEDS_ATTENTION"
            ? 1
            : 0;

        const explicitCritical = Number(
          securityData?.criticalCount ||
          approvalData?.criticalCount ||
          0
        );
        const criticalCount = Number.isFinite(explicitCritical)
          ? Math.max(0, explicitCritical)
          : 0;

        const criticalMessage =
          securityData?.criticalMessage ||
          approvalData?.criticalMessage ||
          "";
        const criticalKey =
          criticalCount > 0
            ? `${criticalCount}:${criticalMessage || "verified-critical-signal"}`
            : "";

        setSummary({
          loading: false,
          attentionCount: Math.max(0, pendingApprovals) + securityAttention,
          criticalCount,
          criticalMessage,
        });

        if (criticalCount > 0 && criticalKey !== dismissedCriticalKey) {
          setCriticalVisible(true);
        } else if (criticalCount === 0) {
          setCriticalVisible(false);
          setDismissedCriticalKey("");
        }
      } catch {
        if (!mounted) return;
        setSummary((current) => ({ ...current, loading: false }));
      }
    }

    loadAlertCount();
    const interval = window.setInterval(loadAlertCount, 60000);

    return () => {
      mounted = false;
      window.clearInterval(interval);
    };
  }, [authenticated, dismissedCriticalKey]);

  const badgeCount =
    summary.criticalCount > 0
      ? summary.criticalCount
      : summary.attentionCount;

  return (
    <>
      <button
        type="button"
        className={active ? styles.headerToolActive : styles.headerTool}
        onClick={onClick}
        aria-expanded={active}
      >
        <span>Alerts</span>
        {!summary.loading && badgeCount > 0 ? (
          <span
            className={
              summary.criticalCount > 0
                ? styles.alertBadgeCritical
                : styles.alertBadgeAttention
            }
            aria-label={`${badgeCount} Founder alert${badgeCount === 1 ? "" : "s"}`}
          >
            {badgeCount > 99 ? "99+" : badgeCount}
          </span>
        ) : null}
      </button>

      {summary.criticalCount > 0 && criticalVisible ? (
        <div className={styles.criticalAlertToast} role="alert">
          <div>
            <div className={styles.criticalAlertKicker}>URGENT FOUNDER ALERT</div>
            <strong>
              {summary.criticalCount} critical alert{summary.criticalCount === 1 ? "" : "s"} need attention
            </strong>
            <p>
              {summary.criticalMessage ||
                "HIISSA has received a verified critical signal. Open Alerts for the authorised detail and safest next action."}
            </p>
          </div>
          <div className={styles.criticalAlertActions}>
            <button type="button" onClick={onClick}>Open Alerts</button>
            <button
              type="button"
              onClick={() => {
                setDismissedCriticalKey(
                  `${summary.criticalCount}:${summary.criticalMessage || "verified-critical-signal"}`
                );
                setCriticalVisible(false);
              }}
            >
              Dismiss
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}

function FounderWelcomeMoment({ authenticated, onCalmStart }) {
  const [welcome, setWelcome] = useState(null);
  const [visible, setVisible] = useState(false);
  const [checkInVisible, setCheckInVisible] = useState(false);

  useEffect(() => {
    if (!authenticated || !adminDataClient) return;

    let active = true;

    function localDateString(date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    }

    async function loadWelcome() {
      try {
        const {
          data: { session },
        } = await adminDataClient.auth.getSession();

        if (!session?.access_token || !active) return;

        const now = new Date();
        const response = await fetch("/api/admin/control-room/founder-welcome", {
          method: "POST",
          cache: "no-store",
          credentials: "same-origin",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            localDate: localDateString(now),
            localHour: now.getHours(),
            timeZone:
              Intl.DateTimeFormat().resolvedOptions().timeZone || "local-device",
          }),
        });

        const data = await response.json().catch(() => null);
        if (!active || !response.ok || !data) return;

        setWelcome(data);
        const showFullWelcome = Boolean(data.showFullWelcome);
        setVisible(showFullWelcome);
        setCheckInVisible(!showFullWelcome && Boolean(data.checkIn?.due));
      } catch {
        // Welcome is an enhancement. Control Room access must not depend on it.
      }
    }

    loadWelcome();
    return () => {
      active = false;
    };
  }, [authenticated]);

  if (!welcome) return null;

  if (!visible) {
    return (
      <>
        <div className={styles.quietWelcome} role="status">
          <span>{welcome.greeting},</span>
          <strong>{welcome.founderName}</strong>
          <span className={styles.quietFounderBadge}>{welcome.role}</span>
        </div>
        <GentleCheckIn
          open={checkInVisible}
          displayName={welcome.founderName}
          roleLabel={welcome.role}
          choices={welcome.checkIn?.choices}
          privacyText={welcome.checkIn?.privacy}
          daypart={welcome.checkIn?.daypart}
          previewOnly={false}
          onClose={() => setCheckInVisible(false)}
          onCalmStart={() => {
            setCheckInVisible(false);
            onCalmStart?.();
          }}
        />
      </>
    );
  }

  function finishWelcome() {
    setVisible(false);
    if (welcome.checkIn?.due) setCheckInVisible(true);
  }

  return (
    <div className={styles.welcomeOverlay} role="dialog" aria-modal="true" aria-label="Founder welcome">
      <section className={styles.welcomeCard} data-period={welcome.period}>
        <div className={styles.welcomeGlow} aria-hidden="true" />
        <div className={styles.welcomeKicker}>HIISSA · FOUNDER WELCOME</div>
        <div className={styles.welcomeGreeting}>{welcome.greeting}</div>
        <div className={styles.welcomeName}>{welcome.founderName}</div>
        <div className={styles.welcomeRoleWrap}>
          <span className={styles.welcomeRole}>{welcome.role}</span>
        </div>
        <p className={styles.welcomeMessage}>{welcome.motivation}</p>
        {welcome.mode === "WELCOME_BACK" ? (
          <p className={styles.welcomeReturnNote}>
            Good to have you back. HIISSA can now bring forward what matters since your earlier visit.
          </p>
        ) : null}
        <button
          type="button"
          className={styles.welcomeEnter}
          onClick={finishWelcome}
        >
          Enter Control Room →
        </button>
        <button
          type="button"
          className={styles.welcomeDismiss}
          onClick={finishWelcome}
          aria-label="Dismiss Founder welcome"
        >
          Skip welcome
        </button>
      </section>
    </div>
  );
}

function FounderSearchPanel({ onClose, onChoosePrimary, onChooseModule }) {
  const [query, setQuery] = useState("");

  const destinations = [
    { label: "Overview", detail: "Founder operational picture", action: () => onChoosePrimary("overview") },
    { label: "Staff & Workspaces", detail: "Departments, people and work contexts", action: () => onChoosePrimary("staff") },
    { label: "Approvals", detail: "Founder Command / Approval Inbox", action: () => onChoosePrimary("approvals") },
    ...MODULES.filter((module) => module.id !== CONTROL_ROOM_MODULES.overview).map((module) => ({
      label: module.label,
      detail: "System module",
      action: () => onChooseModule(module.id),
    })),
    ...(STAFF_WORKSPACE_SHELL_STANDARD.workspaces || []).map((workspace) => ({
      label: workspace.label,
      detail: "Staff workspace",
      action: () => onChoosePrimary("staff"),
    })),
  ];

  const normalised = query.trim().toLowerCase();
  const results = normalised
    ? destinations.filter((item) =>
        `${item.label} ${item.detail}`.toLowerCase().includes(normalised)
      ).slice(0, 12)
    : destinations.slice(0, 8);

  return (
    <section className={styles.globalPanel} aria-label="Founder Search">
      <div className={styles.globalPanelHeading}>
        <div>
          <div className={styles.kicker}>FOUNDER SEARCH</div>
          <strong>Go directly to what you need</strong>
        </div>
        <button type="button" className={styles.panelClose} onClick={onClose}>Close</button>
      </div>
      <input
        className={styles.searchInput}
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search modules, departments or workspaces…"
        autoFocus
      />
      <div className={styles.searchResults}>
        {results.map((item) => (
          <button
            type="button"
            key={`${item.label}-${item.detail}`}
            className={styles.searchResult}
            onClick={item.action}
          >
            <strong>{item.label}</strong>
            <span>{item.detail}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

function FounderAlertsPanel({ authenticated, onClose, onOpenApprovals }) {
  const [loading, setLoading] = useState(Boolean(authenticated));
  const [pending, setPending] = useState(null);
  const [securityStatus, setSecurityStatus] = useState(null);
  const [criticalCount, setCriticalCount] = useState(0);
  const [criticalMessage, setCriticalMessage] = useState("");

  useEffect(() => {
    if (!authenticated || !adminDataClient) {
      setLoading(false);
      return;
    }

    let active = true;

    async function load() {
      try {
        const {
          data: { session },
        } = await adminDataClient.auth.getSession();

        if (!session?.access_token || !active) {
          setLoading(false);
          return;
        }

        const headers = { Authorization: `Bearer ${session.access_token}` };
        const [approvalResponse, securityResponse] = await Promise.all([
          fetch("/api/admin/control-room/staff-approval-inbox", {
            method: "GET",
            cache: "no-store",
            credentials: "same-origin",
            headers,
          }),
          fetch("/api/admin/control-room/security-summary", {
            method: "GET",
            cache: "no-store",
            credentials: "same-origin",
            headers,
          }),
        ]);

        const [approvalData, securityData] = await Promise.all([
          approvalResponse.json().catch(() => null),
          securityResponse.json().catch(() => null),
        ]);

        if (!active) return;

        if (approvalResponse.ok && approvalData) {
          setPending(Number(approvalData.pendingCount || 0));
        } else {
          setPending(null);
        }

        if (securityResponse.ok && securityData) {
          setSecurityStatus(securityData.status || null);
          setCriticalCount(Number(securityData.criticalCount || 0));
          setCriticalMessage(securityData.criticalMessage || "");
        } else {
          setSecurityStatus(null);
          setCriticalCount(0);
          setCriticalMessage("");
        }

        setLoading(false);
      } catch {
        if (!active) return;
        setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [authenticated]);

  const securityNeedsAttention = securityStatus === "NEEDS_ATTENTION";

  return (
    <section className={styles.globalPanel} aria-label="Founder Alerts">
      <div className={styles.globalPanelHeading}>
        <div>
          <div className={styles.kicker}>FOUNDER ALERTS</div>
          <strong>Only verified connected signals appear here</strong>
        </div>
        <button type="button" className={styles.panelClose} onClick={onClose}>Close</button>
      </div>

      <div className={styles.alertList}>
        {criticalCount > 0 ? (
          <article className={styles.alertItemCritical}>
            <div>
              <strong>Critical Founder alert</strong>
              <p>
                {criticalMessage ||
                  `${criticalCount} verified critical signal${criticalCount === 1 ? "" : "s"} currently need immediate Founder attention.`}
              </p>
            </div>
          </article>
        ) : null}

        <article className={styles.alertItem}>
          <div>
            <strong>Staff submissions waiting for you</strong>
            <p>
              {loading
                ? "Checking the protected Founder approval queue…"
                : pending === null
                  ? "This source could not be confirmed right now."
                  : pending === 0
                    ? "Nothing from the working staff approval queue needs your decision right now."
                    : `${pending} staff submission${pending === 1 ? "" : "s"} currently waiting for a Founder decision.`}
            </p>
          </div>
          <button type="button" className={styles.alertAction} onClick={onOpenApprovals}>
            Open Approvals →
          </button>
        </article>

        <article className={securityNeedsAttention ? styles.alertItemAttention : styles.alertItem}>
          <div>
            <strong>Admin security & access health</strong>
            <p>
              {loading
                ? "Checking the protected security summary…"
                : securityStatus === null
                  ? "This source could not be confirmed right now."
                  : securityNeedsAttention
                    ? "A connected Admin Security source needs Founder attention. Open the Admin Security & Audit module for the verified detail."
                    : "No connected Admin Security attention signal is currently reported."}
            </p>
          </div>
        </article>

        <article className={styles.alertItem}>
          <div>
            <strong>More Founder alert sources</strong>
            <p>
              Provider, reliability and service-level alerts will join this same
              alert centre only as their real Staging sources are individually
              connected and certified. HIISSA does not invent emergency alerts.
            </p>
          </div>
        </article>
      </div>
    </section>
  );
}

function FounderActivityTimeline({ authenticated }) {
  const [loading, setLoading] = useState(Boolean(authenticated));
  const [events, setEvents] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authenticated || !adminDataClient) {
      setLoading(false);
      return;
    }

    let active = true;

    async function loadActivity() {
      try {
        const {
          data: { session },
        } = await adminDataClient.auth.getSession();

        if (!session?.access_token || !active) {
          setLoading(false);
          return;
        }

        const response = await fetch("/api/admin/control-room/activity-timeline", {
          method: "GET",
          cache: "no-store",
          credentials: "same-origin",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        const data = await response.json().catch(() => null);

        if (!active) return;

        if (!response.ok || !data) {
          setError("The verified Founder activity timeline could not be loaded.");
          setLoading(false);
          return;
        }

        setEvents(Array.isArray(data.events) ? data.events : []);
        setError("");
        setLoading(false);
      } catch {
        if (!active) return;
        setError("The verified Founder activity timeline could not be loaded.");
        setLoading(false);
      }
    }

    loadActivity();
    return () => {
      active = false;
    };
  }, [authenticated]);

  return (
    <section className={styles.activityTimelineSection}>
      <div className={styles.sectionHeading}>
        <div>
          <div className={styles.kicker}>FOUNDER ACTIVITY TIMELINE</div>
          <h3>What happened, and exactly when</h3>
        </div>
        <StatusPill
          label={loading ? "LOADING" : `${events.length} RECENT RECORDS`}
          compact
        />
      </div>

      <p className={styles.sectionCopy}>
        These are real Staging audit records. HIISSA stores the authoritative
        event time and shows it here in your local time. No activity is invented
        to fill the timeline.
      </p>

      {error ? (
        <div className={styles.errorPanel}>
          <strong>Timeline unavailable</strong>
          <div>{error}</div>
        </div>
      ) : null}

      {!loading && !error && events.length === 0 ? (
        <div className={styles.emptyState}>
          No verified Staging audit activity is available yet.
        </div>
      ) : null}

      {events.length > 0 ? (
        <div className={styles.activityTimeline}>
          {events.slice(0, 12).map((event) => (
            <article className={styles.activityEvent} key={event.id}>
              <time
                className={styles.activityTime}
                dateTime={event.occurredAt || undefined}
                title={formatHiissaFullRecordTime(event.occurredAt)}
              >
                {formatHiissaRecordTime(event.occurredAt)}
              </time>
              <div className={styles.activityEventBody}>
                <strong>{event.title}</strong>
                <p>
                  {event.actor} · {event.source}
                  {event.caseCode ? ` · ${event.caseCode}` : ""}
                </p>
                <div className={styles.activityMeta}>
                  <span>Outcome: {event.outcome || "Recorded"}</span>
                  {event.status ? <span>Status: {event.status}</span> : null}
                  <span>L{event.oversightLevel || 1}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : null}

      <div className={styles.timestampStandardNote}>
        <strong>HIISSA timestamp rule:</strong> original database time is
        preserved; created, updated, submitted, returned, approved and verified
        times stay distinct rather than overwriting one another.
      </div>
    </section>
  );
}

function Overview({
  registeredFeatures,
  authenticated,
  calmStart,
  onBack,
  onOpenAlerts,
  onOpenStaff,
  onOpenApprovals,
  onShowFullOverview,
}) {
  if (calmStart) {
    return (
      <>
        <FounderContextBack onBack={onBack} fallbackLabel="Admin Dashboard" />
        <section className={styles.calmStartPanel}>
          <div className={styles.kicker}>FOUNDER CALM START</div>
          <h2>Only what may need you first</h2>
          <p>
            HIISSA is keeping the opening view simple. Nothing has been removed.
            Start with verified Alerts or work waiting for your decision, then
            return to the full Overview whenever you are ready.
          </p>
          <div className={styles.calmStartActions}>
            <button type="button" onClick={onOpenAlerts}>
              Open Alerts
            </button>
            <button type="button" onClick={onOpenApprovals}>
              Open Approvals
            </button>
            <button type="button" onClick={onShowFullOverview}>
              Show full Overview
            </button>
          </div>
          <div className={styles.calmStartPrivacy}>
            Your check-in answer was not sent to the Founder/Admin audit trail.
            This calmer presentation exists only for your current browser experience.
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <FounderContextBack onBack={onBack} fallbackLabel="Admin Dashboard" />
      <div className={styles.pageHeading}>
        <div>
          <div className={styles.kicker}>OVERVIEW / CONTROL ROOM</div>
          <h2>Founder operational picture</h2>
          <p>
            {authenticated
              ? "This authenticated Staging shell establishes the navigation, Registry-driven feature visibility and information hierarchy while live operational feeds are connected only through separate certification."
              : "This isolated shell proves the navigation, Registry-driven feature visibility and information hierarchy before live operational feeds are connected."}
          </p>
        </div>
        <StatusPill label="FOUNDATION" />
      </div>

      <section className={styles.notice}>
        <strong>Important: no fake health numbers.</strong>
        <p>
          Live health, user-registration, entitlement, failure and recovery values will appear only when an authorised real data source is connected and verified.
        </p>
      </section>

      <FounderActivityTimeline authenticated={authenticated} />

      <div className={styles.grid}>
        <InfoCard title="HIISSA STATUS" value="Not yet live-wired" detail="Operational aggregation will come from authorised module signals." />
        <InfoCard title="NEEDS YOUR ATTENTION" value="Feed not connected" detail="One underlying event may appear in multiple authorised views without duplication." />
        <InfoCard title="CURRENT MODULES" value={String(CONTROL_ROOM_MODULE_REGISTRY.currentModuleCount)} detail="Current architecture remains ten modules." />
        <InfoCard title="FUTURE EXPANSION" value="Enabled" detail="A future Founder-approved Module 11+ can be registered without rebuilding the shell." />
      </div>

      <section className={styles.overviewPathways}>
        <button type="button" className={styles.overviewPathway} onClick={onOpenStaff}>
          <span>STAFF & WORKSPACES</span>
          <strong>Departments, people and work contexts</strong>
          <small>Open the dedicated Founder staff area →</small>
        </button>
        <button type="button" className={styles.overviewPathway} onClick={onOpenApprovals}>
          <span>APPROVALS</span>
          <strong>Founder Command / Approval Inbox</strong>
          <small>Review work waiting for your decision →</small>
        </button>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeading}>
          <div>
            <div className={styles.kicker}>FEATURE OPERATIONAL VISIBILITY</div>
            <h3>New Explore experiences already registered</h3>
          </div>
          <StatusPill label="REGISTRY DRIVEN" />
        </div>

        <div className={styles.featureList}>
          {registeredFeatures.map((feature) => (
            <article className={styles.featureCard} key={feature.id}>
              <div className={styles.featureTop}>
                <div>
                  <strong>{feature.publicLabel}</strong>
                  <div className={styles.featureId}>{feature.id}</div>
                </div>
                <StatusPill label={statusLabel(feature.status)} compact />
              </div>
              <p>{feature.primaryPurpose}</p>
              <div className={styles.featureMeta}>
                <span>Activation: {statusLabel(feature.activationStatus)}</span>
                <span>Control Room contract: {feature.controlRoom?.status ? "DEFINED" : "MISSING"}</span>
                <span>Certification: {feature.certification?.stage || "UNKNOWN"}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeading}>
          <div>
            <div className={styles.kicker}>MANDATORY FEATURE CONTRACT</div>
            <h3>What every substantial feature must eventually report</h3>
          </div>
        </div>
        <div className={styles.contractGrid}>
          {FEATURE_OPERATIONAL_VISIBILITY_STANDARD.minimumFeatureVisibility.map((item) => (
            <div className={styles.contractItem} key={item}>✓ {item}</div>
          ))}
        </div>
      </section>

      <section className={styles.detailBlueprint}>
        <div className={styles.kicker}>SHARED DETAIL VIEW — FOUNDATION</div>
        {[
          "WHAT HAPPENED",
          "CURRENT STATUS",
          "WHO / WHAT MAY BE AFFECTED",
          "WHAT HIISSA HAS ALREADY DONE",
          "DO I NEED TO ACT?",
          "AVAILABLE ACTIONS",
          "RECOVERY / NEXT STEP",
          "RELATED EVENTS",
          "AUDIT HISTORY",
          "TECHNICAL DETAILS — EXPAND",
        ].map((label) => (
          <div key={label}>{label}<span>{authenticated ? "Not yet live-wired in Staging" : "Not connected in isolated Preview"}</span></div>
        ))}
      </section>
    </>
  );
}

function FounderAccessCentre({ authenticated }) {
  const workspaces = STAFF_WORKSPACE_SHELL_STANDARD.workspaces || [];

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeading}>
        <div>
          <div className={styles.kicker}>FOUNDER ACCESS CENTRE</div>
          <h3>Departments & staff workspaces</h3>
        </div>
        <StatusPill label="FOUNDER 100% OVERSIGHT" compact />
      </div>

      <p className={styles.sectionCopy}>
        This is the Founder doorway into HIISSA departments. You do not need a
        staff role, another password or an employee account. HIISSA keeps your
        identity as Founder, records the access as Founder activity and opens the
        selected workspace in Founder Preview / oversight mode.
      </p>

      <div className={styles.accessCentreGrid}>
        {workspaces.map((workspace) => {
          const route = FOUNDER_WORKSPACE_ROUTES[workspace.id] || null;
          const available = Boolean(authenticated && route?.href);

          return (
            <article className={styles.accessCentreCard} key={workspace.id}>
              <div className={styles.featureTop}>
                <div>
                  <strong>{workspace.label}</strong>
                  <div className={styles.featureId}>{workspace.id}</div>
                </div>
                <StatusPill
                  label={route?.status || "APPROVED · NOT BUILT YET"}
                  compact
                />
              </div>

              <p>
                {route?.note ||
                  "This approved department workspace will appear here automatically when its interface is built and certified."}
              </p>

              {available ? (
                <Link
                  className={styles.accessCentreLink}
                  href={route.href}
                >
                  Open in Founder Preview →
                </Link>
              ) : route?.href ? (
                <span className={styles.accessCentreDisabled}>
                  Founder sign-in required
                </span>
              ) : (
                <span className={styles.accessCentreDisabled}>
                  Workspace not built yet
                </span>
              )}
            </article>
          );
        })}
      </div>

      <div className={styles.founderPeoplePanel}>
        <div>
          <div className={styles.kicker}>STAFF DIRECTORY — FOUNDER SIDE</div>
          <strong>People will sit under their department, not behind separate logins for you.</strong>
        </div>
        <p>
          When real staff onboarding is activated, a person such as “Sarah —
          Customer Support” will appear under Customer Support here. You will be
          able to open Sarah&apos;s work context from the Founder Control Room.
          HIISSA must keep the session attributable to you as Founder and must not
          impersonate Sarah or use her password.
        </p>
        <div className={styles.featureMeta}>
          <span>FOUNDER IDENTITY PRESERVED</span>
          <span>NO STAFF PASSWORD REQUIRED</span>
          <span>NO INVISIBLE IMPERSONATION</span>
          <span>ACCESS AUDIT REQUIRED</span>
        </div>
      </div>
    </section>
  );
}

function ModuleFoundation({ module, authenticated, onOverview, onBack }) {
  if (module.id === CONTROL_ROOM_MODULES.feedbackRecommendations && authenticated) {
    return <FeedbackRecommendationsModule module={module} onOverview={onOverview} onBack={onBack} />;
  }

  if (module.id === CONTROL_ROOM_MODULES.adminSecurityAudit && authenticated) {
    return <AdminSecurityAuditModule module={module} onOverview={onOverview} onBack={onBack} />;
  }

  if (module.id === CONTROL_ROOM_MODULES.systemOperations && authenticated) {
    return <SystemOperationsModule module={module} onOverview={onOverview} onBack={onBack} />;
  }

  const special =
    module.id === CONTROL_ROOM_MODULES.feedbackRecommendations
      ? "Existing private feedback and separately-permissioned public-review foundations will be preserved and connected here; private feedback is never automatically public."
      : module.id === CONTROL_ROOM_MODULES.adminSecurityAudit
        ? "Routine role assignment will ultimately be managed here through permissions and audit controls rather than by editing code for every staff member."
        : authenticated
          ? "Live controls and data are connected to this Staging shell only after their individual source, permission and certification checks pass."
          : "Live controls and data are intentionally not wired in this isolated shell yet.";

  return (
    <>
      <FounderContextBack onBack={onBack} />
      <div className={styles.pageHeading}>
        <div>
          <div className={styles.kicker}>CURRENT MODULE / PAGE</div>
          <h2>{module.label}</h2>
          <p>{module.purpose}</p>
        </div>
        <StatusPill label="FOUNDATION ONLY" />
      </div>

      <section className={styles.notice}>
        <strong>Registry-aware module shell</strong>
        <p>{special}</p>
      </section>

      <div className={styles.grid}>
        <InfoCard title="MODULE ID" value={module.id} detail="Canonical current-module identity." />
        <InfoCard title="LIVE DATA" value="Not wired" detail={authenticated ? "No metric is fabricated; certified Staging sources will be connected one at a time." : "No metric is fabricated for this Preview."} />
        <InfoCard title="PERMISSIONS" value="Enforcement foundation exists" detail="Deny-by-default and role-aware implementation will govern connected actions." />
        <InfoCard title="AUDIT" value="Required" detail="Material Admin actions must remain attributable and reviewable." />
      </div>

      <section className={styles.detailBlueprint}>
        <div className={styles.kicker}>FUTURE OPERATIONAL DETAIL CONTRACT</div>
        {[
          "Purpose & relevance",
          "Healthy / warning / failure state",
          "User or system impact",
          "Automatic behaviour",
          "Recovery & retest",
          "Human / Founder action",
          "Authority & permission",
          "Audit evidence",
        ].map((label) => (
          <div key={label}>{label}<span>Defined before module activation</span></div>
        ))}
      </section>
    </>
  );
}

function FeedbackRecommendationsModule({ module, onOverview, onBack }) {
  const [loading, setLoading] = useState(true);
  const [health, setHealth] = useState("Checking");
  const [stats, setStats] = useState(null);
  const [distribution, setDistribution] = useState([]);
  const [writtenFeedback, setWrittenFeedback] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [referralStats, setReferralStats] = useState(null);
  const [publicReviews, setPublicReviews] = useState([]);
  const [errors, setErrors] = useState([]);

  useEffect(() => {
    let active = true;

    async function load() {
      if (!adminDataClient) {
        if (active) {
          setErrors(["Admin data connection is not configured for this environment."]);
          setHealth("Unavailable");
          setLoading(false);
        }
        return;
      }

      const nextErrors = [];

      const [
        statsResult,
        distributionResult,
        writtenResult,
        recommendationResult,
        referralResult,
        publicResult,
      ] = await Promise.all([
        adminDataClient.rpc("get_hiissa_feedback_stats"),
        adminDataClient.rpc("get_hiissa_rating_distribution"),
        adminDataClient.rpc("get_hiissa_written_feedback"),
        adminDataClient.rpc("get_hiissa_recommendations"),
        adminDataClient.rpc("get_hiissa_referral_stats"),
        adminDataClient.rpc("get_hiissa_admin_public_reviews"),
      ]);

      if (!active) return;

      if (statsResult.error) nextErrors.push("Feedback statistics could not be loaded.");
      else if (statsResult.data?.length) setStats(statsResult.data[0]);

      if (distributionResult.error) nextErrors.push("Rating distribution could not be loaded.");
      else setDistribution(distributionResult.data || []);

      if (writtenResult.error) nextErrors.push("Private written feedback could not be loaded.");
      else setWrittenFeedback(writtenResult.data || []);

      if (recommendationResult.error) nextErrors.push("Recommendations could not be loaded.");
      else setRecommendations(recommendationResult.data || []);

      if (referralResult.error) nextErrors.push("Referral growth statistics could not be loaded.");
      else if (referralResult.data?.length) setReferralStats(referralResult.data[0]);

      if (publicResult.error) nextErrors.push("Authorised public reviews could not be loaded.");
      else setPublicReviews(publicResult.data || []);

      setErrors(nextErrors);
      setHealth(nextErrors.length === 0 ? "Healthy" : nextErrors.length < 4 ? "Needs Attention" : "Unavailable");
      setLoading(false);
    }

    load();
    return () => {
      active = false;
    };
  }, []);

  const totalFeedback = stats?.total_feedback ?? (loading ? "…" : 0);
  const average =
    stats?.average_rating == null
      ? "—"
      : `${Number(stats.average_rating).toFixed(2)} / 5`;
  const helpful =
    stats?.helpful_percentage == null
      ? "—"
      : `${Number(stats.helpful_percentage).toFixed(1)}%`;

  return (
    <>
      <FounderContextBack onBack={onBack} />
      <div className={styles.pageHeading}>
        <div>
          <div className={styles.kicker}>MODULE 4 — LIVE STAGING READ-ONLY</div>
          <h2>{module.label}</h2>
          <p>{module.purpose}</p>
        </div>
        <StatusPill label={loading ? "CHECKING" : health.toUpperCase()} />
      </div>

      <section className={styles.notice}>
        <strong>One feedback source of truth.</strong>
        <p>
          This module reads the existing HIISSA feedback and public-review permission sources. It does not create a second feedback store, and private feedback is never treated as permission to publish.
        </p>
      </section>

      {errors.length > 0 ? (
        <section className={styles.errorPanel}>
          <strong>Needs attention</strong>
          {errors.map((error) => <div key={error}>{error}</div>)}
        </section>
      ) : null}

      <div className={styles.grid}>
        <InfoCard title="SOURCE HEALTH" value={loading ? "Checking…" : health} detail="Real read-only Staging calls to the existing feedback functions." />
        <InfoCard title="TOTAL FEEDBACK" value={String(totalFeedback)} detail="Genuine feedback records reported by the existing feedback statistics function." />
        <InfoCard title="AVERAGE RATING" value={average} detail="No value is fabricated when there is not enough data." />
        <InfoCard title="HELPFUL" value={helpful} detail="Existing aggregate helpfulness signal." />
      </div>

      <section className={styles.section}>
        <div className={styles.sectionHeading}>
          <div>
            <div className={styles.kicker}>RATING DISTRIBUTION</div>
            <h3>Current genuine ratings</h3>
          </div>
        </div>
        {distribution.length === 0 ? (
          <div className={styles.emptyState}>No rating distribution is currently available.</div>
        ) : (
          <div className={styles.ratingList}>
            {distribution.map((item) => (
              <div className={styles.ratingRow} key={item.rating}>
                <strong>{Number(item.rating)} star</strong>
                <span>{Number(item.rating_count)} {Number(item.rating_count) === 1 ? "response" : "responses"}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeading}>
          <div>
            <div className={styles.kicker}>PRIVATE FEEDBACK</div>
            <h3>Written feedback</h3>
          </div>
          <StatusPill label={`${writtenFeedback.length} RECORDS`} compact />
        </div>
        {writtenFeedback.length === 0 ? (
          <div className={styles.emptyState}>No written feedback has been submitted yet.</div>
        ) : (
          <div className={styles.feedbackList}>
            {writtenFeedback.slice(0, 10).map((item) => (
              <article className={styles.feedbackItem} key={item.id}>
                <div className={styles.featureMeta}>
                  <span>Rating: {item.rating ?? "—"} / 5</span>
                  <span>{item.helpful ? "Helpful" : "Not marked helpful"}</span>
                </div>
                {item.feedback_text ? <p>{item.feedback_text}</p> : null}
                {item.suggestion_text ? <p><strong>Suggestion:</strong> {item.suggestion_text}</p> : null}
              </article>
            ))}
          </div>
        )}
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeading}>
          <div>
            <div className={styles.kicker}>RECOMMENDATIONS</div>
            <h3>User ideas and improvements</h3>
          </div>
          <StatusPill label={`${recommendations.length} RECORDS`} compact />
        </div>
        <p className={styles.sectionCopy}>
          Recommendations are private product-improvement submissions. They are not public reviews and are not mixed into feedback ratings.
        </p>
        {recommendations.length === 0 ? (
          <div className={styles.emptyState}>No recommendations have been submitted yet.</div>
        ) : (
          <div className={styles.feedbackList}>
            {recommendations.slice(0, 10).map((item) => (
              <article className={styles.feedbackItem} key={item.id}>
                <div className={styles.featureMeta}>
                  <span>RECOMMENDATION</span>
                  <span>{item.suggestion_area || "No area selected"}</span>
                </div>
                <p><strong>Idea:</strong> {item.suggestion_text}</p>
                {item.suggestion_why ? <p><strong>Why helpful:</strong> {item.suggestion_why}</p> : null}
              </article>
            ))}
          </div>
        )}
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeading}>
          <div>
            <div className={styles.kicker}>REFERRAL GROWTH — STAGE 1 FOUNDATION</div>
            <h3>Privacy-safe invitation attribution</h3>
          </div>
          <StatusPill label="STAGING FOUNDATION" compact />
        </div>
        <p className={styles.sectionCopy}>
          These are aggregate referral signals only. This view does not expose referrer names,
          recipient identities, private conversations, relationship history, reflections,
          message contents, or authentication secrets.
        </p>
        <div className={styles.grid}>
          <InfoCard
            title="ACTIVE REFERRERS"
            value={String(referralStats?.active_referrers ?? (loading ? "…" : 0))}
            detail="Signed-in Staging accounts with a privacy-safe referral identity."
          />
          <InfoCard
            title="REFERRAL VISITS"
            value={String(referralStats?.total_visits ?? (loading ? "…" : 0))}
            detail="Recorded privacy-safe invitation arrivals."
          />
          <InfoCard
            title="VISITS · LAST 30 DAYS"
            value={String(referralStats?.visits_last_30_days ?? (loading ? "…" : 0))}
            detail="The current referral-attribution eligibility window is 30 days."
          />
          <InfoCard
            title="SUCCESSFUL JOINS"
            value={String(referralStats?.successful_joins ?? (loading ? "…" : 0))}
            detail="Accounts later attributed to an eligible invitation arrival."
          />
          <InfoCard
            title="JOIN CONVERSION"
            value={
              referralStats?.join_conversion_percentage == null
                ? "—"
                : `${Number(referralStats.join_conversion_percentage).toFixed(1)}%`
            }
            detail="Successful attributed joins divided by recorded referral visits."
          />
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeading}>
          <div>
            <div className={styles.kicker}>PUBLIC REVIEWS</div>
            <h3>Separate permission only</h3>
          </div>
          <StatusPill label={`${publicReviews.length} PERMITTED`} compact />
        </div>
        <p className={styles.sectionCopy}>
          Only wording for which separate public-sharing permission exists appears here. Private feedback remains private.
        </p>
        {publicReviews.length === 0 ? (
          <div className={styles.emptyState}>No reviews currently have permission for public display.</div>
        ) : (
          <div className={styles.feedbackList}>
            {publicReviews.slice(0, 10).map((item) => (
              <article className={styles.feedbackItem} key={item.id}>
                <div className={styles.featureMeta}>
                  <span>PUBLIC PERMISSION</span>
                  <span>Rating: {item.rating ?? "—"} / 5</span>
                </div>
                <p>“{item.public_display_text}”</p>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className={styles.detailBlueprint}>
        <div className={styles.kicker}>MODULE 4 OPERATIONAL DETAIL</div>
        <div>SOURCE STATUS<span>{loading ? "Checking real Staging source" : health}</span></div>
        <div>PRIVATE / PUBLIC BOUNDARY<span>Separate permission required</span></div>
        <div>RECOMMENDATIONS<span>Connected Staging submission + read-only Module 4 view</span></div>
        <div>REFERRAL FOUNDATION<span>Signed-in identity + visit + later join attribution; rewards remain off</span></div>
        <div>AUDIT / PERMISSION HISTORY<span>Will connect only from verified source evidence</span></div>
      </section>
    </>
  );
}

function SystemOperationsModule({ module, onOverview, onBack }) {
  const providers = FOUNDER_PROVIDER_SUBSCRIPTION_SPEND_STANDARD.providerRegister;
  const [openAiLoading, setOpenAiLoading] = useState(true);
  const [openAiSummary, setOpenAiSummary] = useState(null);
  const [openAiError, setOpenAiError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadOpenAiProviderSummary() {
      if (!adminDataClient) {
        if (active) {
          setOpenAiError("The protected Admin data connection is not configured for this environment.");
          setOpenAiLoading(false);
        }
        return;
      }

      try {
        const {
          data: { session },
        } = await adminDataClient.auth.getSession();

        if (!session?.access_token) {
          if (active) {
            setOpenAiError("Your Admin session could not be confirmed for OpenAI provider telemetry.");
            setOpenAiLoading(false);
          }
          return;
        }

        const response = await fetch("/api/admin/control-room/openai-provider-summary", {
          method: "GET",
          cache: "no-store",
          credentials: "same-origin",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        const data = await response.json().catch(() => null);
        if (!active) return;

        if (!response.ok || !data) {
          setOpenAiError("The protected OpenAI provider summary could not be loaded.");
          setOpenAiLoading(false);
          return;
        }

        setOpenAiSummary(data);
        setOpenAiLoading(false);
      } catch {
        if (!active) return;
        setOpenAiError("The protected OpenAI provider summary could not be loaded.");
        setOpenAiLoading(false);
      }
    }

    loadOpenAiProviderSummary();
    return () => {
      active = false;
    };
  }, []);

  function formatNumber(value) {
    return typeof value === "number" && Number.isFinite(value)
      ? new Intl.NumberFormat("en-GB").format(value)
      : "—";
  }

  function formatCosts(costs) {
    if (!Array.isArray(costs) || costs.length === 0) return "—";

    return costs
      .map((item) => {
        const currency = String(item.currency || "").toUpperCase();
        const value = Number(item.value);
        if (!currency || !Number.isFinite(value)) return null;

        try {
          return new Intl.NumberFormat("en-GB", {
            style: "currency",
            currency,
            maximumFractionDigits: 4,
          }).format(value);
        } catch {
          return `${currency} ${value.toFixed(4)}`;
        }
      })
      .filter(Boolean)
      .join(" · ") || "—";
  }

  const openAiStatus = openAiLoading
    ? "CHECKING"
    : openAiError
      ? "UNAVAILABLE"
      : openAiSummary?.status || "UNKNOWN";

  const openAiStatusDetail =
    openAiSummary?.status === "HEALTHY"
      ? "Protected organization usage and cost telemetry is connected."
      : openAiSummary?.status === "PARTIAL"
        ? "One protected OpenAI organization source is currently unavailable."
        : openAiSummary?.status === "SOURCE_NOT_CONFIGURED"
          ? "HIISSA runtime is connected; a separate API Platform organization Admin key is still required for usage/cost telemetry."
          : openAiSummary?.status === "ADMIN_KEY_REJECTED"
            ? "The protected organization Admin credential was rejected; no runtime key was exposed or changed."
            : openAiSummary?.status === "RATE_LIMITED"
              ? "The protected OpenAI organization source is temporarily rate limited."
              : openAiError || "Protected OpenAI organization telemetry is not yet available.";

  const verificationSnapshot = [
    {
      label: "Vercel",
      value: "BILLING DATA VERIFIED",
      detail: "Authorised development tooling returned real HIISSA team billing/usage records for the current period. The Control Room live feed still needs its own secure connection.",
    },
    {
      label: "Supabase",
      value: "FREE PLAN · 2 ACTIVE PROJECTS",
      detail: "HIISSA organisation plan was verified as Free; Production and Staging projects were ACTIVE_HEALTHY at the latest check.",
    },
    {
      label: "Resend",
      value: "DOMAIN + USAGE VERIFIED",
      detail: "hiissa.com is verified for sending. Latest development check showed 42 / 3000 monthly emails and 3 / 100 daily emails.",
    },
    {
      label: "OpenAI API",
      value: openAiLoading ? "CHECKING PROTECTED SOURCE" : openAiStatus.replaceAll("_", " "),
      detail: openAiStatusDetail,
    },
  ];

  return (
    <>
      <FounderContextBack onBack={onBack} />

      <div className={styles.pageHeading}>
        <div>
          <div className={styles.kicker}>MODULE 9 — STAGING PROVIDER & SPEND REGISTER</div>
          <h2>{module.label}</h2>
          <p>{module.purpose}</p>
        </div>
        <StatusPill label="PARTIAL · VERIFIED SNAPSHOT" />
      </div>

      <section className={styles.notice}>
        <strong>Founder business visibility — no fabricated money data.</strong>
        <p>
          HIISSA will bring provider subscriptions, API capacity, recurring costs,
          renewal dates and service health into one Founder view. A cost, balance,
          plan or renewal date appears only when its source is verified.
        </p>
      </section>

      <div className={styles.grid}>
        <InfoCard
          title="KNOWN CURRENT SERVICES"
          value={String(providers.length)}
          detail="Current approved provider/business-tool register. New providers can be added later without creating a new Control Room module."
        />
        <InfoCard
          title="OPENAI ORGANIZATION TELEMETRY"
          value={openAiStatus.replaceAll("_", " ")}
          detail={openAiStatusDetail}
        />
        <InfoCard
          title="RENEWAL TRACKING"
          value="APPROVED"
          detail="30 / 14 / 7 / 1-day warnings are part of the permanent provider-spend contract."
        />
        <InfoCard
          title="MONEY MOVEMENT"
          value="FOUNDER GATED"
          detail="Monitoring can be automatic; top-ups, upgrades and other money-moving actions are not automatically authorised."
        />
      </div>

      <section className={styles.section}>
        <div className={styles.sectionHeading}>
          <div>
            <div className={styles.kicker}>OPENAI PROVIDER CONNECTION — PROTECTED STAGING SOURCE</div>
            <h3>Runtime health, usage and cost without exposing credentials</h3>
          </div>
          <StatusPill label={openAiStatus.replaceAll("_", " ")} compact />
        </div>

        <p className={styles.sectionCopy}>
          HIISSA’s normal OpenAI runtime key remains separate from the API Platform
          organization Admin credential required for organization usage and cost
          telemetry. Neither key is returned to this browser.
        </p>

        {openAiError ? (
          <section className={styles.errorPanel}>
            <strong>Needs attention</strong>
            <div>{openAiError}</div>
          </section>
        ) : null}

        <div className={styles.grid}>
          <InfoCard
            title="RUNTIME CONNECTION"
            value={
              openAiLoading
                ? "Checking…"
                : openAiSummary?.runtimeApiKeyConfigured
                  ? "CONFIGURED"
                  : "NOT CONFIRMED"
            }
            detail="This is the existing HIISSA model-runtime connection, not the organization billing/usage credential."
          />
          <InfoCard
            title="ORGANIZATION ADMIN SOURCE"
            value={
              openAiLoading
                ? "Checking…"
                : openAiSummary?.adminTelemetryKeyConfigured
                  ? "CONFIGURED"
                  : "SETUP REQUIRED"
            }
            detail="A separate API Platform organization Admin key is required for the protected organization usage/cost source."
          />
          <InfoCard
            title="MONTH-TO-DATE COST"
            value={
              openAiSummary?.status === "SOURCE_NOT_CONFIGURED"
                ? "SETUP REQUIRED"
                : formatCosts(openAiSummary?.costs)
            }
            detail="Verified organization cost results only. HIISSA does not estimate or convert currencies."
          />
          <InfoCard
            title="MODEL REQUESTS"
            value={formatNumber(openAiSummary?.usage?.requests)}
            detail="Month-to-date requests returned by the protected organization completions-usage source."
          />
          <InfoCard
            title="INPUT TOKENS"
            value={formatNumber(openAiSummary?.usage?.inputTokens)}
            detail="Verified month-to-date organization input-token usage from the connected source."
          />
          <InfoCard
            title="OUTPUT TOKENS"
            value={formatNumber(openAiSummary?.usage?.outputTokens)}
            detail="Verified month-to-date organization output-token usage from the connected source."
          />
          <InfoCard
            title="CACHED INPUT TOKENS"
            value={formatNumber(openAiSummary?.usage?.cachedInputTokens)}
            detail="Shown only when returned by the organization usage source."
          />
          <InfoCard
            title="CREDIT / PREPAID BALANCE"
            value="BILLING PAGE SOURCE"
            detail="No balance is invented. Credit-grant/prepaid-balance details remain on the official OpenAI Billing source until a reliable supported API source is connected."
          />
        </div>

        <div className={styles.prototypeReviewBlock}>
          <strong>Evidence and refresh</strong>
          <p>
            Source: {openAiSummary?.evidenceSource || "OpenAI API Platform organization Admin API"}.
            Last protected refresh: {openAiSummary?.refreshedAt
              ? new Date(openAiSummary.refreshedAt).toLocaleString()
              : openAiLoading
                ? " checking…"
                : " not available"}.
          </p>
        </div>

        <div className={styles.prototypeDecisionActions}>
          <a
            className={styles.prototypeSecondary}
            href={openAiSummary?.officialLinks?.usage || "https://platform.openai.com/usage"}
            target="_blank"
            rel="noreferrer"
          >
            Open OpenAI Usage ↗
          </a>
          <a
            className={styles.prototypeSecondary}
            href={
              openAiSummary?.officialLinks?.billing ||
              "https://platform.openai.com/settings/organization/billing/overview"
            }
            target="_blank"
            rel="noreferrer"
          >
            Open OpenAI Billing ↗
          </a>
        </div>

        <div className={styles.featureMeta}>
          <span>READ ONLY</span>
          <span>STAGING ONLY</span>
          <span>ADMIN AUTH REQUIRED</span>
          <span>NO RAW KEYS RETURNED</span>
          <span>NO AUTOMATIC TOP-UP OR PURCHASE</span>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeading}>
          <div>
            <div className={styles.kicker}>VERIFIED DEVELOPMENT SNAPSHOT — 4 OCTOBER 2026</div>
            <h3>What we can already confirm</h3>
          </div>
          <StatusPill label="SNAPSHOT + PROTECTED SOURCE" compact />
        </div>

        <div className={styles.featureList}>
          {verificationSnapshot.map((item) => (
            <article className={styles.featureCard} key={item.label}>
              <div className={styles.featureTop}>
                <div>
                  <strong>{item.label}</strong>
                </div>
                <StatusPill label={item.value} compact />
              </div>
              <p>{item.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeading}>
          <div>
            <div className={styles.kicker}>PROVIDER, SUBSCRIPTION & SPEND REGISTER</div>
            <h3>Everything HIISSA depends on — one Founder view</h3>
          </div>
        </div>

        <div className={styles.featureList}>
          {providers.map((provider) => (
            <article className={styles.featureCard} key={provider.id}>
              <div className={styles.featureTop}>
                <div>
                  <strong>{provider.label}</strong>
                  <div className={styles.featureId}>{provider.category}</div>
                </div>
                <StatusPill
                  label={
                    provider.id === "openai-api"
                      ? openAiStatus.replaceAll("_", " ")
                      : provider.currentFinancialSource.includes("NOT YET") || provider.currentFinancialSource.includes("REQUIRES")
                        ? "SOURCE TO CONNECT"
                        : "SOURCE PARTIAL"
                  }
                  compact
                />
              </div>
              <p><strong>Current evidence:</strong> {provider.evidence}</p>
              <p><strong>Billing / usage source:</strong> {provider.currentFinancialSource}</p>
              <p><strong>Founder view will include:</strong> {provider.requiredView}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeading}>
          <div>
            <div className={styles.kicker}>API CREDIT & CAPACITY PROTECTION</div>
            <h3>Warn before a provider stops HIISSA</h3>
          </div>
          <StatusPill label="FOUNDER APPROVED" compact />
        </div>

        <p className={styles.sectionCopy}>
          When a provider exposes reliable usage, quota or credit data, HIISSA should
          monitor it and warn at 25%, 10%, 5% remaining and at exhaustion. If a
          provider does not expose a reliable balance, HIISSA must use verified
          usage/limit/failure evidence instead of inventing a number.
        </p>

        <div className={styles.contractGrid}>
          {FOUNDER_PROVIDER_SUBSCRIPTION_SPEND_STANDARD.alertPolicy.billingSignals.map((item) => (
            <div className={styles.contractItem} key={item}>✓ {item}</div>
          ))}
        </div>

        <div className={styles.prototypeReviewBlock}>
          <strong>Founder alert route</strong>
          <p>{FOUNDER_PROVIDER_SUBSCRIPTION_SPEND_STANDARD.alertPolicy.founderChannels}</p>
        </div>

        <div className={styles.prototypeReviewBlock}>
          <strong>Important money-safety rule</strong>
          <p>{FOUNDER_PROVIDER_SUBSCRIPTION_SPEND_STANDARD.moneySafety}</p>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeading}>
          <div>
            <div className={styles.kicker}>FUTURE FOUNDER / FINANCE CONTROL</div>
            <h3>Add new subscriptions without redesigning HIISSA</h3>
          </div>
          <StatusPill label="DESIGN APPROVED · NOT ACTIVE" compact />
        </div>
        <p className={styles.sectionCopy}>
          As HIISSA subscribes to another provider, a controlled Founder/Finance
          interface will add it to this register with its purpose, plan, cost,
          billing cycle, renewal date, currency, usage source and alert thresholds.
          New records stay unverified until supporting evidence is connected.
        </p>
      </section>

      <section className={styles.detailBlueprint}>
        <div className={styles.kicker}>MODULE 9 PROVIDER / SPEND OPERATIONAL CONTRACT</div>
        <div>PRIMARY HOME<span>System & Operations</span></div>
        <div>FAILED PAYMENT / CREDIT EXHAUSTION<span>Failures & Reliability</span></div>
        <div>AI COST / PROVIDER QUALITY<span>HIISSA AI & Product Intelligence</span></div>
        <div>CUSTOMER PLAN ENTITLEMENTS<span>Subscriptions & Access</span></div>
        <div>URGENT FOUNDER ACTION<span>Overview / Needs Your Attention</span></div>
        <div>SECRETS / PAYMENT CARDS<span>Never shown raw</span></div>
      </section>
    </>
  );
}

function AdminSecurityAuditModule({ module, onOverview, onBack }) {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const {
          data: { session },
        } = await adminDataClient.auth.getSession();

        if (!session?.access_token) {
          if (active) {
            setError("Your Admin session could not be confirmed for this protected module.");
            setLoading(false);
          }
          return;
        }

        const response = await fetch("/api/admin/control-room/security-summary", {
          method: "GET",
          cache: "no-store",
          credentials: "same-origin",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        const data = await response.json().catch(() => null);
        if (!active) return;

        if (!response.ok || !data) {
          setError("The protected Admin security summary could not be loaded.");
          setLoading(false);
          return;
        }

        setSummary(data);
        setLoading(false);
      } catch {
        if (!active) return;
        setError("The protected Admin security summary could not be loaded.");
        setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, []);

  const counts = summary?.counts || {};
  const status = loading
    ? "CHECKING"
    : error || summary?.status === "NEEDS_ATTENTION"
      ? "NEEDS ATTENTION"
      : "HEALTHY";

  return (
    <>
      <FounderContextBack onBack={onBack} />

      <div className={styles.pageHeading}>
        <div>
          <div className={styles.kicker}>MODULE 10 — LIVE STAGING READ-ONLY</div>
          <h2>{module.label}</h2>
          <p>{module.purpose}</p>
        </div>
        <StatusPill label={status} />
      </div>

      <section className={styles.notice}>
        <strong>See first. Change later.</strong>
        <p>
          This first Admin Security view shows the real Staging access, role,
          permission, approval and audit foundation. Staff-management controls
          are deliberately disabled until their permission and audit rules are
          separately certified.
        </p>
      </section>

      {error ? (
        <section className={styles.errorPanel}>
          <strong>Needs attention</strong>
          <div>{error}</div>
        </section>
      ) : null}

      <div className={styles.grid}>
        <InfoCard
          title="CURRENT ADMIN GATE"
          value={loading ? "Checking…" : String(counts.legacyAdminAccounts ?? "—")}
          detail="Accounts currently authorised by the existing protected Admin gate."
        />
        <InfoCard
          title="ACTIVE ROLE ASSIGNMENTS"
          value={loading ? "Checking…" : String(counts.activeRoleAssignments ?? "—")}
          detail="Assignments in the newer role-based administration foundation."
        />
        <InfoCard
          title="ACTIVE PERMISSION RULES"
          value={loading ? "Checking…" : String(counts.activePermissionRules ?? "—")}
          detail="Explicit active role/resource/action permission rules."
        />
        <InfoCard
          title="PENDING FOUNDER APPROVALS"
          value={loading ? "Checking…" : String(counts.pendingApprovals ?? "—")}
          detail="Sensitive actions waiting for an approval decision."
        />
        <InfoCard
          title="ACTIVE ACCESS GRANTS"
          value={loading ? "Checking…" : String(counts.activeAccessGrants ?? "—")}
          detail="Temporary or specific active access grants."
        />
        <InfoCard
          title="AUDIT EVENTS"
          value={loading ? "Checking…" : String(counts.auditEvents ?? "—")}
          detail="Recorded Admin security/action events in the new audit foundation."
        />
      </div>

      <section className={styles.section}>
        <div className={styles.sectionHeading}>
          <div>
            <div className={styles.kicker}>ADMIN ROLES</div>
            <h3>Roles the Control Room is designed to support</h3>
          </div>
          <StatusPill label="NO CHANGES ENABLED" compact />
        </div>

        <p className={styles.sectionCopy}>
          These are administrative responsibilities, not automatic access.
          A person receives only the permissions that are deliberately assigned
          and allowed for their role and environment.
        </p>

        <div className={styles.roleGrid}>
          {(summary?.supportedRoles || []).map((role) => (
            <div className={styles.roleItem} key={role.id}>
              <strong>{role.label}</strong>
              <span>{role.id.replaceAll("_", " ")}</span>
            </div>
          ))}
          {!loading && (summary?.supportedRoles || []).length === 0 ? (
            <div className={styles.emptyState}>Role definitions are not currently available.</div>
          ) : null}
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeading}>
          <div>
            <div className={styles.kicker}>FOUNDER AUTHORITY & STAFF ACTION GATE</div>
            <h3>Founder remains the final Control Room authority</h3>
          </div>
          <StatusPill label="FOUNDER APPROVED · MANDATORY" compact />
        </div>

        <p className={styles.sectionCopy}>
          Staff can work only inside their approved roles. They may investigate,
          prepare, draft and save authorised work, but every completed human staff
          submission must pass automatically through the Founder gate before final
          execution. Ordinary staff cannot create, suspend, demote or override Founder authority.
        </p>

        <div className={styles.contractGrid}>
          {FOUNDER_ADMIN_AUTHORITY_AND_STAFF_ACTION_GATE.founderControls.map((item) => (
            <div className={styles.contractItem} key={item}>✓ {item.replaceAll("_", " ")}</div>
          ))}
        </div>

        <div className={styles.featureMeta}>
          <span>FOUNDER: FULL AUTHORISED CONTROL ROOM OVERSIGHT</span>
          <span>EVERY COMPLETED STAFF SUBMISSION: FOUNDER GATE</span>
          <span>STAFF SELF-APPROVAL: BLOCKED</span>
          <span>HIISSA SAFE AUTO-RECOVERY: CONTINUES WITHIN APPROVED BOUNDS</span>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeading}>
          <div>
            <div className={styles.kicker}>FOUNDER APPROVALS</div>
            <h3>One visible approval inbox</h3>
          </div>
          <StatusPill label="TOP-LEVEL FOUNDER AREA" compact />
        </div>
        <p className={styles.sectionCopy}>
          The working Founder Command / Approval Inbox now lives in the permanent
          Approvals area at the top of the Control Room. This module keeps the
          governance and audit context without rendering a second inbox.
        </p>
      </section>

      <StaffAccessControlPrototype />

      <section className={styles.section}>
        <div className={styles.sectionHeading}>
          <div>
            <div className={styles.kicker}>FOUNDER CONTROL ROOM STRENGTHENING PACKAGE</div>
            <h3>Shared Founder capabilities approved for the Control Room</h3>
          </div>
          <StatusPill label="FOUNDER APPROVED · STAGED" compact />
        </div>

        <p className={styles.sectionCopy}>
          These are shared capabilities that strengthen the existing ten-module
          Control Room. They do not create Module 11, do not duplicate operational
          truth, and are not yet live controls unless separately certified.
        </p>

        <div className={styles.featureList}>
          {FOUNDER_CONTROL_ROOM_STRENGTHENING_PACKAGE.capabilities.map((capability) => (
            <article className={styles.featureCard} key={capability.id}>
              <div className={styles.featureTop}>
                <strong>{capability.name}</strong>
                <StatusPill label={capability.status.replaceAll("_", " ")} compact />
              </div>
              <p>{capability.purpose}</p>
              <div className={styles.featureMeta}>
                {capability.modules.map((moduleId) => (
                  <span key={moduleId}>
                    {MODULES.find((item) => item.id === moduleId)?.label || moduleId}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>

        <div className={styles.prototypeReviewBlock}>
          <strong>Permanent Founder principle</strong>
          <p>{FOUNDER_CONTROL_ROOM_STRENGTHENING_PACKAGE.principle}</p>
        </div>

        <div className={styles.featureMeta}>
          <span>NO MODULE 11 CREATED</span>
          <span>ONE SOURCE OF TRUTH</span>
          <span>MINIMUM-NECESSARY OPERATIONAL VISIBILITY</span>
          <span>TEMPORARY DEPUTY MODE: RESERVED · NOT ENABLED</span>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeading}>
          <div>
            <div className={styles.kicker}>ADMIN ACCESS & STAFF ONBOARDING</div>
            <h3>{ADMIN_STAFF_ACCESS_ONBOARDING_STANDARD.canonicalName}</h3>
          </div>
          <StatusPill label="FOUNDER APPROVED · NOT YET LIVE" compact />
        </div>

        <p className={styles.sectionCopy}>
          Future Admin access will be managed from the Control Room rather than by
          editing code for every person. An invitation starts the process but does
          not grant access. Identity verification, evidenced policy acceptance,
          role requirements and Founder approval must complete before access can
          become active.
        </p>

        <div className={styles.prototypeReviewBlock}>
          <strong>What the invited person receives</strong>
          <p>
            The invitation email contains a secure “{STAFF_SECURE_ONBOARDING_EXPERIENCE_STANDARD.invitationCta}”
            doorway. It opens the protected onboarding journey only — not the Admin
            Control Room. The invitee can verify identity, complete the checklist,
            save and resume progress, review the application and submit it for Founder review.
          </p>
        </div>

        <div className={styles.contractGrid}>
          {[
            "1. Founder sends secure invitation",
            "2. Staff member completes onboarding form",
            "3. Identity and work contact are verified",
            "4. Required HIISSA policies are accepted with version evidence",
            "5. Role-specific training/checks are completed where applicable",
            "6. Founder reviews and approves, rejects or returns the application",
            "7. Approved role and environment access are deliberately activated",
            "8. Material access actions are audited",
            "9. Access is periodically reviewed",
            "10. Role changes, suspension and offboarding revoke or adjust access safely",
          ].map((item) => (
            <div className={styles.contractItem} key={item}>✓ {item}</div>
          ))}
        </div>

        <div className={styles.featureMeta}>
          <span>VERBAL-ONLY ACCESS: NOT ALLOWED</span>
          <span>SELF-GRANT: BLOCKED</span>
          <span>FOUNDER APPROVAL: REQUIRED BEFORE ACTIVATION</span>
          <span>PRODUCTION ACCESS: SEPARATE AUTHORITY</span>
        </div>

        <div className={styles.emptyState}>
          Invitation and staff-management controls are intentionally not active yet.
          The approved governance contract is now registered first so the later
          workflow can be built and certified without bypassing security.
        </div>
      </section>

      <StaffOnboardingPrototype roles={summary?.supportedRoles || []} />

      <section className={styles.section}>
        <div className={styles.sectionHeading}>
          <div>
            <div className={styles.kicker}>DETAILED WORKFLOW PREVIEW — NOT LIVE</div>
            <h3>How a future staff application will move through HIISSA</h3>
          </div>
          <StatusPill label="DESIGN PREVIEW ONLY" compact />
        </div>

        <p className={styles.sectionCopy}>
          This preview defines the future experience before any invitation,
          approval or access-changing control is activated.
        </p>

        <div className={styles.featureList}>
          <article className={styles.featureCard}>
            <div className={styles.featureTop}>
              <strong>1. Founder invitation</strong>
              <StatusPill label="NO ACCESS GRANTED" compact />
            </div>
            <p>
              You start the request from the Control Room. The invitation records
              who is being invited, the proposed role, department, environment,
              reason for access and any approved time limit.
            </p>
            <div className={styles.contractGrid}>
              {ADMIN_STAFF_ONBOARDING_WORKFLOW.invitation.requiredInputs.map((item) => (
                <div className={styles.contractItem} key={item}>✓ {item.replaceAll("-", " ")}</div>
              ))}
            </div>
          </article>

          <article className={styles.featureCard}>
            <div className={styles.featureTop}>
              <strong>2. Staff onboarding form</strong>
              <StatusPill label="IDENTITY FIRST" compact />
            </div>
            <p>
              The invited person completes only the information needed for
              identity, work context, policy routing and access administration.
            </p>
            <div className={styles.contractGrid}>
              {ADMIN_STAFF_ONBOARDING_WORKFLOW.applicantForm.requiredFields.map((item) => (
                <div className={styles.contractItem} key={item}>✓ {item.replaceAll("-", " ")}</div>
              ))}
            </div>
          </article>

          <article className={styles.featureCard}>
            <div className={styles.featureTop}>
              <strong>3. Policy & role acceptance</strong>
              <StatusPill label="EVIDENCED" compact />
            </div>
            <p>
              HIISSA records the exact policy versions shown and the authenticated
              acceptance time. Different obligations are not hidden inside one
              vague checkbox.
            </p>
            <div className={styles.contractGrid}>
              {ADMIN_STAFF_ONBOARDING_WORKFLOW.policyAcceptance.commonPolicySet.map((item) => (
                <div className={styles.contractItem} key={item}>✓ {item}</div>
              ))}
            </div>
          </article>

          <article className={styles.featureCard}>
            <div className={styles.featureTop}>
              <strong>4. Founder review</strong>
              <StatusPill label="L3 APPROVAL" compact />
            </div>
            <p>
              Before activation, you see the verified identity, proposed role,
              requested environment, policy evidence, role checks, permission
              preview, denied boundaries and any warnings.
            </p>
            <div className={styles.featureMeta}>
              <span>APPROVE — proceed to controlled provisioning</span>
              <span>RETURN — send back for correction or missing evidence</span>
              <span>REJECT — close without granting access</span>
            </div>
          </article>

          <article className={styles.featureCard}>
            <div className={styles.featureTop}>
              <strong>5. Activation & verification</strong>
              <StatusPill label="NO PARTIAL SUCCESS" compact />
            </div>
            <p>
              Approval does not mean the job is finished. HIISSA must provision
              the intended role and environment, verify that allowed access works,
              verify denied boundaries stay denied, write the audit event, and
              only then confirm activation.
            </p>
            <div className={styles.contractGrid}>
              {ADMIN_STAFF_ONBOARDING_WORKFLOW.activation.order.map((item) => (
                <div className={styles.contractItem} key={item}>✓ {item}</div>
              ))}
            </div>
          </article>

          <article className={styles.featureCard}>
            <div className={styles.featureTop}>
              <strong>6. Review, suspension & offboarding</strong>
              <StatusPill label="ACCESS MUST END SAFELY" compact />
            </div>
            <p>
              Access is reviewed while the person works with HIISSA and must be
              reduced, suspended or removed when their duties or authorisation
              change. Removal is verified rather than assumed.
            </p>
            <div className={styles.contractGrid}>
              {ADMIN_STAFF_ONBOARDING_WORKFLOW.offboarding.actions.map((item) => (
                <div className={styles.contractItem} key={item}>✓ {item}</div>
              ))}
            </div>
          </article>
        </div>

        <div className={styles.emptyState}>
          No invitation, approval, provisioning, suspension or offboarding button
          on this preview can change access. Real actions remain disabled until
          their security, audit, notification and rollback paths are separately
          implemented and certified in Staging.
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeading}>
          <div>
            <div className={styles.kicker}>CURRENT ASSIGNMENTS</div>
            <h3>Active role assignments</h3>
          </div>
        </div>

        {(summary?.activeRoleAssignments || []).length === 0 ? (
          <div className={styles.emptyState}>
            No newer role assignments are active yet. Your current Founder/Admin
            access is still being recognised through the existing protected Admin gate.
          </div>
        ) : (
          <div className={styles.feedbackList}>
            {summary.activeRoleAssignments.map((item, index) => (
              <article className={styles.feedbackItem} key={`${item.role_id}-${item.assigned_at}-${index}`}>
                <div className={styles.featureMeta}>
                  <span>{item.environment || "unknown environment"}</span>
                  <span>ACTIVE</span>
                </div>
                <p><strong>{item.role_id.replaceAll("_", " ")}</strong></p>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeading}>
          <div>
            <div className={styles.kicker}>RECENT AUDIT</div>
            <h3>Recent Admin security activity</h3>
          </div>
        </div>

        {(summary?.recentAuditEvents || []).length === 0 ? (
          <div className={styles.emptyState}>
            No events have yet been written to the newer Admin audit foundation.
          </div>
        ) : (
          <div className={styles.feedbackList}>
            {summary.recentAuditEvents.map((event, index) => (
              <article className={styles.feedbackItem} key={`${event.occurred_at}-${index}`}>
                <div className={styles.featureMeta}>
                  <span>{event.environment || "unknown environment"}</span>
                  <span>{event.outcome || "unknown outcome"}</span>
                  {event.oversight_level != null ? <span>L{event.oversight_level}</span> : null}
                </div>
                <p>
                  <strong>{event.event_type || "Admin event"}</strong>
                  {event.action_id ? ` — ${event.action_id}` : ""}
                </p>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className={styles.detailBlueprint}>
        <div className={styles.kicker}>MODULE 10 OPERATIONAL DETAIL</div>
        <div>ACCESS MODEL<span>Deny by default</span></div>
        <div>SELF-GRANT<span>Blocked</span></div>
        <div>L3 SENSITIVE ACTIONS<span>Founder approval required</span></div>
        <div>PRODUCTION CHANGES<span>Not enabled from this Staging module</span></div>
        <div>STAFF MANAGEMENT<span>Read-only now; controlled dashboard actions come after certification</span></div>
      </section>
    </>
  );
}

function WorkingStaffApprovalInbox() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadQueue() {
    if (!adminDataClient) {
      setError("Protected Admin data connection is unavailable in this environment.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const {
        data: { session },
      } = await adminDataClient.auth.getSession();

      if (!session?.access_token) {
        setError("Sign in to the authorised Founder Admin session to load the working queue.");
        setLoading(false);
        return;
      }

      const response = await fetch("/api/admin/control-room/staff-approval-inbox", {
        method: "GET",
        cache: "no-store",
        credentials: "same-origin",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      const data = await response.json().catch(() => null);

      if (!response.ok || !data) {
        setError("The working Staging staff approval queue could not be loaded.");
        setLoading(false);
        return;
      }

      const nextItems = data.items || [];
      setItems(nextItems);
      setSelectedId((current) =>
        nextItems.some((item) => item.requestId === current)
          ? current
          : nextItems.find((item) => item.requestStatus === "pending")?.requestId ||
            nextItems[0]?.requestId ||
            ""
      );
      setLoading(false);
    } catch {
      setError("The working Staging staff approval queue could not be loaded.");
      setLoading(false);
    }
  }

  useEffect(() => {
    loadQueue();
  }, []);

  const selected =
    items.find((item) => item.requestId === selectedId) || items[0] || null;

  async function decide(decision) {
    if (!selected || selected.requestStatus !== "pending" || !adminDataClient) {
      return;
    }

    setBusy(decision);
    setMessage("");
    setError("");

    try {
      const {
        data: { session },
      } = await adminDataClient.auth.getSession();

      if (!session?.access_token) {
        setError("Founder Admin session is no longer available.");
        setBusy("");
        return;
      }

      const response = await fetch("/api/admin/control-room/staff-approval-inbox", {
        method: "POST",
        cache: "no-store",
        credentials: "same-origin",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          requestId: selected.requestId,
          decision,
          note,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok || !data) {
        setError(
          data?.status === "APPROVAL_REQUEST_NOT_PENDING"
            ? "This submission has already moved from the pending state. Refresh the queue."
            : "The Founder decision could not be recorded."
        );
        setBusy("");
        return;
      }

      setMessage(
        decision === "approve"
          ? "Founder decision recorded: APPROVED PENDING EXECUTION. No external action occurred."
          : decision === "return_for_changes"
            ? "Founder decision recorded: RETURNED FOR CHANGES. The same work item is available to the staff workspace."
            : "Founder decision recorded: REJECTED. No external action occurred."
      );
      setNote("");
      setBusy("");
      await loadQueue();
    } catch {
      setError("The Founder decision could not be recorded.");
      setBusy("");
    }
  }

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeading}>
        <div>
          <div className={styles.kicker}>FOUNDER COMMAND / APPROVAL INBOX — WORKING STAGING QUEUE</div>
          <h3>Human staff submissions</h3>
        </div>
        <StatusPill
          label={
            loading
              ? "LOADING"
              : `${items.filter((item) => item.requestStatus === "pending").length} PENDING`
          }
          compact
        />
      </div>

      <p className={styles.sectionCopy}>
        This is the working Staging path for the Universal Founder Submission Gate.
        It reads the same canonical approval record created by the Customer Support
        workspace. Approve, Return for Changes and Reject now persist in Staging.
        Approval still does not send a customer message or count as verified completion.
      </p>

      <div className={styles.prototypeDecisionActions}>
        <a className={styles.prototypeSecondary} href="/staff-workspace-preview">
          Open working Customer Support workspace →
        </a>
        <button
          type="button"
          className={styles.prototypeSecondary}
          onClick={loadQueue}
          disabled={loading || Boolean(busy)}
        >
          Refresh working queue
        </button>
      </div>

      {error ? (
        <section className={styles.errorPanel}>
          <strong>Needs attention</strong>
          <div>{error}</div>
        </section>
      ) : null}

      {message ? (
        <div className={styles.prototypeSuccess}>
          <strong>{message}</strong>
        </div>
      ) : null}

      {!loading && items.length === 0 ? (
        <div className={styles.emptyState}>
          No persistent staff submissions exist yet. Submit a draft from the
          working Customer Support workspace and it will appear here.
        </div>
      ) : null}

      {items.length > 0 ? (
        <div className={styles.approvalInboxLayout}>
          <div className={styles.approvalQueue}>
            {items.map((item) => (
              <button
                type="button"
                key={item.requestId}
                className={
                  selected?.requestId === item.requestId
                    ? styles.approvalQueueActive
                    : styles.approvalQueueItem
                }
                onClick={() => {
                  setSelectedId(item.requestId);
                  setNote("");
                  setMessage("");
                }}
              >
                <span className={styles.approvalQueueStatus}>
                  {String(item.requestStatus || "unknown").replaceAll("_", " ").toUpperCase()}
                </span>
                <strong>{item.title}</strong>
                <small>{item.caseCode} · Customer Support</small>
                <time
                  className={styles.approvalQueueTime}
                  dateTime={item.submittedAt || item.createdAt || undefined}
                  title={formatHiissaFullRecordTime(item.submittedAt || item.createdAt)}
                >
                  {formatHiissaRecordTime(item.submittedAt || item.createdAt)}
                </time>
              </button>
            ))}
          </div>

          {selected ? (
            <div className={styles.prototypePanel}>
              <div className={styles.prototypeHeading}>
                <div>
                  <div className={styles.kicker}>FOUNDER DECISION PACK · PERSISTENT STAGING RECORD</div>
                  <h4>{selected.title}</h4>
                </div>
                <StatusPill
                  label={String(selected.requestStatus).replaceAll("_", " ").toUpperCase()}
                  compact
                />
              </div>

              <div className={styles.prototypeReviewGrid}>
                <InfoCard
                  title="PREPARED BY"
                  value={selected.preparedBy}
                  detail="Authenticated Staging actor mode"
                />
                <InfoCard
                  title="CASE"
                  value={selected.caseCode}
                  detail="Canonical staff work record"
                />
              </div>

              <div className={styles.recordTimeGrid}>
                <div>
                  <span>Approval record created</span>
                  <strong title={formatHiissaFullRecordTime(selected.createdAt)}>
                    {formatHiissaRecordTime(selected.createdAt)}
                  </strong>
                </div>
                <div>
                  <span>Submitted for processing</span>
                  <strong title={formatHiissaFullRecordTime(selected.submittedAt)}>
                    {formatHiissaRecordTime(selected.submittedAt)}
                  </strong>
                </div>
                {selected.returnedAt ? (
                  <div>
                    <span>Returned for changes</span>
                    <strong title={formatHiissaFullRecordTime(selected.returnedAt)}>
                      {formatHiissaRecordTime(selected.returnedAt)}
                    </strong>
                  </div>
                ) : null}
                {selected.approvedAt ? (
                  <div>
                    <span>Founder approved</span>
                    <strong title={formatHiissaFullRecordTime(selected.approvedAt)}>
                      {formatHiissaRecordTime(selected.approvedAt)}
                    </strong>
                  </div>
                ) : null}
                {selected.resolvedAt ? (
                  <div>
                    <span>Approval request resolved</span>
                    <strong title={formatHiissaFullRecordTime(selected.resolvedAt)}>
                      {formatHiissaRecordTime(selected.resolvedAt)}
                    </strong>
                  </div>
                ) : null}
              </div>

              <div className={styles.prototypeReviewBlock}>
                <strong>Prepared response</strong>
                <p>{selected.draftResponse || "No draft response available."}</p>
              </div>

              {selected.internalNote ? (
                <div className={styles.prototypeReviewBlock}>
                  <strong>Internal staff note</strong>
                  <p>{selected.internalNote}</p>
                </div>
              ) : null}

              <div className={styles.decisionPack}>
                <div><strong>What is being requested?</strong><p>{selected.decisionPack.request}</p></div>
                <div><strong>Why?</strong><p>{selected.decisionPack.reason}</p></div>
                <div><strong>Who or what may be affected?</strong><p>{selected.decisionPack.affected}</p></div>
                <div><strong>Risk / warning</strong><p>{selected.decisionPack.risk}</p></div>
                <div><strong>Authorised evidence</strong><p>{selected.decisionPack.evidence}</p></div>
                <div><strong>What has HIISSA already checked?</strong><p>{selected.decisionPack.checked}</p></div>
                <div><strong>What changes if I approve?</strong><p>{selected.decisionPack.approvedEffect}</p></div>
                <div><strong>Can it be reversed?</strong><p>{selected.decisionPack.reversible}</p></div>
                <div><strong>What happens if I reject?</strong><p>{selected.decisionPack.rejectedEffect}</p></div>
                <div><strong>HIISSA recommendation</strong><p>{selected.decisionPack.recommendation}</p></div>
              </div>

              {selected.requestStatus === "pending" ? (
                <>
                  <label className={styles.prototypeField}>
                    <span>Founder decision note</span>
                    <textarea
                      value={note}
                      onChange={(event) => setNote(event.target.value)}
                      rows={3}
                      placeholder="Optional instruction or reason"
                    />
                  </label>

                  <div className={styles.prototypeDecisionActions}>
                    <button
                      type="button"
                      className={styles.prototypeApprove}
                      onClick={() => decide("approve")}
                      disabled={Boolean(busy)}
                    >
                      {busy === "approve" ? "Recording…" : "Approve"}
                    </button>
                    <button
                      type="button"
                      className={styles.prototypeReturn}
                      onClick={() => decide("return_for_changes")}
                      disabled={Boolean(busy)}
                    >
                      {busy === "return_for_changes" ? "Returning…" : "Return for Changes"}
                    </button>
                    <button
                      type="button"
                      className={styles.prototypeReject}
                      onClick={() => decide("reject")}
                      disabled={Boolean(busy)}
                    >
                      {busy === "reject" ? "Rejecting…" : "Reject"}
                    </button>
                  </div>
                </>
              ) : (
                <div className={styles.prototypeReviewBlock}>
                  <strong>Recorded outcome</strong>
                  <p>
                    {String(selected.requestStatus).replaceAll("_", " ").toUpperCase()}.
                    No external customer action or Production effect occurred.
                  </p>
                  {selected.founderNote ? (
                    <p><strong>Founder note:</strong> {selected.founderNote}</p>
                  ) : null}
                </div>
              )}

              <div className={styles.featureMeta}>
                <span>ONE CANONICAL APPROVAL RECORD</span>
                <span>STAFF SELF-APPROVAL BLOCKED</span>
                <span>APPROVAL ≠ VERIFIED COMPLETION</span>
                <span>EXTERNAL EXECUTION DISABLED</span>
                <span>PRODUCTION EFFECT: NONE</span>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      <div className={styles.prototypeReviewBlock}>
        <strong>Continuity note</strong>
        <p>
          The earlier local-only approval prototype remains preserved in source and
          continuity records for governance history, but it is not shown as a second
          Founder inbox. This working queue is the one visible persistent Staging inbox.
        </p>
      </div>
    </section>
  );
}

function FounderApprovalInboxPrototype() {
  const items = [
    {
      id: "support-reply",
      title: "Customer Support reply",
      module: "Customer Support / Feedback & Recommendations",
      preparedBy: "Sample Customer Support Worker",
      request: "Send a prepared response to a customer support enquiry.",
      reason: "The customer asked for help and a human response is ready.",
      affected: "One customer and the related support case.",
      risk: "The response leaves HIISSA and becomes an external communication.",
      evidence: "Sample support case summary and draft response — fictional prototype data only.",
      checked: "Role boundary present; no private unrelated conversation content included; no access expansion requested.",
      approvedEffect: "Move the sample response to a controlled send stage.",
      reversible: "The send itself cannot be unsent; correction/follow-up would require a new attributable action.",
      rejectedEffect: "Nothing is sent. The sample proposal closes as rejected.",
      recommendation: "Review wording and context before approving an external response.",
    },
    {
      id: "access-change",
      title: "Staff access change",
      module: "Admin Security & Audit",
      preparedBy: "Sample Technical Operations Worker",
      request: "Reduce a sample worker from Product & Quality to Customer Support scope.",
      reason: "The sample worker's duties have changed.",
      affected: "One fictional Admin identity and its permitted Control Room scope.",
      risk: "Incorrect scope could either over-grant or remove access needed for work.",
      evidence: "Prototype role-change request and current-role summary only.",
      checked: "Self-grant blocked; Founder role excluded; Production authority not included.",
      approvedEffect: "Authorise a later controlled re-provisioning and denied-boundary verification stage.",
      reversible: "A later approved role change can restore appropriate scope; audit history remains.",
      rejectedEffect: "Existing sample role remains unchanged.",
      recommendation: "Approve only after the intended duties and permission preview match.",
    },
  ];
  const [selectedId, setSelectedId] = useState(items[0].id);
  const [decision, setDecision] = useState("");
  const [note, setNote] = useState("");
  const selected = items.find((item) => item.id === selectedId) || items[0];

  function decide(nextDecision) {
    setDecision(nextDecision);
  }

  function reset() {
    setDecision("");
    setNote("");
  }

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeading}>
        <div>
          <div className={styles.kicker}>FOUNDER COMMAND / APPROVAL INBOX — SIMULATION ONLY</div>
          <h3>Needs Your Approval</h3>
        </div>
        <StatusPill label="NO REAL ACTIONS" compact />
      </div>

      <p className={styles.sectionCopy}>
        This is the shared Founder queue for completed human staff submissions.
        Staff can prepare work inside their authorised role, but “Submit for
        processing” routes the finished work here before final execution. These
        two items are fictional test examples only. No customer message, access
        change, payment, publication or Production action can occur from this prototype.
      </p>

      <div className={styles.prototypeDecisionActions}>
        <a
          className={styles.prototypeSecondary}
          href="/staff-workspace-preview"
        >
          Open fictional Customer Support workspace →
        </a>
      </div>

      <div className={styles.approvalInboxLayout}>
        <div className={styles.approvalQueue}>
          {items.map((item) => (
            <button
              type="button"
              key={item.id}
              className={selectedId === item.id ? styles.approvalQueueActive : styles.approvalQueueItem}
              onClick={() => {
                setSelectedId(item.id);
                reset();
              }}
            >
              <span className={styles.approvalQueueStatus}>PENDING · FICTIONAL</span>
              <strong>{item.title}</strong>
              <small>{item.module}</small>
            </button>
          ))}
        </div>

        <div className={styles.prototypePanel}>
          <div className={styles.prototypeHeading}>
            <div>
              <div className={styles.kicker}>FOUNDER DECISION PACK</div>
              <h4>{selected.title}</h4>
            </div>
            <StatusPill label={decision || "PENDING"} compact />
          </div>

          <div className={styles.prototypeReviewGrid}>
            <InfoCard title="PREPARED BY" value={selected.preparedBy} detail="Fictional prototype identity" />
            <InfoCard title="ORIGIN" value={selected.module} detail="Shared queue; one approval record in the live design" />
          </div>

          <div className={styles.decisionPack}>
            <div><strong>What is being requested?</strong><p>{selected.request}</p></div>
            <div><strong>Why?</strong><p>{selected.reason}</p></div>
            <div><strong>Who or what may be affected?</strong><p>{selected.affected}</p></div>
            <div><strong>Risk / warning</strong><p>{selected.risk}</p></div>
            <div><strong>Authorised evidence</strong><p>{selected.evidence}</p></div>
            <div><strong>What has HIISSA already checked?</strong><p>{selected.checked}</p></div>
            <div><strong>What changes if I approve?</strong><p>{selected.approvedEffect}</p></div>
            <div><strong>Can it be reversed?</strong><p>{selected.reversible}</p></div>
            <div><strong>What happens if I reject?</strong><p>{selected.rejectedEffect}</p></div>
            <div><strong>HIISSA recommendation</strong><p>{selected.recommendation}</p></div>
          </div>

          <label className={styles.prototypeField}>
            <span>Founder decision note (simulation)</span>
            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              rows={3}
              placeholder="Optional instruction or reason"
            />
          </label>

          <div className={styles.prototypeDecisionActions}>
            <button type="button" className={styles.prototypeApprove} onClick={() => decide("APPROVED PENDING EXECUTION")}>
              Approve
            </button>
            <button type="button" className={styles.prototypeReturn} onClick={() => decide("RETURNED FOR CHANGES")}>
              Return for Changes
            </button>
            <button type="button" className={styles.prototypeReject} onClick={() => decide("REJECTED")}>
              Reject
            </button>
          </div>

          {decision ? (
            <div className={styles.prototypeSuccess}>
              <strong>Simulated Founder decision: {decision}</strong>
              <p>
                No real consequential action occurred. In the live certified flow,
                approval would authorise the next controlled execution stage only;
                it would not be treated as verified completion.
              </p>
              {note ? <p><strong>Founder note:</strong> {note}</p> : null}
              <button type="button" className={styles.prototypeSecondary} onClick={reset}>
                Reset this simulation
              </button>
            </div>
          ) : null}
        </div>
      </div>

      <div className={styles.featureMeta}>
        <span>{UNIVERSAL_FOUNDER_SUBMISSION_GATE.staffSubmitLabel.toUpperCase()} → FOUNDER GATE</span>
        <span>ONE SHARED APPROVAL RECORD</span>
        <span>STAFF SELF-APPROVAL BLOCKED</span>
        <span>APPROVAL ≠ VERIFIED COMPLETION</span>
        <span>ATTRIBUTABLE AUDIT REQUIRED WHEN LIVE</span>
      </div>
    </section>
  );
}

function StaffAccessControlPrototype() {
  const [state, setState] = useState("ACTIVE");
  const [notice, setNotice] = useState("");

  function act(nextState, message) {
    setState(nextState);
    setNotice(message);
  }

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeading}>
        <div>
          <div className={styles.kicker}>FOUNDER STAFF ACCESS CONTROL — SIMULATION ONLY</div>
          <h3>Suspend, change or remove staff access</h3>
        </div>
        <StatusPill label="NO REAL ACCESS CHANGES" compact />
      </div>

      <p className={styles.sectionCopy}>
        This demonstrates the Founder control that will be available after a staff
        member is onboarded. The real control will be permission-gated, audited,
        step-up protected where appropriate, and verified after each change.
      </p>

      <div className={styles.prototypeReviewGrid}>
        <InfoCard title="TEST STAFF MEMBER" value="Sample Customer Support Worker" detail="Prototype identity only" />
        <InfoCard title="CURRENT ROLE" value="Customer Support" detail="Staging example" />
        <InfoCard title="ACCESS STATE" value={state.replaceAll("_", " ")} detail="Simulation only" />
        <InfoCard title="FOUNDER CONTROL" value="AVAILABLE IN DESIGN" detail="Real control not activated yet" />
      </div>

      <div className={styles.prototypeReviewBlock}>
        <strong>What each action means</strong>
        <p>
          Suspend = temporary lockout while you investigate. Change role = replace
          the person’s permitted role/scope without carrying old permissions forward.
          Remove access = end Admin eligibility and revoke active role/access grants.
        </p>
      </div>

      <div className={styles.prototypeDecisionActions}>
        <button
          type="button"
          className={styles.prototypeReturn}
          onClick={() => act("SUSPENDED", "Simulated suspension applied.")}
        >
          Simulate Suspend Access
        </button>
        <button
          type="button"
          className={styles.prototypeSecondary}
          onClick={() => act("ROLE_CHANGE_PENDING", "Simulated role change sent for controlled review.")}
        >
          Simulate Change Role
        </button>
        <button
          type="button"
          className={styles.prototypeReject}
          onClick={() => act("ACCESS_REMOVED", "Simulated Admin access removal completed.")}
        >
          Simulate Remove Access
        </button>
        <button
          type="button"
          className={styles.prototypePrimary}
          onClick={() => act("ACTIVE", "Prototype reset to active staff access.")}
        >
          Reset Simulation
        </button>
      </div>

      {notice ? (
        <div className={styles.prototypeSuccess}>
          <strong>{notice}</strong>
          <p>
            No real Admin Gate eligibility, session, role assignment or permission
            was changed. A live action must write audit evidence and verify the final access state.
          </p>
        </div>
      ) : null}

      <div className={styles.featureMeta}>
        {STAFF_ACCESS_SUSPENSION_AND_OFFBOARDING_STANDARD.suspensionMust.slice(0, 4).map((item) => (
          <span key={item}>{item.toUpperCase()}</span>
        ))}
      </div>
    </section>
  );
}

function StaffOnboardingPrototype({ roles }) {
  const policyItems = ADMIN_STAFF_ONBOARDING_WORKFLOW.policyAcceptance.commonPolicySet;
  const [step, setStep] = useState("invite");
  const [decisionNote, setDecisionNote] = useState("");
  const [invitationNotice, setInvitationNotice] = useState("");
  const [form, setForm] = useState({
    workEmail: "",
    proposedRole: "customer_support",
    department: "Customer Support",
    environment: "Staging",
    reason: "",
    legalName: "",
    preferredName: "",
    workPhone: "",
    jobTitle: "",
    jurisdiction: "",
    conflictDeclaration: "No conflict declared",
    supportNeeds: "",
  });
  const [acceptedPolicies, setAcceptedPolicies] = useState({});

  const allPoliciesAccepted =
    policyItems.length > 0 &&
    policyItems.every((item) => acceptedPolicies[item] === true);

  const inviteReady =
    form.workEmail.trim() &&
    form.proposedRole &&
    form.department.trim() &&
    form.environment &&
    form.reason.trim();

  const applicantReady =
    form.legalName.trim() &&
    form.workEmail.trim() &&
    form.jobTitle.trim() &&
    form.department.trim() &&
    form.jurisdiction.trim();

  const staffRoles = roles.filter((role) => role.id !== "founder");
  const roleLabel =
    staffRoles.find((role) => role.id === form.proposedRole)?.label ||
    form.proposedRole.replaceAll("_", " ");

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function resetPrototype() {
    setStep("invite");
    setDecisionNote("");
    setInvitationNotice("");
    setAcceptedPolicies({});
    setForm({
      workEmail: "",
      proposedRole: "customer_support",
      department: "Customer Support",
      environment: "Staging",
      reason: "",
      legalName: "",
      preferredName: "",
      workPhone: "",
      jobTitle: "",
      jurisdiction: "",
      conflictDeclaration: "No conflict declared",
      supportNeeds: "",
    });
  }

  const stepLabels = [
    ["invite", "1 Prepare"],
    ["invitePreview", "2 Preview"],
    ["inviteSent", "3 Sent"],
    ["applicantWelcome", "4 Secure Entry"],
    ["applicant", "5 Applicant"],
    ["policies", "6 Policies"],
    ["applicantReview", "7 Review"],
    ["submitted", "8 Submitted"],
    ["review", "9 Founder Review"],
    ["activation", "10 Result"],
  ];

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeading}>
        <div>
          <div className={styles.kicker}>INTERACTIVE STAGING PROTOTYPE — NO REAL ACCESS CHANGES</div>
          <h3>Try the complete staff-onboarding journey</h3>
        </div>
        <StatusPill label="SIMULATION ONLY" compact />
      </div>

      <p className={styles.sectionCopy}>
        Use this prototype to test the journey as a Founder. It does not send a
        real invitation, create an Admin account, change the Admin Gate, assign a
        real role or write a real approval.
      </p>

      <div className={styles.prototypeSteps} aria-label="Onboarding prototype steps">
        {stepLabels.map(([id, label]) => (
          <span
            className={step === id ? styles.prototypeStepActive : styles.prototypeStep}
            key={id}
          >
            {label}
          </span>
        ))}
      </div>

      {step === "invite" ? (
        <div className={styles.prototypePanel}>
          <div className={styles.prototypeHeading}>
            <div>
              <div className={styles.kicker}>FOUNDER SIDE</div>
              <h4>Invite Staff Member</h4>
            </div>
            <StatusPill label="DOES NOT SEND" compact />
          </div>

          <div className={styles.prototypeFormGrid}>
            <label className={styles.prototypeField}>
              <span>Work email</span>
              <input
                type="email"
                value={form.workEmail}
                onChange={(event) => update("workEmail", event.target.value)}
                placeholder="name@company.com"
              />
            </label>

            <label className={styles.prototypeField}>
              <span>Proposed role</span>
              <select
                value={form.proposedRole}
                onChange={(event) => update("proposedRole", event.target.value)}
              >
                {(staffRoles.length ? staffRoles : [
                  { id: "customer_support", label: "Customer Support" },
                  { id: "technical_operations", label: "Technical Operations" },
                ]).map((role) => (
                  <option value={role.id} key={role.id}>{role.label}</option>
                ))}
              </select>
            </label>

            <label className={styles.prototypeField}>
              <span>Department or function</span>
              <input
                value={form.department}
                onChange={(event) => update("department", event.target.value)}
              />
            </label>

            <label className={styles.prototypeField}>
              <span>Environment</span>
              <select
                value={form.environment}
                onChange={(event) => update("environment", event.target.value)}
              >
                <option>Staging</option>
                <option disabled>Production — separate authority required</option>
              </select>
            </label>

            <label className={styles.prototypeField + " " + styles.prototypeFieldWide}>
              <span>Reason for access</span>
              <textarea
                value={form.reason}
                onChange={(event) => update("reason", event.target.value)}
                placeholder="Why does this person need this role?"
                rows={3}
              />
            </label>
          </div>

          <div className={styles.prototypeSafetyNote}>
            This would create an invitation request only. It would not place the
            person through the Admin Gate.
          </div>

          <div className={styles.prototypeActions}>
            <button
              type="button"
              className={styles.prototypePrimary}
              disabled={!inviteReady}
              onClick={() => setStep("invitePreview")}
            >
              Review invitation →
            </button>
          </div>
        </div>
      ) : null}

      {step === "invitePreview" ? (
        <div className={styles.prototypePanel}>
          <div className={styles.prototypeHeading}>
            <div>
              <div className={styles.kicker}>FOUNDER INVITATION PREVIEW</div>
              <h4>Review before sending</h4>
            </div>
            <StatusPill label="NOT SENT" compact />
          </div>

          <div className={styles.prototypeReviewGrid}>
            <InfoCard title="TO" value={form.workEmail} detail="Proposed staff recipient" />
            <InfoCard title="PROPOSED ROLE" value={roleLabel} detail={form.department} />
            <InfoCard title="ENVIRONMENT" value={form.environment} detail="No Production authority is included." />
            <InfoCard title="INVITED BY" value="HIISSA Founder" detail="Invitation alone grants no Admin access." />
          </div>

          <div className={styles.prototypeReviewBlock}>
            <strong>Invitation email preview</strong>
            <p><strong>You’ve been invited to complete HIISSA staff onboarding</strong></p>
            <p>
              You have been invited to apply for authorised HIISSA Administration
              access as <strong>{roleLabel}</strong>. This invitation does not give
              you Admin access. You must verify your identity, complete the required
              onboarding information, review and accept the policies that apply to
              your role, and complete any required checks. Your application will
              then be reviewed by the HIISSA Founder before any access can become active.
            </p>
            <p>
              <strong>Secure invitation expiry:</strong> the live system will show
              the exact expiry date and time here.
            </p>
          </div>

          <div className={styles.prototypeSafetyNote}>
            This is a preview only. The button below simulates sending and cannot
            send an email, create an account or change Admin access.
          </div>

          <div className={styles.prototypeActions}>
            <button type="button" className={styles.prototypeSecondary} onClick={() => setStep("invite")}>
              ← Edit invitation
            </button>
            <button
              type="button"
              className={styles.prototypePrimary}
              onClick={() => {
                setInvitationNotice("Simulated invitation sent successfully.");
                setStep("inviteSent");
              }}
            >
              Simulate Send Secure Invitation →
            </button>
          </div>
        </div>
      ) : null}

      {step === "inviteSent" ? (
        <div className={styles.prototypePanel}>
          <div className={styles.prototypeHeading}>
            <div>
              <div className={styles.kicker}>INVITATION STATUS — SIMULATION</div>
              <h4>Invitation prepared and simulated as sent</h4>
            </div>
            <StatusPill label="NO REAL EMAIL SENT" compact />
          </div>

          <div className={styles.prototypeReviewGrid}>
            <InfoCard title="RECIPIENT" value={form.workEmail} detail="Simulation only" />
            <InfoCard title="ROLE" value={roleLabel} detail={form.department} />
            <InfoCard title="SEND STATUS" value="SIMULATED SENT" detail="No external message was transmitted." />
            <InfoCard title="DELIVERY STATUS" value="SIMULATED DELIVERED" detail="Live delivery evidence will come from the email provider." />
          </div>

          <div className={styles.prototypeReviewBlock}>
            <strong>Applicant journey status</strong>
            <p>
              In the live system this area will show Sent, Delivered, Opened,
              Started, Expired or Revoked using verified evidence. The secure
              onboarding link will be single-purpose, time-bounded and revocable.
            </p>
          </div>

          {invitationNotice ? (
            <div className={styles.prototypeSuccess}>
              <strong>{invitationNotice}</strong>
              <p>No real email, Admin account, role assignment or access change occurred.</p>
            </div>
          ) : null}

          <div className={styles.prototypeDecisionActions}>
            <button
              type="button"
              className={styles.prototypePrimary}
              onClick={() => setStep("applicantWelcome")}
            >
              Open secure onboarding doorway →
            </button>
            <button
              type="button"
              className={styles.prototypeReturn}
              onClick={() => setInvitationNotice("Simulated invitation resent.")}
            >
              Simulate resend
            </button>
            <button
              type="button"
              className={styles.prototypeReject}
              onClick={() => setStep("inviteRevoked")}
            >
              Simulate revoke
            </button>
          </div>
        </div>
      ) : null}

      {step === "inviteRevoked" ? (
        <div className={styles.prototypePanel}>
          <div className={styles.prototypeHeading}>
            <div>
              <div className={styles.kicker}>INVITATION STATUS — SIMULATION</div>
              <h4>Invitation revoked</h4>
            </div>
            <StatusPill label="ADMIN GATE UNCHANGED" compact />
          </div>
          <div className={styles.prototypeSuccess}>
            <strong>Safe revoked state.</strong>
            <p>
              A live revoked invitation would stop that invitation from being used,
              record who revoked it and when, and would not grant any Admin access.
            </p>
          </div>
          <div className={styles.prototypeActions}>
            <button type="button" className={styles.prototypePrimary} onClick={resetPrototype}>
              Start prototype again
            </button>
          </div>
        </div>
      ) : null}

      {step === "applicantWelcome" ? (
        <div className={styles.prototypePanel}>
          <div className={styles.prototypeHeading}>
            <div>
              <div className={styles.kicker}>INVITED PERSON — SECURE ONBOARDING ENTRY</div>
              <h4>Welcome to HIISSA staff onboarding</h4>
            </div>
            <StatusPill label="ADMIN ACCESS NOT GRANTED" compact />
          </div>

          <div className={styles.prototypeReviewBlock}>
            <strong>You have been invited to complete onboarding for {roleLabel}.</strong>
            <p>
              This secure invitation gives access only to this onboarding journey.
              It does not give access to the HIISSA Admin Control Room. Your
              application must be completed, submitted and approved before any
              Admin access can become active.
            </p>
          </div>

          <div className={styles.prototypeReviewGrid}>
            <InfoCard title="INTENDED EMAIL" value={form.workEmail} detail="Would be verified in the live flow" />
            <InfoCard title="PROPOSED ROLE" value={roleLabel} detail={form.department} />
            <InfoCard title="JOURNEY STATUS" value="OPENED" detail="Simulation only" />
            <InfoCard title="SAVE & RESUME" value="SUPPORTED IN DESIGN" detail="Progress stays with this invitation" />
          </div>

          <div className={styles.prototypeReviewBlock}>
            <strong>Your onboarding checklist</strong>
            <p>{STAFF_SECURE_ONBOARDING_EXPERIENCE_STANDARD.checklist.join(" → ")}</p>
          </div>

          <div className={styles.prototypeSafetyNote}>
            A live version will verify that the person using the link is the intended
            invitee before protected onboarding information can continue.
          </div>

          <div className={styles.prototypeActions}>
            <button type="button" className={styles.prototypeSecondary} onClick={() => setStep("inviteSent")}>
              ← Back to invitation status
            </button>
            <button type="button" className={styles.prototypePrimary} onClick={() => setStep("applicant")}>
              Start onboarding →
            </button>
          </div>
        </div>
      ) : null}

      {step === "applicant" ? (
        <div className={styles.prototypePanel}>
          <div className={styles.prototypeHeading}>
            <div>
              <div className={styles.kicker}>INVITED PERSON SIDE</div>
              <h4>Complete HIISSA staff onboarding</h4>
            </div>
            <StatusPill label="MOCK FORM" compact />
          </div>

          <div className={styles.prototypeFormGrid}>
            <label className={styles.prototypeField}>
              <span>Legal or contractual name</span>
              <input value={form.legalName} onChange={(e) => update("legalName", e.target.value)} />
            </label>
            <label className={styles.prototypeField}>
              <span>Preferred display name</span>
              <input value={form.preferredName} onChange={(e) => update("preferredName", e.target.value)} />
            </label>
            <label className={styles.prototypeField}>
              <span>Verified work email</span>
              <input value={form.workEmail} readOnly />
            </label>
            <label className={styles.prototypeField}>
              <span>Work contact number</span>
              <input value={form.workPhone} onChange={(e) => update("workPhone", e.target.value)} />
            </label>
            <label className={styles.prototypeField}>
              <span>Job title / contractor function</span>
              <input value={form.jobTitle} onChange={(e) => update("jobTitle", e.target.value)} />
            </label>
            <label className={styles.prototypeField}>
              <span>Department / team</span>
              <input value={form.department} onChange={(e) => update("department", e.target.value)} />
            </label>
            <label className={styles.prototypeField}>
              <span>Country / working jurisdiction</span>
              <input value={form.jurisdiction} onChange={(e) => update("jurisdiction", e.target.value)} />
            </label>
            <label className={styles.prototypeField}>
              <span>Proposed role</span>
              <input value={roleLabel} readOnly />
            </label>
            <label className={styles.prototypeField + " " + styles.prototypeFieldWide}>
              <span>Conflict or access concern declaration</span>
              <textarea
                value={form.conflictDeclaration}
                onChange={(e) => update("conflictDeclaration", e.target.value)}
                rows={2}
              />
            </label>
            <label className={styles.prototypeField + " " + styles.prototypeFieldWide}>
              <span>Accessibility or onboarding support needs (optional)</span>
              <textarea
                value={form.supportNeeds}
                onChange={(e) => update("supportNeeds", e.target.value)}
                rows={2}
              />
            </label>
          </div>

          <div className={styles.prototypeActions}>
            <button type="button" className={styles.prototypeSecondary} onClick={() => setStep("applicantWelcome")}>
              ← Back
            </button>
            <button
              type="button"
              className={styles.prototypeReturn}
              onClick={() => setInvitationNotice("Simulated progress saved. You could safely resume later in the live journey.")}
            >
              Simulate Save & Resume
            </button>
            <button
              type="button"
              className={styles.prototypePrimary}
              disabled={!applicantReady}
              onClick={() => setStep("policies")}
            >
              Continue to policies →
            </button>
          </div>
          {invitationNotice?.startsWith("Simulated progress saved") ? (
            <div className={styles.prototypeSuccess}>
              <strong>{invitationNotice}</strong>
            </div>
          ) : null}
        </div>
      ) : null}

      {step === "policies" ? (
        <div className={styles.prototypePanel}>
          <div className={styles.prototypeHeading}>
            <div>
              <div className={styles.kicker}>POLICY ACCEPTANCE</div>
              <h4>Review and accept each required policy area</h4>
            </div>
            <StatusPill label="VERSION EVIDENCE REQUIRED LIVE" compact />
          </div>

          <p className={styles.sectionCopy}>
            In the real workflow, each item will open the current policy and record
            exactly which version was accepted. This prototype records nothing.
          </p>

          <div className={styles.prototypeChecklist}>
            {policyItems.map((item) => (
              <label className={styles.prototypeCheck} key={item}>
                <input
                  type="checkbox"
                  checked={acceptedPolicies[item] === true}
                  onChange={(event) =>
                    setAcceptedPolicies((current) => ({
                      ...current,
                      [item]: event.target.checked,
                    }))
                  }
                />
                <span>{item}</span>
              </label>
            ))}
          </div>

          <div className={styles.prototypeActions}>
            <button type="button" className={styles.prototypeSecondary} onClick={() => setStep("applicant")}>
              ← Back
            </button>
            <button
              type="button"
              className={styles.prototypePrimary}
              disabled={!allPoliciesAccepted}
              onClick={() => setStep("applicantReview")}
            >
              Review application →
            </button>
          </div>
        </div>
      ) : null}

      {step === "applicantReview" ? (
        <div className={styles.prototypePanel}>
          <div className={styles.prototypeHeading}>
            <div>
              <div className={styles.kicker}>INVITED PERSON — REVIEW APPLICATION</div>
              <h4>Check everything before submitting</h4>
            </div>
            <StatusPill label="NO ADMIN ACCESS YET" compact />
          </div>

          <div className={styles.prototypeReviewGrid}>
            <InfoCard title="NAME" value={form.preferredName || form.legalName} detail={form.workEmail} />
            <InfoCard title="ROLE" value={roleLabel} detail={form.department} />
            <InfoCard title="WORKING JURISDICTION" value={form.jurisdiction} detail="Used only where needed for policy routing" />
            <InfoCard title="POLICIES" value={policyItems.length + "/" + policyItems.length + " accepted"} detail="Simulation only" />
          </div>

          <div className={styles.prototypeReviewBlock}>
            <strong>Reason for access</strong>
            <p>{form.reason}</p>
          </div>

          <div className={styles.prototypeActions}>
            <button type="button" className={styles.prototypeSecondary} onClick={() => setStep("policies")}>
              ← Back to policies
            </button>
            <button type="button" className={styles.prototypePrimary} onClick={() => setStep("submitted")}>
              Submit for Founder Review →
            </button>
          </div>
        </div>
      ) : null}

      {step === "submitted" ? (
        <div className={styles.prototypePanel}>
          <div className={styles.prototypeHeading}>
            <div>
              <div className={styles.kicker}>APPLICANT STATUS — SIMULATION</div>
              <h4>Onboarding submitted successfully</h4>
            </div>
            <StatusPill label="AWAITING FOUNDER REVIEW" compact />
          </div>

          <div className={styles.prototypeSuccess}>
            <strong>Your HIISSA onboarding has been submitted successfully.</strong>
            <p>
              No Admin access has been granted yet. Your application is awaiting
              Founder review.
            </p>
          </div>

          <div className={styles.prototypeReviewBlock}>
            <strong>What the applicant would see next</strong>
            <p>
              Status can move through Submitted, Under Review, Returned for Changes,
              Approved Pending Activation, Access Active or Rejected. If returned,
              the applicant resumes from the relevant section instead of starting again.
            </p>
          </div>

          <div className={styles.prototypeActions}>
            <button type="button" className={styles.prototypePrimary} onClick={() => setStep("review")}>
              Switch to Founder Review →
            </button>
          </div>
        </div>
      ) : null}

      {step === "review" ? (
        <div className={styles.prototypePanel}>
          <div className={styles.prototypeHeading}>
            <div>
              <div className={styles.kicker}>FOUNDER REVIEW — L3</div>
              <h4>Review before any access could be activated</h4>
            </div>
            <StatusPill label="STEP-UP REQUIRED WHEN LIVE" compact />
          </div>

          <div className={styles.prototypeReviewGrid}>
            <InfoCard title="APPLICANT" value={form.preferredName || form.legalName} detail={form.workEmail} />
            <InfoCard title="ROLE" value={roleLabel} detail={form.department} />
            <InfoCard title="ENVIRONMENT" value={form.environment} detail="Production remains separate authority." />
            <InfoCard title="POLICIES" value={policyItems.length + "/" + policyItems.length + " accepted"} detail="Prototype only — no evidence written." />
          </div>

          <div className={styles.prototypeReviewBlock}>
            <strong>Reason for access</strong>
            <p>{form.reason}</p>
          </div>

          <div className={styles.prototypeReviewBlock}>
            <strong>Permission boundary preview</strong>
            <p>
              Proposed role receives only its authorised modules/actions. Founder
              authority is not inherited. Self-grant stays blocked. Specialist and
              NEVER ACCESS boundaries remain enforced.
            </p>
          </div>

          <label className={styles.prototypeField}>
            <span>Founder decision note (prototype)</span>
            <textarea
              value={decisionNote}
              onChange={(e) => setDecisionNote(e.target.value)}
              rows={3}
              placeholder="Optional reason or instruction"
            />
          </label>

          <div className={styles.prototypeDecisionActions}>
            <button
              type="button"
              className={styles.prototypeApprove}
              onClick={() => setStep("activation")}
            >
              Approve — simulate controlled provisioning
            </button>
            <button
              type="button"
              className={styles.prototypeReturn}
              onClick={() => setStep("applicantReview")}
            >
              Return for correction
            </button>
            <button
              type="button"
              className={styles.prototypeReject}
              onClick={() => setStep("rejected")}
            >
              Reject — no access
            </button>
          </div>
        </div>
      ) : null}

      {step === "activation" ? (
        <div className={styles.prototypePanel}>
          <div className={styles.prototypeHeading}>
            <div>
              <div className={styles.kicker}>SIMULATED ACTIVATION RESULT</div>
              <h4>What HIISSA must verify before saying “Access Active”</h4>
            </div>
            <StatusPill label="NO REAL CHANGE OCCURRED" compact />
          </div>

          <div className={styles.contractGrid}>
            {ADMIN_STAFF_ONBOARDING_WORKFLOW.activation.order.map((item) => (
              <div className={styles.contractItem} key={item}>✓ SIMULATED — {item}</div>
            ))}
          </div>

          <div className={styles.prototypeSuccess}>
            <strong>Prototype journey complete.</strong>
            <p>
              In a live certified workflow, HIISSA would only mark the person active
              after both allowed access and denied boundaries are verified. This
              prototype has changed nothing in the Admin Gate or role tables.
              A live successful activation would then send the applicant an access-active
              notice with secure Admin sign-in instructions.
            </p>
          </div>

          <div className={styles.prototypeActions}>
            <button type="button" className={styles.prototypePrimary} onClick={resetPrototype}>
              Start prototype again
            </button>
          </div>
        </div>
      ) : null}

      {step === "rejected" ? (
        <div className={styles.prototypePanel}>
          <div className={styles.prototypeHeading}>
            <div>
              <div className={styles.kicker}>SIMULATED DECISION</div>
              <h4>Application rejected — no access granted</h4>
            </div>
            <StatusPill label="ADMIN GATE UNCHANGED" compact />
          </div>
          <div className={styles.prototypeSuccess}>
            <strong>Safe failure state.</strong>
            <p>
              A live rejection would record the decision and close the request
              without provisioning Admin eligibility, role assignment or environment access.
            </p>
          </div>
          <div className={styles.prototypeActions}>
            <button type="button" className={styles.prototypePrimary} onClick={resetPrototype}>
              Start prototype again
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function InfoCard({ title, value, detail }) {
  return (
    <article className={styles.infoCard}>
      <div className={styles.infoTitle}>{title}</div>
      <strong>{value}</strong>
      <p>{detail}</p>
    </article>
  );
}

function StatusPill({ label, compact = false }) {
  return <span className={compact ? styles.pillCompact : styles.pill}>{label}</span>;
}
