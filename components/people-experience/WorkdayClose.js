"use client";

import styles from "./WorkdayClose.module.css";

export default function WorkdayClose({
  open = false,
  identity = "",
  heading = "Before you finish…",
  intro = "",
  loading = false,
  error = "",
  items = [],
  sourceNote = "",
  caution = "",
  actions = [],
  onClose,
}) {
  if (!open) return null;

  return (
    <div
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-label="HIISSA Workday Close"
    >
      <section className={styles.card}>
        <div className={styles.glow} aria-hidden="true" />
        <div className={styles.kicker}>HIISSA · WORKDAY CLOSE</div>
        {identity ? <div className={styles.identity}>{identity}</div> : null}
        <h2>{heading}</h2>
        {intro ? <p className={styles.intro}>{intro}</p> : null}

        {loading ? (
          <div className={styles.loading}>Checking verified work state…</div>
        ) : null}

        {error ? (
          <div className={styles.error} role="alert">
            <strong>HIISSA could not verify the closing summary.</strong>
            <span>{error}</span>
          </div>
        ) : null}

        {!loading && !error ? (
          <div className={styles.items}>
            {items.map((item) => (
              <article
                className={
                  item.tone === "attention"
                    ? styles.itemAttention
                    : item.tone === "good"
                      ? styles.itemGood
                      : styles.item
                }
                key={item.label}
              >
                <span>{item.label}</span>
                <strong>{item.value}</strong>
                {item.detail ? <p>{item.detail}</p> : null}
              </article>
            ))}
          </div>
        ) : null}

        {caution ? (
          <div className={styles.caution}>
            <strong>Before you leave</strong>
            <span>{caution}</span>
          </div>
        ) : null}

        {sourceNote ? <div className={styles.sourceNote}>{sourceNote}</div> : null}

        <div className={styles.actions}>
          {actions.map((action) => (
            <button
              type="button"
              key={action.label}
              className={action.primary ? styles.primary : styles.secondary}
              onClick={action.onClick}
            >
              {action.label}
            </button>
          ))}
          <button type="button" className={styles.close} onClick={onClose}>
            Close for now
          </button>
        </div>
      </section>
    </div>
  );
}
