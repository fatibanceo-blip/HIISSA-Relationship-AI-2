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

function clients() {
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
  const available = clients();
  if (!available) {
    return { ok: false, status: 503, reason: "STAGING_ADMIN_DATA_NOT_CONFIGURED" };
  }

  const authorization = request.headers.get("authorization") || "";
  const accessToken = authorization.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length).trim()
    : "";

  if (!accessToken) {
    return { ok: false, status: 401, reason: "UNAUTHENTICATED" };
  }

  const { data: userData, error: userError } =
    await available.verificationClient.auth.getUser(accessToken);

  if (userError || !userData?.user) {
    return { ok: false, status: 401, reason: "UNAUTHENTICATED" };
  }

  const { data: founder, error: founderError } = await available.adminClient
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
    adminClient: available.adminClient,
  };
}

export async function POST(request) {
  if (!environmentAllowed()) return blocked();

  const founder = await verifyFounder(request);
  if (!founder.ok) {
    return noStoreJson({ status: founder.reason }, founder.status);
  }

  let body = {};
  try {
    body = await request.json();
  } catch {
    return noStoreJson({ status: "INVALID_JSON" }, 400);
  }

  const localDate = String(body?.localDate || "").slice(0, 10);
  const localHour = Number(body?.localHour);
  const timeZone = String(body?.timeZone || "").slice(0, 100);

  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(localDate) ||
    !Number.isInteger(localHour) ||
    localHour < 0 ||
    localHour > 23
  ) {
    return noStoreJson({ status: "INVALID_LOCAL_CONTEXT" }, 400);
  }

  const [pendingApprovals, recentAudit] = await Promise.all([
    founder.adminClient
      .from("admin_approval_requests")
      .select("*", { count: "exact", head: true })
      .eq("environment", "staging")
      .eq("module_id", "customer_support")
      .eq("action_id", "staff_submit_for_processing")
      .eq("status", "pending"),
    founder.adminClient
      .from("admin_audit_events")
      .select("event_type,module_id,outcome,occurred_at")
      .eq("environment", "staging")
      .order("occurred_at", { ascending: false })
      .limit(1),
  ]);

  const failedSources = [];
  if (pendingApprovals.error) failedSources.push("founder-approval-inbox");
  if (recentAudit.error) failedSources.push("admin-audit-timeline");

  const pendingCount = pendingApprovals.error
    ? null
    : Number(pendingApprovals.count || 0);
  const latestAudit = recentAudit.error ? null : recentAudit.data?.[0] || null;

  const criticalSourceStatus = "NO_CERTIFIED_CRITICAL_SOURCE_CONNECTED";

  const { error: recordError } = await founder.adminClient
    .from("admin_audit_events")
    .insert({
      event_type: "people_experience_workday_close_opened",
      actor_user_id: founder.founderUserId,
      module_id: "overview",
      resource_id: "workday-close",
      action_id: "finish_for_now",
      outcome: failedSources.length ? "partial_source_visibility" : "recorded",
      oversight_level: 1,
      environment: "staging",
      details: {
        local_date: localDate,
        local_hour: localHour,
        time_zone: timeZone || null,
        pending_founder_approvals: pendingCount,
        critical_source_status: criticalSourceStatus,
        checked_sources: [
          "customer_support_founder_approval_inbox",
          "admin_audit_timeline",
        ],
        failed_sources: failedSources,
        external_effect_enabled: false,
        production_effect_enabled: false,
      },
    });

  if (recordError) {
    failedSources.push("workday-close-audit-record");
  }

  return noStoreJson({
    status: failedSources.length ? "PARTIAL" : "READY",
    scope: "founder-workday-close-staging",
    recordedAt: new Date().toISOString(),
    items: [
      {
        label: "Founder approvals waiting",
        value: pendingCount === null ? "Could not verify" : String(pendingCount),
        tone:
          pendingCount === null
            ? "attention"
            : pendingCount > 0
              ? "attention"
              : "good",
        detail:
          pendingCount === null
            ? "The working Customer Support approval source could not be read."
            : pendingCount > 0
              ? "These items remain safely in the Founder Approval Inbox until you decide them."
              : "No Customer Support staff submission is currently waiting in the connected Founder queue.",
      },
      {
        label: "Critical alert coverage",
        value: "Not connected yet",
        tone: "neutral",
        detail:
          "No certified critical-emergency source is connected to this Workday Close card yet, so HIISSA will not claim a full emergency all-clear.",
      },
      {
        label: "Latest recorded activity",
        value: latestAudit?.occurred_at ? "Recorded" : "No verified record",
        tone: latestAudit?.occurred_at ? "good" : "neutral",
        detail: latestAudit?.occurred_at
          ? `Latest connected audit activity exists at ${latestAudit.occurred_at}.`
          : "No recent connected audit record could be verified.",
      },
    ],
    caution:
      pendingCount && pendingCount > 0
        ? "There is work waiting for your decision. You can open Approvals now, or leave it safely in the persistent Founder queue for your next session."
        : "",
    sourceNote:
      "This closing summary currently checks the working Customer Support Founder Approval Inbox and Admin audit timeline only. Provider, reliability and other certified critical feeds will be added to the same Workday Close contract as they become operational.",
    failedSources,
    criticalSourceStatus,
    externalEffectPerformed: false,
    productionEffectPerformed: false,
  });
}
