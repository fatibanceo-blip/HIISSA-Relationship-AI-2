"use client";

import { useState } from "react";
import styles from "./PrivateAppreciation.module.css";

const MAX_MESSAGE_LENGTH = 320;

export default function PrivateAppreciation({
  mode = "founder-preview",
  recipientLabel = "Customer Support",
  isFounderPreview = false,
}) {
  const [message, setMessage] = useState("");
  const [preview, setPreview] = useState("");

  if (mode === "recipient-empty") {
    return (
      <section className={styles.recipientSurface} aria-label="Private Appreciation & Recognition">
        <div className={styles.kicker}>HIISSA · PRIVATE APPRECIATION & RECOGNITION</div>
        <div className={styles.surfaceHeading}>
          <div>
            <h3>A private place for recognition</h3>
            <p>
              Appreciation is private by default. It is not a score, ranking,
              leaderboard or popularity signal.
            </p>
          </div>
          <span className={styles.foundationPill}>STAGING FOUNDATION</span>
        </div>

        <div className={styles.emptyState}>
          <strong>No saved appreciation source is connected yet.</strong>
          <p>
            This Staging interface foundation does not fetch, store or deliver
            appreciation messages. Persistence and recipient delivery require a
            separately approved data contract.
          </p>
          {isFounderPreview ? (
            <small>
              Founder Preview — no appreciation is being delivered to a real staff member.
            </small>
          ) : null}
        </div>
      </section>
    );
  }

  function makePreview() {
    const next = message.trim();
    if (!next) return;
    setPreview(next);
  }

  return (
    <section className={styles.founderSurface} aria-label="Private Appreciation & Recognition preview">
      <div className={styles.kicker}>HIISSA · PEOPLE EXPERIENCE</div>
      <div className={styles.surfaceHeading}>
        <div>
          <h3>Private Appreciation & Recognition</h3>
          <p>
            A quiet way to recognise someone without competition, public ranking
            or performance scoring.
          </p>
        </div>
        <span className={styles.foundationPill}>STAGING · PREVIEW ONLY</span>
      </div>

      <div className={styles.previewGrid}>
        <div className={styles.composePanel}>
          <label htmlFor="hiissa-private-appreciation-message">
            Private appreciation for {recipientLabel}
          </label>
          <textarea
            id="hiissa-private-appreciation-message"
            rows={5}
            maxLength={MAX_MESSAGE_LENGTH}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Write a sincere private note of appreciation…"
          />
          <div className={styles.composeMeta}>
            <span>{message.length}/{MAX_MESSAGE_LENGTH}</span>
            <span>Browser memory only · not stored</span>
          </div>
          <button
            type="button"
            className={styles.previewButton}
            disabled={!message.trim()}
            onClick={makePreview}
          >
            Preview appreciation
          </button>
          <p className={styles.safetyNote}>
            Preview only — nothing is sent or stored. No Supabase record,
            staff notification or Production effect is created by this interface.
          </p>
        </div>

        <div className={styles.recipientPreview}>
          <div className={styles.previewLabel}>RECIPIENT PREVIEW</div>
          {preview ? (
            <article className={styles.appreciationCard}>
              <div className={styles.cardLabel}>A private note of appreciation</div>
              <p>{preview}</p>
              <small>From HIISSA Founder · Private recognition</small>
            </article>
          ) : (
            <div className={styles.previewPlaceholder}>
              Your private appreciation preview will appear here.
            </div>
          )}
        </div>
      </div>

      <div className={styles.boundaryNote}>
        <strong>Protected boundary:</strong> no leaderboard, popularity score,
        positivity score, employee ranking or colleague-to-colleague recognition
        is enabled in this foundation.
      </div>
    </section>
  );
}
