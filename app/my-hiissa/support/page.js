"use client";

import Link from "next/link";
import {createBrowserClient} from "@supabase/ssr";
import {useEffect,useRef,useState} from "react";

// Only the existing HIISSA authenticated browser session is reused.
// All requests are Staging-only and refuse external acknowledgement or Production effects.
const GREEN="#194f3d";
const card={background:"#fffefa",padding:20,border:"1px solid #cadacf",borderRadius:19,margin:"20px 0"};
const field={display:"block",width:"100%",boxSizing:"border-box",minHeight:48,
 border:"1px solid #a8c4b3",borderRadius:12,padding:12,fontSize:16,marginTop:8};
let supabase;
function getClient(){
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
 const key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY||process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
 if(!url||!key)return null;
 if(!supabase)supabase=createBrowserClient(url,key,{auth:{
  persistSession:true,autoRefreshToken:true,detectSessionInUrl:true
 }});
 return supabase;
}
export default function MyHiissaCustomerSupportPage(){
 const [status,setStatus]=useState("CHECKING");
 const [session,setSession]=useState(null);
 const [items,setItems]=useState([]);
 const [subject,setSubject]=useState("");
 const [message,setMessage]=useState("");
 const [feedback,setFeedback]=useState("");
 const [busy,setBusy]=useState(false);
 const nonce=useRef(null);
 const [refresh,setRefresh]=useState(0);
 const [refreshing,setRefreshing]=useState(false);
 const [refreshMessage,setRefreshMessage]=useState("");
 useEffect(()=>{
  const client=getClient();
  if(!client){setStatus("UNAVAILABLE");return undefined;}
  let live=true;
  client.auth.getSession().then(({data,error})=>{
   if(!live)return;
   setSession(error?null:data.session);
   setStatus(error?"UNAVAILABLE":data.session?"READY":"SIGNED_OUT");
  }).catch(()=>{if(live)setStatus("UNAVAILABLE");});
  const {data:listener}=client.auth.onAuthStateChange((_event,next)=>{
   if(!live)return;
   setSession(next||null);setStatus(next?"READY":"SIGNED_OUT");
  });
  return ()=>{live=false;listener.subscription.unsubscribe();};
 },[]);
 useEffect(()=>{
  if(status!=="READY"||!session?.access_token)return undefined;
  let live=true;
  fetch("/api/support/requests",{method:"GET",cache:"no-store",
   headers:{Authorization:"Bearer "+session.access_token}
  }).then(async response=>{
   const data=await response.json().catch(()=>null);
   if(!response.ok||data?.status!=="MONITORING")throw Error("Source unavailable");
   if(live){
    setItems(Array.isArray(data.requests)?data.requests:[]);
    if(refresh>0){
     setRefreshing(false);
     setRefreshMessage("Your requests are up to date.");
    }
   }
  }).catch(()=>{
   if(!live)return;
   if(refresh>0){
    setRefreshing(false);
    setRefreshMessage("Could not refresh your requests. Please try again. Your saved requests were not changed.");
   }else setFeedback("Your saved support requests cannot be checked right now. Nothing was changed.");
  });
  return ()=>{live=false;};
 },[status,session?.access_token,refresh]);
 async function submit(event){
  event.preventDefault();
  if(!session?.access_token||busy)return;
  setBusy(true);setFeedback("");
  try{
   if(!nonce.current)nonce.current=crypto.randomUUID();
   const response=await fetch("/api/support/requests",{method:"POST",
     headers:{"Content-Type":"application/json",Authorization:"Bearer "+session.access_token},
     body:JSON.stringify({subject:subject.trim(),message:message.trim(),nonce:nonce.current})
   });
   const result=await response.json().catch(()=>null);
   if(!response.ok||result?.status!=="RECORDED_AND_AUDITED")throw Error(result?.status||"SOURCE_UNAVAILABLE");
   setFeedback("Your request was saved securely in HIISSA Staging. No automatic reply or external message was sent.");
   setSubject("");setMessage("");nonce.current=null;setRefresh(n=>n+1);
  }catch(error){
   setFeedback("Not saved or not verified: "+String(error?.message||"Please check the connection.")+
    ". Your message remains here; do not press Send repeatedly.");
  }finally{setBusy(false);}
 }
 return <main style={{background:"linear-gradient(145deg,#edf3ee,#fbfaf4)",minHeight:"100vh",
  color:GREEN,fontFamily:"Arial,Helvetica,sans-serif"}}>
  <div style={{maxWidth:740,margin:"0 auto",padding:"24px 18px 66px"}}>
   <nav aria-label="Return to My HIISSA"><Link href="/my-hiissa/account"
    style={{color:GREEN,fontWeight:800}}>← Back to My Account</Link></nav>
   <p style={{fontSize:12,letterSpacing:2,fontWeight:800,marginTop:30}}>HIISSA · MY SUPPORT REQUESTS</p>
   <h1 style={{fontSize:"clamp(32px,6vw,48px)",lineHeight:1.15}}>How can we help?</h1>
   <p style={{lineHeight:1.7}}>This is a protected <strong>Staging test</strong> of the
    approved customer-support journey. Your request can be recorded, but HIISSA does not
    yet send automatic acknowledgements or promise a human-response deadline.
    Do not include passwords, payment information or private HIISSA conversations.</p>
   {status==="CHECKING"?<p role="status">Checking your HIISSA sign-in…</p>:null}
   {status==="SIGNED_OUT"?<div style={card}><p>Please sign in using your existing HIISSA account.</p>
    <Link href="/talk?signin=1&from=home">Go to Sign in →</Link></div>:null}
   {status==="UNAVAILABLE"?<p role="alert">Secure support access is unavailable. No request was sent.</p>:null}
   {status==="READY"?<>
    <form onSubmit={submit} style={card}>
     <label style={{display:"block",fontWeight:700}}>What do you need help with?
      <input style={field} required minLength={5} maxLength={120} value={subject}
        onChange={e=>setSubject(e.target.value)} placeholder="For example, I cannot sign in"/>
     </label>
     <label style={{display:"block",fontWeight:700,marginTop:22}}>Describe the problem
      <textarea style={{...field,minHeight:132}} required minLength={5} maxLength={2000}
       value={message} onChange={e=>setMessage(e.target.value)}
       placeholder="Please explain what happened and what you expected."/>
     </label>
     <button type="submit" disabled={busy} style={{
      background:GREEN,color:"white",border:"none",borderRadius:12,
      padding:"14px 22px",minHeight:48,fontSize:16,fontWeight:800,marginTop:20,
      opacity:busy?.6:1
     }}>{busy?"Saving your request…":"Save support request in Staging"}</button>
     {feedback?<p role="status" aria-live="polite" style={{lineHeight:1.6}}>{feedback}</p>:null}
    </form>
    <section aria-label="Your saved Staging support requests" style={card}>
     <h2>Your saved support requests</h2>
     {items.length===0?<p>No saved Staging requests were returned. This does not confirm that live external messaging is active.</p>:
      <ul style={{listStyle:"none",padding:0}}>
      {items.map(item=><li key={item.id} style={{borderTop:"1px solid #dce6df",padding:"16px 0"}}>
       <strong>{item.subject}</strong>
       <p>State: {item.lifecycle_state} · Acknowledgement: NOT SENT</p>
       <small>Received: {new Date(item.created_at).toLocaleString()}</small>
      </li>)}
      </ul>}
     <button type="button" disabled={busy||refreshing}
      onClick={()=>{
       if(refreshing)return;
       setRefreshMessage("Checking…");
       setRefreshing(true);
       setRefresh(n=>n+1);
      }}
      style={{padding:12,border:"1px solid #bacfc0",background:"white",
       borderRadius:12,color:GREEN,fontWeight:800}}>{refreshing?"Checking…":"Refresh saved requests"}</button>
     {refreshMessage?<p role="status" aria-live="polite" style={{lineHeight:1.6}}>{refreshMessage}</p>:null}
    </section>
   </>:null}
  </div>
 </main>;
}
