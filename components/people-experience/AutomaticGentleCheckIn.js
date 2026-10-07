"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import GentleCheckIn from "./GentleCheckIn.js";
import styles from "./AutomaticGentleCheckIn.module.css";

const PREVIEW_AUTO_DELAY_MS = 8000;
const DEFAULT_ACTIVE_WORK_DELAY_MS = 30 * 60 * 1000;
const DEFAULT_POLL_MS = 15 * 60 * 1000;
const DEFAULT_SNOOZE_MS = 30 * 60 * 1000;
const AUTO_MINIMISE_MS = 60 * 1000;
const RECENT_ACTIVITY_WINDOW_MS = 5 * 60 * 1000;
const SAFE_MOMENT_RETRY_MS = 2 * 60 * 1000;

function nowContext() {
  const now = new Date();
  return {
    localDate: [
      now.getFullYear(),
      String(now.getMonth() + 1).padStart(2, "0"),
      String(now.getDate()).padStart(2, "0"),
    ].join("-"),
    localHour: now.getHours(),
    timeZone:
      Intl.DateTimeFormat().resolvedOptions().timeZone || "local-device",
  };
}

function currentDaypart() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 17) return "afternoon";
  return "evening";
}

export default function AutomaticGentleCheckIn({
  enabled = false,
  displayName = "",
  roleLabel = "",
  privacyText = "",
  previewOnly = false,
  pause = false,
  requestEligibility,
  recordState,
  recordOperationalEvent,
  manualRequestKey = 0,
  onCalmStart,
}) {
  const [offer, setOffer] = useState(null);
  const [open, setOpen] = useState(false);
  const [reminder, setReminder] = useState("");
  const [snoozedUntil, setSnoozedUntil] = useState(null);
  const [checking, setChecking] = useState(false);
  const previewDayparts = useRef(new Set());
  const lastManualRequest = useRef(manualRequestKey);
  const lastActivityAt = useRef(Date.now());
  const safeRetryTimer = useRef(null);
  const lastOperationalEventAt = useRef(new Map());

  function emitOperationalEvent(event, context, minimumGapMs = 0) {
    if (typeof recordOperationalEvent !== "function") return;

    const previousAt = Number(lastOperationalEventAt.current.get(event) || 0);
    const now = Date.now();
    if (minimumGapMs > 0 && now - previousAt < minimumGapMs) return;

    lastOperationalEventAt.current.set(event, now);
    void recordOperationalEvent(event, context);
  }

  const pollMs = Number(offer?.pollMinutes || 15) * 60 * 1000 || DEFAULT_POLL_MS;
  const snoozeMs =
    Number(offer?.snoozeMinutes || 30) * 60 * 1000 || DEFAULT_SNOOZE_MS;

  const daypart = offer?.daypart || currentDaypart();

  async function evaluateCare({ manual = false } = {}) {
    if (!enabled || pause || checking || open) return;

    const snoozeStillActive =
      snoozedUntil && snoozedUntil.getTime() > Date.now();
    if (!manual && snoozeStillActive) return;

    const activeElement =
      typeof document !== "undefined" ? document.activeElement : null;
    const tagName = String(activeElement?.tagName || "").toLowerCase();
    const editing =
      tagName === "input" ||
      tagName === "textarea" ||
      tagName === "select" ||
      activeElement?.getAttribute?.("contenteditable") === "true";
    const recentlyActive =
      previewOnly || Date.now() - lastActivityAt.current <= RECENT_ACTIVITY_WINDOW_MS;

    if (!manual && (!recentlyActive || editing)) {
      emitOperationalEvent(
        "safe_moment_deferred",
        {
          ...nowContext(),
          daypart: currentDaypart(),
          reason: editing ? "ACTIVE_EDITING" : "RECENT_ACTIVITY_REQUIRED",
        },
        DEFAULT_POLL_MS
      );
      if (safeRetryTimer.current) window.clearTimeout(safeRetryTimer.current);
      safeRetryTimer.current = window.setTimeout(() => {
        evaluateCare();
      }, SAFE_MOMENT_RETRY_MS);
      return;
    }

    setChecking(true);
    try {
      let result = null;

      if (typeof requestEligibility === "function") {
        result = await requestEligibility({
          ...nowContext(),
          manualPreview: manual,
        });
      } else if (previewOnly) {
        const nextDaypart = currentDaypart();
        const alreadyOffered = previewDayparts.current.has(nextDaypart);

        result = {
          due: manual || !alreadyOffered,
          reason: manual
            ? "FOUNDER_MANUAL_PREVIEW"
            : alreadyOffered
              ? "DAYPART_ALREADY_OFFERED_PREVIEW"
              : "FOUNDER_AUTOMATIC_PREVIEW",
          daypart: nextDaypart,
          maximumPerActiveDay: 3,
          activeWorkDelayMinutes: 30,
          pollMinutes: 15,
          snoozeMinutes: 30,
          previewOnly: true,
          privacy:
            "Founder Preview only. No emotional answer is stored, scored or shown to a manager.",
        };

        if (result.due && !manual) previewDayparts.current.add(nextDaypart);
      }

      if (!result) {
        emitOperationalEvent(
          "eligibility_source_unavailable",
          {
            ...nowContext(),
            daypart: currentDaypart(),
            reason: "NO_ELIGIBILITY_RESULT",
          },
          DEFAULT_POLL_MS
        );
        return;
      }

      if (result.due) {
        setOffer(result);
        setReminder("");
        setSnoozedUntil(null);
        setOpen(true);
      } else if (result.reason === "SNOOZED" && result.snoozedUntil) {
        setOffer(result);
        setReminder("snoozed");
        setSnoozedUntil(new Date(result.snoozedUntil));
      }
    } finally {
      setChecking(false);
    }
  }

  useEffect(() => {
    if (!enabled) return undefined;

    const markActive = () => {
      lastActivityAt.current = Date.now();
    };

    window.addEventListener("pointerdown", markActive, { passive: true });
    window.addEventListener("keydown", markActive);
    window.addEventListener("touchstart", markActive, { passive: true });
    window.addEventListener("scroll", markActive, { passive: true });

    const timer = window.setTimeout(() => {
      evaluateCare();
    }, previewOnly ? PREVIEW_AUTO_DELAY_MS : DEFAULT_ACTIVE_WORK_DELAY_MS);

    return () => {
      window.clearTimeout(timer);
      if (safeRetryTimer.current) window.clearTimeout(safeRetryTimer.current);
      window.removeEventListener("pointerdown", markActive);
      window.removeEventListener("keydown", markActive);
      window.removeEventListener("touchstart", markActive);
      window.removeEventListener("scroll", markActive);
    };
  }, [enabled, previewOnly]);

  useEffect(() => {
    if (!enabled) return undefined;

    const timer = window.setInterval(() => {
      if (!open && !pause && !snoozedUntil && reminder !== "pending") {
        evaluateCare();
      }
    }, pollMs);

    return () => window.clearInterval(timer);
  }, [enabled, open, pause, pollMs, reminder, snoozedUntil]);

  useEffect(() => {
    if (!open) return undefined;

    const timer = window.setTimeout(() => {
      setOpen(false);
      setReminder("pending");
      emitOperationalEvent("prompt_auto_minimised", {
        ...nowContext(),
        daypart,
        reason: "FULL_PROMPT_IGNORED",
      });
    }, AUTO_MINIMISE_MS);

    return () => window.clearTimeout(timer);
  }, [open, offer?.daypart]);

  useEffect(() => {
    if (manualRequestKey === lastManualRequest.current) return;
    lastManualRequest.current = manualRequestKey;
    evaluateCare({ manual: true });
  }, [manualRequestKey]);

  useEffect(() => {
    if (!snoozedUntil) return undefined;

    const delay = Math.max(0, snoozedUntil.getTime() - Date.now());
    const timer = window.setTimeout(() => {
      setSnoozedUntil(null);
      setOpen(false);
      setReminder("pending");
      emitOperationalEvent("snooze_reminder_returned", {
        ...nowContext(),
        daypart,
        reason: "SNOOZE_EXPIRED",
      });
    }, delay);

    return () => window.clearTimeout(timer);
  }, [snoozedUntil]);

  async function resolveWithoutAnswerValue() {
    if (!offer?.previewOnly && typeof recordState === "function") {
      const result = await recordState("resolved", {
        ...nowContext(),
        daypart,
      });
      if (!result && typeof recordOperationalEvent === "function") {
        emitOperationalEvent(
          "care_state_persistence_degraded",
          {
            ...nowContext(),
            daypart,
            reason: "RESOLVED_STATE_NOT_CONFIRMED",
          },
          5 * 60 * 1000
        );
      }
    }
    setReminder("");
    setSnoozedUntil(null);
  }

  async function snooze({ hideReminder = false } = {}) {
    let nextUntil = new Date(Date.now() + snoozeMs);

    if (!offer?.previewOnly && typeof recordState === "function") {
      const result = await recordState("snoozed", {
        ...nowContext(),
        daypart,
      });
      if (result?.snoozedUntil) {
        const serverUntil = new Date(result.snoozedUntil);
        if (Number.isFinite(serverUntil.getTime())) nextUntil = serverUntil;
      } else if (!result && typeof recordOperationalEvent === "function") {
        emitOperationalEvent(
          "care_state_persistence_degraded",
          {
            ...nowContext(),
            daypart,
            reason: "SNOOZED_STATE_NOT_CONFIRMED",
          },
          5 * 60 * 1000
        );
      }
    }

    setOpen(false);
    setReminder(hideReminder ? "snoozed_hidden" : "snoozed");
    setSnoozedUntil(nextUntil);

    if (hideReminder && typeof recordOperationalEvent === "function") {
      emitOperationalEvent("reminder_dismissed_while_snoozed", {
        ...nowContext(),
        daypart,
        reason: "SECOND_NOT_NOW",
      });
    }
  }

  const reminderText = useMemo(() => {
    if (reminder === "snoozed") {
      return "Snoozed for now — your gentle check-in is still here when you’re ready.";
    }
    return "A gentle check-in is waiting. Take a moment when you’re ready.";
  }, [reminder]);

  if (!enabled) return null;

  return (
    <>
      <GentleCheckIn
        open={open}
        displayName={displayName}
        roleLabel={roleLabel}
        choices={offer?.choices}
        privacyText={offer?.privacy || privacyText}
        daypart={daypart}
        previewOnly={previewOnly || Boolean(offer?.previewOnly)}
        onResponded={resolveWithoutAnswerValue}
        onNotNow={snooze}
        onClose={() => {
          setOpen(false);
          setReminder("");
        }}
        onCalmStart={(choice) => {
          onCalmStart?.(choice);
          setOpen(false);
          setReminder("");
        }}
      />

      {!open && reminder && reminder !== "snoozed_hidden" ? (
        <aside
          className={styles.reminder}
          role="status"
          aria-label="HIISSA gentle check-in reminder"
        >
          <div className={styles.reminderMark} aria-hidden="true">H</div>
          <div className={styles.reminderCopy}>
            <span>HIISSA</span>
            <strong>
              {reminder === "snoozed"
                ? "Gentle check-in snoozed"
                : "A gentle check-in is waiting"}
            </strong>
            <p>{reminderText}</p>
          </div>
          <div className={styles.reminderActions}>
            <button
              type="button"
              className={styles.respond}
              onClick={() => setOpen(true)}
            >
              Respond now
            </button>
            <button
              type="button"
              className={styles.snooze}
              onClick={() => snooze({ hideReminder: true })}
            >
              Not now
            </button>
          </div>
        </aside>
      ) : null}
    </>
  );
}
