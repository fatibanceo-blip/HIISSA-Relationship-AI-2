"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const starters = [
  ["💔", "I'm struggling to let someone go."],
  ["❤️", "I don't know if they really love me."],
  ["🧩", "I don't understand their behavior."],
  ["🌱", "I want to heal and move forward."],
];

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabasePublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

const supabase =
  supabaseUrl && supabasePublishableKey
    ? createClient(supabaseUrl, supabasePublishableKey)
    : null;

function isSafetyContext(messages) {
  const recentText = messages
    .slice(-4)
    .map((message) => message.content)
    .join(" ")
    .toLowerCase();

  const safetyTerms =
    /suicid|self-harm|self harm|kill myself|end my life|hurt myself|immediate danger|emergency services|call 999|samaritans|domestic violence|being abused|physical abuse|threatened|unsafe right now/;

  return safetyTerms.test(recentText);
}

function createPermissionToken() {
  if (
    typeof window === "undefined" ||
    !window.crypto ||
    !window.crypto.getRandomValues
  ) {
    return null;
  }

  const bytes = new Uint8Array(32);
  window.crypto.getRandomValues(bytes);

  return Array.from(bytes, (byte) =>
    byte.toString(16).padStart(2, "0")
  ).join("");
}

function storePendingPermissionToken(token) {
  if (!token || typeof window === "undefined") return;

  try {
    const storageKey = "hiissa_pending_review_permission_tokens";

    const existing = JSON.parse(
      window.localStorage.getItem(storageKey) || "[]"
    );

    const tokens = Array.isArray(existing)
      ? existing.filter((value) => typeof value === "string")
      : [];

    const updatedTokens = [
      ...tokens.filter((value) => value !== token),
      token,
    ].slice(-5);

    window.localStorage.setItem(
      storageKey,
      JSON.stringify(updatedTokens)
    );
  } catch {
    // Public-review permission remains optional if local storage is unavailable.
  }
}

function getPendingPermissionTokens() {
  if (typeof window === "undefined") return [];

  try {
    const storageKey = "hiissa_pending_review_permission_tokens";
    const existing = JSON.parse(
      window.localStorage.getItem(storageKey) || "[]"
    );

    return Array.isArray(existing)
      ? existing.filter(
          (value) => typeof value === "string" && value.length >= 32
        )
      : [];
  } catch {
    return [];
  }
}

function removePendingPermissionToken(token) {
  if (!token || typeof window === "undefined") return;

  try {
    const storageKey = "hiissa_pending_review_permission_tokens";
    const remainingTokens = getPendingPermissionTokens().filter(
      (value) => value !== token
    );

    window.localStorage.setItem(
      storageKey,
      JSON.stringify(remainingTokens)
    );
  } catch {
    // Public-review permission remains optional if local storage is unavailable.
  }
}

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hi, I'm HIISSA Relationship AI. Tell me what's happening, and I'll help you look at it with empathy, balance, and self-respect.",
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [voiceHelp, setVoiceHelp] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [speakingIndex, setSpeakingIndex] = useState(null);

  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [feedbackEligibleAfter, setFeedbackEligibleAfter] = useState(3);
  const [feedbackFormOpen, setFeedbackFormOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [helpful, setHelpful] = useState(null);
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackSending, setFeedbackSending] = useState(false);
  const [feedbackError, setFeedbackError] = useState("");
  const [feedbackThanks, setFeedbackThanks] = useState(false);

  const [pendingReviewToken, setPendingReviewToken] = useState(null);
  const [publicReviewText, setPublicReviewText] = useState("");
  const [reviewPermissionSending, setReviewPermissionSending] = useState(false);
  const [reviewPermissionError, setReviewPermissionError] = useState("");
  const [reviewPermissionThanks, setReviewPermissionThanks] = useState(false);
  const [reviewPermissionDismissed, setReviewPermissionDismissed] =
    useState(false);

  const [showAdminShortcut, setShowAdminShortcut] = useState(false);
  const [publicReviews, setPublicReviews] = useState([]);

  useEffect(() => {
    try {
      const submitted =
        window.sessionStorage.getItem("hiissa_feedback_submitted") === "1";

      const deferredUntil = Number(
        window.sessionStorage.getItem("hiissa_feedback_defer_until") || "3"
      );

      if (submitted) {
        setFeedbackSubmitted(true);
      } else {
        const pendingTokens = getPendingPermissionTokens();

        if (pendingTokens.length > 0) {
          setPendingReviewToken(pendingTokens[0]);
        }
      }

      if (Number.isFinite(deferredUntil) && deferredUntil >= 3) {
        setFeedbackEligibleAfter(deferredUntil);
      }
    } catch {
      // Session storage is optional. HIISSA still works without it.
    }
  }, []);

  useEffect(() => {
    async function checkAdminAccess() {
      if (!supabase) return;

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setShowAdminShortcut(false);
        return;
      }

      const { data: isAdmin, error } = await supabase.rpc(
        "is_hiissa_admin"
      );

      if (!error && isAdmin === true) {
        setShowAdminShortcut(true);
      } else {
        setShowAdminShortcut(false);
      }
    }

    checkAdminAccess();
  }, []);

  useEffect(() => {
    async function loadPublicReviews() {
      if (!supabase) return;

      const { data, error } = await supabase.rpc(
        "get_hiissa_public_reviews"
      );

      if (!error && Array.isArray(data)) {
        setPublicReviews(data);
      }
    }

    loadPublicReviews();
  }, []);

  const substantiveAssistantAnswers = Math.max(
    0,
    messages.filter((message) => message.role === "assistant").length - 1
  );

  const showFeedbackCard =
    !loading &&
    !feedbackSubmitted &&
    !feedbackThanks &&
    substantiveAssistantAnswers >= feedbackEligibleAfter &&
    !isSafetyContext(messages);

  const showReviewPermissionCard =
    !loading &&
    pendingReviewToken &&
    !reviewPermissionDismissed &&
    !reviewPermissionThanks &&
    substantiveAssistantAnswers >= 1 &&
    !isSafetyContext(messages);

  async function sendMessage(text = input) {
    const clean = text.trim();

    if (!clean || loading) return;

    const next = [...messages, { role: "user", content: clean }];

    setMessages(next);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages: next }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 413) {
          setMessages((current) => [
            ...current,
            {
              role: "assistant",
              content:
                "Your message is a little too long. ❤️ Please shorten it to 6,000 characters or fewer and try again.",
            },
          ]);
          return;
        }

        throw new Error("Request failed");
      }

      setMessages((current) => [
        ...current,
        { role: "assistant", content: data.reply },
      ]);
    } catch {
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content:
            "I'm sorry, I couldn't respond right now. Please try again in a moment. 💛",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  async function copyHiissaLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setLinkCopied(true);

      window.setTimeout(() => {
        setLinkCopied(false);
      }, 3000);
    } catch {
      setLinkCopied(false);
    }
  }

  function startListening() {
    if (listening || loading) return;

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceHelp(true);
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.lang = "en-GB";
    recognition.interimResults = false;
    recognition.continuous = false;

    recognition.onstart = () => {
      setVoiceHelp(false);
      setListening(true);
    };

    recognition.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript || "";

      if (transcript.trim()) {
        setInput((current) =>
          current.trim() ? `${current.trim()} ${transcript}` : transcript
        );
      }
    };

    recognition.onerror = () => {
      setListening(false);
      setVoiceHelp(true);
    };

    recognition.onend = () => {
      setListening(false);
    };

    try {
      recognition.start();
    } catch {
      setListening(false);
      setVoiceHelp(true);
    }
  }

  function chooseHiissaVoice() {
    const voices = window.speechSynthesis.getVoices();

    if (!voices.length) return null;

    const britishVoices = voices.filter((voice) =>
      voice.lang?.toLowerCase().startsWith("en-gb")
    );

    const femaleVoiceNames = [
      "female",
      "samantha",
      "serena",
      "victoria",
      "karen",
      "moira",
      "fiona",
      "susan",
      "hazel",
      "libby",
      "sonia",
      "aria",
      "jenny",
      "zira",
    ];

    const britishFemaleVoice = britishVoices.find((voice) =>
      femaleVoiceNames.some((name) =>
        voice.name.toLowerCase().includes(name)
      )
    );

    if (britishFemaleVoice) return britishFemaleVoice;

    if (britishVoices.length) return britishVoices[0];

    const englishFemaleVoice = voices.find(
      (voice) =>
        voice.lang?.toLowerCase().startsWith("en") &&
        femaleVoiceNames.some((name) =>
          voice.name.toLowerCase().includes(name)
        )
    );

    if (englishFemaleVoice) return englishFemaleVoice;

    return (
      voices.find((voice) =>
        voice.lang?.toLowerCase().startsWith("en")
      ) || null
    );
  }

  function prepareSpokenText(text) {
    return text
      .replace(
        /Hi,\s*I'm\s+HIISSA\s+Relationship\s+AI\.?/gi,
        "Hi. I'm Hee-sah. Relationship AI."
      )
      .replace(/\bHIISSA\b/gi, "Hee-sah")
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .replace(/__(.*?)__/g, "$1")
      .replace(/\*(.*?)\*/g, "$1")
      .replace(/_(.*?)_/g, "$1")
      .replace(/^\s*#{1,6}\s*/gm, "")
      .replace(/^\s*[-*+]\s+/gm, "")
      .replace(/^\s*\d+\.\s+/gm, "")
      .replace(/`([^`]+)`/g, "$1")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/\s+/g, " ")
      .trim();
  }

  function speakMessage(text, index) {
    if (
      typeof window === "undefined" ||
      !("speechSynthesis" in window) ||
      typeof SpeechSynthesisUtterance === "undefined"
    ) {
      return;
    }

    window.speechSynthesis.cancel();

    if (speakingIndex === index) {
      setSpeakingIndex(null);
      return;
    }

    const spokenText = prepareSpokenText(text);

    const speech = new SpeechSynthesisUtterance(spokenText);
    const preferredVoice = chooseHiissaVoice();

    speech.lang = "en-GB";
    speech.rate = 0.92;
    speech.pitch = 1;

    if (preferredVoice) {
      speech.voice = preferredVoice;
    }

    speech.onend = () => {
      setSpeakingIndex(null);
    };

    speech.onerror = () => {
      setSpeakingIndex(null);
    };

    setSpeakingIndex(index);
    window.speechSynthesis.speak(speech);
  }

  function maybeLater() {
    const nextEligibleAt = substantiveAssistantAnswers + 5;

    setFeedbackEligibleAfter(nextEligibleAt);
    setFeedbackFormOpen(false);
    setRating(0);
    setHelpful(null);
    setFeedbackText("");
    setFeedbackError("");

    try {
      window.sessionStorage.setItem(
        "hiissa_feedback_defer_until",
        String(nextEligibleAt)
      );
    } catch {
      // HIISSA still works if session storage is unavailable.
    }
  }

  async function submitFeedback() {
    if (!rating || helpful === null || feedbackSending) return;

    setFeedbackSending(true);
    setFeedbackError("");

    if (!supabase) {
      setFeedbackError(
        "Feedback couldn't be sent right now. Please try again later."
      );
      setFeedbackSending(false);
      return;
    }

    try {
      const permissionToken = createPermissionToken();

      const { error } = await supabase.rpc("submit_feedback", {
        p_rating: rating,
        p_helpful: helpful,
        p_feedback_text: feedbackText.trim() || null,
        p_permission_token: permissionToken,
      });

      if (error) {
        throw error;
      }

      storePendingPermissionToken(permissionToken);

      setFeedbackSubmitted(true);
      setFeedbackThanks(true);
      setFeedbackFormOpen(false);

      try {
        window.sessionStorage.setItem("hiissa_feedback_submitted", "1");
      } catch {
        // HIISSA still works if session storage is unavailable.
      }

      window.setTimeout(() => {
        setFeedbackThanks(false);
      }, 7000);
    } catch {
      setFeedbackError(
        "Feedback couldn't be sent right now. Please try again."
      );
    } finally {
      setFeedbackSending(false);
    }
  }

  async function allowPublicReview() {
    const cleanReview = publicReviewText.trim();

    if (!pendingReviewToken || !cleanReview || reviewPermissionSending) return;

    setReviewPermissionSending(true);
    setReviewPermissionError("");

    if (!supabase) {
      setReviewPermissionError(
        "Public-review permission couldn't be saved right now. Please try again later."
      );
      setReviewPermissionSending(false);
      return;
    }

    try {
      const { data, error } = await supabase.rpc(
        "give_feedback_public_permission",
        {
          p_permission_token: pendingReviewToken,
          p_public_display_text: cleanReview,
        }
      );

      if (error) throw error;

      if (data !== true) {
        removePendingPermissionToken(pendingReviewToken);
        setPendingReviewToken(null);
        setReviewPermissionDismissed(true);
        setReviewPermissionError(
          "This permission request is no longer available."
        );
        return;
      }

      removePendingPermissionToken(pendingReviewToken);
      setPendingReviewToken(null);
      setPublicReviewText("");
      setReviewPermissionThanks(true);

      window.setTimeout(() => {
        setReviewPermissionThanks(false);
      }, 7000);
    } catch {
      setReviewPermissionError(
        "Public-review permission couldn't be saved right now. Please try again."
      );
    } finally {
      setReviewPermissionSending(false);
    }
  }

  function keepReviewPrivate() {
    if (pendingReviewToken) {
      removePendingPermissionToken(pendingReviewToken);
    }

    setPendingReviewToken(null);
    setPublicReviewText("");
    setReviewPermissionError("");
    setReviewPermissionDismissed(true);
  }

  return (
    <main className="page">
      <div className="orb one" />
      <div className="orb two" />
      <div className="spark s1">✦</div>
      <div className="spark s2">♡</div>

      <section className="wrap">
        {showAdminShortcut && (
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginBottom: "14px",
            }}
          >
            <a
              href="/admin"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "7px",
                textDecoration: "none",
                border: "1px solid rgba(80, 102, 93, 0.18)",
                background: "rgba(255, 253, 248, 0.92)",
                color: "#466f67",
                borderRadius: "999px",
                padding: "9px 13px",
                fontSize: "12px",
                fontWeight: "800",
                boxShadow: "0 8px 24px rgba(64, 86, 76, 0.08)",
              }}
            >
              ⚙ Admin Dashboard
            </a>
          </div>
        )}

        <header className="hero">
          <div className="logo">H</div>

          <div>
            <div className="kicker">HIISSA • RELATIONSHIP AI</div>

            <h1>
              Someone to talk to.
              <br />
              <span>Without judgment.</span>
            </h1>

            <p>
              A beautiful space for relationship questions, emotional clarity,
              boundaries, healing, and self-respect.
            </p>
          </div>
        </header>

        <div className="principle">
          ✦{" "}
          <span>
            I'll help you separate <b>what you know</b>,{" "}
            <b>what you suspect</b>, <b>what you feel</b>, and{" "}
            <b>what you cannot control</b>.
          </span>
        </div>

        <div className="trust">
          <span>♡ Compassionate</span>
          <span>⚖ Balanced</span>
          <span>✦ Self-respecting</span>
          <span>◌ Non-judgmental</span>
        </div>

        <section className="chat">
          <div className="chatHead">
            <div className="mini">H</div>

            <div>
              <strong>HIISSA Relationship AI</strong>
              <small>● Here with you</small>
            </div>
          </div>

          <div className="messages">
            {messages.map((message, index) => (
              <div key={index} className={"row " + message.role}>
                <div>
                  <div className={"bubble " + message.role}>
                    {message.content}
                  </div>

                  {message.role === "assistant" && (
                    <button
                      type="button"
                      onClick={() => speakMessage(message.content, index)}
                      aria-label={
                        speakingIndex === index
                          ? "Stop listening to HIISSA"
                          : "Listen to HIISSA"
                      }
                      style={{
                        marginTop: "6px",
                        marginLeft: "4px",
                        border: "1px solid rgba(80, 102, 93, 0.18)",
                        background: "#fffdf8",
                        color: "#466f67",
                        borderRadius: "999px",
                        padding: "7px 11px",
                        fontSize: "12px",
                        fontWeight: "800",
                        cursor: "pointer",
                      }}
                    >
                      {speakingIndex === index
                        ? "■ Stop listening"
                        : "🔊 Listen to HIISSA"}
                    </button>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="row assistant">
                <div className="bubble assistant">Thinking…</div>
              </div>
            )}
          </div>

          {messages.length === 1 && (
            <div className="starters">
              <small>You can start with…</small>

              <div className="grid">
                {starters.map(([emoji, text]) => (
                  <button
                    key={text}
                    type="button"
                    onClick={() => sendMessage(text)}
                  >
                    <i>{emoji}</i>
                    <span>{text}</span>
                    <b>→</b>
                  </button>
                ))}
              </div>
            </div>
          )}

          {showReviewPermissionCard && (
            <div
              style={{
                margin: "6px 20px 18px",
                padding: "18px",
                borderRadius: "20px",
                background: "#f4f7f3",
                border: "1px solid rgba(80, 102, 93, 0.18)",
                boxShadow: "0 10px 30px rgba(74, 92, 84, 0.08)",
              }}
            >
              <div
                style={{
                  textAlign: "center",
                  color: "#3f5f58",
                  fontWeight: "800",
                  fontSize: "16px",
                }}
              >
                Would you like to share a review publicly? ❤️
              </div>

              <p
                style={{
                  textAlign: "center",
                  color: "#66706c",
                  fontSize: "13px",
                  lineHeight: "1.6",
                  margin: "7px 0 12px",
                }}
              >
                This is completely optional. Your private feedback is not
                published automatically.
                <br />
                Only the review text you enter below may be shared publicly.
                Your conversation and private feedback are not automatically
                included.
              </p>

              <textarea
                value={publicReviewText}
                onChange={(event) =>
                  setPublicReviewText(event.target.value.slice(0, 1500))
                }
                placeholder="Write the exact words you are comfortable sharing publicly…"
                rows={4}
                style={{
                  width: "100%",
                  resize: "vertical",
                  boxSizing: "border-box",
                  borderRadius: "14px",
                  border: "1px solid rgba(80, 102, 93, 0.2)",
                  padding: "12px",
                  fontFamily: "inherit",
                  fontSize: "14px",
                  lineHeight: "1.5",
                  outline: "none",
                  background: "#ffffff",
                  color: "#35443f",
                }}
              />

              <div
                style={{
                  color: "#77807c",
                  fontSize: "11px",
                  lineHeight: "1.5",
                  margin: "8px 2px 12px",
                }}
              >
                🔒 Please don't include names, contact details, or identifying
                personal information.
              </div>

              {reviewPermissionError && (
                <div
                  role="alert"
                  style={{
                    color: "#8a4f4f",
                    background: "#fff6f4",
                    borderRadius: "12px",
                    padding: "9px 11px",
                    fontSize: "12px",
                    marginBottom: "10px",
                  }}
                >
                  {reviewPermissionError}
                </div>
              )}

              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: "9px",
                  flexWrap: "wrap",
                }}
              >
                <button
                  type="button"
                  onClick={allowPublicReview}
                  disabled={!publicReviewText.trim() || reviewPermissionSending}
                  style={{
                    border: "0",
                    borderRadius: "999px",
                    padding: "10px 16px",
                    background: publicReviewText.trim()
                      ? "#466f67"
                      : "#c8cfcb",
                    color: "#fff",
                    fontWeight: "800",
                    cursor:
                      publicReviewText.trim() && !reviewPermissionSending
                        ? "pointer"
                        : "default",
                  }}
                >
                  {reviewPermissionSending
                    ? "Saving permission…"
                    : "Allow public sharing"}
                </button>

                <button
                  type="button"
                  onClick={keepReviewPrivate}
                  disabled={reviewPermissionSending}
                  style={{
                    border: "0",
                    background: "transparent",
                    color: "#68736f",
                    padding: "10px 12px",
                    fontWeight: "700",
                    cursor: reviewPermissionSending ? "default" : "pointer",
                  }}
                >
                  Keep private
                </button>
              </div>
            </div>
          )}

          {reviewPermissionThanks && (
            <div
              role="status"
              style={{
                margin: "6px 20px 18px",
                padding: "16px",
                borderRadius: "18px",
                background: "#f1f6f2",
                border: "1px solid rgba(80, 102, 93, 0.18)",
                color: "#466f67",
                fontWeight: "800",
                textAlign: "center",
              }}
            >
              Thank you ❤️ You've given HIISSA permission to use this review
              publicly.
            </div>
          )}

          {showFeedbackCard && (
            <div
              style={{
                margin: "6px 20px 18px",
                padding: "18px",
                borderRadius: "20px",
                background: "#fffdf8",
                border: "1px solid rgba(80, 102, 93, 0.18)",
                boxShadow: "0 10px 30px rgba(74, 92, 84, 0.08)",
              }}
            >
              {!feedbackFormOpen ? (
                <>
                  <div
                    style={{
                      textAlign: "center",
                      color: "#3f5f58",
                      fontWeight: "800",
                      fontSize: "16px",
                    }}
                  >
                    Has HIISSA been helpful so far? ❤️
                  </div>

                  <p
                    style={{
                      textAlign: "center",
                      color: "#66706c",
                      fontSize: "13px",
                      lineHeight: "1.5",
                      margin: "7px 0 14px",
                    }}
                  >
                    Your feedback helps us improve HIISSA.
                  </p>

                  <div
                    aria-label="Rate HIISSA"
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      gap: "5px",
                      marginBottom: "14px",
                    }}
                  >
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        aria-label={`${star} star${star === 1 ? "" : "s"}`}
                        style={{
                          border: "0",
                          background: "transparent",
                          fontSize: "30px",
                          lineHeight: "1",
                          padding: "2px",
                          cursor: "pointer",
                          color: star <= rating ? "#b79a5b" : "#d8d8d2",
                        }}
                      >
                        ★
                      </button>
                    ))}
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      gap: "8px",
                      flexWrap: "wrap",
                      marginBottom: "15px",
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setHelpful(true)}
                      style={{
                        border:
                          helpful === true
                            ? "1px solid #466f67"
                            : "1px solid rgba(80, 102, 93, 0.18)",
                        background:
                          helpful === true ? "#e8f0ec" : "#ffffff",
                        color: "#466f67",
                        borderRadius: "999px",
                        padding: "8px 13px",
                        fontWeight: "800",
                        cursor: "pointer",
                      }}
                    >
                      Yes, helpful ❤️
                    </button>

                    <button
                      type="button"
                      onClick={() => setHelpful(false)}
                      style={{
                        border:
                          helpful === false
                            ? "1px solid #466f67"
                            : "1px solid rgba(80, 102, 93, 0.18)",
                        background:
                          helpful === false ? "#e8f0ec" : "#ffffff",
                        color: "#466f67",
                        borderRadius: "999px",
                        padding: "8px 13px",
                        fontWeight: "800",
                        cursor: "pointer",
                      }}
                    >
                      Not yet
                    </button>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      gap: "9px",
                      flexWrap: "wrap",
                    }}
                  >
                    <button
                      type="button"
                      disabled={!rating || helpful === null}
                      onClick={() => setFeedbackFormOpen(true)}
                      style={{
                        border: "0",
                        borderRadius: "999px",
                        padding: "10px 16px",
                        background:
                          rating && helpful !== null ? "#466f67" : "#c8cfcb",
                        color: "#fff",
                        fontWeight: "800",
                        cursor:
                          rating && helpful !== null
                            ? "pointer"
                            : "default",
                      }}
                    >
                      Share feedback
                    </button>

                    <button
                      type="button"
                      onClick={maybeLater}
                      style={{
                        border: "0",
                        background: "transparent",
                        color: "#68736f",
                        padding: "10px 12px",
                        fontWeight: "700",
                        cursor: "pointer",
                      }}
                    >
                      Maybe later
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div
                    style={{
                      color: "#3f5f58",
                      fontWeight: "800",
                      textAlign: "center",
                      fontSize: "16px",
                    }}
                  >
                    Thank you for helping HIISSA grow ❤️
                  </div>

                  <p
                    style={{
                      textAlign: "center",
                      color: "#66706c",
                      fontSize: "13px",
                      lineHeight: "1.5",
                      margin: "7px 0 12px",
                    }}
                  >
                    What helped you, or what could HIISSA do better?
                    <br />
                    <span style={{ fontSize: "12px" }}>(Optional)</span>
                  </p>

                  <textarea
                    value={feedbackText}
                    onChange={(event) =>
                      setFeedbackText(event.target.value.slice(0, 1500))
                    }
                    placeholder="Write your feedback here…"
                    rows={4}
                    style={{
                      width: "100%",
                      resize: "vertical",
                      boxSizing: "border-box",
                      borderRadius: "14px",
                      border: "1px solid rgba(80, 102, 93, 0.2)",
                      padding: "12px",
                      fontFamily: "inherit",
                      fontSize: "14px",
                      lineHeight: "1.5",
                      outline: "none",
                      background: "#ffffff",
                      color: "#35443f",
                    }}
                  />

                  <div
                    style={{
                      color: "#77807c",
                      fontSize: "11px",
                      lineHeight: "1.5",
                      margin: "8px 2px 12px",
                    }}
                  >
                    🔒 Please don't include names or identifying personal
                    information.
                  </div>

                  {feedbackError && (
                    <div
                      role="alert"
                      style={{
                        color: "#8a4f4f",
                        background: "#fff6f4",
                        borderRadius: "12px",
                        padding: "9px 11px",
                        fontSize: "12px",
                        marginBottom: "10px",
                      }}
                    >
                      {feedbackError}
                    </div>
                  )}

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      gap: "9px",
                      flexWrap: "wrap",
                    }}
                  >
                    <button
                      type="button"
                      onClick={submitFeedback}
                      disabled={feedbackSending}
                      style={{
                        border: "0",
                        borderRadius: "999px",
                        padding: "10px 16px",
                        background: "#466f67",
                        color: "#fff",
                        fontWeight: "800",
                        cursor: feedbackSending ? "default" : "pointer",
                      }}
                    >
                      {feedbackSending ? "Sending…" : "Send feedback"}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setFeedbackFormOpen(false);
                        setFeedbackError("");
                      }}
                      disabled={feedbackSending}
                      style={{
                        border: "0",
                        background: "transparent",
                        color: "#68736f",
                        padding: "10px 12px",
                        fontWeight: "700",
                        cursor: feedbackSending ? "default" : "pointer",
                      }}
                    >
                      Back
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {feedbackThanks && (
            <div
              role="status"
              style={{
                margin: "6px 20px 18px",
                padding: "16px",
                borderRadius: "18px",
                background: "#f1f6f2",
                border: "1px solid rgba(80, 102, 93, 0.18)",
                color: "#466f67",
                fontWeight: "800",
                textAlign: "center",
              }}
            >
              Thank you ❤️ Your feedback has been received.
            </div>
          )}

          <div className="privacy">
            🔒 Please avoid sharing identifying or highly sensitive personal
            information such as your full name, address, phone number,
            passwords, financial details, or private account information.
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              padding: "0 15px 10px",
            }}
          >
            <button
              type="button"
              onClick={startListening}
              disabled={listening || loading}
              aria-label="Speak your message to HIISSA"
              style={{
                border: "1px solid rgba(80, 102, 93, 0.18)",
                background: listening ? "#e8f0ec" : "#fffdf8",
                color: "#466f67",
                borderRadius: "999px",
                padding: "10px 16px",
                fontWeight: "800",
                cursor: listening || loading ? "default" : "pointer",
              }}
            >
              {listening ? "🎤 Listening…" : "🎤 Speak to HIISSA"}
            </button>
          </div>

          {voiceHelp && (
            <div
              role="alert"
              style={{
                margin: "0 20px 14px",
                padding: "14px 16px",
                borderRadius: "16px",
                background: "#f4f7f3",
                border: "1px solid rgba(80, 102, 93, 0.18)",
                color: "#4e5954",
                fontSize: "13px",
                lineHeight: "1.6",
                textAlign: "center",
              }}
            >
              <strong style={{ color: "#466f67" }}>
                🎤 Want to speak to HIISSA?
              </strong>

              <br />

              Voice isn't available in this browser. If you opened HIISSA
              inside TikTok, copy the HIISSA link below, open Chrome or your
              phone browser, and paste the link there to use Speak to HIISSA.
              You can still type your message here.

              <br />

              <button
                type="button"
                onClick={copyHiissaLink}
                style={{
                  marginTop: "12px",
                  border: "0",
                  borderRadius: "999px",
                  padding: "10px 16px",
                  background: "#466f67",
                  color: "#fff",
                  fontWeight: "800",
                  cursor: "pointer",
                }}
              >
                {linkCopied ? "✓ Link copied" : "📋 Copy HIISSA link"}
              </button>
            </div>
          )}

          <form
            className="composer"
            onSubmit={(event) => {
              event.preventDefault();
              sendMessage();
            }}
          >
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Tell me what's on your heart…"
              rows={1}
               spellCheck={true} 
              autoCorrect="on"
              autoCapitalize="sentences"
            />

            <button type="submit" disabled={!input.trim() || loading}>
              Send ↑
            </button>
          </form>

          <p className="fine">
            HIISSA offers reflective AI guidance, not emergency, medical,
            legal, or professional mental-health care.
          </p>
        </section>

        {publicReviews.length > 0 && (
          <section
            aria-label="Public reviews"
            style={{
              marginTop: "22px",
              padding: "24px 20px",
              borderRadius: "24px",
              background: "rgba(255, 253, 248, 0.92)",
              border: "1px solid rgba(80, 102, 93, 0.16)",
              boxShadow: "0 14px 40px rgba(64, 86, 76, 0.08)",
            }}
          >
            <div style={{ textAlign: "center", marginBottom: "16px" }}>
              <div
                style={{
                  color: "#466f67",
                  fontSize: "12px",
                  fontWeight: "800",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  marginBottom: "6px",
                }}
              >
                Shared with permission
              </div>

              <h2
                style={{
                  margin: 0,
                  color: "#32453f",
                  fontSize: "24px",
                  lineHeight: "1.25",
                }}
              >
                What people are saying about HIISSA
              </h2>
            </div>

            <div
              style={{
                display: "grid",
                gap: "12px",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              }}
            >
              {publicReviews.map((review, index) => {
                const safeRating = Math.max(
                  0,
                  Math.min(5, Number(review.rating) || 0)
                );

                return (
                  <article
                    key={`${review.permission_date || "review"}-${index}`}
                    style={{
                      padding: "17px",
                      borderRadius: "18px",
                      background: "#ffffff",
                      border: "1px solid rgba(80, 102, 93, 0.14)",
                    }}
                  >
                    <div
                      aria-label={`${safeRating} out of 5 stars`}
                      style={{
                        color: "#b79a5b",
                        fontSize: "17px",
                        letterSpacing: "2px",
                        marginBottom: "9px",
                      }}
                    >
                      {"★".repeat(safeRating)}
                      <span style={{ color: "#dddcd6" }}>
                        {"★".repeat(5 - safeRating)}
                      </span>
                    </div>

                    <p
                      style={{
                        margin: 0,
                        color: "#4f5b56",
                        fontSize: "14px",
                        lineHeight: "1.65",
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      “{review.public_display_text}”
                    </p>
                  </article>
                );
              })}
            </div>
          </section>
        )}

        <footer>
          <b>HIISSA</b> · Healing is transformation, not erasure.
          <br />
          <a href="/privacy">Privacy</a>
        </footer>
      </section>
    </main>
  );
}
