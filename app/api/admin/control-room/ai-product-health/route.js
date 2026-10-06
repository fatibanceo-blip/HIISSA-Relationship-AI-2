import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function blocked() {
  return new NextResponse(null, { status: 404 });
}

function noStoreJson(payload, status = 200) {
  return NextResponse.json(payload, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

function environmentAllowed() {
  const branch = process.env.VERCEL_GIT_COMMIT_REF || "";
  const environment =
    process.env.VERCEL_TARGET_ENV || process.env.VERCEL_ENV || "";

  return (
    branch === "feature/founder-control-room-staging" &&
    environment !== "production"
  );
}

function createClients() {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    !process.env.SUPABASE_SECRET_KEY
  ) {
    return null;
  }

  return {
    verificationClient: createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
        },
      }
    ),
    adminClient: createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SECRET_KEY,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
        },
      }
    ),
  };
}

async function verifyFounder(request) {
  const clients = createClients();
  if (!clients) {
    return {
      ok: false,
      status: 503,
      reason: "STAGING_ADMIN_DATA_NOT_CONFIGURED",
    };
  }

  const authorization = request.headers.get("authorization") || "";
  const accessToken = authorization.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length).trim()
    : "";

  if (!accessToken) {
    return { ok: false, status: 401, reason: "UNAUTHENTICATED" };
  }

  const { data: userData, error: userError } =
    await clients.verificationClient.auth.getUser(accessToken);

  if (userError || !userData?.user) {
    return { ok: false, status: 401, reason: "UNAUTHENTICATED" };
  }

  const { data: founder, error: founderError } = await clients.adminClient
    .from("admin_users")
    .select("user_id")
    .eq("user_id", userData.user.id)
    .maybeSingle();

  if (founderError || !founder) {
    return { ok: false, status: 403, reason: "FOUNDER_GATE_REQUIRED" };
  }

  return {
    ok: true,
    founderUserId: userData.user.id,
    adminClient: clients.adminClient,
  };
}

function parseBoolean(value) {
  if (value === true || value === "true") return true;
  if (value === false || value === "false") return false;
  return null;
}

function latestIso(rows, field = "created_at") {
  const values = rows
    .map((row) => row?.[field])
    .filter(Boolean)
    .map((value) => new Date(value))
    .filter((value) => Number.isFinite(value.getTime()))
    .sort((a, b) => b - a);

  return values[0]?.toISOString() || null;
}

function roundPercent(numerator, denominator) {
  if (!denominator) return null;
  return Math.round((numerator / denominator) * 1000) / 10;
}

function addCount(map, key) {
  const safeKey = String(key || "").trim() || "UNSPECIFIED";
  map.set(safeKey, (map.get(safeKey) || 0) + 1);
}

export async function GET(request) {
  if (!environmentAllowed()) return blocked();

  const founder = await verifyFounder(request);
  if (!founder.ok) {
    return noStoreJson({ status: founder.reason }, founder.status);
  }

  const adminClient = founder.adminClient;

  const [qualityResult, messageMetaResult, feedbackMetaResult] =
    await Promise.all([
      adminClient
        .from("quality_audit_records")
        .select("created_at,audit_record")
        .order("created_at", { ascending: false })
        .limit(1000),
      adminClient
        .from("messages")
        .select("created_at,role,language_code,locale")
        .order("created_at", { ascending: false })
        .limit(2000),
      adminClient
        .from("feedback")
        .select("created_at,rating,helpful,entry_type,suggestion_area")
        .order("created_at", { ascending: false })
        .limit(2000),
    ]);

  const sourceErrors = [
    qualityResult?.error,
    messageMetaResult?.error,
    feedbackMetaResult?.error,
  ].filter(Boolean);

  const qualityRows = qualityResult?.error ? [] : qualityResult?.data || [];
  const messageRows = messageMetaResult?.error ? [] : messageMetaResult?.data || [];
  const feedbackRows = feedbackMetaResult?.error ? [] : feedbackMetaResult?.data || [];

  let evaluatorSuccessCount = 0;
  let evaluatorFailureCount = 0;
  let evaluatorUnknownCount = 0;
  let regenerationTriggeredCount = 0;
  let successfulRegenerationCount = 0;
  let regenerationNeedsReviewCount = 0;

  const actionCounts = new Map();
  const supportModeCounts = new Map();
  const versionCounts = new Map();
  const categoryMap = new Map();

  for (const row of qualityRows) {
    const record =
      row?.audit_record && typeof row.audit_record === "object"
        ? row.audit_record
        : {};

    const evaluatorSuccess = parseBoolean(record.evaluatorSuccess);
    const regenerationTriggered = parseBoolean(record.regenerationTriggered);
    const action = String(record.action || "").trim().toLowerCase();

    if (evaluatorSuccess === true) evaluatorSuccessCount += 1;
    else if (evaluatorSuccess === false) evaluatorFailureCount += 1;
    else evaluatorUnknownCount += 1;

    if (regenerationTriggered === true) {
      regenerationTriggeredCount += 1;
      if (action === "pass" && evaluatorSuccess === true) {
        successfulRegenerationCount += 1;
      } else {
        regenerationNeedsReviewCount += 1;
      }
    }

    addCount(actionCounts, action || "unspecified");
    addCount(supportModeCounts, record.supportMode);
    addCount(versionCounts, record.version);

    const checks = Array.isArray(record.checks) ? record.checks : [];
    for (const check of checks) {
      const category = String(check?.category || "").trim() || "unspecified";
      const status = String(check?.status || "").trim().toLowerCase();
      const current = categoryMap.get(category) || {
        category,
        pass: 0,
        fail: 0,
        other: 0,
      };

      if (status === "pass") current.pass += 1;
      else if (status === "fail" || status === "failed") current.fail += 1;
      else current.other += 1;

      categoryMap.set(category, current);
    }
  }

  const qualityFailures = qualityRows.filter((row) => {
    const record = row?.audit_record || {};
    const success = parseBoolean(record.evaluatorSuccess);
    const action = String(record.action || "").trim().toLowerCase();
    return success === false || (action && action !== "pass");
  }).length;

  const evaluatedResponses = qualityRows.length;
  const qualityPassRate = roundPercent(
    evaluatorSuccessCount,
    evaluatedResponses
  );

  const assistantMessages = messageRows.filter(
    (row) => row?.role === "assistant"
  );
  const userMessages = messageRows.filter((row) => row?.role === "user");
  const languageTaggedMessages = messageRows.filter(
    (row) => typeof row?.language_code === "string" && row.language_code.trim()
  );

  const languageCounts = new Map();
  for (const row of languageTaggedMessages) {
    addCount(languageCounts, row.language_code);
  }

  const languageCoveragePercent = roundPercent(
    languageTaggedMessages.length,
    messageRows.length
  );

  const feedbackOnly = feedbackRows.filter(
    (row) => row?.entry_type === "feedback"
  );
  const recommendations = feedbackRows.filter(
    (row) => row?.entry_type === "recommendation"
  );
  const ratedFeedback = feedbackOnly
    .map((row) => Number(row?.rating))
    .filter((value) => Number.isFinite(value));
  const helpfulFeedback = feedbackOnly.filter(
    (row) => row?.helpful === true
  ).length;
  const helpfulKnown = feedbackOnly.filter(
    (row) => typeof row?.helpful === "boolean"
  ).length;

  const averageRating =
    ratedFeedback.length > 0
      ? Math.round(
          (ratedFeedback.reduce((sum, value) => sum + value, 0) /
            ratedFeedback.length) *
            100
        ) / 100
      : null;

  const helpfulPercentage = roundPercent(helpfulFeedback, helpfulKnown);

  const categorySummary = [...categoryMap.values()].sort((a, b) =>
    a.category.localeCompare(b.category)
  );
  const failedChecks = categorySummary.reduce(
    (sum, item) => sum + Number(item.fail || 0),
    0
  );

  const qualitySourceUnavailable = Boolean(qualityResult?.error);
  const displayHealthStatus =
    sourceErrors.length >= 2
      ? "UNAVAILABLE"
      : qualityFailures > 0 ||
          failedChecks > 0 ||
          regenerationNeedsReviewCount > 0
        ? "DEGRADED"
        : "MONITORING";

  const technicalAttentionRequired =
    sourceErrors.length > 0 ||
    qualityFailures > 0 ||
    failedChecks > 0 ||
    regenerationNeedsReviewCount > 0;

  const needsAttentionCount =
    Number(sourceErrors.length > 0) +
    Number(qualityFailures > 0 || failedChecks > 0) +
    Number(regenerationNeedsReviewCount > 0);

  const qualityStatus = qualitySourceUnavailable
    ? "UNAVAILABLE"
    : qualityFailures > 0 || failedChecks > 0
      ? "DEGRADED"
      : "MONITORING";

  const languageStatus = messageMetaResult?.error
    ? "UNAVAILABLE"
    : languageTaggedMessages.length === 0
      ? "PARTIAL"
      : "MONITORING";

  const feedbackStatus = feedbackMetaResult?.error
    ? "UNAVAILABLE"
    : "MONITORING";

  const latestQualityEvidenceAt = latestIso(qualityRows);
  const latestMessageMetadataAt = latestIso(messageRows);
  const latestFeedbackEvidenceAt = latestIso(feedbackRows);

  const founderView = {
    whatHappened:
      sourceErrors.length > 0
        ? "One or more protected AI & Product intelligence sources could not be read. HIISSA is not inventing missing quality, language or feedback metrics."
        : qualityFailures > 0 || failedChecks > 0
          ? "The existing Quality Evaluator audit source contains one or more non-passing quality results that require product-quality investigation."
          : regenerationNeedsReviewCount > 0
            ? "At least one recorded regeneration event does not currently have enough evidence to be treated as a successful recovery."
            : "The connected Quality Evaluator audit source is readable and the currently recorded evaluator checks are passing. Language and provider/model correlation remain only partially wired, so HIISSA does not claim full AI health.",
    currentStatus: displayHealthStatus,
    severity:
      qualityFailures > 0 || failedChecks > 0
        ? "MODERATE — AI QUALITY"
        : sourceErrors.length > 0
          ? "MODERATE — MONITORING SOURCE"
          : "NONE ESTABLISHED",
    userImpact:
      qualityFailures > 0 || failedChecks > 0
        ? "A quality regression may affect generated response quality. This read-only module does not expose private conversation text to diagnose it."
        : "No current user-facing AI failure is established by the connected aggregate evidence.",
    evidenceClass: "OBSERVED",
    whatHiissaAlreadyDid:
      technicalAttentionRequired
        ? "HIISSA identified the affected evidence boundary, kept the existing AI pipeline and Quality Evaluator unchanged, and routed the issue to the product-quality / technical investigation path."
        : "HIISSA read the existing privacy-safe Quality Evaluator audit evidence and aggregate product signals without changing generated responses, conversations, feedback records or the evaluator.",
    doINeedToAct:
      "NO — no Founder repair action is currently required. Any redesign, release intervention or material model/provider change remains Founder-gated.",
    availableActions: [
      "Review aggregate quality evidence.",
      "Open Product & Quality investigation if a repeated or material pattern appears.",
      "Do not weaken safeguarding, privacy, accessibility or multilingual quality to improve cost or engagement metrics.",
    ],
    recoveryNextStep:
      technicalAttentionRequired
        ? "Investigate the recorded quality/source condition, apply only bounded safe recovery where authorised, then retest and verify before closing the condition."
        : "Continue monitoring. Backfill explicit pre-display failure, richer regeneration-sequence, language-verification and model/provider correlation telemetry without changing the working response pipeline.",
    verification:
      displayHealthStatus === "MONITORING"
        ? "Connected evidence is readable, but full AI health is not claimed because several approved intelligence sources are still partial or not yet live-wired."
        : "The detected issue remains open until its evidence source is rechecked and recovery is verified.",
    finalResolution:
      displayHealthStatus === "MONITORING"
        ? "MONITORING — PARTIAL LIVE EVIDENCE"
        : "OPEN — VERIFICATION REQUIRED",
    relatedEvidence: {
      evaluatedResponses,
      evaluatorSuccessCount,
      evaluatorFailureCount,
      evaluatorUnknownCount,
      qualityPassRate,
      regenerationTriggeredCount,
      successfulRegenerationCount,
      regenerationNeedsReviewCount,
      assistantMessages: assistantMessages.length,
      userMessages: userMessages.length,
      languageTaggedMessages: languageTaggedMessages.length,
      languageCoveragePercent,
      feedbackRecords: feedbackOnly.length,
      recommendations: recommendations.length,
      averageRating,
      helpfulPercentage,
    },
    auditHistory: {
      latestQualityEvidenceAt,
      latestMessageMetadataAt,
      latestFeedbackEvidenceAt,
    },
    technicalDetails: {
      environment: "STAGING",
      qualitySource: "quality_audit_records",
      messageMetadataSource: "messages metadata only",
      feedbackSource: "feedback aggregate metadata only",
      qualityRowsRead: qualityRows.length,
      messageMetadataRowsRead: messageRows.length,
      feedbackMetadataRowsRead: feedbackRows.length,
      rawConversationContentReturned: false,
      privateFeedbackTextReturned: false,
      qualityReasonTextReturned: false,
      providerSecretsReturned: false,
      automaticRedesignPerformed: false,
      automaticReleasePerformed: false,
      productionEffectEnabled: false,
    },
  };

  return noStoreJson({
    status:
      displayHealthStatus === "UNAVAILABLE"
        ? "NEEDS_ATTENTION"
        : displayHealthStatus === "DEGRADED"
          ? "NEEDS_ATTENTION"
          : "MONITORING",
    displayHealthStatus,
    moduleId: "hiissa-ai-product-intelligence",
    monitoringStatus: "PARTIALLY_LIVE_WIRED",
    needsAttentionCount,
    founderActionRequired: false,
    actionOwner: technicalAttentionRequired
      ? "HIISSA_PRODUCT_QUALITY_TECHNICAL_OPERATIONS"
      : "HIISSA",
    sections: {
      qualityEvaluator: {
        status: qualityStatus,
        evaluatedResponses,
        evaluatorSuccessCount,
        evaluatorFailureCount,
        evaluatorUnknownCount,
        qualityPassRate,
        categorySummary,
        latestEvidenceAt: latestQualityEvidenceAt,
        preDisplayFailureTelemetry: "NOT_YET_SEPARATELY_LIVE_WIRED",
      },
      regeneration: {
        status:
          regenerationNeedsReviewCount > 0
            ? "DEGRADED"
            : qualitySourceUnavailable
              ? "UNAVAILABLE"
              : "MONITORING",
        regenerationTriggeredCount,
        successfulRegenerationCount,
        regenerationNeedsReviewCount,
        repeatedRegenerationFailureTelemetry:
          "NOT_YET_SEPARATELY_LIVE_WIRED",
        boundedRegenerationRequired: true,
      },
      languageIntelligence: {
        status: languageStatus,
        messageMetadataRowsObserved: messageRows.length,
        languageTaggedMessages: languageTaggedMessages.length,
        languageCoveragePercent,
        languageDistribution: [...languageCounts.entries()].map(
          ([language, count]) => ({ language, count })
        ),
        lifecycle:
          "Candidate → Technically Available → Testing → HIISSA Verified → Monitored → Reverification / Restricted",
        technicallySupportedIsNotVerified: true,
      },
      feedbackSignals: {
        status: feedbackStatus,
        sourceOfTruth: "MODULE_4_FEEDBACK_AND_RECOMMENDATIONS",
        feedbackRecords: feedbackOnly.length,
        recommendations: recommendations.length,
        averageRating,
        helpfulPercentage,
        privateFeedbackTextReturned: false,
      },
      youngHiissa: {
        status: "NOT_YET_LIVE_WIRED",
        surveillanceBoundary:
          "Developmental communication quality may be monitored without turning children into surveillance subjects.",
      },
      providerModelCorrelation: {
        status: "NOT_YET_LIVE_WIRED",
        sourceBoundary:
          "Provider operational evidence belongs to Module 9. Module 8 may correlate approved aggregate quality evidence later without duplicating the provider source.",
      },
      productIntelligence: {
        status: "PARTIAL",
        purposeMetricRule:
          "Measure whether a feature fulfils its human purpose; do not optimise emotional disclosure, dependency, attention or screen time for their own sake.",
        silentRedesignAllowed: false,
        silentReleaseAllowed: false,
      },
    },
    distributions: {
      actions: [...actionCounts.entries()].map(([value, count]) => ({
        value,
        count,
      })),
      supportModes: [...supportModeCounts.entries()].map(([value, count]) => ({
        value,
        count,
      })),
      evaluatorVersions: [...versionCounts.entries()].map(([value, count]) => ({
        value,
        count,
      })),
    },
    founderView,
    privacyBoundary: {
      rawConversationContentReturned: false,
      privateFeedbackTextReturned: false,
      qualityReasonTextReturned: false,
      providerSecretsReturned: false,
      vulnerabilityEngagementProfilingAllowed: false,
    },
    protectedCore: {
      existingConversationalIntelligencePreserved: true,
      existingQualityEvaluatorPreserved: true,
      automaticEvaluatorReplacementPerformed: false,
      automaticModelOrProviderChangePerformed: false,
      productionEffectEnabled: false,
    },
    productionEffectEnabled: false,
  });
}
