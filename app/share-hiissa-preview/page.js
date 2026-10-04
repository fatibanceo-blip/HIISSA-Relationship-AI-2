"use client";

import Link from "next/link";
import { createBrowserClient } from "@supabase/ssr";
import QRCode from "qrcode";
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

function RealQrCode({ value }) {
  const [dataUrl, setDataUrl] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function createQr() {
      try {
        const nextUrl = await QRCode.toDataURL(value, {
          errorCorrectionLevel: "M",
          margin: 2,
          width: 420,
        });

        if (active) {
          setDataUrl(nextUrl);
          setError("");
        }
      } catch {
        if (active) {
          setDataUrl("");
          setError("HIISSA could not create the QR code right now.");
        }
      }
    }

    createQr();

    return () => {
      active = false;
    };
  }, [value]);

  if (error) {
    return (
      <div
        role="alert"
        style={{
          margin: "12px auto 18px",
          padding: 14,
          borderRadius: 14,
          background: "#fff1f1",
          color: "#864646",
          textAlign: "center",
        }}
      >
        {error}
      </div>
    );
  }

  if (!dataUrl) {
    return (
      <div
        style={{
          margin: "12px auto 18px",
          padding: 18,
          color: "#66766f",
          textAlign: "center",
        }}
      >
        Creating your QR code…
      </div>
    );
  }

  return (
    <img
      src={dataUrl}
      alt="Scannable HIISSA invitation QR code"
      width={210}
      height={210}
      style={{
        width: 210,
        height: 210,
        display: "block",
        margin: "8px auto 18px",
        background: "#fff",
        border: "10px solid #fff",
        boxShadow: "0 0 0 1px #d8e1d8",
      }}
    />
  );
}

export default function ShareHiissaPreviewPage() {
  const [selected, setSelected] = useState("whatsapp");
  const [copied, setCopied] = useState(false);
  const [referralCode, setReferralCode] = useState("");
  const [actionError, setActionError] = useState("");

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

  const emailSubject = "You might like HIISSA 💚";
  const emailHref = `mailto:?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(sampleMessage)}`;

  const selectedChannel = channels.find((item) => item.id === selected);

  function choose(id) {
    setSelected(id);
    setCopied(false);
    setActionError("");
  }

  function openWhatsApp() {
    setActionError("");
    window.location.assign(
      `https://wa.me/?text=${encodeURIComponent(sampleMessage)}`
    );
  }

  function openMessages() {
    setActionError("");
    window.location.assign(
      `sms:?body=${encodeURIComponent(sampleMessage)}`
    );
  }

  async function copyInvitationLink() {
    setActionError("");

    try {
      await navigator.clipboard.writeText(sampleLink);
      setCopied(true);
      return;
    } catch {
      try {
        const textarea = document.createElement("textarea");
        textarea.value = sampleLink;
        textarea.setAttribute("readonly", "");
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        const copiedOk = document.execCommand("copy");
        document.body.removeChild(textarea);

        if (!copiedOk) throw new Error("Copy failed");
        setCopied(true);
      } catch {
        setCopied(false);
        setActionError(
          "HIISSA could not copy the link automatically on this device. You can press and hold the link above to copy it."
        );
      }
    }
  }

  async function openPhoneShare() {
    setActionError("");

    if (!navigator.share) {
      setActionError(
        "Your browser does not support the phone share sheet here. You can use WhatsApp, Messages, Email or Copy Link instead."
      );
      return;
    }

    try {
      await navigator.share({
        title: "HIISSA",
        text: sampleMessage,
      });
    } catch (error) {
      if (error?.name !== "AbortError") {
        setActionError(
          "The phone share sheet could not be opened. Nothing was sent."
        );
      }
    }
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
            STAGING HANDOFF TEST · NOTHING SENDS AUTOMATICALLY
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
                {selectedChannel?.short?.toUpperCase()} · STAGING HANDOFF
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
                  <button
                    type="button"
                    onClick={selected === "whatsapp" ? openWhatsApp : openMessages}
                    style={{
                      width: "100%",
                      marginTop: 14,
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
                    {selected === "whatsapp"
                      ? "Open WhatsApp with invitation"
                      : "Open Messages with invitation"}
                  </button>
                  <p style={{ margin: "12px 0 0", color: "#6c7a72", fontSize: 13 }}>
                    HIISSA prepares the message and referral link. You still choose the recipient and press Send in the messaging app.
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
                  <a
                    href={emailHref}
                    onClick={() => setActionError("")}
                    style={{
                      display: "block",
                      width: "100%",
                      boxSizing: "border-box",
                      marginTop: 14,
                      border: 0,
                      borderRadius: 15,
                      padding: "15px 18px",
                      background: green,
                      color: "#fff",
                      fontWeight: 900,
                      fontSize: 16,
                      cursor: "pointer",
                      textAlign: "center",
                      textDecoration: "none",
                    }}
                  >
                    Open email with invitation
                  </a>
                  <p style={{ margin: "12px 0 0", color: "#6c7a72", fontSize: 13 }}>
                    Your email app opens with the subject and invitation prepared. You add the recipient and press Send.
                  </p>
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
                    onClick={copyInvitationLink}
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
                    {copied ? "✓ Invitation link copied" : "Copy invitation link"}
                  </button>
                  <p style={{ margin: "13px 0 0", color: "#6b7a72", fontSize: 13 }}>
                    This copies the current invitation link to your clipboard. Copying does not send it to anyone.
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
                  <RealQrCode value={sampleLink} />
                  <div style={{ padding: 14, borderRadius: 15, background: pink, textAlign: "center" }}>
                    <strong>HIISSA</strong>
                    <div style={{ marginTop: 4, color: "#6b6f69" }}>A safer, kinder space for real conversations.</div>
                  </div>
                  <button
                    type="button"
                    onClick={copyInvitationLink}
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
                    {copied ? "✓ Invitation link copied" : "Copy link instead"}
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
                  <button
                    type="button"
                    onClick={openPhoneShare}
                    style={{
                      width: "100%",
                      marginTop: 14,
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
                    Open phone share
                  </button>
                  <p style={{ margin: "12px 0 0", color: "#6b7a72", fontSize: 13 }}>
                    This opens your device's normal share sheet with the invitation prepared. HIISSA does not silently send anything.
                  </p>
                </>
              ) : null}

              {actionError ? (
                <div
                  role="alert"
                  style={{
                    marginTop: 14,
                    padding: "12px 14px",
                    borderRadius: 14,
                    background: "#fff1f1",
                    color: "#864646",
                    lineHeight: 1.45,
                    fontSize: 13,
                  }}
                >
                  {actionError}
                </div>
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
