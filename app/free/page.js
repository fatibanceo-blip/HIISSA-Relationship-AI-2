"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { createBrowserClient } from "@supabase/ssr";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const supabase = url && key ? createBrowserClient(url, key) : null;
const green = "#184a3b";
const tile = {background:"rgba(255,253,247,.92)",border:"1px solid #e5d7be",borderRadius:17,padding:"18px 15px",textDecoration:"none",color:green,boxShadow:"0 7px 18px rgba(39,74,55,.06)"};
export default function FreeWelcome() {
 const [status,setStatus] = useState("loading");
 useEffect(()=>{
   if(!supabase){setStatus("unavailable");return;}
   let active=true;
   supabase.auth.getSession().then(({data,error})=>{if(active)setStatus(error?"unavailable":data.session?"ready":"signedout");}).catch(()=>{if(active)setStatus("unavailable");});
   const {data:{subscription}}=supabase.auth.onAuthStateChange((_event,session)=>{if(active)setStatus(session?"ready":"signedout");});
   return ()=>{active=false;subscription.unsubscribe();};
 },[]);
 return <main style={{minHeight:"100vh",padding:"clamp(14px,3vw,35px)",background:"linear-gradient(130deg,#f5f6ec,#fff9ef 55%,#e7f0e6)",fontFamily:"Arial,Helvetica,sans-serif",color:green}}>
  <section style={{maxWidth:650,minHeight:"min(850px,94vh)",margin:"0 auto",borderRadius:28,overflow:"hidden",border:"1px solid #d8decf",background:"radial-gradient(ellipse at 92% 10%,rgba(246,206,145,.65),transparent 40%),linear-gradient(150deg,#fffefa 0%,#f5f2e9 100%)",boxShadow:"0 15px 45px rgba(36,76,54,.12)"}}>
   <div style={{padding:"clamp(18px,4vw,31px)",backgroundImage:"url(/hiissa-botanical-leaves.svg)",backgroundRepeat:"no-repeat",backgroundPosition:"calc(100% + 95px) top",backgroundSize:"220px auto"}}>
    <header style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:12}}>
      <span style={{fontWeight:800,display:"flex",alignItems:"center",gap:10}}><span style={{display:"grid",placeItems:"center",width:38,height:38,borderRadius:11,background:green,color:"#fff",fontSize:23}}>H</span>HIISSA</span>
      <span style={{border:"1px solid #c4d7c9",borderRadius:99,padding:"8px 17px",background:"#fffefa",fontWeight:800}}>FREE</span>
    </header>
    <h1 style={{fontSize:"clamp(30px,6vw,43px)",lineHeight:1.15,margin:"54px 0 12px",maxWidth:370}}>Welcome to your<br/>HIISSA space. 🌱</h1>
    <p style={{fontSize:19,lineHeight:1.5,margin:"0 0 30px",maxWidth:380}}>You’ve created your free account.<br/>What would feel right for you today?</p>
    {status==="loading" ? <p role="status">Checking your HIISSA account…</p> : status!=="ready" ? <section style={{...tile,padding:23}}>
       <h2 style={{margin:"0 0 10px",fontSize:23}}>Your FREE welcome is ready</h2>
       <p style={{lineHeight:1.55}}>{status==="unavailable"?"Account access is not configured in this Preview. No account has been created here.":"Sign in or create your free account to enter your personal HIISSA space."}</p>
       <Link href="/talk?free=1" style={{...tile,display:"block",textAlign:"center",background:green,color:"#fff",fontWeight:800}}>Get started with HIISSA FREE →</Link>
       <Link href="/" style={{display:"block",marginTop:18,color:green}}>← Back to main welcome</Link>
     </section> : <>
      <div style={{display:"grid",gap:13}}>
       <Link href="/talk?freeTalk=1" style={{...tile,display:"flex",alignItems:"center",gap:15,background:"linear-gradient(110deg,#184a3b,#2d6953)",color:"white",padding:20}}>
        <span aria-hidden="true" style={{fontSize:31}}>◉</span><span style={{flex:1}}><strong style={{display:"block",fontSize:21}}>Talk to HIISSA</strong><span style={{fontSize:15,lineHeight:1.6}}>Start or continue a conversation.</span></span><span aria-hidden="true" style={{fontSize:25}}>→</span>
       </Link>
       <Link href="/talk?freeExplore=1" style={{...tile,display:"flex",alignItems:"center",gap:15,padding:20}}>
        <span aria-hidden="true" style={{fontSize:30}}>◈</span><span style={{flex:1}}><strong style={{display:"block",fontSize:21}}>Explore HIISSA</strong><span style={{fontSize:15,lineHeight:1.6}}>Discover tools, insights and gentle guidance.</span></span><span aria-hidden="true" style={{fontSize:25}}>→</span>
       </Link>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(2,minmax(0,1fr))",gap:12,marginTop:19}}>
       <Link href="/talk?freeAccount=1" style={tile}><span style={{fontSize:25}}>♙</span><strong style={{display:"block",marginTop:9}}>My Space</strong><small>Your profile and settings</small></Link>
       <div style={tile}><span style={{fontSize:25}}>▥</span><strong style={{display:"block",marginTop:9}}>My Insights</strong><small>Gentle reflections on your progress</small></div>
       <div style={tile}><span style={{fontSize:25}}>♧</span><strong style={{display:"block",marginTop:9}}>Saved Items</strong><small>Notes and conversations where available</small></div>
       <Link href="/" style={tile}><span style={{fontSize:25}}>♛</span><strong style={{display:"block",marginTop:9}}>Explore Plans</strong><small>Discover HIISSA+ and TOGETHER</small></Link>
      </div>
      <p style={{...tile,margin:"20px 0 0",lineHeight:1.5}}>🌱 You’re on HIISSA FREE. Explore plans whenever you’re ready.</p>
     </>}
   </div>
  </section>
 </main>;
}
