import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const WORKSPACE_ID = "customer_support";
const ROLE_ID = "customer_support";

const QUIET_RETURN_MINUTES = 20;
const STAFF_WELCOME_MESSAGES = Object.freeze([
  "The care you bring to someone’s difficult moment matters.",
  "Clear support can turn confusion into relief. Thank you for bringing patience to the work.",
  "Your work helps people feel heard, guided and respected.",
  "Steady, thoughtful support makes a real difference.",
  "You do not have to solve everything at once. Start with the person in front of you.",
  "Thank you for bringing care, clarity and professionalism to HIISSA today.",
]);
const FOUNDER_PREVIEW_MESSAGES = Object.freeze([
  "Strong teams are supported by clear systems, thoughtful oversight and room to do good work.",
  "You are viewing the Customer Support experience with Founder oversight while staff identity remains protected.",
  "A calm staff experience helps people focus on the human being behind each support request.",
  "Good operational design should make careful work easier, not heavier.",
]);
const MODULE_ID = "customer_support";
const RESOURCE_ID = "staff_work_items";

function noStoreJson(payload, status = 200) {
  return NextResponse.json(payload, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

function blocked() {
  return new NextResponse(null, { status: 404 });
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

function makeClients() {
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

async function authenticatedUser(request, verificationClient) {
  const authorization = request.headers.get("authorization") || "";
  const accessToken = authorization.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length).trim()
    : "";

  if (!accessToken) return null;

  const { data, error } = await verificationClient.auth.getUser(accessToken);
  if (error || !data?.user) return null;
  return data.user;
}

async function permissionFor(adminClient, roleId, actionId) {
  const { data, error } = await adminClient
    .from("admin_permission_rules")
    .select("effect,oversight_level")
    .eq("role_id", roleId)
    .eq("module_id", MODULE_ID)
    .eq("resource_id", RESOURCE_ID)
    .eq("action_id", actionId)
    .eq("environment", "staging")
    .eq("is_active", true)
    .maybeSingle();

  if (error || !data || data.effect !== "allow") return null;
  return data;
}

async function verifyActor(request, actionId = "view_assigned_work") {
  const clients = makeClients();
  if (!clients) {
    return { ok: false, status: 503, reason: "STAGING_DATA_NOT_CONFIGURED" };
  }

  const user = await authenticatedUser(request, clients.verificationClient);
  if (!user) {
    return { ok: false, status: 401, reason: "UNAUTHENTICATED" };
  }

  const { data: founder, error: founderError } = await clients.adminClient
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!founderError && founder) {
    return {
      ok: true,
      userId: user.id,
      mode: "FOUNDER_PREVIEW",
      roleId: "founder",
      permission: { effect: "allow", oversight_level: 3 },
      adminClient: clients.adminClient,
      user,
    };
  }

  const { data: assignment, error: assignmentError } = await clients.adminClient
    .from("admin_role_assignments")
    .select("role_id")
    .eq("user_id", user.id)
    .eq("role_id", ROLE_ID)
    .eq("environment", "staging")
    .is("revoked_at", null)
    .maybeSingle();

  if (assignmentError || !assignment) {
    return { ok: false, status: 403, reason: "CUSTOMER_SUPPORT_ROLE_REQUIRED" };
  }

  const permission = await permissionFor(
    clients.adminClient,
    assignment.role_id,
    actionId
  );

  if (!permission) {
    return { ok: false, status: 403, reason: "STAFF_ACTION_NOT_AUTHORISED" };
  }

  return {
    ok: true,
    userId: user.id,
    mode: "STAFF",
    roleId: assignment.role_id,
    permission,
    adminClient: clients.adminClient,
    user,
  };
}

function ownerColumn(actor) {
  return actor.mode === "FOUNDER_PREVIEW"
    ? "preview_owner_user_id"
    : "assigned_to_user_id";
}

async function getOwnedItem(adminClient, actor, id = null) {
  let query = adminClient
    .from("staff_work_items")
    .select("*")
    .eq("workspace_id", WORKSPACE_ID)
    .eq("environment", "staging")
    .eq("is_fictional", true)
    .eq("external_effect_enabled", false)
    .eq(ownerColumn(actor), actor.userId);

  if (id) {
    query = query.eq("id", id);
  } else {
    query = query.order("created_at", { ascending: false }).limit(1);
  }

  const { data, error } = await query.maybeSingle();
  return { data, error };
}

async function createFictionalItem(adminClient, actor) {
  const caseCode = `CS-STG-${randomUUID().slice(0, 8).toUpperCase()}`;
  const receivedAt = new Date();
  const responseDueAt = new Date(receivedAt.getTime() + 4 * 60 * 60 * 1000);

  const insert = {
    case_code: caseCode,
    workspace_id: WORKSPACE_ID,
    work_type: "customer_support_case",
    title: "Account access guidance",
    category: "Account & Access",
    priority: "normal",
    summary:
      "A fictional customer says they cannot find where to update an account preference. No real person, email address, account identifier or private HIISSA conversation is used.",
    source_kind: "fictional_staging",
    received_at: receivedAt.toISOString(),
    response_due_at: responseDueAt.toISOString(),
    environment: "staging",
    is_fictional: true,
    external_effect_enabled: false,
    [ownerColumn(actor)]: actor.userId,
  };

  const { data, error } = await adminClient
    .from("staff_work_items")
    .insert(insert)
    .select("*")
    .single();

  return { data, error };
}

function publicItem(item) {
  if (!item) return null;

  return {
    id: item.id,
    caseCode: item.case_code,
    workspaceId: item.workspace_id,
    title: item.title,
    category: item.category,
    priority: item.priority,
    summary: item.summary,
    status: item.status,
    draftResponse: item.draft_response || "",
    internalNote: item.internal_note || "",
    founderNote: item.founder_note || "",
    approvalRequestId: item.approval_request_id,
    receivedAt: item.received_at,
    responseDueAt: item.response_due_at,
    submittedAt: item.submitted_at,
    returnedAt: item.returned_at,
    approvedAt: item.approved_at,
    verifiedCompletedAt: item.verified_completed_at,
    updatedAt: item.updated_at,
    version: item.version,
    isFictional: item.is_fictional,
    externalEffectEnabled: item.external_effect_enabled,
  };
}

function actorPayload(actor) {
  return {
    mode: actor.mode,
    roleId: actor.roleId,
    displayIdentity:
      actor.mode === "FOUNDER_PREVIEW"
        ? "Founder Preview as Customer Support"
        : "Authorised Customer Support Worker",
    workspace: "Customer Support",
    environment: "Staging only",
    accessBoundary:
      actor.mode === "FOUNDER_PREVIEW"
        ? "Founder Preview as Role · fictional Customer Support records only"
        : "Customer Support workspace only",
  };
}

function preferredDisplayName(user) {
  const metadata =
    user?.user_metadata && typeof user.user_metadata === "object"
      ? user.user_metadata
      : {};
  const candidates = [
    metadata.preferred_name,
    metadata.display_name,
    metadata.full_name,
    metadata.name,
  ];

  const found = candidates.find(
    (value) => typeof value === "string" && value.trim().length > 0
  );

  return found ? found.trim().slice(0, 80) : "Customer Support colleague";
}

function welcomePeriod(hour) {
  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 17) return "afternoon";
  return "evening";
}

function seededMessageIndex(localDate, poolLength) {
  const source = String(localDate || "");
  let total = 0;
  for (const char of source) total += char.charCodeAt(0);
  return poolLength > 0 ? total % poolLength : 0;
}

function rotatedMessageIndex({ localDate, mode, previousIndex, poolLength }) {
  const seeded = seededMessageIndex(localDate, poolLength);
  const safePrevious = Number.isInteger(previousIndex) ? previousIndex : null;

  if (mode === "WELCOME_BACK" && safePrevious !== null) {
    return (safePrevious + 1) % poolLength;
  }

  if (mode === "QUIET_RETURN" && safePrevious !== null) {
    return safePrevious;
  }

  if (safePrevious !== null && seeded === safePrevious) {
    return (seeded + 1) % poolLength;
  }

  return seeded;
}

async function staffWelcomePayload(actor, request) {
  const url = new URL(request.url);
  if (url.searchParams.get("welcome") !== "1") return null;

  const localDate = String(url.searchParams.get("localDate") || "").slice(0, 10);
  const timeZone = String(url.searchParams.get("timeZone") || "").slice(0, 100);
  const localHour = Number(url.searchParams.get("localHour"));

  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(localDate) ||
    !Number.isInteger(localHour) ||
    localHour < 0 ||
    localHour > 23
  ) {
    return {
      status: "INVALID_LOCAL_CONTEXT",
      showFullWelcome: false,
    };
  }

  const { data: previousRows, error: previousError } = await actor.adminClient
    .from("admin_audit_events")
    .select("occurred_at,details")
    .eq("event_type", "staff_workspace_visit")
    .eq("actor_user_id", actor.userId)
    .eq("module_id", MODULE_ID)
    .eq("environment", "staging")
    .order("occurred_at", { ascending: false })
    .limit(1);

  if (previousError) {
    return {
      status: "STAFF_WELCOME_READ_FAILED",
      showFullWelcome: false,
    };
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

  const pool =
    actor.mode === "FOUNDER_PREVIEW"
      ? FOUNDER_PREVIEW_MESSAGES
      : STAFF_WELCOME_MESSAGES;
  const previousMessageIndexRaw = Number(previous?.details?.message_index);
  const previousMessageIndex = Number.isInteger(previousMessageIndexRaw)
    ? previousMessageIndexRaw
    : null;
  const messageIndex = rotatedMessageIndex({
    localDate,
    mode,
    previousIndex: previousMessageIndex,
    poolLength: pool.length,
  });

  const displayName =
    actor.mode === "FOUNDER_PREVIEW"
      ? "FATI BANCE"
      : preferredDisplayName(actor.user);
  const roleLabel =
    actor.mode === "FOUNDER_PREVIEW"
      ? "FOUNDER PREVIEW · CUSTOMER SUPPORT"
      : "CUSTOMER SUPPORT";
  const period = welcomePeriod(localHour);
  const greeting =
    mode === "FIRST_VISIT_TODAY"
      ? `Good ${period}`
      : "Welcome back";

  const { error: insertError } = await actor.adminClient
    .from("admin_audit_events")
    .insert({
      event_type: "staff_workspace_visit",
      actor_user_id: actor.userId,
      module_id: MODULE_ID,
      resource_id: "staff-workspace-welcome",
      action_id: "enter_staff_workspace",
      outcome: "recorded",
      oversight_level: actor.mode === "FOUNDER_PREVIEW" ? 3 : 1,
      environment: "staging",
      details: {
        local_date: localDate,
        time_zone: timeZone || null,
        local_hour: localHour,
        welcome_mode: mode,
        message_index: messageIndex,
        message_rotation: "ANTI_REPEAT",
        actor_mode: actor.mode,
        role_id: actor.roleId,
        workspace_id: WORKSPACE_ID,
        emotional_checkin_recorded: false,
        performance_score_recorded: false,
        external_effect_enabled: false,
      },
    });

  if (insertError) {
    return {
      status: "STAFF_WELCOME_RECORD_FAILED",
      showFullWelcome: false,
    };
  }

  return {
    status: "READY",
    scope: "customer-support-staff-welcome-staging",
    greeting,
    period,
    mode,
    displayName,
    roleLabel,
    motivation: pool[messageIndex],
    messageIndex,
    rotation: "ANTI_REPEAT",
    showFullWelcome: mode !== "QUIET_RETURN",
    isFounderPreview: actor.mode === "FOUNDER_PREVIEW",
    previousVisitMinutesAgo: minutesSincePrevious,
    privacy: {
      emotionalCheckinRecorded: false,
      performanceScoreRecorded: false,
      managerMoodSignalCreated: false,
    },
    productionEffectEnabled: false,
  };
}

function normaliseRpcRow(data) {
  if (Array.isArray(data)) return data[0] || null;
  return data || null;
}

export async function GET(request) {
  if (!environmentAllowed()) return blocked();

  const actor = await verifyActor(request, "view_assigned_work");
  if (!actor.ok) {
    return noStoreJson({ status: actor.reason }, actor.status);
  }

  let result = await getOwnedItem(actor.adminClient, actor);

  if (result.error) {
    return noStoreJson(
      { status: "STAFF_WORK_READ_FAILED", reason: result.error.message },
      500
    );
  }

  if (!result.data) {
    result = await createFictionalItem(actor.adminClient, actor);
  }

  if (result.error || !result.data) {
    return noStoreJson(
      {
        status: "STAFF_WORK_CREATE_FAILED",
        reason: result.error?.message || "No work item could be created.",
      },
      500
    );
  }

  const welcome = await staffWelcomePayload(actor, request);

  return noStoreJson({
    status: "READY",
    scope: "working-fictional-customer-support-staging",
    actor: actorPayload(actor),
    welcome,
    item: publicItem(result.data),
    submissionGate: {
      staffAction: "Submit for processing",
      confirmation: "Submitted for processing",
      founderRoute: "Founder Command / Approval Inbox",
      founderDecisions: ["Approve", "Return for Changes", "Reject"],
      approvalIsVerifiedCompletion: false,
    },
    safeguards: {
      realCustomerData: false,
      externalSendEnabled: false,
      productionEffectEnabled: false,
    },
  });
}

export async function POST(request) {
  if (!environmentAllowed()) return blocked();

  let body = null;
  try {
    body = await request.json();
  } catch {
    return noStoreJson({ status: "INVALID_JSON" }, 400);
  }

  const action = String(body?.action || "");
  const itemId = String(body?.itemId || "");

  const permissionAction =
    action === "start"
      ? "start_work"
      : action === "save"
        ? "save_draft"
        : action === "submit"
          ? "submit_for_processing"
          : "";

  if (!permissionAction || !itemId) {
    return noStoreJson({ status: "INVALID_STAFF_ACTION" }, 400);
  }

  const actor = await verifyActor(request, permissionAction);
  if (!actor.ok) {
    return noStoreJson({ status: actor.reason }, actor.status);
  }

  const owned = await getOwnedItem(actor.adminClient, actor, itemId);
  if (owned.error || !owned.data) {
    return noStoreJson({ status: "STAFF_WORK_ITEM_FORBIDDEN" }, 403);
  }

  if (action === "save") {
    const draftResponse = String(body?.draftResponse || "");
    const internalNote = String(body?.internalNote || "");

    if (draftResponse.length > 6000 || internalNote.length > 3000) {
      return noStoreJson({ status: "STAFF_DRAFT_TOO_LONG" }, 400);
    }
  }

  const rpc =
    action === "submit"
      ? await actor.adminClient.rpc("hiissa_staff_submit_for_processing", {
          p_work_item_id: itemId,
          p_actor_user_id: actor.userId,
        })
      : await actor.adminClient.rpc("hiissa_staff_save_work_item", {
          p_work_item_id: itemId,
          p_actor_user_id: actor.userId,
          p_action: action,
          p_draft_response:
            action === "save" ? String(body?.draftResponse || "") : null,
          p_internal_note:
            action === "save" ? String(body?.internalNote || "") : null,
        });

  if (rpc.error) {
    const message = String(rpc.error.message || "");
    const known = [
      "STAFF_DRAFT_REQUIRED",
      "STAFF_WORK_ITEM_LOCKED",
      "STAFF_WORK_ITEM_FORBIDDEN",
      "STAFF_WORK_ITEM_NOT_FOUND",
      "INVALID_STAFF_ACTION",
    ].find((code) => message.includes(code));

    return noStoreJson(
      { status: known || "STAFF_WORK_UPDATE_FAILED" },
      known === "STAFF_DRAFT_REQUIRED" ? 400 : 409
    );
  }

  const item = normaliseRpcRow(rpc.data);

  return noStoreJson({
    status:
      action === "submit"
        ? "SUBMITTED_FOR_PROCESSING"
        : action === "save"
          ? "DRAFT_SAVED"
          : "WORK_STARTED",
    actor: actorPayload(actor),
    item: publicItem(item),
    externalEffectPerformed: false,
    productionEffectPerformed: false,
  });
}
