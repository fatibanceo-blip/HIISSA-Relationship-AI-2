// HIISSA Continuity Engine
// Centralises time-aware conversation continuity.
// Keep this module independent from UI rendering.

export const HIISSA_CONTINUITY_THRESHOLDS = {
  SHORT_RETURN_MINUTES: 15,
  SAME_DAY_HOURS: 8,
  NEXT_DAY_HOURS: 36,
};

export function getContinuityContext({
  lastActivityAt,
  now = new Date(),
} = {}) {
  if (!lastActivityAt) {
    return {
      type: "new",
      elapsedMinutes: null,
      sameCalendarDay: false,
    };
  }

  const previous = new Date(lastActivityAt);
  const current = new Date(now);

  if (
    Number.isNaN(previous.getTime()) ||
    Number.isNaN(current.getTime())
  ) {
    return {
      type: "new",
      elapsedMinutes: null,
      sameCalendarDay: false,
    };
  }

  const elapsedMinutes = Math.max(
    0,
    Math.floor((current.getTime() - previous.getTime()) / 60000)
  );

  const sameCalendarDay =
    previous.getFullYear() === current.getFullYear() &&
    previous.getMonth() === current.getMonth() &&
    previous.getDate() === current.getDate();

  let type = "later";

  if (elapsedMinutes < HIISSA_CONTINUITY_THRESHOLDS.SHORT_RETURN_MINUTES) {
    type = "brief_return";
  } else if (sameCalendarDay) {
    type = "same_day_return";
  } else if (
    elapsedMinutes <
    HIISSA_CONTINUITY_THRESHOLDS.NEXT_DAY_HOURS * 60
  ) {
    type = "next_day_return";
  }

  return {
    type,
    elapsedMinutes,
    sameCalendarDay,
  };
}
