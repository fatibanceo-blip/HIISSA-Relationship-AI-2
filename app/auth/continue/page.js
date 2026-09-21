"use client";

import { useEffect, useState } from "react";

export default function AuthContinuePage() {
  const [tokenHash, setTokenHash] = useState("");
  const [type, setType] = useState("email");
  const [ready, setReady] = useState(false);
  const [signingIn, setSigningIn] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const hash = new URLSearchParams(
      window.location.hash.replace(/^#/, "")
    );

    const query = new URLSearchParams(
      window.location.search
    );

    const token =
      hash.get("token_hash") ||
      query.get("token_hash") ||
      "";

    const authType =
      hash.get("type") ||
      query.get("type") ||
      "email";

    setTokenHash(token);
    setType(authType);
    setReady(true);
  }, []);

  function continueSecurely() {
    if (!tokenHash) {
      setError(
        "This sign-in link cannot be completed. Please return to HIISSA and request a new secure link."
      );
      return;
    }

    setSigningIn(true);
    setError("");

    const params = new URLSearchParams({
      token_hash: tokenHash,
      type,
      next: "/",
    });

    window.location.assign(
      `/auth/confirm?${params.toString()}`
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        background:
          "linear-gradient(180deg, #f7faf8 0%, #eef4f1 100%)",
        color: "#263c36",
        fontFamily:
          "Arial, Helvetica, sans-serif",
      }}
    >
      <section
        aria-labelledby="hiissa-auth-title"
        style={{
          width: "100%",
          maxWidth: "520px",
          background: "#fffdf8",
          border:
            "1px solid rgba(80, 102, 93, 0.18)",
          borderRadius: "24px",
          padding: "32px",
          boxShadow:
            "0 18px 50px rgba(64, 86, 76, 0.12)",
          textAlign: "center",
        }}
      >
        <div
          aria-hidden="true"
          style={{
            width: "54px",
            height: "54px",
            margin: "0 auto 18px",
            borderRadius: "50%",
            display: "grid",
            placeItems: "center",
            background: "#466f67",
            color: "white",
            fontSize: "24px",
            fontWeight: "800",
          }}
        >
          H
        </div>

        <h1
          id="hiissa-auth-title"
          style={{
            margin: "0 0 14px",
            fontSize: "28px",
          }}
        >
          Continue to HIISSA
        </h1>

        <p
          style={{
            margin: "0 0 12px",
            lineHeight: "1.6",
          }}
        >
          For your security, HIISSA has not
          signed you in yet.
        </p>

        <p
          style={{
            margin: "0 0 24px",
            lineHeight: "1.6",
          }}
        >
          Sign-in will be completed in the
          browser where you press Continue.
          If this is not the browser you want
          to use with HIISSA, open this page
          in your preferred browser first.
        </p>

        {!ready ? (
          <p role="status" aria-live="polite">
            Preparing your secure sign-in…
          </p>
        ) : (
          <button
            type="button"
            onClick={continueSecurely}
            disabled={signingIn || !tokenHash}
            style={{
              width: "100%",
              minHeight: "48px",
              border: "none",
              borderRadius: "14px",
              padding: "12px 18px",
              background: "#466f67",
              color: "white",
              fontSize: "16px",
              fontWeight: "800",
              cursor:
                signingIn || !tokenHash
                  ? "not-allowed"
                  : "pointer",
              opacity:
                signingIn || !tokenHash
                  ? 0.65
                  : 1,
            }}
          >
            {signingIn
              ? "Signing you in…"
              : "Continue securely"}
          </button>
        )}

        {!tokenHash && ready && (
          <p
            role="alert"
            style={{
              marginTop: "18px",
              lineHeight: "1.5",
            }}
          >
            This sign-in link cannot be
            completed. Please return to HIISSA
            and request a new secure link.
          </p>
        )}

        {error && (
          <p
            role="alert"
            style={{
              marginTop: "18px",
              lineHeight: "1.5",
            }}
          >
            {error}
          </p>
        )}

        <p
          style={{
            margin: "24px 0 0",
            fontSize: "13px",
            lineHeight: "1.5",
            opacity: 0.75,
          }}
        >
          Your secure sign-in is completed
          only after you choose to continue.
        </p>
      </section>
    </main>
  );
}
