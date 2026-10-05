import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const FOUNDER_NAME = "FATI BANCE";
const FOUNDER_ROLE = "FOUNDER";
const QUIET_RETURN_MINUTES = 20;

const FOUNDER_MESSAGES = Object.freeze([
  "Your vision is becoming something real. One thoughtful decision at a time.",
  "What you are building matters. Keep leading with purpose, clarity and care.",
  "Progress does not need to be loud to be real. HIISSA is moving forward with you.",
  "You are building more than a product. You are shaping how people can feel supported, respected and understood.",
  "Leadership is also knowing what deserves your attention — and what can safely wait.",
  "There is strength in steady progress. Notice what has already moved forward.",
]);

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

function periodFromHour(hour) {
  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 17) return "afternoon";
  return "evening";
}

function dateSeedIndex(localDate) {
  const source = String(localDate || "");
  let total = 0;
  for (const char of source) total += char.charCodeAt(0);
  return total % FOUNDER_MESSAGES.length;
}

function nextMessageIndex({ localDate, mode, previousIndex }) {
  const safePrevious = Number.isInteger(previousIndex) ? previousIndex : null;
  const seeded = dateSeedIndex(localDate);

  if (mode === "WELCOME_BACK" && safePrevious !== null) {
    return (safePrevious + 1) % FOUNDER_MESSAGES.length;
  }

  if (mode === "QUIET_RETURN" && safePrevious !== null) {
    return safePrevious;
  }

  if (safePrevious !== null && seeded === safePrevious) {
    return (seeded + 1) % FOUNDER_MESSAGES.length;
  }

  return seeded;
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

  const localDate = String(body?.localDate || "").slice(0, 10);
  const timeZone = String(body?.timeZone || "").slice(0, 100);
  const localHour = Number(body?.localHour);

  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(localDate) ||
    !Number.isInteger(localHour) ||
    localHour < 0 ||
    localHour > 23
  ) {
    return noStoreJson({ status: "INVALID_LOCAL_CONTEXT" }, 400);
  }

  const { data: previousRows, error: previousError } = await founder.adminClient
    .from("admin_audit_events")
    .select("occurred_at,details")
    .eq("event_type", "founder_control_room_visit")
    .eq("actor_user_id", founder.founderUserId)
    .eq("environment", "staging")
    .order("occurred_at", { ascending: false })
    .limit(1);

  if (previousError) {
    return noStoreJson({ status: "FOUNDER_WELCOME_READ_FAILED" }, 500);
  }

  const previous = previousRows?.[0] || null;
  const previousLocalDate = String(previous?.details?.local_date || "");
  const previousAt = previous?.occurred_at ? new Date(previous.occurred_at) : null;
  const minutesSincePrevious =
    previousAt && Number.isFinite(previousAt.getTime())
      ? Math.max(0, Math.floor((Date.now() - previousAt.getTime()) / 60000))
      : null;

  let mode = "FIRST_VISIT_TODAY";

  if (previous && previousLocalDate === localDate) {
    mode =
      minutesSincePrevious !== null && minutesSincePrevious < QUIET_RETURN_MINUTES
        ? "QUIET_RETURN"
        : "WELCOME_BACK";
  }

  const period = periodFromHour(localHour);
  const greeting =
    mode === "FIRST_VISIT_TODAY"
      ? `Good ${period}`
      : "Welcome back";

  const previousMessageIndexRaw = Number(previous?.details?.message_index);
  const previousMessageIndex = Number.isInteger(previousMessageIndexRaw)
    ? previousMessageIndexRaw
    : null;
  const selectedMessageIndex = nextMessageIndex({
    localDate,
    mode,
    previousIndex: previousMessageIndex,
  });
  const motivation = FOUNDER_MESSAGES[selectedMessageIndex];

  const { error: insertError } = await founder.adminClient
    .from("admin_audit_events")
    .insert({
      event_type: "founder_control_room_visit",
      actor_user_id: founder.founderUserId,
      module_id: "overview",
      resource_id: "founder-welcome",
      action_id: "enter_control_room",
      outcome: "recorded",
      oversight_level: 1,
      environment: "staging",
      details: {
        local_date: localDate,
        time_zone: timeZone || null,
        local_hour: localHour,
        welcome_mode: mode,
        previous_visit_minutes_ago: minutesSincePrevious,
        message_index: selectedMessageIndex,
        message_rotation: "ANTI_REPEAT",
        founder_identity: FOUNDER_NAME,
        founder_role: FOUNDER_ROLE,
        emotional_checkin_recorded: false,
      },
    });

  if (insertError) {
    return noStoreJson({ status: "FOUNDER_WELCOME_RECORD_FAILED" }, 500);
  }

  return noStoreJson({
    status: "READY",
    scope: "founder-welcome-intelligence-staging",
    founderName: FOUNDER_NAME,
    role: FOUNDER_ROLE,
    greeting,
    mode,
    period,
    motivation,
    messageIndex: selectedMessageIndex,
    rotation: "ANTI_REPEAT",
    showFullWelcome: mode !== "QUIET_RETURN",
    previousVisitMinutesAgo: minutesSincePrevious,
    privacy: {
      emotionalCheckinRecorded: false,
      employeePerformanceScoring: false,
    },
    productionEffect: false,
  });
}
