export const PEOPLE_CHECKIN_MIN_HOURS = 48;

export const PEOPLE_CHECKIN_CHOICES = Object.freeze([
  "I'm doing well",
  "I'm okay",
  "It's a heavy day",
  "I could use a calmer start",
]);

export async function prepareGentleCheckIn({
  adminClient,
  actorUserId,
  moduleId,
  actorMode,
  contextLabel,
  localDate,
  welcomeMode,
  isFounderPreview = false,
}) {
  if (!adminClient || !actorUserId || !moduleId) {
    return {
      due: false,
      reason: "MISSING_AUTHORISED_CONTEXT",
    };
  }

  if (welcomeMode === "QUIET_RETURN") {
    return {
      due: false,
      reason: "QUIET_RETURN",
    };
  }

  const { data: previousRows, error: previousError } = await adminClient
    .from("admin_audit_events")
    .select("occurred_at")
    .eq("event_type", "people_experience_checkin_offered")
    .eq("actor_user_id", actorUserId)
    .eq("module_id", moduleId)
    .eq("environment", "staging")
    .order("occurred_at", { ascending: false })
    .limit(1);

  if (previousError) {
    return {
      due: false,
      reason: "CHECKIN_HISTORY_UNAVAILABLE",
    };
  }

  const previousAt = previousRows?.[0]?.occurred_at
    ? new Date(previousRows[0].occurred_at)
    : null;
  const hoursSincePrevious =
    previousAt && Number.isFinite(previousAt.getTime())
      ? Math.max(0, (Date.now() - previousAt.getTime()) / 3600000)
      : null;

  if (
    hoursSincePrevious !== null &&
    hoursSincePrevious < PEOPLE_CHECKIN_MIN_HOURS
  ) {
    return {
      due: false,
      reason: "CADENCE_NOT_DUE",
      hoursSincePrevious: Math.floor(hoursSincePrevious),
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
        local_date: localDate || null,
        context_label: contextLabel || null,
        actor_mode: actorMode || null,
        cadence_hours: PEOPLE_CHECKIN_MIN_HOURS,
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
    cadenceHours: PEOPLE_CHECKIN_MIN_HOURS,
    choices: PEOPLE_CHECKIN_CHOICES,
    privacy:
      "Your answer stays in this browser experience. HIISSA does not send it into the Founder/Admin audit trail, performance scoring or manager monitoring.",
    previewOnly: Boolean(isFounderPreview),
    productionEffectEnabled: false,
  };
}
