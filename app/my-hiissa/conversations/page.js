"use client";

import Link from "next/link";
import { createBrowserClient } from "@supabase/ssr";
import { useEffect, useState } from "react";

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

function formatDate(value) {
  if (!value) return "";

  try {
    return new Intl.DateTimeFormat(undefined, {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value));
  } catch {
    return "";
  }
}

export default function MyHiissaConversationsPage() {
  const [authState, setAuthState] = useState("checking");
  const [session, setSession] = useState(null);
  const [state, setState] = useState("loading");
  const [conversations, setConversations] = useState([]);

  useEffect(() => {
    const supabase = getSupabase();

    if (!supabase) {
      setAuthState("unavailable");
      return;
    }

    let active = true;

    supabase.auth
      .getSession()
      .then(({ data, error }) => {
        if (!active) return;

        if (error) {
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
    if (!session?.access_token) {
      setConversations([]);
      setState("idle");
      return;
    }

    const controller = new AbortController();
    setState("loading");

    fetch("/api/conversations", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Unable to load conversations.");
        }

        const data = await response.json();

        setConversations(
          Array.isArray(data.conversations) ? data.conversations : []
        );
        setState("ready");
      })
      .catch((error) => {
        if (error?.name === "AbortError") return;
        setState("error");
      });

    return () => controller.abort();
  }, [session?.access_token]);

  if (authState === "checking") {
    return (
      <main style={{minHeight:"100vh",display:"grid",placeItems:"center",background:"#edf3ee",color:green,fontFamily:"Arial, Helvetica, sans-serif"}}>
        <p>Opening your conversations…</p>
      </main>
    );
  }

  if (authState !== "ready") {
    return (
      <main style={{minHeight:"100vh",padding:"32px 18px",background:"linear-gradient(145deg,#edf3ee,#fbf8ee)",color:green,fontFamily:"Arial, Helvetica, sans-serif"}}>
        <section style={{maxWidth:640,margin:"12vh auto 0",padding:"32px",borderRadius:24,background:"#fffefa",border:"1px solid #cfddd3",textAlign:"center"}}>
          <h1>My Conversations</h1>
          <p style={{color:"#607269",lineHeight:1.6}}>Sign in to view the private conversation history attached to your HIISSA account.</p>
          <Link href="/talk?signin=1&from=home" style={{display:"inline-block",marginTop:10,padding:"14px 20px",borderRadius:14,background:green,color:"#fff",textDecoration:"none",fontWeight:800}}>Sign in to HIISSA</Link>
          <div style={{marginTop:18}}><Link href="/" style={{color:green,fontWeight:800}}>← Back to HIISSA</Link></div>
        </section>
      </main>
    );
  }

  return (
    <main style={{minHeight:"100vh",background:"linear-gradient(145deg,#edf3ee 0%,#fbfaf4 58%,#f4efe5 100%)",color:"#173f32",fontFamily:"Arial, Helvetica, sans-serif"}}>
      <header style={{background:"rgba(255,255,252,.94)",borderBottom:"1px solid rgba(47,83,66,.1)"}}>
        <div style={{maxWidth:980,margin:"0 auto",padding:"14px 18px",display:"flex",justifyContent:"space-between",alignItems:"center",gap:12}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <span aria-hidden="true" style={{width:42,height:42,borderRadius:13,display:"grid",placeItems:"center",background:green,color:"#fff",fontWeight:800,fontSize:23}}>H</span>
            <div><strong style={{display:"block"}}>HIISSA</strong><small style={{color:"#677970",letterSpacing:".12em"}}>MY CONVERSATIONS</small></div>
          </div>
          <Link href="/my-hiissa" style={{color:green,fontWeight:800,textDecoration:"none"}}>← My HIISSA</Link>
        </div>
      </header>

      <div style={{maxWidth:880,margin:"0 auto",padding:"clamp(28px,6vw,58px) 18px 64px"}}>
        <p style={{margin:"0 0 8px",color:"#9a7937",fontWeight:900,letterSpacing:".08em",fontSize:13}}>YOUR PRIVATE HISTORY</p>
        <h1 style={{margin:"0 0 10px",fontFamily:"Georgia, 'Times New Roman', serif",fontWeight:500,fontSize:"clamp(38px,7vw,58px)"}}>My Conversations</h1>
        <p style={{margin:"0 0 30px",maxWidth:620,color:"#61736a",fontSize:17,lineHeight:1.65}}>Only conversations belonging to this authenticated HIISSA account appear here.</p>

        {state === "loading" && (
          <section style={{padding:24,borderRadius:20,background:"#fffefa",border:"1px solid #d3dfd6"}}><p style={{margin:0}}>Loading your conversations…</p></section>
        )}

        {state === "error" && (
          <section role="alert" style={{padding:24,borderRadius:20,background:"#fff5f1",border:"1px solid #e6cbc2"}}>
            <strong>HIISSA couldn't load your conversations right now.</strong>
            <p style={{margin:"8px 0 0"}}>Your conversations remain safe. Please try again later.</p>
          </section>
        )}

        {state === "ready" && conversations.length === 0 && (
          <section style={{padding:"30px 24px",borderRadius:22,background:"#fffefa",border:"1px solid #d3dfd6",boxShadow:"0 12px 28px rgba(31,72,54,.06)"}}>
            <h2 style={{margin:"0 0 8px",fontFamily:"Georgia, 'Times New Roman', serif",fontWeight:500}}>Nothing to continue yet.</h2>
            <p style={{margin:"0 0 20px",color:"#65766e"}}>When you have authenticated HIISSA conversations, they will appear here.</p>
            <Link href="/talk?myHiissaTalk=1#hiissa-conversation" style={{display:"inline-block",padding:"14px 18px",borderRadius:14,background:green,color:"#fff",fontWeight:800,textDecoration:"none"}}>Talk to HIISSA →</Link>
          </section>
        )}

        {state === "ready" && conversations.length > 0 && (
          <div style={{display:"grid",gap:12}}>
            {conversations.map((conversation) => (
              <Link
                key={conversation.id}
                href={`/talk?myHiissaConversation=${encodeURIComponent(conversation.id)}`}
                style={{display:"block",padding:"20px",borderRadius:18,background:"#fffefa",border:"1px solid #d3dfd6",boxShadow:"0 8px 20px rgba(31,72,54,.05)",color:"#173f32",textDecoration:"none"}}
              >
                <strong style={{display:"block",fontSize:18,marginBottom:6}}>{conversation.title || "HIISSA Conversation"}</strong>
                <span style={{display:"block",color:"#718079",fontSize:14}}>
                  {formatDate(conversation.last_message_at || conversation.updated_at || conversation.created_at)}
                </span>
                <span style={{display:"block",marginTop:10,color:green,fontWeight:800}}>Open conversation →</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
