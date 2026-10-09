import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// HIISSA Step 1: source-backed READ-ONLY operational visibility, never an employee action.
// This route is not a durable incident/event publisher or a proof of a complete HR lifecycle.
function reply(payload, status = 200) {
  return NextResponse.json(payload, {
    status,
    headers: { "Cache-Control": "private, no-store" },
  });
}

function stagingOnly() {
  const branch = process.env.VERCEL_GIT_COMMIT_REF || "";
  const environment = process.env.VERCEL_TARGET_ENV || process.env.VERCEL_ENV || "";
  return branch === "feature/founder-control-room-staging" && environment !== "production";
}

function clientOptions() {
  return { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } };
}

async function founderClient(request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publicKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const secret = process.env.SUPABASE_SECRET_KEY;
  if (!url || !publicKey || !secret) return { error: "STAGING_ADMIN_DATA_NOT_CONFIGURED", status: 503 };

  const bearer = request.headers.get("authorization") || "";
  const token = bearer.startsWith("Bearer ") ? bearer.slice(7).trim() : "";
  if (!token) return { error: "UNAUTHENTICATED", status: 401 };

  const verification = createClient(url, publicKey, clientOptions());
  const privileged = createClient(url, secret, clientOptions());
  try {
    const { data, error } = await verification.auth.getUser(token);
    if (error || !data?.user) return { error: "UNAUTHENTICATED", status: 401 };
    const founder = await privileged.from("admin_users")
      .select("user_id").eq("user_id", data.user.id).maybeSingle();
    if (founder.error || !founder.data) return { error: "FOUNDER_GATE_REQUIRED", status: 403 };
    return { privileged };
  } catch {
    return { error: "FOUNDER_GATE_UNAVAILABLE", status: 503 };
  }
}

function unavailable(reason, flags) {
  return {
    status: "UNAVAILABLE",
    displayHealthStatus: "UNAVAILABLE",
    featureId: "hiissa.founder.employee-register-attendance-preview",
    source: "existing-staging-employee-onboarding-attendance-tables",
    checkedAt: new Date().toISOString(),
    sourceState: "SOURCE_READ_FAILED",
    sourceFlags: flags,
    realEmployeeCount: null,
    onboardingApplicationCount: null,
    awaitingFounderReviewCount: null,
    attendanceEventCount: null,
    entryState: "ONBOARDING_WRITE_JOURNEY_NOT_ACTIVE",
    attendanceClassification: "NOT_CERTIFIED",
    founderActionRequired: false,
    actionOwner: "HIISSA_TECHNICAL_OPERATIONS",
    oversightLevel: "L2_READ_FAILURE_REQUIRES_TECHNICAL_CHECK",
    healthMeaning: "The protected Staging employee sources could not all be checked. This is not a claim of zero records or a successful employee journey.",
    whatHiissaDid: "Failed closed; returned no personal employee or applicant records and made no changes.",
    recovery: "Check the existing source and permissions, retry a bounded read, and verify a later successful result before closing any incident.",
    sharedAlertPersistence: "NOT_WIRED",
    incidentEventPersistence: "NOT_WIRED",
    automaticRecovery: "NO_DATA_MUTATION_OR_UNSAFE_RETRY",
    productionEffectEnabled: false,
    errorCode: reason,
  };
}

export async function GET(request) {
  if (!stagingOnly()) return new NextResponse(null, { status: 404 });
  const founder = await founderClient(request);
  if (founder.error) return reply({ status: founder.error }, founder.status);

  try {
    const db = founder.privileged;
    const [employees, applications, awaiting, attendance] = await Promise.all([
      db.from("hiissa_employee_register")
        .select("employee_id", { count: "exact", head: true }).eq("environment", "staging"),
      db.from("hiissa_staff_onboarding_applications")
        .select("application_id", { count: "exact", head: true }).eq("environment", "staging"),
      db.from("hiissa_staff_onboarding_applications")
        .select("application_id", { count: "exact", head: true }).eq("environment", "staging")
        .in("submission_state", ["submitted", "under_review"]),
      db.from("hiissa_attendance_events")
        .select("attendance_event_id", { count: "exact", head: true }).eq("environment", "staging"),
    ]);
    const flags = {
      employeeSourceReadable: !employees.error,
      onboardingSourceReadable: !applications.error && !awaiting.error,
      attendanceSourceReadable: !attendance.error,
    };
    if (!Object.values(flags).every(Boolean)) {
      console.error("HIISSA_EMPLOYEE_OPERATIONAL_SOURCE_READ_FAILED", flags);
      return reply(unavailable("EMPLOYEE_OPERATIONAL_SOURCE_READ_FAILED", flags), 503);
    }
    const allEmpty = [employees, applications, attendance].every((item) => item.count === 0);
    return reply({
      status: "MONITORING",
      displayHealthStatus: "MONITORING",
      featureId: "hiissa.founder.employee-register-attendance-preview",
      source: "existing-staging-employee-onboarding-attendance-tables",
      checkedAt: new Date().toISOString(),
      sourceState: allEmpty ? "READABLE_EMPTY" : "READABLE_RECORDS_PRESENT",
      sourceFlags: flags,
      realEmployeeCount: employees.count,
      onboardingApplicationCount: applications.count,
      awaitingFounderReviewCount: awaiting.count,
      attendanceEventCount: attendance.count,
      entryState: "ONBOARDING_WRITE_JOURNEY_NOT_ACTIVE",
      attendanceClassification: "NOT_CERTIFIED",
      founderActionRequired: false,
      actionOwner: "HIISSA_TECHNICAL_OPERATIONS",
      oversightLevel: "L1_SOURCE_READ_ONLY",
      healthMeaning: allEmpty
        ? "All three real Staging sources answered successfully and currently contain zero records; fictional demonstration staff are excluded."
        : "The real Staging sources answered successfully. Record existence alone does not certify onboarding, staff engagement, attendance or permissions.",
      whatHiissaDid: "Read aggregate source counts only. No employee, applicant, attendance or conversation content returned.",
      recovery: "No recovery performed. Future failures require bounded recheck and evidence before a resolved status.",
      sharedAlertPersistence: "NOT_WIRED",
      incidentEventPersistence: "NOT_WIRED",
      automaticRecovery: "NOT_ACTIVE",
      founderApprovalForWrites: "L3_REQUIRED_BEFORE_PERSONNEL_OR_PERMISSION_CHANGES",
      productionEffectEnabled: false,
    });
  } catch {
    console.error("HIISSA_EMPLOYEE_OPERATIONAL_SOURCE_EXCEPTION");
    return reply(unavailable("EMPLOYEE_OPERATIONAL_EXCEPTION", {
      employeeSourceReadable: false,
      onboardingSourceReadable: false,
      attendanceSourceReadable: false,
    }), 503);
  }
}
