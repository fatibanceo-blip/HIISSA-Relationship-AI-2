"use client";
import { useState } from "react";
import Link from "next/link";

// Public landing page only. The existing conversation experience lives at /talk.
export default function Home() {
  const [plan, setPlan] = useState(null);
  const green = "#204b3b";
  const leaf = "/hiissa-botanical-leaves.svg";
  return (
    <main style={{minHeight:"100vh",padding:"clamp(14px,4vw,42px)",background:"linear-gradient(135deg,#e6ede7,#f4f5f0)",fontFamily:"inherit"}}>
      <section aria-label="HIISSA botanical welcome" style={{maxWidth:1080,margin:"0 auto",padding:"clamp(20px,4vw,38px)",border:"1px solid #d6e2d6",borderRadius:26,backgroundImage:`url(${leaf}),url(${leaf}),radial-gradient(ellipse at 0% 16%,rgba(255,226,154,.42),transparent 29%),linear-gradient(120deg,#fffaf0,#fffef9 45%,#fff7e9)`,backgroundRepeat:"no-repeat",backgroundPosition:"left top,right top,center,center",backgroundSize:"clamp(130px,19vw,280px) auto,clamp(130px,19vw,280px) auto,cover,cover",boxShadow:"0 12px 35px rgba(33,77,56,.09)",color:green}}>
        <header style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:12,marginBottom:"clamp(36px,6vw,70px)"}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}><span aria-hidden="true" style={{display:"grid",placeItems:"center",width:52,height:52,borderRadius:15,background:green,color:"#fff",fontSize:31,fontWeight:800}}>H</span><strong style={{fontSize:20}}>HIISSA</strong></div>
          <Link href="/talk?signin=1" style={{border:"1px solid #c5d7c8",background:"#fffefa",color:green,padding:"11px 17px",borderRadius:99,fontWeight:700,textDecoration:"none"}}>Sign in</Link>
        </header>
        {!plan ? <>
          <div style={{textAlign:"center",marginBottom:"clamp(28px,5vw,48px)"}}>
            <p style={{fontWeight:800,letterSpacing:".055em",color:"#a3854e",margin:"0 0 22px"}}>YOUR SPACE. YOUR PACE.</p>
            <h1 style={{fontSize:"clamp(32px,6vw,47px)",lineHeight:1.15,margin:"0 0 20px",color:green}}>Welcome to HIISSA</h1>
            <p style={{fontSize:"clamp(19px,3.5vw,25px)",color:"#596d61",margin:"0 0 20px"}}>Your space to talk, heal and grow.</p>
            <p style={{fontSize:"clamp(16px,2.5vw,19px)",lineHeight:1.65,color:"#596d61",maxWidth:560,margin:"0 auto"}}>Whether you need someone to talk to or want to explore something deeper, you can begin here.</p>
          </div>
          <div style={{display:"grid",gap:13}}>
            <Link href="/talk?guest=1" style={{display:"block",textAlign:"center",background:"linear-gradient(105deg,#0e3d2e,#225b43 53%,#103e30)",color:"#fff",padding:"23px 16px",borderRadius:20,textDecoration:"none"}}><strong style={{display:"block",fontSize:"clamp(20px,3vw,25px)"}}>Start talking</strong><span style={{display:"block",fontSize:"clamp(15px,2.5vw,18px)",marginTop:5}}>Continue as a guest — no account needed</span></Link>
            <Link href="/free" style={{display:"block",textAlign:"center",background:"rgba(255,253,247,.93)",color:green,border:"1px solid #caa76c",padding:"22px 14px",borderRadius:20,textDecoration:"none"}}><strong style={{display:"block",fontSize:"clamp(19px,3vw,23px)"}}>Get started with HIISSA FREE</strong><span style={{display:"block",fontSize:"clamp(15px,2.5vw,18px)",marginTop:5,color:"#596d61"}}>Create your free account</span></Link>
          </div>
          <section aria-label="Discover more with HIISSA" style={{background:"linear-gradient(110deg,#fff7e7,#fffaf1)",border:"1px solid #dcb56c",borderRadius:20,padding:"clamp(17px,3vw,24px)",marginTop:36}}>
            <h2 style={{fontSize:"clamp(21px,3vw,25px)",margin:"0 0 15px",color:"#46513f"}}>✧ Discover more with HIISSA</h2>
            <p style={{fontSize:17,lineHeight:1.65,color:"#647060",margin:"0 0 18px"}}>Explore deeper personal experiences and meaningful shared connections.</p>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,220px),1fr))",gap:13}}>
              <button type="button" onClick={()=>setPlan("plus")} style={{textAlign:"left",backgroundImage:`url(${leaf}),linear-gradient(125deg,#fff,#fffdf5)`,backgroundRepeat:"no-repeat",backgroundPosition:"right bottom",backgroundSize:"clamp(110px,16vw,210px) auto,cover",border:"1px solid #d8b77e",borderRadius:17,padding:22,minHeight:170,cursor:"pointer"}}><strong style={{display:"block",fontSize:22,color:green,marginBottom:12}}>HIISSA+</strong><span style={{display:"block",fontSize:16,color:"#647060",marginBottom:16}}>More for your personal journey</span><span style={{display:"inline-block",background:"#a67c35",color:"#fff",padding:"10px 22px",borderRadius:18,fontSize:17,fontWeight:800}}>Discover →</span></button>
              <button type="button" onClick={()=>setPlan("together")} style={{textAlign:"left",backgroundImage:`url(${leaf}),linear-gradient(125deg,#fff,#fffdf5)`,backgroundRepeat:"no-repeat",backgroundPosition:"calc(100% + 68px) bottom,center",backgroundSize:"clamp(110px,13vw,155px) auto,cover",border:"1px solid #d8b77e",borderRadius:17,padding:22,minHeight:170,cursor:"pointer"}}><strong style={{display:"flex",alignItems:"center",gap:12,flexWrap:"wrap",fontSize:22,color:green,marginBottom:12}}>HIISSA <span style={{color:"#a57c36"}}>TOGETHER</span><img src="/hiissa-together-approved.jpg" alt="HIISSA Together approved logo" style={{width:"clamp(74px,10vw,125px)",borderRadius:14}} /></strong><span style={{display:"block",fontSize:16,color:"#647060",marginBottom:16}}>For the relationships that matter</span><span style={{display:"inline-block",background:"#a67c35",color:"#fff",padding:"10px 22px",borderRadius:18,fontSize:17,fontWeight:800}}>Discover →</span></button>
            </div>
          </section>
        </> : <section style={{maxWidth:560,margin:"0 auto",padding:"24px 0"}}><button type="button" onClick={()=>setPlan(null)} style={{border:0,background:"transparent",color:green,cursor:"pointer",marginBottom:24}}>← Back to welcome</button><h1 style={{color:green}}>{plan==="plus"?"HIISSA+":"HIISSA TOGETHER"}</h1><p>{plan==="plus"?"More for your personal journey.":"For the relationships that matter."}</p><p>Full plan details and access will be introduced after founder review. No purchase is available here yet.</p><Link href="/talk?signin=1" style={{display:"inline-block",background:green,color:"#fff",padding:"15px 22px",borderRadius:13,textDecoration:"none"}}>Sign in to HIISSA</Link></section>}
      </section>
    </main>
  );
}
