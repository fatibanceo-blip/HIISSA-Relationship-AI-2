import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const WINDOW_DAYS = 30;

function blocked(status = 404) {
  return new NextResponse(null, { status });
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

function normaliseToken(value) {
  return String(value || "").trim().toLowerCase();
}

function countBy(rows, field) {
  const counts = {};
  for (const row of rows || []) {
    const key = String(row?.[field] || "unspecified").trim() || "unspecified";
    counts[key] = Number(counts[key] || 0) + 1;
  }
  return counts;
}

function isExplicitOperationalFailure(row) {
  const status = normaliseToken(row?.response_status);
  const action = normaliseToken(row?.action_taken);
  const tokens = [
    "failed",
    "failure",
    "error",
    "delivery_failed",
    "unresolved",
    "needs_attention",
  ];
  return tokens.some(
    (token) => status === token || status.includes(token) || action === token
  );
}

function requiresFounder(row) {
  const metadata =
    row?.metadata && typeof row.metadata === "object" ? row.metadata : {};
  const status = normaliseToken(row?.response_status);
  const action = normaliseToken(row?.action_taken);

  return (
    metadata.founder_action_required === true ||
    metadata.founder_required === true ||
    status === "founder_required" ||
    action === "founder_required"
  );
}

export async function GET(request) {
  if (!environmentAllowed()) return blocked();

  const founder = await verifyFounder(request);
  if (!founder.ok) {
    return noStoreJson({ status: founder.reason }, founder.status);
  }

  const since = new Date(
    Date.now() - WINDOW_DAYS * 24 * 60 * 60 * 1000
  ).toISOString();

  const [countResult, recentResult] = await Promise.all([
    founder.adminClient
      .from("boundary_events")
      .select("*", { count: "exact", head: true })
      .gte("created_at", since),
    founder.adminClient
      .from("boundary_events")
      .select(
        "id,created_at,event_type,boundary_type,response_status,action_taken,metadata"
      )
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .limit(100),
  ]);

  const sourceAvailable = !countResult.error && !recentResult.error;
  const rows = sourceAvailable ? recentResult.data || [] : [];
  const founderRows = rows.filter(requiresFounder);
  const explicitFailureRows = rows.filter(isExplicitOperationalFailure);

  const displayHealthStatus = !sourceAvailable
    ? "UNAVAILABLE"
    : founderRows.length > 0
      ? "NEEDS_ATTENTION"
      : explicitFailureRows.length > 0
        ? "DEGRADED"
        : "MONITORING";

  const latestEvidenceAt = rows[0]?.created_at || null;
  const founderActionRequired = founderRows.length > 0;

  const founderView = {
    whatHappened: !sourceAvailable
      ? "The protected Safety, Privacy & Moderation evidence source could not be read. HIISSA is not treating missing evidence as Healthy."
      : rows.length === 0
        ? "Safety and privacy monitoring is connected, but there are no boundary events in the current Staging evidence window. No activity is not automatically labelled Healthy."
        : `${rows.length} safety/privacy boundary event${rows.length === 1 ? "" : "s"} are recorded in the current Staging evidence window. HIISSA is reporting operational evidence without exposing private conversation content.`,
    currentStatus: displayHealthStatus,
    affected:
      "Safety Support, privacy/consent boundaries, moderation and referral-integrity monitoring in Staging. This summary does not expose intimate conversation content.",
    severity: founderActionRequired
      ? "HIGH — FOUNDER-AUTHORITY BOUNDARY"
      : explicitFailureRows.length > 0
        ? "MODERATE — OPERATIONAL REVIEW"
        : "NONE ESTABLISHED",
    userImpact: founderActionRequired
      ? "A recorded boundary event explicitly indicates a Founder-authority condition and must remain contained until authorised review."
      : explicitFailureRows.length > 0
        ? "A recorded operational boundary condition may require specialist review before the affected pathway can be treated as resolved."
        : "No current user-facing safety/privacy failure is established by this connected aggregate evidence.",
    evidenceClass: "OBSERVED",
    whatHiissaAlreadyDid: !sourceAvailable
      ? "HIISSA stopped at the monitoring boundary and did not invent a Healthy result."
      : rows.length === 0
        ? "HIISSA confirmed that the protected boundary-event source is readable and preserved the no-activity state without fabricating incidents."
        : "HIISSA read the protected boundary-event source, kept private message content out of the Control Room summary and preserved the recorded boundary outcomes for authorised review.",
    doINeedToAct: founderActionRequired
      ? "YES — at least one recorded boundary event explicitly indicates a Founder-required condition."
      : "NO — no Founder action is established by the connected evidence. Routine monitoring and specialist investigation remain with HIISSA / authorised staff.",
    recoveryNextStep: founderActionRequired
      ? "Keep the affected pathway bounded, open only the authorised review needed for the recorded condition, preserve evidence and verify the safe state before closing it."
      : explicitFailureRows.length > 0
        ? "The authorised specialist pathway should investigate the recorded failure condition, preserve the evidence trail and verify recovery before marking it resolved."
        : "Continue read-only monitoring. Full consent propagation, safeguarding referral delivery, partner acknowledgement and reserved emergency pathways require their own certified sources before HIISSA may call them Healthy.",
    verification:
      displayHealthStatus === "MONITORING"
        ? "The boundary-event source is readable. Module 5 remains Monitoring because this source alone does not prove every safety, consent, moderation, referral and partner pathway is fully operational."
        : "The current condition remains open until the relevant authorised pathway is reviewed and verified.",
    finalResolution:
      displayHealthStatus === "MONITORING"
        ? "MONITORING — CONNECTED BOUNDARY SOURCE"
        : displayHealthStatus === "UNAVAILABLE"
          ? "OPEN — MONITORING SOURCE UNAVAILABLE"
          : "OPEN — AUTHORISED REVIEW / VERIFICATION REQUIRED",
  };

  if (!sourceAvailable) {
    console.error(
      "Control Room Safety/Privacy health source unavailable:",
      countResult.error?.message || recentResult.error?.message || "unknown error"
    );
  }

  return noStoreJson({
    status:
      displayHealthStatus === "MONITORING"
        ? "MONITORING"
        : "NEEDS_ATTENTION",
    displayHealthStatus,
    scope: "read-only-staging-safety-privacy-health",
    monitoringStatus: sourceAvailable ? "CONNECTED" : "SOURCE_UNAVAILABLE",
    evidenceWindowDays: WINDOW_DAYS,
    latestEvidenceAt,
    founderActionRequired,
    needsAttentionCount:
      founderRows.length + explicitFailureRows.length + Number(!sourceAvailable),
    actionOwner: founderActionRequired
      ? "FOUNDER_AUTHORISED_REVIEW"
      : explicitFailureRows.length > 0 || !sourceAvailable
        ? "HIISSA_SPECIALIST_OPERATIONS"
        : "HIISSA",
    counts: {
      boundaryEvents: sourceAvailable ? countResult.count ?? rows.length : null,
      founderRequired: sourceAvailable ? founderRows.length : null,
      explicitOperationalFailures: sourceAvailable
        ? explicitFailureRows.length
        : null,
      byBoundaryType: sourceAvailable ? countBy(rows, "boundary_type") : {},
      byEventType: sourceAvailable ? countBy(rows, "event_type") : {},
      byResponseStatus: sourceAvailable
        ? countBy(rows, "response_status")
        : {},
    },
    recentBoundaryEvents: rows.slice(0, 20).map((row) => ({
      created_at: row.created_at,
      event_type: row.event_type,
      boundary_type: row.boundary_type,
      response_status: row.response_status,
      action_taken: row.action_taken,
    })),
    sections: {
      safetySupport: {
        status: displayHealthStatus,
        boundaryEventSourceConnected: sourceAvailable,
        privateConversationContentReturned: false,
      },
      privacyConsent: {
        status: "MONITORING",
        boundaryEventSourceConnected: sourceAvailable,
        fullConsentPropagationLiveWired: false,
        unrestrictedPrivateContentAccessAllowed: false,
      },
      evidenceIntegrity: {
        status: "MONITORING",
        aggregateOperationalEvidenceConnected: sourceAvailable,
        rawSensitiveEvidenceReturned: false,
        authorisedReviewRequiredForSensitiveEvidence: true,
      },
      referralIntegrity: {
        status: "NOT_YET_SEPARATELY_LIVE_WIRED",
        deliveryVerificationConnected: false,
        partnerAcknowledgementConnected: false,
      },
      exceptionalEscalation: {
        status: "RESERVED_NOT_ENABLED",
        policeEmergencyDirectEscalationEnabled: false,
        breakGlassEnabled: false,
      },
    },
    founderView,
    privacyBoundary: {
      rawConversationContentReturned: false,
      rawBoundaryMetadataReturned: false,
      rawSecretsReturned: false,
      unrestrictedSensitiveEvidenceReturned: false,
    },
    productionEffectEnabled: false,
  });
}
