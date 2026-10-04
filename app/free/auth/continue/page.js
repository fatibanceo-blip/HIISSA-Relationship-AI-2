"use client";
import { useEffect, useState } from "react";

// FREE-only continuation: the link is not redeemed until the user chooses
// Continue in the intended browser. Existing /auth/continue is untouched.
export default function FreeAuthContinue() {
  const [tokenHash, setTokenHash] = useState("");
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    setTokenHash(query.get("token_hash") || "");
    setReady(true);
  }, []);
  function complete() {
    if (!tokenHash || busy) return;
    setBusy(true);
    const params = new URLSearchParams({ token_hash: tokenHash, type: "email" });
    window.location.assign(`/free/auth/confirm?${params.toString()}`);
  }
  return (
    <main style={{ minHeight:"100vh",display:"grid",placeItems:"center",padding:24,background:"#eff5f0",fontFamily:"Arial,sans-serif",color:"#184a3b" }}>
      <section style={{maxWidth:480,padding:30,borderRadius:20,background:"#fffdf7",textAlign:"center"}}>
        <h1>Continue to HIISSA Guest</h1>
        <p>Open this page in the browser where you want to use HIISSA. Your sign-in link will be used only when you choose Continue.</p>
        {!ready ? <p>Preparing your sign-in…</p> : !tokenHash ?
          <p role="alert">This link is incomplete. Return to HIISSA Guest and request a new link.</p> :
          <button type="button" onClick={complete} disabled={busy} style={{padding:"15px 25px",border:0,borderRadius:12,background:"#184a3b",color:"white",fontWeight:700,fontSize:17}}>
            {busy ? "Signing you in…" : "Continue securely"}
          </button>}
      </section>
    </main>
  );
}
