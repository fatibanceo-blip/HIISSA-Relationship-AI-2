"use client";

import { useEffect, useState } from "react";
import styles from "./GentleCheckIn.module.css";

const FALLBACK_CHOICES = [
  "I'm doing well",
  "I'm okay",
  "It's a heavy day",
  "I could use a calmer start",
];

function checkInQuestion(daypart, displayName) {
  const name = displayName ? `, ${displayName}` : "";

  if (daypart === "morning") {
    return `Good morning${name}. How are you doing today?`;
  }

  if (daypart === "afternoon") {
    return `Just checking in${name}. How is your day going so far?`;
  }

  return `Before you carry on${name}, how has your day been?`;
}

function checkInIntro(daypart) {
  if (daypart === "morning") {
    return "A gentle check-in before the day gets moving. There is no right answer.";
  }
  if (daypart === "afternoon") {
    return "A small moment to notice how the day is going. There is no right answer.";
  }
  return "A quiet check-in before you continue. There is no right answer.";
}

function needsCalmerStart(choice) {
  return (
    choice === "It's a heavy day" ||
    choice === "I could use a calmer start"
  );
}

export default function GentleCheckIn({
  open = false,
  displayName = "",
  roleLabel = "",
  choices = FALLBACK_CHOICES,
  privacyText = "",
  previewOnly = false,
  daypart = "morning",
  onClose,
  onCalmStart,
}) {
  const [choice, setChoice] = useState("");

  useEffect(() => {
    if (!open) setChoice("");
  }, [open]);

  if (!open) return null;

  const calmer = needsCalmerStart(choice);

  return (
    <div
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-label="HIISSA gentle check-in"
    >
      <section className={styles.card}>
        <div className={styles.glow} aria-hidden="true" />
        <div className={styles.kicker}>HIISSA · GENTLE CHECK-IN</div>

        {previewOnly ? (
          <div className={styles.previewNotice}>
            Founder Preview — this demonstrates the staff check-in experience.
            Your selection is not treated as staff data.
          </div>
        ) : null}

        {!choice ? (
          <>
            <h2>{checkInQuestion(daypart, displayName)}</h2>
            {roleLabel ? <div className={styles.role}>{roleLabel}</div> : null}
            <p className={styles.intro}>{checkInIntro(daypart)}</p>

            <div className={styles.choices}>
              {choices.map((item) => (
                <button
                  type="button"
                  key={item}
                  onClick={() => setChoice(item)}
                >
                  {item}
                </button>
              ))}
            </div>

            <div className={styles.privacy}>
              <strong>Private by default.</strong>{" "}
              {privacyText ||
                "Your answer is not used as a performance score or hidden manager signal."}
            </div>

            <button type="button" className={styles.skip} onClick={onClose}>
              Not now
            </button>
          </>
        ) : calmer ? (
          <>
            <h2>Thank you for checking in.</h2>
            <p className={styles.response}>
              You do not need to carry everything at once. HIISSA can give you a
              calmer start without changing your responsibilities or judging how
              you feel.
            </p>

            <div className={styles.responseActions}>
              <button
                type="button"
                className={styles.primary}
                onClick={() => {
                  onCalmStart?.(choice);
                  onClose?.();
                }}
              >
                Give me a calmer start
              </button>
              <button type="button" className={styles.secondary} onClick={onClose}>
                Continue normally
              </button>
            </div>

            <div className={styles.privacy}>
              Your selection stays private in this browser experience. HIISSA
              records only that a check-in was offered, not which answer you chose.
            </div>
          </>
        ) : (
          <>
            <h2>Thank you for checking in.</h2>
            <p className={styles.response}>
              {choice === "I'm doing well"
                ? "Good to hear. Your workspace is ready when you are."
                : "Thank you for taking a moment to notice how you are doing. You can continue at your own pace."}
            </p>
            <button type="button" className={styles.primary} onClick={onClose}>
              Continue →
            </button>
            <div className={styles.privacy}>
              Your selection stays private in this browser experience. HIISSA
              records only that a check-in was offered, not which answer you chose.
            </div>
          </>
        )}
      </section>
    </div>
  );
}
