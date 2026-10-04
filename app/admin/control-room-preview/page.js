"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import styles from "./page.module.css";
import {
  CONTROL_ROOM_MODULES,
  CONTROL_ROOM_MODULE_REGISTRY,
  EXPERIENCE_REGISTRY,
  FEATURE_OPERATIONAL_VISIBILITY_STANDARD,
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

function statusLabel(value) {
  return String(value || "unknown").replaceAll("-", " ").toUpperCase();
}

export default function FounderControlRoomPreview({ authenticated = false, onSignOut = null, environmentLabel = "ISOLATED PREVIEW", environmentNote = "Structure and Registry wiring only — no fabricated live metrics" } = {}) {
  const [activeId, setActiveId] = useState(CONTROL_ROOM_MODULES.overview);
  const [menuOpen, setMenuOpen] = useState(false);

  const activeModule = useMemo(
    () => MODULES.find((item) => item.id === activeId) || MODULES[0],
    [activeId]
  );

  const registeredFeatures = FEATURE_KEYS.map((key) => EXPERIENCE_REGISTRY[key]).filter(Boolean);

  function chooseModule(id) {
    setActiveId(id);
    setMenuOpen(false);
  }

  return (
    <main className={styles.page}>
      <section className={styles.shell}>
        <header className={styles.header}>
          <div>
            <div className={styles.kicker}>HIISSA — FOUNDER CONTROL ROOM</div>
            <h1>Control Room</h1>
            <div className={styles.environmentRow}>
              <span className={styles.environment}>{environmentLabel}</span>
              <span className={styles.environmentNote}>{environmentNote}</span>
            </div>
          </div>

          <div className={styles.headerActions}>
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
          <strong>{activeModule.short}</strong>
        </div>

        <div className={styles.body}>
          <nav
            id="control-room-nav"
            className={menuOpen ? `${styles.nav} ${styles.navOpen}` : styles.nav}
            aria-label="Founder Control Room modules"
          >
            {MODULES.map((module) => (
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

          <section className={styles.content}>
            {activeId === CONTROL_ROOM_MODULES.overview ? (
              <Overview registeredFeatures={registeredFeatures} authenticated={authenticated} />
            ) : (
              <ModuleFoundation module={activeModule} authenticated={authenticated} />
            )}
          </section>
        </div>
      </section>
    </main>
  );
}

function Overview({ registeredFeatures, authenticated }) {
  return (
    <>
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

      <div className={styles.grid}>
        <InfoCard title="HIISSA STATUS" value="Not yet live-wired" detail="Operational aggregation will come from authorised module signals." />
        <InfoCard title="NEEDS YOUR ATTENTION" value="Feed not connected" detail="One underlying event may appear in multiple authorised views without duplication." />
        <InfoCard title="CURRENT MODULES" value={String(CONTROL_ROOM_MODULE_REGISTRY.currentModuleCount)} detail="Current architecture remains ten modules." />
        <InfoCard title="FUTURE EXPANSION" value="Enabled" detail="A future Founder-approved Module 11+ can be registered without rebuilding the shell." />
      </div>

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

function ModuleFoundation({ module, authenticated }) {
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
