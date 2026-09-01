"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
);

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setSending(true);

    const redirectTo = `${window.location.origin}/admin/reset-password`;

    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo,
    });

    if (error) {
      setMessage(
        "We couldn't send the recovery email. Please check the email address and try again."
      );
      setSending(false);
      return;
    }

    setMessage(
      "Password recovery email sent. Please open the newest email and follow the reset-password link."
    );
    setEmail("");
    setSending(false);
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "32px 16px 48px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <section
        style={{
          width: "100%",
          maxWidth: "520px",
          background: "rgba(255, 253, 248, 0.94)",
          border: "1px solid rgba(80, 102, 93, 0.14)",
          borderRadius: "26px",
          padding: "clamp(24px, 5vw, 42px)",
          boxShadow: "0 24px 70px rgba(64, 86, 76, 0.14)",
        }}
      >
        <div
          style={{
            color: "#607d73",
            fontSize: "11px",
            letterSpacing: "0.17em",
            fontWeight: "850",
            marginBottom: "8px",
          }}
        >
          HIISSA • PRIVATE ADMIN
        </div>

        <h1
          style={{
            margin: "0 0 12px",
            color: "#29332f",
            fontSize: "clamp(30px, 7vw, 42px)",
            lineHeight: "1.08",
          }}
        >
          Reset your password
        </h1>

        <p
          style={{
            margin: "0 0 28px",
            color: "#66706b",
            fontSize: "15px",
            lineHeight: "1.7",
          }}
        >
          Enter the email address for your private HIISSA administrator
          account. A secure password-recovery link will be sent to you.
        </p>

        <form onSubmit={handleSubmit}>
          <label
            htmlFor="email"
            style={{
              display: "block",
              marginBottom: "7px",
              color: "#466f67",
              fontWeight: "700",
              fontSize: "14px",
            }}
          >
            Admin email
          </label>

          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            style={inputStyle}
          />

          <button
            type="submit"
            disabled={sending}
            style={{
              width: "100%",
              marginTop: "24px",
              border: 0,
              borderRadius: "14px",
              padding: "14px 18px",
              background: "#55786d",
              color: "#fffdf8",
              fontSize: "15px",
              fontWeight: "800",
              cursor: sending ? "default" : "pointer",
              opacity: sending ? 0.7 : 1,
            }}
          >
            {sending ? "Sending…" : "Send recovery email"}
          </button>
        </form>

        {message ? (
          <p
            style={{
              margin: "20px 0 0",
              color: "#5f6964",
              fontSize: "14px",
              lineHeight: "1.6",
            }}
          >
            {message}
          </p>
        ) : null}

        <div
          style={{
            marginTop: "30px",
            paddingTop: "20px",
            borderTop: "1px solid rgba(80, 102, 93, 0.14)",
            color: "#747d78",
            fontSize: "12px",
            lineHeight: "1.7",
          }}
        >
          HIISSA RELATIONSHIP AI
          <br />
          Healing is transformation, not erasure.
        </div>
      </section>
    </main>
  );
}

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  border: "1px solid rgba(80, 102, 93, 0.24)",
  borderRadius: "14px",
  padding: "13px 14px",
  background: "#fffdf8",
  color: "#29332f",
  fontSize: "16px",
  outline: "none",
};
