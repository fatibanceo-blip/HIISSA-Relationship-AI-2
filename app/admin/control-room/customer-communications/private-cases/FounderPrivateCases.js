"use client";
// HIISSA R190: independent Founder-only, metadata-only STAGING case list.
// Original aggregate-only Founder Overview, customer messages and staff permissions stay untouched.
import Link from "next/link";
import {useCallback,useEffect,useState} from "react";
import {createClient} from "@supabase/supabase-js";
import {formatHiissaGlobalRecordTime} from "../../../../../lib/hiissa-record-time.js";

const API="/api/admin/control-room/customer-communications/private-intake-selector";
const RETURN="/admin/control-room/customer-communications";
let browserClient=null;
function existingSessionClient(){
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY||process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if(!url||!key)return null;
  if(!browserClient)browserClient=createClient(url,key);
  return browserClient;
}
function classifyUnavailable(http,body){
  if(http===401||body?.status==="UNAUTHENTICATED")return "Your Founder sign-in is required. No customer case was displayed.";
  if(http===403||body?.status==="FOUNDER_GATE_REQUIRED")return "Founder-only access was not verified. No customer case was displayed.";
  if(http===404)return "This private view is unavailable outside the approved Staging environment.";
  if(http===503)return "The protected Staging case source is unavailable. No information has been changed.";
  return "The source could not be verified. No case information was displayed.";
}
const field={background:"#fffefa",border:"1px solid #d7e5d9",borderRadius:16,padding:18};
const note={color:"#4b6155",fontSize:14,lineHeight:1.6};
export default function FounderPrivateCases(){
  const [state,setState]=useState({loading:true,verified:false,needsSignIn:false,items:[],more:false,error:""});
  const [revision,setRevision]=useState(0);
  const refresh=useCallback(()=>setRevision(n=>n+1),[]);
  useEffect(()=>{
    let active=true;
    const controller=new AbortController();
    async function read(){
      setState({loading:true,verified:false,needsSignIn:false,items:[],more:false,error:""});
      try{
        const client=existingSessionClient();
        if(!client)throw Error("Secure Staging sign-in is unavailable. No case was displayed.");
        const {data,error}=await client.auth.getSession();
        if(error||!data?.session?.access_token){
          const reason=Error("This browser is not signed in to your existing Founder account. Sign in through the original Founder Control Room, then return to these case references.");
          reason.name="FounderSignInRequired";
          throw reason;
        }
        const res=await fetch(API,{
          method:"GET",cache:"no-store",signal:controller.signal,
          headers:{Authorization:"Bearer "+data.session.access_token}
        });
        const body=await res.json().catch(()=>null);
        if(!res.ok||body?.status!=="PRIVATE_STAGING_SELECTOR_READ_ONLY"||
          body?.audience!=="ORIGINAL_FOUNDER_ONLY"||
          body?.caseMetadataOnly!==true||
          body?.productionEffectEnabled!==false||
          body?.externalDeliveryPerformed!==false||
          !Array.isArray(body?.items)||
          body.items.length>20){
          throw Error(classifyUnavailable(res.status,body));
        }
        const safeItems=body.items.map(item=>({
          requestId:typeof item?.requestId==="string"?item.requestId:null,
          version:Number.isSafeInteger(item?.version)?item.version:null,
          lifecycleState:typeof item?.lifecycleState==="string"?item.lifecycleState:null,
          acknowledgementState:typeof item?.acknowledgementState==="string"?item.acknowledgementState:null,
          assignedDepartment:typeof item?.assignedDepartment==="string"?item.assignedDepartment:null,
          receivedAt:typeof item?.receivedAt==="string"?item.receivedAt:null
        }));
        if(safeItems.some(item=>!item.requestId||item.version===null||
          !item.lifecycleState||!item.acknowledgementState||!item.receivedAt))
          throw Error("Protected case details could not be verified.");
        if(active)setState({
          loading:false,verified:true,needsSignIn:false,items:safeItems,
          more:body.additionalResultsNotShown===true,error:""
        });
      }catch(error){
        if(active&&error?.name!=="AbortError")setState({
          loading:false,verified:false,needsSignIn:error?.name==="FounderSignInRequired",items:[],more:false,
          error:String(error?.message||"The source is unavailable.")
        });
      }
    }
    read();
    return ()=>{active=false;controller.abort();};
  },[revision]);
  return <main style={{
    maxWidth:920,margin:"0 auto",minHeight:"100vh",padding:"24px clamp(16px,4vw,42px) 70px",
    background:"#f5f8f2",color:"#244c3a",fontFamily:"system-ui, sans-serif"
  }}>
    <nav aria-label="Founder private handling navigation" style={{display:"flex",gap:22,flexWrap:"wrap"}}>
      <Link href={RETURN} style={{color:"#174a36",fontWeight:750}}>← Back to Customer Communication Centre</Link>
      <Link href="/admin/control-room?view=overview" style={{color:"#174a36"}}>Founder Overview</Link>
    </nav>
    <p style={{fontSize:12,fontWeight:800,letterSpacing:1.2,marginTop:30}}>FOUNDER CONTROL ROOM · PRIVATE STAGING REFERENCE VIEW</p>
    <h1 style={{fontSize:"clamp(25px,5vw,38px)",marginBottom:12}}>Customer support case references</h1>
    <p style={note}>This is a separate private Founder view for verified support case references and workflow status. It does not display customer messages, names, email addresses, emotional conversations or private account details. The existing aggregate Founder Overview remains unchanged.</p>
    <div style={{display:"flex",alignItems:"center",gap:12,margin:"22px 0",flexWrap:"wrap"}}>
      <button type="button" onClick={refresh} disabled={state.loading}
        style={{background:"#225f44",color:"white",border:0,borderRadius:12,padding:"13px 19px",
          minHeight:48,fontSize:15,fontWeight:750,opacity:state.loading?.6:1}}>
        {state.loading?"Checking secure source…":"Refresh case references"}
      </button>
      <span role="status" aria-live="polite" style={{fontWeight:700}}>
        {state.loading?"Checking…":state.needsSignIn?"SIGN IN REQUIRED":state.verified?"VERIFIED SOURCE · STAGING ONLY":"SOURCE UNAVAILABLE"}
      </span>
    </div>
    {state.error?<section role="alert" style={{...field,borderColor:"#bd8557",background:"#fff5ea"}}>
      <strong>Private case references are not available</strong>
      <p>{state.error}</p>
      {state.needsSignIn?<p><Link href="/admin/login" style={{color:"#174a36",fontWeight:800}}>Open existing Founder sign-in →</Link></p>:null}
      <p style={note}>No case was edited, assigned, acknowledged or sent.</p>
    </section>:null}
    {state.verified&&state.items.length===0?<section style={field} role="status">
      No customer support case references were returned by the verified Staging source.
    </section>:null}
    {state.verified&&state.items.length>0?<section aria-label="Verified customer support case references">
      <h2 style={{fontSize:20}}>{state.items.length} case reference{state.items.length===1?"":"s"} shown</h2>
      <div style={{display:"grid",gap:13}}>
      {state.items.map(item=><article key={item.requestId} style={field}>
        <h3 style={{fontSize:16,margin:"0 0 10px",overflowWrap:"anywhere"}}>Case reference: {item.requestId}</h3>
        <dl style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(190px,1fr))",gap:12,margin:0}}>
          {[
            ["Workflow state",item.lifecycleState],
            ["Acknowledgement",item.acknowledgementState],
            ["Assigned department",item.assignedDepartment||"Not assigned"],
            ["Record version",String(item.version)],
            ["Received",formatHiissaGlobalRecordTime(item.receivedAt)]
          ].map(([term,value])=><div key={term}>
            <dt style={note}>{term}</dt>
            <dd style={{margin:0,fontWeight:650,overflowWrap:"anywhere"}}>{value}</dd>
          </div>)}
        </dl>
      </article>)}
      </div>
      {state.more?<p role="status">Showing the latest 20 references. Older records may exist; this is not a complete total.</p>:null}
    </section>:null}
    <aside style={{...field,marginTop:24}}>
      <strong>Safety and next service steps</strong>
      <p style={note}>This screen is read-only. Assigning a case, preparing human replies and sending acknowledgements belong to the separately controlled customer service workflow. No outgoing customer message or staff access change is triggered here.</p>
      <Link href="/admin/control-room?view=overview" style={{color:"#174a36",fontWeight:750}}>
        Open existing Founder Alerts and Activity Timeline →
      </Link>
    </aside>
  </main>;
}
