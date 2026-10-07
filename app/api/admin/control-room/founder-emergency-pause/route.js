import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const ALLOWED_SCOPES = Object.freeze({
  customer_support_outgoing_actions: "Customer Support outgoing actions",
  staff_submission_execution: "Human staff submission execution stage",
  share_referral_handoffs: "Share / referral outgoing handoffs",
  provider_integration_changes: "Provider / integration changes",
  admin_access_changes: "Admin access changes",
});

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

async function readPauseEvents(adminClient) {
  const { data, error } = await adminClient
    .from("admin_audit_events")
    .select("id,event_type,actor_user_id,module_id,resource_id,action_id,outcome,occurred_at,details")
    .eq("environment", "staging")
    .in("event_type", [
      "founder_emergency_pause_started",
      "founder_emergency_pause_restored",
    ])
    .order("occurred_at", { ascending: false })
    .limit(100);

  if (error) return { ok: false, error };

  const latestByScope = new Map();
  for (const event of data || []) {
    const scopeKey = String(event?.details?.scope_key || "");
    if (!scopeKey || latestByScope.has(scopeKey)) continue;
    latestByScope.set(scopeKey, event);
  }

  const activePauses = Array.from(latestByScope.entries())
    .filter(([, event]) => event.event_type === "founder_emergency_pause_started")
    .map(([scopeKey, event]) => ({
      scopeKey,
      scopeLabel:
        event?.details?.scope_label || ALLOWED_SCOPES[scopeKey] || scopeKey,
      reason: event?.details?.reason || "",
      pausedAt: event.occurred_at,
      eventId: event.id,
      externalEnforcementConnected: false,
      productionEffectEnabled: false,
    }));

  return {
    ok: true,
    events: data || [],
    activePauses,
  };
}

export async function GET(request) {
  if (!environmentAllowed()) return blocked();

  const founder = await verifyFounder(request);
  if (!founder.ok) {
    return noStoreJson({ status: founder.reason }, founder.status);
  }

  const state = await readPauseEvents(founder.adminClient);
  if (!state.ok) {
    return noStoreJson({ status: "EMERGENCY_PAUSE_STATE_READ_FAILED" }, 500);
  }

  return noStoreJson({
    status: "READY",
    scope: "founder-emergency-pause-staging-control-foundation",
    activePauses: state.activePauses,
    allowedScopes: Object.entries(ALLOWED_SCOPES).map(([key, label]) => ({
      key,
      label,
    })),
    externalEnforcementConnected: false,
    productionEffectEnabled: false,
    caution:
      "This Staging foundation records and displays Founder pause instructions, but external execution enforcement is not connected yet. It must not be described as a Production kill switch.",
  });
}

export async function POST(request) {
  if (!environmentAllowed()) return blocked();

  const founder = await verifyFounder(request);
  if (!founder.ok) {
    return noStoreJson({ status: founder.reason }, founder.status);
  }

  let body = null;
  try {
    body = await request.json();
  } catch {
    return noStoreJson({ status: "INVALID_JSON" }, 400);
  }

  const action = String(body?.action || "");
  const scopeKey = String(body?.scopeKey || "");
  const scopeLabel = ALLOWED_SCOPES[scopeKey];
  const reason = String(body?.reason || "").trim().slice(0, 1000);
  const verification = String(body?.verification || "").trim().slice(0, 1000);

  if (!scopeLabel) {
    return noStoreJson({ status: "INVALID_PAUSE_SCOPE" }, 400);
  }

  const state = await readPauseEvents(founder.adminClient);
  if (!state.ok) {
    return noStoreJson({ status: "EMERGENCY_PAUSE_STATE_READ_FAILED" }, 500);
  }

  const active = state.activePauses.find((item) => item.scopeKey === scopeKey);

  if (action === "pause") {
    if (active) {
      return noStoreJson({ status: "SCOPE_ALREADY_PAUSED", activePause: active }, 409);
    }
    if (reason.length < 10) {
      return noStoreJson({ status: "PAUSE_REASON_REQUIRED" }, 400);
    }

    const { error } = await founder.adminClient.from("admin_audit_events").insert({
      event_type: "founder_emergency_pause_started",
      actor_user_id: founder.founderUserId,
      module_id: "overview",
      resource_id: scopeKey,
      action_id: "founder_emergency_pause",
      outcome: "staging_pause_signal_recorded",
      oversight_level: 3,
      environment: "staging",
      details: {
        scope_key: scopeKey,
        scope_label: scopeLabel,
        reason,
        external_enforcement_connected: false,
        production_effect_enabled: false,
        historical_evidence_deleted: false,
      },
    });

    if (error) {
      return noStoreJson({ status: "EMERGENCY_PAUSE_RECORD_FAILED" }, 500);
    }

    const refreshed = await readPauseEvents(founder.adminClient);
    return noStoreJson({
      status: "PAUSE_SIGNAL_RECORDED",
      activePauses: refreshed.ok ? refreshed.activePauses : [],
      externalEnforcementPerformed: false,
      productionEffectPerformed: false,
    });
  }

  if (action === "restore") {
    if (!active) {
      return noStoreJson({ status: "SCOPE_NOT_PAUSED" }, 409);
    }
    if (verification.length < 10) {
      return noStoreJson({ status: "RESTORE_VERIFICATION_REQUIRED" }, 400);
    }

    const { error } = await founder.adminClient.from("admin_audit_events").insert({
      event_type: "founder_emergency_pause_restored",
      actor_user_id: founder.founderUserId,
      module_id: "overview",
      resource_id: scopeKey,
      action_id: "founder_emergency_restore",
      outcome: "staging_pause_signal_restored",
      oversight_level: 3,
      environment: "staging",
      details: {
        scope_key: scopeKey,
        scope_label: scopeLabel,
        original_pause_reason: active.reason,
        restore_verification: verification,
        external_enforcement_connected: false,
        production_effect_enabled: false,
        historical_evidence_deleted: false,
      },
    });

    if (error) {
      return noStoreJson({ status: "EMERGENCY_RESTORE_RECORD_FAILED" }, 500);
    }

    const refreshed = await readPauseEvents(founder.adminClient);
    return noStoreJson({
      status: "RESTORE_SIGNAL_RECORDED",
      activePauses: refreshed.ok ? refreshed.activePauses : [],
      externalEnforcementPerformed: false,
      productionEffectPerformed: false,
    });
  }

  return noStoreJson({ status: "UNSUPPORTED_ACTION" }, 400);
}
