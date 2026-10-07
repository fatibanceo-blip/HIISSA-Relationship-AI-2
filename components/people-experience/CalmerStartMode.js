"use client";

import { useEffect, useRef } from "react";
import styles from "./CalmerStartMode.module.css";

export default function CalmerStartMode({
  active = false,
  previewOnly = false,
  workspaceLabel = "",
  taskTitle = "",
  taskDetail = "",
  taskStatus = "",
  continueLabel = "Continue with this task",
  expanded = false,
  onContinueTask,
  onShowAll,
  onExit,
}) {
  const modeRef = useRef(null);

  useEffect(() => {
    if (!active) return undefined;

    const frame = window.requestAnimationFrame(() => {
      const node = modeRef.current;
      if (!node) return;

      const reduceMotion = window.matchMedia?.(
        "(prefers-reduced-motion: reduce)"
      )?.matches;

      node.focus({ preventScroll: true });
      node.scrollIntoView({
        block: "start",
        behavior: reduceMotion ? "auto" : "smooth",
      });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [active]);

  if (!active) return null;

  return (
    <section
      ref={modeRef}
      tabIndex={-1}
      className={styles.mode}
      role="status"
      aria-label="HIISSA Calmer Start mode"
    >
      <div className={styles.header}>
        <div>
          <div className={styles.kicker}>HIISSA · CALMER START</div>
          <h2>Calmer Start is on.</h2>
          <p>
            We’ll keep the next step clear and reduce non-urgent visual pressure.
            Your responsibilities, priority and performance records have not changed.
          </p>
        </div>
        <span className={styles.onBadge}>ON</span>
      </div>

      {previewOnly ? (
        <div className={styles.previewNotice}>
          Founder Preview — this demonstrates the staff experience. It does not
          change real employee work or Production.
        </div>
      ) : null}

      <article className={styles.nextStep}>
        <div className={styles.nextStepTop}>
          <div>
            <span>YOUR NEXT STEP</span>
            <h3>{taskTitle || "Continue with your current work"}</h3>
          </div>
          {taskStatus ? <strong>{taskStatus}</strong> : null}
        </div>
        {taskDetail ? <p>{taskDetail}</p> : null}
        {workspaceLabel ? (
          <small>{workspaceLabel} · normal responsibilities remain available</small>
        ) : null}
      </article>

      <div className={styles.actions}>
        <button type="button" className={styles.primary} onClick={onContinueTask}>
          {continueLabel}
        </button>
        {!expanded ? (
          <button type="button" className={styles.secondary} onClick={onShowAll}>
            View all workspace areas
          </button>
        ) : null}
        <button type="button" className={styles.textButton} onClick={onExit}>
          Return to normal workspace
        </button>
      </div>

      <p className={styles.reassurance}>
        Other work is still safe and available when you’re ready. Calmer Start
        changes presentation only — it does not remove work, lower priority or
        create a manager signal.
      </p>
    </section>
  );
}
