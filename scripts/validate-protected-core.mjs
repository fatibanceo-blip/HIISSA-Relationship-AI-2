import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const errors = [];

function read(relativePath) {
  const fullPath = path.join(root, relativePath);
  if (!fs.existsSync(fullPath)) {
    errors.push(`Missing file: ${relativePath}`);
    return "";
  }
  return fs.readFileSync(fullPath, "utf8");
}

function requireText(label, source, text) {
  if (!source.includes(text)) {
    errors.push(`${label}: missing ${text}`);
  }
}

const registry = read("lib/experience-registry.js");

for (const required of [
  'id: "guest.save-sync"',
  'status: "production-released-historical-pass-protected"',
  'stage: "PRODUCTION_RELEASED"',
  'founderTest: "PASS"',
  'release: "PRODUCTION_RELEASED"',
  'connection: "CONNECTED"',
  "Stage 4 Guest Save & Sync Production acceptance PASS",
  "do not reopen Stage 4 Guest Save & Sync without new evidence",
  "explicit Save my existing conversations OR Start my account without these conversations",
  "guestSourceId remains the canonical migration identifier",
  "do not use email address as the ownership key for Guest conversations",
  "do not weaken one-time handoff-token or authenticated-claim protections",
]) {
  requireText("Guest Save & Sync protected-core Registry contract", registry, required);
}

if (errors.length) {
  console.error("\nHIISSA protected core gate: FAIL\n");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("HIISSA protected core gate: PASS");
console.log("- Guest Save & Sync has a dedicated canonical Registry identity");
console.log("- Historical Production PASS and release evidence are preserved");
console.log("- Save/Skip consent, ownership, handoff and idempotency boundaries are locked");
console.log("- Future builds must preserve this contract unless the Founder explicitly approves a change");
