import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const CLAIMED_AT_EVIDENCE_INTRODUCED_AT =
  Date.parse("2026-09-27T17:58:13.000Z");

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

function safeCount(result) {
  return result?.error ? null : Number(result?.count || 0);
}

function isLegacyPreTimestampClaim(row) {
  if (!row || row.claimed_at) return false;

  const createdAt = Date.parse(row.created_at || "");
  const conversations = row?.payload?.conversations;

  return (
    Number.isFinite(createdAt) &&
    createdAt < CLAIMED_AT_EVIDENCE_INTRODUCED_AT &&
    Array.isArray(conversations) &&
    conversations.length === 0
  );
}

function newestIso(values) {
  const dates = values
    .filter(Boolean)
    .map((value) => new Date(value))
    .filter((value) => Number.isFinite(value.getTime()))
    .sort((a, b) => b - a);

  return dates[0]?.toISOString() || null;
}

function classify({
  sourceFailures,
  possibleIdentityConflicts,
  claimedMissingClaimedAt,
}) {
  if (sourceFailures > 0) return "UNAVAILABLE";
  if (possibleIdentityConflicts > 0) return "CRITICAL";
  if (claimedMissingClaimedAt > 0) return "DEGRADED";
  return "MONITORING";
}

export async function GET(request) {
  if (!environmentAllowed()) return blocked();

  const founder = await verifyFounder(request);
  if (!founder.ok) {
    return noStoreJson({ status: founder.reason }, founder.status);
  }

  const now = new Date().toISOString();
  const adminClient = founder.adminClient;

  const [
    usersResult,
    allHandoffsResult,
    pendingHandoffsResult,
    claimedHandoffsResult,
    expiredPendingResult,
    claimedMissingAtResult,
    activeConversationsResult,
    migratedConversationsResult,
    recentConversationRowsResult,
    migratedOwnershipRowsResult,
  ] = await Promise.all([
    adminClient.auth.admin.listUsers({ page: 1, perPage: 1000 }),
    adminClient
      .from("guest_migration_handoffs")
      .select("id", { count: "exact", head: true }),
    adminClient
      .from("guest_migration_handoffs")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),
    adminClient
      .from("guest_migration_handoffs")
      .select("id", { count: "exact", head: true })
      .eq("status", "claimed"),
    adminClient
      .from("guest_migration_handoffs")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending")
      .lte("expires_at", now),
    adminClient
      .from("guest_migration_handoffs")
      .select("id,created_at,claimed_at,payload")
      .eq("status", "claimed")
      .is("claimed_at", null)
      .limit(1000),
    adminClient
      .from("conversations")
      .select("id", { count: "exact", head: true })
      .is("deleted_at", null),
    adminClient
      .from("conversations")
      .select("id", { count: "exact", head: true })
      .not("guest_source_id", "is", null)
      .is("deleted_at", null),
    adminClient
      .from("conversations")
      .select("updated_at,last_message_at,guest_source_id")
      .is("deleted_at", null)
      .order("updated_at", { ascending: false })
      .limit(100),
    adminClient
      .from("conversations")
      .select("guest_source_id,user_id")
      .not("guest_source_id", "is", null)
      .is("deleted_at", null)
      .limit(1000),
  ]);

  const sourceErrors = [
    usersResult?.error,
    allHandoffsResult?.error,
    pendingHandoffsResult?.error,
    claimedHandoffsResult?.error,
    expiredPendingResult?.error,
    claimedMissingAtResult?.error,
    activeConversationsResult?.error,
    migratedConversationsResult?.error,
    recentConversationRowsResult?.error,
    migratedOwnershipRowsResult?.error,
  ].filter(Boolean);

  const ownershipMap = new Map();
  for (const row of migratedOwnershipRowsResult?.data || []) {
    const guestSourceId = String(row?.guest_source_id || "");
    const userId = String(row?.user_id || "");
    if (!guestSourceId || !userId) continue;

    const owners = ownershipMap.get(guestSourceId) || new Set();
    owners.add(userId);
    ownershipMap.set(guestSourceId, owners);
  }

  const possibleIdentityConflicts = [...ownershipMap.values()].filter(
    (owners) => owners.size > 1
  ).length;

  const authUsers = Array.isArray(usersResult?.data?.users)
    ? usersResult.data.users
    : [];
  const latestSignInAt = newestIso(
    authUsers.map((user) => user?.last_sign_in_at)
  );
  const latestPersistenceEvidenceAt = newestIso(
    (recentConversationRowsResult?.data || []).flatMap((row) => [
      row?.updated_at,
      row?.last_message_at,
    ])
  );

  const totalHandoffs = safeCount(allHandoffsResult);
  const pendingHandoffs = safeCount(pendingHandoffsResult);
  const claimedHandoffs = safeCount(claimedHandoffsResult);
  const expiredPendingHandoffs = safeCount(expiredPendingResult);
  const claimedMissingRows = claimedMissingAtResult?.error
    ? []
    : claimedMissingAtResult?.data || [];
  const legacyPreTimestampClaims = claimedMissingRows.filter(
    isLegacyPreTimestampClaim
  ).length;
  const claimedMissingClaimedAt = claimedMissingRows.filter(
    (row) => !isLegacyPreTimestampClaim(row)
  ).length;
  const activeConversations = safeCount(activeConversationsResult);
  const migratedGuestConversations = safeCount(migratedConversationsResult);

  const displayHealthStatus = classify({
    sourceFailures: sourceErrors.length,
    possibleIdentityConflicts,
    claimedMissingClaimedAt: Number(claimedMissingClaimedAt || 0),
  });

  const founderActionRequired = possibleIdentityConflicts > 0;
  const technicalAttentionRequired =
    sourceErrors.length > 0 || Number(claimedMissingClaimedAt || 0) > 0;

  const needsAttentionCount =
    Number(sourceErrors.length > 0) +
    Number(possibleIdentityConflicts > 0) +
    Number(Number(claimedMissingClaimedAt || 0) > 0);

  const signInStatus = usersResult?.error ? "UNAVAILABLE" : "MONITORING";
  const guestStatus =
    allHandoffsResult?.error || pendingHandoffsResult?.error
      ? "UNAVAILABLE"
      : "MONITORING";
  const saveContinueStatus =
    activeConversationsResult?.error || migratedConversationsResult?.error
      ? "UNAVAILABLE"
      : "MONITORING";
  const migrationStatus =
    possibleIdentityConflicts > 0
      ? "CRITICAL"
      : Number(claimedMissingClaimedAt || 0) > 0
        ? "DEGRADED"
        : sourceErrors.length > 0
          ? "UNAVAILABLE"
          : "MONITORING";

  const founderView = {
    whatHappened:
      possibleIdentityConflicts > 0
        ? "HIISSA detected more than one authenticated owner associated with the same Guest migration identifier. No automatic merge or ownership rewrite was attempted."
        : Number(claimedMissingClaimedAt || 0) > 0
          ? "HIISSA found at least one Guest handoff marked claimed without the expected claimed-at verification timestamp."
          : legacyPreTimestampClaims > 0
            ? "HIISSA recognised an older Staging Guest handoff created before claimed-at timestamp evidence was introduced. Its secure conversation payload is already cleared, so it is retained as historical evidence rather than treated as a current Save & Sync failure."
            : sourceErrors.length > 0
            ? "One or more protected Auth & Sync health sources could not be read, so HIISSA is not claiming the system is healthy."
            : "The protected Auth & Sync sources are readable. No ownership conflict is detected in the currently connected evidence, but some deeper failure sources are still being backfilled.",
    currentStatus: displayHealthStatus,
    affected:
      "Authentication visibility, Guest continuity, Save & Continue, Guest→Account migration and conversation-persistence health in Staging. The working Production Save & Sync core is not being changed.",
    incidentStartedAt: null,
    severity:
      possibleIdentityConflicts > 0
        ? "HIGH — OWNERSHIP / IDENTITY"
        : Number(claimedMissingClaimedAt || 0) > 0
          ? "MODERATE — MIGRATION EVIDENCE INTEGRITY"
          : sourceErrors.length > 0
            ? "MODERATE — MONITORING SOURCE"
            : "NONE ESTABLISHED",
    userImpact:
      possibleIdentityConflicts > 0
        ? "Conversation ownership could be ambiguous. HIISSA must not auto-merge or guess the correct owner."
        : Number(claimedMissingClaimedAt || 0) > 0
          ? "A migration record cannot currently prove its completion timestamp as strongly as required."
          : legacyPreTimestampClaims > 0
            ? "No current user-facing failure is established. HIISSA identified legacy pre-timestamp Staging evidence and did not disturb the working Save & Sync flow."
            : "No current user-facing failure is established by the connected read-only evidence.",
    evidenceClass: "OBSERVED",
    whatHiissaAlreadyDid:
      possibleIdentityConflicts > 0
        ? "HIISSA stopped at the ownership boundary and reported the conflict without changing accounts, conversations or migration records."
        : technicalAttentionRequired
          ? "HIISSA classified the read-only health problem and kept the protected Save & Sync core unchanged while routing investigation to the appropriate technical boundary."
          : legacyPreTimestampClaims > 0
            ? "HIISSA automatically recognised the known pre-timestamp Staging pattern, preserved the historical record, made no data mutation, and kept the working authentication and Save & Sync core unchanged."
            : "HIISSA read the privacy-safe operational evidence and preserved the existing working authentication and Save & Sync implementation unchanged.",
    doINeedToAct: founderActionRequired
      ? "YES — Founder-authorised review is required before any ownership or identity correction."
      : technicalAttentionRequired
        ? "NO — HIISSA Technical Operations owns the investigation. You are not being asked to repair authentication or migration data."
        : "NO — no Founder action is currently required.",
    availableActions: founderActionRequired
      ? [
          "Open an authorised identity/ownership review.",
          "Keep the affected migration path bounded until ownership is verified.",
          "Do not merge accounts or rewrite ownership automatically.",
        ]
      : [
          "No Founder repair action is required.",
          "Continue read-only monitoring while remaining Auth & Sync sources are connected.",
        ],
    recoveryNextStep: founderActionRequired
      ? "Verify permanent identity and ownership through an authorised review before any consequential correction. Recovery is not complete until ownership and persistence are re-verified."
      : technicalAttentionRequired
        ? "HIISSA Technical Operations should investigate the evidence gap without altering the protected working core, then retest and verify the resulting state."
        : "Continue monitoring. Failed-sign-in telemetry and deeper cross-device conflict evidence remain separate backfill work and must not be invented.",
    relatedEvents: {
      handoffsTotal: totalHandoffs,
      handoffsPending: pendingHandoffs,
      handoffsClaimed: claimedHandoffs,
      handoffsExpiredPending: expiredPendingHandoffs,
      claimedMissingClaimedAt,
      legacyPreTimestampClaims,
      activeConversations,
      migratedGuestConversations,
      possibleIdentityConflicts,
    },
    auditHistory: {
      latestSignInEvidenceAt: latestSignInAt,
      latestPersistenceEvidenceAt,
      sourceReadAt: now,
    },
    verification:
      displayHealthStatus === "MONITORING"
        ? legacyPreTimestampClaims > 0
          ? "Connected read-only sources are readable. HIISSA recognised legacy pre-timestamp Staging evidence without changing data. Full Auth & Sync verification is still not claimed because failed-sign-in and deeper cross-device conflict telemetry are not fully live-wired."
          : "Connected read-only sources are readable, but full Auth & Sync verification is not yet claimed because failed-sign-in and deeper cross-device conflict telemetry are not fully live-wired."
        : "The detected issue remains open until the relevant identity, migration or source condition is rechecked and evidence verifies recovery.",
    finalResolution:
      displayHealthStatus === "MONITORING"
        ? "MONITORING — PARTIAL LIVE EVIDENCE"
        : "OPEN — VERIFICATION REQUIRED",
    technicalDetails: {
      environment: "STAGING",
      canonicalFeatureId: "guest.save-sync",
      sourceFailures: sourceErrors.length,
      userListScope: "FIRST_1000_AUTH_USERS_MAXIMUM",
      rawPasswordsReturned: false,
      rawTokensReturned: false,
      rawCookiesReturned: false,
      conversationContentReturned: false,
      productionEffectEnabled: false,
    },
  };

  return noStoreJson({
    status:
      displayHealthStatus === "CRITICAL"
        ? "FOUNDER_REQUIRED"
        : displayHealthStatus === "DEGRADED"
          ? "NEEDS_ATTENTION"
          : displayHealthStatus === "UNAVAILABLE"
            ? "NEEDS_ATTENTION"
            : "MONITORING",
    displayHealthStatus,
    moduleId: "authentication-synchronisation-health",
    canonicalFeatureId: "guest.save-sync",
    monitoringStatus: "PARTIALLY_LIVE_WIRED",
    needsAttentionCount,
    founderActionRequired,
    actionOwner: founderActionRequired
      ? "FOUNDER"
      : technicalAttentionRequired
        ? "HIISSA_TECHNICAL_OPERATIONS"
        : "HIISSA",
    sections: {
      overallIdentityHealth: displayHealthStatus,
      signIn: {
        status: signInStatus,
        sourceReadable: !usersResult?.error,
        recentAuthenticatedUsersObserved: authUsers.length,
        latestSignInEvidenceAt: latestSignInAt,
        failedSignInTelemetry: "NOT_YET_LIVE_WIRED",
      },
      guestExperience: {
        status: guestStatus,
        handoffsTotal: totalHandoffs,
        handoffsPending: pendingHandoffs,
        expiredPendingHandoffs,
        note:
          "Guest is not an error. An expired handoff is reported as lifecycle evidence and is not automatically treated as a system defect.",
      },
      saveContinue: {
        status: saveContinueStatus,
        activeConversations,
        migratedGuestConversations,
        latestPersistenceEvidenceAt,
      },
      crossDeviceSync: {
        status: "MONITORING",
        permanentIdentityPrinciple:
          "Different devices may have different sessions while resolving to the same permanent user identity.",
        sessionConflictTelemetry: "NOT_YET_LIVE_WIRED",
      },
      guestAccountMigration: {
        status: migrationStatus,
        totalHandoffs,
        pendingHandoffs,
        claimedHandoffs,
        expiredPendingHandoffs,
        claimedMissingClaimedAt,
        legacyPreTimestampClaims,
        possibleIdentityConflicts,
      },
    },
    founderView,
    privacyBoundary: {
      guestIsNotAnError: true,
      skipIsNotFailedConversion: true,
      similarAccountsNeverAutoMerged: true,
      rawPasswordsReturned: false,
      rawTokensReturned: false,
      magicLinkCredentialsReturned: false,
      serviceRoleSecretsReturned: false,
      rawCookiesReturned: false,
      conversationContentReturned: false,
    },
    protectedCore: {
      existingStage4AuthAndSaveSyncPreserved: true,
      productionSaveSyncChanged: false,
      automaticDataMutationPerformed: false,
      legacyPreTimestampEvidenceRecognisedReadOnly: true,
      materialMigrationChangeRequiresFounderApproval: true,
    },
    productionEffectEnabled: false,
  });
}
