export const HISTORICAL_PEOPLE_CHECKIN_MIN_HOURS = 48;
export const PEOPLE_CHECKIN_ACTIVE_CADENCE = "DAYPART_CARE";
export const PEOPLE_CHECKIN_MIN_GAP_MINUTES = 180;

export const PEOPLE_CHECKIN_CHOICES = Object.freeze([
  "I'm doing well",
  "I'm okay",
  "It's a heavy day",
  "I could use a calmer start",
]);

export const PEOPLE_CHECKIN_DAYPARTS = Object.freeze({
  morning: Object.freeze({
    id: "morning",
    label: "Morning care",
    startHour: 5,
    endHourExclusive: 12,
  }),
  afternoon: Object.freeze({
    id: "afternoon",
    label: "Afternoon care",
    startHour: 12,
    endHourExclusive: 17,
  }),
  evening: Object.freeze({
    id: "evening",
    label: "Evening care",
    startHour: 17,
    endHourExclusive: 5,
  }),
});

export function peopleCheckInDaypart(localHour) {
  if (localHour >= 5 && localHour < 12) return "morning";
  if (localHour >= 12 && localHour < 17) return "afternoon";
  return "evening";
}

function validLocalHour(value) {
  return Number.isInteger(value) && value >= 0 && value <= 23;
}

export async function prepareGentleCheckIn({
  adminClient,
  actorUserId,
  moduleId,
  actorMode,
  contextLabel,
  localDate,
  localHour,
  welcomeMode,
  isFounderPreview = false,
}) {
  if (!adminClient || !actorUserId || !moduleId) {
    return {
      due: false,
      reason: "MISSING_AUTHORISED_CONTEXT",
    };
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(localDate || "")) || !validLocalHour(localHour)) {
    return {
      due: false,
      reason: "INVALID_LOCAL_CONTEXT",
    };
  }

  if (welcomeMode === "QUIET_RETURN") {
    return {
      due: false,
      reason: "QUIET_RETURN",
    };
  }

  const daypart = peopleCheckInDaypart(localHour);

  const { data: previousRows, error: previousError } = await adminClient
    .from("admin_audit_events")
    .select("occurred_at,details")
    .eq("event_type", "people_experience_checkin_offered")
    .eq("actor_user_id", actorUserId)
    .eq("module_id", moduleId)
    .eq("environment", "staging")
    .order("occurred_at", { ascending: false })
    .limit(12);

  if (previousError) {
    return {
      due: false,
      reason: "CHECKIN_HISTORY_UNAVAILABLE",
    };
  }

  const rows = Array.isArray(previousRows) ? previousRows : [];

  const sameDaypartAlreadyOffered = rows.some((row) => {
    const details =
      row?.details && typeof row.details === "object" ? row.details : {};
    return (
      String(details.local_date || "") === localDate &&
      String(details.care_daypart || "") === daypart
    );
  });

  if (sameDaypartAlreadyOffered) {
    return {
      due: false,
      reason: "DAYPART_ALREADY_OFFERED",
      daypart,
    };
  }

  const previousAt = rows?.[0]?.occurred_at ? new Date(rows[0].occurred_at) : null;
  const minutesSincePrevious =
    previousAt && Number.isFinite(previousAt.getTime())
      ? Math.max(0, (Date.now() - previousAt.getTime()) / 60000)
      : null;

  if (
    minutesSincePrevious !== null &&
    minutesSincePrevious < PEOPLE_CHECKIN_MIN_GAP_MINUTES
  ) {
    return {
      due: false,
      reason: "MINIMUM_GAP_NOT_MET",
      daypart,
      minutesSincePrevious: Math.floor(minutesSincePrevious),
      minimumGapMinutes: PEOPLE_CHECKIN_MIN_GAP_MINUTES,
    };
  }

  const { error: insertError } = await adminClient
    .from("admin_audit_events")
    .insert({
      event_type: "people_experience_checkin_offered",
      actor_user_id: actorUserId,
      module_id: moduleId,
      resource_id: "gentle-checkin",
      action_id: "offer_private_checkin",
      outcome: "offered",
      oversight_level: isFounderPreview ? 3 : 1,
      environment: "staging",
      details: {
        local_date: localDate,
        local_hour: localHour,
        care_daypart: daypart,
        active_cadence: PEOPLE_CHECKIN_ACTIVE_CADENCE,
        minimum_gap_minutes: PEOPLE_CHECKIN_MIN_GAP_MINUTES,
        context_label: contextLabel || null,
        actor_mode: actorMode || null,
        answer_recorded: false,
        emotional_score_created: false,
        performance_score_created: false,
        manager_signal_created: false,
        explicit_support_escalation_created: false,
        is_founder_preview: Boolean(isFounderPreview),
      },
    });

  if (insertError) {
    return {
      due: false,
      reason: "CHECKIN_OFFER_RECORD_FAILED",
    };
  }

  return {
    due: true,
    cadence: PEOPLE_CHECKIN_ACTIVE_CADENCE,
    daypart,
    minimumGapMinutes: PEOPLE_CHECKIN_MIN_GAP_MINUTES,
    choices: PEOPLE_CHECKIN_CHOICES,
    privacy:
      "Your answer stays in this browser experience. HIISSA does not send it into the Founder/Admin audit trail, performance scoring or manager monitoring.",
    previewOnly: Boolean(isFounderPreview),
    productionEffectEnabled: false,
  };
}
