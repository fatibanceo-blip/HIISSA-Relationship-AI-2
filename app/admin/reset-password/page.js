"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
);

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleReset(event) {
    event.preventDefault();
    setMessage("");

    if (password.length < 8) {
      setMessage("Please choose a password with at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("The passwords do not match.");
      return;
    }

    setSaving(true);

    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      setMessage(
        "This password-reset link may have expired or is no longer valid. Please request a new recovery email."
      );
      setSaving(false);
      return;
    }

    setMessage("Password updated successfully. You can now sign in to your private HIISSA admin area.");
    setPassword("");
    setConfirmPassword("");
    setSaving(false);
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
          Set your password
        </h1>

        <p
          style={{
            margin: "0 0 28px",
            color: "#66706b",
            fontSize: "15px",
            lineHeight: "1.7",
          }}
        >
          Create a password for your private HIISSA administrator account.
        </p>

        <form onSubmit={handleReset}>
          <label
            htmlFor="password"
            style={{
              display: "block",
              marginBottom: "7px",
              color: "#466f67",
              fontWeight: "700",
              fontSize: "14px",
            }}
          >
            New password
          </label>

          <input
            id="password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            style={inputStyle}
          />

          <label
            htmlFor="confirmPassword"
            style={{
              display: "block",
              marginTop: "18px",
              marginBottom: "7px",
              color: "#466f67",
              fontWeight: "700",
              fontSize: "14px",
            }}
          >
            Confirm new password
          </label>

          <input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            required
            style={inputStyle}
          />

          <button
            type="submit"
            disabled={saving}
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
              cursor: saving ? "default" : "pointer",
              opacity: saving ? 0.7 : 1,
            }}
          >
            {saving ? "Updating…" : "Set password"}
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
