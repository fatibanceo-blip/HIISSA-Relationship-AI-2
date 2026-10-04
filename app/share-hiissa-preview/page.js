"use client";

import Link from "next/link";
import { createBrowserClient } from "@supabase/ssr";
import { useEffect, useMemo, useState } from "react";

const green = "#1f5a46";
const deepGreen = "#173f32";
const softGreen = "#eaf4ed";
const cream = "#fffdf8";
const gold = "#a8833f";
const pink = "#f9eaee";

const channels = [
  { id: "whatsapp", icon: "◉", label: "WhatsApp", short: "WhatsApp" },
  { id: "messages", icon: "●", label: "Messages / Text", short: "Messages" },
  { id: "email", icon: "✉", label: "Email", short: "Email" },
  { id: "copy", icon: "↗", label: "Copy Link", short: "Copy Link" },
  { id: "qr", icon: "▦", label: "QR Code", short: "QR Code" },
  { id: "native", icon: "•••", label: "Phone Share", short: "Phone Share" },
];

const publicHiissaLink = "https://hiissa.com";

function buildInvitationMessage(invitationLink) {
  return (
    "Hey! 👋\n\nI wanted to share something with you that I think you might really like.\n\nIt’s called HIISSA — a safe and supportive space for real conversations, personal growth and healthier relationships.\n\nYou can explore it here:\n" +
    invitationLink +
    "\n\nHope you find it as helpful as I do! 💚"
  );
}

function Card({ children, style = {} }) {
  return (
    <section
      style={{
        border: "1px solid #d9e4db",
        borderRadius: 24,
        background: "rgba(255,255,252,.96)",
        boxShadow: "0 14px 32px rgba(31,72,54,.08)",
        ...style,
      }}
    >
      {children}
    </section>
  );
}

function ShareChoice({ item, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        border: active ? "1px solid #85af98" : "1px solid #dbe5dd",
        background: active ? softGreen : "#fff",
        borderRadius: 18,
        padding: "16px 10px",
        minHeight: 112,
        display: "grid",
        placeItems: "center",
        gap: 8,
        color: deepGreen,
        font: "inherit",
        fontWeight: 800,
        cursor: "pointer",
      }}
    >
      <span
        aria-hidden="true"
        style={{
          width: 48,
          height: 48,
          display: "grid",
          placeItems: "center",
          borderRadius: 15,
          background:
            item.id === "qr"
              ? "#f8dce7"
              : item.id === "email"
                ? "#e4eefb"
                : item.id === "copy"
                  ? "#e8f5ef"
                  : "#e8f3eb",
          fontSize: 24,
        }}
      >
        {item.icon}
      </span>
      <span style={{ fontSize: 14 }}>{item.label}</span>
    </button>
  );
}

function QrPreview() {
  const cells = useMemo(() => {
    const pattern = [];
    for (let row = 0; row < 13; row += 1) {
      for (let col = 0; col < 13; col += 1) {
        const finder =
          (row < 4 && col < 4) ||
          (row < 4 && col > 8) ||
          (row > 8 && col < 4);
        const fill = finder || ((row * 7 + col * 11 + row * col) % 5 < 2);
        pattern.push({ row, col, fill });
      }
    }
    return pattern;
  }, []);

  return (
    <div
      aria-label="Prototype QR code preview"
      style={{
        width: 210,
        aspectRatio: "1",
        background: "#fff",
        border: "10px solid #fff",
        boxShadow: "0 0 0 1px #d8e1d8",
        display: "grid",
        gridTemplateColumns: "repeat(13,1fr)",
        gap: 1,
        margin: "8px auto 18px",
      }}
    >
      {cells.map((cell) => (
        <span
          key={cell.row + "-" + cell.col}
          style={{ background: cell.fill ? "#111" : "#fff" }}
        />
      ))}
    </div>
  );
}

export default function ShareHiissaPreviewPage() {
  const [selected, setSelected] = useState("whatsapp");
  const [copied, setCopied] = useState(false);
  const [referralCode, setReferralCode] = useState("");

  const supabase = useMemo(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key =
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

    if (!url || !key) return null;

    return createBrowserClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  }, []);

  useEffect(() => {
    let active = true;

    async function loadReferralIdentity() {
      if (!supabase) return;

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!active || !session?.user) return;

      const { data, error } = await supabase.rpc(
        "get_or_create_my_referral_code"
      );

      if (
        active &&
        !error &&
        typeof data === "string" &&
        /^[A-Z0-9]{10}$/.test(data)
      ) {
        setReferralCode(data);
      }
    }

    loadReferralIdentity();

    return () => {
      active = false;
    };
  }, [supabase]);

  const sampleLink = referralCode
    ? `https://hiissa.com/invite/${referralCode}`
    : publicHiissaLink;

  const sampleMessage = useMemo(
    () => buildInvitationMessage(sampleLink),
    [sampleLink]
  );

  const selectedChannel = channels.find((item) => item.id === selected);

  function choose(id) {
    setSelected(id);
    setCopied(false);
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "clamp(14px,4vw,36px)",
        background:
          "radial-gradient(circle at 10% 7%,rgba(210,229,211,.80),transparent 28%),radial-gradient(circle at 93% 11%,rgba(241,219,151,.28),transparent 30%),linear-gradient(140deg,#eef4ed,#fffaf0 56%,#edf3ea)",
        color: deepGreen,
        fontFamily: "Arial,Helvetica,sans-serif",
      }}
    >
      <section style={{ maxWidth: 760, margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
            marginBottom: 14,
            flexWrap: "wrap",
          }}
        >
          <Link
            href="/my-hiissa"
            style={{
              display: "inline-flex",
              alignItems: "center",
              minHeight: 42,
              padding: "10px 14px",
              borderRadius: 14,
              background: "#fffefa",
              border: "1px solid #c8d8cc",
              color: green,
              fontWeight: 800,
              textDecoration: "none",
            }}
          >
            ← Back to My HIISSA
          </Link>
          <span
            style={{
              padding: "9px 13px",
              borderRadius: 999,
              background: "#fff",
              border: "1px solid #c8d8cc",
              fontSize: 12,
              fontWeight: 900,
              letterSpacing: ".06em",
            }}
          >
            STAGING PREVIEW · NO REAL REFERRAL SENT
          </span>
        </div>

        <Card style={{ overflow: "hidden" }}>
          <header
            style={{
              padding: "clamp(26px,6vw,48px) clamp(20px,5vw,40px) 26px",
              background:
                "radial-gradient(circle at 88% 8%,rgba(237,215,153,.35),transparent 34%),linear-gradient(130deg,#f7fbf4,#fff9eb)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 25 }}>
              <span
                aria-hidden="true"
                style={{
                  display: "grid",
                  placeItems: "center",
                  width: 50,
                  height: 50,
                  borderRadius: 15,
                  background: green,
                  color: "#fff",
                  fontSize: 29,
                  fontWeight: 900,
                }}
              >
                H
              </span>
              <div>
                <strong style={{ display: "block", fontSize: 21 }}>HIISSA</strong>
                <span style={{ fontSize: 12, color: "#6b7a70", letterSpacing: ".08em" }}>
                  RECOMMEND / SHARE HIISSA
                </span>
              </div>
            </div>

            <p
              style={{
                margin: "0 0 8px",
                color: gold,
                fontWeight: 900,
                letterSpacing: ".08em",
                fontSize: 12,
              }}
            >
              INVITE SOMEONE TO HIISSA
            </p>
            <h1
              style={{
                margin: "0 0 12px",
                fontSize: "clamp(34px,7vw,52px)",
                lineHeight: 1.05,
              }}
            >
              Share something meaningful.
            </h1>
            <p style={{ margin: "0 0 18px", fontSize: 18, lineHeight: 1.6, color: "#5e7067" }}>
              Give someone a private way to discover HIISSA — without sharing anything from your own HIISSA space.
            </p>

            <div
              style={{
                display: "grid",
                gap: 10,
                padding: 17,
                borderRadius: 18,
                background: "#fff",
                border: "1px solid #e2e7df",
              }}
            >
              <strong style={{ color: green }}>♡ Share HIISSA. Never your story.</strong>
              <span style={{ color: "#66776f", lineHeight: 1.5 }}>
                Your conversations, reflections and private activity are never added to the invitation.
              </span>
            </div>
          </header>

          <div style={{ padding: "clamp(20px,5vw,36px)" }}>
            <h2 style={{ margin: "0 0 8px", fontSize: 27 }}>Share your invitation</h2>
            <p style={{ margin: "0 0 18px", color: "#65766e", lineHeight: 1.55 }}>
              Choose how you would like to share HIISSA with someone.
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2,minmax(0,1fr))",
                gap: 11,
                marginBottom: 22,
              }}
            >
              {channels.map((item) => (
                <ShareChoice
                  key={item.id}
                  item={item}
                  active={selected === item.id}
                  onClick={() => choose(item.id)}
                />
              ))}
            </div>

            <Card
              style={{
                padding: "clamp(18px,4vw,28px)",
                background:
                  selected === "whatsapp"
                    ? "#f0fbf2"
                    : selected === "copy"
                      ? "#fbf3f5"
                      : "#fbfcfa",
              }}
            >
              <p
                style={{
                  margin: "0 0 7px",
                  fontSize: 12,
                  fontWeight: 900,
                  letterSpacing: ".08em",
                  color: "#6b7d73",
                }}
              >
                {selectedChannel?.short?.toUpperCase()} · PROTOTYPE
              </p>

              {selected === "whatsapp" || selected === "messages" ? (
                <>
                  <h3 style={{ margin: "0 0 12px", fontSize: 25 }}>Ready to share</h3>
                  <div
                    style={{
                      whiteSpace: "pre-line",
                      padding: 18,
                      borderRadius: 18,
                      background: selected === "whatsapp" ? "#dff5de" : "#f3f4f2",
                      color: "#30483e",
                      lineHeight: 1.55,
                      border: "1px solid #d8e3d7",
                    }}
                  >
                    {sampleMessage}
                  </div>
                  <p style={{ margin: "14px 0 0", color: "#6c7a72", fontSize: 13 }}>
                    In the certified live version, HIISSA opens the chosen messaging app with the invitation prepared. The user remains in control of pressing Send.
                  </p>
                </>
              ) : null}

              {selected === "email" ? (
                <>
                  <h3 style={{ margin: "0 0 12px", fontSize: 25 }}>Email invitation preview</h3>
                  <div style={{ display: "grid", gap: 9 }}>
                    <div style={{ padding: 12, background: "#fff", borderRadius: 13, border: "1px solid #dfe6df" }}>
                      <strong>Subject:</strong> You might like HIISSA 💚
                    </div>
                    <div
                      style={{
                        whiteSpace: "pre-line",
                        padding: 18,
                        borderRadius: 18,
                        background: "#fff",
                        color: "#30483e",
                        lineHeight: 1.55,
                        border: "1px solid #dfe6df",
                      }}
                    >
                      {sampleMessage}
                    </div>
                  </div>
                  <div style={{ marginTop: 14, padding: 14, borderRadius: 15, background: "#f7f1df", color: "#6e5d31" }}>
                    <strong>Important:</strong> this referral email is not a Magic Link. If the recipient later chooses an account, HIISSA uses the separate secure Magic-Link sign-in flow.
                  </div>
                </>
              ) : null}

              {selected === "copy" ? (
                <>
                  <h3 style={{ margin: "0 0 12px", fontSize: 25 }}>
                    {copied ? "Invitation link copied!" : "Your HIISSA invitation link"}
                  </h3>
                  <div
                    style={{
                      padding: 14,
                      borderRadius: 13,
                      background: "#fff",
                      border: "1px solid #dfe6df",
                      wordBreak: "break-all",
                      marginBottom: 12,
                    }}
                  >
                    {sampleLink}
                  </div>
                  <button
                    type="button"
                    onClick={() => setCopied(true)}
                    style={{
                      width: "100%",
                      border: 0,
                      borderRadius: 15,
                      padding: "15px 18px",
                      background: green,
                      color: "#fff",
                      fontWeight: 900,
                      fontSize: 16,
                      cursor: "pointer",
                    }}
                  >
                    {copied ? "✓ Copied in this simulation" : "Copy invitation link"}
                  </button>
                  <p style={{ margin: "13px 0 0", color: "#6b7a72", fontSize: 13 }}>
                    This Staging preview does not copy or create a live referral record.
                  </p>
                </>
              ) : null}

              {selected === "qr" ? (
                <>
                  <h3 style={{ margin: "0 0 8px", textAlign: "center", fontSize: 25 }}>
                    Your invitation QR code
                  </h3>
                  <p style={{ margin: "0 0 8px", textAlign: "center", color: "#66766f" }}>
                    Let someone scan this to visit HIISSA.
                  </p>
                  <QrPreview />
                  <div style={{ padding: 14, borderRadius: 15, background: pink, textAlign: "center" }}>
                    <strong>HIISSA</strong>
                    <div style={{ marginTop: 4, color: "#6b6f69" }}>A safer, kinder space for real conversations.</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => choose("copy")}
                    style={{
                      width: "100%",
                      marginTop: 12,
                      border: "1px solid #a6c4b2",
                      borderRadius: 15,
                      padding: "14px 18px",
                      background: "#fff",
                      color: green,
                      fontWeight: 900,
                      cursor: "pointer",
                    }}
                  >
                    Copy link instead
                  </button>
                </>
              ) : null}

              {selected === "native" ? (
                <>
                  <h3 style={{ margin: "0 0 12px", fontSize: 25 }}>Phone share preview</h3>
                  <div style={{ padding: 17, borderRadius: 18, background: "#f2f3f1", border: "1px solid #dee4de" }}>
                    <strong style={{ display: "block", marginBottom: 5 }}>♡ Share HIISSA</strong>
                    <span style={{ color: "#66766f" }}>A safe space for real conversations.</span>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(4,minmax(0,1fr))",
                        gap: 10,
                        marginTop: 18,
                      }}
                    >
                      {["WhatsApp", "Messages", "Email", "More"].map((item) => (
                        <div key={item} style={{ textAlign: "center", fontSize: 12, color: "#52645a" }}>
                          <span
                            style={{
                              width: 42,
                              height: 42,
                              display: "grid",
                              placeItems: "center",
                              borderRadius: 13,
                              background: "#fff",
                              margin: "0 auto 6px",
                              border: "1px solid #dce4dc",
                              fontWeight: 900,
                            }}
                          >
                            {item.slice(0, 1)}
                          </span>
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                  <p style={{ margin: "14px 0 0", color: "#6b7a72", fontSize: 13 }}>
                    In the certified live version, this opens the device's normal native share sheet. HIISSA does not silently send anything.
                  </p>
                </>
              ) : null}
            </Card>

            <div
              style={{
                marginTop: 20,
                padding: 18,
                borderRadius: 18,
                border: "1px solid #e1ddcf",
                background: "#fffaf0",
              }}
            >
              <strong style={{ display: "block", marginBottom: 7, color: "#6c5727" }}>
                Your invitation stays private
              </strong>
              <span style={{ color: "#716d62", lineHeight: 1.55 }}>
                If you’re signed in, HIISSA can recognise when someone visits through your invitation and whether they later join HIISSA. Your conversations, reflections and private activity are never shared. Referral rewards are not active yet.
              </span>
            </div>
          </div>
        </Card>
      </section>
    </main>
  );
}
