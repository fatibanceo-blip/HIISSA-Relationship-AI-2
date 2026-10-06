import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const AUTH_INSPECTION_CAP = 1000;
const RECENT_DAYS = 30;

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

function laterThan(value, thresholdMs) {
  if (!value) return false;
  const time = new Date(value).getTime();
  return Number.isFinite(time) && time >= thresholdMs;
}

function currentlyRestricted(user) {
  if (!user?.banned_until) return false;
  const time = new Date(user.banned_until).getTime();
  return Number.isFinite(time) && time > Date.now();
}

export async function GET(request) {
  if (!environmentAllowed()) return blocked();

  const founder = await verifyFounder(request);
  if (!founder.ok) {
    return noStoreJson({ status: founder.reason }, founder.status);
  }

  const [authResult, conversationsResult, migrationsResult] =
    await Promise.all([
      founder.adminClient.auth.admin.listUsers({
        page: 1,
        perPage: AUTH_INSPECTION_CAP,
      }),
      founder.adminClient
        .from("conversations")
        .select("id,user_id,created_at,updated_at,deleted_at"),
      founder.adminClient
        .from("guest_migration_handoffs")
        .select("id,status,claimed_by_user_id,created_at,claimed_at"),
    ]);

  const authAvailable = !authResult.error && Array.isArray(authResult.data?.users);
  const conversationsAvailable =
    !conversationsResult.error && Array.isArray(conversationsResult.data);
  const migrationsAvailable =
    !migrationsResult.error && Array.isArray(migrationsResult.data);

  const authUsers = authAvailable ? authResult.data.users : [];
  const conversations = conversationsAvailable ? conversationsResult.data : [];
  const migrations = migrationsAvailable ? migrationsResult.data : [];
  const inspectionCapped = authAvailable && authUsers.length >= AUTH_INSPECTION_CAP;

  const authIds = new Set(authUsers.map((user) => user.id).filter(Boolean));
  const ownerIds = new Set(
    conversations.map((row) => row.user_id).filter(Boolean)
  );

  const unownedConversations = conversations.filter(
    (row) => !row.user_id
  ).length;

  const unresolvedConversationOwners = inspectionCapped
    ? null
    : [...ownerIds].filter((id) => !authIds.has(id)).length;

  const claimedMigrations = migrations.filter(
    (row) => String(row.status || "").toLowerCase() === "claimed"
  );
  const unresolvedClaimedMigrationOwners = inspectionCapped
    ? null
    : claimedMigrations.filter(
        (row) =>
          !row.claimed_by_user_id || !authIds.has(row.claimed_by_user_id)
      ).length;

  const recentThreshold =
    Date.now() - RECENT_DAYS * 24 * 60 * 60 * 1000;

  const counts = {
    inspectedAuthAccounts: authAvailable ? authUsers.length : null,
    emailConfirmedAccounts: authAvailable
      ? authUsers.filter((user) => Boolean(user.email_confirmed_at)).length
      : null,
    accountsWithSignInHistory: authAvailable
      ? authUsers.filter((user) => Boolean(user.last_sign_in_at)).length
      : null,
    recentlySignedInAccounts: authAvailable
      ? authUsers.filter((user) =>
          laterThan(user.last_sign_in_at, recentThreshold)
        ).length
      : null,
    currentlyRestrictedAccounts: authAvailable
      ? authUsers.filter(currentlyRestricted).length
      : null,
    conversations: conversationsAvailable ? conversations.length : null,
    conversationOwners: conversationsAvailable ? ownerIds.size : null,
    unownedConversations: conversationsAvailable
      ? unownedConversations
      : null,
    unresolvedConversationOwners:
      authAvailable && conversationsAvailable
        ? unresolvedConversationOwners
        : null,
    guestMigrationHandoffs: migrationsAvailable ? migrations.length : null,
    claimedGuestMigrations: migrationsAvailable
      ? claimedMigrations.length
      : null,
    unresolvedClaimedMigrationOwners:
      authAvailable && migrationsAvailable
        ? unresolvedClaimedMigrationOwners
        : null,
  };

  const sourceUnavailable =
    !authAvailable || !conversationsAvailable || !migrationsAvailable;

  const ownershipFailure =
    unownedConversations > 0 ||
    (unresolvedConversationOwners ?? 0) > 0 ||
    (unresolvedClaimedMigrationOwners ?? 0) > 0;

  const displayHealthStatus = sourceUnavailable
    ? "UNAVAILABLE"
    : ownershipFailure
      ? "DEGRADED"
      : inspectionCapped
        ? "PARTIAL"
        : "MONITORING";

  const needsAttentionCount =
    Number(!authAvailable) +
    Number(!conversationsAvailable) +
    Number(!migrationsAvailable) +
    unownedConversations +
    Number(unresolvedConversationOwners || 0) +
    Number(unresolvedClaimedMigrationOwners || 0);

  const founderActionRequired = false;
  const actionOwner =
    needsAttentionCount > 0
      ? "HIISSA_TECHNICAL_OPERATIONS"
      : "HIISSA";

  const founderView = {
    whatHappened: sourceUnavailable
      ? "One or more protected Users & Identity sources could not be read. HIISSA is not treating missing evidence as Healthy."
      : ownershipFailure
        ? "The connected identity sources contain an ownership-integrity condition that needs technical investigation. No private conversation content was opened to detect it."
        : inspectionCapped
          ? `The first ${AUTH_INSPECTION_CAP} Auth accounts were inspected. Because the inspection cap was reached, HIISSA is reporting Partial rather than pretending the complete account population was verified.`
          : `${authUsers.length} authenticated Staging account${authUsers.length === 1 ? "" : "s"} and ${conversations.length} conversation ownership record${conversations.length === 1 ? "" : "s"} were checked against the connected identity sources.`,
    currentStatus: displayHealthStatus,
    affected:
      "Authenticated account state and conversation ownership integrity in Staging. This operational view does not expose email addresses, conversation titles or message content.",
    severity: ownershipFailure
      ? "MODERATE — IDENTITY / OWNERSHIP INTEGRITY"
      : sourceUnavailable
        ? "MODERATE — MONITORING SOURCE"
        : "NONE ESTABLISHED",
    userImpact: ownershipFailure
      ? "An ownership mismatch can affect whether HIISSA can confidently associate a persisted conversation or claimed Guest handoff with an existing authenticated identity."
      : "No current identity/ownership failure is established by the connected aggregate evidence.",
    whatHiissaAlreadyDid: sourceUnavailable
      ? "HIISSA stopped at the evidence boundary and did not invent account health."
      : "HIISSA compared account identifiers with ownership references internally and returned only aggregate operational results. It did not return private account identifiers, emails, conversation titles or message content.",
    doINeedToAct:
      "NO — routine identity/ownership investigation belongs to HIISSA Technical Operations unless a later condition reaches a separately defined Founder-authority boundary.",
    recoveryNextStep: ownershipFailure
      ? "Technical Operations should investigate the affected ownership reference, preserve existing records, avoid automatic account merging, verify the correct permanent identity and only then close the condition."
      : sourceUnavailable
        ? "Restore read-only source availability, rerun the privacy-safe comparison and verify the evidence before changing the status."
        : inspectionCapped
          ? "Extend the inspection through a certified paginated source before any full-population claim."
          : "Continue read-only monitoring. Account mutation, merge, ban/unban and private-content access remain outside this monitoring source.",
    verification:
      displayHealthStatus === "MONITORING"
        ? "The connected account and ownership sources are readable and the inspected references are coherent. Monitoring remains truthful because this aggregate source does not certify every identity workflow."
        : displayHealthStatus === "PARTIAL"
          ? "The connected sources are readable but the current inspection cap prevents full-population verification."
          : "The current condition remains open until the relevant source or ownership reference is corrected and verified.",
    finalResolution:
      displayHealthStatus === "MONITORING"
        ? "MONITORING — CONNECTED IDENTITY SOURCES"
        : displayHealthStatus === "PARTIAL"
          ? "PARTIAL — INSPECTION CAP REACHED"
          : displayHealthStatus === "UNAVAILABLE"
            ? "OPEN — SOURCE AVAILABILITY REQUIRED"
            : "OPEN — IDENTITY / OWNERSHIP INVESTIGATION REQUIRED",
  };

  if (sourceUnavailable) {
    console.error("Control Room Users & Identity source unavailable:", {
      auth: authResult.error?.message || null,
      conversations: conversationsResult.error?.message || null,
      migrations: migrationsResult.error?.message || null,
    });
  }

  return noStoreJson({
    status:
      ["DEGRADED", "UNAVAILABLE"].includes(displayHealthStatus)
        ? "NEEDS_ATTENTION"
        : "MONITORING",
    displayHealthStatus,
    scope: "read-only-staging-users-identity-health",
    monitoringStatus: sourceUnavailable
      ? "SOURCE_UNAVAILABLE"
      : inspectionCapped
        ? "CONNECTED_PARTIAL"
        : "CONNECTED",
    inspectionCap: AUTH_INSPECTION_CAP,
    inspectionCapped,
    evidenceWindowDays: RECENT_DAYS,
    founderActionRequired,
    needsAttentionCount,
    actionOwner,
    counts,
    sections: {
      accountIdentity: {
        status: authAvailable
          ? inspectionCapped
            ? "PARTIAL"
            : "MONITORING"
          : "UNAVAILABLE",
        sourceReadable: authAvailable,
        emailAddressesReturned: false,
        accountIdentifiersReturned: false,
      },
      ownershipIntegrity: {
        status: !conversationsAvailable || !authAvailable
          ? "UNAVAILABLE"
          : ownershipFailure
            ? "DEGRADED"
            : inspectionCapped
              ? "PARTIAL"
              : "MONITORING",
        sourceReadable: conversationsAvailable,
        conversationTitlesReturned: false,
        messageContentReturned: false,
      },
      guestContinuityCrossReference: {
        status: migrationsAvailable ? "MONITORING" : "UNAVAILABLE",
        sourceReadable: migrationsAvailable,
        tokenHashesReturned: false,
        payloadReturned: false,
        specialistOwner: "MODULE_7_AUTHENTICATION_AND_SYNC_HEALTH",
      },
      accountAdministration: {
        mutationEnabled: false,
        mergeEnabled: false,
        banUnbanEnabled: false,
        entitlementChangeEnabled: false,
        loginAsUserEnabled: false,
      },
    },
    founderView,
    privacyBoundary: {
      emailAddressesReturned: false,
      authUserIdsReturned: false,
      conversationIdsReturned: false,
      conversationTitlesReturned: false,
      messageContentReturned: false,
      authTokensReturned: false,
      sessionSecretsReturned: false,
      guestTokenHashesReturned: false,
      guestPayloadsReturned: false,
      automaticAccountMergePerformed: false,
    },
    productionEffectEnabled: false,
  });
}
