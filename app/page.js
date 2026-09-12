"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const starters = [
  ["💔", "I'm struggling to let someone go."],
  ["❤️", "I don't know if they really love me."],
  ["🧩", "I don't understand their behavior."],
  ["🌱", "I want to heal and move forward."],
];
const explorePathways = [
  {
    id: "talk",
    emoji: "💬",
    name: "Talk",
    description: "I need somewhere to talk.",
    status: "live",
  },
  {
    id: "listen",
    emoji: "🎧",
    name: "Listen",
    description: "I'd rather listen for a while.",
    status: "hidden",
  },
  {
    id: "read",
    emoji: "💌",
    name: "Read",
    description: "Give me words for what I'm carrying.",
    status: "hidden",
  },
  {
    id: "reflect",
    emoji: "🪞",
    name: "Reflect",
    description: "Help me understand myself more clearly.",
    status: "hidden",
  },
  {
    id: "reset",
    emoji: "🌙",
    name: "Reset",
    description: "I need a quieter moment.",
    status: "hidden",
  },
  {
    id: "grow",
    emoji: "🌱",
    name: "Grow",
    description: "I'm ready to heal, learn or move forward.",
    status: "hidden",
  },
  {
    id: "discover",
    emoji: "✨",
    name: "Discover",
    description: "Show me something I haven't considered.",
    status: "hidden",
  },
];

const experienceRegistry = [
  {
    id: "talk",
    pathway: "talk",
    name: "Talk",
    status: "live",
    destination: "conversation",
    capabilities: {
      save: false,
      audio: true,
      share: false,
      receiveContext: true,
      persistence: true,
    },
  },
];

const getExperience = (id) =>
  experienceRegistry.find((experience) => experience.id === id);

const isExperienceLive = (id) =>
  getExperience(id)?.status === "live";

const getExperienceCapabilities = (id) =>
  getExperience(id)?.capabilities ?? {};
const createContentItem = ({
  id,
  sourceExperience,
  type,
  themes = [],
  format = "text",
  capabilities = {},
  privacyLevel = "editorial",
  status = "live",
}) => ({
  id,
  sourceExperience,
  type,
  themes,
  format,
  capabilities: {
    save: Boolean(capabilities.save),
    audio: Boolean(capabilities.audio),
    share: Boolean(capabilities.share),
  },
  privacyLevel,
  status,
});
const createSavedItem = ({
  id,
  saveType,
  sourceExperience,
  sourceContentId = null,
  snapshot,
  selectedText = null,
  userNote = null,
  privacyLevel = "private",
  createdAt = new Date().toISOString(),
}) => ({
  id,
  saveType,
  sourceExperience,
  sourceContentId,
  snapshot,
  selectedText,
  userNote,
  privacyLevel,
  createdAt,
});

const SAVED_ITEM_TYPES = {
  WHOLE_ITEM: "saved",
  STAYED_WITH_ME: "stayed_with_me",
};
const AUDIO_PLAYBACK_STATES = {
  IDLE: "idle",
  PLAYING: "playing",
  PAUSED: "paused",
  STOPPED: "stopped",
};

const createAudioItem = ({
  id,
  sourceExperience,
  sourceContentId = null,
  text = null,
  audioSource = null,
  title = null,
  duration = null,
  playbackState = AUDIO_PLAYBACK_STATES.IDLE,
  currentTime = 0,
  playbackRate = 1,
  captionsAvailable = false,
  accessibility = {},
}) => ({
  id,
  sourceExperience,
  sourceContentId,
  text,
  audioSource,
  title,
  duration,
  playbackState,
  currentTime,
  playbackRate,
  captionsAvailable,
  accessibility: {
    screenReaderFriendly: Boolean(accessibility.screenReaderFriendly),
    spokenInstructions: Boolean(accessibility.spokenInstructions),
  },
});
const CONTENT_EXPOSURE_TYPES = {
  SHOWN: "shown",
  PLAYED: "played",
  SKIPPED: "skipped",
  COMPLETED: "completed",
  SAVED: "saved",
  REVISITED: "revisited",
};

const createContentExposure = ({
  id,
  sourceExperience,
  contentId,
  exposureType = CONTENT_EXPOSURE_TYPES.SHOWN,
  themes = [],
  semanticTags = [],
  occurredAt = new Date().toISOString(),
}) => ({
  id,
  sourceExperience,
  contentId,
  exposureType,
  themes,
  semanticTags,
  occurredAt,
});

const freshnessRules = {
  relevanceFirst: true,
  avoidImmediateRepeats: true,
  avoidSemanticRepeats: true,
  allowIntentionalRevisits: true,
  relaxOldestExposureFirst: true,
};
const CONTEXT_PRIVACY_LEVELS = {
  EDITORIAL: "editorial",
  USER_SELECTED: "user_selected",
  PRIVATE: "private",
};

const createExperienceHandoff = ({
  id,
  sourceExperience,
  destinationExperience,
  sourceContentId = null,
  selectedText = null,
  userReflection = null,
  actionIntent = null,
  privacyLevel = CONTEXT_PRIVACY_LEVELS.USER_SELECTED,
  returnContext = null,
  createdAt = new Date().toISOString(),
}) => ({
  id,
  sourceExperience,
  destinationExperience,
  sourceContentId,
  selectedText,
  userReflection,
  actionIntent,
  privacyLevel,
  returnContext,
  createdAt,
});
const DATA_OWNERSHIP_TYPES = {
  HIISSA_EDITORIAL: "hiissa_editorial",
  USER_AUTHORED: "user_authored",
  USER_SELECTED: "user_selected",
};

const DATA_ACCESS_LEVELS = {
  PUBLIC: "public",
  PRIVATE: "private",
  OWNER_ONLY: "owner_only",
};

const createDataBoundary = ({
  ownership,
  accessLevel = DATA_ACCESS_LEVELS.PRIVATE,
  allowAnalysis = false,
  allowSharing = false,
  allowContentTraining = false,
}) => ({
  ownership,
  accessLevel,
  allowAnalysis: Boolean(allowAnalysis),
  allowSharing: Boolean(allowSharing),
  allowContentTraining: Boolean(allowContentTraining),
});

const GENERATION_PERMISSION_LEVELS = {
  A: "controlled_dynamic",
  B: "enhanced_safeguards",
  C: "editorial_approval_required",
};

const HIISSA_SPECIFICATIONS = {
  VOICE: {
    id: "hiissa_voice",
    name: "HIISSA Voice Standard",
    version: 1,
  },
  SAFETY: {
    id: "hiissa_safety",
    name: "HIISSA Safety Standard",
    version: 1,
  },
  PRIVACY: {
    id: "hiissa_privacy",
    name: "HIISSA Privacy Standard",
    version: 1,
  },
  FRESHNESS: {
    id: "hiissa_freshness",
    name: "HIISSA Freshness Standard",
    version: 1,
  },
  DAILY: {
    id: "daily_with_hiissa",
    name: "Daily With HIISSA Specification",
    version: 1,
  },
  WORDS_I_NEEDED: {
    id: "words_i_needed",
    name: "Words I Needed Specification",
    version: 1,
  },
  THE_SPACE_BETWEEN: {
    id: "the_space_between",
    name: "The Space Between Specification",
    version: 1,
  },
  QUIET_ROOM: {
    id: "quiet_room",
    name: "The Quiet Room Specification",
    version: 1,
  },
  RELEASE: {
    id: "things_im_ready_to_release",
    name: "Things I'm Ready to Release Specification",
    version: 1,
  },
  MOS_SPACE: {
    id: "mos_space",
    name: "Mo’s Space Specification",
    version: 1,
  },
  MIRROR: {
    id: "the_mirror",
    name: "The Mirror Specification",
    version: 1,
  },
  WHERE_I_AM_NOW: {
    id: "where_i_am_now",
    name: "Where I Am Now Specification",
    version: 1,
  },
  PUZZLE_OF_LIFE: {
    id: "puzzle_of_life",
    name: "The Puzzle of Life Specification",
    version: 1,
  },
  GROW: {
    id: "grow_with_hiissa",
    name: "Grow With HIISSA Specification",
    version: 1,
  },
  BEYOND_WHAT_WE_WERE_TOLD: {
    id: "beyond_what_we_were_told",
    name: "Beyond What We Were Told Specification",
    version: 1,
  },
  DISCOVER: {
    id: "discover_with_hiissa",
    name: "Discover With HIISSA Specification",
    version: 1,
  },
  HIISSA_BOOK: {
    id: "my_hiissa_book",
    name: "My HIISSA Book Specification",
    version: 1,
  },
};

const generationGovernanceRegistry = {
  daily_with_hiissa: {
    defaultLevel: GENERATION_PERMISSION_LEVELS.A,
    specifications: [
      HIISSA_SPECIFICATIONS.DAILY,
      HIISSA_SPECIFICATIONS.VOICE,
      HIISSA_SPECIFICATIONS.SAFETY,
      HIISSA_SPECIFICATIONS.PRIVACY,
      HIISSA_SPECIFICATIONS.FRESHNESS,
    ],
    allowDynamicDelivery: true,
    permanentLibraryRequiresApproval: true,
  },

  words_i_needed: {
    defaultLevel: GENERATION_PERMISSION_LEVELS.A,
    sensitiveLevel: GENERATION_PERMISSION_LEVELS.B,
    permanentLevel: GENERATION_PERMISSION_LEVELS.C,
    specifications: [
      HIISSA_SPECIFICATIONS.WORDS_I_NEEDED,
      HIISSA_SPECIFICATIONS.VOICE,
      HIISSA_SPECIFICATIONS.SAFETY,
      HIISSA_SPECIFICATIONS.PRIVACY,
      HIISSA_SPECIFICATIONS.FRESHNESS,
    ],
    allowDynamicDelivery: true,
    permanentLibraryRequiresApproval: true,
  },

  the_space_between: {
    defaultLevel: GENERATION_PERMISSION_LEVELS.C,
    sensitiveLevel: GENERATION_PERMISSION_LEVELS.B,
    specifications: [
      HIISSA_SPECIFICATIONS.THE_SPACE_BETWEEN,
      HIISSA_SPECIFICATIONS.VOICE,
      HIISSA_SPECIFICATIONS.SAFETY,
      HIISSA_SPECIFICATIONS.PRIVACY,
    ],
    allowDynamicDelivery: false,
    permanentLibraryRequiresApproval: true,
  },

  quiet_room: {
    defaultLevel: GENERATION_PERMISSION_LEVELS.B,
    permanentLevel: GENERATION_PERMISSION_LEVELS.C,
    specifications: [
      HIISSA_SPECIFICATIONS.QUIET_ROOM,
      HIISSA_SPECIFICATIONS.VOICE,
      HIISSA_SPECIFICATIONS.SAFETY,
      HIISSA_SPECIFICATIONS.PRIVACY,
      HIISSA_SPECIFICATIONS.FRESHNESS,
    ],
    allowDynamicDelivery: true,
    permanentLibraryRequiresApproval: true,
  },

  things_im_ready_to_release: {
    defaultLevel: GENERATION_PERMISSION_LEVELS.B,
    permanentLevel: GENERATION_PERMISSION_LEVELS.C,
    specifications: [
      HIISSA_SPECIFICATIONS.RELEASE,
      HIISSA_SPECIFICATIONS.VOICE,
      HIISSA_SPECIFICATIONS.SAFETY,
      HIISSA_SPECIFICATIONS.PRIVACY,
    ],
    allowDynamicDelivery: true,
    permanentLibraryRequiresApproval: true,
    privateUserContent: true,
  },

  mos_space: {
    defaultLevel: GENERATION_PERMISSION_LEVELS.A,
    spokenAccompanimentLevel: GENERATION_PERMISSION_LEVELS.B,
    newPermanentWorldLevel: GENERATION_PERMISSION_LEVELS.C,
    specifications: [
      HIISSA_SPECIFICATIONS.MOS_SPACE,
      HIISSA_SPECIFICATIONS.VOICE,
      HIISSA_SPECIFICATIONS.SAFETY,
      HIISSA_SPECIFICATIONS.PRIVACY,
    ],
    allowDynamicDelivery: true,
    permanentLibraryRequiresApproval: true,
  },

  the_mirror: {
    defaultLevel: GENERATION_PERMISSION_LEVELS.B,
    permanentLevel: GENERATION_PERMISSION_LEVELS.C,
    specifications: [
      HIISSA_SPECIFICATIONS.MIRROR,
      HIISSA_SPECIFICATIONS.VOICE,
      HIISSA_SPECIFICATIONS.SAFETY,
      HIISSA_SPECIFICATIONS.PRIVACY,
    ],
    allowDynamicDelivery: true,
    permanentLibraryRequiresApproval: true,
    privateUserContent: true,
  },

  where_i_am_now: {
    defaultLevel: GENERATION_PERMISSION_LEVELS.B,
    permanentLevel: GENERATION_PERMISSION_LEVELS.C,
    specifications: [
      HIISSA_SPECIFICATIONS.WHERE_I_AM_NOW,
      HIISSA_SPECIFICATIONS.VOICE,
      HIISSA_SPECIFICATIONS.SAFETY,
      HIISSA_SPECIFICATIONS.PRIVACY,
    ],
    allowDynamicDelivery: true,
    permanentLibraryRequiresApproval: true,
    privateUserContent: true,
    prohibitArtificialProgressScoring: true,
  },

  puzzle_of_life: {
    defaultLevel: GENERATION_PERMISSION_LEVELS.B,
    permanentLevel: GENERATION_PERMISSION_LEVELS.C,
    specifications: [
      HIISSA_SPECIFICATIONS.PUZZLE_OF_LIFE,
      HIISSA_SPECIFICATIONS.VOICE,
      HIISSA_SPECIFICATIONS.SAFETY,
      HIISSA_SPECIFICATIONS.PRIVACY,
    ],
    allowDynamicDelivery: true,
    permanentLibraryRequiresApproval: true,
    privateUserContent: true,
  },

  grow_with_hiissa: {
    defaultLevel: GENERATION_PERMISSION_LEVELS.A,
    sensitiveLevel: GENERATION_PERMISSION_LEVELS.B,
    permanentLevel: GENERATION_PERMISSION_LEVELS.C,
    specifications: [
      HIISSA_SPECIFICATIONS.GROW,
      HIISSA_SPECIFICATIONS.VOICE,
      HIISSA_SPECIFICATIONS.SAFETY,
      HIISSA_SPECIFICATIONS.PRIVACY,
      HIISSA_SPECIFICATIONS.FRESHNESS,
    ],
    allowDynamicDelivery: true,
    permanentLibraryRequiresApproval: true,
  },

  beyond_what_we_were_told: {
    defaultLevel: GENERATION_PERMISSION_LEVELS.B,
    researchedPermanentLevel: GENERATION_PERMISSION_LEVELS.C,
    specifications: [
      HIISSA_SPECIFICATIONS.BEYOND_WHAT_WE_WERE_TOLD,
      HIISSA_SPECIFICATIONS.VOICE,
      HIISSA_SPECIFICATIONS.SAFETY,
      HIISSA_SPECIFICATIONS.PRIVACY,
    ],
    allowDynamicDelivery: true,
    permanentLibraryRequiresApproval: true,
  },

  a_little_something_for_you: {
    defaultLevel: GENERATION_PERMISSION_LEVELS.A,
    sensitiveLevel: GENERATION_PERMISSION_LEVELS.B,
    specifications: [
      HIISSA_SPECIFICATIONS.DISCOVER,
      HIISSA_SPECIFICATIONS.VOICE,
      HIISSA_SPECIFICATIONS.SAFETY,
      HIISSA_SPECIFICATIONS.FRESHNESS,
    ],
    allowDynamicDelivery: true,
    permanentLibraryRequiresApproval: false,
  },

  surprise_me: {
    defaultLevel: GENERATION_PERMISSION_LEVELS.A,
    specifications: [
      HIISSA_SPECIFICATIONS.DISCOVER,
      HIISSA_SPECIFICATIONS.VOICE,
      HIISSA_SPECIFICATIONS.SAFETY,
      HIISSA_SPECIFICATIONS.FRESHNESS,
    ],
    allowDynamicDelivery: true,
    permanentLibraryRequiresApproval: false,
    restrictUnexpectedSensitiveContent: true,
  },

  my_hiissa_book: {
    reflectionLevel: GENERATION_PERMISSION_LEVELS.B,
    permanentLevel: GENERATION_PERMISSION_LEVELS.C,
    specifications: [
      HIISSA_SPECIFICATIONS.HIISSA_BOOK,
      HIISSA_SPECIFICATIONS.VOICE,
      HIISSA_SPECIFICATIONS.SAFETY,
      HIISSA_SPECIFICATIONS.PRIVACY,
    ],
    allowDynamicDelivery: true,
    permanentLibraryRequiresApproval: true,
    privateUserContent: true,
    analyzeOnlyWhenRequested: true,
  },
};

const getGenerationGovernance = (experienceId) =>
  generationGovernanceRegistry[experienceId] || null;

const QUALITY_GATE_STATUS = {
  PASS: "pass",
  REGENERATE: "regenerate",
  BLOCK: "block",
  REVIEW: "review",
};

const QUALITY_CHECK_STATUS = {
  PASS: "pass",
  FAIL: "fail",
  FLAG: "flag",
  NOT_APPLICABLE: "not_applicable",
};

const createQualityCheck = ({
  specificationId,
  specificationVersion = 1,
  status = QUALITY_CHECK_STATUS.PASS,
  reason = null,
}) => ({
  specificationId,
  specificationVersion,
  status,
  reason,
});

const createQualityGateResult = ({
  id,
  experienceId,
  contentId = null,
  checks = [],
  status = QUALITY_GATE_STATUS.PASS,
  reason = null,
  recommendedAction = null,
  createdAt = new Date().toISOString(),
}) => ({
  id,
  experienceId,
  contentId,
  governance: getGenerationGovernance(experienceId),
  checks,
  status,
  reason,
  recommendedAction,
  createdAt,
});

const getQualityGateAction = (checks = []) => {
  const hasFailure = checks.some(
    (check) => check.status === QUALITY_CHECK_STATUS.FAIL
  );

  const hasFlag = checks.some(
    (check) => check.status === QUALITY_CHECK_STATUS.FLAG
  );

  if (hasFailure) {
    return QUALITY_GATE_STATUS.REGENERATE;
  }

  if (hasFlag) {
    return QUALITY_GATE_STATUS.REVIEW;
  }

  return QUALITY_GATE_STATUS.PASS;
};
// STEP 3I — HIISSA Quality Gate Decision Rules

const QUALITY_GATE_RULES = {
  MAX_REGENERATION_ATTEMPTS: 3,

  FAILURE_ACTIONS: {
    privacy: QUALITY_GATE_STATUS.BLOCK,
    safety: QUALITY_GATE_STATUS.BLOCK,
    voice: QUALITY_GATE_STATUS.REGENERATE,
    freshness: QUALITY_GATE_STATUS.REGENERATE,
    repetition: QUALITY_GATE_STATUS.REGENERATE,
    specification: QUALITY_GATE_STATUS.REGENERATE,
  },

  FLAG_ACTIONS: {
    sensitive_uncertainty: QUALITY_GATE_STATUS.REVIEW,
    editorial_uncertainty: QUALITY_GATE_STATUS.REVIEW,
    permanent_content: QUALITY_GATE_STATUS.REVIEW,
  },
};

const getQualityGateDecision = ({
  checks = [],
  regenerationAttempts = 0,
  requiresEditorialApproval = false,
} = {}) => {
  if (requiresEditorialApproval) {
    return QUALITY_GATE_STATUS.REVIEW;
  }

  const failedChecks = checks.filter(
    (check) => check.status === QUALITY_CHECK_STATUS.FAIL
  );

  const flaggedChecks = checks.filter(
    (check) => check.status === QUALITY_CHECK_STATUS.FLAG
  );

  const hasBlockingFailure = failedChecks.some(
    (check) =>
      QUALITY_GATE_RULES.FAILURE_ACTIONS[check.specificationId] ===
      QUALITY_GATE_STATUS.BLOCK
  );

  if (hasBlockingFailure) {
    return QUALITY_GATE_STATUS.BLOCK;
  }

  if (flaggedChecks.length > 0) {
    return QUALITY_GATE_STATUS.REVIEW;
  }

  if (failedChecks.length > 0) {
    if (
      regenerationAttempts >=
      QUALITY_GATE_RULES.MAX_REGENERATION_ATTEMPTS
    ) {
      return QUALITY_GATE_STATUS.REVIEW;
    }

    return QUALITY_GATE_STATUS.REGENERATE;
  }

  return QUALITY_GATE_STATUS.PASS;
};

const conversationIntents = [
  {
    value: "listen",
    emoji: "❤️",
    label: "Just listen",
    description: "I need somewhere to talk.",
  },
  {
    value: "understand",
    emoji: "🧭",
    label: "Help me understand",
    description: "Help me make sense of what's happening.",
  },
  {
    value: "move_forward",
    emoji: "🌱",
    label: "Help me move forward",
    description: "Help me think about what I can do next.",
  },
];
// STEP 3J — HIISSA Quality Gate Check Categories & Review Reasons

const QUALITY_CHECK_CATEGORIES = {
  VOICE: "voice",
  SAFETY: "safety",
  PRIVACY: "privacy",
  FRESHNESS: "freshness",
  REPETITION: "repetition",
  SPECIFICATION: "specification",
  EDITORIAL: "editorial",
};

const QUALITY_CHECK_REASONS = {
  VOICE: {
    TOO_DIRECTIVE: "too_directive",
    TOO_COLD: "too_cold",
    TOO_GENERIC: "too_generic",
    NOT_HIISSA_VOICE: "not_hiissa_voice",
  },

  SAFETY: {
    UNSUPPORTED_CERTAINTY: "unsupported_certainty",
    DIAGNOSIS_LIKE_WORDING: "diagnosis_like_wording",
    COERCIVE_ADVICE: "coercive_advice",
    INAPPROPRIATE_REASSURANCE: "inappropriate_reassurance",
  },

  PRIVACY: {
    PRIVATE_CONTENT_REUSE: "private_content_reuse",
    OWNER_ONLY_BOUNDARY: "owner_only_boundary",
  },

  FRESHNESS: {
    RECENTLY_SHOWN: "recently_shown",
  },

  REPETITION: {
    EXACT_REPEAT: "exact_repeat",
    SEMANTIC_REPEAT: "semantic_repeat",
  },

  SPECIFICATION: {
    SPECIFICATION_MISMATCH: "specification_mismatch",
    REQUIRED_ELEMENT_MISSING: "required_element_missing",
  },

  EDITORIAL: {
    PERMANENT_CONTENT_APPROVAL: "permanent_content_approval",
    SENSITIVE_UNCERTAINTY: "sensitive_uncertainty",
    CULTURAL_CONTENT_REVIEW: "cultural_content_review",
  },
};

const createQualityCheckReason = ({
  category,
  reason,
  expected = null,
  recommendedAction = null,
}) => ({
  category,
  reason,
  expected,
  recommendedAction,
});
// STEP 3K — HIISSA Quality Check Evaluator

const evaluateQualityFinding = ({
  category,
  isCompliant = true,
  needsReview = false,
  reason = null,
  expected = null,
  recommendedAction = null,
}) => {
  let status = QUALITY_CHECK_STATUS.PASS;

  if (!isCompliant) {
    status = QUALITY_CHECK_STATUS.FAIL;
  } else if (needsReview) {
    status = QUALITY_CHECK_STATUS.FLAG;
  }

  return {
    ...createQualityCheck({
      specificationId: category,
      status,
      reason,
    }),

    details: createQualityCheckReason({
      category,
      reason,
      expected,
      recommendedAction,
    }),
  };
};

const evaluateQualityGate = ({
  id,
  experienceId,
  contentId = null,
  findings = [],
  regenerationAttempts = 0,
  requiresEditorialApproval = false,
}) => {
  const checks = findings.map((finding) =>
    evaluateQualityFinding(finding)
  );

  const decision = getQualityGateDecision({
    checks,
    regenerationAttempts,
    requiresEditorialApproval,
  });

  return createQualityGateResult({
    id,
    experienceId,
    contentId,
    checks,
    status: decision,
    recommendedAction: decision,
  });
};
// STEP 3L — HIISSA Quality Gate Audit Layer

const QUALITY_AUDIT_EVENT_TYPES = {
  EVALUATED: "evaluated",
  REGENERATED: "regenerated",
  BLOCKED: "blocked",
  SENT_TO_REVIEW: "sent_to_review",
  APPROVED: "approved",
  REJECTED: "rejected",
};

const createQualityAuditRecord = ({
  id,
  eventType = QUALITY_AUDIT_EVENT_TYPES.EVALUATED,
  experienceId,
  contentId = null,
  gateResult = null,
  regenerationAttempts = 0,
  requiresEditorialApproval = false,
  createdAt = new Date().toISOString(),
}) => ({
  id,
  eventType,
  experienceId,
  contentId,
  decision: gateResult?.status || null,
  recommendedAction: gateResult?.recommendedAction || null,
  checks: gateResult?.checks || [],
  governance: gateResult?.governance || getGenerationGovernance(experienceId),
  regenerationAttempts,
  requiresEditorialApproval: Boolean(requiresEditorialApproval),
  createdAt,
});

const createQualityAuditFromGateResult = ({
  id,
  gateResult,
  regenerationAttempts = 0,
  requiresEditorialApproval = false,
}) =>
  createQualityAuditRecord({
    id,
    experienceId: gateResult?.experienceId || null,
    contentId: gateResult?.contentId || null,
    gateResult,
    regenerationAttempts,
    requiresEditorialApproval,
  });
// STEP 3M — HIISSA Privacy-Safe Audit Payload

const createPrivacySafeQualityAuditPayload = (auditRecord) => {
  if (!auditRecord) return null;

  const safeChecks = Array.isArray(auditRecord.checks)
    ? auditRecord.checks.map((check) => ({
        specificationId: check?.specificationId || null,
        status: check?.status || null,
        reason: check?.reason || null,
      }))
    : [];

  return {
    id: auditRecord.id || null,
    eventType: auditRecord.eventType || null,
    experienceId: auditRecord.experienceId || null,
    contentId: auditRecord.contentId || null,
    decision: auditRecord.decision || null,
    recommendedAction: auditRecord.recommendedAction || null,
    checks: safeChecks,
    regenerationAttempts: Number(auditRecord.regenerationAttempts || 0),
    requiresEditorialApproval: Boolean(
      auditRecord.requiresEditorialApproval
    ),
    createdAt: auditRecord.createdAt || new Date().toISOString(),
  };
};

// STEP 3N — HIISSA Audit Persistence Preparation

const createQualityAuditPersistenceRecord = (auditRecord) => {
  const payload = createPrivacySafeQualityAuditPayload(auditRecord);

  if (!payload) {
    return null;
  }

  return {
    auditId: payload.id || null,
    eventType: payload.eventType || null,
    experienceId: payload.experienceId || null,
    contentId: payload.contentId || null,
    decision: payload.decision || null,
    recommendedAction: payload.recommendedAction || null,
    checks: payload.checks || [],
    regenerationAttempts: Number(payload.regenerationAttempts || 0),
    requiresEditorialApproval: Boolean(
      payload.requiresEditorialApproval
    ),
    createdAt: payload.createdAt || new Date().toISOString(),
  };
};

// STEP 3O - HIISSA Audit Persistence Action

const persistQualityAuditRecord = async (auditRecord) => {
  const record = createQualityAuditPersistenceRecord(auditRecord);

  if (!record || !supabase) {
    return {
      success: false,
      persisted: false,
      record,
    };
  }

  try {
    const { error } = await supabase
      .from("quality_audit_records")
      .insert({
        audit_record: record,
      });

    if (error) {
      console.error("HIISSA quality audit persistence failed:", error);

      return {
        success: false,
        persisted: false,
        record,
      };
    }

    return {
      success: true,
      persisted: true,
      record,
    };
  } catch (error) {
    console.error("HIISSA quality audit persistence error:", error);

    return {
      success: false,
      persisted: false,
      record,
    };
  }
};
// STEP 3P - HIISSA Audit Persistence Result Normalisation

const normalizeQualityAuditPersistenceResult = (result, auditRecord) => {
  const record =
    result?.record ||
    createQualityAuditPersistenceRecord(auditRecord);

  return {
    success: Boolean(result?.success),
    persisted: Boolean(result?.persisted),
    auditId: record?.auditId || null,
    decision: record?.decision || null,
    regenerationAttempts: Number(record?.regenerationAttempts || 0),
    requiresEditorialApproval: Boolean(
      record?.requiresEditorialApproval
    ),
    timestamp: new Date().toISOString(),
  };
};
// STEP 3Q - HIISSA Audit Persistence Result Validation

const validateQualityAuditPersistenceResult = (result) => {
  if (!result || typeof result !== "object") {
    return {
      valid: false,
      reason: "missing_or_invalid_result",
    };
  }

  const valid =
    typeof result.success === "boolean" &&
    typeof result.persisted === "boolean" &&
    typeof result.regenerationAttempts === "number" &&
    typeof result.requiresEditorialApproval === "boolean";

  return {
    valid,
    reason: valid ? null : "invalid_persistence_result_shape",
  };
};
// STEP 3R - HIISSA Audit Persistence Validation Gate

const validateAndNormalizeQualityAuditPersistence = (result, auditRecord) => {
  const normalized = normalizeQualityAuditPersistenceResult(result, auditRecord);
  const validation = validateQualityAuditPersistenceResult(normalized);

  return {
    ...normalized,
    validation,
    valid: validation.valid,
    validationReason: validation.reason,
  };
};
// STEP 3S - HIISSA Audit Persistence Execution Gate

const executeValidatedQualityAuditPersistence = async (auditRecord) => {
  const persistenceResult = await persistQualityAuditRecord(auditRecord);

  const checkedResult = validateAndNormalizeQualityAuditPersistence(
    persistenceResult,
    auditRecord
  );

  if (!checkedResult.valid) {
    return {
      ...checkedResult,
      success: false,
      persisted: false,
      persistenceBlocked: true,
    };
  }

  return {
    ...checkedResult,
    persistenceBlocked: false,
  };
};
// STEP 3T - HIISSA Audit Persistence Enforcement Gate

const enforceQualityAuditPersistence = async (auditRecord) => {
  const executionResult =
    await executeValidatedQualityAuditPersistence(auditRecord);

  if (!executionResult || executionResult.persistenceBlocked) {
    return {
      ...(executionResult || {}),
      success: false,
      persisted: false,
      persistenceEnforced: true,
      persistenceAllowed: false,
    };
  }

  return {
    ...executionResult,
    persistenceEnforced: true,
    persistenceAllowed: true,
  };
};
// STEP 3U - HIISSA Audit Persistence Finalization Gate

const finalizeQualityAuditPersistence = async (auditRecord) => {
  const enforcementResult =
    await enforceQualityAuditPersistence(auditRecord);

  if (
    !enforcementResult ||
    enforcementResult.persistenceAllowed !== true
  ) {
    return {
      ...(enforcementResult || {}),
      success: false,
      persisted: false,
      persistenceFinalized: false,
      persistenceStatus: "blocked",
    };
  }

  return {
    ...enforcementResult,
    persistenceFinalized: true,
    persistenceStatus: "completed",
  };
};
// STEP 3V - HIISSA Audit Persistence Completion Receipt

const createQualityAuditPersistenceReceipt = async (auditRecord) => {
  const finalResult =
    await finalizeQualityAuditPersistence(auditRecord);

  const completed =
    finalResult?.success === true &&
    finalResult?.persistenceFinalized === true &&
    finalResult?.persistenceStatus === "completed";

  return {
    ...finalResult,
    persistenceReceipt: {
      completed,
      status: completed ? "completed" : "blocked",
      auditId: finalResult?.auditId || null,
      decision: finalResult?.decision || null,
      timestamp: new Date().toISOString(),
    },
  };
};
// STEP 3W - HIISSA Audit Persistence Receipt Verification Gate

const verifyQualityAuditPersistenceReceipt = async (auditRecord) => {
  const receiptResult =
    await createQualityAuditPersistenceReceipt(auditRecord);

  const receipt = receiptResult?.persistenceReceipt;

  const receiptVerified =
    receiptResult?.success === true &&
    receiptResult?.persistenceFinalized === true &&
    receiptResult?.persistenceStatus === "completed" &&
    receipt?.completed === true &&
    receipt?.status === "completed";

  if (!receiptVerified) {
    return {
      ...(receiptResult || {}),
      receiptVerified: false,
      persistenceVerified: false,
      persistenceBlocked: true,
    };
  }

  return {
    ...receiptResult,
    receiptVerified: true,
    persistenceVerified: true,
    persistenceBlocked: false,
  };
};
// STEP 3X - HIISSA Audit Persistence Verification Result Gate

const enforceQualityAuditPersistenceVerification = async (auditRecord) => {
  const verificationResult =
    await verifyQualityAuditPersistenceReceipt(auditRecord);

  const persistenceAccepted =
    verificationResult?.receiptVerified === true &&
    verificationResult?.persistenceVerified === true &&
    verificationResult?.persistenceBlocked === false;

  if (!persistenceAccepted) {
    return {
      ...(verificationResult || {}),
      success: false,
      persistenceAccepted: false,
      persistenceStatus: "blocked",
    };
  }

  return {
    ...verificationResult,
    success: true,
    persistenceAccepted: true,
    persistenceStatus: "verified",
  };
};
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabasePublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

const supabase =
  supabaseUrl && supabasePublishableKey
    ? createClient(supabaseUrl, supabasePublishableKey)
    : null;

function isSafetyContext(messages) {
  const recentText = messages
    .slice(-4)
    .map((message) => message.content)
    .join(" ")
    .toLowerCase();

  const safetyTerms =
    /suicid|self-harm|self harm|kill myself|end my life|hurt myself|immediate danger|emergency services|call 999|samaritans|domestic violence|being abused|physical abuse|threatened|unsafe right now/;

  return safetyTerms.test(recentText);
}

function createPermissionToken() {
  if (
    typeof window === "undefined" ||
    !window.crypto ||
    !window.crypto.getRandomValues
  ) {
    return null;
  }

  const bytes = new Uint8Array(32);
  window.crypto.getRandomValues(bytes);

  return Array.from(bytes, (byte) =>
    byte.toString(16).padStart(2, "0")
  ).join("");
}

function storePendingPermissionToken(token) {
  if (!token || typeof window === "undefined") return;

  try {
    const storageKey = "hiissa_pending_review_permission_tokens";

    const existing = JSON.parse(
      window.localStorage.getItem(storageKey) || "[]"
    );

    const tokens = Array.isArray(existing)
      ? existing.filter((value) => typeof value === "string")
      : [];

    const updatedTokens = [
      ...tokens.filter((value) => value !== token),
      token,
    ].slice(-5);

    window.localStorage.setItem(
      storageKey,
      JSON.stringify(updatedTokens)
    );
  } catch {
    // Public-review permission remains optional if local storage is unavailable.
  }
}

function getPendingPermissionTokens() {
  if (typeof window === "undefined") return [];

  try {
    const storageKey = "hiissa_pending_review_permission_tokens";
    const existing = JSON.parse(
      window.localStorage.getItem(storageKey) || "[]"
    );

    return Array.isArray(existing)
      ? existing.filter(
          (value) => typeof value === "string" && value.length >= 32
        )
      : [];
  } catch {
    return [];
  }
}

function removePendingPermissionToken(token) {
  if (!token || typeof window === "undefined") return;

  try {
    const storageKey = "hiissa_pending_review_permission_tokens";
    const remainingTokens = getPendingPermissionTokens().filter(
      (value) => value !== token
    );

    window.localStorage.setItem(
      storageKey,
      JSON.stringify(remainingTokens)
    );
  } catch {
    // Public-review permission remains optional if local storage is unavailable.
  }
}

function renderMessageContent(content) {
  if (!content) return null;

  const renderInline = (text, keyPrefix) => {
  const parts = text.split(/(\*\*.*?\*\*|\*(?!\*)[^*\n]+?\*(?!\*))/g);

  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={`${keyPrefix}-${index}`}>
          {part.slice(2, -2)}
        </strong>
      );
    }

    if (
      part.startsWith("*") &&
      part.endsWith("*") &&
      !part.startsWith("**")
    ) {
      return (
        <em key={`${keyPrefix}-${index}`}>
          {part.slice(1, -1)}
        </em>
      );
    }

    return <span key={`${keyPrefix}-${index}`}>{part}</span>;
  });
};

  const lines = content.split("\n");

  return (
    <>
      {lines.map((line, index) => {
        const trimmed = line.trim();

        if (!trimmed) {
          return <div key={`space-${index}`} style={{ height: "10px" }} />;
        }
if (trimmed.startsWith("### ")) {
  return (
    <div
      key={`heading-${index}`}
      style={{
        fontWeight: "800",
        fontSize: "16px",
        lineHeight: "1.45",
        margin: "12px 0 6px",
        color: "#2f3f3b",
      }}
    >
      {renderInline(
        trimmed.replace(/^###\s+/, ""),
        `heading-${index}`
      )}
    </div>
  );
}
        if (trimmed.startsWith(">")) {
          return (
            <div
              key={`quote-${index}`}
              style={{
                borderLeft: "3px solid rgba(88, 122, 112, 0.35)",
                paddingLeft: "12px",
                margin: "8px 0",
                color: "#466f67",
                fontStyle: "italic",
              }}
            >
              {renderInline(
                trimmed.replace(/^>\s?/, ""),
                `quote-${index}`
              )}
            </div>
          );
        }

        if (/^[-*]\s+/.test(trimmed)) {
          return (
            <div
              key={`bullet-${index}`}
              style={{
                display: "flex",
                gap: "8px",
                margin: "4px 0",
              }}
            >
              <span aria-hidden="true">•</span>
              <span>
                {renderInline(
                  trimmed.replace(/^[-*]\s+/, ""),
                  `bullet-${index}`
                )}
              </span>
            </div>
          );
        }

        return (
          <div key={`line-${index}`}>
            {renderInline(line, `line-${index}`)}
          </div>
        );
      })}
    </>
  );
}

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hi, I'm HIISSA Relationship AI. Tell me what's happening, and I'll help you look at it with empathy, balance, and self-respect.",
    },
  ]);

 const [previousChats, setPreviousChats] = useState([]); 
 const [activePreviousChatId, setActivePreviousChatId] = useState(null); 
  const [showPreviousChats, setShowPreviousChats] = useState(false);
  const [activeChatLoaded, setActiveChatLoaded] = useState(false);
  const [input, setInput] = useState("");
  const [conversationIntent, setConversationIntent] = useState(null);
  const [showIntentChoices, setShowIntentChoices] = useState(false);
  const [showExplore, setShowExplore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [voiceHelp, setVoiceHelp] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [speakingIndex, setSpeakingIndex] = useState(null);
  const [wordingLoading, setWordingLoading] = useState(false);
  const [wordingModeActive, setWordingModeActive] = useState(false);
const [wordingSuggestion, setWordingSuggestion] = useState("");
const [wordingOriginal, setWordingOriginal] = useState("");
const [wordingError, setWordingError] = useState("");
const [wordingUndo, setWordingUndo] = useState("");
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [feedbackEligibleAfter, setFeedbackEligibleAfter] = useState(3);
  const [feedbackFormOpen, setFeedbackFormOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [helpful, setHelpful] = useState(null);
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackSending, setFeedbackSending] = useState(false);
  const [feedbackError, setFeedbackError] = useState("");
  const [feedbackThanks, setFeedbackThanks] = useState(false);

  const [pendingReviewToken, setPendingReviewToken] = useState(null);
  const [publicReviewText, setPublicReviewText] = useState("");
  const [reviewPermissionSending, setReviewPermissionSending] = useState(false);
  const [reviewPermissionError, setReviewPermissionError] = useState("");
  const [reviewPermissionThanks, setReviewPermissionThanks] = useState(false);
  const [reviewPermissionDismissed, setReviewPermissionDismissed] =
    useState(false);

  const [showAdminShortcut, setShowAdminShortcut] = useState(false);
  const [publicReviews, setPublicReviews] = useState([]);

  useEffect(() => {
    try {
      const submitted =
        window.sessionStorage.getItem("hiissa_feedback_submitted") === "1";

      const deferredUntil = Number(
        window.sessionStorage.getItem("hiissa_feedback_defer_until") || "3"
      );

      if (submitted) {
        setFeedbackSubmitted(true);
      } else {
        const pendingTokens = getPendingPermissionTokens();

        if (pendingTokens.length > 0) {
          setPendingReviewToken(pendingTokens[0]);
        }
      }

      if (Number.isFinite(deferredUntil) && deferredUntil >= 3) {
        setFeedbackEligibleAfter(deferredUntil);
      }
    } catch {
      // Session storage is optional. HIISSA still works without it.
    }
  }, []);

  useEffect(() => {
  try {
    const savedChats = JSON.parse(
      window.localStorage.getItem("hiissa_previous_chats") || "[]"
    );

    if (Array.isArray(savedChats)) {
      setPreviousChats(savedChats);
    }
  } catch {
    setPreviousChats([]);
  }
}, []);
 useEffect(() => {
  try {
    const savedActiveChat = JSON.parse(
      window.localStorage.getItem("hiissa_active_chat") || "null"
    );

    if (
      savedActiveChat &&
      Array.isArray(savedActiveChat.messages) &&
      savedActiveChat.messages.length > 0
    ) {
      setMessages(savedActiveChat.messages);
      setInput(savedActiveChat.input || "");
      setConversationIntent(savedActiveChat.conversationIntent || null);
      setActivePreviousChatId(savedActiveChat.activePreviousChatId || null);
      setShowIntentChoices(false);
    }
  } catch {
    // HIISSA starts fresh if the active chat cannot be restored.
  } finally {
    setActiveChatLoaded(true);
  }
}, []); 
 useEffect(() => {
  if (!activeChatLoaded) return;

  try {
    window.localStorage.setItem(
      "hiissa_active_chat",
      JSON.stringify({
        messages,
        input,
        conversationIntent,
       activePreviousChatId, 
      })
    );
  } catch {
    // Active chat saving remains optional if browser storage is unavailable.
  }
}, [messages, input, conversationIntent, activePreviousChatId, activeChatLoaded]); 

 useEffect(() => {
  if (!activeChatLoaded || !activePreviousChatId) return;

  setPreviousChats((currentChats) => {
    const updatedChats = currentChats.map((chat) =>
      chat.id === activePreviousChatId
        ? {
            ...chat,
            messages,
            conversationIntent,
          }
        : chat
    );

    try {
      window.localStorage.setItem(
        "hiissa_previous_chats",
        JSON.stringify(updatedChats)
      );
    } catch {
      // Previous Chats remains optional if browser storage is unavailable.
    }

    return updatedChats;
  });
}, [messages, conversationIntent, activePreviousChatId, activeChatLoaded]); 
function deletePreviousChat(chatId) {
  const shouldDelete = window.confirm(
    "Delete this chat? This cannot be undone."
  );

  if (!shouldDelete) return;

  setPreviousChats((currentChats) => {
    const updatedChats = currentChats.filter(
      (chat) => chat.id !== chatId
    );

    try {
      window.localStorage.setItem(
        "hiissa_previous_chats",
        JSON.stringify(updatedChats)
      );
    } catch {
      // Previous Chats deletion still works if browser storage is unavailable.
    }

    return updatedChats;
  });

  if (activePreviousChatId === chatId) {
    setActivePreviousChatId(null);

    try {
      window.localStorage.removeItem("hiissa_active_chat");
    } catch {
      // Active chat cleanup remains optional if browser storage is unavailable.
    }
  }
}  
  
  useEffect(() => {
    async function checkAdminAccess() {
      if (!supabase) return;

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setShowAdminShortcut(false);
        return;
      }

      const { data: isAdmin, error } = await supabase.rpc(
        "is_hiissa_admin"
      );

      if (!error && isAdmin === true) {
        setShowAdminShortcut(true);
      } else {
        setShowAdminShortcut(false);
      }
    }

    checkAdminAccess();
  }, []);

  useEffect(() => {
    async function loadPublicReviews() {
      if (!supabase) return;

      const { data, error } = await supabase.rpc(
        "get_hiissa_public_reviews"
      );

      if (!error && Array.isArray(data)) {
        setPublicReviews(data);
      }
    }

    loadPublicReviews();
  }, []);

  const substantiveAssistantAnswers = Math.max(
    0,
    messages.filter((message) => message.role === "assistant").length - 1
  );

  const showFeedbackCard =
    !loading &&
    !feedbackSubmitted &&
    !feedbackThanks &&
    substantiveAssistantAnswers >= feedbackEligibleAfter &&
    !isSafetyContext(messages);

  const showReviewPermissionCard =
    !loading &&
    pendingReviewToken &&
    !reviewPermissionDismissed &&
    !reviewPermissionThanks &&
    substantiveAssistantAnswers >= 1 &&
    !isSafetyContext(messages);

  async function sendMessage(text = input) {
    const clean = text.trim();

    if (!clean || loading || wordingLoading) return;

    const next = [...messages, { role: "user", content: clean }];

    setMessages(next);
    setInput("");
    setWordingSuggestion("");
setWordingOriginal("");
setWordingError("");
setWordingUndo("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
  messages: next,
  conversationIntent,
}),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 413) {
          setMessages((current) => [
            ...current,
            {
              role: "assistant",
              content:
                "Your message is a little too long. ❤️ Please shorten it to 6,000 characters or fewer and try again.",
            },
          ]);
          return;
        }

        throw new Error("Request failed");
      }

      setMessages((current) => [
        ...current,
        { role: "assistant", content: data.reply },
      ]);
    } catch {
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content:
            "I'm sorry, I couldn't respond right now. Please try again in a moment. 💛",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }
async function helpMeWordThis() {
  const clean = input.trim();

  if (!clean || loading || wordingLoading) return;

  setWordingLoading(true);
  setWordingError("");
  setWordingSuggestion("");
  setWordingOriginal(input);
  setWordingUndo("");

  try {
    const res = await fetch("/api/wording", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: clean }),
    });

    const data = await res.json();

    if (!res.ok) {
      if (res.status === 413) {
        setWordingError(
          "Your message is a little too long. ❤️ Please shorten it to 6,000 characters or fewer and try again."
        );
        return;
      }

      throw new Error("Wording request failed");
    }

    if (!data.rewritten?.trim()) {
      throw new Error("No rewritten wording returned");
    }

    setWordingSuggestion(data.rewritten.trim());
  } catch {
    setWordingError(
      "HIISSA couldn't help with the wording right now. Please try again. 💛"
    );
  } finally {
    setWordingLoading(false);
  }
}

function useWordingSuggestion() {
  if (!wordingSuggestion) return;

  setWordingUndo(wordingOriginal);
  setInput(wordingSuggestion);
  setWordingSuggestion("");
  setWordingOriginal("");
  setWordingError("");
}

function keepOriginalWording() {
  setWordingSuggestion("");
  setWordingOriginal("");
  setWordingError("");
}

function undoWordingChange() {
  if (!wordingUndo) return;

  setInput(wordingUndo);
  setWordingUndo("");
  setWordingSuggestion("");
  setWordingOriginal("");
  setWordingError("");
}
  async function copyHiissaLink() {
    
    try {
      await navigator.clipboard.writeText(window.location.href);
      setLinkCopied(true);

      window.setTimeout(() => {
        setLinkCopied(false);
      }, 3000);
    } catch {
      setLinkCopied(false);
    }
  }

  function startListening() {
    if (listening || loading) return;

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceHelp(true);
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.lang = "en-GB";
    recognition.interimResults = false;
    recognition.continuous = false;

    recognition.onstart = () => {
      setVoiceHelp(false);
      setListening(true);
    };

    recognition.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript || "";
      setWordingSuggestion("");
setWordingOriginal("");
setWordingError("");

      if (transcript.trim()) {
        setInput((current) =>
          current.trim() ? `${current.trim()} ${transcript}` : transcript
        );
      }
    };

    recognition.onerror = () => {
      setListening(false);
      setVoiceHelp(true);
    };

    recognition.onend = () => {
      setListening(false);
    };

    try {
      recognition.start();
    } catch {
      setListening(false);
      setVoiceHelp(true);
    }
  }

  function chooseHiissaVoice() {
    const voices = window.speechSynthesis.getVoices();

    if (!voices.length) return null;

    const britishVoices = voices.filter((voice) =>
      voice.lang?.toLowerCase().startsWith("en-gb")
    );

    const femaleVoiceNames = [
      "female",
      "samantha",
      "serena",
      "victoria",
      "karen",
      "moira",
      "fiona",
      "susan",
      "hazel",
      "libby",
      "sonia",
      "aria",
      "jenny",
      "zira",
    ];

    const britishFemaleVoice = britishVoices.find((voice) =>
      femaleVoiceNames.some((name) =>
        voice.name.toLowerCase().includes(name)
      )
    );

    if (britishFemaleVoice) return britishFemaleVoice;

    if (britishVoices.length) return britishVoices[0];

    const englishFemaleVoice = voices.find(
      (voice) =>
        voice.lang?.toLowerCase().startsWith("en") &&
        femaleVoiceNames.some((name) =>
          voice.name.toLowerCase().includes(name)
        )
    );

    if (englishFemaleVoice) return englishFemaleVoice;

    return (
      voices.find((voice) =>
        voice.lang?.toLowerCase().startsWith("en")
      ) || null
    );
  }

  function prepareSpokenText(text) {
    return text
      .replace(
        /Hi,\s*I'm\s+HIISSA\s+Relationship\s+AI\.?/gi,
        "Hi. I'm Hee-sah. Relationship AI."
      )
      .replace(/\bHIISSA\b/gi, "Hee-sah")
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .replace(/__(.*?)__/g, "$1")
      .replace(/\*(.*?)\*/g, "$1")
      .replace(/_(.*?)_/g, "$1")
      .replace(/^\s*#{1,6}\s*/gm, "")
      .replace(/^\s*[-*+]\s+/gm, "")
      .replace(/^\s*\d+\.\s+/gm, "")
      .replace(/`([^`]+)`/g, "$1")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/\s+/g, " ")
      .trim();
  }

  function speakMessage(text, index) {
    if (
      typeof window === "undefined" ||
      !("speechSynthesis" in window) ||
      typeof SpeechSynthesisUtterance === "undefined"
    ) {
      return;
    }

    window.speechSynthesis.cancel();

    if (speakingIndex === index) {
      setSpeakingIndex(null);
      return;
    }

    const spokenText = prepareSpokenText(text);

    const speech = new SpeechSynthesisUtterance(spokenText);
    const preferredVoice = chooseHiissaVoice();

    speech.lang = "en-GB";
    speech.rate = 0.92;
    speech.pitch = 1;

    if (preferredVoice) {
      speech.voice = preferredVoice;
    }

    speech.onend = () => {
      setSpeakingIndex(null);
    };

    speech.onerror = () => {
      setSpeakingIndex(null);
    };

    setSpeakingIndex(index);
    window.speechSynthesis.speak(speech);
  }

  function maybeLater() {
    const nextEligibleAt = substantiveAssistantAnswers + 5;

    setFeedbackEligibleAfter(nextEligibleAt);
    setFeedbackFormOpen(false);
    setRating(0);
    setHelpful(null);
    setFeedbackText("");
    setFeedbackError("");

    try {
      window.sessionStorage.setItem(
        "hiissa_feedback_defer_until",
        String(nextEligibleAt)
      );
    } catch {
      // HIISSA still works if session storage is unavailable.
    }
  }

  async function submitFeedback() {
    if (!rating || helpful === null || feedbackSending) return;

    setFeedbackSending(true);
    setFeedbackError("");

    if (!supabase) {
      setFeedbackError(
        "Feedback couldn't be sent right now. Please try again later."
      );
      setFeedbackSending(false);
      return;
    }

    try {
      const permissionToken = createPermissionToken();

      const { error } = await supabase.rpc("submit_feedback", {
        p_rating: rating,
        p_helpful: helpful,
        p_feedback_text: feedbackText.trim() || null,
        p_permission_token: permissionToken,
      });

      if (error) {
        throw error;
      }

      storePendingPermissionToken(permissionToken);

      setFeedbackSubmitted(true);
      setFeedbackThanks(true);
      setFeedbackFormOpen(false);

      try {
        window.sessionStorage.setItem("hiissa_feedback_submitted", "1");
      } catch {
        // HIISSA still works if session storage is unavailable.
      }

      window.setTimeout(() => {
        setFeedbackThanks(false);
      }, 7000);
    } catch {
      setFeedbackError(
        "Feedback couldn't be sent right now. Please try again."
      );
    } finally {
      setFeedbackSending(false);
    }
  }

  async function allowPublicReview() {
    const cleanReview = publicReviewText.trim();

    if (!pendingReviewToken || !cleanReview || reviewPermissionSending) return;

    setReviewPermissionSending(true);
    setReviewPermissionError("");

    if (!supabase) {
      setReviewPermissionError(
        "Public-review permission couldn't be saved right now. Please try again later."
      );
      setReviewPermissionSending(false);
      return;
    }

    try {
      const { data, error } = await supabase.rpc(
        "give_feedback_public_permission",
        {
          p_permission_token: pendingReviewToken,
          p_public_display_text: cleanReview,
        }
      );

      if (error) throw error;

      if (data !== true) {
        removePendingPermissionToken(pendingReviewToken);
        setPendingReviewToken(null);
        setReviewPermissionDismissed(true);
        setReviewPermissionError(
          "This permission request is no longer available."
        );
        return;
      }

      removePendingPermissionToken(pendingReviewToken);
      setPendingReviewToken(null);
      setPublicReviewText("");
      setReviewPermissionThanks(true);

      window.setTimeout(() => {
        setReviewPermissionThanks(false);
      }, 7000);
    } catch {
      setReviewPermissionError(
        "Public-review permission couldn't be saved right now. Please try again."
      );
    } finally {
      setReviewPermissionSending(false);
    }
  }

  function keepReviewPrivate() {
    if (pendingReviewToken) {
      removePendingPermissionToken(pendingReviewToken);
    }

    setPendingReviewToken(null);
    setPublicReviewText("");
    setReviewPermissionError("");
    setReviewPermissionDismissed(true);
  }

  return (
    <main className="page">
      <div className="orb one" />
      <div className="orb two" />
      <div className="spark s1">✦</div>
      <div className="spark s2">♡</div>

      <section className="wrap">
        {showAdminShortcut && (
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginBottom: "14px",
            }}
          >
            <a
              href="/admin"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "7px",
                textDecoration: "none",
                border: "1px solid rgba(80, 102, 93, 0.18)",
                background: "rgba(255, 253, 248, 0.92)",
                color: "#466f67",
                borderRadius: "999px",
                padding: "9px 13px",
                fontSize: "12px",
                fontWeight: "800",
                boxShadow: "0 8px 24px rgba(64, 86, 76, 0.08)",
              }}
            >
              ⚙ Admin Dashboard
            </a>
          </div>
        )}

        <header className="hero">
          <div className="logo">H</div>

          <div>
            <div className="kicker">HIISSA • RELATIONSHIP AI</div>

            <h1>
              Someone to talk to.
              <br />
              <span>Without judgment.</span>
            </h1>

            <p>
              A beautiful space for relationship questions, emotional clarity,
              boundaries, healing, and self-respect.
            </p>
          </div>
        </header>

        <div className="principle">
          ✦{" "}
          <span>
            I'll help you separate <b>what you know</b>,{" "}
            <b>what you suspect</b>, <b>what you feel</b>, and{" "}
            <b>what you cannot control</b>.
          </span>
        </div>

        <div className="trust">
          <span>♡ Compassionate</span>
          <span>⚖ Balanced</span>
          <span>✦ Self-respecting</span>
          <span>◌ Non-judgmental</span>
        </div>
<button
  type="button"
  onClick={() => setShowExplore(true)}
  className="exploreEntry"
>
  <span className="exploreEntryIcon">✦</span>
  <span className="exploreEntryText">
    <strong>Explore HIISSA</strong>
    <small>More ways to talk, listen, reflect and grow.</small>
  </span>
  <span className="exploreEntryArrow">›</span>
</button>
        <section className="chat">
          <div className="chatHead">
            <div className="mini">H</div>

            <div>
              <strong>HIISSA Relationship AI</strong>
              <small>● Here with you</small>
            </div>
         <button
  type="button"
  onClick={() => {
   if (messages.length > 1) {
  const firstUserMessage =
    messages.find((message) => message.role === "user")?.content ||
    "Previous conversation";

  const savedChat = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title:
      firstUserMessage.length > 48
        ? `${firstUserMessage.slice(0, 48)}…`
        : firstUserMessage,
    createdAt: new Date().toISOString(),
    conversationIntent,
    messages,
  };

  const updatedChats = activePreviousChatId
  ? previousChats
  : [savedChat, ...previousChats].slice(0, 20);

  setPreviousChats(updatedChats);

  try {
    window.localStorage.setItem(
      "hiissa_previous_chats",
      JSON.stringify(updatedChats)
    );
  } catch {
    // Previous Chats remains optional if browser storage is unavailable.
  }
} 
 try {
  window.localStorage.removeItem("hiissa_active_chat");
} catch {
  // HIISSA still starts a new chat if browser storage is unavailable.
}   
    setMessages([
      {
        role: "assistant",
        content:
          "Hi, I’m HIISSA Relationship AI. Tell me what’s happening, and I’ll help you look at it with empathy, balance, and self-respect.",
      },
    ]);
    setInput("");
    setConversationIntent("");
    setWordingModeActive(false);
    setActivePreviousChatId(null);
    setShowIntentChoices(false);
    setWordingSuggestion("");
    setWordingOriginal("");
    setWordingError("");
  }}
  aria-label="Start a new chat"
  title="New Chat"
  style={{
    marginLeft: "auto",
    background: "transparent",
    border: "1px solid rgba(47, 63, 59, 0.16)",
    borderRadius: "999px",
    padding: "7px 11px",
    color: "#587a70",
    fontSize: "12px",
    fontWeight: "700",
    cursor: "pointer",
    whiteSpace: "nowrap",
  }}
>
  ＋ New Chat
</button>
<button
  type="button"
  onClick={() => setShowPreviousChats((current) => !current)}
  aria-label="View previous chats"
  title="Previous Chats"
  style={{
    background: "transparent",
    border: "1px solid rgba(47, 63, 59, 0.16)",
    borderRadius: "999px",
    padding: "7px 11px",
    color: "#587a70",
    fontSize: "12px",
    fontWeight: "700",
    cursor: "pointer",
    whiteSpace: "nowrap",
  }}
>
  🕘 Chats
</button>
    </div>
{showPreviousChats && (
  <div
    style={{
      margin: "14px 18px 6px",
      padding: "16px",
      borderRadius: "18px",
      border: "1px solid rgba(47, 63, 59, 0.12)",
      background: "rgba(255, 253, 248, 0.96)",
    }}
  >
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "12px",
        marginBottom: "12px",
      }}
    >
      <strong style={{ color: "#365d54" }}>Previous Chats</strong>

      <button
        type="button"
        onClick={() => setShowPreviousChats(false)}
        style={{
          background: "transparent",
          border: "none",
          color: "#587a70",
          fontSize: "12px",
          fontWeight: "700",
          cursor: "pointer",
        }}
      >
        Close
      </button>
    </div>

    {previousChats.length === 0 ? (
      <p
        style={{
          margin: 0,
          color: "#71817c",
          fontSize: "13px",
          lineHeight: "1.5",
        }}
      >
        Your previous conversations will appear here after you start a new chat.
      </p>
    ) : (
      <div
        style={{
          display: "grid",
          gap: "8px",
        }}
      >
        {previousChats.map((chat) => (
          <button
            key={chat.id}
            type="button"
            onClick={() => {
              setMessages(chat.messages);
              setActivePreviousChatId(chat.id);
              setConversationIntent(chat.conversationIntent || "");
              setShowIntentChoices(false);
              setInput("");
              setWordingSuggestion("");
              setWordingOriginal("");
              setWordingError("");
              setShowPreviousChats(false);
            }}
            style={{
              width: "100%",
              textAlign: "left",
              padding: "12px 14px",
              borderRadius: "14px",
              border: "1px solid rgba(47, 63, 59, 0.12)",
              background: "#fff",
              color: "#365d54",
              cursor: "pointer",
            }}
          >
            <strong
              style={{
                display: "block",
                fontSize: "13px",
                marginBottom: "4px",
              }}
            >
              {chat.title}
            </strong>

            <span
              style={{
                display: "block",
                fontSize: "11px",
                color: "#7a8984",
              }}
            >
              {new Date(chat.createdAt).toLocaleDateString()}
            </span>
         <span
  onClick={(event) => {
    event.stopPropagation();
    deletePreviousChat(chat.id);
  }}
  style={{
    display: "inline-block",
    marginTop: "8px",
    fontSize: "11px",
    fontWeight: "700",
    color: "#8a5a5a",
    cursor: "pointer",
  }}
>
  Delete
</span>
              </button>
        ))}
      </div>
    )}
  </div>
)}
          <div className="messages">
            {messages.map((message, index) => (
              <div key={index} className={"row " + message.role}>
                <div>
                  <div className={"bubble " + message.role}>
                   {renderMessageContent(message.content)}
                  </div>

                  {message.role === "assistant" && (
                    <button
                      type="button"
                      onClick={() => speakMessage(message.content, index)}
                      aria-label={
                        speakingIndex === index
                          ? "Stop listening to HIISSA"
                          : "Listen to HIISSA"
                      }
                      style={{
                        marginTop: "6px",
                        marginLeft: "4px",
                        border: "1px solid rgba(80, 102, 93, 0.18)",
                        background: "#fffdf8",
                        color: "#466f67",
                        borderRadius: "999px",
                        padding: "7px 11px",
                        fontSize: "12px",
                        fontWeight: "800",
                        cursor: "pointer",
                      }}
                    >
                      {speakingIndex === index
                        ? "■ Stop listening"
                        : "🔊 Listen to HIISSA"}
                    </button>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="row assistant">
                <div className="bubble assistant">Thinking…</div>
              </div>
            )}
          </div>

          {messages.length === 1 && (
            <div className="starters">
              <small>You can start with…</small>

              <div className="grid">
                {starters.map(([emoji, text]) => (
                  <button
                    key={text}
                    type="button"
                    onClick={() => sendMessage(text)}
                  >
                    <i>{emoji}</i>
                    <span>{text}</span>
                    <b>→</b>
                  </button>
                ))}
              </div>
            </div>
          )}
{(messages.length === 1 || showIntentChoices) && (
  <div
    style={{
      margin: "6px 20px 18px",
      padding: "16px",
      borderRadius: "18px",
      background: "#f8faf9",
      border: "1px solid rgba(80, 102, 93, 0.14)",
    }}
  >
    <div
      style={{
        textAlign: "center",
        fontWeight: "800",
        color: "#3f5f58",
        marginBottom: "4px",
      }}
    >
      What would help most right now?
    </div>

    <div
      style={{
        textAlign: "center",
        fontSize: "13px",
        color: "#6f7f79",
        marginBottom: "12px",
      }}
    >
      Choose if you want to — or just start talking.
    </div>

    <div
      style={{
        display: "grid",
        gap: "8px",
      }}
    >
      {conversationIntents.map((intent) => (
        <button
          key={intent.value}
          type="button"
         onClick={() => {
  setConversationIntent(intent.value);
  setShowIntentChoices(false);
}}
          style={{
            width: "100%",
            textAlign: "left",
            padding: "11px 12px",
            borderRadius: "14px",
            border:
              conversationIntent === intent.value
                ? "2px solid #587a70"
                : "1px solid rgba(80, 102, 93, 0.18)",
            background:
              conversationIntent === intent.value ? "#eef5f2" : "#ffffff",
            cursor: "pointer",
          }}
        >
          <div
            style={{
              fontWeight: "800",
              color: "#3f5f58",
              fontSize: "14px",
            }}
          >
            {intent.emoji} {intent.label}
          </div>

          <div
            style={{
              marginTop: "2px",
              color: "#6f7f79",
              fontSize: "12px",
              lineHeight: "1.4",
            }}
          >
            {intent.description}
          </div>
        </button>
      ))}
    </div>
  </div>
)}
          {showReviewPermissionCard && (
            <div
              style={{
                margin: "6px 20px 18px",
                padding: "18px",
                borderRadius: "20px",
                background: "#f4f7f3",
                border: "1px solid rgba(80, 102, 93, 0.18)",
                boxShadow: "0 10px 30px rgba(74, 92, 84, 0.08)",
              }}
            >
              <div
                style={{
                  textAlign: "center",
                  color: "#3f5f58",
                  fontWeight: "800",
                  fontSize: "16px",
                }}
              >
                Would you like to share a review publicly? ❤️
              </div>

              <p
                style={{
                  textAlign: "center",
                  color: "#66706c",
                  fontSize: "13px",
                  lineHeight: "1.6",
                  margin: "7px 0 12px",
                }}
              >
                This is completely optional. Your private feedback is not
                published automatically.
                <br />
                Only the review text you enter below may be shared publicly.
                Your conversation and private feedback are not automatically
                included.
              </p>

              <textarea
                value={publicReviewText}
                onChange={(event) =>
                  setPublicReviewText(event.target.value.slice(0, 1500))
                }
                placeholder="Write the exact words you are comfortable sharing publicly…"
                rows={4}
                style={{
                  width: "100%",
                  resize: "vertical",
                  boxSizing: "border-box",
                  borderRadius: "14px",
                  border: "1px solid rgba(80, 102, 93, 0.2)",
                  padding: "12px",
                  fontFamily: "inherit",
                  fontSize: "14px",
                  lineHeight: "1.5",
                  outline: "none",
                  background: "#ffffff",
                  color: "#35443f",
                }}
              />

              <div
                style={{
                  color: "#77807c",
                  fontSize: "11px",
                  lineHeight: "1.5",
                  margin: "8px 2px 12px",
                }}
              >
                🔒 Please don't include names, contact details, or identifying
                personal information.
              </div>

              {reviewPermissionError && (
                <div
                  role="alert"
                  style={{
                    color: "#8a4f4f",
                    background: "#fff6f4",
                    borderRadius: "12px",
                    padding: "9px 11px",
                    fontSize: "12px",
                    marginBottom: "10px",
                  }}
                >
                  {reviewPermissionError}
                </div>
              )}

              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: "9px",
                  flexWrap: "wrap",
                }}
              >
                <button
                  type="button"
                  onClick={allowPublicReview}
                  disabled={!publicReviewText.trim() || reviewPermissionSending}
                  style={{
                    border: "0",
                    borderRadius: "999px",
                    padding: "10px 16px",
                    background: publicReviewText.trim()
                      ? "#466f67"
                      : "#c8cfcb",
                    color: "#fff",
                    fontWeight: "800",
                    cursor:
                      publicReviewText.trim() && !reviewPermissionSending
                        ? "pointer"
                        : "default",
                  }}
                >
                  {reviewPermissionSending
                    ? "Saving permission…"
                    : "Allow public sharing"}
                </button>

                <button
                  type="button"
                  onClick={keepReviewPrivate}
                  disabled={reviewPermissionSending}
                  style={{
                    border: "0",
                    background: "transparent",
                    color: "#68736f",
                    padding: "10px 12px",
                    fontWeight: "700",
                    cursor: reviewPermissionSending ? "default" : "pointer",
                  }}
                >
                  Keep private
                </button>
              </div>
            </div>
          )}

          {reviewPermissionThanks && (
            <div
              role="status"
              style={{
                margin: "6px 20px 18px",
                padding: "16px",
                borderRadius: "18px",
                background: "#f1f6f2",
                border: "1px solid rgba(80, 102, 93, 0.18)",
                color: "#466f67",
                fontWeight: "800",
                textAlign: "center",
              }}
            >
              Thank you ❤️ You've given HIISSA permission to use this review
              publicly.
            </div>
          )}

          {showFeedbackCard && (
            <div
              style={{
                margin: "6px 20px 18px",
                padding: "14px",
                borderRadius: "20px",
                background: "#fffdf8",
                border: "1px solid rgba(80, 102, 93, 0.18)",
                boxShadow: "0 10px 30px rgba(74, 92, 84, 0.08)",
              }}
            >
              {!feedbackFormOpen ? (
                <>
                  <div
                    style={{
                      textAlign: "center",
                      color: "#3f5f58",
                      fontWeight: "800",
                      fontSize: "16px",
                    }}
                  >
                    Has HIISSA been helpful so far? ❤️
                  </div>

                  <p
                    style={{
                      textAlign: "center",
                      color: "#66706c",
                      fontSize: "13px",
                      lineHeight: "1.5",
                      margin: "7px 0 10px",
                    }}
                  >
                    Your feedback helps us improve HIISSA.
                  </p>

                  <div
                    aria-label="Rate HIISSA"
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      gap: "5px",
                      marginBottom: "10px",
                    }}
                  >
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        aria-label={`${star} star${star === 1 ? "" : "s"}`}
                        style={{
                          border: "0",
                          background: "transparent",
                          fontSize: "30px",
                          lineHeight: "1",
                          padding: "2px",
                          cursor: "pointer",
                          color: star <= rating ? "#b79a5b" : "#d8d8d2",
                        }}
                      >
                        ★
                      </button>
                    ))}
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      gap: "8px",
                      flexWrap: "wrap",
                      marginBottom: "10px",
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setHelpful(true)}
                      style={{
                        border:
                          helpful === true
                            ? "1px solid #466f67"
                            : "1px solid rgba(80, 102, 93, 0.18)",
                        background:
                          helpful === true ? "#e8f0ec" : "#ffffff",
                        color: "#466f67",
                        borderRadius: "999px",
                        padding: "8px 13px",
                        fontWeight: "800",
                        cursor: "pointer",
                      }}
                    >
                      Yes, helpful ❤️
                    </button>

                    <button
                      type="button"
                      onClick={() => setHelpful(false)}
                      style={{
                        border:
                          helpful === false
                            ? "1px solid #466f67"
                            : "1px solid rgba(80, 102, 93, 0.18)",
                        background:
                          helpful === false ? "#e8f0ec" : "#ffffff",
                        color: "#466f67",
                        borderRadius: "999px",
                        padding: "8px 13px",
                        fontWeight: "800",
                        cursor: "pointer",
                      }}
                    >
                      Not yet
                    </button>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      gap: "9px",
                      flexWrap: "wrap",
                    }}
                  >
                    <button
                      type="button"
                      disabled={!rating || helpful === null}
                      onClick={() => setFeedbackFormOpen(true)}
                      style={{
                        border: "0",
                        borderRadius: "999px",
                        padding: "10px 16px",
                        background:
                          rating && helpful !== null ? "#466f67" : "#c8cfcb",
                        color: "#fff",
                        fontWeight: "800",
                        cursor:
                          rating && helpful !== null
                            ? "pointer"
                            : "default",
                      }}
                    >
                      Share feedback
                    </button>

                    <button
                      type="button"
                      onClick={maybeLater}
                      style={{
                        border: "0",
                        background: "transparent",
                        color: "#68736f",
                        padding: "10px 12px",
                        fontWeight: "700",
                        cursor: "pointer",
                      }}
                    >
                      Maybe later
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div
                    style={{
                      color: "#3f5f58",
                      fontWeight: "800",
                      textAlign: "center",
                      fontSize: "16px",
                    }}
                  >
                    Thank you for helping HIISSA grow ❤️
                  </div>

                  <p
                    style={{
                      textAlign: "center",
                      color: "#66706c",
                      fontSize: "13px",
                      lineHeight: "1.5",
                      margin: "7px 0 12px",
                    }}
                  >
                    What helped you, or what could HIISSA do better?
                    <br />
                    <span style={{ fontSize: "12px" }}>(Optional)</span>
                  </p>

                  <textarea
                    value={feedbackText}
                    onChange={(event) =>
                      setFeedbackText(event.target.value.slice(0, 1500))
                    }
                    placeholder="Write your feedback here…"
                    rows={4}
                    style={{
                      width: "100%",
                      resize: "vertical",
                      boxSizing: "border-box",
                      borderRadius: "14px",
                      border: "1px solid rgba(80, 102, 93, 0.2)",
                      padding: "12px",
                      fontFamily: "inherit",
                      fontSize: "14px",
                      lineHeight: "1.5",
                      outline: "none",
                      background: "#ffffff",
                      color: "#35443f",
                    }}
                  />

                  <div
                    style={{
                      color: "#77807c",
                      fontSize: "11px",
                      lineHeight: "1.5",
                      margin: "8px 2px 12px",
                    }}
                  >
                    🔒 Please don't include names or identifying personal
                    information.
                  </div>

                  {feedbackError && (
                    <div
                      role="alert"
                      style={{
                        color: "#8a4f4f",
                        background: "#fff6f4",
                        borderRadius: "12px",
                        padding: "9px 11px",
                        fontSize: "12px",
                        marginBottom: "10px",
                      }}
                    >
                      {feedbackError}
                    </div>
                  )}

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      gap: "9px",
                      flexWrap: "wrap",
                    }}
                  >
                    <button
                      type="button"
                      onClick={submitFeedback}
                      disabled={feedbackSending}
                      style={{
                        border: "0",
                        borderRadius: "999px",
                        padding: "10px 16px",
                        background: "#466f67",
                        color: "#fff",
                        fontWeight: "800",
                        cursor: feedbackSending ? "default" : "pointer",
                      }}
                    >
                      {feedbackSending ? "Sending…" : "Send feedback"}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setFeedbackFormOpen(false);
                        setFeedbackError("");
                      }}
                      disabled={feedbackSending}
                      style={{
                        border: "0",
                        background: "transparent",
                        color: "#68736f",
                        padding: "10px 12px",
                        fontWeight: "700",
                        cursor: feedbackSending ? "default" : "pointer",
                      }}
                    >
                      Back
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {feedbackThanks && (
            <div
              role="status"
              style={{
                margin: "6px 20px 18px",
                padding: "16px",
                borderRadius: "18px",
                background: "#f1f6f2",
                border: "1px solid rgba(80, 102, 93, 0.18)",
                color: "#466f67",
                fontWeight: "800",
                textAlign: "center",
              }}
            >
              Thank you ❤️ Your feedback has been received.
            </div>
          )}

          <div className="privacy">
            🔒 Please avoid sharing identifying or highly sensitive personal
            information such as your full name, address, phone number,
            passwords, financial details, or private account information.
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              padding: "0 15px 10px",
            }}
          >
            <button
              type="button"
              onClick={startListening}
              disabled={listening || loading}
              aria-label="Speak your message to HIISSA"
              style={{
                border: "1px solid rgba(80, 102, 93, 0.18)",
                background: listening ? "#e8f0ec" : "#fffdf8",
                color: "#466f67",
                borderRadius: "999px",
                padding: "10px 16px",
                fontWeight: "800",
                cursor: listening || loading ? "default" : "pointer",
              }}
            >
              {listening ? "🎤 Listening…" : "🎤 Speak to HIISSA"}
            </button>
          </div>

          {voiceHelp && (
            <div
              role="alert"
              style={{
                margin: "0 20px 14px",
                padding: "14px 16px",
                borderRadius: "16px",
                background: "#f4f7f3",
                border: "1px solid rgba(80, 102, 93, 0.18)",
                color: "#4e5954",
                fontSize: "13px",
                lineHeight: "1.6",
                textAlign: "center",
              }}
            >
              <strong style={{ color: "#466f67" }}>
                🎤 Want to speak to HIISSA?
              </strong>

              <br />

              Voice isn't available in this browser. If you opened HIISSA
              inside TikTok, copy the HIISSA link below, open Chrome or your
              phone browser, and paste the link there to use Speak to HIISSA.
              You can still type your message here.

              <br />

              <button
                type="button"
                onClick={copyHiissaLink}
                style={{
                  marginTop: "12px",
                  border: "0",
                  borderRadius: "999px",
                  padding: "10px 16px",
                  background: "#466f67",
                  color: "#fff",
                  fontWeight: "800",
                  cursor: "pointer",
                }}
              >
                {linkCopied ? "✓ Link copied" : "📋 Copy HIISSA link"}
              </button>
            </div>
          )}

<div
  style={{
    padding: "0 20px 12px",
  }}
>
  <button
    type="button"
   onClick={() => {
  if (!input.trim()) {
    setWordingModeActive(true);
    setConversationIntent(null);
    setShowIntentChoices(false);
    return;
  }

  helpMeWordThis();
}}
    disabled={loading || wordingLoading}
    style={{
     border: wordingModeActive
  ? "2px solid #587a70"
  : "1px solid rgba(80, 102, 93, 0.18)",
background: wordingModeActive ? "#eef5f2" : "#fffdf8",
      color: "#466f67",
      borderRadius: "999px",
      padding: "9px 14px",
      fontSize: "12px",
      fontWeight: "800",
    cursor:
  loading || wordingLoading
    ? "default"
    : "pointer",
opacity:
  loading || wordingLoading ? 0.6 : 1,
    }}
  >
    {wordingLoading ? "✨ Helping you word it…" : "✨ Help me word this"}
  </button>

  {wordingError && (
    <div
      role="alert"
      style={{
        marginTop: "10px",
        padding: "11px 13px",
        borderRadius: "14px",
        background: "#fff6f4",
        color: "#8a4f4f",
        fontSize: "12px",
        lineHeight: "1.5",
      }}
    >
      {wordingError}
    </div>
  )}

  {wordingSuggestion && (
    <div
      role="status"
      style={{
        marginTop: "10px",
        padding: "15px",
        borderRadius: "18px",
        background: "#f4f7f3",
        border: "1px solid rgba(80, 102, 93, 0.18)",
      }}
    >
      <div
        style={{
          color: "#3f5f58",
          fontWeight: "800",
          fontSize: "14px",
          marginBottom: "8px",
        }}
      >
        ✨ A clearer way to say it
      </div>

      <div
        style={{
          color: "#4f5b56",
          fontSize: "14px",
          lineHeight: "1.6",
          whiteSpace: "pre-wrap",
        }}
      >
        {wordingSuggestion}
      </div>

      <div
        style={{
          display: "flex",
          gap: "8px",
          flexWrap: "wrap",
          marginTop: "13px",
        }}
      >
        <button
          type="button"
          onClick={useWordingSuggestion}
          style={{
            border: "0",
            borderRadius: "999px",
            padding: "9px 14px",
            background: "#466f67",
            color: "#fff",
            fontWeight: "800",
            cursor: "pointer",
          }}
        >
          Use this version
        </button>

        <button
          type="button"
          onClick={keepOriginalWording}
          style={{
            border: "0",
            background: "transparent",
            color: "#68736f",
            padding: "9px 12px",
            fontWeight: "700",
            cursor: "pointer",
          }}
        >
          Keep my original
        </button>
      </div>
    </div>
  )}

  {wordingUndo && !wordingSuggestion && (
    <button
      type="button"
      onClick={undoWordingChange}
      style={{
        marginTop: "8px",
        border: "0",
        background: "transparent",
        color: "#68736f",
        padding: "5px 2px",
        fontSize: "12px",
        fontWeight: "700",
        cursor: "pointer",
      }}
    >
      ↩ Undo wording change
    </button>
  )}
</div>         
{(conversationIntent || wordingModeActive) && !showIntentChoices && (
  <div
    style={{
      margin: "0 0 10px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "10px",
      color: "#587a70",
      fontSize: "12px",
      fontWeight: "700",
      width: "100%",
    }}
  >
    <span>
      {conversationIntent === "listen" && "❤️ Just listen"}
      {conversationIntent === "understand" && "🧭 Help me understand"}
      {conversationIntent === "move_forward" && "🌱 Help me move forward"}
{wordingModeActive && "✨ Help me word this"}
    </span>

    <button
      type="button"
      onClick={() => {
  setWordingModeActive(false);
  setShowIntentChoices(true);
}}
      style={{
        background: "transparent",
        border: "none",
        padding: "4px 0",
        color: "#587a70",
        fontSize: "12px",
        fontWeight: "700",
        cursor: "pointer",
      }}
    >
      Change
    </button>
  </div>
)}
<form
            className="composer"
            onSubmit={(event) => {
              event.preventDefault();
              sendMessage();
            }}
          >
            <textarea
              value={input}
              onChange={(event) => {
  setInput(event.target.value);
  setWordingSuggestion("");
  setWordingOriginal("");
  setWordingError("");
}}
            placeholder={
  wordingModeActive
    ? "Tell me what you'd like help putting into words…"
    : conversationIntent === "understand"
    ? "Tell me what you're trying to understand…"
    : conversationIntent === "move_forward"
    ? "Tell me what you'd like help moving forward with…"
    : "Tell me what's on your heart…"
}
              rows={1}
               spellCheck={true} 
              autoCorrect="on"
              autoCapitalize="sentences"
            />

            <button
  type="submit"
  disabled={!input.trim() || loading || wordingLoading}
>
              Send ↑
            </button>
          </form>

          <p className="fine">
            HIISSA offers reflective AI guidance, not emergency, medical,
            legal, or professional mental-health care.
          </p>
        </section>

        {publicReviews.length > 0 && (
          <section
            aria-label="Public reviews"
            style={{
              marginTop: "22px",
              padding: "24px 20px",
              borderRadius: "24px",
              background: "rgba(255, 253, 248, 0.92)",
              border: "1px solid rgba(80, 102, 93, 0.16)",
              boxShadow: "0 14px 40px rgba(64, 86, 76, 0.08)",
            }}
          >
            <div style={{ textAlign: "center", marginBottom: "16px" }}>
              <div
                style={{
                  color: "#466f67",
                  fontSize: "12px",
                  fontWeight: "800",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  marginBottom: "6px",
                }}
              >
                Shared with permission
              </div>

              <h2
                style={{
                  margin: 0,
                  color: "#32453f",
                  fontSize: "24px",
                  lineHeight: "1.25",
                }}
              >
                What people are saying about HIISSA
              </h2>
            </div>

            <div
              style={{
                display: "grid",
                gap: "12px",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              }}
            >
              {publicReviews.map((review, index) => {
                const safeRating = Math.max(
                  0,
                  Math.min(5, Number(review.rating) || 0)
                );

                return (
                  <article
                    key={`${review.permission_date || "review"}-${index}`}
                    style={{
                      padding: "17px",
                      borderRadius: "18px",
                      background: "#ffffff",
                      border: "1px solid rgba(80, 102, 93, 0.14)",
                    }}
                  >
                    <div
                      aria-label={`${safeRating} out of 5 stars`}
                      style={{
                        color: "#b79a5b",
                        fontSize: "17px",
                        letterSpacing: "2px",
                        marginBottom: "9px",
                      }}
                    >
                      {"★".repeat(safeRating)}
                      <span style={{ color: "#dddcd6" }}>
                        {"★".repeat(5 - safeRating)}
                      </span>
                    </div>

                    <p
                      style={{
                        margin: 0,
                        color: "#4f5b56",
                        fontSize: "14px",
                        lineHeight: "1.65",
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      “{review.public_display_text}”
                    </p>
                  </article>
                );
              })}
            </div>
          </section>
        )}

        <footer>
          <b>HIISSA</b> · Healing is transformation, not erasure.
          <br />
          <a href="/privacy">Privacy</a>
        </footer>
      </section>
    {showExplore && (
  <div className="exploreOverlay">
    <div
      className="explorePanel"
      role="dialog"
      aria-modal="true"
      aria-labelledby="explore-title"
    >
      <div className="explorePanelHead">
        <div>
          <strong id="explore-title">✦ Explore HIISSA</strong>
          <p>What would feel right for you today?</p>
        </div>

        <button
          type="button"
          onClick={() => setShowExplore(false)}
          className="exploreClose"
          aria-label="Close Explore HIISSA"
        >
          ×
        </button>
      </div>

      <div className="explorePathwayList">
        {explorePathways.map((pathway) => (
          <button
            key={pathway.id}
            type="button"
            className="explorePathway"
            disabled={pathway.status !== "live"}
            onClick={() => {
              if (pathway.id === "talk") {
                setShowExplore(false);
              }
            }}
          >
            <span className="explorePathwayEmoji">{pathway.emoji}</span>

            <span className="explorePathwayText">
              <strong>{pathway.name}</strong>
              <small>{pathway.description}</small>
            </span>

            {pathway.status === "live" && (
              <span className="explorePathwayArrow">›</span>
            )}
          </button>
        ))}
      </div>

      <div className="exploreUnsure">
        <strong>Not sure what you need?</strong>
        <button
          type="button"
          onClick={() => setShowExplore(false)}
        >
          Tell HIISSA how you're feeling →
        </button>
      </div>
    </div>
  </div>
)}      
    </main>
  );
}
