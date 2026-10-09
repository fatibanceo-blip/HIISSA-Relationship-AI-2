/**
 * STAGING ONLY. Canonical incident current state.
 * Existing admin_audit_events remains the historical timeline through the DB
 * trigger. Existing admin_approval_requests remains the only Founder queue.
 * This module MUST only receive a server-held service-role client.
 * No customer audio, private chat, credentials, or personal data is permitted.
 * This layer records incidents: it does NOT itself retry services, notify
 * people, grant permissions, or certify recovery.
 */
export const OPERATIONAL_INCIDENT_STATES = Object.freeze([
  "needs_attention", "investigating", "recovery_attempted",
  "verification_pending", "verified_resolved", "escalated",
]);
export const OPERATIONAL_RECOVERY_CLASSES = Object.freeze([
  "SAFE_TO_AUTO_RECOVER", "SAFE_WITH_LIMIT", "HUMAN_REQUIRED",
  "FOUNDER_REQUIRED", "NEVER_AUTOMATE",
]);
export const OPERATIONAL_MODULE_IDS = Object.freeze([
  "overview-control-room", "users-identity", "subscriptions-access",
  "feedback-recommendations", "safety-privacy-moderation",
  "failures-reliability", "authentication-synchronisation-health",
  "hiissa-ai-product-intelligence", "system-operations", "admin-security-audit",
]);
const SEVERITIES = ["monitoring","needs_attention","degraded","unavailable","critical"];
const ALLOWED_NEXT = Object.freeze({
  needs_attention: ["investigating","escalated"],
  investigating: ["recovery_attempted","verification_pending","escalated"],
  recovery_attempted: ["verification_pending","escalated"],
  verification_pending: ["investigating","escalated","verified_resolved"],
  escalated: ["investigating"],
  verified_resolved: [],
});
const textWithin = (value, min, max) =>
  typeof value === "string" && value.trim().length >= min && value.length <= max;
const invalid = reason => ({ok:false,reason});
export function validateNewIncident(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) return invalid("INVALID_INPUT");
  if (!textWithin(input.incidentKey,8,160) || !/^[a-zA-Z0-9.:_-]+$/.test(input.incidentKey)) return invalid("INVALID_INCIDENT_KEY");
  if (!textWithin(input.featureId,3,160) || !/^[a-zA-Z0-9.:_-]+$/.test(input.featureId)) return invalid("INVALID_FEATURE_ID");
  if (!OPERATIONAL_MODULE_IDS.includes(input.ownerModuleId)) return invalid("UNKNOWN_OWNER_MODULE");
  if (!textWithin(input.title,3,160) || !textWithin(input.summary,3,800)) return invalid("INVALID_PUBLIC_SUMMARY");
  if (!SEVERITIES.includes(input.severity)) return invalid("INVALID_SEVERITY");
  if (![1,2,3].includes(input.oversightLevel)) return invalid("INVALID_OVERSIGHT");
  if (!OPERATIONAL_RECOVERY_CLASSES.includes(input.recoveryClassification)) return invalid("INVALID_RECOVERY_CLASS");
  if (!Number.isInteger(input.maxSafeRetries) || input.maxSafeRetries<0 || input.maxSafeRetries>3) return invalid("INVALID_RETRY_BOUND");
  if ((input.oversightLevel===3 || ["NEVER_AUTOMATE","FOUNDER_REQUIRED","HUMAN_REQUIRED"].includes(input.recoveryClassification)) && input.maxSafeRetries!==0) return invalid("AUTOMATION_NOT_ALLOWED");
  return {ok:true};
}
export function validateIncidentTransition(current,next,verificationReference) {
  if (!current || !OPERATIONAL_INCIDENT_STATES.includes(current.state)) return invalid("UNKNOWN_CURRENT_STATE");
  if (!ALLOWED_NEXT[current.state].includes(next)) return invalid("INVALID_STATE_TRANSITION");
  if (current.oversight_level === 3 && next === "recovery_attempted") return invalid("FOUNDER_APPROVAL_REQUIRED");
  if (next === "verified_resolved" && (!textWithin(verificationReference,8,240) || current.verification_state !== "pending")) return invalid("INDEPENDENT_RECHECK_REQUIRED");
  if (next === "recovery_attempted" && ["HUMAN_REQUIRED","FOUNDER_REQUIRED","NEVER_AUTOMATE"].includes(current.recovery_classification)) return invalid("AUTOMATION_NOT_ALLOWED");
  if (next === "recovery_attempted" && current.retry_attempts >= current.max_safe_retries) return invalid("RETRY_LIMIT_REACHED");
  return {ok:true};
}
export async function recordNewIncident(serviceClient, input) {
  const validation = validateNewIncident(input);
  if (!validation.ok) return validation;
  if (!serviceClient?.from) return invalid("SERVER_CLIENT_REQUIRED");
  const row = {
    environment:"staging", incident_key:input.incidentKey, feature_id:input.featureId,
    owner_module_id:input.ownerModuleId, title:input.title.trim(),
    summary:input.summary.trim(), severity:input.severity,
    oversight_level:input.oversightLevel,
    recovery_classification:input.recoveryClassification,
    max_safe_retries:input.maxSafeRetries,
  };
  const {data,error} = await serviceClient.from("hiissa_operational_incidents").insert(row).select("incident_id,state,version").single();
  if (error?.code === "23505") return {ok:true,status:"ALREADY_RECORDED",incident:null};
  if (error) return invalid("INCIDENT_RECORD_UNAVAILABLE");
  return {ok:true,status:"RECORDED",incident:data};
}
export async function transitionIncident(serviceClient,{incidentId,nextState,verificationReference}={}) {
  if (!serviceClient?.from || !textWithin(incidentId,30,40)) return invalid("INVALID_SERVER_REQUEST");
  const {data:current,error:readError} = await serviceClient.from("hiissa_operational_incidents")
    .select("incident_id,state,version,oversight_level,verification_state,recovery_classification,retry_attempts,max_safe_retries")
    .eq("environment","staging").eq("incident_id",incidentId).maybeSingle();
  if (readError || !current) return invalid("INCIDENT_NOT_READABLE");
  const validation = validateIncidentTransition(current,nextState,verificationReference);
  if (!validation.ok) return validation;
  const now = new Date().toISOString();
  const changed = {state:nextState,version:current.version+1,updated_at:now,last_observed_at:now};
  if (nextState==="recovery_attempted") changed.retry_attempts=current.retry_attempts+1;
  if (nextState==="verification_pending") changed.verification_state="pending";
  if (nextState==="verified_resolved") {
    changed.verification_state="verified";
    changed.verification_reference=verificationReference;
    changed.verified_at=now;
  }
  const {data,error} = await serviceClient.from("hiissa_operational_incidents")
    .update(changed).eq("environment","staging").eq("incident_id",incidentId)
    .eq("version",current.version).select("incident_id,state,version").maybeSingle();
  if (error) return invalid("INCIDENT_UPDATE_UNAVAILABLE");
  if (!data) return invalid("CONCURRENT_UPDATE_RECHECK_REQUIRED");
  return {ok:true,status:"UPDATED",incident:data};
}
