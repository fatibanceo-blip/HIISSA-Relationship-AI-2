export const HIBERNATED_STAFF_WORKSPACE_IDS = Object.freeze([
  "technical_operations",
  "finance_subscriptions",
  "safety_safeguarding",
  "privacy_data_protection",
  "content_moderation",
  "product_quality",
]);

export const HIBERNATED_STAFF_WORKSPACES = Object.freeze({
  technical_operations: Object.freeze({
    id: "technical_operations",
    label: "Technical Operations",
    roleLabel: "Technical Operations Specialist",
    principle:
      "Technical Operations provides technical oversight without becoming a coding dashboard or exposing protected secrets.",
    operatingModel: Object.freeze([
      "Monitor",
      "Detect",
      "Classify",
      "Safely recover",
      "Verify",
      "Record",
      "Report",
    ]),
    authorisedWork: Object.freeze([
      "Investigate operational failures using human-readable technical evidence.",
      "Supervise authorised recovery and verify whether recovery actually worked.",
      "Coordinate specialist escalation when an issue is Safety, Privacy, Moderation or another governed domain.",
      "Manage approved operational actions within the role's scope and environment.",
    ]),
    protectedBoundaries: Object.freeze([
      "No raw passwords, secrets or credentials.",
      "No casual access to private conversations merely to diagnose system health.",
      "No raw source-code console as the normal operating workspace.",
      "Technical failures stay distinct from privacy, safety and moderation incidents even when cross-referenced.",
    ]),
    fictionalTask: Object.freeze({
      code: "TECH-STG-001",
      title: "Authentication latency signal review",
      category: "Reliability & Recovery",
      priority: "normal",
      summary:
        "A fictional Staging health signal shows slower authentication completion. Review the human-readable evidence, classify the issue, prepare a bounded recovery recommendation and record how success would be verified.",
      draftPrompt:
        "Record the observed signal, classification, safe recovery recommendation, retry boundary and verification evidence.",
    }),
    roleNotification:
      "Operational notifications remain limited to authorised technical state. Private user conversations are not surfaced here.",
  }),
  finance_subscriptions: Object.freeze({
    id: "finance_subscriptions",
    label: "Finance & Subscriptions",
    roleLabel: "Finance & Subscriptions Specialist",
    principle:
      "Finance manages HIISSA's commercial relationship with the user, not the user's private relationship life.",
    operatingModel: Object.freeze([
      "Review commercial state",
      "Separate payment, subscription, entitlement and identity",
      "Prepare authorised correction",
      "Submit for Founder processing",
      "Verify audited outcome",
    ]),
    authorisedWork: Object.freeze([
      "Review bounded subscription, entitlement and commercial-state information.",
      "Prepare authorised refund, subscription-correction or entitlement-correction work within policy.",
      "Use approved regional pricing and commercial rules without treating country, currency or language as identity.",
      "Record evidence and route consequential commercial actions through the Founder gate.",
    ]),
    protectedBoundaries: Object.freeze([
      "Payment ≠ Subscription ≠ Entitlement ≠ Identity.",
      "No private conversations, safeguarding/private voice content or unrelated personal information.",
      "No raw card data, authentication secrets, source code or database access merely because somebody is a customer.",
      "Real payment execution remains disabled until separately activated through applicable commercial and release gates.",
    ]),
    fictionalTask: Object.freeze({
      code: "FIN-STG-001",
      title: "Subscription entitlement correction review",
      category: "Subscription & Entitlement",
      priority: "normal",
      summary:
        "A fictional Staging account shows a mismatch between an approved subscription state and its entitlement. Review the bounded commercial evidence and prepare a correction request without accessing private relationship content or raw payment data.",
      draftPrompt:
        "Record the commercial state, the specific mismatch, the proposed bounded correction, evidence and Founder-approval requirement.",
    }),
    roleNotification:
      "Commercial work remains separate from private HIISSA conversations and from real payment execution.",
  }),
  safety_safeguarding: Object.freeze({
    id: "safety_safeguarding",
    label: "Safety & Safeguarding",
    roleLabel: "Safety & Safeguarding Specialist",
    principle:
      "Safety & Safeguarding provides qualified human judgement where HIISSA cannot safely act alone, using necessary, proportionate, purpose-bound and audited access.",
    operatingModel: Object.freeze([
      "Normal operational view",
      "Authorised review",
      "Exceptional Access only when separately authorised",
      "Preserve original evidence",
      "Verify referral state",
      "Record and escalate truthfully",
    ]),
    authorisedWork: Object.freeze([
      "Review minimum-necessary safeguarding case information within the authorised view.",
      "Keep original evidence separate from AI interpretation and preserve provenance/history.",
      "Track referral states precisely: SENT, RECEIVED, ACCEPTED and ACTIONED are not interchangeable.",
      "Escalate or recommend specialist action without falsely recording an outcome as completed.",
    ]),
    protectedBoundaries: Object.freeze([
      "No casual browsing of private conversations.",
      "No rewriting original safeguarding evidence or inventing outcomes.",
      "No self-grant of Exceptional Access or bypass of specialist gates.",
      "Police/Emergency Direct Escalation remains RESERVED · NOT ENABLED until its separate legal, authority, technical and release gates are satisfied.",
    ]),
    fictionalTask: Object.freeze({
      code: "SAFE-STG-001",
      title: "Safeguarding referral-state verification",
      category: "Safeguarding Review",
      priority: "high",
      summary:
        "A fictional Staging referral record requires state verification. Confirm what is actually evidenced, distinguish SENT from RECEIVED or ACTIONED, preserve original evidence and prepare the next authorised review step.",
      draftPrompt:
        "Record only evidenced referral state, provenance, unresolved risk, authorised next step and any required Founder/specialist escalation.",
    }),
    roleNotification:
      "Urgent protection must not be delayed by avoidable administration, but reserved emergency pathways stay disabled until separately authorised.",
  }),
  privacy_data_protection: Object.freeze({
    id: "privacy_data_protection",
    label: "Privacy & Data Protection",
    roleLabel: "Privacy & Data Protection Specialist",
    principle:
      "Privacy authority is responsibility, not unrestricted access. HIISSA must be able to explain what information it holds, why, how it may be used and whether the rules were respected.",
    operatingModel: Object.freeze([
      "Review privacy health",
      "Map permission/consent state",
      "Identify dependencies",
      "Prepare scoped rights action",
      "Verify propagation",
      "Audit outcome",
    ]),
    authorisedWork: Object.freeze([
      "Review privacy health, consent propagation and authorised access-governance evidence without displaying private conversations in the normal view.",
      "Prepare scoped data-rights, retention, deletion or export workflows.",
      "Verify that withdrawal stops affected future use and recalculates permissions appropriately.",
      "Protect independent choices where connected people have separate permissions.",
    ]),
    protectedBoundaries: Object.freeze([
      "Identity is not permission and connection is not permission to transfer information.",
      "No unqualified DELETE EVERYTHING control.",
      "Exports must not silently include another person's data, unrelated safeguarding evidence or internal security material.",
      "Exceptional Access remains separately governed and cannot be self-granted.",
    ]),
    fictionalTask: Object.freeze({
      code: "PRIV-STG-001",
      title: "Consent withdrawal propagation review",
      category: "Consent & Data Rights",
      priority: "normal",
      summary:
        "A fictional Staging consent withdrawal requires a propagation check. Identify affected future use, dependent permissions and automation, then prepare a verification plan without exposing private conversation content.",
      draftPrompt:
        "Record the consent change, affected dependencies, actions to stop future use, permission recalculation and verification evidence.",
    }),
    roleNotification:
      "Privacy review uses the minimum information necessary and keeps another person's independent permissions separate.",
  }),
  content_moderation: Object.freeze({
    id: "content_moderation",
    label: "Content & Moderation",
    roleLabel: "Content & Moderation Specialist",
    principle:
      "HIISSA moderates governed content and behaviour, not people's private lives. Human accountability and correction routes remain available for consequential or uncertain decisions.",
    operatingModel: Object.freeze([
      "Assess governed content",
      "Preserve context and original language",
      "Classify clear / uncertain / high-risk",
      "Apply only authorised low-risk action",
      "Escalate specialist crossover",
      "Preserve decision and appeal history",
    ]),
    authorisedWork: Object.freeze([
      "Review applicable public/community contributions, reported shared content and other explicitly governed moderation surfaces.",
      "Use automation only for clear low-risk cases within approved rules; uncertainty requires human review.",
      "Preserve original language/content and translation provenance when multilingual review is needed.",
      "Escalate safeguarding to Safety, privacy issues to Privacy, system failures to Tech and product-quality patterns to Product & Quality.",
    ]),
    protectedBoundaries: Object.freeze([
      "Private HIISSA conversations are not moderator-accessible merely because they exist.",
      "AI confidence is not proof.",
      "No rewriting original content, deleting audit history, hiding overturned decisions or retaliation against appeals.",
      "Moderators cannot personally rewrite policy or broaden their own authority.",
    ]),
    fictionalTask: Object.freeze({
      code: "MOD-STG-001",
      title: "Reported community contribution review",
      category: "Governed Content Review",
      priority: "normal",
      summary:
        "A fictional public/community contribution has been reported in Staging. Preserve the original content and language, classify the concern and prepare either a safe low-risk action or the correct specialist escalation.",
      draftPrompt:
        "Record original-content preservation, language/provenance, classification, applicable rule, proposed action or escalation and appeal/correction path.",
    }),
    roleNotification:
      "Moderation decisions preserve context, evidence, who decided, when, why and what changed.",
  }),
  product_quality: Object.freeze({
    id: "product_quality",
    label: "Product & Quality",
    roleLabel: "Product & Quality Specialist",
    principle:
      "Product & Quality determines whether HIISSA genuinely helps people as designed, not merely whether software runs or keeps people engaged.",
    operatingModel: Object.freeze([
      "Observe evidence",
      "Identify quality pattern",
      "Explain why it matters",
      "Compare alternatives",
      "Recommend bounded change",
      "Test in authorised Staging",
      "Submit for governed release decision",
    ]),
    authorisedWork: Object.freeze([
      "Investigate conversational quality, product function, human experience, multilingual quality, developmental quality, SEND/accessibility, privacy/consent and safety/safeguarding quality signals.",
      "Reuse the existing Conversational Intelligence pipeline and Quality Evaluator rather than creating a second evaluator.",
      "Prepare recommendations with evidence, affected capability, alternatives, risks/dependencies and approval status.",
      "Test authorised changes in Staging and validate regressions without silently redesigning or releasing HIISSA.",
    ]),
    protectedBoundaries: Object.freeze([
      "Metrics measure human purpose, not screen time, emotional disclosure or dependency.",
      "Technical language capability is not automatically HIISSA Verified.",
      "Product staff cannot silently redesign, approve or release HIISSA.",
      "Cost optimisation cannot weaken safeguarding, privacy, accessibility, multilingual quality or conversational standards.",
    ]),
    fictionalTask: Object.freeze({
      code: "QUAL-STG-001",
      title: "Multilingual warmth regression review",
      category: "Conversational Quality",
      priority: "normal",
      summary:
        "A fictional Staging quality signal suggests a translated response may have lost HIISSA's warm, calm identity. Review the evidence, explain the human impact and prepare a bounded recommendation using the existing Quality Evaluator pathway.",
      draftPrompt:
        "Record the observed quality issue, evidence, why it matters, affected capability, alternatives, recommendation, risks and required approval.",
    }),
    roleNotification:
      "Product recommendations remain advisory until the appropriate Founder/governance decision and release gates are satisfied.",
  }),
});

export function getHibernatedStaffWorkspace(workspaceId) {
  return HIBERNATED_STAFF_WORKSPACES[workspaceId] || null;
}
