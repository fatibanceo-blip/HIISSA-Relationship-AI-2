"use client";

import Link from "next/link";
import { createBrowserClient } from "@supabase/ssr";
import { useEffect, useRef, useState } from "react";

const green = "#194f3d";

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

export default function MyHiissaAccountPage() {
  const [authState, setAuthState] = useState("checking");
  const [session, setSession] = useState(null);
  const [signingOut, setSigningOut] = useState(false);
  const [error, setError] = useState("");
  const intentionalSignOutRef = useRef(false);

  useEffect(() => {
    const supabase = getSupabase();

    if (!supabase) {
      setAuthState("unavailable");
      return;
    }

    let active = true;

    supabase.auth
      .getSession()
      .then(({ data, error: sessionError }) => {
        if (!active) return;

        if (sessionError) {
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
    if (authState !== "signedout" || intentionalSignOutRef.current) {
      return;
    }

    window.location.replace(
      "/talk?signin=1&from=home"
    );
  }, [authState]);

  async function signOutThisDevice() {
    const supabase = getSupabase();
    if (!supabase || signingOut) return;

    if (!window.confirm("Sign out of HIISSA on this device?")) return;

    intentionalSignOutRef.current = true;
    setSigningOut(true);
    setError("");

    try {
      const { error: signOutError } = await supabase.auth.signOut({
        scope: "local",
      });

      if (signOutError) throw signOutError;

      window.location.replace("/");
    } catch {
      setError("HIISSA couldn't sign out on this device. Please try again.");
      setSigningOut(false);
    }
  }

  if (authState === "checking") {
    return (
      <main style={{minHeight:"100vh",display:"grid",placeItems:"center",background:"#edf3ee",color:green,fontFamily:"Arial, Helvetica, sans-serif"}}>
        <p>Opening your account…</p>
      </main>
    );
  }

  if (authState === "signedout") {
    return (
      <main style={{minHeight:"100vh",display:"grid",placeItems:"center",background:"linear-gradient(145deg,#edf3ee,#fbf8ee)",color:green,fontFamily:"Arial, Helvetica, sans-serif"}}>
        <p>Taking you to Sign in…</p>
      </main>
    );
  }

  if (authState !== "ready") {
    return (
      <main style={{minHeight:"100vh",padding:"32px 18px",background:"linear-gradient(145deg,#edf3ee,#fbf8ee)",color:green,fontFamily:"Arial, Helvetica, sans-serif"}}>
        <section style={{maxWidth:640,margin:"12vh auto 0",padding:32,borderRadius:24,background:"#fffefa",border:"1px solid #cfddd3",textAlign:"center"}}>
          <h1>My Account</h1>
          <p style={{color:"#607269",lineHeight:1.6}}>You need an authenticated HIISSA session to open account settings.</p>
          <Link href="/talk?signin=1&from=home" style={{display:"inline-block",marginTop:10,padding:"14px 20px",borderRadius:14,background:green,color:"#fff",textDecoration:"none",fontWeight:800}}>Sign in to HIISSA</Link>
        </section>
      </main>
    );
  }

  return (
    <main style={{minHeight:"100vh",background:"linear-gradient(145deg,#edf3ee 0%,#fbfaf4 58%,#f4efe5 100%)",color:"#173f32",fontFamily:"Arial, Helvetica, sans-serif"}}>
      <header style={{background:"rgba(255,255,252,.94)",borderBottom:"1px solid rgba(47,83,66,.1)"}}>
        <div style={{maxWidth:900,margin:"0 auto",padding:"14px 18px",display:"flex",justifyContent:"space-between",alignItems:"center",gap:12}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <span aria-hidden="true" style={{width:42,height:42,borderRadius:13,display:"grid",placeItems:"center",background:green,color:"#fff",fontWeight:800,fontSize:23}}>H</span>
            <div><strong style={{display:"block"}}>HIISSA</strong><small style={{color:"#677970",letterSpacing:".12em"}}>MY ACCOUNT</small></div>
          </div>
          <Link href="/my-hiissa" style={{color:green,fontWeight:800,textDecoration:"none"}}>← My HIISSA</Link>
        </div>
      </header>

      <div style={{maxWidth:760,margin:"0 auto",padding:"clamp(30px,7vw,64px) 18px 64px"}}>
        <p style={{margin:"0 0 8px",color:"#9a7937",fontWeight:900,letterSpacing:".08em",fontSize:13}}>ACCOUNT SETTINGS</p>
        <h1 style={{margin:"0 0 10px",fontFamily:"Georgia, 'Times New Roman', serif",fontWeight:500,fontSize:"clamp(38px,7vw,56px)"}}>My Account</h1>
        <p style={{margin:"0 0 30px",color:"#61736a",fontSize:17,lineHeight:1.65}}>You are already signed in. This page manages the current HIISSA account; it does not ask you to authenticate again.</p>

        <section style={{padding:24,borderRadius:22,background:"#fffefa",border:"1px solid #d3dfd6",boxShadow:"0 12px 28px rgba(31,72,54,.06)",marginBottom:16}}>
          <p style={{margin:"0 0 7px",fontSize:12,fontWeight:900,letterSpacing:".08em",color:"#7a8c83"}}>SIGNED-IN EMAIL</p>
          <strong style={{fontSize:18,wordBreak:"break-word"}}>{session?.user?.email || "Email unavailable"}</strong>
          <p style={{margin:"10px 0 0",color:"#687a71",lineHeight:1.55}}>This email identifies the authenticated account. It is shown as information, not as a new sign-in form.</p>
        </section>

        <section style={{padding:24,borderRadius:22,background:"#fffefa",border:"1px solid #d3dfd6",boxShadow:"0 12px 28px rgba(31,72,54,.06)",marginBottom:16}}>
          <p style={{margin:"0 0 7px",fontSize:12,fontWeight:900,letterSpacing:".08em",color:"#7a8c83"}}>YOUR HIISSA PLAN</p>
          <strong style={{fontSize:18}}>Access connection pending</strong>
          <p style={{margin:"10px 0 0",color:"#687a71",lineHeight:1.55}}>HIISSA will show one authoritative current access level here after the Account Access Resolver is implemented. This Preview does not guess FREE, HIISSA+ or HIISSA TOGETHER.</p>
        </section>

        <section style={{padding:24,borderRadius:22,background:"#fffefa",border:"1px solid #d3dfd6",boxShadow:"0 12px 28px rgba(31,72,54,.06)"}}>
          <h2 style={{margin:"0 0 8px",fontFamily:"Georgia, 'Times New Roman', serif",fontWeight:500}}>This device</h2>
          <p style={{margin:"0 0 18px",color:"#687a71",lineHeight:1.55}}>Signing out here ends the HIISSA session only in this browser/device. It does not delete the account or the account's saved conversations.</p>
          <button type="button" onClick={signOutThisDevice} disabled={signingOut} style={{border:"1px solid #b9cfc1",background:"#fff",color:green,padding:"13px 17px",borderRadius:14,fontWeight:800,cursor:signingOut?"not-allowed":"pointer"}}>
            {signingOut ? "Signing out…" : "Sign out on this device"}
          </button>
          {error && <p role="alert" style={{color:"#8a4137",margin:"12px 0 0"}}>{error}</p>}
        </section>
      </div>
    </main>
  );
}
