"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import {
  formatHiissaFullRecordTime,
  formatHiissaRecordTime,
} from "../../../lib/hiissa-record-time.js";
import GentleCheckIn from "../../../components/people-experience/GentleCheckIn.js";
import WorkdayClose from "../../../components/people-experience/WorkdayClose.js";
import PrivateAppreciation from "../../../components/people-experience/PrivateAppreciation.js";
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
  FOUNDER_AI_PRODUCT_INTELLIGENCE_STANDARD,
  FOUNDER_ADMIN_SECURITY_AUDIT_STANDARD,
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
    find: "Accounts, identity and user access",
  },
  {
    id: CONTROL_ROOM_MODULES.subscriptionsAccess,
    label: "Subscriptions & Access",
    short: "Subscriptions",
    purpose: "Plans, entitlements, access and safe subscription administration.",
    find: "Customer plans, entitlements and access",
  },
  {
    id: CONTROL_ROOM_MODULES.feedbackRecommendations,
    label: "Feedback & Recommendations",
    short: "Feedback",
    purpose: "Private feedback, recommendations, public-review permission and improvement signals.",
    find: "Feedback, recommendations and public reviews",
  },
  {
    id: CONTROL_ROOM_MODULES.safetyPrivacyModeration,
    label: "Safety, Privacy & Moderation",
    short: "Safety & Privacy",
    purpose: "Safeguarding, privacy, consent, moderation and referral-integrity operations.",
    find: "Safeguarding, privacy and moderation",
  },
  {
    id: CONTROL_ROOM_MODULES.failuresReliability,
    label: "Failures & Reliability",
    short: "Failures",
    purpose: "Failures, impact, bounded recovery, verification and human action.",
    find: "What failed, recovery and verification",
  },
  {
    id: CONTROL_ROOM_MODULES.authSync,
    label: "Authentication & Sync Health",
    short: "Auth & Sync",
    purpose: "Authentication, continuity, Save & Sync and migration health without exposing secrets.",
    find: "Sign-in, Save & Sync and migration health",
  },
  {
    id: CONTROL_ROOM_MODULES.aiProduct,
    label: "HIISSA AI & Product Intelligence",
    short: "AI & Product",
    purpose: "Quality, language, experience and product intelligence without vulnerability-as-engagement.",
    find: "AI quality, evaluator and product health",
  },
  {
    id: CONTROL_ROOM_MODULES.systemOperations,
    label: "System & Operations",
    short: "System & Ops",
    purpose: "Environments, releases, providers, configuration health, jobs and readiness.",
    find: "Providers, runtime, usage and billing",
  },
  {
    id: CONTROL_ROOM_MODULES.adminSecurityAudit,
    label: "Admin Security & Audit",
    short: "Security & Audit",
    purpose: "Roles, permissions, sensitive actions, step-up and attributable audit.",
    find: "Roles, permissions, security and audit",
  },
];

const FEATURE_KEYS = [
  "peopleExperience",
  "guestSaveSync",
  "youngHiissa",
  "hiissaRest",
  "hiissaAlongside",
];

const FOUNDER_WORKSPACE_ROUTES = Object.freeze({
  customer_support: Object.freeze({
    href: "/staff-workspace-preview?founderReturn=staff",
    status: "WORKING STAGING",
    note: "Persistent Customer Support workflow and Founder submission gate are connected in Staging.",
  }),
  technical_operations: Object.freeze({
    href: "/staff-workspace-preview?workspace=technical_operations&founderReturn=staff",
    status: "STAGING BUILT · FOUNDER TESTING",
    note: "Founder-preview-only Technical Operations workspace is built in Staging for Founder testing. Production hibernation deployment, ordinary staff access and external execution remain separately gated.",
  }),
  finance_subscriptions: Object.freeze({
    href: "/staff-workspace-preview?workspace=finance_subscriptions&founderReturn=staff",
    status: "STAGING BUILT · FOUNDER TESTING",
    note: "Founder-preview-only Finance & Subscriptions workspace is built in Staging for Founder testing. Production hibernation deployment, real payment execution and ordinary staff access remain separately gated.",
  }),
  safety_safeguarding: Object.freeze({
    href: "/staff-workspace-preview?workspace=safety_safeguarding&founderReturn=staff",
    status: "STAGING BUILT · FOUNDER TESTING",
    note: "Founder-preview-only Safety & Safeguarding workspace is built in Staging for Founder testing. Production hibernation deployment, Exceptional Access and reserved emergency escalation remain separately gated.",
  }),
  privacy_data_protection: Object.freeze({
    href: "/staff-workspace-preview?workspace=privacy_data_protection&founderReturn=staff",
    status: "STAGING BUILT · FOUNDER TESTING",
    note: "Founder-preview-only Privacy & Data Protection workspace is built in Staging for Founder testing. Production hibernation deployment, real rights execution and ordinary staff access remain separately gated.",
  }),
  content_moderation: Object.freeze({
    href: "/staff-workspace-preview?workspace=content_moderation&founderReturn=staff",
    status: "STAGING BUILT · FOUNDER TESTING",
    note: "Founder-preview-only Content & Moderation workspace is built in Staging for Founder testing. Production hibernation deployment, real content action, publication and ordinary staff access remain separately gated.",
  }),
  product_quality: Object.freeze({
    href: "/staff-workspace-preview?workspace=product_quality&founderReturn=staff",
    status: "STAGING BUILT · FOUNDER TESTING",
    note: "Founder-preview-only Product & Quality workspace is built in Staging for Founder testing. Production hibernation deployment and release authority remain separately gated.",
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
  return String(value || "unknown")
    .replaceAll("-", " ")
    .replaceAll("_", " ")
    .toUpperCase();
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
            onOpenFailures={() =>
              chooseModule(CONTROL_ROOM_MODULES.failuresReliability)
            }
            onOpenSafetyPrivacy={() =>
              chooseModule(CONTROL_ROOM_MODULES.safetyPrivacyModeration)
            }
            onOpenAuthSync={() =>
              chooseModule(CONTROL_ROOM_MODULES.authSync)
            }
            onOpenAiProduct={() =>
              chooseModule(CONTROL_ROOM_MODULES.aiProduct)
            }
            onOpenSystemOperations={() =>
              chooseModule(CONTROL_ROOM_MODULES.systemOperations)
            }
            onOpenSecurityAudit={() =>
              chooseModule(CONTROL_ROOM_MODULES.adminSecurityAudit)
            }
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
                  <strong className={styles.navLabel}>{module.short}</strong>
                  <small className={styles.navHint}>
                    Find: {module.find || module.purpose}
                  </small>
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
                onOpenFailures={() =>
                  chooseModule(CONTROL_ROOM_MODULES.failuresReliability)
                }
                onOpenSafetyPrivacy={() =>
                  chooseModule(CONTROL_ROOM_MODULES.safetyPrivacyModeration)
                }
                onOpenAuthSync={() =>
                  chooseModule(CONTROL_ROOM_MODULES.authSync)
                }
                onOpenAiProduct={() =>
                  chooseModule(CONTROL_ROOM_MODULES.aiProduct)
                }
                onOpenSystemOperations={() =>
                  chooseModule(CONTROL_ROOM_MODULES.systemOperations)
                }
                onOpenSecurityAudit={() =>
                  chooseModule(CONTROL_ROOM_MODULES.adminSecurityAudit)
                }
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
        const [
          approvalResponse,
          securityResponse,
          peopleResponse,
          safetyPrivacyResponse,
          authSyncResponse,
          aiProductResponse,
          systemOperationsResponse,
        ] = await Promise.all([
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
          fetch("/api/admin/control-room/people-experience-health", {
            method: "GET",
            cache: "no-store",
            credentials: "same-origin",
            headers,
          }),
          fetch("/api/admin/control-room/safety-privacy-health", {
            method: "GET",
            cache: "no-store",
            credentials: "same-origin",
            headers,
          }),
          fetch("/api/admin/control-room/auth-sync-health", {
            method: "GET",
            cache: "no-store",
            credentials: "same-origin",
            headers,
          }),
          fetch("/api/admin/control-room/ai-product-health", {
            method: "GET",
            cache: "no-store",
            credentials: "same-origin",
            headers,
          }),
          fetch("/api/admin/control-room/system-operations-health", {
            method: "GET",
            cache: "no-store",
            credentials: "same-origin",
            headers,
          }),
        ]);

        const [
          approvalData,
          securityData,
          peopleData,
          safetyPrivacyData,
          authSyncData,
          aiProductData,
          systemOperationsData,
        ] = await Promise.all([
          approvalResponse.json().catch(() => null),
          securityResponse.json().catch(() => null),
          peopleResponse.json().catch(() => null),
          safetyPrivacyResponse.json().catch(() => null),
          authSyncResponse.json().catch(() => null),
          aiProductResponse.json().catch(() => null),
          systemOperationsResponse.json().catch(() => null),
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
        const peopleDisplayStatus =
          peopleResponse.ok && peopleData
            ? String(peopleData.displayHealthStatus || "")
            : "";
        const peopleAttention = [
          "NEEDS_ATTENTION",
          "DEGRADED",
          "UNAVAILABLE",
          "CRITICAL",
        ].includes(peopleDisplayStatus)
          ? 1
          : 0;
        const safetyPrivacyDisplayStatus =
          safetyPrivacyResponse.ok && safetyPrivacyData
            ? String(safetyPrivacyData.displayHealthStatus || "")
            : "";
        const safetyPrivacyAttention = [
          "NEEDS_ATTENTION",
          "DEGRADED",
          "UNAVAILABLE",
          "CRITICAL",
        ].includes(safetyPrivacyDisplayStatus)
          ? 1
          : 0;
        const authSyncDisplayStatus =
          authSyncResponse.ok && authSyncData
            ? String(authSyncData.displayHealthStatus || "")
            : "";
        const authSyncAttention = [
          "NEEDS_ATTENTION",
          "DEGRADED",
          "UNAVAILABLE",
          "CRITICAL",
        ].includes(authSyncDisplayStatus)
          ? 1
          : 0;
        const aiProductDisplayStatus =
          aiProductResponse.ok && aiProductData
            ? String(aiProductData.displayHealthStatus || "")
            : "";
        const aiProductAttention = [
          "NEEDS_ATTENTION",
          "DEGRADED",
          "UNAVAILABLE",
          "CRITICAL",
        ].includes(aiProductDisplayStatus)
          ? 1
          : 0;
        const systemOperationsDisplayStatus =
          systemOperationsResponse.ok && systemOperationsData
            ? String(systemOperationsData.displayHealthStatus || "")
            : "";
        const systemOperationsAttention = [
          "NEEDS_ATTENTION",
          "DEGRADED",
          "UNAVAILABLE",
          "CRITICAL",
        ].includes(systemOperationsDisplayStatus)
          ? 1
          : 0;

        const explicitCritical =
          Number(securityData?.criticalCount || 0) +
          Number(approvalData?.criticalCount || 0) +
          (peopleDisplayStatus === "CRITICAL" ? 1 : 0) +
          (safetyPrivacyDisplayStatus === "CRITICAL" ? 1 : 0) +
          (authSyncDisplayStatus === "CRITICAL" ? 1 : 0) +
          (aiProductDisplayStatus === "CRITICAL" ? 1 : 0) +
          (systemOperationsDisplayStatus === "CRITICAL" ? 1 : 0);
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
          attentionCount:
            Math.max(0, pendingApprovals) +
            securityAttention +
            peopleAttention +
            safetyPrivacyAttention +
            authSyncAttention +
            aiProductAttention +
            systemOperationsAttention,
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

  function openModuleSection(moduleId, sectionId) {
    onChooseModule(moduleId);

    window.setTimeout(() => {
      const target = document.getElementById(sectionId);
      if (!target) return;

      const reducedMotion = window.matchMedia?.(
        "(prefers-reduced-motion: reduce)"
      )?.matches;

      target.scrollIntoView({
        behavior: reducedMotion ? "auto" : "smooth",
        block: "start",
      });

      window.history.replaceState(
        window.history.state,
        "",
        `#${sectionId}`
      );
    }, 120);
  }

  function openPrimarySection(primaryId, sectionId) {
    onChoosePrimary(primaryId);

    window.setTimeout(() => {
      const target = document.getElementById(sectionId);
      if (!target) return;

      const reducedMotion = window.matchMedia?.(
        "(prefers-reduced-motion: reduce)"
      )?.matches;

      target.scrollIntoView({
        behavior: reducedMotion ? "auto" : "smooth",
        block: "start",
      });

      window.history.replaceState(
        window.history.state,
        "",
        `#${sectionId}`
      );
    }, 120);
  }

  const destinations = [
    { label: "Overview", detail: "Founder operational picture", action: () => onChoosePrimary("overview") },
    { label: "Staff & Workspaces", detail: "Departments, people and work contexts", action: () => onChoosePrimary("staff") },
    { label: "Approvals", detail: "Founder Command / Approval Inbox", action: () => onChoosePrimary("approvals") },
    {
      label: "Provider Health",
      detail: "System & Operations · live provider status, outages and attention",
      action: () =>
        openModuleSection(
          CONTROL_ROOM_MODULES.systemOperations,
          "module9-provider-health"
        ),
    },
    {
      label: "Usage & Billing",
      detail: "System & Operations · usage, capacity, billing sources and renewals",
      action: () =>
        openModuleSection(
          CONTROL_ROOM_MODULES.systemOperations,
          "module9-usage-billing"
        ),
    },
    {
      label: "Provider Register",
      detail: "System & Operations · everything HIISSA depends on",
      action: () =>
        openModuleSection(
          CONTROL_ROOM_MODULES.systemOperations,
          "module9-provider-register"
        ),
    },
    {
      label: "Historical Evidence",
      detail: "System & Operations · previously verified provider evidence",
      action: () =>
        openModuleSection(
          CONTROL_ROOM_MODULES.systemOperations,
          "module9-history"
        ),
    },
    {
      label: "Founder Action / Next Step",
      detail: "System & Operations · what needs you and what happens next",
      action: () =>
        openModuleSection(
          CONTROL_ROOM_MODULES.systemOperations,
          "module9-founder-action"
        ),
    },
    {
      label: "Security Health",
      detail: "Security & Audit · live access, permission and audit health",
      action: () =>
        openModuleSection(
          CONTROL_ROOM_MODULES.adminSecurityAudit,
          "module10-security-health"
        ),
    },
    {
      label: "Roles & Permissions",
      detail: "Security & Audit · roles, permission rules and assignments",
      action: () =>
        openModuleSection(
          CONTROL_ROOM_MODULES.adminSecurityAudit,
          "module10-roles-permissions"
        ),
    },
    {
      label: "Approvals & Sensitive Actions",
      detail: "Security & Audit · Founder gate and L3 sensitive actions",
      action: () =>
        openModuleSection(
          CONTROL_ROOM_MODULES.adminSecurityAudit,
          "module10-approvals"
        ),
    },
    {
      label: "Staff Access & Onboarding",
      detail: "Security & Audit · staff access lifecycle and onboarding",
      action: () =>
        openModuleSection(
          CONTROL_ROOM_MODULES.adminSecurityAudit,
          "module10-staff-access"
        ),
    },
    {
      label: "Audit Trail",
      detail: "Security & Audit · attributable Admin activity",
      action: () =>
        openModuleSection(
          CONTROL_ROOM_MODULES.adminSecurityAudit,
          "module10-audit"
        ),
    },
    {
      label: "Exceptional Access & Break-Glass",
      detail: "Security & Audit · reserved exceptional access boundaries",
      action: () =>
        openModuleSection(
          CONTROL_ROOM_MODULES.adminSecurityAudit,
          "module10-exceptional-access"
        ),
    },

    {
      label: "Safety Support Health",
      detail: "Safety, Privacy & Moderation · protection-boundary operational health",
      action: () =>
        openModuleSection(
          CONTROL_ROOM_MODULES.safetyPrivacyModeration,
          "module5-health"
        ),
    },
    {
      label: "Safety boundary events",
      detail: "Safety, Privacy & Moderation · recent privacy-safe boundary activity",
      action: () =>
        openModuleSection(
          CONTROL_ROOM_MODULES.safetyPrivacyModeration,
          "module5-boundary-events"
        ),
    },
    {
      label: "Privacy & Consent health",
      detail: "Safety, Privacy & Moderation · privacy and consent monitoring boundaries",
      action: () =>
        openModuleSection(
          CONTROL_ROOM_MODULES.safetyPrivacyModeration,
          "module5-privacy-consent"
        ),
    },
    {
      label: "Safety evidence integrity",
      detail: "Safety, Privacy & Moderation · evidence preservation and authorised review boundary",
      action: () =>
        openModuleSection(
          CONTROL_ROOM_MODULES.safetyPrivacyModeration,
          "module5-evidence-integrity"
        ),
    },
    {
      label: "Reserved emergency escalation",
      detail: "Safety, Privacy & Moderation · police, emergency and exceptional access boundaries",
      action: () =>
        openModuleSection(
          CONTROL_ROOM_MODULES.safetyPrivacyModeration,
          "module5-reserved-escalation"
        ),
    },
    {
      label: "Safety & Privacy reliability",
      detail: "Failures & Reliability · safety, privacy and moderation operational conditions",
      action: () =>
        openModuleSection(
          CONTROL_ROOM_MODULES.failuresReliability,
          "module6-safety-privacy"
        ),
    },
    {
      label: "People Experience reliability",
      detail: "Failures & Reliability · People Experience operational failures and recovery",
      action: () =>
        openModuleSection(
          CONTROL_ROOM_MODULES.failuresReliability,
          "module6-people"
        ),
    },
    {
      label: "Authentication & Sync reliability",
      detail: "Failures & Reliability · identity, continuity and migration incidents",
      action: () =>
        openModuleSection(
          CONTROL_ROOM_MODULES.failuresReliability,
          "module6-auth-sync"
        ),
    },
    {
      label: "AI & Product reliability",
      detail: "Failures & Reliability · quality and regeneration incidents",
      action: () =>
        openModuleSection(
          CONTROL_ROOM_MODULES.failuresReliability,
          "module6-ai-product"
        ),
    },
    {
      label: "Provider reliability",
      detail: "Failures & Reliability · provider and infrastructure incidents",
      action: () =>
        openModuleSection(
          CONTROL_ROOM_MODULES.failuresReliability,
          "module6-system-operations"
        ),
    },
    {
      label: "Admin Security reliability",
      detail: "Failures & Reliability · access and audit integrity incidents",
      action: () =>
        openModuleSection(
          CONTROL_ROOM_MODULES.failuresReliability,
          "module6-admin-security"
        ),
    },
    {
      label: "Sign-in and identity health",
      detail: "Authentication & Sync · current identity health",
      action: () =>
        openModuleSection(
          CONTROL_ROOM_MODULES.authSync,
          "module7-health"
        ),
    },
    {
      label: "Save & Sync evidence",
      detail: "Authentication & Sync · persistence, migration and continuity evidence",
      action: () =>
        openModuleSection(
          CONTROL_ROOM_MODULES.authSync,
          "module7-evidence"
        ),
    },
    {
      label: "Authentication operating principles",
      detail: "Authentication & Sync · identity, Guest and migration boundaries",
      action: () =>
        openModuleSection(
          CONTROL_ROOM_MODULES.authSync,
          "module7-principles"
        ),
    },
    {
      label: "Feedback ratings",
      detail: "Feedback & Recommendations · rating distribution and aggregate feedback health",
      action: () =>
        openModuleSection(
          CONTROL_ROOM_MODULES.feedbackRecommendations,
          "module4-ratings"
        ),
    },
    {
      label: "Written feedback",
      detail: "Feedback & Recommendations · private written feedback",
      action: () =>
        openModuleSection(
          CONTROL_ROOM_MODULES.feedbackRecommendations,
          "module4-written-feedback"
        ),
    },
    {
      label: "Recommendations",
      detail: "Feedback & Recommendations · user ideas and improvements",
      action: () =>
        openModuleSection(
          CONTROL_ROOM_MODULES.feedbackRecommendations,
          "module4-recommendations"
        ),
    },
    {
      label: "Referral growth",
      detail: "Feedback & Recommendations · privacy-safe invitation attribution",
      action: () =>
        openModuleSection(
          CONTROL_ROOM_MODULES.feedbackRecommendations,
          "module4-referrals"
        ),
    },
    {
      label: "Public reviews",
      detail: "Feedback & Recommendations · separately permitted public wording",
      action: () =>
        openModuleSection(
          CONTROL_ROOM_MODULES.feedbackRecommendations,
          "module4-public-reviews"
        ),
    },
    {
      label: "AI Quality Evaluator",
      detail: "AI & Product · existing evaluator quality evidence",
      action: () =>
        openModuleSection(
          CONTROL_ROOM_MODULES.aiProduct,
          "module8-quality"
        ),
    },
    {
      label: "AI regeneration",
      detail: "AI & Product · bounded regeneration and recovery evidence",
      action: () =>
        openModuleSection(
          CONTROL_ROOM_MODULES.aiProduct,
          "module8-regeneration"
        ),
    },
    {
      label: "Language intelligence",
      detail: "AI & Product · language metadata and verification state",
      action: () =>
        openModuleSection(
          CONTROL_ROOM_MODULES.aiProduct,
          "module8-language"
        ),
    },
    {
      label: "AI product signals",
      detail: "AI & Product · aggregate feedback and product intelligence",
      action: () =>
        openModuleSection(
          CONTROL_ROOM_MODULES.aiProduct,
          "module8-product-signals"
        ),
    },
    {
      label: "Young HIISSA quality boundary",
      detail: "AI & Product · child-safety quality monitoring boundary",
      action: () =>
        openModuleSection(
          CONTROL_ROOM_MODULES.aiProduct,
          "module8-young-hiissa"
        ),
    },
    {
      label: "AI provider quality",
      detail: "AI & Product · provider quality correlation boundary",
      action: () =>
        openModuleSection(
          CONTROL_ROOM_MODULES.aiProduct,
          "module8-provider-quality"
        ),
    },
    {
      label: "AI Founder Action / Next Step",
      detail: "AI & Product · what happened, what HIISSA did and what happens next",
      action: () =>
        openModuleSection(
          CONTROL_ROOM_MODULES.aiProduct,
          "module8-founder-action"
        ),
    },
    {
      label: "Departments & staff workspaces",
      detail: "Staff & Workspaces · Founder doorway into departments",
      action: () => openPrimarySection("staff", "staff-departments"),
    },
    {
      label: "Private Appreciation",
      detail: "Staff & Workspaces · private recognition preview",
      action: () => openPrimarySection("staff", "staff-private-appreciation"),
    },
    {
      label: "Staff Directory",
      detail: "Staff & Workspaces · Founder-side people view",
      action: () => openPrimarySection("staff", "staff-directory"),
    },
    ...MODULES.filter((module) => module.id !== CONTROL_ROOM_MODULES.overview).map((module) => ({
      label: module.label,
      detail: module.find || module.purpose,
      action: () => onChooseModule(module.id),
    })),
    ...(STAFF_WORKSPACE_SHELL_STANDARD.workspaces || []).map((workspace) => ({
      label: workspace.label,
      detail: "Staff workspace",
      action: () => onChoosePrimary("staff"),
    })),
  ];

  const searchAliases = {
    Overview: "home summary dashboard status what is happening what needs me",
    "Staff & Workspaces": "staff employees people departments teams workplace workspaces",
    Approvals: "approve reject return decision inbox founder gate submissions",
    "Provider Health": "provider service outage down working supabase vercel resend openai cloudflare",
    "Usage & Billing": "cost spend payment bill billing money usage credit quota renewal subscription provider",
    "Provider Register": "services tools suppliers dependencies providers subscriptions",
    "Historical Evidence": "history previous evidence old provider checks",
    "Founder Action / Next Step": "what do i need to do next action founder attention",
    "Security Health": "security safe access permissions audit monitoring",
    "Roles & Permissions": "roles permissions who can do what access rights",
    "Approvals & Sensitive Actions": "sensitive l3 founder gate high risk approval",
    "Staff Access & Onboarding": "staff access onboarding invite employee add remove suspend staff member",
    "Audit Trail": "audit auditory history activity log who did what who changed something admin changes record",
    "Exceptional Access & Break-Glass": "emergency exceptional break glass high risk access",
    "People Experience reliability": "check in calmer start workday close people experience failure recovery",
    "Authentication & Sync reliability": "login sign in auth save sync migration identity failure",
    "AI & Product reliability": "ai quality evaluator regeneration failure product",
    "Provider reliability": "provider outage service down infrastructure failure",
    "Admin Security reliability": "security failure access audit problem",
    "Sign-in and identity health": "login sign in account identity authentication",
    "Save & Sync evidence": "save sync continue conversation persistence migration device cross device",
    "Authentication operating principles": "auth guest identity migration account rules",
    "Feedback ratings": "feedback rating stars helpful score",
    "Written feedback": "feedback comments private feedback what users said",
    Recommendations: "recommendation suggestions ideas improvements user ideas",
    "Referral growth": "referral invite recommendation share joins growth",
    "Public reviews": "reviews public permission testimonials",
    "AI Quality Evaluator": "ai quality evaluator pass fail responses",
    "AI regeneration": "retry regenerate ai recovery",
    "Language intelligence": "language multilingual french twi translation metadata",
    "AI product signals": "product intelligence feedback signals usage quality",
    "Young HIISSA quality boundary": "young hiissa child children youth safety quality",
    "AI provider quality": "model provider openai quality correlation",
    "AI Founder Action / Next Step": "ai founder action next step what do i need to do",
    "Departments & staff workspaces": "staff teams departments workspaces workplace employees",
    "Private Appreciation": "recognition appreciation thank staff praise",
    "Staff Directory": "staff directory people employees team member",
  };

  const normalised = query.trim().toLowerCase();
  const results = normalised
    ? destinations.filter((item) =>
        `${item.label} ${item.detail} ${searchAliases[item.label] || ""}`
          .toLowerCase()
          .includes(normalised)
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
        placeholder="Search modules, areas, departments or workspaces…"
        autoFocus
      />
      <p className={styles.searchHelp}>
        Use ordinary words — for example: staff access, audit/history, save and sync,
        payment, feedback or provider.
      </p>
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

function FounderAlertsPanel({
  authenticated,
  onClose,
  onOpenApprovals,
  onOpenFailures,
  onOpenSafetyPrivacy,
  onOpenAuthSync,
  onOpenAiProduct,
  onOpenSystemOperations,
  onOpenSecurityAudit,
}) {
  const [loading, setLoading] = useState(Boolean(authenticated));
  const [pending, setPending] = useState(null);
  const [securityStatus, setSecurityStatus] = useState(null);
  const [criticalCount, setCriticalCount] = useState(0);
  const [criticalMessage, setCriticalMessage] = useState("");
  const [peopleHealth, setPeopleHealth] = useState(null);
  const [safetyPrivacyHealth, setSafetyPrivacyHealth] = useState(null);
  const [authSyncHealth, setAuthSyncHealth] = useState(null);
  const [aiProductHealth, setAiProductHealth] = useState(null);
  const [systemOperationsHealth, setSystemOperationsHealth] = useState(null);

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
        const [
          approvalResponse,
          securityResponse,
          peopleResponse,
          safetyPrivacyResponse,
          authSyncResponse,
          aiProductResponse,
          systemOperationsResponse,
        ] = await Promise.all([
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
          fetch("/api/admin/control-room/people-experience-health", {
            method: "GET",
            cache: "no-store",
            credentials: "same-origin",
            headers,
          }),
          fetch("/api/admin/control-room/safety-privacy-health", {
            method: "GET",
            cache: "no-store",
            credentials: "same-origin",
            headers,
          }),
          fetch("/api/admin/control-room/auth-sync-health", {
            method: "GET",
            cache: "no-store",
            credentials: "same-origin",
            headers,
          }),
          fetch("/api/admin/control-room/ai-product-health", {
            method: "GET",
            cache: "no-store",
            credentials: "same-origin",
            headers,
          }),
          fetch("/api/admin/control-room/system-operations-health", {
            method: "GET",
            cache: "no-store",
            credentials: "same-origin",
            headers,
          }),
        ]);

        const [
          approvalData,
          securityData,
          peopleData,
          safetyPrivacyData,
          authSyncData,
          aiProductData,
          systemOperationsData,
        ] = await Promise.all([
          approvalResponse.json().catch(() => null),
          securityResponse.json().catch(() => null),
          peopleResponse.json().catch(() => null),
          safetyPrivacyResponse.json().catch(() => null),
          authSyncResponse.json().catch(() => null),
          aiProductResponse.json().catch(() => null),
          systemOperationsResponse.json().catch(() => null),
        ]);

        if (!active) return;

        if (approvalResponse.ok && approvalData) {
          setPending(Number(approvalData.pendingCount || 0));
        } else {
          setPending(null);
        }

        const securityCritical =
          securityResponse.ok && securityData
            ? Number(securityData.criticalCount || 0)
            : 0;
        const approvalCritical =
          approvalResponse.ok && approvalData
            ? Number(approvalData.criticalCount || 0)
            : 0;
        const peopleCritical =
          peopleResponse.ok &&
          String(peopleData?.displayHealthStatus || "") === "CRITICAL"
            ? 1
            : 0;
        const safetyPrivacyCritical =
          safetyPrivacyResponse.ok &&
          String(safetyPrivacyData?.displayHealthStatus || "") === "CRITICAL"
            ? 1
            : 0;
        const authSyncCritical =
          authSyncResponse.ok &&
          String(authSyncData?.displayHealthStatus || "") === "CRITICAL"
            ? 1
            : 0;
        const aiProductCritical =
          aiProductResponse.ok &&
          String(aiProductData?.displayHealthStatus || "") === "CRITICAL"
            ? 1
            : 0;
        const systemOperationsCritical =
          systemOperationsResponse.ok &&
          String(systemOperationsData?.displayHealthStatus || "") === "CRITICAL"
            ? 1
            : 0;

        if (securityResponse.ok && securityData) {
          setSecurityStatus(securityData.status || null);
          setCriticalMessage(securityData.criticalMessage || "");
        } else {
          setSecurityStatus(null);
          setCriticalMessage("");
        }

        setCriticalCount(
          Math.max(
            0,
            securityCritical +
              approvalCritical +
              peopleCritical +
              safetyPrivacyCritical +
              authSyncCritical +
              aiProductCritical +
              systemOperationsCritical
          )
        );

        if (peopleResponse.ok && peopleData) {
          setPeopleHealth(peopleData);
        } else {
          setPeopleHealth(null);
        }

        if (safetyPrivacyResponse.ok && safetyPrivacyData) {
          setSafetyPrivacyHealth(safetyPrivacyData);
        } else {
          setSafetyPrivacyHealth(null);
        }

        if (authSyncResponse.ok && authSyncData) {
          setAuthSyncHealth(authSyncData);
        } else {
          setAuthSyncHealth(null);
        }

        if (aiProductResponse.ok && aiProductData) {
          setAiProductHealth(aiProductData);
        } else {
          setAiProductHealth(null);
        }

        if (systemOperationsResponse.ok && systemOperationsData) {
          setSystemOperationsHealth(systemOperationsData);
        } else {
          setSystemOperationsHealth(null);
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
                    ? "A connected Admin Security source needs Founder attention. Open Security & Audit for the verified detail."
                    : "No connected Admin Security attention signal is currently reported."}
            </p>
          </div>
          {securityStatus ? (
            <button
              type="button"
              className={styles.alertAction}
              onClick={onOpenSecurityAudit}
            >
              Open Security & Audit →
            </button>
          ) : null}
        </article>

        <article
          className={
            ["NEEDS_ATTENTION", "DEGRADED", "UNAVAILABLE", "CRITICAL"].includes(
              String(peopleHealth?.displayHealthStatus || "")
            )
              ? styles.alertItemAttention
              : styles.alertItem
          }
        >
          <div>
            <strong>People Experience health</strong>
            <p>
              {loading
                ? "Checking the connected People Experience health source…"
                : !peopleHealth
                  ? "This source could not be confirmed right now."
                  : peopleHealth.displayHealthStatus === "HEALTHY"
                    ? "Gentle Check-In and Calmer Start currently have verified healthy evidence in the connected Staging window."
                    : peopleHealth.displayHealthStatus === "MONITORING"
                      ? "Monitoring is connected, but HIISSA is not claiming Healthy without enough verified care-delivery evidence."
                      : peopleHealth.founderView?.doINeedToAct ||
                        "A connected People Experience signal needs attention."}
            </p>
          </div>
          {peopleHealth ? (
            <button
              type="button"
              className={styles.alertAction}
              onClick={onOpenFailures}
            >
              Open Failures & Reliability →
            </button>
          ) : null}
        </article>

        <article
          className={
            ["NEEDS_ATTENTION", "DEGRADED", "UNAVAILABLE", "CRITICAL"].includes(
              String(safetyPrivacyHealth?.displayHealthStatus || "")
            )
              ? styles.alertItemAttention
              : styles.alertItem
          }
        >
          <div>
            <strong>Safety, Privacy & Moderation health</strong>
            <p>
              {loading
                ? "Checking the connected safety/privacy source…"
                : !safetyPrivacyHealth
                  ? "This source could not be confirmed right now."
                  : safetyPrivacyHealth.displayHealthStatus === "MONITORING"
                    ? "Boundary-event monitoring is connected. HIISSA does not claim all safety, consent, referral and partner pathways are Healthy from this source alone."
                    : safetyPrivacyHealth.founderView?.doINeedToAct ||
                      "A connected safety/privacy condition needs attention."}
            </p>
          </div>
          {safetyPrivacyHealth ? (
            <button
              type="button"
              className={styles.alertAction}
              onClick={onOpenSafetyPrivacy}
            >
              Open Safety, Privacy & Moderation →
            </button>
          ) : null}
        </article>

        <article
          className={
            ["NEEDS_ATTENTION", "DEGRADED", "UNAVAILABLE", "CRITICAL"].includes(
              String(authSyncHealth?.displayHealthStatus || "")
            )
              ? styles.alertItemAttention
              : styles.alertItem
          }
        >
          <div>
            <strong>Authentication & Sync health</strong>
            <p>
              {loading
                ? "Checking the connected Auth & Sync health source…"
                : !authSyncHealth
                  ? "This source could not be confirmed right now."
                  : authSyncHealth.displayHealthStatus === "MONITORING"
                    ? "Read-only Auth & Sync monitoring is connected. HIISSA is not claiming Healthy while failed-sign-in and deeper cross-device conflict telemetry are still being backfilled."
                    : authSyncHealth.founderView?.doINeedToAct ||
                      "A connected Auth & Sync signal needs attention."}
            </p>
          </div>
          {authSyncHealth ? (
            <button
              type="button"
              className={styles.alertAction}
              onClick={onOpenAuthSync}
            >
              Open Auth & Sync →
            </button>
          ) : null}
        </article>

        <article
          className={
            ["NEEDS_ATTENTION", "DEGRADED", "UNAVAILABLE", "CRITICAL"].includes(
              String(aiProductHealth?.displayHealthStatus || "")
            )
              ? styles.alertItemAttention
              : styles.alertItem
          }
        >
          <div>
            <strong>HIISSA AI & Product Intelligence</strong>
            <p>
              {loading
                ? "Checking the connected AI & Product intelligence source…"
                : !aiProductHealth
                  ? "This source could not be confirmed right now."
                  : aiProductHealth.displayHealthStatus === "MONITORING"
                    ? "Quality Evaluator evidence is connected and monitored. HIISSA does not claim full Healthy while approved language, regeneration-sequence and provider/model correlation telemetry remain partial."
                    : aiProductHealth.founderView?.doINeedToAct ||
                      "A connected AI & Product quality signal needs attention."}
            </p>
          </div>
          {aiProductHealth ? (
            <button
              type="button"
              className={styles.alertAction}
              onClick={onOpenAiProduct}
            >
              Open AI & Product →
            </button>
          ) : null}
        </article>

        <article
          className={
            ["NEEDS_ATTENTION", "DEGRADED", "UNAVAILABLE", "CRITICAL"].includes(
              String(systemOperationsHealth?.displayHealthStatus || "")
            )
              ? styles.alertItemAttention
              : styles.alertItem
          }
        >
          <div>
            <strong>System & Operations provider health</strong>
            <p>
              {loading
                ? "Checking the connected provider-health source…"
                : !systemOperationsHealth
                  ? "This source could not be confirmed right now."
                  : systemOperationsHealth.displayHealthStatus === "MONITORING"
                    ? "Connected provider health is being monitored. Missing billing/usage telemetry stays separate from provider outage status."
                    : systemOperationsHealth.founderView?.doINeedToAct ||
                      "A connected provider-health condition needs attention."}
            </p>
          </div>
          {systemOperationsHealth ? (
            <button
              type="button"
              className={styles.alertAction}
              onClick={onOpenSystemOperations}
            >
              Open System & Operations →
            </button>
          ) : null}
        </article>

        <article className={styles.alertItem}>
          <div>
            <strong>More Founder alert sources</strong>
            <p>
              Provider and other service-level alerts will join this same alert
              centre only as their real Staging sources are individually connected
              and certified. HIISSA does not invent emergency alerts.
            </p>
          </div>
        </article>
      </div>
    </section>
  );
}

function ControlRoomOverviewLiveSummary({
  authenticated,
  onOpenAlerts,
  onOpenFailures,
  onOpenSafetyPrivacy,
  onOpenAuthSync,
  onOpenAiProduct,
  onOpenSystemOperations,
  onOpenSecurityAudit,
}) {
  const [state, setState] = useState({
    loading: Boolean(authenticated),
    approvals: null,
    security: null,
    people: null,
    safetyPrivacy: null,
    authSync: null,
    aiProduct: null,
    systemOperations: null,
    sourceErrors: 0,
  });

  useEffect(() => {
    if (!authenticated || !adminDataClient) {
      setState({
        loading: false,
        approvals: null,
        security: null,
        people: null,
        safetyPrivacy: null,
        authSync: null,
        aiProduct: null,
        systemOperations: null,
        sourceErrors: 0,
      });
      return;
    }

    let active = true;

    async function loadSummary() {
      try {
        const {
          data: { session },
        } = await adminDataClient.auth.getSession();

        if (!session?.access_token || !active) {
          setState((current) => ({ ...current, loading: false }));
          return;
        }

        const headers = { Authorization: `Bearer ${session.access_token}` };
        const [
          approvalResponse,
          securityResponse,
          peopleResponse,
          safetyPrivacyResponse,
          authSyncResponse,
          aiProductResponse,
          systemOperationsResponse,
        ] = await Promise.all([
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
          fetch("/api/admin/control-room/people-experience-health", {
            method: "GET",
            cache: "no-store",
            credentials: "same-origin",
            headers,
          }),
          fetch("/api/admin/control-room/safety-privacy-health", {
            method: "GET",
            cache: "no-store",
            credentials: "same-origin",
            headers,
          }),
          fetch("/api/admin/control-room/auth-sync-health", {
            method: "GET",
            cache: "no-store",
            credentials: "same-origin",
            headers,
          }),
          fetch("/api/admin/control-room/ai-product-health", {
            method: "GET",
            cache: "no-store",
            credentials: "same-origin",
            headers,
          }),
          fetch("/api/admin/control-room/system-operations-health", {
            method: "GET",
            cache: "no-store",
            credentials: "same-origin",
            headers,
          }),
        ]);

        const [
          approvalData,
          securityData,
          peopleData,
          safetyPrivacyData,
          authSyncData,
          aiProductData,
          systemOperationsData,
        ] = await Promise.all([
          approvalResponse.json().catch(() => null),
          securityResponse.json().catch(() => null),
          peopleResponse.json().catch(() => null),
          safetyPrivacyResponse.json().catch(() => null),
          authSyncResponse.json().catch(() => null),
          aiProductResponse.json().catch(() => null),
          systemOperationsResponse.json().catch(() => null),
        ]);

        if (!active) return;

        setState({
          loading: false,
          approvals:
            approvalResponse.ok && approvalData ? approvalData : null,
          security:
            securityResponse.ok && securityData ? securityData : null,
          people:
            peopleResponse.ok && peopleData ? peopleData : null,
          safetyPrivacy:
            safetyPrivacyResponse.ok && safetyPrivacyData
              ? safetyPrivacyData
              : null,
          authSync:
            authSyncResponse.ok && authSyncData ? authSyncData : null,
          aiProduct:
            aiProductResponse.ok && aiProductData ? aiProductData : null,
          systemOperations:
            systemOperationsResponse.ok && systemOperationsData
              ? systemOperationsData
              : null,
          sourceErrors:
            Number(!approvalResponse.ok) +
            Number(!securityResponse.ok) +
            Number(!peopleResponse.ok) +
            Number(!safetyPrivacyResponse.ok) +
            Number(!authSyncResponse.ok) +
            Number(!aiProductResponse.ok) +
            Number(!systemOperationsResponse.ok),
        });
      } catch {
        if (!active) return;
        setState({
          loading: false,
          approvals: null,
          security: null,
          people: null,
          safetyPrivacy: null,
          authSync: null,
          aiProduct: null,
          systemOperations: null,
          sourceErrors: 7,
        });
      }
    }

    loadSummary();
    return () => {
      active = false;
    };
  }, [authenticated]);

  const pendingApprovals = Number(state.approvals?.pendingCount || 0);
  const securityStatus = String(
    state.security?.displayHealthStatus ||
      state.security?.status ||
      "MONITORING"
  );
  const securityAttention = [
    "NEEDS_ATTENTION",
    "DEGRADED",
    "UNAVAILABLE",
    "CRITICAL",
  ].includes(securityStatus)
    ? 1
    : 0;
  const peopleStatus = String(
    state.people?.displayHealthStatus || "MONITORING"
  );
  const peopleAttention = [
    "NEEDS_ATTENTION",
    "DEGRADED",
    "UNAVAILABLE",
    "CRITICAL",
  ].includes(peopleStatus)
    ? 1
    : 0;

  const safetyPrivacyStatus = String(
    state.safetyPrivacy?.displayHealthStatus || "MONITORING"
  );
  const safetyPrivacyAttention = [
    "NEEDS_ATTENTION",
    "DEGRADED",
    "UNAVAILABLE",
    "CRITICAL",
  ].includes(safetyPrivacyStatus)
    ? 1
    : 0;

  const authSyncStatus = String(
    state.authSync?.displayHealthStatus || "MONITORING"
  );
  const authSyncAttention = [
    "NEEDS_ATTENTION",
    "DEGRADED",
    "UNAVAILABLE",
    "CRITICAL",
  ].includes(authSyncStatus)
    ? 1
    : 0;

  const aiProductStatus = String(
    state.aiProduct?.displayHealthStatus || "MONITORING"
  );
  const aiProductAttention = [
    "NEEDS_ATTENTION",
    "DEGRADED",
    "UNAVAILABLE",
    "CRITICAL",
  ].includes(aiProductStatus)
    ? 1
    : 0;

  const systemOperationsStatus = String(
    state.systemOperations?.displayHealthStatus || "MONITORING"
  );
  const systemOperationsAttention = [
    "NEEDS_ATTENTION",
    "DEGRADED",
    "UNAVAILABLE",
    "CRITICAL",
  ].includes(systemOperationsStatus)
    ? 1
    : 0;

  const attentionCount =
    pendingApprovals +
    securityAttention +
    peopleAttention +
    safetyPrivacyAttention +
    authSyncAttention +
    aiProductAttention +
    systemOperationsAttention;
  const criticalCount =
    Number(state.security?.criticalCount || 0) +
    (peopleStatus === "CRITICAL" ? 1 : 0) +
    (safetyPrivacyStatus === "CRITICAL" ? 1 : 0) +
    (authSyncStatus === "CRITICAL" ? 1 : 0) +
    (aiProductStatus === "CRITICAL" ? 1 : 0) +
    (systemOperationsStatus === "CRITICAL" ? 1 : 0);

  const overallStatus = state.loading
    ? "MONITORING"
    : criticalCount > 0
      ? "CRITICAL"
      : state.sourceErrors > 0
        ? "UNAVAILABLE"
        : securityStatus === "DEGRADED" ||
            peopleStatus === "DEGRADED" ||
            safetyPrivacyStatus === "DEGRADED" ||
            authSyncStatus === "DEGRADED" ||
            aiProductStatus === "DEGRADED" ||
            systemOperationsStatus === "DEGRADED"
          ? "DEGRADED"
          : attentionCount > 0
            ? "NEEDS ATTENTION"
            : "MONITORING";

  return (
    <>
      <div className={styles.grid}>
        <InfoCard
          title="HIISSA STATUS"
          value={statusLabel(overallStatus)}
          detail={
            state.loading
              ? "Checking the Control Room sources that are live-wired in Staging."
              : "This is an aggregate of currently connected, verified sources only. Because all ten modules are not yet fully live-wired, the overall Control Room does not claim Healthy."
          }
        />
        <InfoCard
          title="NEEDS YOUR ATTENTION"
          value={
            state.loading
              ? "Checking…"
              : `${attentionCount} connected item${attentionCount === 1 ? "" : "s"}`
          }
          detail={
            attentionCount > 0
              ? "Open Alerts for the authorised sources that currently need Founder awareness or a decision."
              : "No currently connected source is asking for Founder attention. Unwired modules are not silently treated as healthy."
          }
        />
        <InfoCard
          title="PEOPLE EXPERIENCE"
          value={
            state.people
              ? statusLabel(state.people.displayHealthStatus || "MONITORING")
              : state.loading
                ? "Checking…"
                : "Unavailable"
          }
          detail={
            state.people?.founderView?.doINeedToAct ||
            "Gentle Check-In and Calmer Start now reuse the same connected health source across authorised Control Room views."
          }
        />
        <InfoCard
          title="SAFETY, PRIVACY & MODERATION"
          value={
            state.safetyPrivacy
              ? statusLabel(
                  state.safetyPrivacy.displayHealthStatus || "MONITORING"
                )
              : state.loading
                ? "Checking…"
                : "Unavailable"
          }
          detail={
            state.safetyPrivacy?.founderView?.doINeedToAct ||
            "Privacy-safe boundary-event monitoring is connected without exposing private conversation content."
          }
        />
        <InfoCard
          title="AUTH & SYNC"
          value={
            state.authSync
              ? statusLabel(state.authSync.displayHealthStatus || "MONITORING")
              : state.loading
                ? "Checking…"
                : "Unavailable"
          }
          detail={
            state.authSync?.founderView?.doINeedToAct ||
            "Read-only identity, Guest, Save & Continue and migration evidence is now connected without reopening the protected working core."
          }
        />
        <InfoCard
          title="AI & PRODUCT"
          value={
            state.aiProduct
              ? statusLabel(state.aiProduct.displayHealthStatus || "MONITORING")
              : state.loading
                ? "Checking…"
                : "Unavailable"
          }
          detail={
            state.aiProduct?.founderView?.doINeedToAct ||
            "Existing Quality Evaluator evidence is connected read-only without changing generated responses or the evaluator."
          }
        />
        <InfoCard
          title="SYSTEM & OPERATIONS"
          value={
            state.systemOperations
              ? statusLabel(
                  state.systemOperations.displayHealthStatus || "MONITORING"
                )
              : state.loading
                ? "Checking…"
                : "Unavailable"
          }
          detail={
            state.systemOperations?.founderView?.doINeedToAct ||
            "Provider health is connected separately from billing/telemetry completeness."
          }
        />
        <InfoCard
          title="ADMIN SECURITY & AUDIT"
          value={
            state.security
              ? statusLabel(
                  state.security.displayHealthStatus ||
                    state.security.status ||
                    "MONITORING"
                )
              : state.loading
                ? "Checking…"
                : "Unavailable"
          }
          detail={
            state.security?.founderView?.doINeedToAct ||
            "Roles, permissions, access grants and attributable audit evidence are monitored from the protected Security source."
          }
        />
        <InfoCard
          title="CONNECTED SOURCES"
          value={
            state.loading
              ? "Checking…"
              : `${7 - state.sourceErrors} / 7 current Overview sources`
          }
          detail="Founder approvals, Admin Security, People Experience, Safety/Privacy/Moderation, Auth & Sync, AI & Product and System & Operations are the current live Overview inputs in this Staging package."
        />
      </div>

      <div className={styles.overviewPathways}>
        <button
          type="button"
          className={styles.overviewPathway}
          onClick={onOpenAlerts}
        >
          <span>NEEDS YOUR ATTENTION</span>
          <strong>
            {state.loading
              ? "Checking connected signals"
              : attentionCount > 0
                ? `${attentionCount} connected item${attentionCount === 1 ? "" : "s"} need review`
                : "No connected Founder attention item right now"}
          </strong>
          <small>Open the shared Founder Alerts view →</small>
        </button>

        <button
          type="button"
          className={styles.overviewPathway}
          onClick={onOpenSafetyPrivacy}
        >
          <span>SAFETY, PRIVACY & MODERATION</span>
          <strong>
            Protection boundaries · {statusLabel(safetyPrivacyStatus)}
          </strong>
          <small>Open the privacy-safe Safety Control Centre →</small>
        </button>

        <button
          type="button"
          className={styles.overviewPathway}
          onClick={onOpenFailures}
        >
          <span>FAILURES & RELIABILITY</span>
          <strong>
            People Experience · {statusLabel(peopleStatus)}
          </strong>
          <small>Open the full health, recovery and verification detail →</small>
        </button>

        <button
          type="button"
          className={styles.overviewPathway}
          onClick={onOpenAuthSync}
        >
          <span>AUTHENTICATION & SYNC</span>
          <strong>
            Identity & continuity · {statusLabel(authSyncStatus)}
          </strong>
          <small>Open the read-only Auth & Sync operational view →</small>
        </button>

        <button
          type="button"
          className={styles.overviewPathway}
          onClick={onOpenAiProduct}
        >
          <span>AI & PRODUCT INTELLIGENCE</span>
          <strong>
            Quality & product · {statusLabel(aiProductStatus)}
          </strong>
          <small>Open the privacy-safe AI & Product operational view →</small>
        </button>

        <button
          type="button"
          className={styles.overviewPathway}
          onClick={onOpenSystemOperations}
        >
          <span>SYSTEM & OPERATIONS</span>
          <strong>
            Providers & infrastructure · {statusLabel(systemOperationsStatus)}
          </strong>
          <small>Open the live provider-health and spend register →</small>
        </button>

        <button
          type="button"
          className={styles.overviewPathway}
          onClick={onOpenSecurityAudit}
        >
          <span>SECURITY & AUDIT</span>
          <strong>
            Access & accountability · {statusLabel(securityStatus)}
          </strong>
          <small>Open Admin access, permissions and audit health →</small>
        </button>
      </div>
    </>
  );
}

function AuthSyncOperationalHealth({ authenticated, evidenceId = "" }) {
  const [loading, setLoading] = useState(Boolean(authenticated));
  const [health, setHealth] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authenticated || !adminDataClient) {
      setLoading(false);
      return;
    }

    let active = true;

    async function loadHealth() {
      try {
        const {
          data: { session },
        } = await adminDataClient.auth.getSession();

        if (!session?.access_token || !active) {
          setError("Founder Admin session could not be confirmed.");
          setLoading(false);
          return;
        }

        const response = await fetch("/api/admin/control-room/auth-sync-health", {
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
          setError("The protected Auth & Sync health source could not be loaded.");
          setLoading(false);
          return;
        }

        setHealth(data);
        setError("");
        setLoading(false);
      } catch {
        if (!active) return;
        setError("The protected Auth & Sync health source could not be loaded.");
        setLoading(false);
      }
    }

    loadHealth();
    return () => {
      active = false;
    };
  }, [authenticated]);

  const displayStatus = loading
    ? "MONITORING"
    : error
      ? "UNAVAILABLE"
      : health?.displayHealthStatus || "MONITORING";
  const sections = health?.sections || {};
  const founderView = health?.founderView || {};
  const migration = sections.guestAccountMigration || {};

  return (
    <>
      <div className={styles.grid}>
        <InfoCard
          title="OVERALL IDENTITY HEALTH"
          value={statusLabel(displayStatus)}
          detail={
            founderView.verification ||
            "HIISSA is checking the protected read-only Staging evidence."
          }
        />
        <InfoCard
          title="SIGN-IN"
          value={statusLabel(sections.signIn?.status || "MONITORING")}
          detail={
            sections.signIn?.failedSignInTelemetry === "NOT_YET_LIVE_WIRED"
              ? "Successful sign-in evidence is observable. Detailed failed-sign-in telemetry is not yet live-wired, so HIISSA does not claim full Healthy verification."
              : "Connected sign-in evidence."
          }
        />
        <InfoCard
          title="GUEST EXPERIENCE"
          value={statusLabel(sections.guestExperience?.status || "MONITORING")}
          detail="Guest is a valid experience state. Guest and Skip are never treated as failures simply for remaining Guest."
        />
        <InfoCard
          title="SAVE & CONTINUE"
          value={statusLabel(sections.saveContinue?.status || "MONITORING")}
          detail="Conversation persistence is observed without exposing conversation content."
        />
        <InfoCard
          title="CROSS-DEVICE SYNC"
          value={statusLabel(sections.crossDeviceSync?.status || "MONITORING")}
          detail="Different device sessions can legitimately resolve to the same permanent identity. Session IDs alone are not identity conflicts."
        />
        <InfoCard
          title="GUEST → ACCOUNT MIGRATION"
          value={statusLabel(migration.status || "MONITORING")}
          detail="The existing claimed_at / Guest source evidence is reused. No second migration mechanism was created."
        />
        <InfoCard
          title="NEEDS ATTENTION"
          value={loading ? "Checking…" : String(health?.needsAttentionCount ?? 0)}
          detail={
            health?.founderActionRequired
              ? "At least one connected condition has reached a Founder-authority boundary."
              : health?.actionOwner === "HIISSA_TECHNICAL_OPERATIONS"
                ? "Connected technical attention belongs to HIISSA Technical Operations."
                : "No connected Auth & Sync condition currently asks the Founder to repair anything."
          }
        />
        <InfoCard
          title="POSSIBLE IDENTITY CONFLICTS"
          value={loading ? "Checking…" : String(migration.possibleIdentityConflicts ?? 0)}
          detail="HIISSA never auto-merges similar-looking accounts. Any ownership conflict stops for authorised review."
        />
      </div>

      {error ? (
        <section className={styles.errorPanel}>
          <strong>Auth & Sync monitoring unavailable</strong>
          <div>{error}</div>
        </section>
      ) : null}

      <section className={styles.section} id={evidenceId || undefined}>
        <div className={styles.sectionHeading}>
          <div>
            <div className={styles.kicker}>AUTH & SYNC · CONNECTED READ-ONLY EVIDENCE</div>
            <h3>Continuity without exposing secrets or conversation content</h3>
          </div>
          <StatusPill label={statusLabel(displayStatus)} compact />
        </div>

        <div className={styles.featureList}>
          <article className={styles.featureCard}>
            <div className={styles.featureTop}>
              <strong>FAILED SIGN-INS</strong>
              <StatusPill label="MONITORING" compact />
            </div>
            <p>
              Detailed failed-sign-in telemetry is not yet live-wired. HIISSA
              therefore does not invent a failure count or claim full sign-in
              health.
            </p>
          </article>

          <article className={styles.featureCard}>
            <div className={styles.featureTop}>
              <strong>FAILED GUEST MIGRATIONS / EVIDENCE INTEGRITY</strong>
              <StatusPill label={statusLabel(migration.status || "MONITORING")} compact />
            </div>
            <p>
              Claimed handoffs missing their expected claimed-at verification:
              {" "}{migration.claimedMissingClaimedAt ?? "Checking…"}.
            </p>
            <p>
              Expired pending handoffs:{" "}
              {migration.expiredPendingHandoffs ?? "Checking…"}. Expiry is shown
              as lifecycle evidence and is not automatically treated as a system defect.
            </p>
            <p>
              Historical pre-timestamp claimed handoffs recognised safely:{" "}
              {migration.legacyPreTimestampClaims ?? "Checking…"}. These remain
              preserved as Staging history and are not counted as current failures.
            </p>
          </article>

          <article className={styles.featureCard}>
            <div className={styles.featureTop}>
              <strong>SYNC FAILURES</strong>
              <StatusPill label="MONITORING" compact />
            </div>
            <p>
              Deeper cross-device conflict telemetry is not yet live-wired.
              Different valid sessions on different devices are normal and are
              not counted as conflicts by themselves.
            </p>
          </article>

          <article className={styles.featureCard}>
            <div className={styles.featureTop}>
              <strong>WHAT HAPPENED</strong>
              <StatusPill label={statusLabel(displayStatus)} compact />
            </div>
            <p>{founderView.whatHappened || "Checking the connected evidence."}</p>
            <p><strong>Severity:</strong> {founderView.severity || "Checking…"}</p>
            <p><strong>User impact:</strong> {founderView.userImpact || "Checking…"}</p>
            <p><strong>Evidence:</strong> {founderView.evidenceClass || "OBSERVED"}</p>
          </article>

          <article className={styles.featureCard}>
            <div className={styles.featureTop}><strong>CURRENT STATUS</strong></div>
            <p>{founderView.verification || "Verification pending."}</p>
            <p><strong>Resolution:</strong> {founderView.finalResolution || "Monitoring"}</p>
          </article>

          <article className={styles.featureCard}>
            <div className={styles.featureTop}><strong>WHO / WHAT MAY BE AFFECTED</strong></div>
            <p>{founderView.affected || "Authentication and continuity health in Staging."}</p>
          </article>

          <article className={styles.featureCard}>
            <div className={styles.featureTop}><strong>WHAT HIISSA ALREADY DID</strong></div>
            <p>{founderView.whatHiissaAlreadyDid || "Read the protected evidence without changing the working core."}</p>
          </article>

          <article className={styles.featureCard}>
            <div className={styles.featureTop}><strong>DO I NEED TO ACT?</strong></div>
            <p>{founderView.doINeedToAct || "No Founder repair action is currently required."}</p>
          </article>

          <article className={styles.featureCard}>
            <div className={styles.featureTop}><strong>AVAILABLE ACTIONS</strong></div>
            {(founderView.availableActions || ["No Founder repair action is required."]).map((action) => (
              <p key={action}>• {action}</p>
            ))}
          </article>

          <article className={styles.featureCard}>
            <div className={styles.featureTop}><strong>RECOVERY / NEXT STEP</strong></div>
            <p>{founderView.recoveryNextStep || "Continue read-only monitoring."}</p>
          </article>

          <article className={styles.featureCard}>
            <div className={styles.featureTop}><strong>RELATED EVENTS</strong></div>
            <p>
              Handoffs {founderView.relatedEvents?.handoffsTotal ?? "—"} ·
              Pending {founderView.relatedEvents?.handoffsPending ?? "—"} ·
              Claimed {founderView.relatedEvents?.handoffsClaimed ?? "—"}
            </p>
            <p>
              Active conversations {founderView.relatedEvents?.activeConversations ?? "—"} ·
              Migrated Guest conversations {founderView.relatedEvents?.migratedGuestConversations ?? "—"}
            </p>
            <p>
              Legacy pre-timestamp evidence{" "}
              {founderView.relatedEvents?.legacyPreTimestampClaims ?? "—"} ·
              Current claimed-at evidence gaps{" "}
              {founderView.relatedEvents?.claimedMissingClaimedAt ?? "—"}
            </p>
          </article>

          <article className={styles.featureCard}>
            <div className={styles.featureTop}><strong>AUDIT HISTORY</strong></div>
            <p>
              <strong>Latest sign-in evidence:</strong>{" "}
              {founderView.auditHistory?.latestSignInEvidenceAt
                ? formatHiissaRecordTime(founderView.auditHistory.latestSignInEvidenceAt)
                : "No recent verified timestamp"}
            </p>
            <p>
              <strong>Latest persistence evidence:</strong>{" "}
              {founderView.auditHistory?.latestPersistenceEvidenceAt
                ? formatHiissaRecordTime(founderView.auditHistory.latestPersistenceEvidenceAt)
                : "No recent verified timestamp"}
            </p>
          </article>

          <details className={styles.featureCard}>
            <summary><strong>TECHNICAL DETAILS — expand</strong></summary>
            <p>
              This section intentionally excludes passwords, full auth tokens,
              Magic-Link credentials, service-role secrets, API keys, raw cookies,
              session secrets and conversation content.
            </p>
            <p><strong>Environment:</strong> {founderView.technicalDetails?.environment || "STAGING"}</p>
            <p><strong>Canonical feature:</strong> {health?.canonicalFeatureId || "guest.save-sync"}</p>
            <p><strong>Monitoring:</strong> {statusLabel(health?.monitoringStatus || "PARTIALLY LIVE WIRED")}</p>
          </details>
        </div>
      </section>
    </>
  );
}

function PeopleExperienceOperationalHealth({
  authenticated,
  context = "overview",
}) {
  const [loading, setLoading] = useState(Boolean(authenticated));
  const [health, setHealth] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authenticated || !adminDataClient) {
      setLoading(false);
      return;
    }

    let active = true;

    async function loadHealth() {
      try {
        const {
          data: { session },
        } = await adminDataClient.auth.getSession();

        if (!session?.access_token || !active) {
          setError("Founder Admin session could not be confirmed.");
          setLoading(false);
          return;
        }

        const response = await fetch(
          "/api/admin/control-room/people-experience-health",
          {
            method: "GET",
            cache: "no-store",
            credentials: "same-origin",
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          }
        );

        const data = await response.json().catch(() => null);
        if (!active) return;

        if (!response.ok || !data) {
          setError(
            "The protected People Experience operational source could not be loaded."
          );
          setLoading(false);
          return;
        }

        setHealth(data);
        setError("");
        setLoading(false);
      } catch {
        if (!active) return;
        setError(
          "The protected People Experience operational source could not be loaded."
        );
        setLoading(false);
      }
    }

    loadHealth();
    return () => {
      active = false;
    };
  }, [authenticated]);

  const status = loading
    ? "CHECKING"
    : error
      ? "UNAVAILABLE"
      : health?.status || "UNKNOWN";
  const displayStatus = loading
    ? "MONITORING"
    : error
      ? "UNAVAILABLE"
      : health?.displayHealthStatus || status;
  const founderView = health?.founderView || null;

  const counts = health?.counts || {};
  const founderAction =
    health?.founderActionRequired === true
      ? "YES — FOUNDER"
      : health?.actionOwner === "HIISSA_TECHNICAL_OPERATIONS"
        ? "NO — HIISSA TECH OPS"
        : "NO";

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeading}>
        <div>
          <div className={styles.kicker}>
            PEOPLE EXPERIENCE · LIVE STAGING OPERATIONAL HEALTH
          </div>
          <h3>
            {context === "failures"
              ? "What failed, what HIISSA did, and whether you need to act"
              : context === "system"
                ? "Connected feature health and recovery boundary"
                : "Gentle Check-In, Calmer Start and care-delivery health"}
          </h3>
        </div>
        <StatusPill label={statusLabel(displayStatus)} compact />
      </div>

      <p className={styles.sectionCopy}>
        One privacy-safe Staging source is reused across authorised Control Room
        views. HIISSA does not expose emotional answers, private conversation
        content, passwords or secrets to diagnose this feature.
      </p>

      {!authenticated ? (
        <div className={styles.emptyState}>
          Live People Experience health is available only inside the authenticated
          Staging Control Room.
        </div>
      ) : null}

      {error ? (
        <section className={styles.errorPanel}>
          <strong>Operational monitoring unavailable</strong>
          <div>{error}</div>
        </section>
      ) : null}

      {authenticated ? (
        <>
          <div className={styles.grid}>
            <InfoCard
              title="CURRENT STATUS"
              value={statusLabel(displayStatus)}
              detail={
                health?.healthMeaning ||
                "HIISSA is checking the protected operational source."
              }
            />
            <InfoCard
              title="FOUNDER ACTION"
              value={founderAction}
              detail={
                health?.founderActionRequired
                  ? "HIISSA has reached a boundary that requires your authority."
                  : health?.actionOwner === "HIISSA_TECHNICAL_OPERATIONS"
                    ? "The issue belongs to HIISSA Technical Operations rather than turning you into the technician."
                    : "No Founder action is currently required by this connected source."
              }
            />
            <InfoCard
              title="CHECK-IN EVENTS · 7 DAYS"
              value={
                loading
                  ? "Checking…"
                  : String(
                      Number(counts.offered || 0) +
                        Number(counts.snoozed || 0) +
                        Number(counts.resolved || 0)
                    )
              }
              detail={
                loading
                  ? "Reading Staging evidence."
                  : `Offered ${counts.offered || 0} · Snoozed ${counts.snoozed || 0} · Resolved ${counts.resolved || 0}`
              }
            />
            <InfoCard
              title="LAST VERIFIED EVIDENCE"
              value={
                health?.latestEvidenceAt
                  ? formatHiissaRecordTime(health.latestEvidenceAt)
                  : loading
                    ? "Checking…"
                    : "NO RECENT ACTIVITY"
              }
              detail="No recent activity is not automatically labelled Healthy."
            />
          </div>

          <div className={styles.featureList}>
            <article className={styles.featureCard}>
              <div className={styles.featureTop}>
                <strong>WHAT HAPPENED</strong>
                <StatusPill label={statusLabel(displayStatus)} compact />
              </div>
              <p>
                {founderView?.whatHappened ||
                  "HIISSA is checking the connected operational evidence."}
              </p>
              <p>
                <strong>Start time:</strong>{" "}
                {founderView?.incidentStartedAt
                  ? formatHiissaRecordTime(founderView.incidentStartedAt)
                  : "No active incident start time"}
              </p>
              <p>
                <strong>Severity:</strong>{" "}
                {founderView?.severity || "Checking impact"}
              </p>
              <p>
                <strong>User impact:</strong>{" "}
                {founderView?.userImpact ||
                  "HIISSA is checking whether any user-facing behaviour is affected."}
              </p>
              <p>
                <strong>Evidence:</strong>{" "}
                {founderView?.evidenceClass || "OBSERVED"}
              </p>
            </article>

            <article className={styles.featureCard}>
              <div className={styles.featureTop}>
                <strong>CURRENT STATUS</strong>
                <StatusPill label={statusLabel(displayStatus)} compact />
              </div>
              <p>
                {health?.healthMeaning ||
                  "HIISSA is checking the protected operational source."}
              </p>
              <p>
                <strong>Verification:</strong>{" "}
                {founderView?.verification ||
                  "The resulting state must be verified before recovery is called resolved."}
              </p>
              <p>
                <strong>Resolution:</strong>{" "}
                {founderView?.finalResolution || "Checking…"}
              </p>
            </article>

            <article className={styles.featureCard}>
              <div className={styles.featureTop}>
                <strong>WHO / WHAT MAY BE AFFECTED</strong>
              </div>
              <p>
                {founderView?.affected ||
                  "HIISSA is checking the affected capability and scope."}
              </p>
            </article>

            <article className={styles.featureCard}>
              <div className={styles.featureTop}>
                <strong>WHAT HIISSA ALREADY DID</strong>
              </div>
              <p>
                {founderView?.whatHiissaAlreadyDid ||
                  health?.whatHiissaDid ||
                  "HIISSA is checking the connected operational evidence."}
              </p>
              <p>
                <strong>Automatic recovery attempts:</strong>{" "}
                {typeof health?.automaticRecovery?.observedAutomaticRecoveryAttempts === "number"
                  ? String(health.automaticRecovery.observedAutomaticRecoveryAttempts)
                  : "Checking…"}
              </p>
            </article>

            <article className={styles.featureCard}>
              <div className={styles.featureTop}>
                <strong>DO I NEED TO ACT?</strong>
              </div>
              <p>
                {founderView?.doINeedToAct ||
                  (health?.founderActionRequired
                    ? "YES — Founder authority is required."
                    : "NO — no Founder action is currently required.")}
              </p>
            </article>

            <article className={styles.featureCard}>
              <div className={styles.featureTop}>
                <strong>AVAILABLE ACTIONS</strong>
              </div>
              {(founderView?.availableActions || [
                "No Founder repair action is required while HIISSA completes the connected monitoring cycle.",
              ]).map((action) => (
                <p key={action}>• {action}</p>
              ))}
            </article>

            <article className={styles.featureCard}>
              <div className={styles.featureTop}>
                <strong>RECOVERY / NEXT STEP</strong>
              </div>
              <p>
                {founderView?.recoveryNextStep ||
                  "HIISSA will continue bounded recovery and verify the result before reporting resolution."}
              </p>
            </article>

            <article className={styles.featureCard}>
              <div className={styles.featureTop}>
                <strong>RELATED EVENTS</strong>
              </div>
              <p>
                Check-In offered {founderView?.relatedEvents?.checkInOffers ?? counts.offered ?? 0}
                {" · "}Snoozed {founderView?.relatedEvents?.snoozed ?? counts.snoozed ?? 0}
                {" · "}Resolved {founderView?.relatedEvents?.resolved ?? counts.resolved ?? 0}
              </p>
              <p>
                Recovery attempts {founderView?.relatedEvents?.recoveryAttempts ?? counts.operationalRecoveryEvents ?? 0}
                {" · "}Still unresolved {founderView?.relatedEvents?.unresolvedTechnicalAttention ?? 0}
                {" · "}Recovered {founderView?.relatedEvents?.recoveredTechnicalAttention ?? 0}
              </p>
            </article>

            <article className={styles.featureCard}>
              <div className={styles.featureTop}>
                <strong>AUDIT HISTORY</strong>
              </div>
              <p>
                <strong>Evidence window:</strong>{" "}
                {founderView?.auditHistory?.evidenceWindowDays ?? health?.evidenceWindowDays ?? 7} days
              </p>
              <p>
                <strong>Latest verified evidence:</strong>{" "}
                {founderView?.auditHistory?.latestEvidenceAt
                  ? formatHiissaRecordTime(founderView.auditHistory.latestEvidenceAt)
                  : health?.latestEvidenceAt
                    ? formatHiissaRecordTime(health.latestEvidenceAt)
                    : "No recent verified activity"}
              </p>
              <p>
                <strong>Connected records:</strong>{" "}
                {founderView?.auditHistory?.connectedRecordCount ?? "Checking…"}
              </p>
            </article>

            <details className={styles.featureCard}>
              <summary><strong>TECHNICAL DETAILS — expand</strong></summary>
              <p>
                Human-readable technical detail is available here for authorised review.
                Raw passwords, tokens, secrets and private conversation content are never shown.
              </p>
              <p>
                <strong>Feature:</strong>{" "}
                {founderView?.technicalDetails?.featureId || "hiissa.people-experience"}
              </p>
              <p>
                <strong>Environment:</strong>{" "}
                {founderView?.technicalDetails?.environment || "STAGING"}
              </p>
              <p>
                <strong>Monitoring:</strong>{" "}
                {statusLabel(founderView?.technicalDetails?.monitoringStatus || health?.monitoringStatus || "checking")}
              </p>
              <p>
                <strong>Internal state:</strong>{" "}
                {statusLabel(founderView?.technicalDetails?.internalState || status)}
              </p>
              <p>
                <strong>Active issue count:</strong>{" "}
                {founderView?.technicalDetails?.activeIssueCount ?? "Checking…"}
              </p>
            </details>


            <article className={styles.featureCard}>
              <div className={styles.featureTop}>
                <strong>Cadence & delivery rules</strong>
                <StatusPill
                  label={statusLabel(health?.checks?.cadence?.status || "CHECKING")}
                  compact
                />
              </div>
              <p>
                Daypart maximum, daily maximum and the approved minimum gap are
                checked from real privacy-safe audit evidence. Founder manual
                Preview testing is excluded from staff cadence-failure detection.
              </p>
            </article>

            <article className={styles.featureCard}>
              <div className={styles.featureTop}>
                <strong>Privacy boundary</strong>
                <StatusPill
                  label={statusLabel(health?.checks?.privacy?.status || "CHECKING")}
                  compact
                />
              </div>
              <p>
                Emotional answer values, emotional scoring, performance scoring
                and manager mood signals must remain absent from operational
                records.
              </p>
            </article>

            <article className={styles.featureCard}>
              <div className={styles.featureTop}>
                <strong>Safe automatic recovery</strong>
                <StatusPill
                  label={statusLabel(
                    health?.automaticRecovery?.classification || "CHECKING"
                  )}
                  compact
                />
              </div>
              <p>
                {health?.automaticRecovery?.configuredSafeBehaviours?.[0] ||
                  "HIISSA is checking the approved recovery contract."}
              </p>
              <p>
                <strong>Verification:</strong>{" "}
                {health?.automaticRecovery?.verificationRule ||
                  "Recovery is not called successful until the resulting state is verified."}
              </p>
            </article>

            <article className={styles.featureCard}>
              <div className={styles.featureTop}>
                <strong>What HIISSA has already done</strong>
              </div>
              <p>
                {health?.whatHiissaDid ||
                  "HIISSA is checking the connected operational evidence."}
              </p>
              <p>
                <strong>Recovery-attempt evidence:</strong>{" "}
                {typeof health?.automaticRecovery?.observedAutomaticRecoveryAttempts === "number"
                  ? String(health.automaticRecovery.observedAutomaticRecoveryAttempts)
                  : "Checking…"}
              </p>
              {health?.automaticRecovery?.latestObservedRecovery ? (
                <p>
                  <strong>Latest recovery:</strong>{" "}
                  {statusLabel(
                    health.automaticRecovery.latestObservedRecovery.event ||
                      "recorded"
                  )}
                  {" · "}
                  {statusLabel(
                    health.automaticRecovery.latestObservedRecovery.verificationState ||
                      "verification pending"
                  )}
                </p>
              ) : null}
            </article>
          </div>

          <div className={styles.featureMeta}>
            <span>STAGING ONLY</span>
            <span>READ ONLY</span>
            <span>ONE SOURCE OF TRUTH</span>
            <span>NO PRIVATE ANSWER CONTENT</span>
            <span>PRODUCTION UNTOUCHED</span>
          </div>
        </>
      ) : null}
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

function FounderWorkdayClose({
  authenticated,
  open,
  onClose,
  onOpenApprovals,
  onOpenAlerts,
}) {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open || !authenticated || !adminDataClient) return;

    let active = true;

    async function loadCloseSummary() {
      setLoading(true);
      setError("");

      try {
        const {
          data: { session },
        } = await adminDataClient.auth.getSession();

        if (!session?.access_token || !active) {
          setError("Founder session could not be verified.");
          setLoading(false);
          return;
        }

        const now = new Date();
        const localDate = [
          now.getFullYear(),
          String(now.getMonth() + 1).padStart(2, "0"),
          String(now.getDate()).padStart(2, "0"),
        ].join("-");

        const response = await fetch("/api/admin/control-room/workday-close", {
          method: "POST",
          cache: "no-store",
          credentials: "same-origin",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            localDate,
            localHour: now.getHours(),
            timeZone:
              Intl.DateTimeFormat().resolvedOptions().timeZone || "local-device",
          }),
        });

        const data = await response.json().catch(() => null);

        if (!active) return;

        if (!response.ok || !data) {
          setError("The verified Founder closing summary could not be loaded.");
          setLoading(false);
          return;
        }

        setSummary(data);
        setLoading(false);
      } catch {
        if (!active) return;
        setError("The verified Founder closing summary could not be loaded.");
        setLoading(false);
      }
    }

    loadCloseSummary();

    return () => {
      active = false;
    };
  }, [authenticated, open]);

  return (
    <WorkdayClose
      open={open}
      identity="FATI BANCE · FOUNDER"
      heading="Before you finish for now…"
      intro="HIISSA is checking the connected Staging sources so you can leave with a clear picture of what is recorded and what may still need you."
      loading={loading}
      error={error}
      items={summary?.items || []}
      caution={summary?.caution || ""}
      sourceNote={summary?.sourceNote || ""}
      actions={[
        {
          label: "Open Approvals",
          primary: Boolean(
            summary?.items?.find(
              (item) =>
                item.label === "Founder approvals waiting" &&
                Number(item.value) > 0
            )
          ),
          onClick: () => {
            onClose();
            onOpenApprovals();
          },
        },
        {
          label: "Open Alerts",
          primary: false,
          onClick: () => {
            onClose();
            onOpenAlerts();
          },
        },
      ]}
      onClose={onClose}
    />
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
  onOpenFailures,
  onOpenSafetyPrivacy,
  onOpenAuthSync,
  onOpenAiProduct,
  onOpenSystemOperations,
  onOpenSecurityAudit,
  onShowFullOverview,
}) {
  const [workdayCloseOpen, setWorkdayCloseOpen] = useState(false);
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
            <button type="button" onClick={() => setWorkdayCloseOpen(true)}>
              Finish for now
            </button>
          </div>
          <div className={styles.calmStartPrivacy}>
            Your check-in answer was not sent to the Founder/Admin audit trail.
            This calmer presentation exists only for your current browser experience.
          </div>
        </section>
        <FounderWorkdayClose
          authenticated={authenticated}
          open={workdayCloseOpen}
          onClose={() => setWorkdayCloseOpen(false)}
          onOpenApprovals={onOpenApprovals}
          onOpenAlerts={onOpenAlerts}
        />
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
        <div className={styles.overviewHeadingActions}>
          <StatusPill label="FOUNDATION" />
          <button
            type="button"
            className={styles.finishForNowButton}
            onClick={() => setWorkdayCloseOpen(true)}
          >
            Finish for now
          </button>
        </div>
      </div>

      <section className={styles.notice}>
        <strong>Important: no fake health numbers.</strong>
        <p>
          Live health, user-registration, entitlement, failure and recovery values will appear only when an authorised real data source is connected and verified.
        </p>
      </section>

      <FounderActivityTimeline authenticated={authenticated} />

      <ControlRoomOverviewLiveSummary
        authenticated={authenticated}
        onOpenAlerts={onOpenAlerts}
        onOpenFailures={onOpenFailures}
        onOpenSafetyPrivacy={onOpenSafetyPrivacy}
        onOpenAuthSync={onOpenAuthSync}
        onOpenAiProduct={onOpenAiProduct}
        onOpenSystemOperations={onOpenSystemOperations}
        onOpenSecurityAudit={onOpenSecurityAudit}
      />

      <div className={styles.grid}>
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
            <h3>Registered features and their Control Room connection</h3>
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
                <span>
                  Control Room:{" "}
                  {feature.controlRoom?.status === "staging-live-operational-health-wired"
                    ? "LIVE-WIRED · STAGING"
                    : feature.controlRoom?.status
                      ? "CONTRACT DEFINED"
                      : "MISSING"}
                </span>
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
        <div className={styles.kicker}>SHARED DETAIL VIEW — CONTROL ROOM STANDARD</div>
        {[
          "WHAT HAPPENED",
          "CURRENT STATUS",
          "WHO / WHAT MAY BE AFFECTED",
          "WHAT HIISSA ALREADY DID",
          "DO I NEED TO ACT?",
          "AVAILABLE ACTIONS",
          "RECOVERY / NEXT STEP",
          "RELATED EVENTS",
          "AUDIT HISTORY",
          "TECHNICAL DETAILS — EXPAND",
        ].map((label) => (
          <div key={label}>
            {label}
            <span>
              People Experience now uses this structure in the connected Failures & Reliability view; other features must adopt it when their live wiring is certified.
            </span>
          </div>
        ))}
      </section>
    </>
  );
}

function FounderAccessCentre({ authenticated }) {
  const workspaces = STAFF_WORKSPACE_SHELL_STANDARD.workspaces || [];
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState("");
  const selectedWorkspace =
    workspaces.find((workspace) => workspace.id === selectedWorkspaceId) || null;

  return (
    <section className={styles.section} id="staff-workspaces-top">
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

      <ControlRoomAreaNavigator
        title="Staff & Workspaces areas"
        areas={[
          ["Departments & workspaces", "staff-departments"],
          ["Private Appreciation", "staff-private-appreciation"],
          ["Staff Directory", "staff-directory"],
        ]}
      />

      <div className={styles.accessCentreGrid} id="staff-departments">
        {workspaces.map((workspace) => {
          const route = FOUNDER_WORKSPACE_ROUTES[workspace.id] || null;
          const available = Boolean(authenticated && route?.href);
          const selected = selectedWorkspaceId === workspace.id;

          return (
            <article
              className={
                selected
                  ? `${styles.accessCentreCard} ${styles.accessCentreCardSelected}`
                  : styles.accessCentreCard
              }
              key={workspace.id}
            >
              <button
                type="button"
                className={styles.accessCentreSelect}
                onClick={() => setSelectedWorkspaceId(workspace.id)}
                aria-pressed={selected}
                aria-label={`Select ${workspace.label} department`}
              >
                <div className={styles.featureTop}>
                  <div>
                    <strong>{workspace.label}</strong>
                    <div className={styles.featureId}>{workspace.id}</div>
                  </div>
                  <div className={styles.accessCentreStatusStack}>
                    {selected ? (
                      <span className={styles.accessCentreSelectedPill}>SELECTED</span>
                    ) : null}
                    <StatusPill
                      label={route?.status || "APPROVED · NOT BUILT YET"}
                      compact
                    />
                  </div>
                </div>

                <p>
                  {route?.note ||
                    "This approved department workspace will appear here automatically when its interface is built and certified."}
                </p>
                <span className={styles.accessCentreTapHint}>
                  {selected ? "Department selected" : "Tap to select this department"}
                </span>
              </button>

              {selected ? (
                <div className={styles.accessCentreSelectedActions}>
                  {available ? (
                    <Link
                      className={styles.accessCentreLink}
                      href={route.href}
                    >
                      Open {workspace.label} workspace →
                    </Link>
                  ) : route?.href ? (
                    <span className={styles.accessCentreDisabled}>
                      Selected · Founder sign-in required
                    </span>
                  ) : (
                    <span className={styles.accessCentreDisabled}>
                      Selected · Workspace approved — interface not built yet
                    </span>
                  )}
                </div>
              ) : null}
            </article>
          );
        })}
      </div>

      {selectedWorkspace ? (
        <div className={styles.selectedWorkspaceContext} role="status" aria-live="polite">
          <span className={styles.kicker}>ACTIVE DEPARTMENT</span>
          <strong>You&apos;re viewing {selectedWorkspace.label}</strong>
          <span>
            {FOUNDER_WORKSPACE_ROUTES[selectedWorkspace.id]?.href
              ? "Its available Founder workspace action is shown on the selected card."
              : "This department is selected. Its workspace will remain clearly unavailable until it is built and certified."}
          </span>
        </div>
      ) : (
        <div className={styles.selectedWorkspaceContext}>
          <span className={styles.kicker}>DEPARTMENT SELECTION</span>
          <strong>Choose a department to make it active.</strong>
          <span>
            Interactive areas acknowledge your selection; informational cards remain informational.
          </span>
        </div>
      )}

      <div id="staff-private-appreciation">
        <PrivateAppreciation
        mode="founder-preview"
        recipientLabel="Customer Support"
      />
      </div>

      <div className={styles.founderPeoplePanel} id="staff-directory">
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

function AiProductReliabilityCrossReference({ authenticated }) {
  const [loading, setLoading] = useState(Boolean(authenticated));
  const [health, setHealth] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authenticated || !adminDataClient) {
      setLoading(false);
      return;
    }

    let active = true;

    async function loadHealth() {
      try {
        const {
          data: { session },
        } = await adminDataClient.auth.getSession();

        if (!session?.access_token || !active) {
          setError("Founder Admin session could not be confirmed.");
          setLoading(false);
          return;
        }

        const response = await fetch("/api/admin/control-room/ai-product-health", {
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
          setError("The protected AI & Product reliability source could not be loaded.");
          setLoading(false);
          return;
        }

        setHealth(data);
        setError("");
        setLoading(false);
      } catch {
        if (!active) return;
        setError("The protected AI & Product reliability source could not be loaded.");
        setLoading(false);
      }
    }

    loadHealth();
    return () => {
      active = false;
    };
  }, [authenticated]);

  const displayStatus = loading
    ? "MONITORING"
    : error
      ? "UNAVAILABLE"
      : health?.displayHealthStatus || "MONITORING";
  const quality = health?.sections?.qualityEvaluator || {};
  const regeneration = health?.sections?.regeneration || {};
  const founderView = health?.founderView || {};

  return (
    <>
      <div className={styles.grid}>
        <InfoCard
          title="AI QUALITY RELIABILITY"
          value={statusLabel(displayStatus)}
          detail={
            founderView.verification ||
            "HIISSA is checking the same Module 8 aggregate quality evidence."
          }
        />
        <InfoCard
          title="QUALITY FAILURES"
          value={
            loading
              ? "Checking…"
              : String(quality.evaluatorFailureCount ?? 0)
          }
          detail="Existing evaluator audit evidence only. No private response content is exposed here."
        />
        <InfoCard
          title="REGENERATION NEEDS REVIEW"
          value={
            loading
              ? "Checking…"
              : String(regeneration.regenerationNeedsReviewCount ?? 0)
          }
          detail="A recorded regeneration remains open when successful recovery is not proven."
        />
        <InfoCard
          title="FOUNDER ACTION"
          value={health?.founderActionRequired ? "REQUIRED" : "NOT REQUIRED"}
          detail={
            founderView.doINeedToAct ||
            "Routine product-quality investigation stays outside Founder repair work."
          }
        />
      </div>

      {error ? (
        <section className={styles.errorPanel}>
          <strong>AI & Product reliability monitoring unavailable</strong>
          <div>{error}</div>
        </section>
      ) : null}
    </>
  );
}

function SystemOperationsReliabilityCrossReference({ authenticated }) {
  const [loading, setLoading] = useState(Boolean(authenticated));
  const [health, setHealth] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authenticated || !adminDataClient) {
      setLoading(false);
      return;
    }

    let active = true;

    async function loadHealth() {
      try {
        const {
          data: { session },
        } = await adminDataClient.auth.getSession();

        if (!session?.access_token || !active) {
          setError("Founder Admin session could not be confirmed.");
          setLoading(false);
          return;
        }

        const response = await fetch(
          "/api/admin/control-room/system-operations-health",
          {
            method: "GET",
            cache: "no-store",
            credentials: "same-origin",
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          }
        );

        const data = await response.json().catch(() => null);
        if (!active) return;

        if (!response.ok || !data) {
          setError("The protected provider reliability source could not be loaded.");
          setLoading(false);
          return;
        }

        setHealth(data);
        setError("");
        setLoading(false);
      } catch {
        if (!active) return;
        setError("The protected provider reliability source could not be loaded.");
        setLoading(false);
      }
    }

    loadHealth();
    return () => {
      active = false;
    };
  }, [authenticated]);

  const displayStatus = loading
    ? "MONITORING"
    : error
      ? "UNAVAILABLE"
      : health?.displayHealthStatus || "MONITORING";
  const providers = health?.providers || {};
  const founderView = health?.founderView || {};

  return (
    <>
      <div className={styles.grid}>
        <InfoCard
          title="PROVIDER RELIABILITY"
          value={statusLabel(displayStatus)}
          detail={
            founderView.verification ||
            "HIISSA is checking the same Module 9 provider-health source."
          }
        />
        <InfoCard
          title="SUPABASE"
          value={statusLabel(providers.supabase?.status || "MONITORING")}
          detail="Same privacy-safe database health probe used by Module 9."
        />
        <InfoCard
          title="RESEND"
          value={statusLabel(providers.resend?.status || "MONITORING")}
          detail="Telemetry permission/setup is kept separate from a genuine email-provider outage."
        />
        <InfoCard
          title="VERCEL RUNTIME"
          value={statusLabel(providers.vercel?.status || "MONITORING")}
          detail="Current runtime evidence only; billing telemetry is not fabricated."
        />
        <InfoCard
          title="PROVIDER ATTENTION"
          value={loading ? "Checking…" : String(health?.needsAttentionCount ?? 0)}
          detail={
            founderView.doINeedToAct ||
            "Routine provider investigation belongs to HIISSA Technical Operations."
          }
        />
      </div>

      {error ? (
        <section className={styles.errorPanel}>
          <strong>Provider reliability monitoring unavailable</strong>
          <div>{error}</div>
        </section>
      ) : null}
    </>
  );
}

function AdminSecurityReliabilityCrossReference({ authenticated }) {
  const [loading, setLoading] = useState(Boolean(authenticated));
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authenticated || !adminDataClient) {
      setLoading(false);
      return;
    }

    let active = true;

    async function loadSecurity() {
      try {
        const {
          data: { session },
        } = await adminDataClient.auth.getSession();

        if (!session?.access_token || !active) {
          setError("Founder Admin session could not be confirmed.");
          setLoading(false);
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
          setError("The protected Admin Security reliability source could not be loaded.");
          setLoading(false);
          return;
        }

        setSummary(data);
        setError("");
        setLoading(false);
      } catch {
        if (!active) return;
        setError("The protected Admin Security reliability source could not be loaded.");
        setLoading(false);
      }
    }

    loadSecurity();
    return () => {
      active = false;
    };
  }, [authenticated]);

  const displayStatus = loading
    ? "MONITORING"
    : error
      ? "UNAVAILABLE"
      : summary?.displayHealthStatus || summary?.status || "MONITORING";
  const counts = summary?.counts || {};
  const founderView = summary?.founderView || {};

  return (
    <>
      <div className={styles.grid}>
        <InfoCard
          title="ADMIN SECURITY RELIABILITY"
          value={statusLabel(displayStatus)}
          detail={
            founderView.verification ||
            "HIISSA is checking the same Module 10 access and audit evidence."
          }
        />
        <InfoCard
          title="UNATTRIBUTED L3 EVENTS"
          value={loading ? "Checking…" : String(counts.unattributedL3AuditEvents ?? "—")}
          detail="High-oversight Admin actions must remain attributable."
        />
        <InfoCard
          title="SELF-GRANTED ACCESS"
          value={loading ? "Checking…" : String(counts.selfGrantedAccess ?? "—")}
          detail="A genuine active self-grant is treated as a security-control failure, not normal administration."
        />
        <InfoCard
          title="FAILED AUDIT OUTCOMES"
          value={loading ? "Checking…" : String(counts.failedAuditOutcomes ?? "—")}
          detail="Recorded failed/error Admin outcomes remain visible for investigation and verification."
        />
        <InfoCard
          title="FOUNDER ACTION"
          value={
            loading
              ? "Checking…"
              : summary?.founderActionRequired
                ? "REQUIRED"
                : "NOT REQUIRED"
          }
          detail={
            founderView.doINeedToAct ||
            "Routine security monitoring belongs to HIISSA / Technical Operations."
          }
        />
      </div>

      {error ? (
        <section className={styles.errorPanel}>
          <strong>Admin Security reliability monitoring unavailable</strong>
          <div>{error}</div>
        </section>
      ) : null}
    </>
  );
}

function SafetyPrivacyOperationalHealth({
  authenticated,
  context = "specialist",
}) {
  const [loading, setLoading] = useState(Boolean(authenticated));
  const [health, setHealth] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authenticated || !adminDataClient) {
      setLoading(false);
      return;
    }

    let active = true;

    async function loadHealth() {
      try {
        const {
          data: { session },
        } = await adminDataClient.auth.getSession();

        if (!session?.access_token || !active) {
          setError("Founder Admin session could not be confirmed.");
          setLoading(false);
          return;
        }

        const response = await fetch(
          "/api/admin/control-room/safety-privacy-health",
          {
            method: "GET",
            cache: "no-store",
            credentials: "same-origin",
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          }
        );

        const data = await response.json().catch(() => null);
        if (!active) return;

        if (!response.ok || !data) {
          setError(
            "The protected Safety, Privacy & Moderation source could not be loaded."
          );
          setLoading(false);
          return;
        }

        setHealth(data);
        setError("");
        setLoading(false);
      } catch {
        if (!active) return;
        setError(
          "The protected Safety, Privacy & Moderation source could not be loaded."
        );
        setLoading(false);
      }
    }

    loadHealth();
    return () => {
      active = false;
    };
  }, [authenticated]);

  const displayStatus = loading
    ? "MONITORING"
    : error
      ? "UNAVAILABLE"
      : health?.displayHealthStatus || "MONITORING";
  const founderView = health?.founderView || {};
  const counts = health?.counts || {};

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeading}>
        <div>
          <div className={styles.kicker}>
            SAFETY, PRIVACY & MODERATION · LIVE STAGING EVIDENCE
          </div>
          <h3>
            {context === "failures"
              ? "Safety/privacy reliability without opening private conversations"
              : "Is HIISSA's protection boundary evidence available and behaving as intended?"}
          </h3>
        </div>
        <StatusPill label={statusLabel(displayStatus)} compact />
      </div>

      <p className={styles.sectionCopy}>
        This view reads the existing protected boundary-event source. It shows
        operational evidence only. Private conversation content and raw boundary
        metadata stay outside this routine Founder view.
      </p>

      {!authenticated ? (
        <div className={styles.emptyState}>
          Live Safety, Privacy & Moderation evidence is available only inside the
          authenticated Staging Control Room.
        </div>
      ) : null}

      {error ? (
        <section className={styles.errorPanel}>
          <strong>Safety/privacy monitoring unavailable</strong>
          <div>{error}</div>
        </section>
      ) : null}

      {authenticated ? (
        <>
          <div className={styles.grid}>
            <InfoCard
              title="CURRENT STATUS"
              value={statusLabel(displayStatus)}
              detail={
                founderView.verification ||
                "HIISSA is checking the protected safety/privacy source."
              }
            />
            <InfoCard
              title={`BOUNDARY EVENTS · ${health?.evidenceWindowDays || 30} DAYS`}
              value={
                loading
                  ? "Checking…"
                  : String(counts.boundaryEvents ?? "—")
              }
              detail="A boundary event is not automatically a failure. HIISSA keeps activity separate from verified operational failure."
            />
            <InfoCard
              title="EXPLICIT OPERATIONAL FAILURES"
              value={
                loading
                  ? "Checking…"
                  : String(counts.explicitOperationalFailures ?? "—")
              }
              detail="Only explicitly recorded failure/error states are counted here."
            />
            <InfoCard
              title="FOUNDER ACTION"
              value={
                loading
                  ? "Checking…"
                  : health?.founderActionRequired
                    ? "REQUIRED"
                    : "NOT REQUIRED"
              }
              detail={
                founderView.doINeedToAct ||
                "No Founder action is currently established by this source."
              }
            />
          </div>

          <div className={styles.featureList}>
            <article className={styles.featureCard}>
              <div className={styles.featureTop}>
                <strong>WHAT HAPPENED</strong>
                <StatusPill label={statusLabel(displayStatus)} compact />
              </div>
              <p>
                {founderView.whatHappened ||
                  "HIISSA is checking the connected operational evidence."}
              </p>
              <p>
                <strong>Severity:</strong>{" "}
                {founderView.severity || "Checking…"}
              </p>
              <p>
                <strong>User impact:</strong>{" "}
                {founderView.userImpact ||
                  "No user impact has been established from this source."}
              </p>
            </article>

            <article className={styles.featureCard}>
              <div className={styles.featureTop}>
                <strong>WHAT HIISSA ALREADY DID</strong>
              </div>
              <p>
                {founderView.whatHiissaAlreadyDid ||
                  "HIISSA is reading the protected source without exposing private conversation content."}
              </p>
            </article>

            <article className={styles.featureCard}>
              <div className={styles.featureTop}>
                <strong>RECOVERY / NEXT STEP</strong>
              </div>
              <p>
                {founderView.recoveryNextStep ||
                  "Continue privacy-safe monitoring and verify any future operational condition before closure."}
              </p>
            </article>
          </div>
        </>
      ) : null}
    </section>
  );
}

function SafetyPrivacyModerationModule({
  module,
  authenticated,
  onOverview,
  onBack,
}) {
  const [recent, setRecent] = useState([]);
  const [loadingRecent, setLoadingRecent] = useState(Boolean(authenticated));

  useEffect(() => {
    if (!authenticated || !adminDataClient) {
      setLoadingRecent(false);
      return;
    }

    let active = true;

    async function loadRecent() {
      try {
        const {
          data: { session },
        } = await adminDataClient.auth.getSession();

        if (!session?.access_token || !active) {
          setLoadingRecent(false);
          return;
        }

        const response = await fetch(
          "/api/admin/control-room/safety-privacy-health",
          {
            method: "GET",
            cache: "no-store",
            credentials: "same-origin",
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          }
        );
        const data = await response.json().catch(() => null);
        if (!active) return;

        setRecent(
          response.ok && Array.isArray(data?.recentBoundaryEvents)
            ? data.recentBoundaryEvents
            : []
        );
        setLoadingRecent(false);
      } catch {
        if (!active) return;
        setRecent([]);
        setLoadingRecent(false);
      }
    }

    loadRecent();
    return () => {
      active = false;
    };
  }, [authenticated]);

  return (
    <>
      <FounderContextBack onBack={onBack} />
      <div className={styles.pageHeading}>
        <div>
          <div className={styles.kicker}>MODULE 5 — LIVE STAGING READ-ONLY</div>
          <h2>{module.label}</h2>
          <p>{module.purpose}</p>
        </div>
        <StatusPill label="MONITORING" />
      </div>

      <section className={styles.notice}>
        <strong>Protection systems, not private-life surveillance.</strong>
        <p>
          This Safety Control Centre shows minimum-necessary operational evidence.
          Sensitive case evidence remains behind Authorised Review or separately
          approved Exceptional Access. Routine monitoring does not expose private
          conversation content.
        </p>
      </section>

      <ControlRoomAreaNavigator
        id="module5-find"
        title="Safety, Privacy & Moderation areas"
        areas={[
          ["Safety Support Health", "module5-health"],
          ["Boundary Events", "module5-boundary-events"],
          ["Privacy & Consent", "module5-privacy-consent"],
          ["Evidence Integrity", "module5-evidence-integrity"],
          ["Reserved Escalation", "module5-reserved-escalation"],
        ]}
      />

      <div id="module5-health" className={styles.moduleJumpTarget}>
        <SafetyPrivacyOperationalHealth
          authenticated={authenticated}
          context="specialist"
        />
      </div>

      <section
        className={`${styles.section} ${styles.moduleJumpTarget}`}
        id="module5-boundary-events"
      >
        <div className={styles.sectionHeading}>
          <div>
            <div className={styles.kicker}>BOUNDARY EVENTS</div>
            <h3>Recent operational boundary activity</h3>
          </div>
          <StatusPill label="PRIVACY-SAFE" compact />
        </div>

        <p className={styles.sectionCopy}>
          These cards contain only minimum-necessary operational fields. Raw
          metadata and private conversation content are deliberately not returned
          to this routine Founder view.
        </p>

        {loadingRecent ? (
          <div className={styles.emptyState}>Checking Staging boundary evidence…</div>
        ) : recent.length === 0 ? (
          <div className={styles.emptyState}>
            No boundary events are recorded in the current evidence window. HIISSA
            does not convert no activity into a false Healthy claim.
          </div>
        ) : (
          <div className={styles.feedbackList}>
            {recent.map((event, index) => (
              <article
                className={styles.feedbackItem}
                key={`${event.created_at || "boundary"}-${index}`}
              >
                <div className={styles.featureMeta}>
                  <span>
                    {humaniseAuditToken(event.boundary_type) || "Boundary type not supplied"}
                  </span>
                  <span>
                    {humaniseAuditToken(event.response_status) || "Status not supplied"}
                  </span>
                </div>
                <p>
                  <strong>
                    {humaniseAuditToken(event.event_type) || "Boundary event"}
                  </strong>
                </p>
                <p className={styles.auditReadableDetail}>
                  Action:{" "}
                  {humaniseAuditToken(event.action_taken) || "Not supplied"}
                </p>
                <p className={styles.auditReadableTime}>
                  <strong>Recorded:</strong>{" "}
                  {event.created_at
                    ? formatHiissaRecordTime(event.created_at)
                    : "Time not supplied"}
                </p>
              </article>
            ))}
          </div>
        )}
      </section>

      <section
        className={`${styles.section} ${styles.moduleJumpTarget}`}
        id="module5-privacy-consent"
      >
        <div className={styles.sectionHeading}>
          <div>
            <div className={styles.kicker}>PRIVACY & CONSENT</div>
            <h3>What this connected source can — and cannot — prove</h3>
          </div>
          <StatusPill label="MONITORING" compact />
        </div>
        <div className={styles.grid}>
          <InfoCard
            title="BOUNDARY SOURCE"
            value="CONNECTED"
            detail="The existing Staging boundary-events source is read through the protected Founder gate."
          />
          <InfoCard
            title="PRIVATE CONVERSATIONS"
            value="NOT EXPOSED"
            detail="Routine operational health does not return private conversation content."
          />
          <InfoCard
            title="CONSENT PROPAGATION"
            value="NOT YET FULLY LIVE-WIRED"
            detail="This source alone does not prove withdrawal propagation, consent expiry or every partner-access boundary."
          />
          <InfoCard
            title="YOUNG HIISSA"
            value="SAME PARENT MODULE"
            detail="Young HIISSA safety remains governed here rather than creating a duplicate safety system."
          />
        </div>
      </section>

      <section
        className={`${styles.section} ${styles.moduleJumpTarget}`}
        id="module5-evidence-integrity"
      >
        <div className={styles.sectionHeading}>
          <div>
            <div className={styles.kicker}>EVIDENCE INTEGRITY</div>
            <h3>Operational evidence stays separate from sensitive case evidence</h3>
          </div>
          <StatusPill label="AUTHORISED REVIEW BOUNDARY" compact />
        </div>
        <p className={styles.sectionCopy}>
          The Control Room may report that operational evidence exists, when it
          was recorded and the pathway state. Original sensitive evidence,
          provenance detail and case material remain behind the appropriate
          authorised review boundary and must preserve their history.
        </p>
        <div className={styles.featureMeta}>
          <span>ORIGINAL EVIDENCE: NEVER SILENTLY REWRITTEN</span>
          <span>RAW BOUNDARY METADATA: NOT RETURNED HERE</span>
          <span>PRIVATE CONTENT: NOT RETURNED HERE</span>
          <span>AMENDMENTS: MUST PRESERVE HISTORY</span>
        </div>
      </section>

      <section
        className={`${styles.section} ${styles.moduleJumpTarget}`}
        id="module5-reserved-escalation"
      >
        <div className={styles.sectionHeading}>
          <div>
            <div className={styles.kicker}>RESERVED ESCALATION</div>
            <h3>High-risk real-world escalation remains separately gated</h3>
          </div>
          <StatusPill label="RESERVED · NOT ENABLED" compact />
        </div>
        <div className={styles.grid}>
          <InfoCard
            title="POLICE / EMERGENCY DIRECT ESCALATION"
            value="NOT ENABLED"
            detail="Requires its own legal pathway, safeguarding review, authority agreement, jurisdiction handling, integration testing and Founder release approval."
          />
          <InfoCard
            title="BREAK-GLASS"
            value="NOT ENABLED"
            detail="Exceptional access remains separate from normal operational viewing."
          />
          <InfoCard
            title="REFERRAL DELIVERY VERIFICATION"
            value="NOT YET SEPARATELY LIVE-WIRED"
            detail="A boundary event is not proof that an external referral was received or accepted."
          />
          <InfoCard
            title="PRODUCTION EFFECT"
            value="NONE"
            detail="This Staging read-only monitoring batch does not activate any Production safety pathway."
          />
        </div>
      </section>
    </>
  );
}

function FailuresReliabilityModule({ module, authenticated, onOverview, onBack }) {
  return (
    <>
      <FounderContextBack onBack={onBack} />
      <div className={styles.pageHeading}>
        <div>
          <div className={styles.kicker}>MODULE 6 — LIVE STAGING RELIABILITY VIEW</div>
          <h2>{module.label}</h2>
          <p>{module.purpose}</p>
        </div>
        <StatusPill label="6 LIVE SOURCES" />
      </div>

      <section className={styles.notice}>
        <strong>A failure is more than a red light.</strong>
        <p>
          This first live reliability connection tells you what HIISSA detected,
          what it already did, whether recovery remains inside a safe automatic
          boundary, and whether you personally need to act. Routine technical
          handling belongs to HIISSA Technical Operations.
        </p>
      </section>

      <ControlRoomAreaNavigator
        id="module6-find"
        title="Failures & Reliability areas"
        areas={[
          ["Safety, Privacy & Moderation", "module6-safety-privacy"],
          ["People Experience", "module6-people"],
          ["Authentication & Sync", "module6-auth-sync"],
          ["AI & Product", "module6-ai-product"],
          ["System & Operations", "module6-system-operations"],
          ["Admin Security & Audit", "module6-admin-security"],
        ]}
      />

      <div id="module6-safety-privacy" className={styles.moduleJumpTarget}>
        <section className={styles.notice}>
          <strong>Safety, Privacy & Moderation reliability cross-reference</strong>
          <p>
            Module 5 owns the Safety Control Centre. Module 6 reuses that same
            protected source when a recorded operational condition becomes a
            reliability issue. No second safety incident source is created.
          </p>
        </section>
        <SafetyPrivacyOperationalHealth
          authenticated={authenticated}
          context="failures"
        />
      </div>

      <div id="module6-people" className={styles.moduleJumpTarget}>
        <PeopleExperienceOperationalHealth authenticated context="failures" />
      </div>

      <div id="module6-auth-sync" className={styles.moduleJumpTarget}>
        <section className={styles.notice}>
          <strong>Authentication & Sync reliability cross-reference</strong>
          <p>
            Module 7 owns identity and continuity health. Module 6 reuses the same
            protected source when an Auth & Sync condition becomes a reliability
            incident. No second incident record is created.
          </p>
        </section>

        <AuthSyncOperationalHealth authenticated />
      </div>

      <div id="module6-ai-product" className={styles.moduleJumpTarget}>
        <section className={styles.notice}>
          <strong>AI & Product reliability cross-reference</strong>
          <p>
            Module 8 owns AI quality and product intelligence. Module 6 reuses the
            same protected source when a recorded quality condition becomes a
            reliability incident. No second evaluator or duplicate incident is created.
          </p>
        </section>

        <AiProductReliabilityCrossReference authenticated />
      </div>

      <div id="module6-system-operations" className={styles.moduleJumpTarget}>
        <section className={styles.notice}>
          <strong>System & Operations reliability cross-reference</strong>
          <p>
            Module 9 owns provider and infrastructure health. Module 6 reuses the
            same provider-health source only when an observed provider condition
            becomes a reliability incident. Missing telemetry permission does not
            create a false outage incident.
          </p>
        </section>

        <SystemOperationsReliabilityCrossReference authenticated />
      </div>

      <div id="module6-admin-security" className={styles.moduleJumpTarget}>
        <section className={styles.notice}>
          <strong>Admin Security & Audit reliability cross-reference</strong>
          <p>
            Module 10 owns Admin access, permission and audit integrity. Module 6
            reuses the same protected security source when a verified control or
            audit-integrity condition becomes a reliability incident. No second
            security incident source is created.
          </p>
        </section>

        <AdminSecurityReliabilityCrossReference authenticated />
      </div>

      <section className={styles.detailBlueprint}>
        <div className={styles.kicker}>PEOPLE EXPERIENCE RELIABILITY CONTRACT</div>
        <div>WHAT HAPPENED<span>Connected audit evidence and classified failure signal</span></div>
        <div>CURRENT STATUS<span>Healthy, connected-no-activity, needs attention or Founder required</span></div>
        <div>WHAT HIISSA DID<span>Safe automatic behaviour / bounded recovery reported in plain English</span></div>
        <div>DO I NEED TO ACT?<span>Founder is separated from Technical Operations work</span></div>
        <div>RECOVERY VERIFICATION<span>No recovery is called successful without verified resulting state</span></div>
        <div>PRIVACY<span>No emotional answer values or private conversation content in routine health</span></div>
      </section>
    </>
  );
}

function AuthSyncHealthModule({ module, onOverview, onBack }) {
  return (
    <>
      <FounderContextBack onBack={onBack} />
      <div className={styles.pageHeading}>
        <div>
          <div className={styles.kicker}>MODULE 7 — LIVE STAGING READ-ONLY</div>
          <h2>{module.label}</h2>
          <p>{module.purpose}</p>
        </div>
        <StatusPill label="AUTH & SYNC CONNECTED" />
      </div>

      <section className={styles.notice}>
        <strong>Working authentication and Save & Sync stay protected.</strong>
        <p>
          This module observes the existing Staging identity, Guest, Save &
          Continue, migration and persistence evidence. It does not reopen or
          rewrite the Stage 4 working core, and it never exposes passwords,
          Magic-Link credentials, tokens, secrets, cookies or conversation
          content simply to show health.
        </p>
      </section>

      <ControlRoomAreaNavigator
        id="module7-find"
        title="Authentication & Sync areas"
        areas={[
          ["Identity health", "module7-health"],
          ["Connected evidence", "module7-evidence"],
          ["Operating principles", "module7-principles"],
        ]}
      />

      <div id="module7-health" className={styles.moduleJumpTarget}>
        <AuthSyncOperationalHealth authenticated evidenceId="module7-evidence" />
      </div>

      <section className={`${styles.detailBlueprint} ${styles.moduleJumpTarget}`} id="module7-principles">
        <div className={styles.kicker}>AUTHENTICATION & SYNC OPERATING PRINCIPLES</div>
        <div>PERMANENT IDENTITY<span>Different devices may have different sessions while resolving to the same permanent identity.</span></div>
        <div>GUEST EXPERIENCE<span>Guest is not an error; Skip is not a failed conversion.</span></div>
        <div>SAVE & CONTINUE<span>Persistence health is visible without exposing conversation content.</span></div>
        <div>GUEST → ACCOUNT MIGRATION<span>Prepared → Available → Claim initiated → Claimed → Verified, using the existing mechanism.</span></div>
        <div>IDENTITY CONFLICT<span>Similar-looking accounts are never casually auto-merged.</span></div>
        <div>FOUNDER ROLE<span>You see the health and authorised next step without becoming HIISSA&apos;s authentication engineer.</span></div>
      </section>
    </>
  );
}

function ModuleFoundation({ module, authenticated, onOverview, onBack }) {
  if (module.id === CONTROL_ROOM_MODULES.feedbackRecommendations && authenticated) {
    return <FeedbackRecommendationsModule module={module} onOverview={onOverview} onBack={onBack} />;
  }

  if (module.id === CONTROL_ROOM_MODULES.adminSecurityAudit && authenticated) {
    return <AdminSecurityAuditModule module={module} onOverview={onOverview} onBack={onBack} />;
  }

  if (module.id === CONTROL_ROOM_MODULES.safetyPrivacyModeration && authenticated) {
    return (
      <SafetyPrivacyModerationModule
        module={module}
        authenticated={authenticated}
        onOverview={onOverview}
        onBack={onBack}
      />
    );
  }

  if (module.id === CONTROL_ROOM_MODULES.failuresReliability && authenticated) {
    return (
      <FailuresReliabilityModule
        module={module}
        authenticated={authenticated}
        onOverview={onOverview}
        onBack={onBack}
      />
    );
  }

  if (module.id === CONTROL_ROOM_MODULES.authSync && authenticated) {
    return <AuthSyncHealthModule module={module} onOverview={onOverview} onBack={onBack} />;
  }

  if (module.id === CONTROL_ROOM_MODULES.aiProduct && authenticated) {
    return <AiProductIntelligenceModule module={module} onOverview={onOverview} onBack={onBack} />;
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

      <ControlRoomAreaNavigator
        id="module4-find"
        title="Feedback & Recommendations areas"
        areas={[
          ["Ratings", "module4-ratings"],
          ["Written feedback", "module4-written-feedback"],
          ["Recommendations", "module4-recommendations"],
          ["Referral growth", "module4-referrals"],
          ["Public reviews", "module4-public-reviews"],
        ]}
      />

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

      <section className={styles.section} id="module4-ratings">
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

      <section className={styles.section} id="module4-written-feedback">
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

      <section className={styles.section} id="module4-recommendations">
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

      <section className={styles.section} id="module4-referrals">
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

      <section className={styles.section} id="module4-public-reviews">
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

function AiProductIntelligenceModule({ module, onOverview, onBack }) {
  const [loading, setLoading] = useState(true);
  const [health, setHealth] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function load() {
      if (!adminDataClient) {
        if (active) {
          setError("The protected Admin data connection is not configured for this environment.");
          setLoading(false);
        }
        return;
      }

      try {
        const {
          data: { session },
        } = await adminDataClient.auth.getSession();

        if (!session?.access_token || !active) {
          setError("Founder Admin session could not be confirmed.");
          setLoading(false);
          return;
        }

        const response = await fetch(
          "/api/admin/control-room/ai-product-health",
          {
            method: "GET",
            cache: "no-store",
            credentials: "same-origin",
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          }
        );

        const data = await response.json().catch(() => null);
        if (!active) return;

        if (!response.ok || !data) {
          setError("The protected AI & Product intelligence source could not be loaded.");
          setLoading(false);
          return;
        }

        setHealth(data);
        setError("");
        setLoading(false);
      } catch {
        if (!active) return;
        setError("The protected AI & Product intelligence source could not be loaded.");
        setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, []);

  const displayStatus = loading
    ? "MONITORING"
    : error
      ? "UNAVAILABLE"
      : health?.displayHealthStatus || "MONITORING";

  const quality = health?.sections?.qualityEvaluator || {};
  const regeneration = health?.sections?.regeneration || {};
  const language = health?.sections?.languageIntelligence || {};
  const feedback = health?.sections?.feedbackSignals || {};
  const youngHiissa = health?.sections?.youngHiissa || {};
  const providerModel = health?.sections?.providerModelCorrelation || {};
  const product = health?.sections?.productIntelligence || {};
  const founderView = health?.founderView || {};
  const qualityCategories = Array.isArray(quality.categorySummary)
    ? quality.categorySummary
    : [];

  const passRate =
    typeof quality.qualityPassRate === "number"
      ? `${quality.qualityPassRate.toFixed(1)}%`
      : "—";

  const languageCoverage =
    typeof language.languageCoveragePercent === "number"
      ? `${language.languageCoveragePercent.toFixed(1)}%`
      : "—";

  return (
    <>
      <FounderContextBack onBack={onBack} />

      <div className={styles.pageHeading}>
        <div>
          <div className={styles.kicker}>MODULE 8 — LIVE STAGING READ-ONLY</div>
          <h2>{module.label}</h2>
          <p>{module.purpose}</p>
        </div>
        <StatusPill
          label={loading ? "CHECKING" : statusLabel(displayStatus)}
        />
      </div>

      <section className={styles.notice}>
        <strong>The existing Quality Evaluator stays in charge.</strong>
        <p>
          Module 8 reads existing privacy-safe Staging quality evidence. It does
          not create a second evaluator, rewrite generated responses, expose
          private conversation content, or silently change models/providers.
        </p>
      </section>

      <section className={styles.notice}>
        <strong>{FOUNDER_AI_PRODUCT_INTELLIGENCE_STANDARD.permanentPrinciple}</strong>
        <p>
          Product intelligence measures whether HIISSA fulfils its human purpose.
          Emotional disclosure, dependency, attention and screen time are not
          optimisation targets.
        </p>
      </section>

      <ControlRoomAreaNavigator
        id="module8-find"
        title="AI & Product areas"
        areas={[
          ["Quality Evaluator", "module8-quality"],
          ["Bounded regeneration", "module8-regeneration"],
          ["Language intelligence", "module8-language"],
          ["Product signals", "module8-product-signals"],
          ["Young HIISSA boundary", "module8-young-hiissa"],
          ["Provider quality", "module8-provider-quality"],
          ["Founder Action / Next Step", "module8-founder-action"],
        ]}
      />

      {error ? (
        <section className={styles.errorPanel}>
          <strong>AI & Product monitoring unavailable</strong>
          <div>{error}</div>
        </section>
      ) : null}

      <div className={styles.grid}>
        <InfoCard
          title="OVERALL AI & PRODUCT HEALTH"
          value={statusLabel(displayStatus)}
          detail={
            founderView.verification ||
            "HIISSA is checking the protected aggregate evidence."
          }
        />
        <InfoCard
          title="QUALITY EVALUATOR"
          value={statusLabel(quality.status || "MONITORING")}
          detail="Existing quality_audit_records evidence only — no second evaluator."
        />
        <InfoCard
          title="EVALUATED RESPONSES"
          value={loading ? "Checking…" : String(quality.evaluatedResponses ?? 0)}
          detail="Privacy-safe audit records observed by the existing Quality Evaluator source."
        />
        <InfoCard
          title="QUALITY PASS RATE"
          value={loading ? "Checking…" : passRate}
          detail="Calculated only from recorded evaluator-success evidence."
        />
        <InfoCard
          title="REGENERATION TRIGGERED"
          value={
            loading
              ? "Checking…"
              : String(regeneration.regenerationTriggeredCount ?? 0)
          }
          detail="Recorded regeneration events only. HIISSA does not invent retry activity."
        />
        <InfoCard
          title="SUCCESSFUL REGENERATION"
          value={
            loading
              ? "Checking…"
              : String(regeneration.successfulRegenerationCount ?? 0)
          }
          detail="Shown only when a recorded regeneration is followed by passing evaluator evidence in the same audit record."
        />
        <InfoCard
          title="LANGUAGE METADATA COVERAGE"
          value={loading ? "Checking…" : languageCoverage}
          detail="Missing language tags are incomplete telemetry, not proof of multilingual quality."
        />
        <InfoCard
          title="FOUNDER ACTION"
          value={health?.founderActionRequired ? "REQUIRED" : "NOT REQUIRED"}
          detail={founderView.doINeedToAct || "No Founder repair action is currently required."}
        />
      </div>

      <section className={styles.section} id="module8-quality">
        <div className={styles.sectionHeading}>
          <div>
            <div className={styles.kicker}>QUALITY EVALUATOR — EXISTING SOURCE</div>
            <h3>What the existing evaluator is recording</h3>
          </div>
          <StatusPill label={statusLabel(quality.status || "MONITORING")} compact />
        </div>

        <p className={styles.sectionCopy}>
          Private response text and evaluator reason text are excluded from this
          Founder view. The dashboard receives only operational quality signals.
        </p>

        {qualityCategories.length === 0 ? (
          <div className={styles.emptyState}>
            {loading
              ? "Checking recorded quality categories…"
              : "No quality-category evidence is currently available."}
          </div>
        ) : (
          <div className={styles.grid}>
            {qualityCategories.map((item) => (
              <InfoCard
                key={item.category}
                title={statusLabel(item.category)}
                value={
                  Number(item.fail || 0) > 0
                    ? `${item.fail} FAILED`
                    : `${item.pass || 0} PASS`
                }
                detail={
                  Number(item.other || 0) > 0
                    ? `${item.other} additional unclassified result(s).`
                    : "Aggregate evaluator category evidence."
                }
              />
            ))}
          </div>
        )}
      </section>

      <section className={styles.section} id="module8-regeneration">
        <div className={styles.sectionHeading}>
          <div>
            <div className={styles.kicker}>BOUNDED REGENERATION</div>
            <h3>Retry only when evidence supports it</h3>
          </div>
          <StatusPill
            label={statusLabel(regeneration.status || "MONITORING")}
            compact
          />
        </div>

        <div className={styles.grid}>
          <InfoCard
            title="NEEDS REVIEW AFTER REGENERATION"
            value={
              loading
                ? "Checking…"
                : String(regeneration.regenerationNeedsReviewCount ?? 0)
            }
            detail="A recorded regeneration that is not proven successful remains visible for investigation."
          />
          <InfoCard
            title="REPEATED-FAILURE SEQUENCE"
            value={
              regeneration.repeatedRegenerationFailureTelemetry ===
              "NOT_YET_SEPARATELY_LIVE_WIRED"
                ? "NOT YET LIVE-WIRED"
                : statusLabel(regeneration.repeatedRegenerationFailureTelemetry)
            }
            detail="HIISSA will not fabricate loop/retry history that the current audit schema does not separately record."
          />
        </div>

        <p className={styles.sectionCopy}>
          Automatic regeneration must remain bounded. Module 8 may surface a
          repeated pattern for investigation, but it cannot silently redesign or
          release HIISSA.
        </p>
      </section>

      <section className={styles.section} id="module8-language">
        <div className={styles.sectionHeading}>
          <div>
            <div className={styles.kicker}>LANGUAGE INTELLIGENCE</div>
            <h3>Technically supported does not mean HIISSA Verified</h3>
          </div>
          <StatusPill label={statusLabel(language.status || "PARTIAL")} compact />
        </div>

        <div className={styles.grid}>
          <InfoCard
            title="MESSAGES OBSERVED"
            value={
              loading
                ? "Checking…"
                : String(language.messageMetadataRowsObserved ?? 0)
            }
            detail="Metadata only — no conversation content is returned to this dashboard."
          />
          <InfoCard
            title="LANGUAGE-TAGGED"
            value={
              loading
                ? "Checking…"
                : String(language.languageTaggedMessages ?? 0)
            }
            detail="Untyped language records remain incomplete telemetry rather than being guessed."
          />
        </div>

        <p className={styles.sectionCopy}>
          {language.lifecycle ||
            "Candidate → Technically Available → Testing → HIISSA Verified → Monitored → Reverification / Restricted"}
        </p>
      </section>

      <section className={styles.section} id="module8-product-signals">
        <div className={styles.sectionHeading}>
          <div>
            <div className={styles.kicker}>AUTHORISED AGGREGATE PRODUCT SIGNALS</div>
            <h3>Reuse feedback without duplicating Module 4</h3>
          </div>
          <StatusPill label={statusLabel(feedback.status || "MONITORING")} compact />
        </div>

        <div className={styles.grid}>
          <InfoCard
            title="FEEDBACK RECORDS"
            value={loading ? "Checking…" : String(feedback.feedbackRecords ?? 0)}
            detail="Aggregate count from the existing Module 4 source of truth."
          />
          <InfoCard
            title="RECOMMENDATIONS"
            value={loading ? "Checking…" : String(feedback.recommendations ?? 0)}
            detail="Aggregate recommendation count only. Private recommendation text stays in Module 4."
          />
          <InfoCard
            title="AVERAGE RATING"
            value={
              typeof feedback.averageRating === "number"
                ? `${feedback.averageRating.toFixed(2)} / 5`
                : "—"
            }
            detail="No rating is fabricated when there is insufficient data."
          />
          <InfoCard
            title="HELPFUL"
            value={
              typeof feedback.helpfulPercentage === "number"
                ? `${feedback.helpfulPercentage.toFixed(1)}%`
                : "—"
            }
            detail="Aggregate helpfulness evidence from the existing feedback source."
          />
        </div>
      </section>

      <section className={styles.section} id="module8-young-hiissa">
        <div className={styles.sectionHeading}>
          <div>
            <div className={styles.kicker}>YOUNG HIISSA QUALITY BOUNDARY</div>
            <h3>Quality monitoring without child surveillance</h3>
          </div>
          <StatusPill label={statusLabel(youngHiissa.status || "NOT YET LIVE WIRED")} compact />
        </div>
        <p className={styles.sectionCopy}>
          {youngHiissa.surveillanceBoundary ||
            FOUNDER_AI_PRODUCT_INTELLIGENCE_STANDARD.youngHiissaBoundary}
        </p>
      </section>

      <section className={styles.section} id="module8-provider-quality">
        <div className={styles.sectionHeading}>
          <div>
            <div className={styles.kicker}>MODEL / PROVIDER QUALITY CORRELATION</div>
            <h3>One provider source — no duplicate monitor</h3>
          </div>
          <StatusPill label={statusLabel(providerModel.status || "NOT YET LIVE WIRED")} compact />
        </div>
        <p className={styles.sectionCopy}>
          {providerModel.sourceBoundary ||
            "Provider operational evidence belongs to Module 9. Module 8 may later correlate authorised aggregate quality evidence without duplicating the provider source."}
        </p>
      </section>

      <section className={styles.section} id="module8-founder-action">
        <a
          className={styles.sectionBackLink}
          href="#module8-find"
          aria-label="AI & Product areas"
        >
          ← AI & Product areas
        </a>
        <div className={styles.sectionHeading}>
          <div>
            <div className={styles.kicker}>FOUNDER ACTION / NEXT STEP</div>
            <h3>What happened, what HIISSA did, and what happens next</h3>
          </div>
        </div>

        <div className={styles.featureList}>
          <article className={styles.featureCard}>
            <div className={styles.featureTop}><strong>WHAT HAPPENED</strong></div>
            <p>{founderView.whatHappened || "Checking connected quality evidence."}</p>
            <p><strong>Severity:</strong> {founderView.severity || "Checking…"}</p>
            <p><strong>User impact:</strong> {founderView.userImpact || "Checking…"}</p>
            <p><strong>Evidence:</strong> {founderView.evidenceClass || "OBSERVED"}</p>
          </article>

          <article className={styles.featureCard}>
            <div className={styles.featureTop}><strong>WHAT HIISSA ALREADY DID</strong></div>
            <p>{founderView.whatHiissaAlreadyDid || "Read aggregate evidence without changing the AI pipeline."}</p>
          </article>

          <article className={styles.featureCard}>
            <div className={styles.featureTop}><strong>DO I NEED TO ACT?</strong></div>
            <p>{founderView.doINeedToAct || "No Founder repair action is currently required."}</p>
          </article>

          <article className={styles.featureCard}>
            <div className={styles.featureTop}><strong>RECOVERY / NEXT STEP</strong></div>
            <p>{founderView.recoveryNextStep || "Continue read-only monitoring."}</p>
          </article>

          <article className={styles.featureCard}>
            <div className={styles.featureTop}><strong>CURRENT RESOLUTION</strong></div>
            <p>{founderView.verification || "Verification pending."}</p>
            <p><strong>Resolution:</strong> {founderView.finalResolution || "Monitoring"}</p>
          </article>

          <article className={styles.featureCard}>
            <div className={styles.featureTop}><strong>AUDIT HISTORY</strong></div>
            <p>
              <strong>Latest quality evidence:</strong>{" "}
              {founderView.auditHistory?.latestQualityEvidenceAt
                ? formatHiissaRecordTime(founderView.auditHistory.latestQualityEvidenceAt)
                : "No verified timestamp"}
            </p>
            <p>
              <strong>Latest message metadata:</strong>{" "}
              {founderView.auditHistory?.latestMessageMetadataAt
                ? formatHiissaRecordTime(founderView.auditHistory.latestMessageMetadataAt)
                : "No verified timestamp"}
            </p>
          </article>

          <details className={styles.featureCard}>
            <summary><strong>TECHNICAL DETAILS — expand</strong></summary>
            <p>
              This view intentionally excludes private conversation content,
              private feedback text, evaluator reason text and provider secrets.
            </p>
            <p><strong>Environment:</strong> {founderView.technicalDetails?.environment || "STAGING"}</p>
            <p><strong>Quality source:</strong> {founderView.technicalDetails?.qualitySource || "quality_audit_records"}</p>
            <p><strong>Production effect:</strong> NONE</p>
          </details>
        </div>
      </section>

      <section className={styles.detailBlueprint}>
        <div className={styles.kicker}>MODULE 8 OPERATIONAL BOUNDARIES</div>
        <div>QUALITY EVALUATOR<span>Existing source reused; no duplicate evaluator</span></div>
        <div>PRIVATE CONVERSATIONS<span>Not exposed for aggregate health</span></div>
        <div>FEEDBACK SOURCE<span>Module 4 remains authoritative</span></div>
        <div>MODEL / PROVIDER CHANGES<span>Founder-gated; never silent</span></div>
        <div>PRODUCT OPTIMISATION<span>Human purpose, not vulnerability or screen time</span></div>
        <div>PRODUCTION EFFECT<span>None — Staging read-only intelligence</span></div>
      </section>
    </>
  );
}

function SystemOperationsModule({ module, onOverview, onBack }) {
  const providers = FOUNDER_PROVIDER_SUBSCRIPTION_SPEND_STANDARD.providerRegister;
  const [openAiLoading, setOpenAiLoading] = useState(true);
  const [openAiSummary, setOpenAiSummary] = useState(null);
  const [openAiError, setOpenAiError] = useState("");
  const [systemHealthLoading, setSystemHealthLoading] = useState(true);
  const [systemHealth, setSystemHealth] = useState(null);
  const [systemHealthError, setSystemHealthError] = useState("");

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

  useEffect(() => {
    let active = true;

    async function loadSystemOperationsHealth() {
      if (!adminDataClient) {
        if (active) {
          setSystemHealthError(
            "The protected Admin data connection is not configured for this environment."
          );
          setSystemHealthLoading(false);
        }
        return;
      }

      try {
        const {
          data: { session },
        } = await adminDataClient.auth.getSession();

        if (!session?.access_token || !active) {
          setSystemHealthError(
            "Your Founder Admin session could not be confirmed for provider-health monitoring."
          );
          setSystemHealthLoading(false);
          return;
        }

        const response = await fetch(
          "/api/admin/control-room/system-operations-health",
          {
            method: "GET",
            cache: "no-store",
            credentials: "same-origin",
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          }
        );

        const data = await response.json().catch(() => null);
        if (!active) return;

        if (!response.ok || !data) {
          setSystemHealthError(
            "The protected System & Operations health source could not be loaded."
          );
          setSystemHealthLoading(false);
          return;
        }

        setSystemHealth(data);
        setSystemHealthError("");
        setSystemHealthLoading(false);
      } catch {
        if (!active) return;
        setSystemHealthError(
          "The protected System & Operations health source could not be loaded."
        );
        setSystemHealthLoading(false);
      }
    }

    loadSystemOperationsHealth();
    return () => {
      active = false;
    };
  }, []);

  function formatNumber(value) {
    return typeof value === "number" && Number.isFinite(value)
      ? new Intl.NumberFormat("en-GB").format(value)
      : "—";
  }

  function formatUsage(usage) {
    if (!usage || typeof usage.used !== "number") return "—";
    return typeof usage.limit === "number"
      ? `${formatNumber(usage.used)} / ${formatNumber(usage.limit)}`
      : formatNumber(usage.used);
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

  const systemDisplayStatus = systemHealthLoading
    ? "CHECKING"
    : systemHealthError
      ? "UNAVAILABLE"
      : systemHealth?.displayHealthStatus || "MONITORING";

  const supabaseHealth = systemHealth?.providers?.supabase || {};
  const resendHealth = systemHealth?.providers?.resend || {};
  const vercelHealth = systemHealth?.providers?.vercel || {};
  const systemFounderView = systemHealth?.founderView || {};

  function providerStatusFor(providerId) {
    if (providerId === "openai-api") return openAiStatus.replaceAll("_", " ");
    if (providerId === "supabase") {
      return systemHealthLoading
        ? "CHECKING"
        : statusLabel(supabaseHealth.status || "MONITORING");
    }
    if (providerId === "resend") {
      return systemHealthLoading
        ? "CHECKING"
        : statusLabel(resendHealth.status || "MONITORING");
    }
    if (providerId === "vercel") {
      return systemHealthLoading
        ? "CHECKING"
        : statusLabel(vercelHealth.status || "MONITORING");
    }

    return providerId === "cloudflare"
      ? systemHealth?.providers?.cloudflare?.turnstileConfigured
        ? "CONFIGURED · HEALTH TELEMETRY PARTIAL"
        : "SOURCE TO CONNECT"
      : "SOURCE TO CONNECT";
  }

  const verificationSnapshot = [
    {
      label: "Vercel",
      value: "BILLING DATA VERIFIED",
      detail: "Authorised development tooling returned real HIISSA team billing/usage records for the current period. The Control Room live feed still needs its own secure connection.",
    },
    {
      label: "Supabase",
      value: "FREE PLAN · 2 PROJECTS VERIFIED",
      detail: "Development verification confirmed the HIISSA organisation Free plan and two projects. Current live database health is shown separately above.",
    },
    {
      label: "Resend",
      value: "DOMAIN + USAGE SOURCE VERIFIED",
      detail: "Development verification confirmed hiissa.com and Resend account usage visibility. Current live usage is shown separately above when the Staging credential has the required read permission.",
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
        <StatusPill label={statusLabel(systemDisplayStatus)} />
      </div>

      <section className={styles.notice}>
        <strong>Founder business visibility — no fabricated money data.</strong>
        <p>
          HIISSA will bring provider subscriptions, API capacity, recurring costs,
          renewal dates and service health into one Founder view. A cost, balance,
          plan or renewal date appears only when its source is verified.
        </p>
      </section>

      <ControlRoomAreaNavigator
        title="System & Operations areas"
        areas={[
          ["Provider Health", "module9-provider-health"],
          ["Usage & Billing", "module9-usage-billing"],
          ["Provider Register", "module9-provider-register"],
          ["Historical Evidence", "module9-history"],
          ["Founder Action / Next Step", "module9-founder-action"],
        ]}
      />

      <section
        className={styles.quickFind}
        id="module9-find"
        aria-labelledby="module9-find-heading"
      >
        <div>
          <div className={styles.kicker}>FIND WHAT YOU NEED</div>
          <h3 id="module9-find-heading">Go straight to the right System & Operations area</h3>
          <p>
            You should not have to search through a long Control Room page. Choose
            what you want to check and HIISSA will take you directly there.
          </p>
        </div>

        <div className={styles.quickFindGrid}>
          <a className={styles.quickFindLink} href="#module9-provider-health">
            <strong>Provider Health</strong>
            <span>Live service status, outages and attention</span>
          </a>
          <a className={styles.quickFindLink} href="#module9-usage-billing">
            <strong>Usage & Billing</strong>
            <span>Usage, capacity, billing sources and renewal visibility</span>
          </a>
          <a className={styles.quickFindLink} href="#module9-provider-register">
            <strong>Provider Register</strong>
            <span>Everything HIISSA depends on and each source state</span>
          </a>
          <a className={styles.quickFindLink} href="#module9-history">
            <strong>Historical Evidence</strong>
            <span>Previously verified plan, usage and provider checks</span>
          </a>
          <a className={styles.quickFindLink} href="#module9-founder-action">
            <strong>Founder Action / Next Step</strong>
            <span>What needs you, what HIISSA did and what happens next</span>
          </a>
        </div>
      </section>

      <section className={styles.section} id="module9-provider-health">
        <a
          className={styles.sectionBackLink}
          href="#module9-find"
          aria-label="Back to System & Operations areas"
        >
          ← System & Operations areas
        </a>
        <div className={styles.sectionHeading}>
          <div>
            <div className={styles.kicker}>PROVIDER HEALTH — LIVE NOW</div>
            <h3>Is each provider working right now?</h3>
          </div>
          <StatusPill label={statusLabel(systemDisplayStatus)} compact />
        </div>

        <p className={styles.sectionCopy}>
          Live service health is kept separate from billing snapshots. A provider
          can be operational while billing telemetry is still not connected, and
          missing telemetry permission is not automatically treated as a service
          failure.
        </p>

        {systemHealthError ? (
          <section className={styles.errorPanel}>
            <strong>System Operations monitoring unavailable</strong>
            <div>{systemHealthError}</div>
          </section>
        ) : null}

        <div className={styles.grid}>
          <InfoCard
            title="SUPABASE DATABASE HEALTH"
            value={
              systemHealthLoading
                ? "Checking…"
                : statusLabel(supabaseHealth.status || "MONITORING")
            }
            detail={
              supabaseHealth.detail ||
              "Checking the protected privacy-safe database health source."
            }
          />
          <InfoCard
            title="SUPABASE HEALTH PROBE"
            value={
              systemHealthLoading
                ? "Checking…"
                : typeof supabaseHealth.latencyMs === "number"
                  ? `${supabaseHealth.latencyMs} ms`
                  : "—"
            }
            detail="Operational response time for the aggregate Staging health probe only; no conversation content is returned."
          />
          <InfoCard
            title="RESEND PROVIDER HEALTH"
            value={
              systemHealthLoading
                ? "Checking…"
                : statusLabel(resendHealth.status || "MONITORING")
            }
            detail={
              resendHealth.detail ||
              "Checking the existing Resend Staging provider source."
            }
          />
          <InfoCard
            title="RESEND MONTHLY EMAILS"
            value={
              systemHealthLoading
                ? "Checking…"
                : formatUsage(resendHealth.monthlyEmails)
            }
            detail={
              typeof resendHealth.monthlyRemainingPercent === "number"
                ? `${resendHealth.monthlyRemainingPercent}% of the connected monthly quota remains.`
                : "Shown only when the existing Staging credential can read account-level usage."
            }
          />
          <InfoCard
            title="RESEND DAILY EMAILS"
            value={
              systemHealthLoading
                ? "Checking…"
                : formatUsage(resendHealth.dailyEmails)
            }
            detail="Current daily account usage from the provider source when authorised."
          />
          <InfoCard
            title="RESEND VERIFIED DOMAINS"
            value={
              systemHealthLoading
                ? "Checking…"
                : String(resendHealth.verifiedDomains ?? "—")
            }
            detail="Provider domain status only. No email contents or recipients are exposed."
          />
          <InfoCard
            title="VERCEL RUNTIME"
            value={
              systemHealthLoading
                ? "Checking…"
                : statusLabel(vercelHealth.status || "MONITORING")
            }
            detail={
              vercelHealth.detail ||
              "Current deployment/runtime evidence only; billing is a separate source."
            }
          />
          <InfoCard
            title="LIVE PROVIDER ATTENTION"
            value={
              systemHealthLoading
                ? "Checking…"
                : String(systemHealth?.needsAttentionCount ?? 0)
            }
            detail={
              systemFounderView.doINeedToAct ||
              "No Founder repair action is currently required."
            }
          />
        </div>

        <div className={styles.featureMeta}>
          <span>READ ONLY</span>
          <span>STAGING ONLY</span>
          <span>NO RAW PROVIDER CREDENTIALS</span>
          <span>NO PAYMENT CARD DETAILS</span>
          <span>NO AUTOMATIC MONEY MOVEMENT</span>
        </div>
        <a className={styles.sectionReturnLink} href="#module9-find">
          ↑ System & Operations areas
        </a>
      </section>

      <div className={styles.grid}>
        <InfoCard
          title="SYSTEM & OPERATIONS HEALTH"
          value={statusLabel(systemDisplayStatus)}
          detail={
            systemFounderView.verification ||
            "Connected live provider health is shown separately from unconnected billing/usage sources."
          }
        />
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

      <section className={styles.section} id="module9-usage-billing">
        <a
          className={styles.sectionBackLink}
          href="#module9-find"
          aria-label="Back to System & Operations areas"
        >
          ← System & Operations areas
        </a>
        <div className={styles.sectionHeading}>
          <div>
            <div className={styles.kicker}>USAGE & BILLING SOURCES</div>
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
        <a className={styles.sectionReturnLink} href="#module9-find">
          ↑ System & Operations areas
        </a>
      </section>

      <section className={styles.section} id="module9-history">
        <a
          className={styles.sectionBackLink}
          href="#module9-find"
          aria-label="Back to System & Operations areas"
        >
          ← System & Operations areas
        </a>
        <div className={styles.sectionHeading}>
          <div>
            <div className={styles.kicker}>HISTORICAL EVIDENCE — PREVIOUSLY VERIFIED</div>
            <h3>What was verified outside the live provider-health source</h3>
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
        <a className={styles.sectionReturnLink} href="#module9-find">
          ↑ System & Operations areas
        </a>
      </section>

      <section className={styles.section} id="module9-provider-register">
        <a
          className={styles.sectionBackLink}
          href="#module9-find"
          aria-label="Back to System & Operations areas"
        >
          ← System & Operations areas
        </a>
        <div className={styles.sectionHeading}>
          <div>
            <div className={styles.kicker}>PROVIDER REGISTER — WHAT HIISSA DEPENDS ON</div>
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
                  label={providerStatusFor(provider.id)}
                  compact
                />
              </div>
              <p><strong>Current evidence:</strong> {provider.evidence}</p>
              <p><strong>Billing / usage source:</strong> {provider.currentFinancialSource}</p>
              <p><strong>Founder view will include:</strong> {provider.requiredView}</p>
            </article>
          ))}
        </div>
        <a className={styles.sectionReturnLink} href="#module9-find">
          ↑ System & Operations areas
        </a>
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

      <section className={styles.section} id="module9-founder-action">
        <div className={styles.sectionHeading}>
          <div>
            <div className={styles.kicker}>FOUNDER OPERATIONAL VIEW</div>
            <h3>What happened, what HIISSA did, and what happens next</h3>
          </div>
        </div>

        <div className={styles.featureList}>
          <article className={styles.featureCard}>
            <div className={styles.featureTop}><strong>WHAT HAPPENED</strong></div>
            <p>{systemFounderView.whatHappened || "Checking connected provider evidence."}</p>
            <p><strong>Severity:</strong> {systemFounderView.severity || "Checking…"}</p>
            <p><strong>User impact:</strong> {systemFounderView.userImpact || "Checking…"}</p>
          </article>

          <article className={styles.featureCard}>
            <div className={styles.featureTop}><strong>WHAT HIISSA ALREADY DID</strong></div>
            <p>{systemFounderView.whatHiissaAlreadyDid || "Read protected provider evidence without changing the providers."}</p>
          </article>

          <article className={styles.featureCard}>
            <div className={styles.featureTop}><strong>DO I NEED TO ACT?</strong></div>
            <p>{systemFounderView.doINeedToAct || "No Founder repair action is currently required."}</p>
          </article>

          <article className={styles.featureCard}>
            <div className={styles.featureTop}><strong>RECOVERY / NEXT STEP</strong></div>
            <p>{systemFounderView.recoveryNextStep || "Continue read-only provider monitoring."}</p>
          </article>

          <article className={styles.featureCard}>
            <div className={styles.featureTop}><strong>CURRENT RESOLUTION</strong></div>
            <p>{systemFounderView.verification || "Verification pending."}</p>
            <p><strong>Resolution:</strong> {systemFounderView.finalResolution || "Monitoring"}</p>
          </article>

          <details className={styles.featureCard}>
            <summary><strong>TECHNICAL DETAILS — expand</strong></summary>
            <p>
              Raw API keys, passwords, tokens, payment-card details and
              conversation content are intentionally excluded from this view.
            </p>
            <p><strong>Environment:</strong> STAGING</p>
            <p><strong>Production effect:</strong> NONE</p>
          </details>
        </div>
        <a className={styles.sectionReturnLink} href="#module9-find">
          ↑ System & Operations areas
        </a>
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

function AuthSyncSecurityBoundarySummary() {
  const [loading, setLoading] = useState(true);
  const [health, setHealth] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const {
          data: { session },
        } = await adminDataClient.auth.getSession();

        if (!session?.access_token || !active) {
          setError("Founder Admin session could not be confirmed.");
          setLoading(false);
          return;
        }

        const response = await fetch("/api/admin/control-room/auth-sync-health", {
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
          setError("Auth & Sync security-relevant evidence could not be loaded.");
          setLoading(false);
          return;
        }

        setHealth(data);
        setLoading(false);
      } catch {
        if (!active) return;
        setError("Auth & Sync security-relevant evidence could not be loaded.");
        setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, []);

  const conflicts =
    health?.sections?.guestAccountMigration?.possibleIdentityConflicts;
  const status = loading
    ? "MONITORING"
    : error
      ? "UNAVAILABLE"
      : Number(conflicts || 0) > 0
        ? "CRITICAL"
        : "MONITORING";

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeading}>
        <div>
          <div className={styles.kicker}>AUTH & SYNC · SECURITY CROSS-REFERENCE</div>
          <h3>Identity and ownership boundary</h3>
        </div>
        <StatusPill label={statusLabel(status)} compact />
      </div>

      <p className={styles.sectionCopy}>
        This is the same Module 7 source, not a duplicate security record.
        Different device sessions are normal. Only evidence suggesting conflicting
        permanent ownership reaches this security boundary.
      </p>

      <div className={styles.grid}>
        <InfoCard
          title="POSSIBLE IDENTITY CONFLICTS"
          value={loading ? "Checking…" : error ? "Unavailable" : String(conflicts ?? 0)}
          detail="Similar-looking accounts are never auto-merged. A genuine ownership conflict requires authorised review."
        />
        <InfoCard
          title="AUTH & SYNC FOUNDER ACTION"
          value={
            health?.founderActionRequired
              ? "REQUIRED"
              : loading
                ? "Checking…"
                : "NOT REQUIRED"
          }
          detail={
            health?.founderView?.doINeedToAct ||
            "No security-relevant Auth & Sync Founder action is currently established."
          }
        />
      </div>
    </section>
  );
}

function ControlRoomAreaNavigator({
  title,
  subtitle = "Jump directly to what you need",
  areas,
  id,
}) {
  return (
    <details className={styles.moduleAreaNavigator} id={id}>
      <summary>
        <strong>{title}</strong>
        <span>{subtitle}</span>
      </summary>
      <div className={styles.moduleAreaNavigatorGrid}>
        {(areas || []).map(([label, targetId]) => (
          <a key={targetId} href={`#${targetId}`}>{label}</a>
        ))}
      </div>
    </details>
  );
}

function SecurityAuditAreaNavigator() {
  return (
    <ControlRoomAreaNavigator
      title="Security & Audit areas"
      areas={[
        ["Security Health", "module10-security-health"],
        ["Roles & Permissions", "module10-roles-permissions"],
        ["Approvals & Sensitive Actions", "module10-approvals"],
        ["Staff Access & Onboarding", "module10-staff-access"],
        ["Audit Trail", "module10-audit"],
        ["Exceptional Access & Break-Glass", "module10-exceptional-access"],
      ]}
    />
  );
}

function humaniseAuditToken(value) {
  const source = String(value || "").trim();
  if (!source) return "";
  return source
    .replaceAll("_", " ")
    .replaceAll("-", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function auditEventPresentation(event) {
  if (
    event?.event_type === "founder_control_room_visit" &&
    event?.action_id === "enter_control_room"
  ) {
    return {
      title: "Founder opened the Control Room",
      detail: "You entered the Founder Control Room.",
    };
  }

  const title = humaniseAuditToken(event?.event_type) || "Admin activity recorded";
  const action = humaniseAuditToken(event?.action_id);

  return {
    title,
    detail: action ? `Action: ${action}.` : "A protected Admin activity was recorded.",
  };
}

function auditOutcomeLabel(value) {
  const token = String(value || "").toLowerCase();
  if (["recorded", "success", "succeeded", "complete", "completed"].includes(token)) {
    return "Recorded successfully";
  }
  if (["failed", "error"].includes(token)) return "Needs attention";
  return humaniseAuditToken(value) || "Outcome not supplied";
}

function auditEnvironmentLabel(value) {
  const token = String(value || "").toLowerCase();
  if (token === "staging") return "Staging";
  if (token === "production") return "Production";
  return humaniseAuditToken(value) || "Environment not supplied";
}

function auditOversightLabel(value) {
  const level = Number(value);
  if (level === 1) return "Routine oversight (L1)";
  if (level === 2) return "Founder notification level (L2)";
  if (level === 3) return "Founder approval level (L3)";
  return value != null ? `Oversight level L${value}` : "Oversight level not supplied";
}

function formatAuditTime(value) {
  if (!value) return "Time not supplied";
  const parsed = new Date(value);
  if (!Number.isFinite(parsed.getTime())) return "Time not supplied";
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(parsed);
  } catch {
    return parsed.toLocaleString();
  }
}

function groupFounderAuditEvents(events) {
  const groups = [];

  for (const event of events || []) {
    const isRoutineVisit =
      event?.event_type === "founder_control_room_visit" &&
      event?.action_id === "enter_control_room";

    if (isRoutineVisit) {
      const existing = groups.find((group) => group.kind === "routine-founder-visit");
      if (existing) {
        existing.count += 1;
        continue;
      }
      groups.push({
        kind: "routine-founder-visit",
        count: 1,
        event,
      });
      continue;
    }

    groups.push({
      kind: "event",
      count: 1,
      event,
    });
  }

  return groups;
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
  const founderView = summary?.founderView || {};
  const status = loading
    ? "CHECKING"
    : error
      ? "UNAVAILABLE"
      : summary?.displayHealthStatus || summary?.status || "MONITORING";
  const groupedAuditEvents = groupFounderAuditEvents(summary?.recentAuditEvents || []);

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

      <SecurityAuditAreaNavigator />

      <section
        className={styles.quickFind}
        id="module10-find"
        aria-labelledby="module10-find-heading"
      >
        <div>
          <div className={styles.kicker}>FIND WHAT YOU NEED</div>
          <h3 id="module10-find-heading">Go straight to the right Security & Audit area</h3>
          <p>
            Security should be understandable without hunting through technical
            administration screens. Choose the area you want and HIISSA will take
            you directly there.
          </p>
        </div>

        <div className={styles.quickFindGrid}>
          <a className={styles.quickFindLink} href="#module10-security-health">
            <strong>Security Health</strong>
            <span>Live access, permission and audit health</span>
          </a>
          <a className={styles.quickFindLink} href="#module10-roles-permissions">
            <strong>Roles & Permissions</strong>
            <span>Roles, permission rules and active assignments</span>
          </a>
          <a className={styles.quickFindLink} href="#module10-approvals">
            <strong>Approvals & Sensitive Actions</strong>
            <span>Founder gate, L3 actions and approval boundaries</span>
          </a>
          <a className={styles.quickFindLink} href="#module10-staff-access">
            <strong>Staff Access & Onboarding</strong>
            <span>How Admin access is invited, approved and removed</span>
          </a>
          <a className={styles.quickFindLink} href="#module10-audit">
            <strong>Audit Trail</strong>
            <span>Attributable Admin activity and oversight levels</span>
          </a>
          <a className={styles.quickFindLink} href="#module10-exceptional-access">
            <strong>Exceptional Access & Break-Glass</strong>
            <span>Reserved high-risk access boundaries and protections</span>
          </a>
        </div>
      </section>

      {error ? (
        <section className={styles.errorPanel}>
          <strong>Needs attention</strong>
          <div>{error}</div>
        </section>
      ) : null}

      <section className={styles.section} id="module10-security-health">
        <a
          className={styles.sectionBackLink}
          href="#module10-find"
          aria-label="Back to Security & Audit areas"
        >
          ← Security & Audit areas
        </a>

        <div className={styles.sectionHeading}>
          <div>
            <div className={styles.kicker}>SECURITY HEALTH — LIVE STAGING EVIDENCE</div>
            <h3>Is Admin access and accountability behaving as intended?</h3>
          </div>
          <StatusPill label={statusLabel(status)} compact />
        </div>

        <p className={styles.sectionCopy}>
          Monitoring stays separate from Healthy. HIISSA reports only what the
          connected access, permission, approval and audit sources can actually prove.
        </p>

        <div className={styles.grid}>
          <InfoCard
            title="ADMIN SECURITY HEALTH"
            value={statusLabel(status)}
            detail={
              founderView.verification ||
              "Checking the protected security and audit sources."
            }
          />
          <InfoCard
            title="CURRENT ADMIN GATE"
            value={loading ? "Checking…" : String(counts.legacyAdminAccounts ?? "—")}
            detail="Accounts currently authorised by the existing protected Admin gate."
          />
          <InfoCard
            title="ACTIVE ROLE ASSIGNMENTS"
            value={loading ? "Checking…" : String(counts.activeRoleAssignments ?? "—")}
            detail="Assignments in the newer role-based administration foundation. Zero is not treated as a failure while staff-management controls remain intentionally disabled."
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
            detail="Temporary or specific active access grants that have not expired or been revoked."
          />
          <InfoCard
            title="L3 AUDIT EVENTS"
            value={loading ? "Checking…" : String(counts.l3AuditEvents ?? "—")}
            detail="Recorded high-oversight Admin activity in the connected audit evidence."
          />
          <InfoCard
            title="UNATTRIBUTED L3 EVENTS"
            value={loading ? "Checking…" : String(counts.unattributedL3AuditEvents ?? "—")}
            detail="L3 events must remain attributable. A non-zero value becomes a security-integrity condition."
          />
          <InfoCard
            title="SELF-GRANTED ACCESS"
            value={loading ? "Checking…" : String(counts.selfGrantedAccess ?? "—")}
            detail="Active Admin access must not be silently granted by the same person receiving it."
          />
          <InfoCard
            title="FOUNDER ACTION"
            value={
              loading
                ? "Checking…"
                : summary?.founderActionRequired
                  ? "REQUIRED"
                  : "NOT REQUIRED"
            }
            detail={
              founderView.doINeedToAct ||
              "No Founder repair action is currently required."
            }
          />
        </div>

        <div className={styles.featureList}>
          <article className={styles.featureCard}>
            <div className={styles.featureTop}><strong>WHAT HAPPENED</strong></div>
            <p>{founderView.whatHappened || "Checking connected Admin Security evidence."}</p>
            <p><strong>Severity:</strong> {founderView.severity || "Checking…"}</p>
            <p><strong>User impact:</strong> {founderView.userImpact || "Checking…"}</p>
          </article>

          <article className={styles.featureCard}>
            <div className={styles.featureTop}><strong>WHAT HIISSA ALREADY DID</strong></div>
            <p>{founderView.whatHiissaAlreadyDid || "Read the protected security evidence without changing access."}</p>
          </article>

          <article className={styles.featureCard}>
            <div className={styles.featureTop}><strong>RECOVERY / NEXT STEP</strong></div>
            <p>{founderView.recoveryNextStep || "Continue read-only monitoring."}</p>
          </article>

          <article className={styles.featureCard}>
            <div className={styles.featureTop}><strong>CURRENT RESOLUTION</strong></div>
            <p>{founderView.finalResolution || "Monitoring"}</p>
          </article>
        </div>

        <a className={styles.sectionReturnLink} href="#module10-find">
          ↑ Security & Audit areas
        </a>
      </section>

      <AuthSyncSecurityBoundarySummary />

      <section className={styles.section} id="module10-roles-permissions">
        <a className={styles.sectionBackLink} href="#module10-find">
          ← Security & Audit areas
        </a>
        <div className={styles.sectionHeading}>
          <div>
            <div className={styles.kicker}>ROLES & PERMISSIONS</div>
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
        <a className={styles.sectionReturnLink} href="#module10-find">
          ↑ Security & Audit areas
        </a>
      </section>

      <section className={styles.section} id="module10-approvals">
        <a className={styles.sectionBackLink} href="#module10-find">
          ← Security & Audit areas
        </a>
        <div className={styles.sectionHeading}>
          <div>
            <div className={styles.kicker}>APPROVALS & SENSITIVE ACTIONS</div>
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
        <a className={styles.sectionReturnLink} href="#module10-find">
          ↑ Security & Audit areas
        </a>
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

      <section className={styles.section} id="module10-staff-access">
        <a className={styles.sectionBackLink} href="#module10-find">
          ← Security & Audit areas
        </a>
        <div className={styles.sectionHeading}>
          <div>
            <div className={styles.kicker}>STAFF ACCESS & ONBOARDING</div>
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
        <a className={styles.sectionReturnLink} href="#module10-find">
          ↑ Security & Audit areas
        </a>
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

      <section className={styles.section} id="module10-exceptional-access">
        <a className={styles.sectionBackLink} href="#module10-find">
          ← Security & Audit areas
        </a>

        <div className={styles.sectionHeading}>
          <div>
            <div className={styles.kicker}>EXCEPTIONAL ACCESS & BREAK-GLASS</div>
            <h3>High-risk access stays separate from ordinary Admin access</h3>
          </div>
          <StatusPill label="RESERVED · NOT ENABLED" compact />
        </div>

        <p className={styles.sectionCopy}>
          {FOUNDER_ADMIN_SECURITY_AUDIT_STANDARD.exceptionalAccessRule}
        </p>

        <div className={styles.grid}>
          <InfoCard
            title="BREAK-GLASS ACCESS"
            value="NOT ENABLED"
            detail={FOUNDER_ADMIN_SECURITY_AUDIT_STANDARD.breakGlassRule}
          />
          <InfoCard
            title="INVISIBLE LOGIN AS USER"
            value="NOT ALLOWED"
            detail={FOUNDER_ADMIN_SECURITY_AUDIT_STANDARD.loginAsUserRule}
          />
          <InfoCard
            title="STEP-UP AUTHENTICATION"
            value={statusLabel(summary?.sections?.exceptionalAccess?.stepUpAuthentication || "NOT YET LIVE WIRED")}
            detail="Sensitive action step-up remains a separate certification item; this read-only module does not pretend it is active."
          />
          <InfoCard
            title="PRODUCTION CHANGES"
            value="NOT ENABLED"
            detail="Production privileges remain separated from this Staging security module."
          />
        </div>

        <div className={styles.prototypeReviewBlock}>
          <strong>Permanent security principle</strong>
          <p>{FOUNDER_ADMIN_SECURITY_AUDIT_STANDARD.permanentPrinciple}</p>
        </div>

        <a className={styles.sectionReturnLink} href="#module10-find">
          ↑ Security & Audit areas
        </a>
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
        <a className={styles.sectionReturnLink} href="#module10-find">
          ↑ Security & Audit areas
        </a>
      </section>

      <section className={styles.section} id="module10-audit">
        <a className={styles.sectionBackLink} href="#module10-find">
          ← Security & Audit areas
        </a>
        <div className={styles.sectionHeading}>
          <div>
            <div className={styles.kicker}>AUDIT TRAIL</div>
            <h3>Recent Admin security activity</h3>
          </div>
        </div>

        <p className={styles.sectionCopy}>
          This is the Founder-friendly view of recent Admin security activity.
          Technical event names remain available underneath each item when you need them.
        </p>

        {groupedAuditEvents.length === 0 ? (
          <div className={styles.emptyState}>
            No events have yet been written to the newer Admin audit foundation.
          </div>
        ) : (
          <div className={styles.feedbackList}>
            {groupedAuditEvents.map((group, index) => {
              const event = group.event;
              const presentation = auditEventPresentation(event);
              const repeatedRoutineVisit = group.kind === "routine-founder-visit" && group.count > 1;

              return (
                <article className={styles.feedbackItem} key={`${event.occurred_at || "audit"}-${index}`}>
                  <div className={styles.featureMeta}>
                    <span>{auditEnvironmentLabel(event.environment)}</span>
                    <span>{auditOutcomeLabel(event.outcome)}</span>
                    <span>{auditOversightLabel(event.oversight_level)}</span>
                  </div>

                  <p className={styles.auditReadableTitle}>
                    <strong>{presentation.title}</strong>
                  </p>
                  <p className={styles.auditReadableDetail}>
                    {repeatedRoutineVisit
                      ? `${group.count} recent Control Room visits are grouped here so routine activity does not crowd the page.`
                      : presentation.detail}
                  </p>
                  <p className={styles.auditReadableTime}>
                    <strong>Most recent:</strong> {formatAuditTime(event.occurred_at)}
                  </p>

                  <details className={styles.auditTechnical}>
                    <summary>Technical details</summary>
                    <div>
                      <code>event_type: {event.event_type || "not supplied"}</code>
                      <code>action_id: {event.action_id || "not supplied"}</code>
                    </div>
                  </details>
                </article>
              );
            })}
          </div>
        )}
        <a className={styles.sectionReturnLink} href="#module10-find">
          ↑ Security & Audit areas
        </a>
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
