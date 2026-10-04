import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const OPENAI_COSTS_URL = "https://api.openai.com/v1/organization/costs";
const OPENAI_COMPLETIONS_USAGE_URL =
  "https://api.openai.com/v1/organization/usage/completions";

function blocked(status = 404) {
  return new NextResponse(null, { status });
}

function noStoreJson(payload, status = 200) {
  return NextResponse.json(payload, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

function classifyUpstream(response) {
  if (!response) return "UPSTREAM_UNAVAILABLE";
  if (response.status === 401 || response.status === 403) {
    return "ADMIN_KEY_REJECTED";
  }
  if (response.status === 429) return "RATE_LIMITED";
  return "UPSTREAM_UNAVAILABLE";
}

function aggregateCosts(payload) {
  const totals = new Map();

  for (const bucket of payload?.data || []) {
    for (const result of bucket?.results || []) {
      const currency = String(result?.amount?.currency || "").toLowerCase();
      const value = Number(result?.amount?.value);

      if (!currency || !Number.isFinite(value)) continue;
      totals.set(currency, (totals.get(currency) || 0) + value);
    }
  }

  return [...totals.entries()].map(([currency, value]) => ({
    currency,
    value: Number(value.toFixed(8)),
  }));
}

function aggregateCompletionsUsage(payload) {
  const totals = {
    requests: 0,
    inputTokens: 0,
    outputTokens: 0,
    cachedInputTokens: 0,
  };

  for (const bucket of payload?.data || []) {
    for (const result of bucket?.results || []) {
      totals.requests += Number(result?.num_model_requests) || 0;
      totals.inputTokens += Number(result?.input_tokens) || 0;
      totals.outputTokens += Number(result?.output_tokens) || 0;
      totals.cachedInputTokens += Number(result?.input_cached_tokens) || 0;
    }
  }

  return totals;
}

async function verifyFounderAdmin(accessToken) {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    !process.env.SUPABASE_SECRET_KEY
  ) {
    return { ok: false, status: 503, reason: "STAGING_ADMIN_DATA_NOT_CONFIGURED" };
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
    return { ok: false, status: 401, reason: "UNAUTHENTICATED" };
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
    return { ok: false, status: 403, reason: "FORBIDDEN" };
  }

  return { ok: true };
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

  const authorization = request.headers.get("authorization") || "";
  const accessToken = authorization.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length).trim()
    : "";

  if (!accessToken) {
    return noStoreJson({ status: "UNAUTHENTICATED" }, 401);
  }

  const admin = await verifyFounderAdmin(accessToken);
  if (!admin.ok) {
    return noStoreJson({ status: admin.reason }, admin.status);
  }

  const base = {
    scope: "read-only-staging-openai-provider-telemetry",
    provider: "OpenAI API",
    runtimeApiKeyConfigured: Boolean(process.env.OPENAI_API_KEY),
    adminTelemetryKeyConfigured: Boolean(process.env.OPENAI_ADMIN_API_KEY),
    creditBalance: {
      status: "NOT_EXPOSED_BY_CONNECTED_SOURCE",
      value: null,
      detail:
        "Credit-grant and prepaid-balance details remain an official Billing-page source until a reliable supported API source is available.",
    },
    officialLinks: {
      usage: "https://platform.openai.com/usage",
      billing:
        "https://platform.openai.com/settings/organization/billing/overview",
    },
    moneyMovementEnabled: false,
    refreshedAt: new Date().toISOString(),
  };

  if (!process.env.OPENAI_ADMIN_API_KEY) {
    return noStoreJson({
      ...base,
      status: "SOURCE_NOT_CONFIGURED",
      evidenceSource: "OpenAI API Platform organization Admin API",
      costs: null,
      usage: null,
      failedSources: ["organization-costs", "organization-completions-usage"],
      nextAction:
        "Configure a separate API Platform organization Admin key in the Staging environment before live organization usage/cost telemetry can be read.",
    });
  }

  const now = new Date();
  const startTime = Math.floor(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1) / 1000
  );
  const endTime = Math.floor(now.getTime() / 1000) + 1;

  const query = new URLSearchParams({
    start_time: String(startTime),
    end_time: String(endTime),
    bucket_width: "1d",
    limit: "31",
  });

  const headers = {
    Authorization: `Bearer ${process.env.OPENAI_ADMIN_API_KEY}`,
    "Content-Type": "application/json",
  };

  let costResponse = null;
  let usageResponse = null;

  try {
    [costResponse, usageResponse] = await Promise.all([
      fetch(`${OPENAI_COSTS_URL}?${query.toString()}`, {
        headers,
        cache: "no-store",
      }),
      fetch(`${OPENAI_COMPLETIONS_USAGE_URL}?${query.toString()}`, {
        headers,
        cache: "no-store",
      }),
    ]);
  } catch {
    return noStoreJson({
      ...base,
      status: "UPSTREAM_UNAVAILABLE",
      evidenceSource: "OpenAI API Platform organization Admin API",
      costs: null,
      usage: null,
      failedSources: ["organization-costs", "organization-completions-usage"],
      nextAction: "Retry later; no money-moving action is authorised.",
    });
  }

  const failedSources = [];
  if (!costResponse.ok) failedSources.push("organization-costs");
  if (!usageResponse.ok) failedSources.push("organization-completions-usage");

  const costsPayload = costResponse.ok
    ? await costResponse.json().catch(() => null)
    : null;
  const usagePayload = usageResponse.ok
    ? await usageResponse.json().catch(() => null)
    : null;

  const costs = costResponse.ok ? aggregateCosts(costsPayload) : null;
  const usage = usageResponse.ok
    ? aggregateCompletionsUsage(usagePayload)
    : null;

  let status = "HEALTHY";
  if (failedSources.length === 1) status = "PARTIAL";
  if (failedSources.length === 2) {
    status =
      classifyUpstream(costResponse) === "ADMIN_KEY_REJECTED" ||
      classifyUpstream(usageResponse) === "ADMIN_KEY_REJECTED"
        ? "ADMIN_KEY_REJECTED"
        : classifyUpstream(costResponse) === "RATE_LIMITED" ||
            classifyUpstream(usageResponse) === "RATE_LIMITED"
          ? "RATE_LIMITED"
          : "UPSTREAM_UNAVAILABLE";
  }

  return noStoreJson({
    ...base,
    status,
    evidenceSource: "OpenAI API Platform organization Admin API",
    period: {
      startTime,
      endTime,
      timezone: "UTC",
    },
    costs,
    usage,
    failedSources,
    nextAction:
      status === "HEALTHY"
        ? null
        : "Review the protected source status; no automatic top-up, purchase, upgrade or billing change is authorised.",
  });
}
