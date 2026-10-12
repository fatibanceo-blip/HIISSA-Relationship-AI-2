"use client";

import {useEffect,useState} from "react";
import Link from "next/link";
import {createClient} from "@supabase/supabase-js";
import styles from "./page.module.css";

// Approved existing Founder Control Room modules, identity and canonical sources.
// The same original Founder-only APIs provide specialist detail and incident truth.
// No direct database read, duplicate incident feed or customer outgoing action.
const CENTRES=Object.freeze({
 customer:Object.freeze({
   id:"customer-communication-service-level-centre",
   label:"Customer Communication & Service-Level Centre",
   api:"/api/admin/control-room/customer-communications",
   href:"/admin/control-room/customer-communications",
   owner:"Overview / Feedback & Recommendations / Users & Identity / Failures & Reliability"
 }),
 staff:Object.freeze({
   id:"staff-trust-training-access-review",
   label:"Staff Trust, Training & Access Review",
   api:"/api/admin/control-room/staff-trust-review",
   href:"/admin/control-room/staff-trust-review",
   owner:"Staff & Workspaces / Users & Identity / Security & Audit"
 })
});
const unverified=(status="SOURCE UNAVAILABLE")=>({
 status,verified:false,incidents:null,checkedAt:null,detail:"Authorised source not verified. Do not assume the feature is healthy or that there are no incidents.",
 next:"Use the original Founder sign-in and retry this source check."
});

export default function FounderOperationalCentresDashboard({authenticated=false,kind="customer"}){
 const centre=CENTRES[kind];
 const [state,setState]=useState(()=>unverified("NOT CHECKED"));
 const [refresh,setRefresh]=useState(0);
 const [busy,setBusy]=useState(false);
 useEffect(()=>{
   if(!centre||!authenticated)return undefined;
   let active=true;
   async function verify(){
     if(active){setBusy(true);setState(unverified("CHECKING"));}
     try{
       if(!process.env.NEXT_PUBLIC_SUPABASE_URL||!process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)
         throw Error("config");
       const client=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
       const {data:{session},error}=await client.auth.getSession();
       if(error||!session?.access_token)throw Error("session");
       const response=await fetch(centre.api,{
         method:"GET",cache:"no-store",credentials:"same-origin",
         headers:{Authorization:"Bearer "+session.access_token}
       });
       const data=await response.json().catch(()=>null);
       if(!response.ok||data?.status!=="MONITORING"||data?.registryId!==centre.id||
          data?.canonicalIncidentFeedVerified!==true||data?.productionEffectEnabled!==false||
          !Number.isSafeInteger(data?.openIncidentCount)||data.openIncidentCount<0)
         throw Error("source");
       if(active)setState({
         status:"MONITORING · STAGING SOURCE VERIFIED",
         verified:true,incidents:data.openIncidentCount,checkedAt:data.checkedAt||null,
         detail:kind==="customer"
           ? "Original internal Customer Support source verified. Real incoming customer messages: NOT CONNECTED. Automatic acknowledgement: NOT ACTIVE. Approved human-response deadline: NOT VERIFIED."
           : "Original Founder staff-review source verified. Real required training: NOT CONNECTED. Staff training library and My Training: NOT COMPLETED.",
         next:kind==="customer"
           ? "Complete the approved genuine customer message lifecycle, service deadlines, safe recovery and Founder testing before activation."
           : "Complete the approved course library, staff assignments and verified employee access before claiming real training completion."
       });
     }catch{
       if(active)setState(unverified());
     }finally{if(active)setBusy(false);}
   }
   verify();
   return ()=>{active=false;};
 },[authenticated,kind,refresh,centre]);

 if(!centre)return null;
 return <section id={"founder-operational-"+kind} className={styles.section} aria-label={centre.label+" verified Founder operational status"}>
   <div className={styles.sectionHeading}>
     <div><div className={styles.kicker}>EXISTING FOUNDER CONTROL ROOM · STAGING ONLY</div>
       <h3>{centre.label}</h3></div>
   </div>
   <p className={styles.sectionCopy}>Connected to its approved original operational source, Registry identity and shared incident evidence. A readable source is not certification of a complete customer or staff feature.</p>
   <p><strong>Owner:</strong> {centre.owner}</p>
   <p role="status" aria-live="polite"><strong>Current verified status:</strong> {authenticated?state.status:"FOUNDER SIGN-IN REQUIRED"}</p>
   <p>{state.detail}</p>
   <p><strong>Existing unresolved feature incidents:</strong> {state.verified
     ? String(state.incidents)+" recorded in the shared canonical source (zero does not prove full functionality)."
     : "UNKNOWN — source not verified."}</p>
   <p><strong>What HIISSA did:</strong> {state.verified
     ? "Checked the protected original source and shared incident count; made no staff, customer or Production changes."
     : "No reliable source verification was completed; no repair or external action was attempted."}</p>
   <p><strong>Founder action / next:</strong> {state.next}</p>
   {state.verified&&state.checkedAt?<p><small>Source last checked: {new Date(state.checkedAt).toLocaleString()}</small></p>:null}
   <div style={{display:"flex",gap:12,alignItems:"center",flexWrap:"wrap",marginTop:12}}>
     <button type="button" className={styles.headerTool} disabled={!authenticated||busy} onClick={()=>setRefresh(v=>v+1)}>
       {busy?"Checking…":"Refresh verified status"}
     </button>
     {authenticated
      ? <Link className={styles.sectionReturnLink} href={centre.href}>Open {centre.label} →</Link>
      : <span>Available after existing Founder sign-in.</span>}
   </div>
 </section>;
}
