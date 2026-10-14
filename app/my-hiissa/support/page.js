"use client";

import Link from "next/link";
import {createBrowserClient} from "@supabase/ssr";
import {useEffect,useRef,useState} from "react";
import {markOriginalSupportReturn} from "../../../lib/hiissa-original-support-return.mjs";

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
 // Same original My Support Requests; delivered in-app reply is a subordinate,
 // separately authenticated, read-only source. Submission/refresh stays intact.
 const [replies,setReplies]=useState([]);
 const [repliesState,setRepliesState]=useState("NOT_CHECKED");
 // R219 follow-ups stay subordinate to THIS original customer Support case.
 const [followups,setFollowups]=useState([]);
 const [followupsState,setFollowupsState]=useState("NOT_CHECKED");
 const [followupInputs,setFollowupInputs]=useState({});
 const [followupBusyCase,setFollowupBusyCase]=useState(null);
 const [followupFeedback,setFollowupFeedback]=useState({});
 const followupNonce=useRef({});
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
  setFollowupsState("CHECKING");
  fetch("/api/support/requests/followups",{
   method:"GET",cache:"no-store",
   headers:{Authorization:"Bearer "+session.access_token}
  }).then(async response=>{
   const result=await response.json().catch(()=>null);
   if(!response.ok||result?.status!=="ORIGINAL_CUSTOMER_CASE_FOLLOWUPS"||
    result?.registryId!=="customer-communication-service-level-centre"||
    result?.externalMessageSent!==false||result?.productionEffectEnabled!==false||
    !Array.isArray(result?.followups))
     throw Error("Unverified");
   if(live){
    setFollowups(result.followups.filter(x=>typeof x.requestId==="string"&&
      typeof x.message==="string"&&x.state==="RECEIVED_PENDING_REVIEW"));
    setFollowupsState("VERIFIED");
   }
  }).catch(()=>{if(live)setFollowupsState("UNAVAILABLE");});
  return ()=>{live=false;};
 },[status,session?.access_token,refresh]);
 useEffect(()=>{
  if(status!=="READY"||!session?.access_token)return undefined;
  let live=true;
  setRepliesState("CHECKING");
  fetch("/api/support/requests/replies",{
   method:"GET",cache:"no-store",
   headers:{Authorization:"Bearer "+session.access_token}
  }).then(async response=>{
   const body=await response.json().catch(()=>null);
   if(!response.ok||body?.status!=="ORIGINAL_CUSTOMER_IN_APP_REPLIES"||
      body?.registryId!=="customer-communication-service-level-centre"||
      body?.externalEmailSent!==false||body?.externalSmsSent!==false||
      body?.productionEffectEnabled!==false||
      !Array.isArray(body?.replies))
      throw Error("Not verified");
   if(live){
    setReplies(body.replies.filter(item=>typeof item.requestId==="string"&&
      typeof item.reply==="string"&&typeof item.deliveredAt==="string"));
    setRepliesState("VERIFIED");
   }
  }).catch(()=>{if(live)setRepliesState("UNAVAILABLE");});
  return ()=>{live=false;};
 },[status,session?.access_token,refresh]);
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
 async function submitFollowup(event,item){
  event.preventDefault();
  const content=String(followupInputs[item.id]||"").trim();
  if(!session?.access_token||followupBusyCase||
    content.length<8||content.length>2000)return;
  setFollowupBusyCase(item.id);
  setFollowupFeedback(old=>({...old,[item.id]:"Recording your follow-up in Staging…"}));
  try{
   if(!followupNonce.current[item.id])
     followupNonce.current[item.id]=crypto.randomUUID();
   const response=await fetch("/api/support/requests/followups",{
    method:"POST",cache:"no-store",credentials:"same-origin",
    headers:{"Content-Type":"application/json",
      Authorization:"Bearer "+session.access_token},
    body:JSON.stringify({action:"reply_to_my_original_support_case",
      requestId:item.id,nonce:followupNonce.current[item.id],message:content})
   });
   const result=await response.json().catch(()=>null);
   if(!response.ok||
    !["ORIGINAL_CASE_FOLLOWUP_RECORDED_AND_AUDITED",
      "ALREADY_RECORDED_NO_DUPLICATE"].includes(result?.status)||
    result?.followupRecorded!==true||result?.requestId!==item.id||
    result?.state!=="RECEIVED_PENDING_REVIEW"||
    result?.externalMessageSent!==false||
    result?.productionEffectEnabled!==false)
     throw Error(result?.status||"FOLLOWUP_NOT_VERIFIED");
   // Reload owner-scoped original persisted source; a response is NEVER
   // automatically sent to customer merely because a follow-up was saved.
   const read=await fetch("/api/support/requests/followups",{
    method:"GET",cache:"no-store",
    headers:{Authorization:"Bearer "+session.access_token}
   });
   const saved=await read.json().catch(()=>null);
   if(!read.ok||saved?.status!=="ORIGINAL_CUSTOMER_CASE_FOLLOWUPS"||
    !Array.isArray(saved?.followups)||
    !saved.followups.some(x=>x.requestId===item.id&&
      x.id===result.followupId&&x.message===content&&
      x.state==="RECEIVED_PENDING_REVIEW"))
      throw Error("Saved follow-up could not be independently rechecked. Do not resubmit blindly.");
   delete followupNonce.current[item.id];
   setFollowupInputs(old=>({...old,[item.id]:""}));
   setFollowupFeedback(old=>({...old,[item.id]:
     "Your follow-up was recorded and verified for this original case. Customer Support has not replied yet."}));
   setRefresh(n=>n+1);
  }catch(error){
   setFollowupFeedback(old=>({...old,[item.id]:
     "The follow-up is not verified: "+String(error?.message||"Source unavailable")+
     ". Your text remains here. Check the saved case before trying again."}));
  }finally{setFollowupBusyCase(null);}
 }
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
    <Link href="/talk?signin=1&from=home"
     onClick={()=>markOriginalSupportReturn(window.localStorage)}>Go to Sign in →</Link></div>:null}
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
       {repliesState==="VERIFIED"&&replies.filter(reply=>reply.requestId===item.id)
        .map(reply=><section key={reply.requestId} aria-label="HIISSA customer service reply"
          style={{background:"#edf5ee",border:"1px solid #c7dccd",
           borderRadius:12,padding:14,marginTop:12}}>
          <strong>Reply from HIISSA Customer Support · delivered in-app</strong>
          <p style={{whiteSpace:"pre-wrap",overflowWrap:"anywhere",lineHeight:1.65}}>
            {reply.reply}
          </p>
          <small>Delivered: {new Date(reply.deliveredAt).toLocaleString()}</small>
          <p style={{fontSize:13}}>This reply is visible only in your signed-in
            Staging support requests. No email or SMS was sent.</p>
          <section aria-label="Your follow-up messages in the original support case"
           style={{borderTop:"1px solid #c7dccd",marginTop:18,paddingTop:14}}>
           <h3 style={{fontSize:18,marginTop:0}}>Continue this support conversation</h3>
           <p style={{lineHeight:1.6}}>You can reply to this delivered answer
             without opening a new request. HIISSA records your follow-up for
             Customer Support to review. This does not send an automatic human reply.</p>
           {followupsState==="CHECKING"?<p role="status">Checking your follow-ups…</p>:null}
           {followupsState==="UNAVAILABLE"?<p role="alert">
             Follow-up history could not be checked. Your existing request and
             delivered reply remain available. Please refresh before sending.
           </p>:null}
           {followupsState==="VERIFIED"?followups.filter(x=>x.requestId===item.id)
             .map(x=><div key={x.id} style={{background:"white",padding:12,
               border:"1px solid #cadacf",borderRadius:10,margin:"10px 0"}}>
               <strong>Your follow-up · awaiting Customer Support review</strong>
               <p style={{whiteSpace:"pre-wrap",overflowWrap:"anywhere"}}>{x.message}</p>
               <small>Received: {new Date(x.createdAt).toLocaleString()}</small>
             </div>):null}
           <form onSubmit={event=>submitFollowup(event,item)}>
            <label style={{display:"block",fontWeight:700}}>
              Your follow-up to this reply
              <textarea style={{...field,minHeight:108}} required minLength={8}
               maxLength={2000} disabled={followupBusyCase===item.id||
                followupsState!=="VERIFIED"}
               value={followupInputs[item.id]||""}
               onChange={event=>setFollowupInputs(old=>({
                 ...old,[item.id]:event.target.value
               }))}
               placeholder="Please tell us what still needs help. Do not include passwords or payment details."/>
            </label>
            <button type="submit" disabled={followupBusyCase!==null||
              followupsState!=="VERIFIED"||
              String(followupInputs[item.id]||"").trim().length<8}
             style={{marginTop:12,padding:"12px 16px",minHeight:48,
               border:0,borderRadius:12,background:GREEN,color:"white",fontWeight:800}}>
              {followupBusyCase===item.id?"Recording follow-up…":
                "Send follow-up to Customer Support in Staging"}
            </button>
            {followupFeedback[item.id]?<p role="status" aria-live="polite"
              style={{lineHeight:1.6}}>{followupFeedback[item.id]}</p>:null}
           </form>
          </section>
        </section>)}
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
     {repliesState==="CHECKING"?<p role="status">Checking replies for your account…</p>:null}
     {repliesState==="UNAVAILABLE"?<p role="alert">
       Your saved requests remain available, but customer replies could not be checked.
       No new response or delivery is confirmed.
     </p>:null}
     {repliesState==="VERIFIED"&&replies.length===0?<p role="status">
       No in-app customer-service replies have been delivered to your account yet.
       This does not mean email or SMS delivery is enabled.
     </p>:null}
    </section>
   </>:null}
  </div>
 </main>;
}
