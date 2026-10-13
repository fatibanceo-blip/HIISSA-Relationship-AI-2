"use client";
// HIISSA R190: independent Founder-only, metadata-only STAGING case list.
// Original aggregate-only Founder Overview, customer messages and staff permissions stay untouched.
import Link from "next/link";
import {useCallback,useEffect,useRef,useState} from "react";
import {createClient} from "@supabase/supabase-js";
import {formatHiissaGlobalRecordTime} from "../../../../../lib/hiissa-record-time.js";

const API="/api/admin/control-room/customer-communications/private-intake-selector";
const ORIGINAL_OVERSIGHT="/api/admin/control-room/customer-communications";
const ROUTE_ACTION="/api/admin/control-room/customer-communications/route-department";
const DRAFT_ACTION="/api/admin/control-room/customer-communications/reply-draft";
const AI_ASSIST_ACTION=DRAFT_ACTION+"/assist";
const APPROVE_ACTION=DRAFT_ACTION+"/approve";
const IN_APP_DELIVERY_ACTION=DRAFT_ACTION+"/deliver";
const REGISTRY_ID="customer-communication-service-level-centre";
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
  const [state,setState]=useState({loading:true,verified:false,needsSignIn:false,items:[],more:false,error:"",oversight:null,oversightError:""});
  const [revision,setRevision]=useState(0);
  const [routeReviewId,setRouteReviewId]=useState(null);
  const [routeBusy,setRouteBusy]=useState(false);
  const [routeFeedback,setRouteFeedback]=useState("");
  const [routeFeedbackError,setRouteFeedbackError]=useState(false);
  const routeVerification=useRef(null);
  const draftWriteBusy=useRef(false);
  const aiWriteBusy=useRef(false);
  const approvalWriteBusy=useRef(false);
  const deliveryWriteBusy=useRef(false);
  const emptyDraft=()=>({
    caseId:null,caseVersion:null,draftVersion:0,text:"",savedText:"",
    loading:false,saving:false,assisting:false,approving:false,
    savedAt:null,approvedAt:null,approvalStatus:"NOT_APPROVED",
    approvalReview:false,founderCheck:"",customerIssueTopic:"",
    customerQuestionPreview:"",error:"",feedback:"",
    originalApprovalId:null,deliveryGate:"NOT_CHECKED",deliveryReview:false,
    delivering:false,deliveryStatus:"NOT_DELIVERED",deliveryAt:null
  });
  const [draft,setDraft]=useState(emptyDraft);
  const closeDraft=()=>{
    if(!draftWriteBusy.current&&!aiWriteBusy.current&&
      !approvalWriteBusy.current&&!deliveryWriteBusy.current)
      setDraft(emptyDraft());
  };
  async function prepareWithHIISSA(item,expectedDraftVersion){
    if(aiWriteBusy.current||draftWriteBusy.current||approvalWriteBusy.current||
      !state.verified||item?.assignedDepartment!=="customer_support")return;
    aiWriteBusy.current=true;
    setDraft(prev=>({...prev,assisting:true,error:"",feedback:"HIISSA is preparing a response for your review…"}));
    try{
      const client=existingSessionClient();
      const {data,error}=client?await client.auth.getSession():{error:true};
      if(error||!data?.session?.access_token)
        throw Error("Your original Founder sign-in is required. No AI response was prepared.");
      const response=await fetch(AI_ASSIST_ACTION,{
        method:"POST",cache:"no-store",credentials:"same-origin",
        headers:{"Content-Type":"application/json",Authorization:"Bearer "+data.session.access_token},
        body:JSON.stringify({action:"prepare_customer_reply_with_hiissa",
          requestId:item.requestId,caseVersion:item.version,draftVersion:expectedDraftVersion})
      });
      const result=await response.json().catch(()=>null);
      if(!response.ok||result?.status!=="HIISSA_REPLY_DRAFT_SAVED_AND_AUDITED"||
        result?.registryId!==REGISTRY_ID||
        result?.caseVersion!==item.version||
        result?.draftVersion!==expectedDraftVersion+1||
        result?.founderReviewRequired!==true||
        result?.founderApprovalPerformed!==false||
        result?.humanReplySent!==false||
        result?.externalDeliveryPerformed!==false||
        result?.productionEffectEnabled!==false||
        typeof result?.draftReply!=="string"||
        result.draftReply.length<8||result.draftReply.length>1400)
        throw Error(response.status===409?
          "The case or draft has changed. Close and reopen it to load the current saved version.":
          "HIISSA could not safely prepare and save a response. No customer reply was sent.");
      // Never show success solely on an OpenAI text or POST response: original
      // Founder-private GET must independently match stored words and version.
      const read=await fetch(DRAFT_ACTION+"?requestId="+encodeURIComponent(item.requestId),{
        method:"GET",cache:"no-store",headers:{Authorization:"Bearer "+data.session.access_token}
      });
      const check=await read.json().catch(()=>null);
      if(!read.ok||check?.status!=="FOUNDER_PRIVATE_DRAFT_READ"||
        check?.caseVersion!==item.version||
        check?.draftVersion!==result.draftVersion||
        check?.draftText!==result.draftReply||
        check?.approvalStatus!=="NOT_APPROVED"||
        check?.humanReplySent!==false||check?.customerContentDelivered!==false)
        throw Error("HIISSA's proposed reply needs a saved-record recheck. Reopen this case; do not generate again blindly.");
      setDraft(prev=>({...prev,
        draftVersion:check.draftVersion,
        text:check.draftText,savedText:check.draftText,
        savedAt:check.draftSavedAt,
        approvedAt:null,approvalStatus:"NOT_APPROVED",approvalReview:false,
        founderCheck:typeof result.founderCheck==="string"?result.founderCheck:"",
        customerIssueTopic:typeof result.customerIssueTopic==="string"?result.customerIssueTopic:"",
        customerQuestionPreview:typeof result.customerQuestionPreview==="string"?result.customerQuestionPreview:"",
        assisting:false,loading:false,error:"",
        feedback:"HIISSA prepared and saved a suggested response. Read, edit if necessary and approve. Nothing has been sent."}));
    }catch(e){
      setDraft(prev=>({...prev,assisting:false,loading:false,
        error:e?.message||"HIISSA is temporarily unavailable. You may write your own draft; no reply was sent.",
        feedback:""}));
    }finally{aiWriteBusy.current=false;}
  }
  async function approveDraft(item){
    if(draftWriteBusy.current||aiWriteBusy.current||approvalWriteBusy.current||
      deliveryWriteBusy.current||
      !state.verified||draft.caseId!==item.requestId||
      draft.caseVersion!==item.version||draft.draftVersion<1||
      !draft.approvalReview||draft.text!==draft.savedText||
      draft.approvalStatus!=="NOT_APPROVED"||draft.saving||draft.assisting)return;
    approvalWriteBusy.current=true;
    setDraft(prev=>({...prev,approving:true,error:"",feedback:"Recording your decision in the original Founder approval system…"}));
    try{
      const client=existingSessionClient();
      const {data,error}=client?await client.auth.getSession():{error:true};
      if(error||!data?.session?.access_token)
        throw Error("Founder sign-in is required. Approval not confirmed.");
      const response=await fetch(APPROVE_ACTION,{
        method:"POST",cache:"no-store",credentials:"same-origin",
        headers:{"Content-Type":"application/json",Authorization:"Bearer "+data.session.access_token},
        body:JSON.stringify({action:"approve_customer_reply_draft",
          requestId:item.requestId,caseVersion:item.version,draftVersion:draft.draftVersion})
      });
      const result=await response.json().catch(()=>null);
      if(!response.ok||result?.status!=="FOUNDER_APPROVED_PENDING_EXECUTION_NOT_SENT"||
        result?.approvalRecorded!==true||result?.caseVersion!==item.version||
        result?.draftVersion!==draft.draftVersion||
        result?.humanReplySent!==false||
        result?.externalDeliveryPerformed!==false||
        result?.productionEffectEnabled!==false)
        throw Error("The Founder approval could not be confirmed. Reopen the case to check before trying again.");
      // Independent canonical approval source readback, not just optimistic UI.
      const read=await fetch(DRAFT_ACTION+"?requestId="+encodeURIComponent(item.requestId),{
        method:"GET",cache:"no-store",
        headers:{Authorization:"Bearer "+data.session.access_token}
      });
      const check=await read.json().catch(()=>null);
      if(!read.ok||check?.status!=="FOUNDER_PRIVATE_DRAFT_READ"||
        check?.approvalStatus!=="FOUNDER_APPROVED_PENDING_EXECUTION_NOT_SENT"||
        check?.draftVersion!==draft.draftVersion||
        check?.caseVersion!==item.version||
        check?.draftText!==draft.savedText||
        check?.humanReplySent!==false||check?.customerContentDelivered!==false)
        throw Error("Approval was submitted but needs independent verification. Reopen the case and do not approve twice.");
      setDraft(prev=>({...prev,approving:false,approvalReview:false,
        approvalStatus:check.approvalStatus,approvedAt:check.approvedAt,
        originalApprovalId:check.approvalId||null,
        feedback:"Your response is APPROVED and recorded in the original Founder approval system. It has NOT been sent to the customer.",
        error:""}));
    }catch(e){
      setDraft(prev=>({...prev,approving:false,approvalReview:false,feedback:"",
        error:e?.message||"Founder approval is not verified. Nothing has been sent."}));
    }finally{approvalWriteBusy.current=false;}
  }
  async function confirmInAppDelivery(item){
    // A separate Founder activation gate is required IN ADDITION TO the
    // existing human L3 wording approval and two deliberate Founder clicks.
    if(deliveryWriteBusy.current||draftWriteBusy.current||
       aiWriteBusy.current||approvalWriteBusy.current||
       draft.deliveryGate!=="READY_FOR_EXPLICIT_FOUNDER_ACTION"||
       draft.deliveryReview!==true||
       draft.caseId!==item.requestId||draft.caseVersion!==item.version||
       draft.approvalStatus!=="FOUNDER_APPROVED_PENDING_EXECUTION_NOT_SENT"||
       !draft.originalApprovalId||draft.draftVersion<1||
       draft.text!==draft.savedText||!state.verified)return;
    deliveryWriteBusy.current=true;
    setDraft(prev=>({...prev,delivering:true,error:"",
      feedback:"Checking the explicitly activated Staging-only in-app delivery…"}));
    try{
      const client=existingSessionClient();
      const {data,error}=client?await client.auth.getSession():{error:true};
      if(error||!data?.session?.access_token)
        throw Error("Founder sign-in required; in-app delivery was not confirmed.");
      const response=await fetch(IN_APP_DELIVERY_ACTION,{
        method:"POST",cache:"no-store",credentials:"same-origin",
        headers:{"Content-Type":"application/json",
          Authorization:"Bearer "+data.session.access_token},
        body:JSON.stringify({action:"deliver_approved_in_app_reply",
          requestId:item.requestId,approvalId:draft.originalApprovalId,
          caseVersion:item.version,draftVersion:draft.draftVersion})
      });
      const result=await response.json().catch(()=>null);
      if(!response.ok||!["DELIVERED_IN_APP_AND_AUDITED",
          "ALREADY_DELIVERED_IN_APP"].includes(result?.status)||
        result?.registryId!==REGISTRY_ID||result?.replyDelivered!==true||
        result?.channel!=="IN_APP_STAGING"||
        result?.emailSent!==false||result?.smsSent!==false||
        result?.productionEffectEnabled!==false)
        throw Error(response.status===403?
          "In-app delivery is not activated or permitted. No send was confirmed.":
          "The approved Staging in-app response could not be confirmed. Reopen the case; do not repeat blindly.");
      // Independently verify original Founder-private persisted in-app receipt.
      const after=await fetch(DRAFT_ACTION+"?requestId="+encodeURIComponent(item.requestId),{
        method:"GET",cache:"no-store",
        headers:{Authorization:"Bearer "+data.session.access_token}
      });
      const stored=await after.json().catch(()=>null);
      if(!after.ok||stored?.status!=="FOUNDER_PRIVATE_DRAFT_READ"||
        stored?.inAppDeliveryStatus!=="DELIVERED_IN_APP"||
        stored?.draftVersion!==draft.draftVersion||
        stored?.draftText!==draft.savedText||
        stored?.caseVersion!==item.version+1)
        throw Error("Delivery may have occurred but the saved receipt could not be independently verified. Do not repeat. Contact original Founder Alerts.");
      setDraft(prev=>({...prev,delivering:false,deliveryReview:false,
        deliveryStatus:"DELIVERED_IN_APP",
        deliveryAt:stored.inAppDeliveredAt||result.deliveredAt||null,
        approvalStatus:"FOUNDER_APPROVED_DELIVERED_IN_APP",
        feedback:"Original audited Staging IN-APP customer reply verified. No email, SMS or Production delivery.",
        error:""}));
      setRevision(n=>n+1);
    }catch(e){
      setDraft(prev=>({...prev,delivering:false,deliveryReview:false,feedback:"",
        error:e?.message||"Staging in-app delivery not verified. Do not retry blindly."}));
    }finally{deliveryWriteBusy.current=false;}
  }
  async function openDraft(item){
    if(draftWriteBusy.current||!state.verified||!item?.assignedDepartment||
      item.assignedDepartment!=="customer_support")return;
    setDraft({...emptyDraft(),caseId:item.requestId,caseVersion:item.version,loading:true});
    try{
      const client=existingSessionClient();
      const {data,error}=client?await client.auth.getSession():{error:true};
      if(error||!data?.session?.access_token)throw Error("Founder session required; no reply draft was accessed.");
      const response=await fetch(DRAFT_ACTION+"?requestId="+encodeURIComponent(item.requestId),{
        method:"GET",cache:"no-store",headers:{Authorization:"Bearer "+data.session.access_token}
      });
      const body=await response.json().catch(()=>null);
      if(!response.ok||body?.status!=="FOUNDER_PRIVATE_DRAFT_READ"||
        body?.registryId!==REGISTRY_ID||body?.audience!=="ORIGINAL_FOUNDER_ONLY"||
        body?.productionEffectEnabled!==false||body?.humanReplySent!==false||
        body?.customerContentDelivered!==false||
        body?.caseVersion!==item.version||body?.department!=="customer_support"||
        !Number.isSafeInteger(body?.draftVersion)||body.draftVersion<0||
        typeof body?.draftText!=="string"||
        body.draftText.length>2000||
        !["FOUNDER_APPROVED_PENDING_EXECUTION_NOT_SENT","NOT_APPROVED"].includes(body?.approvalStatus))
        throw Error("The existing Founder draft could not be verified. Nothing has been sent.");
      // Exact original Staging-only Founder delivery readiness, no send on read.
      let deliveryGate="NOT_VERIFIED";
      try{
        const responseGate=await fetch(IN_APP_DELIVERY_ACTION,{
          method:"GET",cache:"no-store",
          headers:{Authorization:"Bearer "+data.session.access_token}
        });
        const gate=await responseGate.json().catch(()=>null);
        if(responseGate.ok&&gate?.status==="ORIGINAL_FOUNDER_IN_APP_REPLY_DELIVERY_READINESS"&&
          gate?.registryId===REGISTRY_ID&&gate?.environment==="staging"&&
          gate?.channel==="IN_APP_STAGING"&&
          gate?.emailDeliveryEnabled===false&&gate?.smsDeliveryEnabled===false&&
          gate?.productionEffectEnabled===false&&
          ["NOT_ACTIVATED","READY_FOR_EXPLICIT_FOUNDER_ACTION"].includes(gate?.activationStatus))
          deliveryGate=gate.activationStatus;
      }catch{}
      setDraft({...emptyDraft(),caseId:item.requestId,caseVersion:item.version,
        draftVersion:body.draftVersion,text:body.draftText,savedText:body.draftText,
        savedAt:body.draftSavedAt||null,approvedAt:body.approvedAt||null,
        approvalStatus:body.approvalStatus,originalApprovalId:body.approvalId||null,
        deliveryGate,deliveryStatus:body.inAppDeliveryStatus||"NOT_DELIVERED",
        deliveryAt:body.inAppDeliveredAt||null,
        feedback:body.draftVersion>0?"Saved reply draft loaded. Read and approve if suitable. Nothing was sent.":"HIISSA is preparing a response to the original customer question for your review."});
      // Founder-requested default: reuse EXISTING HIISSA AI to prepare the
      // FIRST reply automatically on opening this case. No send/auto approval.
      if(body.draftVersion===0)await prepareWithHIISSA(item,0);
    }catch(e){
      setDraft(prev=>({...prev,loading:false,saving:false,
        error:e?.message||"Private draft unavailable; no customer response has been sent."}));
    }
  }
  async function saveDraft(item){
    if(draftWriteBusy.current||aiWriteBusy.current||approvalWriteBusy.current||
      deliveryWriteBusy.current||
      draft.loading||draft.saving||draft.assisting||draft.approving||
      draft.caseId!==item.requestId||draft.caseVersion!==item.version||
      !state.verified||item.assignedDepartment!=="customer_support"||
      draft.text.trim().length<8||draft.text.trim().length>2000)return;
    draftWriteBusy.current=true;
    setDraft(prev=>({...prev,saving:true,error:"",feedback:""}));
    try{
      const client=existingSessionClient();
      const {data,error}=client?await client.auth.getSession():{error:true};
      if(error||!data?.session?.access_token)throw Error("Founder session expired. No draft save was confirmed.");
      const message=draft.text.trim();
      const response=await fetch(DRAFT_ACTION,{
        method:"POST",cache:"no-store",credentials:"same-origin",
        headers:{"Content-Type":"application/json",
          Authorization:"Bearer "+data.session.access_token},
        body:JSON.stringify({
          action:"save_founder_private_reply_draft",
          requestId:item.requestId,caseVersion:item.version,
          draftVersion:draft.draftVersion,draftText:message
        })
      });
      const result=await response.json().catch(()=>null);
      if(!response.ok||result?.status!=="PRIVATE_DRAFT_SAVED_AND_AUDITED"||
        result?.registryId!==REGISTRY_ID||
        result?.draftVersion!==draft.draftVersion+1||
        result?.caseVersion!==item.version||
        result?.humanReplySent!==false||
        result?.customerContentDelivered!==false||
        result?.productionEffectEnabled!==false){
        if(response.status===409)
          throw Error("The saved draft changed. Reopen it to review the latest version before trying again.");
        throw Error("Draft save was not independently confirmed. Reopen and check before retrying.");
      }
      // Independently re-read the saved original Founder-private draft; no false PASS.
      const read=await fetch(DRAFT_ACTION+"?requestId="+encodeURIComponent(item.requestId),{
        method:"GET",cache:"no-store",
        headers:{Authorization:"Bearer "+data.session.access_token}
      });
      const check=await read.json().catch(()=>null);
      if(!read.ok||check?.status!=="FOUNDER_PRIVATE_DRAFT_READ"||
        check?.draftVersion!==result.draftVersion||
        check?.caseVersion!==item.version||check?.draftText!==message||
        check?.humanReplySent!==false||check?.customerContentDelivered!==false)
        throw Error("The draft action returned success but saved content could not be independently rechecked. Reopen the draft; do not repeat blindly.");
      setDraft(prev=>({...prev,text:check.draftText,savedText:check.draftText,
        draftVersion:check.draftVersion,savedAt:check.draftSavedAt,
        approvalStatus:check.approvalStatus,approvedAt:check.approvedAt||null,
        approvalReview:false,saving:false,loading:false,error:"",
        feedback:"PRIVATE reply draft saved and verified. Review it and approve when ready. Nothing sent."}));
    }catch(e){
      setDraft(prev=>({...prev,saving:false,loading:false,
        error:e?.message||"Private draft save not confirmed. Check before retrying."}));
    }finally{draftWriteBusy.current=false;}
  }
  const refresh=useCallback(()=>{
    setRouteReviewId(null);
    closeDraft();
    setRevision(n=>n+1);
  },[]);
  function routingAllowed(item){
    return state.verified&&!state.loading&&item?.lifecycleState==="RECEIVED"&&
      item?.acknowledgementState==="NOT_SENT"&&!item?.assignedDepartment&&
      Number.isSafeInteger(item?.version)&&item.version>=1&&
      !routeBusy&&!routeVerification.current;
  }
  async function confirmRoute(item){
    if(!routingAllowed(item)||routeReviewId!==item.requestId)return;
    setRouteBusy(true);
    setRouteFeedback("");
    setRouteFeedbackError(false);
    try{
      const client=existingSessionClient();
      if(!client)throw Error("Existing Founder sign-in is unavailable; no routing attempted.");
      const {data,error}=await client.auth.getSession();
      if(error||!data?.session?.access_token)
        throw Error("The Founder session is missing. Return to the existing Founder sign-in; nothing was routed.");
      // Exactly one previously approved STAGING-only Founder-gated, audit-atomic
      // command. No direct database write, new role, message or acknowledgement.
      const response=await fetch(ROUTE_ACTION,{
        method:"POST",cache:"no-store",credentials:"same-origin",
        headers:{
          "Content-Type":"application/json",
          "Authorization":"Bearer "+data.session.access_token
        },
        body:JSON.stringify({
          action:"route_to_customer_support",
          requestId:item.requestId,
          version:item.version
        })
      });
      const result=await response.json().catch(()=>null);
      if(!response.ok||result?.status!=="RECORDED_AND_AUDITED"||
        result?.department!=="customer_support"||
        result?.lifecycleState!=="RECEIVED"||
        result?.acknowledgementState!=="NOT_SENT"||
        result?.externalDeliveryPerformed!==false||
        result?.productionEffectEnabled!==false||
        result?.version!==item.version+1){
        if(response.status===401)
          throw Error("Founder sign-in expired. Please sign in again. Routing is not confirmed.");
        if(response.status===403)
          throw Error("Founder access or request origin was rejected. Routing is not confirmed.");
        if(response.status===404)
          throw Error("This action is unavailable outside approved Staging. Nothing was routed.");
        if(response.status===409)
          throw Error("This case may have changed since you opened it. Refresh the references before deciding again; no route was confirmed.");
        throw Error("The routing result was not confirmed. Refresh and check the current record before attempting another action.");
      }
      routeVerification.current={id:item.requestId,version:result.version};
      setRouteReviewId(null);
      setRouteFeedback("The original audited Staging route accepted the action. Checking the saved case state…");
      setRevision(n=>n+1);
    }catch(e){
      setRouteFeedbackError(true);
      setRouteFeedback(e?.message||"The route could not be verified. Nothing has been confirmed.");
      setRouteReviewId(null);
    }finally{
      setRouteBusy(false);
    }
  }
  useEffect(()=>{
    let active=true;
    const controller=new AbortController();
    async function read(){
      setState({loading:true,verified:false,needsSignIn:false,items:[],more:false,error:"",oversight:null,oversightError:""});
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
          body?.registryId!==REGISTRY_ID||
          body?.caseMetadataOnly!==true||
          body?.productionEffectEnabled!==false||
          body?.externalDeliveryPerformed!==false||
          body?.humanReplyTargetPolicy!=="FOUNDER_APPROVED_ONE_MINUTE_DESIGN_NOT_LIVE"||
          body?.humanReplyEvidenceSource!=="NOT_CONNECTED"||
          body?.founderEmailNotification!=="NOT_CONFIGURED"||
          body?.founderPhoneNotification!=="NOT_CONFIGURED"||
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
          receivedAt:typeof item?.receivedAt==="string"?item.receivedAt:null,
          humanReplyTargetAt:item?.humanReplyTarget?.verified===true&&
            item?.humanReplyTarget?.designTargetSeconds===60&&
            item?.humanReplyTarget?.replyEvidence==="NOT_CONNECTED"&&
            item?.humanReplyTarget?.liveHumanSla==="NOT_ACTIVE"&&
            typeof item?.humanReplyTarget?.targetAt==="string"
              ?item.humanReplyTarget.targetAt:null,
          humanReplyEvidence:item?.humanReplyTarget?.replyEvidence||null
        }));
        if(safeItems.some(item=>!item.requestId||item.version===null||
          !item.lifecycleState||!item.acknowledgementState||!item.receivedAt||
          !item.humanReplyTargetAt||item.humanReplyEvidence!=="NOT_CONNECTED"))
          throw Error("Protected case details could not be verified.");
        // Reuse the ORIGINAL Founder Control Room's aggregate-only health/incident
        // source. Do not query or duplicate its incident, alert or approval tables.
        let oversight=null;
        let oversightError="";
        try{
          const old=await fetch(ORIGINAL_OVERSIGHT,{
            method:"GET",cache:"no-store",signal:controller.signal,
            headers:{Authorization:"Bearer "+data.session.access_token}
          });
          const oldBody=await old.json().catch(()=>null);
          if(!old.ok||oldBody?.status!=="MONITORING"||
            oldBody?.registryId!==REGISTRY_ID||
            oldBody?.authenticatedIntakePrivacy!=="AGGREGATE_ONLY"||
            oldBody?.canonicalIncidentFeedVerified!==true||
            oldBody?.existingFounderApprovalInbox!=="REUSED_NOT_DUPLICATED"||
            oldBody?.existingAlerts!=="REUSED_NOT_DUPLICATED"||
            oldBody?.productionEffectEnabled!==false||
            !Number.isSafeInteger(oldBody?.openIncidentCount)||
            oldBody.openIncidentCount<0||
            !Number.isSafeInteger(oldBody?.stagingAuthenticatedCustomerRequests))
            throw Error("Shared Founder monitoring source could not be verified.");
          oversight={
            total:oldBody.stagingAuthenticatedCustomerRequests,
            incidents:oldBody.openIncidentCount,
            checkedAt:oldBody.checkedAt||null
          };
        }catch(error){
          if(error?.name==="AbortError")throw error;
          oversightError="Original Founder monitoring could not be verified. Incident counts are unknown; use the existing Founder Alerts for investigation.";
        }
        if(active){
          if(routeVerification.current){
            const expected=routeVerification.current;
            const match=safeItems.find(i=>i.requestId===expected.id);
            if(match&&match.assignedDepartment==="customer_support"&&
               match.version===expected.version&&
               match.lifecycleState==="RECEIVED"&&
               match.acknowledgementState==="NOT_SENT"){
              setRouteFeedback("Verified after refresh: internally routed to Customer Support. No employee assigned, acknowledgement sent or external message delivered.");
              setRouteFeedbackError(false);
            }else{
              setRouteFeedback("The previous route needs independent verification. Refresh the case references; do not repeat the action until its status is clear.");
              setRouteFeedbackError(true);
            }
            routeVerification.current=null;
          }
          setState({
            loading:false,verified:true,needsSignIn:false,items:safeItems,
            more:body.additionalResultsNotShown===true,error:"",oversight,oversightError
          });
        }
      }catch(error){
        if(active&&error?.name!=="AbortError"){
          if(routeVerification.current){
            routeVerification.current=null;
            setRouteFeedbackError(true);
            setRouteFeedback("The routing command returned success, but the saved record could not be independently rechecked. Do not repeat routing until verification succeeds.");
          }
          setState({
            loading:false,verified:false,needsSignIn:error?.name==="FounderSignInRequired",items:[],more:false,oversight:null,oversightError:"",
            error:String(error?.message||"The source is unavailable.")
          });
        }
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
    <p style={note}>This is the protected Founder area of the existing Customer Communication Centre. The case list shows references and status; a reply review can privately show a limited masked issue preview to help the Founder check HIISSA's proposed response. No customer messages or private conversations appear in the original aggregate Founder Overview.</p>
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
    {state.verified?<section aria-label="Existing Founder Control Room operational connection"
      style={{...field,marginBottom:18}}>
      <h2 style={{fontSize:19,marginTop:0}}>Connected to the original Founder Control Room</h2>
      <p style={note}>One Customer Communication Centre · existing Experience Registry · original Admin audit, incident monitoring, Alerts and approval queue. No duplicate dashboard or separate data source.</p>
      {state.oversight?<div role="status">
        <p><strong>Incoming customer support requests recorded in Staging:</strong> {state.oversight.total}</p>
        <p style={note}>These records are available through the original Founder Control Room. The approved Founder email and dedicated-phone customer message alerts still require configuration and delivery testing; no external notification has been sent.</p>
        <p><strong>Open feature incidents in original monitoring:</strong> {state.oversight.incidents} recorded. A zero count does not certify the full service is healthy.</p>
        <p style={note}>Source checked: {state.oversight.checkedAt?formatHiissaGlobalRecordTime(state.oversight.checkedAt):"Timestamp unavailable"}</p>
      </div>:<p role="alert">{state.oversightError||"Shared operational status not verified. Incident counts are unknown."}</p>}
      <Link href="/admin/control-room?view=overview" style={{color:"#174a36",fontWeight:750}}>
        Original Founder Alerts and Activity Timeline →
      </Link>
    </section>:null}
    {routeFeedback?<section role={routeFeedbackError?"alert":"status"} aria-live="polite"
      style={{...field,marginBottom:16,borderColor:routeFeedbackError?"#bd8557":"#9cbca5"}}>
      <strong>{routeFeedbackError?"Routing not verified":"Internal routing verification"}</strong>
      <p style={note}>{routeFeedback}</p>
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
        <section aria-label="Founder-approved one-minute human response target" style={{
          marginTop:16,padding:"12px 14px",borderRadius:12,background:"#f1f5ee",
          border:"1px solid #d3e2d4"
        }}>
          <strong>Human customer-service reply target: within 1 minute</strong>
          <p style={note}>Founder-approved design target, calculated from the original
            request receipt: {formatHiissaGlobalRecordTime(item.humanReplyTargetAt)}.
            The human reply evidence source is not connected yet.
            This is NOT an active or verified human-response SLA, not proof
            of a late employee reply, and not an automatic acknowledgement.</p>
          <p style={note}>Incoming message attention is visible here in the original
            Founder Control Room. Founder email and dedicated-phone notices are
            approved for implementation but have not yet been delivered or activated.</p>
        </section>
        {item.assignedDepartment==="customer_support"?<section
          aria-label="Private Founder customer reply drafting"
          style={{marginTop:15}}>
          {draft.caseId!==item.requestId?<button type="button"
            onClick={()=>openDraft(item)}
            style={{minHeight:48,padding:"12px 16px",borderRadius:12,
              border:"1px solid #286a4f",background:"#fff",color:"#20583f",fontWeight:750}}>
            Open HIISSA-prepared customer reply
          </button>:<div style={{...field,background:"#f4f8f2"}}>
            <strong>HIISSA helps you respond · Founder review and approval</strong>
            <p style={note}>HIISSA reuses the existing Founder Control Room AI to
              prepare a response based on this customer's actual saved question.
              You read it, change any wording you wish, and approve it.
              The reply stays private in Staging; approval is NOT delivery.</p>
            {draft.assisting?<p role="status">HIISSA is preparing and saving a helpful response…</p>:null}
            {draft.customerIssueTopic?<section aria-label="Limited masked customer issue context"
              style={{...field,margin:"12px 0",background:"#fff"}}>
              <strong>Customer issue for your review (limited, masked preview)</strong>
              <p style={note}><strong>Topic:</strong> {draft.customerIssueTopic}</p>
              <p style={note}>{draft.customerQuestionPreview}</p>
              <p style={note}>Personal contact details are masked where recognised.
                Check the original issue before making commitments.</p>
            </section>:null}
            {draft.founderCheck?<p style={note}><strong>HIISSA review note:</strong> {draft.founderCheck}</p>:null}
            {draft.loading?<p role="status">Checking protected saved draft…</p>:null}
            {draft.error?<p role="alert">{draft.error}</p>:null}
            {draft.feedback?<p role="status">{draft.feedback}</p>:null}
            {!draft.loading?<div>
              {draft.draftVersion===0&&!draft.assisting?<button type="button"
                onClick={()=>prepareWithHIISSA(item,0)}
                style={{marginBottom:16,minHeight:48,padding:"12px 16px",
                  border:"1px solid #286a4f",borderRadius:12,color:"#20583f",background:"#fff",
                  fontWeight:750}}>
                Try HIISSA's response assistance
              </button>:null}
              <label htmlFor="founder-customer-reply-draft" style={{display:"block",marginBottom:8,fontWeight:700}}>
                {draft.draftVersion>0?"Review and edit the suggested reply":"Write a private reply yourself"}
              </label>
              <textarea id="founder-customer-reply-draft"
                value={draft.text} maxLength={2000} rows={5} disabled={draft.saving||draft.assisting||draft.approving||draft.delivering||draft.deliveryStatus==="DELIVERED_IN_APP"}
                onChange={e=>setDraft(prev=>({...prev,text:e.target.value,
                  approvalReview:false,feedback:"",error:""}))}
                style={{width:"100%",maxWidth:"100%",borderRadius:12,
                  border:"1px solid #a5c1ad",background:"white",
                  padding:12,fontSize:16,boxSizing:"border-box"}}
              />
              <p style={note}>Characters: {draft.text.length}/2000 · Draft version:
                {draft.draftVersion} · Saved: {draft.savedAt?
                  formatHiissaGlobalRecordTime(draft.savedAt):"Not saved"}.</p>
              <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
                <button type="button" onClick={()=>saveDraft(item)}
                  disabled={draft.saving||draft.assisting||draft.approving||draft.delivering||
                    draft.deliveryStatus==="DELIVERED_IN_APP"||
                    draft.text===draft.savedText||
                    draft.text.trim().length<8||draft.text.trim().length>2000}
                  style={{minHeight:48,padding:"12px 16px",
                    border:0,borderRadius:12,color:"#fff",background:"#20583f",fontWeight:750,
                    opacity:(draft.saving||draft.assisting||draft.approving||
                      draft.text===draft.savedText||draft.text.trim().length<8)?0.6:1}}>
                  {draft.saving?"Saving private draft…":"Save private draft — do not send"}
                </button>
                <button type="button" onClick={closeDraft} disabled={draft.saving||draft.assisting||draft.approving||draft.delivering}
                  style={{minHeight:48,padding:"12px 16px",borderRadius:12,
                    border:"1px solid #96b8a0",color:"#20583f",background:"white"}}>
                  Close draft
                </button>
              </div>
              {draft.approvalStatus==="FOUNDER_APPROVED_PENDING_EXECUTION_NOT_SENT"&&
                draft.text===draft.savedText?<section role="status"
                  style={{...field,background:"#edf4e9",marginTop:16}}>
                  <strong>Founder approved · not sent</strong>
                  <p style={note}>The exact saved draft version {draft.draftVersion}
                    has been recorded in the original Founder approval queue.
                    In-app delivery is separately gated and not automatically activated.
                    Email and SMS delivery are inactive.</p>
                  <p style={note}>Approved: {draft.approvedAt?
                    formatHiissaGlobalRecordTime(draft.approvedAt):"Timestamp not available"}</p>
                </section>:null}
              {draft.approvalStatus==="FOUNDER_APPROVED_PENDING_EXECUTION_NOT_SENT"&&
                draft.text===draft.savedText?<section
                  aria-label="Staging in-app customer response delivery controls"
                  style={{...field,marginTop:16,background:"#f8faf7"}}>
                  <strong>Customer reply delivery · separate Staging activation gate</strong>
                  {draft.deliveryGate!=="READY_FOR_EXPLICIT_FOUNDER_ACTION"?
                    <p role="status" style={note}>IN-APP DELIVERY NOT ACTIVE.
                      Your Founder approval is safely recorded. Sending the reply
                      through the customer's original My Support Requests requires
                      separate Staging-only activation and further practical testing.
                      No email, SMS or Production message is enabled.</p>:
                    !draft.originalApprovalId?<p role="alert" style={note}>
                      Exact original Founder approval could not be verified.
                      Delivery is unavailable; reopen and check the case.</p>:
                    !draft.deliveryReview?<button type="button"
                      onClick={()=>setDraft(prev=>({...prev,deliveryReview:true,error:""}))}
                      style={{minHeight:48,padding:"12px 16px",borderRadius:12,
                        border:"1px solid #286a4f",background:"white",
                        color:"#20583f",fontWeight:750}}>
                      Review in-app-only delivery in Staging
                    </button>:
                    <div style={{...field,background:"#edf4e9"}}>
                      <strong>Confirm delivery to this customer's in-app Support Requests?</strong>
                      <p style={note}>This will make the EXACT approved draft visible
                        only in this customer's signed-in Staging My Support Requests,
                        record one original Admin audit and update this case status.
                        It does NOT send email, SMS, phone notifications or any
                        Production message. This action cannot be unsent.</p>
                      <div style={{display:"flex",flexWrap:"wrap",gap:10}}>
                        <button type="button" disabled={draft.delivering}
                          onClick={()=>confirmInAppDelivery(item)}
                          style={{minHeight:48,padding:"12px 16px",
                            border:0,borderRadius:12,color:"white",
                            background:"#20583f",fontWeight:750}}>
                          {draft.delivering?"Checking in-app delivery…":
                            "Confirm Staging-only in-app delivery"}
                        </button>
                        <button type="button" disabled={draft.delivering}
                          onClick={()=>setDraft(prev=>({...prev,deliveryReview:false}))}
                          style={{minHeight:48,padding:"12px 16px",borderRadius:12,
                            background:"white",color:"#20583f",
                            border:"1px solid #96b8a0"}}>
                          Cancel — do not deliver
                        </button>
                      </div>
                    </div>}
                </section>:null}
              {draft.deliveryStatus==="DELIVERED_IN_APP"?<section role="status"
                style={{...field,background:"#eaf3e9",marginTop:16}}>
                <strong>Verified in-app customer reply · Staging only</strong>
                <p style={note}>The original customer-owned support reply source
                  records a delivered message. No email/SMS or Production message
                  was sent. Delivered: {draft.deliveryAt?
                    formatHiissaGlobalRecordTime(draft.deliveryAt):
                    "Timestamp unavailable"}.</p>
              </section>:null}
              {draft.draftVersion>0&&draft.deliveryStatus!=="DELIVERED_IN_APP"&&draft.approvalStatus==="NOT_APPROVED"&&
                draft.text===draft.savedText&&!draft.saving&&!draft.assisting?
                <section aria-label="Founder reply approval" style={{marginTop:16}}>
                  {!draft.approvalReview?<button type="button"
                    onClick={()=>setDraft(prev=>({...prev,approvalReview:true,error:""}))}
                    style={{minHeight:48,padding:"12px 16px",background:"#20583f",
                      border:0,borderRadius:12,color:"white",fontWeight:750}}>
                    Review and approve this reply
                  </button>:<div style={{...field,background:"#f0f6ef"}}>
                    <strong>Approve this exact saved response?</strong>
                    <p style={note}>You have read the response and are approving its
                      wording for later controlled customer delivery.
                      This records an L3 Founder approval in the ORIGINAL queue.
                      It does not send any message, confirm a one-minute human
                      response or change staff permissions.</p>
                    <div style={{display:"flex",flexWrap:"wrap",gap:10}}>
                      <button type="button" disabled={draft.approving}
                        onClick={()=>approveDraft(item)}
                        style={{minHeight:48,padding:"12px 16px",background:"#20583f",
                          border:0,borderRadius:12,color:"white",fontWeight:750}}>
                        {draft.approving?"Recording approval…":"Approve this reply — do not send"}
                      </button>
                      <button type="button" disabled={draft.approving}
                        onClick={()=>setDraft(prev=>({...prev,approvalReview:false}))}
                        style={{minHeight:48,padding:"12px 16px",borderRadius:12,
                          border:"1px solid #96b8a0",background:"white",color:"#20583f"}}>
                        Cancel approval
                      </button>
                    </div>
                  </div>}
                </section>:null}
              {draft.approvalStatus==="FOUNDER_APPROVED_PENDING_EXECUTION_NOT_SENT"&&
                draft.text!==draft.savedText?<p role="alert" style={note}>
                This edited text is NOT the approved saved version. Save changes
                before seeking a new Founder approval.</p>:null}
            </div>:null}
          </div>}
        </section>:null}
        {item.assignedDepartment==="customer_support"?<p role="status" style={note}>
          Internally routed to Customer Support. This is not a staff member assignment,
          customer reply or acknowledgement.
        </p>:null}
        {routingAllowed(item)&&routeReviewId!==item.requestId?<button type="button"
          onClick={()=>setRouteReviewId(item.requestId)}
          style={{marginTop:15,minHeight:48,padding:"12px 16px",borderRadius:12,
            border:"1px solid #286a4f",background:"#fff",color:"#20583f",fontWeight:750}}>
          Review internal route to Customer Support
        </button>:null}
        {routeReviewId===item.requestId&&routingAllowed(item)?<section
          aria-label="Founder confirmation of internal case routing"
          style={{...field,background:"#f0f6ef",marginTop:16}}>
          <strong>Confirm internal department routing?</strong>
          <p style={note}>Only this Staging case reference will be routed to the Customer Support
            department. This will create a matching original Admin audit entry.
            It will not assign an employee, acknowledge or reply to the customer,
            set a response deadline, send an email, or change staff permissions.</p>
          <div style={{display:"flex",flexWrap:"wrap",gap:10}}>
            <button type="button" onClick={()=>confirmRoute(item)} disabled={routeBusy}
              style={{minHeight:48,padding:"12px 16px",background:"#20583f",
                border:0,borderRadius:12,color:"#fff",fontWeight:750}}>
              Confirm internal routing in Staging
            </button>
            <button type="button" onClick={()=>setRouteReviewId(null)}
              style={{minHeight:48,padding:"12px 16px",background:"#fff",
                border:"1px solid #96b8a0",borderRadius:12,color:"#20583f",fontWeight:750}}>
              Cancel — leave case unchanged
            </button>
          </div>
        </section>:null}
      </article>)}
      </div>
      {state.more?<p role="status">Showing the latest 20 references. Older records may exist; this is not a complete total.</p>:null}
    </section>:null}
    <aside style={{...field,marginTop:24}}>
      <strong>Safety and next service steps</strong>
      <p style={note}>Case references and canonical Founder monitoring are read-only. A separate two-step Founder confirmation can route an eligible Staging case internally to the Customer Support department, using the original audited service. HIISSA can now prepare a private case-specific reply for Founder review and canonical approval in the same Centre. Customer delivery, sending acknowledgements and individual staff handling remain separately controlled and are not active. Opening or refreshing this page never routes a case, sends a customer message or changes staff access.</p>
      <Link href="/admin/control-room?view=overview" style={{color:"#174a36",fontWeight:750}}>
        Open existing Founder Alerts and Activity Timeline →
      </Link>
    </aside>
  </main>;
}
