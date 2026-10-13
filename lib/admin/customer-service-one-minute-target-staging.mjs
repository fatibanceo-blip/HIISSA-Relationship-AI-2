// HIISSA R201 — Pure read-only one-minute Founder HUMAN-response target projection.
// No database writes, no customer identity or body, no timers/job/send, no new Registry.
// A DESIGN target does not mean a contractual live SLA or evidence of a human reply.
export const HUMAN_RESPONSE_DESIGN_TARGET_MS=60_000;
export const CUSTOMER_SERVICE_REGISTRY_ID="customer-communication-service-level-centre";

export function projectOneMinuteHumanTarget(receivedAt, lifecycleState) {
  const time=typeof receivedAt==="string"?Date.parse(receivedAt):NaN;
  if(!Number.isFinite(time)||time<0||
    !Number.isFinite(time+HUMAN_RESPONSE_DESIGN_TARGET_MS)){
    return {
      verified:false,targetAt:null,
      designTargetSeconds:60,replyEvidence:"NOT_CONNECTED",
      liveHumanSla:"NOT_ACTIVE",
      attentionStatus:"RECEIPT_TIME_UNAVAILABLE"
    };
  }
  // UTC derived from the original authoritative Staging RECEIVED timestamp.
  // NOT a database committed SLA, a certified employee response or a delivered notice.
  return {
    verified:true,targetAt:new Date(time+HUMAN_RESPONSE_DESIGN_TARGET_MS).toISOString(),
    designTargetSeconds:60,
    replyEvidence:"NOT_CONNECTED",
    liveHumanSla:"NOT_ACTIVE",
    attentionStatus:lifecycleState==="RESOLVED"
      ?"CASE_RESOLVED_HUMAN_REPLY_EVIDENCE_NOT_CONNECTED"
      :"FOUNDER_DESIGN_TARGET_ONLY_NO_HUMAN_REPLY_EVIDENCE",
  };
}
