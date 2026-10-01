"use client";
import {useEffect,useState} from "react";
import Link from "next/link";
import {createBrowserClient} from "@supabase/ssr";
const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const supabase=url&&key?createBrowserClient(url,key):null;
const card={padding:22,border:"1px solid #d8e4d9",borderRadius:20,background:"#fffefa"};
export default function MySpace(){
 const [status,setStatus]=useState("loading");
 useEffect(()=>{if(!supabase){setStatus("unavailable");return;}let active=true;supabase.auth.getUser().then(({data,error})=>{if(active)setStatus(!error&&data.user?"ready":"signedout");}).catch(()=>{if(active)setStatus("unavailable");});return()=>{active=false;};},[]);
 return <main style={{minHeight:"100vh",background:"linear-gradient(135deg,#eef5ed,#fff8ef)",color:"#184a3b",fontFamily:"Arial, sans-serif",padding:"clamp(18px,5vw,50px)"}}><section style={{maxWidth:750,margin:"auto"}}>
 <Link href="/free/welcome" style={{color:"#184a3b"}}>← Your FREE welcome</Link><p style={{letterSpacing:2,fontSize:12,marginTop:35}}>HIISSA · FREE</p><h1 style={{fontSize:"clamp(34px,6vw,48px)",marginBottom:10}}>My Space 🌱</h1><p style={{fontSize:19,lineHeight:1.6}}>Your own gentle corner of HIISSA, at your pace.</p>
 {status==="ready"?<><div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))",gap:15,marginTop:30}}>
 <div style={card}><h2>My reflections</h2><p>Return to reflections you choose to keep when that feature is available in your plan.</p><Link href="/free/insights">Explore My Insights →</Link></div>
 <div style={card}><h2>My check-ins</h2><p>A place for gentle, optional check-ins. Your personal check-in history is not active here yet.</p></div>
 <div style={card}><h2>My HIISSA</h2><p>Your personal library and longer-term saved experiences will connect here according to your package permissions.</p></div>
 <div style={card}><h2>My account</h2><p>Account and privacy controls will connect here when verified. Your FREE account is already signed in.</p></div></div>
 <p style={{marginTop:24,lineHeight:1.6}}>Nothing on this page automatically saves a conversation or creates a personal insight. Paid Save &amp; Sync is not included in FREE.</p>
 </>:status==="signedout"?<p role="status">Please <Link href="/free">sign in to HIISSA FREE</Link> to open your space.</p>:<p role="status">{status==="loading"?"Checking your account…":"Personal account access is not configured in this Preview."}</p>}
 </section></main>;
}