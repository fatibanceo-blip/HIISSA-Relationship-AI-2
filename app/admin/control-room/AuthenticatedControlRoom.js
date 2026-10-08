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
  const [onboardingNavigationFailed, setOnboardingNavigationFailed] = useState(false);

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


  // Navigation-only adapter for the Employee Register's Existing Staff Onboarding
  // shortcut. Preserve the Founder-approved control-room/onboarding page byte-for-byte.
  // The shell's existing primary navigation recognises ?view=modules but does not
  // select Module 10 from a hash. Use its real module button; never bypass auth.
  useEffect(() => {
    if (state !== "ready" || typeof window === "undefined") return undefined;

    const query = new URLSearchParams(window.location.search);
    const isStaffOnboardingShortcut =
      window.location.pathname === "/admin/control-room" &&
      query.get("view") === "modules" &&
      query.get("focus") === "staff-onboarding" &&
      window.location.hash === "#module10-staff-access";
    if (!isStaffOnboardingShortcut) return undefined;

    let frame = 0;
    let attempts = 0;
    let moduleSelected = false;
    let cancelled = false;

    function openExistingStaffOnboarding() {
      if (cancelled) return;
      const target = document.getElementById("module10-staff-access");
      if (target) {
        target.scrollIntoView({ behavior: "auto", block: "start" });
        target.setAttribute("tabindex", "-1");
        target.focus({ preventScroll: true });
        return;
      }
      if (!moduleSelected) {
        const moduleNavigation = document.querySelector(
          'nav[aria-label="Founder Control Room modules"]'
        );
        const securityAndAudit = Array.from(
          moduleNavigation?.querySelectorAll("button") || []
        ).find((button) =>
          button.querySelector("strong")?.textContent?.trim() === "Security & Audit"
        );
        if (securityAndAudit) {
          securityAndAudit.click();
          moduleSelected = true;
        }
      }
      if (++attempts < 300) {
        frame = window.requestAnimationFrame(openExistingStaffOnboarding);
      } else {
        setMessage("The Staff Access & Onboarding section did not open automatically. Select Modules, then Security & Audit and Staff Access & Onboarding.");
        setOnboardingNavigationFailed(true);
      }
    }

    frame = window.requestAnimationFrame(openExistingStaffOnboarding);
    return () => {
      cancelled = true;
      window.cancelAnimationFrame(frame);
    };
  }, [state]);

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
    <>
      {onboardingNavigationFailed ? (
        <p role="alert" style={{padding:"14px 20px",margin:"0",background:"#fff4e8",color:"#744b24"}}>
          {message}
        </p>
      ) : null}
      <FounderControlRoomShell
        authenticated
        onSignOut={handleSignOut}
        environmentLabel="STAGING — TEST"
        environmentNote="Authenticated Control Room shell — live operational feeds are still connected only as they are individually certified."
      />
    </>
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
