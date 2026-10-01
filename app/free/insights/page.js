"use client";
import {useEffect,useState} from "react";
import Link from "next/link";
import {createBrowserClient} from "@supabase/ssr";
const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const supabase=url&&key?createBrowserClient(url,key):null;
const tile={padding:22,border:"1px solid #d8e4d9",borderRadius:19,background:"#fffefa"};
const items=[["♡","What matters to me","Explore the needs, values and boundaries you choose to reflect on."],["🌱","What I’m learning","Notice discoveries you have made in your own words, without ratings or judgments."],["◷","My check-ins","Connect to optional check-ins when available under your package."],["▤","Past reflections","Return to reflection history where your package permits it."]];
export default function MyInsights(){
 const [status,setStatus]=useState("loading");
 useEffect(()=>{if(!supabase){setStatus("unavailable");return;}let active=true;supabase.auth.getUser().then(({data,error})=>{if(active)setStatus(!error&&data.user?"ready":"signedout");}).catch(()=>{if(active)setStatus("unavailable");});return()=>{active=false;};},[]);
 return <main style={{minHeight:"100vh",background:"linear-gradient(135deg,#eef5ed,#fff8ef)",color:"#184a3b",fontFamily:"Arial, sans-serif",padding:"clamp(18px,5vw,50px)"}}><section style={{maxWidth:750,margin:"auto"}}>
 <Link href="/free/welcome" style={{color:"#184a3b"}}>← Your FREE welcome</Link><p style={{letterSpacing:2,fontSize:12,marginTop:35}}>HIISSA · FREE</p><h1 style={{fontSize:"clamp(34px,6vw,48px)",marginBottom:10}}>My Insights 🌱</h1><p style={{fontSize:19,lineHeight:1.6}}>A gentle place to notice what you’ve discovered about yourself, without scores or judgment.</p>
 {status==="ready"?<><section style={{...tile,marginTop:26,background:"#edf4eb"}}><h2>Your recent reflections</h2><p>Your reflections will appear here only when you choose to keep them and your package supports the feature. No reflections have been loaded or inferred.</p><h3>Something to reflect on</h3><p>What feels important to you today?</p></section>
 <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))",gap:15,marginTop:18}}>{items.map(([icon,title,description])=><div key={title} style={tile}><span aria-hidden="true" style={{fontSize:30}}>{icon}</span><h2>{title}</h2><p style={{lineHeight:1.6}}>{description}</p></div>)}</div>
 <p style={{marginTop:24,lineHeight:1.6}}>HIISSA will not invent insights, diagnose you or score your growth. Personalised insights and saved history require explicit permission and the appropriate package.</p><Link href="/free/space">Visit My Space →</Link>
 </>:status==="signedout"?<p role="status">Please <Link href="/free">sign in to HIISSA FREE</Link> to open your insights.</p>:<p role="status">{status==="loading"?"Checking your account…":"Personal account access is not configured in this Preview."}</p>}
 </section></main>;
}