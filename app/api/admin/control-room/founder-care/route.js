import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import {
  prepareGentleCheckIn,
  recordGentleCheckInState,
  recordPeopleExperienceOperationalEvent,
} from "../../../../../lib/people-experience/gentle-checkin.js";

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

function validContext(localDate, localHour) {
  return (
    /^\d{4}-\d{2}-\d{2}$/.test(String(localDate || "")) &&
    Number.isInteger(localHour) &&
    localHour >= 0 &&
    localHour <= 23
  );
}

export async function GET(request) {
  if (!environmentAllowed()) return blocked();

  const founder = await verifyFounder(request);
  if (!founder.ok) {
    return noStoreJson({ status: founder.reason }, founder.status);
  }

  const { searchParams } = new URL(request.url);
  const localDate = String(searchParams.get("localDate") || "").slice(0, 10);
  const localHour = Number(searchParams.get("localHour"));
  const welcomeMode = String(searchParams.get("welcomeMode") || "").slice(0, 40);

  if (!validContext(localDate, localHour)) {
    return noStoreJson({ status: "INVALID_LOCAL_CONTEXT" }, 400);
  }

  const checkIn = await prepareGentleCheckIn({
    adminClient: founder.adminClient,
    actorUserId: founder.founderUserId,
    moduleId: "overview",
    actorMode: "FOUNDER",
    contextLabel: "Founder Control Room",
    localDate,
    localHour,
    welcomeMode,
    isFounderPreview: false,
  });

  return noStoreJson({
    status: "READY",
    scope: "founder-daypart-care-staging",
    checkIn,
    productionEffect: false,
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
  const localDate = String(body?.localDate || "").slice(0, 10);
  const localHour = Number(body?.localHour);
  const daypart = String(body?.daypart || "").slice(0, 20);

  if (!validContext(localDate, localHour)) {
    return noStoreJson({ status: "INVALID_LOCAL_CONTEXT" }, 400);
  }

  if (action === "checkin_state") {
    const state = String(body?.state || "");
    const careState = await recordGentleCheckInState({
      adminClient: founder.adminClient,
      actorUserId: founder.founderUserId,
      moduleId: "overview",
      actorMode: "FOUNDER",
      localDate,
      localHour,
      daypart,
      state,
      isFounderPreview: false,
    });

    if (!careState?.ok) {
      return noStoreJson(
        { status: careState?.reason || "CHECKIN_STATE_RECORD_FAILED" },
        500
      );
    }

    return noStoreJson({
      status: "READY",
      scope: "founder-daypart-care-staging",
      careState,
      productionEffect: false,
    });
  }

  if (action === "operational_event") {
    const operationalEvent = await recordPeopleExperienceOperationalEvent({
      adminClient: founder.adminClient,
      actorUserId: founder.founderUserId,
      moduleId: "overview",
      actorMode: "FOUNDER",
      event: String(body?.event || ""),
      localDate,
      localHour,
      daypart,
      reason: String(body?.reason || "").slice(0, 120),
    });

    if (!operationalEvent?.ok) {
      return noStoreJson(
        { status: operationalEvent?.reason || "PEOPLE_EXPERIENCE_EVENT_FAILED" },
        500
      );
    }

    return noStoreJson({
      status: "READY",
      scope: "founder-daypart-care-staging",
      operationalEvent,
      productionEffect: false,
    });
  }

  return noStoreJson({ status: "UNSUPPORTED_ACTION" }, 400);
}
