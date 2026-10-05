"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./CalmerStartMoment.module.css";

const OPTIONS = Object.freeze([
  Object.freeze({
    id: "breathe",
    label: "Help me breathe for a moment",
    description: "A short guided breathing pause before you return to work.",
    durationSeconds: 30,
  }),
  Object.freeze({
    id: "quiet",
    label: "Give me a quiet moment",
    description: "A simple quiet pause with very little on screen.",
    durationSeconds: 30,
  }),
  Object.freeze({
    id: "focus",
    label: "Help me focus on one thing",
    description: "No breathing exercise — just reduce the day to one manageable next step.",
    durationSeconds: 0,
  }),
]);

function optionById(id) {
  return OPTIONS.find((item) => item.id === id) || null;
}

function breathingCue(secondsLeft) {
  if (secondsLeft <= 0) return "You can carry on when you’re ready.";
  const phase = Math.floor((30 - secondsLeft) / 4) % 2;
  return phase === 0 ? "Breathe in gently…" : "Breathe out slowly…";
}

export default function CalmerStartMoment({
  open = false,
  displayName = "",
  previewOnly = false,
  taskTitle = "",
  onStartGently,
  onContinueNormally,
}) {
  const [selected, setSelected] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [finished, setFinished] = useState(false);

  const option = useMemo(() => optionById(selected), [selected]);

  useEffect(() => {
    if (!open) {
      setSelected("");
      setSecondsLeft(0);
      setFinished(false);
    }
  }, [open]);

  useEffect(() => {
    if (!open || !option || option.durationSeconds <= 0 || finished) {
      return undefined;
    }

    if (secondsLeft <= 0) {
      setFinished(true);
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setSecondsLeft((value) => Math.max(0, value - 1));
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [open, option, secondsLeft, finished]);

  if (!open) return null;

  function choose(id) {
    const next = optionById(id);
    setSelected(id);
    setFinished(next?.durationSeconds === 0);
    setSecondsLeft(next?.durationSeconds || 0);
  }

  function readyNow() {
    setFinished(true);
    setSecondsLeft(0);
  }

  const name = displayName ? `, ${displayName}` : "";

  return (
    <div
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-label="HIISSA Calmer Start moment"
    >
      <section className={styles.card}>
        <div className={styles.kicker}>HIISSA · CALMER START MOMENT</div>

        {previewOnly ? (
          <div className={styles.previewNotice}>
            Founder Preview — this demonstrates the staff experience. Nothing here
            changes real employee work or Production.
          </div>
        ) : null}

        {!selected ? (
          <>
            <h2>Take one small moment{name}.</h2>
            <p className={styles.intro}>
              For the next moment, nothing needs your attention except this.
              Choose what would feel most helpful right now.
            </p>

            <div className={styles.options}>
              {OPTIONS.map((item) => (
                <button
                  type="button"
                  key={item.id}
                  className={styles.option}
                  onClick={() => choose(item.id)}
                >
                  <strong>{item.label}</strong>
                  <span>{item.description}</span>
                </button>
              ))}
            </div>

            <button
              type="button"
              className={styles.skip}
              onClick={onContinueNormally}
            >
              Skip — I’m ready to continue normally
            </button>
          </>
        ) : option?.id === "breathe" ? (
          <>
            <h2>A quiet breath is enough.</h2>
            <div className={styles.breathingArea}>
              <div className={styles.breathCircle} aria-hidden="true" />
              <strong>{breathingCue(secondsLeft)}</strong>
              <span>{secondsLeft > 0 ? `${secondsLeft} seconds` : "Ready"}</span>
            </div>
            <p className={styles.grounding}>
              There is nothing to solve in this moment. Let your shoulders soften
              and take the next breath at your own pace.
            </p>
            {!finished ? (
              <button type="button" className={styles.secondary} onClick={readyNow}>
                I’m ready
              </button>
            ) : (
              <button type="button" className={styles.primary} onClick={onStartGently}>
                Start gently
              </button>
            )}
          </>
        ) : option?.id === "quiet" ? (
          <>
            <h2>A quiet moment.</h2>
            <div className={styles.quietArea}>
              <div className={styles.moon} aria-hidden="true">☾</div>
              <p>
                You do not have to think about the whole day right now.
                This moment can simply be quiet.
              </p>
              <strong>{secondsLeft > 0 ? `${secondsLeft} seconds` : "Take the next step when you’re ready."}</strong>
            </div>
            {!finished ? (
              <button type="button" className={styles.secondary} onClick={readyNow}>
                I’m ready
              </button>
            ) : (
              <button type="button" className={styles.primary} onClick={onStartGently}>
                Start gently
              </button>
            )}
          </>
        ) : (
          <>
            <h2>One thing is enough to begin.</h2>
            <div className={styles.focusArea}>
              <span>ONE NEXT STEP</span>
              <strong>{taskTitle || "Continue with the next clear task."}</strong>
              <p>
                You do not need to organise the whole day before you begin.
                HIISSA will keep the workspace focused on this one next step first.
              </p>
            </div>
            <button type="button" className={styles.primary} onClick={onStartGently}>
              Start gently
            </button>
          </>
        )}

        {selected ? (
          <div className={styles.footerActions}>
            <button type="button" className={styles.textButton} onClick={() => choose("")}>
              Choose a different calming option
            </button>
            <button type="button" className={styles.textButton} onClick={onContinueNormally}>
              Continue normally instead
            </button>
          </div>
        ) : null}

        <div className={styles.privacy}>
          <strong>Private by default.</strong> Your calming choice is not stored,
          scored or shown to a manager. It does not change your workload,
          responsibilities, priority or performance record.
        </div>
      </section>
    </div>
  );
}
