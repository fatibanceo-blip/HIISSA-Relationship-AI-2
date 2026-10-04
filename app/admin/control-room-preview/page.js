"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import styles from "./page.module.css";
import {
  CONTROL_ROOM_MODULES,
  CONTROL_ROOM_MODULE_REGISTRY,
  EXPERIENCE_REGISTRY,
  FEATURE_OPERATIONAL_VISIBILITY_STANDARD,
  ADMIN_STAFF_ACCESS_ONBOARDING_STANDARD,
  ADMIN_STAFF_ONBOARDING_WORKFLOW,
  FOUNDER_ADMIN_AUTHORITY_AND_STAFF_ACTION_GATE,
  STAFF_ACCESS_SUSPENSION_AND_OFFBOARDING_STANDARD,
  STAFF_SECURE_ONBOARDING_EXPERIENCE_STANDARD,
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
              <ModuleFoundation module={activeModule} authenticated={authenticated} onOverview={() => chooseModule(CONTROL_ROOM_MODULES.overview)} />
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

function ModuleFoundation({ module, authenticated, onOverview }) {
  if (module.id === CONTROL_ROOM_MODULES.feedbackRecommendations && authenticated) {
    return <FeedbackRecommendationsModule module={module} onOverview={onOverview} />;
  }

  if (module.id === CONTROL_ROOM_MODULES.adminSecurityAudit && authenticated) {
    return <AdminSecurityAuditModule module={module} onOverview={onOverview} />;
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
      <button type="button" className={styles.overviewBack} onClick={onOverview}>
        ← Control Room Overview
      </button>
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

function FeedbackRecommendationsModule({ module, onOverview }) {
  const [loading, setLoading] = useState(true);
  const [health, setHealth] = useState("Checking");
  const [stats, setStats] = useState(null);
  const [distribution, setDistribution] = useState([]);
  const [writtenFeedback, setWrittenFeedback] = useState([]);
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
        publicResult,
      ] = await Promise.all([
        adminDataClient.rpc("get_hiissa_feedback_stats"),
        adminDataClient.rpc("get_hiissa_rating_distribution"),
        adminDataClient.rpc("get_hiissa_written_feedback"),
        adminDataClient.rpc("get_hiissa_admin_public_reviews"),
      ]);

      if (!active) return;

      if (statsResult.error) nextErrors.push("Feedback statistics could not be loaded.");
      else if (statsResult.data?.length) setStats(statsResult.data[0]);

      if (distributionResult.error) nextErrors.push("Rating distribution could not be loaded.");
      else setDistribution(distributionResult.data || []);

      if (writtenResult.error) nextErrors.push("Private written feedback could not be loaded.");
      else setWrittenFeedback(writtenResult.data || []);

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
      <button type="button" className={styles.overviewBack} onClick={onOverview}>
        ← Control Room Overview
      </button>
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
        <div>RECOMMENDATIONS<span>Existing suggestion field preserved; dedicated review workflow comes next</span></div>
        <div>AUDIT / PERMISSION HISTORY<span>Will connect only from verified source evidence</span></div>
      </section>
    </>
  );
}

function AdminSecurityAuditModule({ module, onOverview }) {
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
      <button type="button" className={styles.overviewBack} onClick={onOverview}>
        ← Control Room Overview
      </button>

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
          Staff can work only inside their approved roles. Routine internal work
          may proceed within those boundaries, but consequential staff actions
          stop at the configured Founder approval gate before material or external
          effect. Ordinary staff cannot create, suspend, demote or override Founder authority.
        </p>

        <div className={styles.contractGrid}>
          {FOUNDER_ADMIN_AUTHORITY_AND_STAFF_ACTION_GATE.founderControls.map((item) => (
            <div className={styles.contractItem} key={item}>✓ {item.replaceAll("_", " ")}</div>
          ))}
        </div>

        <div className={styles.featureMeta}>
          <span>FOUNDER: FULL AUTHORISED CONTROL ROOM OVERSIGHT</span>
          <span>CONSEQUENTIAL STAFF ACTIONS: FOUNDER GATE</span>
          <span>STAFF SELF-APPROVAL: BLOCKED</span>
          <span>HIISSA SAFE AUTO-RECOVERY: CONTINUES WITHIN APPROVED BOUNDS</span>
        </div>
      </section>

      <StaffAccessControlPrototype />

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
    ["applicant", "4 Applicant"],
    ["policies", "5 Policies"],
    ["review", "6 Founder Review"],
    ["activation", "7 Result"],
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
              onClick={() => setStep("applicant")}
            >
              Open applicant experience →
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
            <button type="button" className={styles.prototypeSecondary} onClick={() => setStep("inviteSent")}>
              ← Back to invitation status
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
              onClick={() => setStep("review")}
            >
              Send to Founder Review →
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
              onClick={() => setStep("applicant")}
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
