import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

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

async function verifyFounder(request) {
  const clients = makeClients();
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

function publicApproval(request, item) {
  return {
    requestId: request.id,
    requestStatus: request.status,
    oversightLevel: request.oversight_level,
    createdAt: request.created_at,
    resolvedAt: request.resolved_at,
    caseCode: item.case_code,
    title: item.title,
    category: item.category,
    priority: item.priority,
    summary: item.summary,
    draftResponse: item.draft_response || "",
    internalNote: item.internal_note || "",
    founderNote: item.founder_note || "",
    workStatus: item.status,
    submittedAt: item.submitted_at,
    returnedAt: item.returned_at,
    approvedAt: item.approved_at,
    isFictional: item.is_fictional,
    externalEffectEnabled: item.external_effect_enabled,
    preparedBy:
      item.preview_owner_user_id && !item.assigned_to_user_id
        ? "Founder Preview as Customer Support"
        : "Authorised Customer Support Worker",
    decisionPack: {
      request:
        "Review the prepared Customer Support response before any controlled external execution.",
      reason:
        "A human staff submission reached the mandatory Founder processing gate.",
      affected:
        "One fictional Staging Customer Support case. No real customer is affected.",
      risk:
        "A future real customer response would leave HIISSA, so wording and context require Founder oversight.",
      evidence:
        "Canonical Staging staff work record, draft response, internal note and attributable audit history.",
      checked:
        "Role/Preview boundary, fictional-only source, external-effect disabled, Production disabled, one canonical approval request.",
      approvedEffect:
        "Move the fictional item to APPROVED PENDING EXECUTION only. No message is sent.",
      reversible:
        "No external effect exists in this Staging layer; the approval state remains auditable.",
      rejectedEffect:
        "The work item becomes REJECTED and no external action occurs.",
      recommendation:
        "Approve only if the prepared response is suitable for the later controlled execution stage.",
    },
  };
}

export async function GET(request) {
  if (!environmentAllowed()) return blocked();

  const founder = await verifyFounder(request);
  if (!founder.ok) {
    return noStoreJson({ status: founder.reason }, founder.status);
  }

  const { data: requests, error: requestError } = await founder.adminClient
    .from("admin_approval_requests")
    .select(
      "id,status,oversight_level,created_at,resolved_at,request_context"
    )
    .eq("environment", "staging")
    .eq("module_id", "customer_support")
    .eq("action_id", "staff_submit_for_processing")
    .order("created_at", { ascending: false })
    .limit(20);

  if (requestError) {
    return noStoreJson({ status: "APPROVAL_QUEUE_READ_FAILED" }, 500);
  }

  const requestIds = (requests || []).map((item) => item.id);

  if (!requestIds.length) {
    return noStoreJson({
      status: "READY",
      scope: "working-staging-staff-approval-inbox",
      pendingCount: 0,
      items: [],
      externalExecutionEnabled: false,
      productionEffectEnabled: false,
    });
  }

  const { data: workItems, error: workError } = await founder.adminClient
    .from("staff_work_items")
    .select(
      "case_code,title,category,priority,summary,draft_response,internal_note,founder_note,status,approval_request_id,submitted_at,returned_at,approved_at,is_fictional,external_effect_enabled,assigned_to_user_id,preview_owner_user_id"
    )
    .in("approval_request_id", requestIds);

  if (workError) {
    return noStoreJson({ status: "STAFF_WORK_READ_FAILED" }, 500);
  }

  const byRequest = new Map(
    (workItems || []).map((item) => [item.approval_request_id, item])
  );

  const items = (requests || [])
    .map((approval) => {
      const item = byRequest.get(approval.id);
      return item ? publicApproval(approval, item) : null;
    })
    .filter(Boolean);

  return noStoreJson({
    status: "READY",
    scope: "working-staging-staff-approval-inbox",
    pendingCount: items.filter((item) => item.requestStatus === "pending").length,
    items,
    founderDecisions: ["approve", "return_for_changes", "reject"],
    approvalIsVerifiedCompletion: false,
    externalExecutionEnabled: false,
    productionEffectEnabled: false,
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

  const requestId = String(body?.requestId || "");
  const decision = String(body?.decision || "");
  const note = String(body?.note || "");

  if (
    !requestId ||
    !["approve", "return_for_changes", "reject"].includes(decision)
  ) {
    return noStoreJson({ status: "INVALID_FOUNDER_DECISION" }, 400);
  }

  if (note.length > 3000) {
    return noStoreJson({ status: "FOUNDER_NOTE_TOO_LONG" }, 400);
  }

  const rpc = await founder.adminClient.rpc(
    "hiissa_founder_resolve_staff_work",
    {
      p_request_id: requestId,
      p_founder_user_id: founder.founderUserId,
      p_decision: decision,
      p_rationale: note || null,
    }
  );

  if (rpc.error) {
    const message = String(rpc.error.message || "");
    const known = [
      "FOUNDER_GATE_REQUIRED",
      "INVALID_FOUNDER_DECISION",
      "APPROVAL_REQUEST_NOT_FOUND",
      "APPROVAL_REQUEST_NOT_PENDING",
      "STAFF_WORK_ITEM_NOT_FOUND",
    ].find((code) => message.includes(code));

    return noStoreJson(
      { status: known || "FOUNDER_DECISION_FAILED" },
      known === "APPROVAL_REQUEST_NOT_PENDING" ? 409 : 400
    );
  }

  const item = Array.isArray(rpc.data) ? rpc.data[0] : rpc.data;

  return noStoreJson({
    status:
      decision === "approve"
        ? "APPROVED_PENDING_EXECUTION"
        : decision === "return_for_changes"
          ? "RETURNED_FOR_CHANGES"
          : "REJECTED",
    workItem: item
      ? {
          id: item.id,
          caseCode: item.case_code,
          status: item.status,
          founderNote: item.founder_note || "",
          updatedAt: item.updated_at,
        }
      : null,
    externalExecutionPerformed: false,
    productionEffectPerformed: false,
  });
}
