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

export async function GET(request) {
  const branch = process.env.VERCEL_GIT_COMMIT_REF || "";
  const environment =
    process.env.VERCEL_TARGET_ENV || process.env.VERCEL_ENV || "";

  if (
    branch !== "feature/founder-control-room-staging" ||
    environment === "production"
  ) {
    return blocked();
  }

  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    !process.env.SUPABASE_SECRET_KEY
  ) {
    return NextResponse.json(
      { status: "UNAVAILABLE", reason: "STAGING_ADMIN_DATA_NOT_CONFIGURED" },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    );
  }

  const authorization = request.headers.get("authorization") || "";
  const accessToken = authorization.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length).trim()
    : "";

  if (!accessToken) {
    return NextResponse.json(
      { status: "UNAUTHENTICATED" },
      { status: 401, headers: { "Cache-Control": "no-store" } }
    );
  }

  const verificationClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    }
  );

  const { data: userData, error: userError } =
    await verificationClient.auth.getUser(accessToken);

  if (userError || !userData?.user) {
    return NextResponse.json(
      { status: "UNAUTHENTICATED" },
      { status: 401, headers: { "Cache-Control": "no-store" } }
    );
  }

  const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SECRET_KEY,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    }
  );

  const { data: adminRecord, error: adminError } = await adminClient
    .from("admin_users")
    .select("user_id")
    .eq("user_id", userData.user.id)
    .maybeSingle();

  if (adminError || !adminRecord) {
    return NextResponse.json(
      { status: "FORBIDDEN" },
      { status: 403, headers: { "Cache-Control": "no-store" } }
    );
  }

  const now = new Date().toISOString();

  const [
    legacyAdmins,
    activeRoles,
    activeRules,
    activeGrants,
    pendingApprovals,
    auditCount,
    roleRows,
    recentAudit,
  ] = await Promise.all([
    adminClient.from("admin_users").select("*", { count: "exact", head: true }),
    adminClient
      .from("admin_role_assignments")
      .select("*", { count: "exact", head: true })
      .is("revoked_at", null),
    adminClient
      .from("admin_permission_rules")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true),
    adminClient
      .from("admin_access_grants")
      .select("*", { count: "exact", head: true })
      .is("revoked_at", null)
      .or(`expires_at.is.null,expires_at.gt.${now}`),
    adminClient
      .from("admin_approval_requests")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending"),
    adminClient
      .from("admin_audit_events")
      .select("*", { count: "exact", head: true }),
    adminClient
      .from("admin_role_assignments")
      .select("role_id, environment, assigned_at")
      .is("revoked_at", null)
      .order("assigned_at", { ascending: false })
      .limit(20),
    adminClient
      .from("admin_audit_events")
      .select(
        "event_type,module_id,resource_id,action_id,outcome,oversight_level,environment,occurred_at"
      )
      .order("occurred_at", { ascending: false })
      .limit(10),
  ]);

  const sources = [
    legacyAdmins,
    activeRoles,
    activeRules,
    activeGrants,
    pendingApprovals,
    auditCount,
    roleRows,
    recentAudit,
  ];

  const errors = sources.filter((item) => item.error).map((item) => item.error.message);

  const response = NextResponse.json(
    {
      status: errors.length ? "NEEDS_ATTENTION" : "HEALTHY",
      scope: "read-only-staging-admin-security-summary",
      counts: {
        legacyAdminAccounts: legacyAdmins.count ?? null,
        activeRoleAssignments: activeRoles.count ?? null,
        activePermissionRules: activeRules.count ?? null,
        activeAccessGrants: activeGrants.count ?? null,
        pendingApprovals: pendingApprovals.count ?? null,
        auditEvents: auditCount.count ?? null,
      },
      activeRoleAssignments: roleRows.data || [],
      recentAuditEvents: recentAudit.data || [],
      supportedRoles: ROLE_LABELS.map(([id, label]) => ({ id, label })),
      managementControlsEnabled: false,
      rules: {
        denyByDefault: true,
        noSelfGrant: true,
        founderApprovalForL3: true,
        productionChangesEnabled: false,
      },
      errors: errors.length ? errors.map(() => "A protected Admin source could not be read.") : [],
    },
    {
      status: errors.length ? 503 : 200,
      headers: { "Cache-Control": "no-store" },
    }
  );

  return response;
}
