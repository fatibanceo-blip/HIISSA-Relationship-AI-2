import "server-only";

const REPAIR_BRANCH = "repair/guest-save-sync-handoff";
const STAGING_URL = "https://upcssfmilewwshyxyvdf.supabase.co";
const CONFIG_MESSAGES = Object.freeze({
  GUEST_PREVIEW_BRANCH_UNVERIFIED: "Guest migration: Preview branch metadata is missing; no Supabase request was made.",
  GUEST_STAGING_PROJECT_MISMATCH: "Guest migration: this repair Preview requires the isolated Staging Supabase URL; no Supabase request was made.",
  GUEST_SERVER_SECRET_TYPE_INVALID: "Guest migration: this repair Preview requires a modern server secret with a nonempty suffix and no whitespace; no Supabase request was made.",
});

class GuestConfigurationError extends Error {
  constructor(code) {
    super(CONFIG_MESSAGES[code]);
    this.code = code;
  }
}

export function validateGuestMigrationServerConfig(supabaseUrl, secretKey) {
  if (process.env.VERCEL_ENV !== "preview") return;

  const branch = process.env.VERCEL_GIT_COMMIT_REF;
  if (!branch || !branch.trim()) {
    throw new GuestConfigurationError("GUEST_PREVIEW_BRANCH_UNVERIFIED");
  }
  if (branch !== REPAIR_BRANCH) return;

  // Exact comparison also rejects URL credentials, ports, paths and query/hash data.
  if (supabaseUrl !== STAGING_URL && supabaseUrl !== `${STAGING_URL}/`) {
    throw new GuestConfigurationError("GUEST_STAGING_PROJECT_MISMATCH");
  }
  // Do not trim: whitespace in a configured secret must be rejected, not repaired.
  // This validates the key type only; Supabase must still validate the credential.
  if (typeof secretKey !== "string" || !/^sb_secret_\S+$/.test(secretKey) || /\s/.test(secretKey)) {
    throw new GuestConfigurationError("GUEST_SERVER_SECRET_TYPE_INVALID");
  }
}

const OPERATIONS = new Set([
  "handoff-create", "handoff-cancel", "claim-auth", "claim-lookup",
  "claim-complete", "claim-recheck", "claim-request",
]);

export function logGuestMigrationFailure(operation, error) {
  let code = "GUEST_SUPABASE_OPERATION_FAILED";
  let message = "Guest migration operation failed. Inspect the operation and configuration without logging credentials or payloads.";

  if (error instanceof GuestConfigurationError) {
    code = error.code;
    message = CONFIG_MESSAGES[code];
  } else if (typeof error?.message === "string" && /\binvalid api key\b/i.test(error.message)) {
    code = "GUEST_SUPABASE_CREDENTIAL_REJECTED";
    message = operation === "claim-auth"
      ? "Guest migration: Supabase rejected the configured public API credential during session verification. Verify the project/key pairing and deployment environment snapshot."
      : "Guest migration: Supabase rejected the configured API credential. Verify the server project/key pairing and deployment environment snapshot.";
  } else if (operation === "claim-auth") {
    code = "GUEST_SESSION_REJECTED";
    message = "Guest migration: the user session could not be verified.";
  }

  // Never forward raw upstream messages, error objects, URLs, tokens or payloads.
  console.error("HIISSA Guest migration diagnostic:", {
    operation: OPERATIONS.has(operation) ? operation : "guest-migration",
    code,
    message,
  });
}
