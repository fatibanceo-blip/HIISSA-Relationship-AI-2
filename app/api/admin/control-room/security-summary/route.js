import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const ROLE_LABELS = [
  ["founder", "Founder"],
  ["technical_operations", "Technical Operations"],
  ["customer_support", "Customer Support"],
  ["finance_subscriptions", "Finance & Subscriptions"],
  ["safety_safeguarding", "Safety & Safeguarding"],
  ["privacy_data_protection", "Privacy & Data Protection"],
  ["content_moderation", "Content & Moderation"],
  ["product_quality", "Product & Quality"],
];

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

  const { data: adminRecord, error: adminError } = await clients.adminClient
    .from("admin_users")
    .select("user_id")
    .eq("user_id", userData.user.id)
    .maybeSingle();

  if (adminError || !adminRecord) {
    return { ok: false, status: 403, reason: "FOUNDER_GATE_REQUIRED" };
  }

  return {
    ok: true,
    founderUserId: userData.user.id,
    adminClient: clients.adminClient,
  };
}

function sameId(left, right) {
  return Boolean(left && right && String(left) === String(right));
}

function isExpired(value, nowMs) {
  if (!value) return false;
  const time = Date.parse(value);
  return Number.isFinite(time) && time <= nowMs;
}

function latestIso(rows, field = "occurred_at") {
  const values = (rows || [])
    .map((row) => row?.[field])
    .filter(Boolean)
    .map((value) => new Date(value))
    .filter((value) => Number.isFinite(value.getTime()))
    .sort((a, b) => b - a);

  return values[0]?.toISOString() || null;
}

export async function GET(request) {
  if (!environmentAllowed()) return blocked();

  const founder = await verifyFounder(request);
  if (!founder.ok) {
    return noStoreJson({ status: founder.reason }, founder.status);
  }

  const adminClient = founder.adminClient;
  const nowMs = Date.now();

  const [
    legacyAdmins,
    activeRoles,
    activeRules,
    activeGrants,
    pendingApprovals,
    auditCount,
    recentAudit,
    auditHealthRows,
  ] = await Promise.all([
    adminClient.from("admin_users").select("*", { count: "exact", head: true }),
    adminClient
      .from("admin_role_assignments")
      .select(
        "user_id,role_id,environment,assigned_by,assigned_at,revoked_at"
      )
      .is("revoked_at", null)
      .order("assigned_at", { ascending: false })
      .limit(1000),
    adminClient
      .from("admin_permission_rules")
      .select(
        "role_id,module_id,resource_id,action_id,effect,oversight_level,environment,is_active"
      )
      .eq("is_active", true)
      .limit(1000),
    adminClient
      .from("admin_access_grants")
      .select(
        "user_id,resource_id,action_id,environment,granted_by,granted_at,expires_at,revoked_at"
      )
      .is("revoked_at", null)
      .limit(1000),
    adminClient
      .from("admin_approval_requests")
      .select(
        "id,requested_by,action_id,module_id,resource_id,environment,oversight_level,status,created_at,expires_at"
      )
      .eq("status", "pending")
      .limit(1000),
    adminClient
      .from("admin_audit_events")
      .select("*", { count: "exact", head: true }),
    adminClient
      .from("admin_audit_events")
      .select(
        "event_type,module_id,resource_id,action_id,outcome,oversight_level,environment,occurred_at"
      )
      .order("occurred_at", { ascending: false })
      .limit(10),
    adminClient
      .from("admin_audit_events")
      .select(
        "event_type,actor_user_id,target_user_id,module_id,resource_id,action_id,outcome,oversight_level,approval_request_id,environment,occurred_at"
      )
      .order("occurred_at", { ascending: false })
      .limit(1000),
  ]);

  const sources = [
    ["admin-gate", legacyAdmins],
    ["role-assignments", activeRoles],
    ["permission-rules", activeRules],
    ["access-grants", activeGrants],
    ["approval-requests", pendingApprovals],
    ["audit-count", auditCount],
    ["recent-audit", recentAudit],
    ["audit-health", auditHealthRows],
  ];

  const failedSources = sources
    .filter(([, result]) => result.error)
    .map(([label]) => label);

  const roleRows = activeRoles.error ? [] : activeRoles.data || [];
  const ruleRows = activeRules.error ? [] : activeRules.data || [];
  const grantRows = activeGrants.error ? [] : activeGrants.data || [];
  const approvalRows = pendingApprovals.error
    ? []
    : pendingApprovals.data || [];
  const auditRows = auditHealthRows.error
    ? []
    : auditHealthRows.data || [];

  const activeAccessGrantRows = grantRows.filter(
    (grant) => !isExpired(grant.expires_at, nowMs)
  );
  const expiredUnrevokedGrants = grantRows.filter((grant) =>
    isExpired(grant.expires_at, nowMs)
  );
  const selfGrantedAccess = activeAccessGrantRows.filter((grant) =>
    sameId(grant.user_id, grant.granted_by)
  );
  const selfAssignedRoles = roleRows.filter((assignment) =>
    sameId(assignment.user_id, assignment.assigned_by)
  );

  const stalePendingApprovals = approvalRows.filter((approval) =>
    isExpired(approval.expires_at, nowMs)
  );
  const pendingL3Approvals = approvalRows.filter(
    (approval) => Number(approval.oversight_level || 0) >= 3
  );

  const l1AuditEvents = auditRows.filter(
    (event) => Number(event.oversight_level || 0) === 1
  ).length;
  const l3AuditEvents = auditRows.filter(
    (event) => Number(event.oversight_level || 0) >= 3
  ).length;
  const unattributedL3AuditEvents = auditRows.filter(
    (event) =>
      Number(event.oversight_level || 0) >= 3 && !event.actor_user_id
  );

  const failedAuditOutcomes = auditRows.filter((event) =>
    ["failed", "failure", "error"].includes(
      String(event.outcome || "").trim().toLowerCase()
    )
  );

  const blockedOrDeniedAuditEvents = auditRows.filter((event) =>
    ["blocked", "denied"].includes(
      String(event.outcome || "").trim().toLowerCase()
    )
  ).length;

  const productionAuditEvents = auditRows.filter(
    (event) => String(event.environment || "").toLowerCase() === "production"
  ).length;
  const productionRoleAssignments = roleRows.filter(
    (assignment) =>
      String(assignment.environment || "").toLowerCase() === "production"
  ).length;
  const productionAccessGrants = activeAccessGrantRows.filter(
    (grant) => String(grant.environment || "").toLowerCase() === "production"
  ).length;

  const l3PermissionRules = ruleRows.filter(
    (rule) => Number(rule.oversight_level || 0) >= 3
  ).length;
  const denyRules = ruleRows.filter(
    (rule) => String(rule.effect || "").toLowerCase() === "deny"
  ).length;
  const invalidPermissionEffects = ruleRows.filter(
    (rule) =>
      !["allow", "deny"].includes(
        String(rule.effect || "").trim().toLowerCase()
      )
  );

  const criticalConditions = [
    selfGrantedAccess.length > 0
      ? "An active Admin access grant appears to have been self-granted."
      : "",
    selfAssignedRoles.length > 0
      ? "An active Admin role assignment appears to have been self-assigned."
      : "",
    unattributedL3AuditEvents.length > 0
      ? "At least one L3 audit event is missing an attributable actor."
      : "",
    invalidPermissionEffects.length > 0
      ? "At least one active permission rule has an unrecognised effect."
      : "",
  ].filter(Boolean);

  const attentionConditions = [
    stalePendingApprovals.length > 0
      ? "At least one pending Admin approval is past its recorded expiry time."
      : "",
    failedAuditOutcomes.length > 0
      ? "At least one recorded Admin event has a failed/error outcome."
      : "",
  ].filter(Boolean);

  const criticalCount = criticalConditions.length;

  const displayHealthStatus =
    criticalCount > 0
      ? "CRITICAL"
      : failedSources.length > 0
        ? "UNAVAILABLE"
        : attentionConditions.length > 0
          ? "DEGRADED"
          : "MONITORING";

  const status =
    displayHealthStatus === "MONITORING" ? "MONITORING" : "NEEDS_ATTENTION";

  const founderActionRequired = criticalCount > 0;

  const founderView = {
    whatHappened:
      criticalCount > 0
        ? criticalConditions.join(" ")
        : failedSources.length > 0
          ? "One or more protected Admin Security evidence sources could not be read. HIISSA is not treating missing evidence as Healthy."
          : attentionConditions.length > 0
            ? attentionConditions.join(" ")
            : "The connected Staging security, permission, approval and audit sources are readable. No current self-grant, self-assignment, unattributed L3 audit event or failed security outcome is established.",
    currentStatus: displayHealthStatus,
    severity:
      criticalCount > 0
        ? "CRITICAL — ADMIN SECURITY"
        : attentionConditions.length > 0 || failedSources.length > 0
          ? "MODERATE — SECURITY / AUDIT"
          : "NONE ESTABLISHED",
    userImpact:
      criticalCount > 0
        ? "An Admin authority or audit-integrity condition may weaken accountable access control until reviewed and contained."
        : "No current user-facing security failure is established by the connected Staging evidence.",
    evidenceClass: "OBSERVED",
    whatHiissaAlreadyDid:
      criticalCount > 0
        ? "HIISSA detected and classified the security-control evidence without widening permissions, deleting history, impersonating a user or changing Production."
        : "HIISSA read the protected Admin access and audit evidence without changing roles, permissions, grants, approvals or Production.",
    doINeedToAct:
      criticalCount > 0
        ? "YES — a verified Admin security condition requires authorised Founder review. HIISSA must preserve evidence and avoid unsafe automatic permission changes."
        : "NO — no Founder repair action is currently required. Routine monitoring and technical investigation remain with HIISSA / Technical Operations.",
    recoveryNextStep:
      criticalCount > 0
        ? "Review the affected authority/audit condition, contain access only through an authorised security path, verify the intended permission boundary, preserve the audit trail, then close only after healthy evidence returns."
        : failedSources.length > 0
          ? "Restore the unreadable monitoring source, recheck the same evidence and verify recovery before claiming healthy security."
          : attentionConditions.length > 0
            ? "Investigate the recorded condition, preserve the audit trail and verify the correct approval/access state before closing it."
            : "Continue read-only monitoring. Keep staff-management changes, step-up authentication and exceptional-access activation behind their separate certification gates.",
    verification:
      displayHealthStatus === "MONITORING"
        ? "Connected Admin Security evidence is readable, but the module remains Monitoring because staff-management controls, step-up authentication and Exceptional/Break-Glass access are not fully operationally live-wired."
        : "The security condition remains open until the same protected evidence is rechecked and recovery is verified.",
    finalResolution:
      displayHealthStatus === "MONITORING"
        ? "MONITORING — CONNECTED SECURITY FOUNDATION"
        : "OPEN — VERIFICATION REQUIRED",
  };

  if (failedSources.length) {
    console.error(
      "Control Room Admin Security summary partial-source failure:",
      failedSources.join(",")
    );
  }

  return noStoreJson({
    status,
    displayHealthStatus,
    scope: "read-only-staging-admin-security-summary",
    monitoringStatus: "PARTIALLY_LIVE_WIRED",
    criticalCount,
    criticalMessage: criticalConditions[0] || "",
    criticalSourceStatus:
      criticalCount > 0
        ? "VERIFIED_SECURITY_CONDITION"
        : "NO_VERIFIED_CRITICAL_CONDITION",
    founderActionRequired,
    needsAttentionCount:
      criticalCount + attentionConditions.length + Number(failedSources.length > 0),
    actionOwner:
      criticalCount > 0
        ? "FOUNDER_SECURITY_REVIEW"
        : attentionConditions.length > 0 || failedSources.length > 0
          ? "HIISSA_TECHNICAL_OPERATIONS"
          : "HIISSA",
    counts: {
      legacyAdminAccounts: legacyAdmins.count ?? null,
      activeRoleAssignments: activeRoles.error ? null : roleRows.length,
      activePermissionRules: activeRules.error ? null : ruleRows.length,
      activeAccessGrants: activeGrants.error
        ? null
        : activeAccessGrantRows.length,
      expiredUnrevokedGrants: activeGrants.error
        ? null
        : expiredUnrevokedGrants.length,
      pendingApprovals: pendingApprovals.error
        ? null
        : approvalRows.length,
      stalePendingApprovals: pendingApprovals.error
        ? null
        : stalePendingApprovals.length,
      pendingL3Approvals: pendingApprovals.error
        ? null
        : pendingL3Approvals.length,
      auditEvents: auditCount.count ?? null,
      l1AuditEvents: auditHealthRows.error ? null : l1AuditEvents,
      l3AuditEvents: auditHealthRows.error ? null : l3AuditEvents,
      unattributedL3AuditEvents: auditHealthRows.error
        ? null
        : unattributedL3AuditEvents.length,
      failedAuditOutcomes: auditHealthRows.error
        ? null
        : failedAuditOutcomes.length,
      blockedOrDeniedAuditEvents: auditHealthRows.error
        ? null
        : blockedOrDeniedAuditEvents,
      selfGrantedAccess: activeGrants.error
        ? null
        : selfGrantedAccess.length,
      selfAssignedRoles: activeRoles.error
        ? null
        : selfAssignedRoles.length,
      l3PermissionRules: activeRules.error ? null : l3PermissionRules,
      denyRules: activeRules.error ? null : denyRules,
      productionAuditEvents: auditHealthRows.error
        ? null
        : productionAuditEvents,
      productionRoleAssignments: activeRoles.error
        ? null
        : productionRoleAssignments,
      productionAccessGrants: activeGrants.error
        ? null
        : productionAccessGrants,
    },
    sections: {
      adminGate: {
        status: legacyAdmins.error ? "UNAVAILABLE" : "MONITORING",
        authorisedAccounts: legacyAdmins.count ?? null,
        newerRoleFoundationActiveAssignments: activeRoles.error
          ? null
          : roleRows.length,
        managementControlsEnabled: false,
      },
      permissions: {
        status:
          invalidPermissionEffects.length > 0 ? "CRITICAL" : "MONITORING",
        activeRules: activeRules.error ? null : ruleRows.length,
        l3Rules: activeRules.error ? null : l3PermissionRules,
        denyRules: activeRules.error ? null : denyRules,
        invalidEffects: activeRules.error
          ? null
          : invalidPermissionEffects.length,
        denyByDefault: true,
        noSelfGrant: true,
      },
      temporaryAccess: {
        status:
          selfGrantedAccess.length > 0 ? "CRITICAL" : "MONITORING",
        activeGrants: activeGrants.error
          ? null
          : activeAccessGrantRows.length,
        expiredUnrevokedGrants: activeGrants.error
          ? null
          : expiredUnrevokedGrants.length,
        selfGrantedAccess: activeGrants.error
          ? null
          : selfGrantedAccess.length,
      },
      approvals: {
        status:
          stalePendingApprovals.length > 0 ? "DEGRADED" : "MONITORING",
        pending: pendingApprovals.error ? null : approvalRows.length,
        pendingL3: pendingApprovals.error
          ? null
          : pendingL3Approvals.length,
        stalePending: pendingApprovals.error
          ? null
          : stalePendingApprovals.length,
        founderApprovalForL3: true,
      },
      auditIntegrity: {
        status:
          unattributedL3AuditEvents.length > 0
            ? "CRITICAL"
            : failedAuditOutcomes.length > 0
              ? "DEGRADED"
              : "MONITORING",
        totalEvents: auditCount.count ?? null,
        l1Events: auditHealthRows.error ? null : l1AuditEvents,
        l3Events: auditHealthRows.error ? null : l3AuditEvents,
        unattributedL3Events: auditHealthRows.error
          ? null
          : unattributedL3AuditEvents.length,
        failedOutcomes: auditHealthRows.error
          ? null
          : failedAuditOutcomes.length,
        blockedOrDeniedEvents: auditHealthRows.error
          ? null
          : blockedOrDeniedAuditEvents,
        latestEvidenceAt: auditHealthRows.error
          ? null
          : latestIso(auditRows),
        casualDeletionAllowed: false,
        correctionsPreserveProvenance: true,
      },
      exceptionalAccess: {
        status: "RESERVED_NOT_ENABLED",
        normalOperationalViewSeparate: true,
        authorisedReviewSeparate: true,
        breakGlassEnabled: false,
        unrestrictedLoginAsUserAllowed: false,
        stepUpAuthentication: "NOT_YET_SEPARATELY_LIVE_WIRED",
      },
      environmentSeparation: {
        status: "MONITORING",
        productionChangesEnabled: false,
        productionRoleAssignments: activeRoles.error
          ? null
          : productionRoleAssignments,
        productionAccessGrants: activeGrants.error
          ? null
          : productionAccessGrants,
        productionAuditEventsObserved: auditHealthRows.error
          ? null
          : productionAuditEvents,
      },
    },
    activeRoleAssignments: roleRows.map((row) => ({
      role_id: row.role_id,
      environment: row.environment,
      assigned_at: row.assigned_at,
    })),
    recentAuditEvents: recentAudit.error ? [] : recentAudit.data || [],
    supportedRoles: ROLE_LABELS.map(([id, label]) => ({ id, label })),
    managementControlsEnabled: false,
    rules: {
      denyByDefault: true,
      noSelfGrant: true,
      founderApprovalForL3: true,
      productionChangesEnabled: false,
      noFabricatedCriticalAlerts: true,
      noInvisibleLoginAsUser: true,
      breakGlassEnabled: false,
    },
    founderView,
    privacyBoundary: {
      rawPasswordsReturned: false,
      rawSecretsReturned: false,
      rawTokensReturned: false,
      privateConversationContentReturned: false,
      auditDetailsPayloadReturned: false,
    },
    protectedCore: {
      roleAssignmentsMutated: false,
      permissionRulesMutated: false,
      accessGrantsMutated: false,
      approvalRequestsMutated: false,
      auditHistoryMutated: false,
      productionEffectEnabled: false,
    },
    failedSources,
    errors: failedSources.map(
      () => "A protected Admin Security source could not be read."
    ),
    refreshedAt: new Date().toISOString(),
    productionEffectEnabled: false,
  });
}
