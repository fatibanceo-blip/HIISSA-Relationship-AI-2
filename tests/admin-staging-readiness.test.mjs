import test from "node:test";
import assert from "node:assert/strict";
import { assessAdminStagingReadiness } from "../lib/admin/staging-readiness.js";

// Pure configuration tests only. No secrets, network requests, deployments or DB writes.
const valid = {
  supabaseUrl: "https://upcssfmilewwshyxyvdf.supabase.co",
  publishableKey: "sb_publishable_TEST_PLACEHOLDER_NOT_A_REAL_KEY",
  deploymentBranch: "feature/admin-permissions-package-a",
  environmentName: "staging",
};

test("complete staging-shaped configuration allows only a future live check", () => {
  const result = assessAdminStagingReadiness(valid);
  assert.equal(result.readyForLiveVerification, true);
  assert.equal(result.liveConnectionVerified, false);
  assert.equal(result.deploymentIsolationVerified, false);
  assert.equal(result.a52Accepted, false);
  assert.equal(result.checks.length, 5);
});

test("missing inputs fail closed", () => {
  const result = assessAdminStagingReadiness();
  assert.equal(result.readyForLiveVerification, false);
  assert.ok(result.checks.every((check) => !check.passed));
});

test("production URL is rejected", () => {
  const result = assessAdminStagingReadiness({
    ...valid,
    supabaseUrl: "https://fozkfuuoudnumbdszkyz.supabase.co",
  });
  assert.equal(result.readyForLiveVerification, false);
  assert.equal(result.checks.find((check) => check.id === "not-production").passed, false);
});

test("malformed URL and lookalike hostname are rejected", () => {
  for (const supabaseUrl of ["not a URL", "http://upcssfmilewwshyxyvdf.supabase.co", "https://upcssfmilewwshyxyvdf.supabase.co.evil.example"]) {
    assert.equal(assessAdminStagingReadiness({ ...valid, supabaseUrl }).readyForLiveVerification, false);
  }
});

test("legacy, missing and server-secret-shaped keys are rejected", () => {
  for (const publishableKey of ["", "legacy-anon-key", "sb_secret_NOT_A_REAL_KEY"]) {
    assert.equal(assessAdminStagingReadiness({ ...valid, publishableKey }).readyForLiveVerification, false);
  }
});

test("wrong branch or environment is rejected", () => {
  assert.equal(assessAdminStagingReadiness({ ...valid, deploymentBranch: "main" }).readyForLiveVerification, false);
  assert.equal(assessAdminStagingReadiness({ ...valid, environmentName: "production" }).readyForLiveVerification, false);
});
