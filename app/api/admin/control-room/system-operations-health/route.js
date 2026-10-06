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

async function checkSupabase(adminClient) {
  try {
    const startedAt = Date.now();
    const { count, error } = await adminClient
      .from("conversations")
      .select("id", { count: "exact", head: true })
      .is("deleted_at", null);

    if (error) {
      return {
        provider: "Supabase",
        status: "UNAVAILABLE",
        sourceReadable: false,
        latencyMs: Date.now() - startedAt,
        activeConversationRecords: null,
        detail:
          "The protected Staging database health probe could not read its aggregate source.",
      };
    }

    return {
      provider: "Supabase",
      status: "HEALTHY",
      sourceReadable: true,
      latencyMs: Date.now() - startedAt,
      activeConversationRecords: Number(count || 0),
      detail:
        "The Staging database source answered a privacy-safe aggregate health probe. No conversation content was returned.",
    };
  } catch {
    return {
      provider: "Supabase",
      status: "UNAVAILABLE",
      sourceReadable: false,
      latencyMs: null,
      activeConversationRecords: null,
      detail:
        "The protected Staging database health probe could not complete.",
    };
  }
}

async function resendFetch(path) {
  const apiKey = process.env.RESEND_API_KEY || "";
  if (!apiKey) {
    return {
      ok: false,
      status: 0,
      reason: "SOURCE_NOT_CONFIGURED",
      data: null,
    };
  }

  try {
    const response = await fetch(`https://api.resend.com${path}`, {
      method: "GET",
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(8000),
    });

    const data = await response.json().catch(() => null);

    return {
      ok: response.ok,
      status: response.status,
      reason:
        response.status === 401 || response.status === 403
          ? "TELEMETRY_PERMISSION_REQUIRED"
          : response.status === 429
            ? "RATE_LIMITED"
            : response.ok
              ? "OK"
              : "SOURCE_UNAVAILABLE",
      data,
    };
  } catch {
    return {
      ok: false,
      status: 0,
      reason: "SOURCE_UNAVAILABLE",
      data: null,
    };
  }
}

function safeUsageItem(value) {
  if (!value || typeof value !== "object") return null;
  const used = Number(value.used);
  const limit =
    value.limit === null || value.limit === undefined
      ? value.limit ?? null
      : Number(value.limit);

  return {
    used: Number.isFinite(used) ? used : null,
    limit: limit === null || Number.isFinite(limit) ? limit : null,
    resetsAt:
      typeof value.resets_at === "string" ? value.resets_at : null,
  };
}

function remainingPercent(item) {
  if (
    !item ||
    typeof item.used !== "number" ||
    typeof item.limit !== "number" ||
    item.limit <= 0
  ) {
    return null;
  }

  return Math.max(
    0,
    Math.round(((item.limit - item.used) / item.limit) * 1000) / 10
  );
}

async function checkResend() {
  const [usageResult, domainsResult] = await Promise.all([
    resendFetch("/usage"),
    resendFetch("/domains?limit=100"),
  ]);

  const permissionRequired =
    usageResult.reason === "TELEMETRY_PERMISSION_REQUIRED" ||
    domainsResult.reason === "TELEMETRY_PERMISSION_REQUIRED";

  const rateLimited =
    usageResult.reason === "RATE_LIMITED" ||
    domainsResult.reason === "RATE_LIMITED";

  const configured = Boolean(process.env.RESEND_API_KEY);

  const usage = usageResult.ok ? usageResult.data || {} : {};
  const dailyEmails = safeUsageItem(usage?.emails?.daily);
  const monthlyEmails = safeUsageItem(usage?.emails?.monthly);
  const domainsQuota = safeUsageItem(usage?.domains);

  const domains = Array.isArray(domainsResult?.data?.data)
    ? domainsResult.data.data
    : Array.isArray(domainsResult?.data)
      ? domainsResult.data
      : [];

  const verifiedDomains = domains.filter(
    (domain) => String(domain?.status || "").toLowerCase() === "verified"
  );

  const domainFailures = domains.filter((domain) =>
    ["failed", "error"].includes(
      String(domain?.status || "").toLowerCase()
    )
  );

  const monthlyRemainingPercent = remainingPercent(monthlyEmails);

  let status = "MONITORING";
  let detail =
    "The Resend Staging credential is configured. Account telemetry is being evaluated.";

  if (!configured) {
    status = "SOURCE_NOT_CONFIGURED";
    detail =
      "No Resend Staging credential is configured for this protected source.";
  } else if (permissionRequired) {
    status = "TELEMETRY_PERMISSION_REQUIRED";
    detail =
      "The existing Resend credential is available for its current application purpose, but it does not provide the account-level read permission required for this monitoring source. HIISSA does not treat that as an email-service failure.";
  } else if (rateLimited) {
    status = "DEGRADED";
    detail =
      "The Resend account source is temporarily rate limited. HIISSA should retry later rather than treat this as a permanent provider failure.";
  } else if (!usageResult.ok || !domainsResult.ok) {
    status = "UNAVAILABLE";
    detail =
      "One or more protected Resend operational sources could not be read.";
  } else if (domainFailures.length > 0) {
    status = "DEGRADED";
    detail =
      "At least one connected Resend domain reports a failed provider state.";
  } else if (
    typeof monthlyRemainingPercent === "number" &&
    monthlyRemainingPercent <= 5
  ) {
    status = "DEGRADED";
    detail =
      "The connected Resend monthly email quota has 5% or less remaining.";
  } else {
    status = "HEALTHY";
    detail =
      "The Resend account usage and domain sources are readable and no connected domain failure or critically-low monthly quota is currently established.";
  }

  return {
    provider: "Resend",
    status,
    configured,
    usageSourceReadable: usageResult.ok,
    domainSourceReadable: domainsResult.ok,
    permissionRequired,
    dailyEmails,
    monthlyEmails,
    monthlyRemainingPercent,
    domainsQuota,
    domainsObserved: domains.length,
    verifiedDomains: verifiedDomains.length,
    failedDomains: domainFailures.length,
    rateLimit: usage?.rate_limit || null,
    detail,
  };
}

function checkVercelRuntime() {
  const isVercelRuntime = String(process.env.VERCEL || "") === "1";
  const branch = process.env.VERCEL_GIT_COMMIT_REF || null;
  const targetEnvironment =
    process.env.VERCEL_TARGET_ENV || process.env.VERCEL_ENV || null;
  const commitSha = process.env.VERCEL_GIT_COMMIT_SHA || null;

  return {
    provider: "Vercel",
    status: isVercelRuntime ? "HEALTHY" : "MONITORING",
    runtimeConfirmed: isVercelRuntime,
    branch,
    targetEnvironment,
    commitSha,
    billingTelemetry: "NOT_YET_LIVE_WIRED",
    detail: isVercelRuntime
      ? "This protected endpoint is running inside the current Vercel Staging deployment. Billing/usage telemetry remains a separate source and is not inferred from runtime availability."
      : "The Vercel runtime marker is not available in this execution context.",
  };
}

function classifyProviderAttention(provider) {
  return ["DEGRADED", "UNAVAILABLE", "CRITICAL"].includes(
    String(provider?.status || "")
  );
}

export async function GET(request) {
  if (!environmentAllowed()) return blocked();

  const founder = await verifyFounder(request);
  if (!founder.ok) {
    return noStoreJson({ status: founder.reason }, founder.status);
  }

  const [supabase, resend] = await Promise.all([
    checkSupabase(founder.adminClient),
    checkResend(),
  ]);
  const vercel = checkVercelRuntime();

  const providers = [supabase, resend, vercel];
  const activeFailures = providers.filter(classifyProviderAttention);
  const permissionSetupItems = providers.filter(
    (provider) =>
      provider?.status === "TELEMETRY_PERMISSION_REQUIRED" ||
      provider?.status === "SOURCE_NOT_CONFIGURED"
  );

  const displayHealthStatus =
    activeFailures.some((provider) => provider.status === "CRITICAL")
      ? "CRITICAL"
      : activeFailures.some((provider) => provider.status === "UNAVAILABLE")
        ? "UNAVAILABLE"
        : activeFailures.some((provider) => provider.status === "DEGRADED")
          ? "DEGRADED"
          : "MONITORING";

  const founderActionRequired = false;
  const needsAttentionCount = activeFailures.length;

  const founderView = {
    whatHappened:
      activeFailures.length > 0
        ? `HIISSA detected ${activeFailures.length} connected provider-health condition(s) that require operational attention.`
        : permissionSetupItems.length > 0
          ? "The connected provider health probes found no active service failure. Some account-level telemetry permissions are still not connected, so HIISSA keeps the overall module in Monitoring rather than claiming full Healthy verification."
          : "The currently connected provider health probes found no active service failure. Several provider billing/usage feeds remain partial, so the overall module stays in Monitoring.",
    currentStatus: displayHealthStatus,
    severity:
      activeFailures.length > 0
        ? "MODERATE — PROVIDER / INFRASTRUCTURE"
        : "NONE ESTABLISHED",
    userImpact:
      activeFailures.length > 0
        ? "A connected provider condition may affect a dependent HIISSA capability if it persists or reaches an exhaustion/failure threshold."
        : "No current user-facing provider failure is established by the connected live evidence.",
    evidenceClass: "OBSERVED",
    whatHiissaAlreadyDid:
      activeFailures.length > 0
        ? "HIISSA classified the provider condition from read-only evidence and kept money-moving actions, credentials and production changes outside automatic recovery authority."
        : "HIISSA read the available provider-health evidence without exposing credentials, moving money, changing plans or altering working product behaviour.",
    doINeedToAct:
      activeFailures.length > 0
        ? "NO routine repair is assigned to the Founder. HIISSA Technical Operations should investigate first. Any credential-scope change, purchase, top-up, upgrade or renewal change remains Founder-gated."
        : permissionSetupItems.length > 0
          ? "NO immediate repair is required. Additional account-level telemetry would need a separately authorised credential/source connection; HIISSA will not widen credential scope automatically."
          : "NO — no Founder repair action is currently required.",
    recoveryNextStep:
      activeFailures.length > 0
        ? "Investigate the affected provider source, use bounded safe retry where appropriate, verify recovery, then close the condition only after healthy evidence returns."
        : "Continue read-only monitoring and connect remaining provider billing/usage sources one by one without changing working application behaviour.",
    verification:
      displayHealthStatus === "MONITORING"
        ? "Connected provider-health evidence is readable where authorised, but full System & Operations health is not claimed because several financial/usage sources remain partial or not live-wired."
        : "The provider condition remains open until its source is rechecked and recovery is verified.",
    finalResolution:
      displayHealthStatus === "MONITORING"
        ? "MONITORING — PARTIAL LIVE PROVIDER EVIDENCE"
        : "OPEN — VERIFICATION REQUIRED",
  };

  return noStoreJson({
    status:
      displayHealthStatus === "MONITORING"
        ? "MONITORING"
        : "NEEDS_ATTENTION",
    displayHealthStatus,
    moduleId: "system-operations",
    monitoringStatus: "PARTIALLY_LIVE_WIRED",
    needsAttentionCount,
    founderActionRequired,
    actionOwner:
      activeFailures.length > 0
        ? "HIISSA_TECHNICAL_OPERATIONS"
        : "HIISSA",
    providers: {
      supabase,
      resend,
      vercel,
      openai: {
        status: "SEPARATE_EXISTING_SOURCE",
        route: "/api/admin/control-room/openai-provider-summary",
        detail:
          "OpenAI organization usage/cost evidence remains owned by the existing protected provider source and is not duplicated here.",
      },
      cloudflare: {
        status: "CONFIGURATION_EVIDENCE_ONLY",
        turnstileConfigured: Boolean(
          process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY &&
            process.env.TURNSTILE_SECRET_KEY
        ),
        billingTelemetry: "NOT_YET_LIVE_WIRED",
      },
      github: {
        status: commitShaOrNull(process.env.VERCEL_GIT_COMMIT_SHA)
          ? "DEPLOYMENT_SOURCE_EVIDENCE"
          : "MONITORING",
        billingTelemetry: "NOT_YET_LIVE_WIRED",
      },
    },
    founderView,
    moneySafety: {
      automaticPurchaseAllowed: false,
      automaticTopUpAllowed: false,
      automaticUpgradeAllowed: false,
      automaticRenewalChangeAllowed: false,
    },
    privacyBoundary: {
      rawApiKeysReturned: false,
      passwordsReturned: false,
      rawTokensReturned: false,
      paymentCardDetailsReturned: false,
      conversationContentReturned: false,
    },
    protectedCore: {
      automaticProviderConfigurationChangePerformed: false,
      automaticCredentialScopeChangePerformed: false,
      automaticMoneyMovementPerformed: false,
      productionEffectEnabled: false,
    },
    refreshedAt: new Date().toISOString(),
    productionEffectEnabled: false,
  });
}

function commitShaOrNull(value) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}
