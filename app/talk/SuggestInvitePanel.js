"use client";

import { useEffect, useState } from "react";

const RECOMMENDATION_AREAS = [
  "Feature or tool",
  "Conversation experience",
  "Accessibility",
  "Design or navigation",
  "Privacy or safety",
  "Something else",
];

export default function SuggestInvitePanel({ supabase }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [recommendationOpen, setRecommendationOpen] = useState(false);
  const [idea, setIdea] = useState("");
  const [area, setArea] = useState("");
  const [whyHelpful, setWhyHelpful] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [attention, setAttention] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const media =
      typeof window !== "undefined" &&
      window.matchMedia
        ? window.matchMedia("(prefers-reduced-motion: reduce)")
        : null;

    const updateMotion = () => setReduceMotion(Boolean(media?.matches));
    updateMotion();

    if (media?.addEventListener) {
      media.addEventListener("change", updateMotion);
    }

    let timer = null;

    try {
      const seen = window.sessionStorage.getItem(
        "hiissa_suggest_invite_seen"
      );

      if (seen !== "1") {
        setAttention(true);
        window.sessionStorage.setItem(
          "hiissa_suggest_invite_seen",
          "1"
        );

        timer = window.setTimeout(() => {
          setAttention(false);
        }, 2200);
      }
    } catch {
      setAttention(true);
      timer = window.setTimeout(() => {
        setAttention(false);
      }, 2200);
    }

    return () => {
      if (timer) window.clearTimeout(timer);
      if (media?.removeEventListener) {
        media.removeEventListener("change", updateMotion);
      }
    };
  }, []);

  function closeRecommendation() {
    setRecommendationOpen(false);
    setError("");
    setSent(false);
  }

  function openRecommendation() {
    setMenuOpen(false);
    setError("");
    setSent(false);
    setRecommendationOpen(true);
  }

  function openApprovedShare() {
    setMenuOpen(false);
    window.location.assign("/share-hiissa-preview");
  }

  async function submitRecommendation() {
    const cleanIdea = idea.trim();
    const cleanWhy = whyHelpful.trim();

    if (!cleanIdea || sending) {
      if (!cleanIdea) {
        setError("Please tell HIISSA your idea or suggestion.");
      }
      return;
    }

    if (!supabase) {
      setError(
        "HIISSA couldn't send your recommendation right now. Please try again later."
      );
      return;
    }

    setSending(true);
    setError("");

    try {
      const { error: submitError } = await supabase.rpc(
        "submit_recommendation",
        {
          p_suggestion_text: cleanIdea,
          p_suggestion_area: area || null,
          p_suggestion_why: cleanWhy || null,
        }
      );

      if (submitError) throw submitError;

      setSent(true);
      setIdea("");
      setArea("");
      setWhyHelpful("");
    } catch {
      setError(
        "HIISSA couldn't send your recommendation right now. Please try again."
      );
    } finally {
      setSending(false);
    }
  }

  const green = "#204b3b";
  const softGreen = "#eef7ef";
  const border = "1px solid rgba(80, 102, 93, 0.18)";

  return (
    <>
      <style>{`
        @keyframes hiissaSuggestInvitePulse {
          0% { box-shadow: 0 0 0 0 rgba(42, 122, 84, .28); transform: scale(1); }
          45% { box-shadow: 0 0 0 10px rgba(42, 122, 84, .10); transform: scale(1.025); }
          100% { box-shadow: 0 0 0 0 rgba(42, 122, 84, 0); transform: scale(1); }
        }
      `}</style>

      <div
        style={{
          position: "relative",
          display: "flex",
          justifyContent: "flex-end",
          marginTop: "11px",
        }}
      >
        <button
          type="button"
          onClick={() => setMenuOpen((value) => !value)}
          aria-expanded={menuOpen}
          aria-haspopup="menu"
          style={{
            border: "1px solid rgba(45, 94, 73, 0.24)",
            borderRadius: "999px",
            padding: "8px 12px",
            background: "#f4fbf5",
            color: green,
            fontWeight: "800",
            fontSize: "13px",
            lineHeight: 1.2,
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: "7px",
            animation:
              attention && !reduceMotion
                ? "hiissaSuggestInvitePulse 1.4s ease-out 1"
                : "none",
            transition: "box-shadow .2s ease, transform .2s ease",
          }}
        >
          <span aria-hidden="true">✨</span>
          Suggest &amp; Invite
        </button>

        {menuOpen && (
          <div
            role="menu"
            aria-label="Suggest and invite"
            style={{
              position: "absolute",
              right: 0,
              bottom: "44px",
              zIndex: 40,
              width: "min(310px, calc(100vw - 72px))",
              padding: "8px",
              borderRadius: "18px",
              border,
              background: "#fffefa",
              boxShadow: "0 18px 42px rgba(45, 72, 60, 0.18)",
            }}
          >
            <button
              type="button"
              role="menuitem"
              onClick={openRecommendation}
              style={{
                width: "100%",
                border: "0",
                borderRadius: "14px",
                background: "transparent",
                padding: "12px",
                textAlign: "left",
                cursor: "pointer",
                display: "grid",
                gridTemplateColumns: "34px 1fr 18px",
                gap: "9px",
                alignItems: "center",
                color: "#283f36",
              }}
            >
              <span aria-hidden="true" style={{ fontSize: "21px" }}>💡</span>
              <span>
                <strong style={{ display: "block", fontSize: "14px" }}>
                  Make a recommendation
                </strong>
                <span
                  style={{
                    display: "block",
                    marginTop: "3px",
                    color: "#68736f",
                    fontSize: "12px",
                  }}
                >
                  Suggest a feature or improvement
                </span>
              </span>
              <span aria-hidden="true" style={{ color: "#78847f" }}>›</span>
            </button>

            <div
              aria-hidden="true"
              style={{
                height: "1px",
                background: "rgba(80, 102, 93, 0.12)",
                margin: "2px 8px",
              }}
            />

            <button
              type="button"
              role="menuitem"
              onClick={openApprovedShare}
              style={{
                width: "100%",
                border: "0",
                borderRadius: "14px",
                background: "transparent",
                padding: "12px",
                textAlign: "left",
                cursor: "pointer",
                display: "grid",
                gridTemplateColumns: "34px 1fr 18px",
                gap: "9px",
                alignItems: "center",
                color: "#283f36",
              }}
            >
              <span aria-hidden="true" style={{ fontSize: "20px" }}>🔗</span>
              <span>
                <strong style={{ display: "block", fontSize: "14px" }}>
                  Invite someone to HIISSA
                </strong>
                <span
                  style={{
                    display: "block",
                    marginTop: "3px",
                    color: "#68736f",
                    fontSize: "12px",
                  }}
                >
                  Open the existing HIISSA Share experience
                </span>
              </span>
              <span aria-hidden="true" style={{ color: "#78847f" }}>›</span>
            </button>
          </div>
        )}
      </div>

      {recommendationOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="hiissa-recommendation-title"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1000,
            background: "rgba(31, 49, 41, 0.38)",
            display: "grid",
            placeItems: "center",
            padding: "18px",
          }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeRecommendation();
            }
          }}
        >
          <section
            style={{
              width: "min(100%, 520px)",
              maxHeight: "88vh",
              overflowY: "auto",
              borderRadius: "24px",
              background:
                "linear-gradient(155deg,#fffefa 0%,#f8fbf6 100%)",
              border,
              boxShadow: "0 24px 70px rgba(32,75,59,.22)",
              color: "#2f433a",
            }}
          >
            {!sent ? (
              <>
                <header
                  style={{
                    padding: "20px 20px 14px",
                    borderBottom: "1px solid rgba(80,102,93,.12)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: "12px",
                      alignItems: "flex-start",
                    }}
                  >
                    <div>
                      <div
                        aria-hidden="true"
                        style={{ fontSize: "24px", marginBottom: "6px" }}
                      >
                        🌱
                      </div>
                      <h2
                        id="hiissa-recommendation-title"
                        style={{
                          margin: 0,
                          color: green,
                          fontSize: "24px",
                        }}
                      >
                        Make a recommendation
                      </h2>
                      <p
                        style={{
                          margin: "7px 0 0",
                          color: "#68766f",
                          lineHeight: 1.5,
                          fontSize: "14px",
                        }}
                      >
                        Your ideas help HIISSA grow and support you and others better.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={closeRecommendation}
                      aria-label="Close recommendation"
                      style={{
                        border: "0",
                        background: "transparent",
                        fontSize: "24px",
                        color: "#718078",
                        cursor: "pointer",
                        padding: "0 2px",
                      }}
                    >
                      ×
                    </button>
                  </div>
                </header>

                <div style={{ padding: "18px 20px 20px" }}>
                  <label
                    style={{
                      display: "block",
                      fontWeight: "800",
                      fontSize: "14px",
                      marginBottom: "7px",
                    }}
                  >
                    What's your idea or suggestion? <span aria-hidden="true">*</span>
                  </label>
                  <textarea
                    value={idea}
                    onChange={(event) => setIdea(event.target.value.slice(0, 500))}
                    placeholder="Tell us your idea, feature request, or improvement…"
                    rows={5}
                    maxLength={500}
                    style={{
                      width: "100%",
                      boxSizing: "border-box",
                      resize: "vertical",
                      borderRadius: "15px",
                      border,
                      padding: "12px",
                      background: "#fff",
                      color: "#34483f",
                      font: "inherit",
                      fontSize: "14px",
                      lineHeight: 1.5,
                    }}
                  />
                  <div
                    style={{
                      textAlign: "right",
                      color: "#7a867f",
                      fontSize: "11px",
                      marginTop: "4px",
                    }}
                  >
                    {idea.length}/500
                  </div>

                  <label
                    style={{
                      display: "block",
                      fontWeight: "800",
                      fontSize: "14px",
                      margin: "15px 0 7px",
                    }}
                  >
                    What area is this about? <span style={{ fontWeight: "600", color: "#77827d" }}>(optional)</span>
                  </label>
                  <select
                    value={area}
                    onChange={(event) => setArea(event.target.value)}
                    style={{
                      width: "100%",
                      boxSizing: "border-box",
                      borderRadius: "15px",
                      border,
                      padding: "12px",
                      background: "#fff",
                      color: "#34483f",
                      font: "inherit",
                      fontSize: "14px",
                    }}
                  >
                    <option value="">Select an area</option>
                    {RECOMMENDATION_AREAS.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>

                  <label
                    style={{
                      display: "block",
                      fontWeight: "800",
                      fontSize: "14px",
                      margin: "15px 0 7px",
                    }}
                  >
                    Why would this be helpful? <span style={{ fontWeight: "600", color: "#77827d" }}>(optional)</span>
                  </label>
                  <textarea
                    value={whyHelpful}
                    onChange={(event) =>
                      setWhyHelpful(event.target.value.slice(0, 300))
                    }
                    placeholder="Share any extra detail about why this would be useful…"
                    rows={4}
                    maxLength={300}
                    style={{
                      width: "100%",
                      boxSizing: "border-box",
                      resize: "vertical",
                      borderRadius: "15px",
                      border,
                      padding: "12px",
                      background: "#fff",
                      color: "#34483f",
                      font: "inherit",
                      fontSize: "14px",
                      lineHeight: 1.5,
                    }}
                  />
                  <div
                    style={{
                      textAlign: "right",
                      color: "#7a867f",
                      fontSize: "11px",
                      marginTop: "4px",
                    }}
                  >
                    {whyHelpful.length}/300
                  </div>

                  <div
                    style={{
                      marginTop: "15px",
                      padding: "11px 12px",
                      borderRadius: "14px",
                      background: "#fff9e9",
                      color: "#66726c",
                      fontSize: "12px",
                      lineHeight: 1.5,
                    }}
                  >
                    🔒 Please don't include private conversation details, passwords, financial information, or other sensitive personal information.
                  </div>

                  {error && (
                    <div
                      role="alert"
                      style={{
                        marginTop: "12px",
                        padding: "10px 12px",
                        borderRadius: "12px",
                        background: "#fff0f0",
                        color: "#8b3d3d",
                        fontSize: "13px",
                      }}
                    >
                      {error}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={submitRecommendation}
                    disabled={sending || !idea.trim()}
                    style={{
                      width: "100%",
                      border: "0",
                      borderRadius: "999px",
                      padding: "13px 16px",
                      marginTop: "16px",
                      background:
                        sending || !idea.trim() ? "#c8cfcb" : green,
                      color: "#fff",
                      fontWeight: "800",
                      cursor:
                        sending || !idea.trim() ? "default" : "pointer",
                    }}
                  >
                    {sending ? "Sending…" : "Send recommendation"}
                  </button>

                  <button
                    type="button"
                    onClick={closeRecommendation}
                    style={{
                      width: "100%",
                      border: "0",
                      background: "transparent",
                      color: "#68736f",
                      padding: "12px",
                      fontWeight: "700",
                      cursor: "pointer",
                    }}
                  >
                    Not now
                  </button>
                </div>
              </>
            ) : (
              <div
                role="status"
                style={{
                  padding: "38px 22px 28px",
                  textAlign: "center",
                }}
              >
                <div aria-hidden="true" style={{ fontSize: "54px" }}>💌</div>
                <h2
                  style={{
                    margin: "13px 0 8px",
                    color: green,
                    fontSize: "27px",
                  }}
                >
                  Thank you ❤️
                </h2>
                <p
                  style={{
                    margin: "0 auto",
                    maxWidth: "330px",
                    color: "#607169",
                    lineHeight: 1.55,
                  }}
                >
                  HIISSA has received your recommendation.
                </p>
                <div
                  style={{
                    margin: "18px auto",
                    maxWidth: "340px",
                    padding: "13px",
                    borderRadius: "15px",
                    background: softGreen,
                    color: "#496158",
                    fontSize: "13px",
                    lineHeight: 1.5,
                  }}
                >
                  Your idea will help us understand how HIISSA can continue to improve and support you and others better.
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setRecommendationOpen(false);
                    setSent(false);
                  }}
                  style={{
                    width: "100%",
                    border: 0,
                    borderRadius: "999px",
                    padding: "13px 16px",
                    background: green,
                    color: "#fff",
                    fontWeight: "800",
                    cursor: "pointer",
                  }}
                >
                  Back to chat
                </button>
              </div>
            )}
          </section>
        </div>
      )}
    </>
  );
}
