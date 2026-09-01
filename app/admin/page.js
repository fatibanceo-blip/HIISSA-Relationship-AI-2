"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
);

export default function AdminPage() {
  const [checking, setChecking] = useState(true);
  const [signedIn, setSignedIn] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    async function checkSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        window.location.replace("/admin/login");
        return;
      }

      setSignedIn(true);
      setChecking(false);
    }

    checkSession();
  }, []);

  async function handleSignOut() {
    setSigningOut(true);
    await supabase.auth.signOut();
    window.location.replace("/admin/login");
  }

  if (checking) {
    return (
      <main style={pageStyle}>
        <p style={{ color: "#66706b" }}>Checking secure access…</p>
      </main>
    );
  }

  if (!signedIn) {
    return null;
  }

  return (
    <main style={pageStyle}>
      <section style={cardStyle}>
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
          Admin dashboard
        </h1>

        <p
          style={{
            margin: "0 0 26px",
            color: "#66706b",
            fontSize: "15px",
            lineHeight: "1.7",
          }}
        >
          Your secure HIISSA administrator session is working.
        </p>

        <div
          style={{
            padding: "18px",
            borderRadius: "16px",
            background: "rgba(85, 120, 109, 0.08)",
            border: "1px solid rgba(85, 120, 109, 0.14)",
          }}
        >
          <strong style={{ color: "#466f67" }}>Secure access confirmed ✓</strong>

          <p
            style={{
              margin: "8px 0 0",
              color: "#66706b",
              fontSize: "14px",
              lineHeight: "1.6",
            }}
          >
            Your private feedback statistics will appear here once owner-only
            database access is connected.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSignOut}
          disabled={signingOut}
          style={{
            marginTop: "24px",
            border: 0,
            borderRadius: "14px",
            padding: "12px 18px",
            background: "#55786d",
            color: "#fffdf8",
            fontSize: "14px",
            fontWeight: "800",
            cursor: signingOut ? "default" : "pointer",
            opacity: signingOut ? 0.7 : 1,
          }}
        >
          {signingOut ? "Signing out…" : "Sign out"}
        </button>

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

const pageStyle = {
  minHeight: "100vh",
  padding: "32px 16px 48px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const cardStyle = {
  width: "100%",
  maxWidth: "620px",
  background: "rgba(255, 253, 248, 0.94)",
  border: "1px solid rgba(80, 102, 93, 0.14)",
  borderRadius: "26px",
  padding: "clamp(24px, 5vw, 42px)",
  boxShadow: "0 24px 70px rgba(64, 86, 76, 0.14)",
};
