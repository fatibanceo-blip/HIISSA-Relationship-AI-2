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
      });
    }

    const daypartCounts = new Map();
    for (const row of sorted) {
      const daypart = String(detailsOf(row).care_daypart || "");
      daypartCounts.set(daypart, (daypartCounts.get(daypart) || 0) + 1);
    }

    for (const [daypart, count] of daypartCounts.entries()) {
      if (count > 1) {
        failures.push({
          type: "DAYPART_DUPLICATE_OFFER",
          scope: key,
          daypart,
          observed: count,
          allowed: 1,
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

function countTypes(rows) {
  const counts = {
    offered: 0,
    snoozed: 0,
    resolved: 0,
    workdayClose: 0,
    founderVisits: 0,
    staffWorkspaceVisits: 0,
  };

  for (const row of rows) {
    if (row.event_type === "people_experience_checkin_offered") counts.offered += 1;
    if (row.event_type === "people_experience_checkin_snoozed") counts.snoozed += 1;
    if (row.event_type === "people_experience_checkin_resolved") counts.resolved += 1;
    if (row.event_type === "people_experience_workday_close_opened") counts.workdayClose += 1;
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
  const latestEvidenceAt = rows[0]?.occurred_at || null;

  const founderActionRequired = privacyFailures.length > 0;
  const needsAttention =
    cadenceFailures.length > 0 || recordIntegrityFailures.length > 0;

  const status = founderActionRequired
    ? "FOUNDER_REQUIRED"
    : needsAttention
      ? "NEEDS_ATTENTION"
      : rows.length > 0
        ? "HEALTHY"
        : "CONNECTED_NO_ACTIVITY";

  const healthMeaning =
    status === "FOUNDER_REQUIRED"
      ? "A privacy boundary failed. HIISSA stopped at the Founder-required boundary instead of attempting an unsafe automatic repair."
      : status === "NEEDS_ATTENTION"
        ? "Monitoring is connected and found an operational rule that needs Technical Operations review."
        : status === "HEALTHY"
          ? "The connected People Experience source is readable and no cadence, privacy or record-integrity failure was detected in the current evidence window."
          : "Monitoring is connected, but no People Experience activity exists in the current evidence window, so HIISSA does not invent a Healthy result.";

  return noStoreJson({
    status,
    featureId: "hiissa.people-experience",
    featureLabel: "HIISSA People Experience",
    monitoringStatus: "CONNECTED",
    evidenceWindowDays: WINDOW_DAYS,
    latestEvidenceAt,
    counts,
    checks: {
      cadence: {
        status: cadenceFailures.length ? "FAIL" : rows.length ? "PASS" : "NO_ACTIVITY",
        failures: cadenceFailures,
        maximumPerActiveDay: PEOPLE_CHECKIN_MAX_PER_ACTIVE_DAY,
        minimumGapMinutes: PEOPLE_CHECKIN_MIN_GAP_MINUTES,
        maximumPerDaypart: 1,
        founderPreviewManualTestsExcluded: true,
      },
      privacy: {
        status: privacyFailures.length ? "FAIL" : rows.length ? "PASS" : "NO_ACTIVITY",
        failures: privacyFailures,
        privateAnswerValueExpected: false,
        emotionalScoringExpected: false,
        managerMoodSignalExpected: false,
      },
      recordIntegrity: {
        status: recordIntegrityFailures.length ? "FAIL" : rows.length ? "PASS" : "NO_ACTIVITY",
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
      observedAutomaticRecoveryAttempts:
        "Per-attempt automatic-recovery telemetry is not separately emitted yet; configured safe recovery behaviour is shown honestly rather than inventing attempt counts.",
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
          ? "Detected and classified the operational anomaly without altering audit history or bypassing safety boundaries."
          : status === "HEALTHY"
            ? "Monitored the connected evidence source and verified the current cadence, privacy and record-integrity rules."
            : "Confirmed the monitoring connection and reported that there is not enough recent activity to claim Healthy.",
    humanReadableReporting: true,
    rawPrivateConversationContentReturned: false,
    rawSecretsReturned: false,
    productionEffectEnabled: false,
  });
}
