"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import FounderControlRoomShell from "../control-room-preview/page.js";

const supabase =
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
    ? createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
      )
    : null;

export default function AuthenticatedControlRoom() {
  const [state, setState] = useState("checking");
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function verify() {
      if (!supabase) {
        setState("blocked");
        setMessage("Admin authentication is not configured for this environment.");
        return;
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        window.location.replace("/admin/login");
        return;
      }

      const { data: isAdmin, error } = await supabase.rpc("is_hiissa_admin");

      if (error || !isAdmin) {
        setState("blocked");
        setMessage("This signed-in account does not currently have authorised Admin access.");
        return;
      }

      setState("ready");
    }

    verify();
  }, []);

  async function handleSignOut() {
    if (supabase) {
      await supabase.auth.signOut();
    }
    window.location.replace("/admin/login");
  }

  if (state === "checking") {
    return (
      <main style={gateStyle}>
        <div style={cardStyle}>
          <strong>HIISSA — Founder Control Room</strong>
          <p>Checking secure Admin access…</p>
        </div>
      </main>
    );
  }

  if (state === "blocked") {
    return (
      <main style={gateStyle}>
        <div style={cardStyle}>
          <strong>Control Room access unavailable</strong>
          <p>{message}</p>
          <a href="/admin/login" style={linkStyle}>Return to Admin sign in</a>
        </div>
      </main>
    );
  }

  return (
    <FounderControlRoomShell
      authenticated
      onSignOut={handleSignOut}
      environmentLabel="STAGING — TEST"
      environmentNote="Authenticated Control Room shell — live operational feeds are still connected only as they are individually certified."
    />
  );
}

const gateStyle = {
  minHeight: "100vh",
  display: "grid",
  placeItems: "center",
  padding: "24px",
  background: "linear-gradient(145deg,#edf4ee,#fffaf0)",
};

const cardStyle = {
  width: "min(520px,100%)",
  padding: "24px",
  borderRadius: "20px",
  background: "#fffefa",
  border: "1px solid rgba(49,91,70,.15)",
  color: "#345347",
  boxShadow: "0 18px 55px rgba(39,74,57,.12)",
};

const linkStyle = {
  display: "inline-block",
  marginTop: "8px",
  color: "#245b48",
  fontWeight: 800,
};
