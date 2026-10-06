import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import {
  PEOPLE_CHECKIN_MAX_PER_ACTIVE_DAY,
  PEOPLE_CHECKIN_MIN_GAP_MINUTES,
} from "../../../../../lib/people-experience/gentle-checkin.js";

export const dynamic = "force-dynamic";

const WINDOW_DAYS = 7;
const EVENT_TYPES = Object.freeze([
  "people_experience_checkin_offered",
  "people_experience_checkin_snoozed",
  "people_experience_checkin_resolved",
  "people_experience_workday_close_opened",
  "people_experience_operational_recovery",
  "founder_control_room_visit",
  "staff_workspace_visit",
]);

function blocked() {
  return new NextResponse(null, { status: 404 });
}

function noStoreJson(payload, status = 200) {
  return NextResponse.json(payload, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

function environmentAllowed() {
  const branch = process.env.VERCEL_GIT_COMMIT_REF || "";
  const environment =
    process.env.VERCEL_TARGET_ENV || process.env.VERCEL_ENV || "";

  return (
    branch === "feature/founder-control-room-staging" &&
    environment !== "production"
  );
}

function createClients() {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    !process.env.SUPABASE_SECRET_KEY
  ) {
    return null;
  }

  return {
    verificationClient: createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
        },
      }
    ),
    adminClient: createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SECRET_KEY,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
        },
      }
    ),
  };
}

async function verifyFounder(request) {
  const clients = createClients();
  if (!clients) {
    return { ok: false, status: 503, reason: "STAGING_ADMIN_DATA_NOT_CONFIGURED" };
  }

  const authorization = request.headers.get("authorization") || "";
  const accessToken = authorization.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length).trim()
    : "";

  if (!accessToken) {
    return { ok: false, status: 401, reason: "UNAUTHENTICATED" };
  }

  const { data: userData, error: userError } =
    await clients.verificationClient.auth.getUser(accessToken);

  if (userError || !userData?.user) {
    return { ok: false, status: 401, reason: "UNAUTHENTICATED" };
  }

  const { data: founder, error: founderError } = await clients.adminClient
    .from("admin_users")
    .select("user_id")
    .eq("user_id", userData.user.id)
    .maybeSingle();

  if (founderError || !founder) {
    return { ok: false, status: 403, reason: "FOUNDER_GATE_REQUIRED" };
  }

  return {
    ok: true,
    founderUserId: userData.user.id,
    adminClient: clients.adminClient,
  };
}

function detailsOf(row) {
  return row?.details && typeof row.details === "object" ? row.details : {};
}

function boolTrue(details, key) {
  return details?.[key] === true;
}

function actorKey(row) {
  return String(row?.actor_user_id || "system");
}

function detectedCadenceFailures(rows) {
  const offers = rows
    .filter((row) => row.event_type === "people_experience_checkin_offered")
    .filter((row) => !Boolean(detailsOf(row).is_founder_preview));

  const byActorAndDate = new Map();

  for (const row of offers) {
    const details = detailsOf(row);
    const localDate = String(details.local_date || "");
    const daypart = String(details.care_daypart || "");
    if (!localDate || !daypart) continue;

    const key = `${actorKey(row)}:${localDate}`;
    const list = byActorAndDate.get(key) || [];
    list.push(row);
    byActorAndDate.set(key, list);
  }

  const failures = [];

  for (const [key, group] of byActorAndDate.entries()) {
    const sorted = [...group].sort(
      (a, b) => new Date(a.occurred_at) - new Date(b.occurred_at)
    );

    if (sorted.length > PEOPLE_CHECKIN_MAX_PER_ACTIVE_DAY) {
      failures.push({
        type: "DAILY_MAXIMUM_EXCEEDED",
        scope: key,
        observed: sorted.length,
        allowed: PEOPLE_CHECKIN_MAX_PER_ACTIVE_DAY,
        occurredAt:
          sorted[PEOPLE_CHECKIN_MAX_PER_ACTIVE_DAY]?.occurred_at ||
          sorted[sorted.length - 1]?.occurred_at ||
          null,
      });
    }

    const daypartCounts = new Map();
    for (const row of sorted) {
      const daypart = String(detailsOf(row).care_daypart || "");
      daypartCounts.set(daypart, (daypartCounts.get(daypart) || 0) + 1);
    }

    for (const [daypart, count] of daypartCounts.entries()) {
      if (count > 1) {
        const matchingDaypart = sorted.filter(
          (row) => String(detailsOf(row).care_daypart || "") === daypart
        );
        failures.push({
          type: "DAYPART_DUPLICATE_OFFER",
          scope: key,
          daypart,
          observed: count,
          allowed: 1,
          occurredAt:
            matchingDaypart[1]?.occurred_at ||
            matchingDaypart[matchingDaypart.length - 1]?.occurred_at ||
            null,
        });
      }
    }

    for (let index = 1; index < sorted.length; index += 1) {
      const previous = sorted[index - 1];
      const current = sorted[index];
      const previousAt = new Date(previous.occurred_at).getTime();
      const currentAt = new Date(current.occurred_at).getTime();
      if (!Number.isFinite(previousAt) || !Number.isFinite(currentAt)) continue;

      const gapMinutes = Math.floor((currentAt - previousAt) / 60000);
      if (gapMinutes < PEOPLE_CHECKIN_MIN_GAP_MINUTES) {
        failures.push({
          type: "MINIMUM_GAP_VIOLATION",
          scope: key,
          observedMinutes: gapMinutes,
          requiredMinutes: PEOPLE_CHECKIN_MIN_GAP_MINUTES,
          occurredAt: current.occurred_at || null,
        });
      }
    }
  }

  return failures;
}

function detectedPrivacyFailures(rows) {
  const failures = [];
  const forbiddenTrueKeys = [
    "answer_recorded",
    "answer_value_recorded",
    "emotional_score_created",
    "performance_score_created",
    "manager_signal_created",
    "emotional_checkin_recorded",
    "performance_score_recorded",
  ];

  for (const row of rows) {
    const details = detailsOf(row);
    const violated = forbiddenTrueKeys.filter((key) => boolTrue(details, key));
    if (!violated.length) continue;

    failures.push({
      type: "PEOPLE_EXPERIENCE_PRIVACY_BOUNDARY_FAILURE",
      eventId: row.id,
      eventType: row.event_type,
      occurredAt: row.occurred_at,
      violatedSafeguards: violated,
    });
  }

  return failures;
}

function detectedRecordIntegrityFailures(rows) {
  const failures = [];

  for (const row of rows) {
    if (
      ![
        "people_experience_checkin_offered",
        "people_experience_checkin_snoozed",
        "people_experience_checkin_resolved",
      ].includes(row.event_type)
    ) {
      continue;
    }

    const details = detailsOf(row);
    if (!details.local_date || !details.care_daypart) {
      failures.push({
        type: "CHECKIN_OPERATIONAL_METADATA_INCOMPLETE",
        eventId: row.id,
        eventType: row.event_type,
        occurredAt: row.occurred_at,
      });
    }
  }

  return failures;
}

function founderIssueSummary(issue) {
  if (!issue) return "No active operational issue is available.";

  if (issue.type === "DAILY_MAXIMUM_EXCEEDED") {
    return "The Gentle Check-In was offered more times in one active day than the approved care cadence allows.";
  }

  if (issue.type === "DAYPART_DUPLICATE_OFFER") {
    return "The Gentle Check-In was offered more than once in the same approved daypart.";
  }

  if (issue.type === "MINIMUM_GAP_VIOLATION") {
    return "Two Gentle Check-In offers occurred closer together than the approved minimum gap.";
  }

  if (issue.type === "CHECKIN_OPERATIONAL_METADATA_INCOMPLETE") {
    return "A Gentle Check-In operational record is missing information HIISSA needs to verify the care-delivery rules.";
  }

  if (issue.type === "PEOPLE_EXPERIENCE_PRIVACY_BOUNDARY_FAILURE") {
    return "A protected People Experience privacy boundary was breached in operational evidence.";
  }

  if (issue.type === "TECHNICAL_RECOVERY_UNRESOLVED") {
    return "A People Experience technical condition remains unresolved after bounded automatic handling.";
  }

  return "HIISSA detected a People Experience operational condition that requires review.";
}

function earliestIssueTime(issues) {
  const times = issues
    .map((issue) => issue?.occurredAt)
    .filter(Boolean)
    .map((value) => new Date(value))
    .filter((value) => Number.isFinite(value.getTime()))
    .sort((a, b) => a - b);

  return times[0]?.toISOString() || null;
}

function countTypes(rows) {
  const counts = {
    offered: 0,
    snoozed: 0,
    resolved: 0,
    workdayClose: 0,
    operationalRecoveryEvents: 0,
    technicalAttentionEvents: 0,
    founderVisits: 0,
    staffWorkspaceVisits: 0,
  };

  for (const row of rows) {
    if (row.event_type === "people_experience_checkin_offered") counts.offered += 1;
    if (row.event_type === "people_experience_checkin_snoozed") counts.snoozed += 1;
    if (row.event_type === "people_experience_checkin_resolved") counts.resolved += 1;
    if (row.event_type === "people_experience_workday_close_opened") counts.workdayClose += 1;
    if (row.event_type === "people_experience_operational_recovery") {
      counts.operationalRecoveryEvents += 1;
      if (String(row.outcome || "") === "needs_attention") {
        counts.technicalAttentionEvents += 1;
      }
    }
    if (row.event_type === "founder_control_room_visit") counts.founderVisits += 1;
    if (row.event_type === "staff_workspace_visit") counts.staffWorkspaceVisits += 1;
  }

  return counts;
}

export async function GET(request) {
  if (!environmentAllowed()) return blocked();

  const founder = await verifyFounder(request);
  if (!founder.ok) {
    return noStoreJson({ status: founder.reason }, founder.status);
  }

  const since = new Date(Date.now() - WINDOW_DAYS * 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await founder.adminClient
    .from("admin_audit_events")
    .select(
      "id,event_type,actor_user_id,module_id,resource_id,action_id,outcome,oversight_level,environment,details,occurred_at"
    )
    .eq("environment", "staging")
    .in("event_type", EVENT_TYPES)
    .gte("occurred_at", since)
    .order("occurred_at", { ascending: false })
    .limit(500);

  if (error) {
    return noStoreJson({
      status: "NEEDS_ATTENTION",
      displayHealthStatus: "UNAVAILABLE",
      featureId: "hiissa.people-experience",
      monitoringStatus: "SOURCE_READ_FAILED",
      healthMeaning:
        "HIISSA could not read the protected People Experience operational source, so the feature is not labelled Healthy.",
      founderActionRequired: false,
      actionOwner: "HIISSA_TECHNICAL_OPERATIONS",
      whatHiissaDid:
        "The Control Room failed closed and refused to fabricate a health result.",
      automaticRecovery: {
        classification: "SAFE_WITH_LIMIT_OR_HUMAN_REQUIRED",
        currentAction:
          "No destructive retry was attempted. The source can be retried by the authorised monitoring cycle.",
        retryBoundary:
          "Do not bypass Admin authentication, privacy boundaries or the Staging environment gate.",
      },
      errors: ["Protected People Experience audit source could not be read."],
      productionEffectEnabled: false,
    });
  }

  const rows = Array.isArray(data) ? data : [];
  const cadenceFailures = detectedCadenceFailures(rows);
  const privacyFailures = detectedPrivacyFailures(rows);
  const recordIntegrityFailures = detectedRecordIntegrityFailures(rows);
  const counts = countTypes(rows);
  const checkInRows = rows.filter((row) =>
    [
      "people_experience_checkin_offered",
      "people_experience_checkin_snoozed",
      "people_experience_checkin_resolved",
    ].includes(row.event_type)
  );
  const offerRows = checkInRows.filter(
    (row) => row.event_type === "people_experience_checkin_offered"
  );
  const recoveryRows = rows.filter(
    (row) => row.event_type === "people_experience_operational_recovery"
  );
  const latestRecovery = recoveryRows[0] || null;
  const technicalRecoveryFailures = recoveryRows.filter(
    (row) => String(row.outcome || "") === "needs_attention"
  );

  function hasLaterRecoveryEvidence(failureRow) {
    const failureAt = new Date(failureRow.occurred_at).getTime();
    if (!Number.isFinite(failureAt)) return false;

    const details = detailsOf(failureRow);
    const operationalEvent = String(
      details.operational_event || failureRow.action_id || ""
    );
    const reason = String(details.reason || "");

    return checkInRows.some((row) => {
      const rowAt = new Date(row.occurred_at).getTime();
      if (!Number.isFinite(rowAt) || rowAt <= failureAt) return false;

      if (operationalEvent === "eligibility_source_unavailable") {
        return true;
      }

      if (
        operationalEvent === "care_state_persistence_degraded" &&
        reason === "SNOOZED_STATE_NOT_CONFIRMED"
      ) {
        return row.event_type === "people_experience_checkin_snoozed";
      }

      if (
        operationalEvent === "care_state_persistence_degraded" &&
        reason === "RESOLVED_STATE_NOT_CONFIRMED"
      ) {
        return row.event_type === "people_experience_checkin_resolved";
      }

      return false;
    });
  }

  const unresolvedTechnicalRecoveryFailures =
    technicalRecoveryFailures.filter(
      (row) => !hasLaterRecoveryEvidence(row)
    );
  const recoveredTechnicalFailures =
    technicalRecoveryFailures.length -
    unresolvedTechnicalRecoveryFailures.length;
  const latestEvidenceAt = rows[0]?.occurred_at || null;

  const founderActionRequired = privacyFailures.length > 0;
  const needsAttention =
    cadenceFailures.length > 0 ||
    recordIntegrityFailures.length > 0 ||
    unresolvedTechnicalRecoveryFailures.length > 0;

  const status = founderActionRequired
    ? "FOUNDER_REQUIRED"
    : needsAttention
      ? "NEEDS_ATTENTION"
      : rows.length === 0
        ? "CONNECTED_NO_ACTIVITY"
        : checkInRows.length === 0
          ? "CONNECTED_PARTIAL_EVIDENCE"
          : "HEALTHY";

  const displayHealthStatus =
    status === "HEALTHY"
      ? "HEALTHY"
      : status === "NEEDS_ATTENTION"
        ? "DEGRADED"
        : status === "FOUNDER_REQUIRED"
          ? "NEEDS_ATTENTION"
          : "MONITORING";

  const activeIssues = [
    ...privacyFailures,
    ...cadenceFailures,
    ...recordIntegrityFailures,
    ...unresolvedTechnicalRecoveryFailures.map((row) => ({
      type: "TECHNICAL_RECOVERY_UNRESOLVED",
      occurredAt: row.occurred_at,
      operationalEvent: String(
        detailsOf(row).operational_event || row.action_id || ""
      ),
      reason: String(detailsOf(row).reason || ""),
    })),
  ];

  const primaryIssue = activeIssues[0] || null;
  const incidentStartedAt = earliestIssueTime(activeIssues);
  const issueSeverity = privacyFailures.length
    ? "HIGH — PRIVACY BOUNDARY"
    : activeIssues.length
      ? "MODERATE — OPERATIONAL"
      : "NONE";

  const healthMeaning =
    status === "FOUNDER_REQUIRED"
      ? "A privacy boundary failed. HIISSA stopped at the Founder-required boundary instead of attempting an unsafe automatic repair."
      : status === "NEEDS_ATTENTION"
        ? "Monitoring is connected and found an operational rule that needs Technical Operations review."
        : status === "HEALTHY"
          ? "The connected People Experience source is readable and current check-in evidence shows no cadence, privacy or record-integrity failure in the evidence window."
          : status === "CONNECTED_PARTIAL_EVIDENCE"
            ? "Monitoring is connected and People Experience activity is visible, but there is no recent Gentle Check-In state evidence in this window, so HIISSA does not claim the care-delivery path is Healthy."
            : "Monitoring is connected, but no People Experience activity exists in the current evidence window, so HIISSA does not invent a Healthy result.";

  const founderActionText = founderActionRequired
    ? "YES — this condition has reached a Founder-authority boundary."
    : needsAttention
      ? "NO — HIISSA Technical Operations owns the technical investigation and bounded recovery."
      : "NO — no Founder action is currently required.";

  const founderAvailableActions = founderActionRequired
    ? [
        "Open the authorised Founder review for the privacy boundary.",
        "Keep the affected capability bounded while the protected review is completed.",
      ]
    : needsAttention
      ? [
          "No Founder repair action is required.",
          "Allow HIISSA Technical Operations to investigate, recover within approved bounds and verify the result.",
        ]
      : [
          "No action is required.",
          "Continue monitoring the connected Staging evidence.",
        ];

  const founderRecoveryNextStep = founderActionRequired
    ? "Keep the affected capability bounded until the Founder-authorised privacy review determines the safe next state, then verify before closing the incident."
    : needsAttention
      ? "HIISSA Technical Operations continues bounded recovery, retests the affected behaviour and records verified recovery or further escalation."
      : displayHealthStatus === "HEALTHY"
        ? "Continue normal monitoring. If a new failure appears, HIISSA will detect, classify, recover within approved bounds and verify before reporting resolution."
        : "Continue collecting real Staging evidence. HIISSA will not claim Healthy until the connected care-delivery path has sufficient verified evidence.";

  const founderView = {
    whatHappened: primaryIssue
      ? founderIssueSummary(primaryIssue) +
        (activeIssues.length > 1
          ? ` ${activeIssues.length - 1} additional connected issue${activeIssues.length === 2 ? "" : "s"} also require attention.`
          : "")
      : displayHealthStatus === "HEALTHY"
        ? "No active People Experience failure is detected in the current verified Staging evidence window."
        : "The monitoring connection is working, but there is not enough recent care-delivery evidence to claim the feature is Healthy.",
    currentStatus: displayHealthStatus,
    affected:
      "HIISSA People Experience — Gentle Check-In, Calmer Start and their privacy-safe care-delivery path in Staging. Production is not affected by this Staging-only work.",
    incidentStartedAt,
    severity: issueSeverity,
    userImpact: primaryIssue
      ? privacyFailures.length
        ? "A protected privacy rule may be affected. HIISSA stops at the Founder-required boundary rather than attempting an unsafe repair."
        : "The care experience may be delayed, repeated incorrectly or temporarily unable to confirm its intended state until recovery is verified."
      : "No known user impact is currently established from the connected evidence.",
    evidenceClass: primaryIssue ? "OBSERVED" : "OBSERVED",
    whatHiissaAlreadyDid:
      status === "FOUNDER_REQUIRED"
        ? "HIISSA detected the privacy boundary failure and stopped at the Founder-required boundary."
        : status === "NEEDS_ATTENTION"
          ? unresolvedTechnicalRecoveryFailures.length > 0
            ? "HIISSA detected the degraded condition, recorded the bounded automatic action and routed the unresolved technical work to HIISSA Technical Operations."
            : "HIISSA detected and classified the operational anomaly without altering audit history or bypassing safety boundaries."
          : status === "HEALTHY"
            ? "HIISSA monitored the connected evidence source and verified the current cadence, privacy and record-integrity rules."
            : "HIISSA confirmed that monitoring is connected and refused to invent a Healthy result without sufficient evidence.",
    doINeedToAct: founderActionText,
    availableActions: founderAvailableActions,
    recoveryNextStep: founderRecoveryNextStep,
    relatedEvents: {
      checkInOffers: counts.offered,
      snoozed: counts.snoozed,
      resolved: counts.resolved,
      recoveryAttempts: counts.operationalRecoveryEvents,
      unresolvedTechnicalAttention: unresolvedTechnicalRecoveryFailures.length,
      recoveredTechnicalAttention: recoveredTechnicalFailures,
    },
    auditHistory: {
      evidenceWindowDays: WINDOW_DAYS,
      latestEvidenceAt,
      connectedRecordCount: rows.length,
    },
    verification:
      activeIssues.length > 0
        ? "Recovery is not resolved until the affected behaviour is retested and evidence verifies the healthy state."
        : displayHealthStatus === "HEALTHY"
          ? "Current connected checks are verified from real privacy-safe Staging evidence."
          : "Monitoring is connected; Healthy verification remains pending sufficient recent evidence.",
    finalResolution:
      activeIssues.length > 0
        ? "OPEN — VERIFICATION OR AUTHORISED REVIEW REQUIRED"
        : displayHealthStatus === "HEALTHY"
          ? "NO ACTIVE INCIDENT"
          : "MONITORING — NOT ENOUGH EVIDENCE TO CLAIM HEALTHY",
    technicalDetails: {
      internalState: status,
      monitoringStatus: "CONNECTED",
      featureId: "hiissa.people-experience",
      environment: "STAGING",
      activeIssueCount: activeIssues.length,
      evidenceWindowDays: WINDOW_DAYS,
    },
  };

  return noStoreJson({
    status,
    displayHealthStatus,
    founderView,
    featureId: "hiissa.people-experience",
    featureLabel: "HIISSA People Experience",
    monitoringStatus: "CONNECTED",
    evidenceWindowDays: WINDOW_DAYS,
    latestEvidenceAt,
    counts,
    checks: {
      cadence: {
        status: cadenceFailures.length
          ? "FAIL"
          : offerRows.length
            ? "PASS"
            : "NO_ACTIVITY",
        failures: cadenceFailures,
        maximumPerActiveDay: PEOPLE_CHECKIN_MAX_PER_ACTIVE_DAY,
        minimumGapMinutes: PEOPLE_CHECKIN_MIN_GAP_MINUTES,
        maximumPerDaypart: 1,
        founderPreviewManualTestsExcluded: true,
      },
      privacy: {
        status: privacyFailures.length
          ? "FAIL"
          : rows.length
            ? "PASS"
            : "NO_ACTIVITY",
        failures: privacyFailures,
        privateAnswerValueExpected: false,
        emotionalScoringExpected: false,
        managerMoodSignalExpected: false,
      },
      recordIntegrity: {
        status: recordIntegrityFailures.length
          ? "FAIL"
          : checkInRows.length
            ? "PASS"
            : "NO_ACTIVITY",
        failures: recordIntegrityFailures,
      },
    },
    automaticRecovery: {
      classification: "SAFE_WITH_LIMIT_OR_HUMAN_REQUIRED",
      configuredSafeBehaviours: [
        "Delay the automatic Gentle Check-In until a safer moment when the person is editing or not recently active.",
        "Minimise an ignored full check-in into a small reminder instead of losing the care opportunity.",
        "Keep a snoozed opportunity bounded to the same care opportunity rather than creating another check-in.",
        "Return the small reminder when a snooze expires instead of forcing the full prompt over the workspace.",
        "Dismiss the small reminder on reminder-level Not now while the same opportunity remains snoozed.",
      ],
      retryBounds: {
        safeMomentRetryMinutes: 2,
        normalPollMinutes: 15,
        snoozeMinutes: 30,
      },
      verificationRule:
        "Automatic recovery is not counted as successful merely because an action ran; the resulting feature state must still satisfy the connected health rules.",
      autoStop:
        "Stop automatic handling at privacy, permission, data-integrity or Founder-required boundaries.",
      observedAutomaticRecoveryAttempts: counts.operationalRecoveryEvents,
      technicalAttentionRecoveryEvents: counts.technicalAttentionEvents,
      unresolvedTechnicalAttentionEvents:
        unresolvedTechnicalRecoveryFailures.length,
      recoveredTechnicalAttentionEvents: recoveredTechnicalFailures,
      latestObservedRecovery: latestRecovery
        ? {
            event: String(detailsOf(latestRecovery).operational_event || latestRecovery.action_id || ""),
            automaticAction: String(detailsOf(latestRecovery).automatic_action || ""),
            verificationState: String(detailsOf(latestRecovery).verification_state || ""),
            occurredAt: latestRecovery.occurred_at,
          }
        : null,
    },
    founderActionRequired,
    actionOwner: founderActionRequired
      ? "FOUNDER"
      : needsAttention
        ? "HIISSA_TECHNICAL_OPERATIONS"
        : "HIISSA",
    whatHiissaDid:
      status === "FOUNDER_REQUIRED"
        ? "Detected the privacy boundary failure and stopped at the Founder-required boundary."
        : status === "NEEDS_ATTENTION"
          ? unresolvedTechnicalRecoveryFailures.length > 0
            ? "Detected a degraded People Experience operational event, recorded the bounded automatic action and routed the unresolved technical condition to HIISSA Technical Operations without asking the Founder to repair it."
            : "Detected and classified the operational anomaly without altering audit history or bypassing safety boundaries."
          : status === "HEALTHY"
            ? "Monitored the connected evidence source and verified the current cadence, privacy and record-integrity rules."
            : "Confirmed the monitoring connection and reported that there is not enough recent activity to claim Healthy.",
    humanReadableReporting: true,
    rawPrivateConversationContentReturned: false,
    rawSecretsReturned: false,
    productionEffectEnabled: false,
  });
}
