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

function humanise(value) {
  return String(value || "")
    .replaceAll("_", " ")
    .replaceAll("-", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function eventTitle(event) {
  // Add-only: use the EXISTING Activity Timeline for canonical operational incidents.
  // No new timeline or Founder dashboard design; this maps the existing audit event.
  if (event.event_type === "hiissa_operational_incident_state_change") {
    const incidentState = String(event.details?.state || "");
    if (incidentState === "needs_attention") return "HIISSA detected an operational problem";
    if (incidentState === "investigating") return "HIISSA is investigating an operational problem";
    if (incidentState === "recovery_attempted") return "HIISSA recorded a recovery attempt — not yet verified";
    if (incidentState === "verification_pending") return "HIISSA is awaiting independent recovery verification";
    if (incidentState === "verified_resolved") return "HIISSA verified an operational recovery";
    if (incidentState === "escalated") return "HIISSA escalated an operational incident";
    return "HIISSA recorded an operational incident update";
  }
  if (event.event_type === "staff_work_started") {
    return "Customer Support work started";
  }
  if (event.event_type === "staff_draft_saved") {
    return "Customer Support draft saved";
  }
  if (event.event_type === "staff_submitted_for_processing") {
    return "Staff work submitted for Founder processing";
  }
  if (event.event_type === "founder_staff_submission_decision") {
    const decision = String(event.action_id || "");
    if (decision === "approve") return "Founder approved staff submission";
    if (decision === "return_for_changes") {
      return "Founder returned staff submission for changes";
    }
    if (decision === "reject") return "Founder rejected staff submission";
    return "Founder recorded a staff-submission decision";
  }
  if (event.event_type === "founder_control_room_visit") {
    return "Founder entered the Control Room";
  }
  if (event.event_type === "people_experience_checkin_offered") {
    return "Gentle Check-In was offered";
  }
  if (event.event_type === "people_experience_checkin_snoozed") {
    return "Gentle Check-In was snoozed";
  }
  if (event.event_type === "people_experience_checkin_resolved") {
    return "Gentle Check-In care opportunity was resolved";
  }
  if (event.event_type === "people_experience_workday_close_opened") {
    return "Workday Close was opened";
  }
  if (event.event_type === "people_experience_operational_recovery") {
    const action = String(event.action_id || "");
    if (action === "safe_moment_deferred") {
      return "HIISSA deferred Gentle Check-In to a safer moment";
    }
    if (action === "prompt_auto_minimised") {
      return "HIISSA minimised an unanswered Gentle Check-In";
    }
    if (action === "snooze_reminder_returned") {
      return "HIISSA returned the snoozed check-in reminder";
    }
    if (action === "reminder_dismissed_while_snoozed") {
      return "HIISSA dismissed the reminder and preserved the snooze";
    }
    if (action === "eligibility_source_unavailable") {
      return "People Experience eligibility source became unavailable";
    }
    if (action === "care_state_persistence_degraded") {
      return "People Experience state persistence needs Technical Operations";
    }
    return "HIISSA recorded a People Experience recovery action";
  }
  return humanise(event.event_type || event.action_id || "HIISSA activity");
}

function sourceLabel(event) {
  const moduleId = String(event.module_id || "");
  if (moduleId === "customer_support") return "Customer Support";
  if (moduleId === "overview") return "Founder Control Room";
  if (moduleId === "people_experience") return "HIISSA People Experience";
  if (moduleId) return humanise(moduleId);
  return "HIISSA System";
}

function publicEvent(event, founderUserId) {
  const details =
    event.details && typeof event.details === "object" ? event.details : {};

  const actorLabel =
    event.actor_user_id === founderUserId
      ? "FATI BANCE · FOUNDER"
      : event.actor_user_id
        ? "Authorised HIISSA Staff"
        : "HIISSA System";

  return {
    id: event.id,
    occurredAt: event.occurred_at,
    title: eventTitle(event),
    actor: actorLabel,
    source: sourceLabel(event),
    outcome: humanise(event.outcome || "recorded"),
    oversightLevel: event.oversight_level,
    caseCode:
      typeof details.case_code === "string" ? details.case_code.slice(0, 80) : "",
    status:
      event.event_type === "hiissa_operational_incident_state_change" && typeof details.state === "string"
        ? humanise(details.state).toUpperCase()
        : typeof details.status === "string"
        ? humanise(details.status).toUpperCase()
        : typeof details.work_item_status === "string"
          ? humanise(details.work_item_status).toUpperCase()
          : typeof details.verification_state === "string"
            ? humanise(details.verification_state).toUpperCase()
            : "",
    privacyBoundary:
      "Privacy-safe operational metadata only. Raw secrets and private conversation content are not returned.",
  };
}

export async function GET(request) {
  if (!environmentAllowed()) return blocked();

  const founder = await verifyFounder(request);
  if (!founder.ok) {
    return noStoreJson({ status: founder.reason }, founder.status);
  }

  const { data, error } = await founder.adminClient
    .from("admin_audit_events")
    .select(
      "id,event_type,actor_user_id,module_id,resource_id,action_id,outcome,oversight_level,environment,details,occurred_at"
    )
    .eq("environment", "staging")
    .order("occurred_at", { ascending: false })
    .limit(30);

  if (error) {
    return noStoreJson({ status: "FOUNDER_ACTIVITY_READ_FAILED" }, 500);
  }

  const events = (data || []).map((event) =>
    publicEvent(event, founder.founderUserId)
  );

  return noStoreJson({
    status: "READY",
    scope: "founder-activity-timeline-staging",
    timestampStandard: {
      storage: "UTC_AUTHORITATIVE_DATABASE_TIMESTAMP",
      display: "BROWSER_LOCAL_TIME",
      immutableOriginalRequired: true,
      createdAndUpdatedRemainDistinct: true,
    },
    events,
    productionEffectEnabled: false,
  });
}
