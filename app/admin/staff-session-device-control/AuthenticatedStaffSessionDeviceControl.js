"use client";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import FounderStaffSessionDeviceControl from "../control-room-preview/FounderStaffSessionDeviceControl.js";

const supabase=process.env.NEXT_PUBLIC_SUPABASE_URL&&process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY):null;

export default function AuthenticatedStaffSessionDeviceControl(){
  const [state,setState]=useState("checking");
  useEffect(()=>{(async()=>{if(!supabase){setState("blocked");return;} const {data:{session}}=await supabase.auth.getSession(); if(!session){window.location.replace("/admin/login");return;} const {data:isAdmin,error}=await supabase.rpc("is_hiissa_admin"); setState(!error&&isAdmin?"ready":"blocked");})();},[]);
  if(state==="checking") return <main style={gate}><div style={card}>Checking secure Founder access…</div></main>;
  if(state==="blocked") return <main style={gate}><div style={card}>Founder Control Room access is required.<br/><Link href="/admin/login">Return to Admin sign in</Link></div></main>;
  return <main style={gate}><div style={{maxWidth:1100,width:"100%",margin:"0 auto"}}><Link href="/admin/control-room" style={{display:"inline-block",marginBottom:12,color:"#245b48",fontWeight:800}}>← Back to Founder Control Room</Link><FounderStaffSessionDeviceControl authenticated /></div></main>;
}
const gate={minHeight:"100vh",padding:"24px",background:"linear-gradient(145deg,#edf4ee,#fffaf0)",color:"#345347"};
const card={maxWidth:520,margin:"80px auto",padding:24,borderRadius:20,background:"#fffefa",border:"1px solid rgba(49,91,70,.15)"};
