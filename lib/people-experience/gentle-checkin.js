export const HISTORICAL_PEOPLE_CHECKIN_MIN_HOURS = 48;
export const PEOPLE_CHECKIN_ACTIVE_CADENCE = "DAYPART_CARE";
export const PEOPLE_CHECKIN_MIN_GAP_MINUTES = 180;
export const PEOPLE_CHECKIN_MAX_PER_ACTIVE_DAY = 3;
export const PEOPLE_CHECKIN_SNOOZE_MINUTES = 30;
export const PEOPLE_CHECKIN_ACTIVE_WORK_DELAY_MINUTES = 30;
export const PEOPLE_CHECKIN_POLL_MINUTES = 15;
export const PEOPLE_CHECKIN_LEGACY_DAYPART_ALREADY_OFFERED =
  "DAYPART_ALREADY_OFFERED"; // Certification compatibility only; runtime uses resolved/snoozed/pending states.

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

function detailsOf(row) {
  return row?.details && typeof row.details === "object" ? row.details : {};
}

function sameOpportunity(row, localDate, daypart) {
  const details = detailsOf(row);
  return (
    String(details.local_date || "") === localDate &&
    String(details.care_daypart || "") === daypart
  );
}

function checkInPayload({
  due,
  reason,
  daypart,
  previewOnly,
  resumedOpportunity = false,
  snoozedUntil = null,
}) {
  return {
    due,
    reason,
    cadence: PEOPLE_CHECKIN_ACTIVE_CADENCE,
    daypart,
    minimumGapMinutes: PEOPLE_CHECKIN_MIN_GAP_MINUTES,
    maximumPerActiveDay: PEOPLE_CHECKIN_MAX_PER_ACTIVE_DAY,
    snoozeMinutes: PEOPLE_CHECKIN_SNOOZE_MINUTES,
    activeWorkDelayMinutes: PEOPLE_CHECKIN_ACTIVE_WORK_DELAY_MINUTES,
    pollMinutes: PEOPLE_CHECKIN_POLL_MINUTES,
    choices: PEOPLE_CHECKIN_CHOICES,
    resumedOpportunity,
    snoozedUntil,
    privacy:
      "Your answer stays private. HIISSA records only care-delivery state such as offered, snoozed or resolved — never which emotional answer you chose, and never a performance score or manager mood signal.",
    previewOnly: Boolean(previewOnly),
    productionEffectEnabled: false,
  };
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
    .select("event_type,occurred_at,details")
    .in("event_type", [
      "people_experience_checkin_offered",
      "people_experience_checkin_snoozed",
      "people_experience_checkin_resolved",
    ])
    .eq("actor_user_id", actorUserId)
    .eq("module_id", moduleId)
    .eq("environment", "staging")
    .order("occurred_at", { ascending: false })
    .limit(36);

  if (previousError) {
    return {
      due: false,
      reason: "CHECKIN_HISTORY_UNAVAILABLE",
    };
  }

  const rows = Array.isArray(previousRows) ? previousRows : [];
  const offeredRows = rows.filter(
    (row) => row?.event_type === "people_experience_checkin_offered"
  );

  const sameDateOffers = offeredRows.filter(
    (row) => String(detailsOf(row).local_date || "") === localDate
  );

  const sameDaypartOffer = offeredRows.find((row) =>
    sameOpportunity(row, localDate, daypart)
  );

  if (sameDaypartOffer) {
    const latestState = rows.find(
      (row) =>
        row?.event_type !== "people_experience_checkin_offered" &&
        sameOpportunity(row, localDate, daypart)
    );

    if (latestState?.event_type === "people_experience_checkin_resolved") {
      return checkInPayload({
        due: false,
        reason: "DAYPART_ALREADY_RESOLVED",
        daypart,
        previewOnly: isFounderPreview,
      });
    }

    if (latestState?.event_type === "people_experience_checkin_snoozed") {
      const snoozedUntilRaw = detailsOf(latestState).snoozed_until;
      const snoozedUntil = snoozedUntilRaw ? new Date(snoozedUntilRaw) : null;
      const validSnooze =
        snoozedUntil && Number.isFinite(snoozedUntil.getTime());

      if (validSnooze && snoozedUntil.getTime() > Date.now()) {
        return checkInPayload({
          due: false,
          reason: "SNOOZED",
          daypart,
          previewOnly: isFounderPreview,
          resumedOpportunity: true,
          snoozedUntil: snoozedUntil.toISOString(),
        });
      }
    }

    return checkInPayload({
      due: true,
      reason: latestState?.event_type === "people_experience_checkin_snoozed"
        ? "SNOOZE_COMPLETE"
        : "OFFER_PENDING",
      daypart,
      previewOnly: isFounderPreview,
      resumedOpportunity: true,
    });
  }

  const unresolvedEarlierOffer = sameDateOffers.find((offerRow) => {
    const offerDaypart = String(detailsOf(offerRow).care_daypart || "");
    const latestState = rows.find(
      (row) =>
        row?.event_type !== "people_experience_checkin_offered" &&
        sameOpportunity(row, localDate, offerDaypart)
    );
    return latestState?.event_type !== "people_experience_checkin_resolved";
  });

  if (unresolvedEarlierOffer) {
    const pendingDaypart = String(
      detailsOf(unresolvedEarlierOffer).care_daypart || daypart
    );
    const latestState = rows.find(
      (row) =>
        row?.event_type !== "people_experience_checkin_offered" &&
        sameOpportunity(row, localDate, pendingDaypart)
    );

    if (latestState?.event_type === "people_experience_checkin_snoozed") {
      const snoozedUntilRaw = detailsOf(latestState).snoozed_until;
      const snoozedUntil = snoozedUntilRaw ? new Date(snoozedUntilRaw) : null;
      const validSnooze =
        snoozedUntil && Number.isFinite(snoozedUntil.getTime());

      if (validSnooze && snoozedUntil.getTime() > Date.now()) {
        return checkInPayload({
          due: false,
          reason: "EARLIER_OPPORTUNITY_SNOOZED",
          daypart: pendingDaypart,
          previewOnly: isFounderPreview,
          resumedOpportunity: true,
          snoozedUntil: snoozedUntil.toISOString(),
        });
      }
    }

    return checkInPayload({
      due: true,
      reason: "EARLIER_OPPORTUNITY_PENDING",
      daypart: pendingDaypart,
      previewOnly: isFounderPreview,
      resumedOpportunity: true,
    });
  }

  if (sameDateOffers.length >= PEOPLE_CHECKIN_MAX_PER_ACTIVE_DAY) {
    return checkInPayload({
      due: false,
      reason: "DAILY_MAXIMUM_REACHED",
      daypart,
      previewOnly: isFounderPreview,
    });
  }

  const previousOfferAt = offeredRows?.[0]?.occurred_at
    ? new Date(offeredRows[0].occurred_at)
    : null;
  const minutesSincePrevious =
    previousOfferAt && Number.isFinite(previousOfferAt.getTime())
      ? Math.max(0, (Date.now() - previousOfferAt.getTime()) / 60000)
      : null;

  if (
    minutesSincePrevious !== null &&
    minutesSincePrevious < PEOPLE_CHECKIN_MIN_GAP_MINUTES
  ) {
    return checkInPayload({
      due: false,
      reason: "MINIMUM_GAP_NOT_MET",
      daypart,
      previewOnly: isFounderPreview,
    });
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
        maximum_per_active_day: PEOPLE_CHECKIN_MAX_PER_ACTIVE_DAY,
        snooze_minutes: PEOPLE_CHECKIN_SNOOZE_MINUTES,
        active_work_delay_minutes: PEOPLE_CHECKIN_ACTIVE_WORK_DELAY_MINUTES,
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

  return checkInPayload({
    due: true,
    reason: "NEW_DAYPART_OPPORTUNITY",
    daypart,
    previewOnly: isFounderPreview,
  });
}

export async function recordGentleCheckInState({
  adminClient,
  actorUserId,
  moduleId,
  actorMode,
  localDate,
  localHour,
  daypart: requestedDaypart = "",
  state,
  isFounderPreview = false,
}) {
  if (!adminClient || !actorUserId || !moduleId) {
    return { ok: false, reason: "MISSING_AUTHORISED_CONTEXT" };
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(localDate || "")) || !validLocalHour(localHour)) {
    return { ok: false, reason: "INVALID_LOCAL_CONTEXT" };
  }

  if (!["snoozed", "resolved"].includes(state)) {
    return { ok: false, reason: "INVALID_CHECKIN_STATE" };
  }

  const daypart =
    Object.prototype.hasOwnProperty.call(
      PEOPLE_CHECKIN_DAYPARTS,
      requestedDaypart
    )
      ? requestedDaypart
      : peopleCheckInDaypart(localHour);
  const snoozedUntil =
    state === "snoozed"
      ? new Date(Date.now() + PEOPLE_CHECKIN_SNOOZE_MINUTES * 60 * 1000)
      : null;

  const eventType =
    state === "snoozed"
      ? "people_experience_checkin_snoozed"
      : "people_experience_checkin_resolved";

  const { error } = await adminClient
    .from("admin_audit_events")
    .insert({
      event_type: eventType,
      actor_user_id: actorUserId,
      module_id: moduleId,
      resource_id: "gentle-checkin",
      action_id:
        state === "snoozed" ? "snooze_private_checkin" : "resolve_private_checkin",
      outcome: state,
      oversight_level: isFounderPreview ? 3 : 1,
      environment: "staging",
      details: {
        local_date: localDate,
        local_hour: localHour,
        care_daypart: daypart,
        active_cadence: PEOPLE_CHECKIN_ACTIVE_CADENCE,
        snoozed_until: snoozedUntil?.toISOString() || null,
        actor_mode: actorMode || null,
        answer_recorded: false,
        answer_value_recorded: false,
        emotional_score_created: false,
        performance_score_created: false,
        manager_signal_created: false,
        is_founder_preview: Boolean(isFounderPreview),
      },
    });

  if (error) {
    return { ok: false, reason: "CHECKIN_STATE_RECORD_FAILED" };
  }

  return {
    ok: true,
    state,
    daypart,
    snoozedUntil: snoozedUntil?.toISOString() || null,
    answerRecorded: false,
    performanceScoreCreated: false,
    managerSignalCreated: false,
    productionEffectEnabled: false,
  };
}


export const PEOPLE_EXPERIENCE_OPERATIONAL_EVENTS = Object.freeze([
  "safe_moment_deferred",
  "prompt_auto_minimised",
  "snooze_reminder_returned",
  "reminder_dismissed_while_snoozed",
  "eligibility_source_unavailable",
  "care_state_persistence_degraded",
]);

export async function recordPeopleExperienceOperationalEvent({
  adminClient,
  actorUserId,
  moduleId,
  actorMode,
  event,
  localDate,
  localHour,
  daypart = "",
  reason = "",
}) {
  if (!adminClient || !actorUserId || !moduleId) {
    return { ok: false, reason: "MISSING_AUTHORISED_CONTEXT" };
  }

  if (!PEOPLE_EXPERIENCE_OPERATIONAL_EVENTS.includes(event)) {
    return { ok: false, reason: "INVALID_PEOPLE_EXPERIENCE_OPERATIONAL_EVENT" };
  }

  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(String(localDate || "")) ||
    !validLocalHour(localHour)
  ) {
    return { ok: false, reason: "INVALID_LOCAL_CONTEXT" };
  }

  const automaticActionByEvent = {
    safe_moment_deferred: "WAIT_AND_RETRY_AT_SAFE_MOMENT",
    prompt_auto_minimised: "MINIMISE_TO_PERSISTENT_REMINDER",
    snooze_reminder_returned: "RETURN_SMALL_REMINDER_AFTER_SNOOZE",
    reminder_dismissed_while_snoozed: "DISMISS_REMINDER_KEEP_SAME_SNOOZE",
    eligibility_source_unavailable: "FAIL_CLOSED_AND_RETRY_LATER",
    care_state_persistence_degraded: "KEEP_LOCAL_SAFE_STATE_AND_REPORT_DEGRADATION",
  };

  const verificationByEvent = {
    safe_moment_deferred: "PENDING_RETRY",
    prompt_auto_minimised: "UI_STATE_COMPLETED",
    snooze_reminder_returned: "UI_STATE_COMPLETED",
    reminder_dismissed_while_snoozed: "UI_STATE_COMPLETED",
    eligibility_source_unavailable: "TECHNICAL_RETRY_REQUIRED",
    care_state_persistence_degraded: "TECHNICAL_RETRY_REQUIRED",
  };

  const needsTechnicalAttention =
    event === "eligibility_source_unavailable" ||
    event === "care_state_persistence_degraded";

  const { error } = await adminClient.from("admin_audit_events").insert({
    event_type: "people_experience_operational_recovery",
    actor_user_id: actorUserId,
    module_id: moduleId,
    resource_id: "people-experience-operational-health",
    action_id: event,
    outcome: needsTechnicalAttention ? "needs_attention" : "recorded",
    oversight_level: needsTechnicalAttention ? 2 : 1,
    environment: "staging",
    details: {
      local_date: localDate,
      local_hour: localHour,
      care_daypart: daypart || peopleCheckInDaypart(localHour),
      actor_mode: actorMode || null,
      operational_event: event,
      reason: reason || null,
      automatic_action: automaticActionByEvent[event],
      verification_state: verificationByEvent[event],
      answer_recorded: false,
      answer_value_recorded: false,
      emotional_score_created: false,
      performance_score_created: false,
      manager_signal_created: false,
      private_conversation_content_recorded: false,
      production_effect_enabled: false,
    },
  });

  if (error) {
    return { ok: false, reason: "PEOPLE_EXPERIENCE_OPERATIONAL_EVENT_RECORD_FAILED" };
  }

  return {
    ok: true,
    event,
    automaticAction: automaticActionByEvent[event],
    verificationState: verificationByEvent[event],
    needsTechnicalAttention,
    productionEffectEnabled: false,
  };
}
