export function hiissaResolvedTimeZone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "Local time";
  } catch {
    return "Local time";
  }
}

function parseDate(value) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isFinite(date.getTime()) ? date : null;
}

function sameLocalDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function clock(date, includeSeconds = false) {
  try {
    return new Intl.DateTimeFormat("en-GB", {
      hour: "numeric",
      minute: "2-digit",
      second: includeSeconds ? "2-digit" : undefined,
      hour12: true,
    })
      .format(date)
      .replace(/\bam\b/i, "AM")
      .replace(/\bpm\b/i, "PM");
  } catch {
    return "—";
  }
}

export function formatHiissaRecordTime(value, nowValue = new Date()) {
  const date = parseDate(value);
  const now = parseDate(nowValue) || new Date();
  if (!date) return "—";

  const time = clock(date, false);
  if (sameLocalDay(date, now)) return `Today · ${time}`;

  try {
    const includeYear = date.getFullYear() !== now.getFullYear();
    const day = new Intl.DateTimeFormat("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: includeYear ? "numeric" : undefined,
    }).format(date);
    return `${day} · ${time}`;
  } catch {
    return time;
  }
}

export function formatHiissaFullRecordTime(value) {
  const date = parseDate(value);
  if (!date) return "—";

  try {
    const dateText = new Intl.DateTimeFormat("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date);
    return `${dateText} · ${clock(date, true)} · ${hiissaResolvedTimeZone()}`;
  } catch {
    return formatHiissaRecordTime(date);
  }
}

export function hiissaTimestampRecord(value) {
  const date = parseDate(value);
  if (!date) {
    return {
      isoUtc: null,
      compact: "—",
      full: "—",
      timeZone: hiissaResolvedTimeZone(),
    };
  }

  return {
    isoUtc: date.toISOString(),
    compact: formatHiissaRecordTime(date),
    full: formatHiissaFullRecordTime(date),
    timeZone: hiissaResolvedTimeZone(),
  };
}


export function hiissaResolvedLocale() {
  try {
    if (typeof navigator !== "undefined" && navigator.language) {
      return navigator.language;
    }
    return Intl.DateTimeFormat().resolvedOptions().locale || "en-GB";
  } catch {
    return "en-GB";
  }
}

export function formatHiissaGlobalRecordTime(
  value,
  {
    locale = hiissaResolvedLocale(),
    timeZone = hiissaResolvedTimeZone(),
    includeSeconds = false,
  } = {}
) {
  const date = parseDate(value);
  if (!date) return "—";

  try {
    return new Intl.DateTimeFormat(locale, {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      second: includeSeconds ? "2-digit" : undefined,
      timeZone,
      timeZoneName: "short",
    }).format(date);
  } catch {
    return formatHiissaFullRecordTime(date);
  }
}

export function hiissaGlobalTimestampRecord(
  value,
  {
    locale = hiissaResolvedLocale(),
    timeZone = hiissaResolvedTimeZone(),
  } = {}
) {
  const date = parseDate(value);
  if (!date) {
    return {
      isoUtc: null,
      display: "—",
      locale,
      timeZone,
    };
  }

  return {
    isoUtc: date.toISOString(),
    display: formatHiissaGlobalRecordTime(date, { locale, timeZone }),
    locale,
    timeZone,
  };
}
