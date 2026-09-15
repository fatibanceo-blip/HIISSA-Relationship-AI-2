// HIISSA Conversational Intelligence Foundation
// Stage: CI Foundation
//
// Purpose:
// Creates a safe, structured conversation-understanding object that
// future HIISSA intelligence layers can progressively enrich.
//
// Important:
// This foundation does not diagnose, label, infer hidden intentions,
// or replace HIISSA's existing conversation behaviour.

export const CI_VERSION = "ci-foundation-v1";

export function createConversationUnderstanding({
  userMessage = "",
  conversationMessages = [],
  explicitIntent = null,
  continuityContext = null,
} = {}) {
  const safeUserMessage =
    typeof userMessage === "string" ? userMessage.trim() : "";

  const safeConversationMessages = Array.isArray(conversationMessages)
    ? conversationMessages
    : [];

  return {
    version: CI_VERSION,

    input: {
      userMessage: safeUserMessage,
      conversationMessages: safeConversationMessages,
      explicitIntent: explicitIntent ?? null,
      continuityContext: continuityContext ?? null,
    },

    understanding: {
      primaryNeed: null,
      conversationGoal: null,

      whatHappened: [],
      known: [],
      suspected: [],
      felt: [],
      needed: [],
      controllable: [],

      emotionalMeaning: null,
      emotionalIntensity: null,

      patternStatus: "unknown",
      repeatedPattern: null,

      wordsBehaviourFollowThrough: {
        words: [],
        behaviour: [],
        followThrough: [],
      },

      uncertainty: {
        present: true,
        notes: [],
      },

      conversationDepth: "normal",
      needsFollowUpQuestion: false,
      followUpReason: null,

      responseStrategy: null,
      suggestedExperience: null,
    },

    safeguards: {
      preserveUncertainty: true,
      avoidAutomaticLabels: true,
      avoidMindReading: true,
      avoidFalseCertainty: true,
      avoidUnnecessaryQuestions: true,
      avoidRepeatedAdvice: true,
      preserveUserAgency: true,
      preserveExistingSafetyBehaviour: true,
    },

    routing: {
      mode: "conversation",
      experience: null,
      voiceCompatible: true,
      multilingualCompatible: true,
    },

    status: {
      foundationReady: true,
      enriched: false,
      fallbackSafe: true,
    },
  };
}

export function createSafeConversationFallback({
  userMessage = "",
  conversationMessages = [],
  explicitIntent = null,
  continuityContext = null,
} = {}) {
  const fallback = createConversationUnderstanding({
    userMessage,
    conversationMessages,
    explicitIntent,
    continuityContext,
  });

  return {
    ...fallback,

    understanding: {
      ...fallback.understanding,
      uncertainty: {
        present: true,
        notes: ["Conversational intelligence enrichment unavailable."],
      },
    },

    status: {
      ...fallback.status,
      foundationReady: true,
      enriched: false,
      fallbackSafe: true,
      fallbackUsed: true,
    },
  };
}
