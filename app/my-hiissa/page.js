"use client";

import Link from "next/link";
import { createBrowserClient } from "@supabase/ssr";
import { useEffect, useMemo, useState } from "react";

const green = "#194f3d";
const softGreen = "#eaf4ed";
const cream = "#fffdf8";
const gold = "#a8833f";

let browserSupabase = null;

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) return null;

  if (!browserSupabase) {
    browserSupabase = createBrowserClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  }

  return browserSupabase;
}

function formatConversationDate(value) {
  if (!value) return "";

  try {
    return new Intl.DateTimeFormat(undefined, {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value));
  } catch {
    return "";
  }
}

function ShellCard({ children, style = {} }) {
  return (
    <section
      style={{
        background: "rgba(255,255,252,.92)",
        border: "1px solid rgba(57,94,76,.13)",
        borderRadius: 24,
        boxShadow: "0 14px 34px rgba(31,72,54,.08)",
        ...style,
      }}
    >
      {children}
    </section>
  );
}

export default function MyHiissaPage() {
  const [authState, setAuthState] = useState("checking");
  const [session, setSession] = useState(null);
  const [conversationState, setConversationState] = useState("idle");
  const [conversations, setConversations] = useState([]);

  useEffect(() => {
    const supabase = getSupabase();

    if (!supabase) {
      setAuthState("unavailable");
      return;
    }

    let active = true;

    supabase.auth
      .getSession()
      .then(({ data, error }) => {
        if (!active) return;

        if (error) {
          setAuthState("unavailable");
          return;
        }

        setSession(data.session ?? null);
        setAuthState(data.session ? "ready" : "signedout");
      })
      .catch(() => {
        if (active) setAuthState("unavailable");
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!active) return;
      setSession(nextSession ?? null);
      setAuthState(nextSession ? "ready" : "signedout");
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!session?.access_token) {
      setConversations([]);
      setConversationState("idle");
      return;
    }

    const controller = new AbortController();
    setConversationState("loading");

    fetch("/api/conversations", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Unable to load conversations.");
        }

        const data = await response.json();
        setConversations(
          Array.isArray(data.conversations) ? data.conversations : []
        );
        setConversationState("ready");
      })
      .catch((error) => {
        if (error?.name === "AbortError") return;
        setConversationState("error");
      });

    return () => controller.abort();
  }, [session?.access_token]);

  const latestConversation = useMemo(
    () => conversations[0] ?? null,
    [conversations]
  );

  if (authState === "checking") {
    return (
      <main
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: "linear-gradient(145deg,#e7efe9,#fbf8ee)",
          color: green,
          fontFamily: "Arial, Helvetica, sans-serif",
        }}
      >
        <p style={{ fontSize: 18 }}>Opening My HIISSA…</p>
      </main>
    );
  }

  if (authState !== "ready") {
    return (
      <main
        style={{
          minHeight: "100vh",
          padding: "clamp(18px,5vw,56px)",
          background:
            "radial-gradient(circle at 8% 8%,rgba(214,232,216,.9),transparent 30%),linear-gradient(145deg,#edf3ee,#fbf8ee)",
          color: green,
          fontFamily: "Arial, Helvetica, sans-serif",
        }}
      >
        <ShellCard
          style={{
            maxWidth: 680,
            margin: "12vh auto 0",
            padding: "clamp(26px,6vw,48px)",
            textAlign: "center",
          }}
        >
          <div
            aria-hidden="true"
            style={{
              width: 72,
              height: 72,
              borderRadius: 22,
              display: "grid",
              placeItems: "center",
              margin: "0 auto 18px",
              background: green,
              color: "#fff",
              fontSize: 38,
              fontWeight: 800,
            }}
          >
            H
          </div>
          <h1 style={{ margin: "0 0 12px", fontSize: "clamp(34px,6vw,48px)" }}>
            My HIISSA
          </h1>
          <p
            style={{
              margin: "0 auto 26px",
              maxWidth: 520,
              color: "#5d7168",
              lineHeight: 1.65,
              fontSize: 18,
            }}
          >
            Sign in to open your private HIISSA home and return to your
            authenticated conversations.
          </p>
          <Link
            href="/talk?signin=1&from=home"
            style={{
              display: "inline-block",
              padding: "15px 24px",
              borderRadius: 16,
              background: green,
              color: "#fff",
              textDecoration: "none",
              fontWeight: 800,
            }}
          >
            Sign in to HIISSA
          </Link>
          <div style={{ marginTop: 18 }}>
            <Link href="/" style={{ color: green, fontWeight: 700 }}>
              ← Back to HIISSA
            </Link>
          </div>
        </ShellCard>
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at 10% 6%,rgba(207,229,211,.82),transparent 28%),radial-gradient(circle at 94% 9%,rgba(239,219,171,.34),transparent 27%),linear-gradient(145deg,#edf3ee 0%,#fbfaf4 58%,#f4efe5 100%)",
        color: "#173f32",
        fontFamily: "Arial, Helvetica, sans-serif",
      }}
    >
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 5,
          background: "rgba(255,255,252,.92)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(47,83,66,.1)",
        }}
      >
        <div
          style={{
            maxWidth: 1120,
            margin: "0 auto",
            padding: "14px clamp(16px,4vw,32px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 14,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span
              aria-hidden="true"
              style={{
                width: 46,
                height: 46,
                borderRadius: 14,
                display: "grid",
                placeItems: "center",
                background: green,
                color: "#fff",
                fontWeight: 800,
                fontSize: 26,
              }}
            >
              H
            </span>
            <div>
              <strong style={{ display: "block", fontSize: 21 }}>HIISSA</strong>
              <span
                style={{
                  display: "block",
                  fontSize: 11,
                  letterSpacing: ".18em",
                  color: "#64786e",
                }}
              >
                MY HIISSA
              </span>
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <Link
              href="/"
              style={{
                color: green,
                textDecoration: "none",
                fontWeight: 700,
                padding: "10px 12px",
              }}
            >
              Back to HIISSA
            </Link>
            <Link
              href="/my-hiissa/account"
              style={{
                color: green,
                textDecoration: "none",
                fontWeight: 800,
                border: "1px solid #c6d7cb",
                borderRadius: 999,
                background: "#fff",
                padding: "9px 13px",
                fontSize: 14,
              }}
            >
              Account
            </Link>
          </div>
        </div>
      </header>

      <div
        style={{
          maxWidth: 1120,
          margin: "0 auto",
          padding: "clamp(24px,5vw,54px) clamp(16px,4vw,32px) 64px",
        }}
      >
        <section
          style={{
            overflow: "hidden",
            borderRadius: 30,
            padding: "clamp(26px,6vw,60px) clamp(22px,5vw,52px)",
            marginBottom: 22,
            background:
              "radial-gradient(circle at 82% 20%,rgba(239,217,163,.30),transparent 30%),linear-gradient(120deg,#dcecdf 0%,#f8f4e8 58%,#fffaf0 100%)",
            border: "1px solid rgba(64,103,82,.13)",
            boxShadow: "0 16px 38px rgba(35,75,57,.08)",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0,1fr) minmax(72px,18vw,170px)",
              gap: "clamp(10px,4vw,28px)",
              alignItems: "start",
            }}
          >
            <div>
              <p
                style={{
                  margin: "0 0 10px",
                  color: gold,
                  fontWeight: 900,
                  letterSpacing: ".08em",
                  fontSize: 13,
                }}
              >
                YOUR PRIVATE HIISSA HOME
              </p>
              <h1
                style={{
                  margin: "0 0 10px",
                  fontFamily: "Georgia, 'Times New Roman', serif",
                  fontWeight: 500,
                  fontSize: "clamp(36px,7vw,66px)",
                  lineHeight: 1.03,
                }}
              >
                Welcome back. ♡
              </h1>
              <p
                style={{
                  margin: "0 0 12px",
                  fontSize: "clamp(19px,3vw,28px)",
                  lineHeight: 1.45,
                }}
              >
                Your HIISSA is here when you’re ready.
              </p>
              <p
                style={{
                  margin: 0,
                  color: "#5d7067",
                  fontSize: 17,
                  lineHeight: 1.65,
                }}
              >
                Return to what matters, start a conversation, or choose where you
                want to go next.
              </p>
            </div>
            <img
              src="/hiissa-botanical-leaves.svg"
              alt=""
              aria-hidden="true"
              style={{
                width: "100%",
                maxHeight: 190,
                objectFit: "contain",
                objectPosition: "top right",
                opacity: 0.78,
                pointerEvents: "none",
              }}
            />
          </div>
        </section>

        {latestConversation ? (
          <ShellCard
            style={{
              padding: "clamp(22px,4vw,34px)",
              marginBottom: 18,
              background:
                "linear-gradient(120deg,rgba(235,246,238,.98),rgba(255,253,248,.96))",
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "minmax(0,1fr) auto",
                gap: 20,
                alignItems: "center",
              }}
            >
              <div>
                <p
                  style={{
                    margin: "0 0 7px",
                    fontSize: 13,
                    fontWeight: 900,
                    letterSpacing: ".08em",
                    color: "#5a8872",
                  }}
                >
                  MOST RECENT CONVERSATION
                </p>
                <h2
                  style={{
                    margin: "0 0 7px",
                    fontFamily: "Georgia, 'Times New Roman', serif",
                    fontWeight: 500,
                    fontSize: "clamp(28px,4vw,38px)",
                  }}
                >
                  Continue where I left off
                </h2>
                <strong
                  style={{
                    display: "block",
                    fontSize: 18,
                    marginBottom: 5,
                  }}
                >
                  {latestConversation.title || "Previous conversation"}
                </strong>
                <span style={{ color: "#6a7b73", fontSize: 14 }}>
                  {formatConversationDate(
                    latestConversation.last_message_at ||
                      latestConversation.updated_at ||
                      latestConversation.created_at
                  )}
                </span>
              </div>
              <Link
                href={`/talk?myHiissaConversation=${encodeURIComponent(latestConversation.id)}`}
                style={{
                  display: "inline-block",
                  minWidth: 150,
                  textAlign: "center",
                  background: green,
                  color: "#fff",
                  textDecoration: "none",
                  padding: "15px 20px",
                  borderRadius: 16,
                  fontWeight: 800,
                }}
              >
                Open HIISSA →
              </Link>
            </div>
          </ShellCard>
        ) : (
          <ShellCard style={{ padding: "clamp(22px,4vw,34px)", marginBottom: 18 }}>
            <p style={{ margin: "0 0 7px", color: "#5b7468", fontWeight: 800 }}>
              {conversationState === "loading"
                ? "Checking your conversations…"
                : conversationState === "error"
                  ? "Your conversation history could not be loaded right now."
                  : "No previous conversation is waiting for you yet."}
            </p>
            <h2
              style={{
                margin: 0,
                fontFamily: "Georgia, 'Times New Roman', serif",
                fontSize: "clamp(28px,4vw,38px)",
                fontWeight: 500,
              }}
            >
              Start with HIISSA when you’re ready.
            </h2>
          </ShellCard>
        )}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))",
            gap: 16,
            marginBottom: 26,
          }}
        >
          <ShellCard style={{ padding: 24 }}>
            <div style={{ fontSize: 31, marginBottom: 12 }} aria-hidden="true">
              ◌
            </div>
            <h3 style={{ margin: "0 0 8px", fontSize: 24 }}>Talk to HIISSA</h3>
            <p style={{ margin: "0 0 18px", color: "#63766d", lineHeight: 1.55 }}>
              Open the existing HIISSA conversation experience.
            </p>
            <Link
              href="/talk?myHiissaTalk=1#hiissa-conversation"
              style={{ color: green, fontWeight: 900 }}
            >
              Talk to HIISSA →
            </Link>
          </ShellCard>

          <ShellCard style={{ padding: 24 }}>
            <div style={{ fontSize: 31, marginBottom: 12 }} aria-hidden="true">
              ◫
            </div>
            <h3 style={{ margin: "0 0 8px", fontSize: 24 }}>My Conversations</h3>
            <p style={{ margin: "0 0 18px", color: "#63766d", lineHeight: 1.55 }}>
              Return to your authenticated HIISSA conversation history.
            </p>
            <Link href="/my-hiissa/conversations" style={{ color: green, fontWeight: 900 }}>
              Open conversations →
            </Link>
          </ShellCard>

          <ShellCard style={{ padding: 24 }}>
            <div style={{ fontSize: 31, marginBottom: 12 }} aria-hidden="true">
              ◇
            </div>
            <h3 style={{ margin: "0 0 8px", fontSize: 24 }}>Explore HIISSA</h3>
            <p style={{ margin: "0 0 18px", color: "#63766d", lineHeight: 1.55 }}>
              Open the existing canonical Explore experience from your private HIISSA home.
            </p>
            <Link href="/talk?myHiissaExplore=1" style={{ color: green, fontWeight: 900 }}>
              Explore HIISSA →
            </Link>
          </ShellCard>

          <ShellCard style={{ padding: 24, opacity: 0.78 }}>
            <div style={{ fontSize: 31, marginBottom: 12 }} aria-hidden="true">
              ♡
            </div>
            <h3 style={{ margin: "0 0 8px", fontSize: 24 }}>My Space</h3>
            <p style={{ margin: "0 0 12px", color: "#63766d", lineHeight: 1.55 }}>
              Your private personal area will connect here only after its canonical Registry destination and access rules are certified.
            </p>
            <span style={{display:"inline-block",padding:"7px 10px",borderRadius:999,background:"#f2eee4",color:"#756746",fontSize:12,fontWeight:800}}>
              Not connected yet
            </span>
          </ShellCard>
        </div>

        <ShellCard
          style={{
            padding: "clamp(24px,4vw,34px)",
            marginBottom: 24,
            background:
              "linear-gradient(120deg,rgba(255,253,248,.98),rgba(244,239,226,.94))",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: 18,
              flexWrap: "wrap",
            }}
          >
            <div>
              <p
                style={{
                  margin: "0 0 6px",
                  color: gold,
                  fontWeight: 900,
                  letterSpacing: ".08em",
                  fontSize: 13,
                }}
              >
                YOUR HIISSA PLAN
              </p>
              <h2
                style={{
                  margin: "0 0 8px",
                  fontFamily: "Georgia, 'Times New Roman', serif",
                  fontWeight: 500,
                  fontSize: "clamp(28px,4vw,38px)",
                }}
              >
                One account. One current access level.
              </h2>
              <p
                style={{
                  margin: 0,
                  maxWidth: 690,
                  color: "#65756d",
                  lineHeight: 1.6,
                }}
              >
                Your active HIISSA plan will appear here after the Account
                Access Resolver is connected. This isolated Preview does not
                guess or assign FREE, HIISSA+ or HIISSA TOGETHER.
              </p>
            </div>
            <span
              style={{
                display: "inline-block",
                padding: "9px 13px",
                borderRadius: 999,
                background: "#f2ead8",
                color: "#735c2b",
                fontWeight: 800,
                fontSize: 13,
              }}
            >
              Access connection pending
            </span>
          </div>
        </ShellCard>

        <section
          style={{
            borderRadius: 24,
            padding: "24px clamp(22px,5vw,46px)",
            background:
              "linear-gradient(105deg,rgba(226,236,226,.96),rgba(251,247,235,.98))",
            border: "1px solid rgba(52,91,72,.12)",
            display: "flex",
            gap: 14,
            alignItems: "center",
          }}
        >
          <span aria-hidden="true" style={{ fontSize: 32 }}>
            🌿
          </span>
          <p
            style={{
              margin: 0,
              fontFamily: "Georgia, 'Times New Roman', serif",
              fontStyle: "italic",
              fontSize: "clamp(20px,3vw,28px)",
              color: green,
            }}
          >
            Healing is transformation, not erasure.
          </p>
        </section>
      </div>
    </main>
  );
}
