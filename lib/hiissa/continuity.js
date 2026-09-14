// HIISSA Continuity Engine
// Centralises time-aware conversation continuity.
// Keep this module independent from UI rendering.

export const HIISSA_RETURN_CATEGORIES = {
  NEW: "new",
  ACTIVE: "active",
  SHORT_RETURN: "short_return",
  LATER_SAME_DAY: "later_same_day",
  NEXT_DAY: "next_day",
  FEW_DAYS: "few_days",
  LONGER_RETURN: "longer_return",
  EXTENDED_RETURN: "extended_return",
};

export const HIISSA_CONTINUITY_THRESHOLDS = {
  ACTIVE_MINUTES: 15,
  SHORT_RETURN_HOURS: 2,
  FEW_DAYS_MAX: 6,
  LONGER_RETURN_MAX: 29,
};

function getLocalCalendarDayDifference(previous, current) {
  const previousDay = Date.UTC(
    previous.getFullYear(),
    previous.getMonth(),
    previous.getDate()
  );

  const currentDay = Date.UTC(
    current.getFullYear(),
    current.getMonth(),
    current.getDate()
  );

  return Math.round(
    (currentDay - previousDay) / (24 * 60 * 60 * 1000)
  );
}

export function getContinuityContext({
  lastMeaningfulConversationAt,
  lastActivityAt,
  now = new Date(),
} = {}) {
  const sourceTimestamp =
    lastMeaningfulConversationAt || lastActivityAt || null;

  if (!sourceTimestamp) {
    return {
      type: HIISSA_RETURN_CATEGORIES.NEW,
      elapsedMinutes: null,
      elapsedHours: null,
      calendarDays: null,
      sameCalendarDay: false,
    };
  }

  const previous = new Date(sourceTimestamp);
  const current = new Date(now);

  if (
    Number.isNaN(previous.getTime()) ||
    Number.isNaN(current.getTime())
  ) {
    return {
      type: HIISSA_RETURN_CATEGORIES.NEW,
      elapsedMinutes: null,
      elapsedHours: null,
      calendarDays: null,
      sameCalendarDay: false,
    };
  }

  const elapsedMs = Math.max(
    0,
    current.getTime() - previous.getTime()
  );

  const elapsedMinutes = Math.floor(
    elapsedMs / (60 * 1000)
  );

  const elapsedHours =
    elapsedMs / (60 * 60 * 1000);

  const calendarDays =
    getLocalCalendarDayDifference(previous, current);

  const sameCalendarDay = calendarDays === 0;

  let type = HIISSA_RETURN_CATEGORIES.ACTIVE;

  if (
    elapsedMinutes <
    HIISSA_CONTINUITY_THRESHOLDS.ACTIVE_MINUTES
  ) {
    type = HIISSA_RETURN_CATEGORIES.ACTIVE;
  } else if (calendarDays >= 30) {
    type = HIISSA_RETURN_CATEGORIES.EXTENDED_RETURN;
  } else if (calendarDays >= 7) {
    type = HIISSA_RETURN_CATEGORIES.LONGER_RETURN;
  } else if (calendarDays >= 2) {
    type = HIISSA_RETURN_CATEGORIES.FEW_DAYS;
  } else if (calendarDays === 1) {
    type = HIISSA_RETURN_CATEGORIES.NEXT_DAY;
  } else if (
    elapsedHours <
    HIISSA_CONTINUITY_THRESHOLDS.SHORT_RETURN_HOURS
  ) {
    type = HIISSA_RETURN_CATEGORIES.SHORT_RETURN;
  } else {
    type = HIISSA_RETURN_CATEGORIES.LATER_SAME_DAY;
  }

  return {
    type,
    elapsedMinutes,
    elapsedHours,
    calendarDays,
    sameCalendarDay,
  };
}
