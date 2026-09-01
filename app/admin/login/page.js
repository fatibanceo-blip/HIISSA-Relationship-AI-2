"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
);

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [signingIn, setSigningIn] = useState(false);

  async function handleLogin(event) {
    event.preventDefault();
    setMessage("");
    setSigningIn(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      setMessage("Email or password is incorrect. Please try again.");
      setSigningIn(false);
      return;
    }

    window.location.href = "/admin";
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
          Admin sign in
        </h1>

        <p
          style={{
            margin: "0 0 28px",
            color: "#66706b",
            fontSize: "15px",
            lineHeight: "1.7",
          }}
        >
          Sign in to your private HIISSA administrator area.
        </p>

        <form onSubmit={handleLogin}>
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

          <label
            htmlFor="password"
            style={{
              display: "block",
              marginTop: "18px",
              marginBottom: "7px",
              color: "#466f67",
              fontWeight: "700",
              fontSize: "14px",
            }}
          >
            Password
          </label>

          <div style={{ position: "relative" }}>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              style={{
                ...inputStyle,
                paddingRight: "72px",
              }}
            />

            <button
              type="button"
              onClick={() => setShowPassword((current) => !current)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              style={{
                position: "absolute",
                right: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                border: 0,
                background: "transparent",
                color: "#55786d",
                fontSize: "13px",
                fontWeight: "800",
                cursor: "pointer",
              }}
            >
              {showPassword ? "Hide" : "👁 Show"}
            </button>
          </div>

          <button
            type="submit"
            disabled={signingIn}
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
              cursor: signingIn ? "default" : "pointer",
              opacity: signingIn ? 0.7 : 1,
            }}
          >
            {signingIn ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <div
          style={{
            marginTop: "18px",
            textAlign: "center",
          }}
        >
          <a
            href="/admin/forgot-password"
            style={{
              color: "#55786d",
              fontSize: "14px",
              fontWeight: "700",
              textDecoration: "none",
            }}
          >
            Forgot your password?
          </a>
        </div>

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
