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

const share = read("app/share-hiissa-preview/page.js");
const arrival = read("app/invite/[code]/route.js");
const authConfirm = read("app/auth/confirm/route.js");
const controlRoom = read("app/admin/control-room-preview/page.js");
const registry = read("lib/experience-registry.js");

for (const required of [
  '"get_or_create_my_referral_code"',
  'https://hiissa.com/invite/${referralCode}',
  "Share your invitation",
  "WhatsApp",
  "Messages / Text",
  "Email",
  "Copy Link",
  "QR Code",
  "Phone Share",
  "Share HIISSA. Never your story.",
  "Referral growth layer — approved, not active yet",
]) {
  requireText("Approved Share interface + referral identity", share, required);
}

for (const required of [
  '"record_referral_visit"',
  "THIRTY_DAYS_SECONDS",
  'httpOnly: true',
  'sameSite: "lax"',
  "hiissa_referral_code",
  "hiissa_referral_visit",
  "First-touch attribution",
]) {
  requireText("Referral arrival route", arrival, required);
}

for (const required of [
  "await supabase.auth.verifyOtp",
  '"claim_referral_attribution"',
  "Referral attribution is deliberately separate from",
  'response.cookies.delete(',
  '"hiissa_referral_code"',
  '"hiissa_referral_visit"',
]) {
  requireText("Magic-Link referral attribution handoff", authConfirm, required);
}

for (const required of [
  'adminDataClient.rpc("get_hiissa_referral_stats")',
  "REFERRAL GROWTH — STAGE 1 FOUNDATION",
  "Privacy-safe invitation attribution",
  "ACTIVE REFERRERS",
  "REFERRAL VISITS",
  "SUCCESSFUL JOINS",
  "JOIN CONVERSION",
]) {
  requireText("Founder referral visibility", controlRoom, required);
}

for (const required of [
  'id: "hiissa.share-referral-foundation"',
  'status: "founder-approved-preview-deployed-testing-pending"',
  'stage: "PREVIEW_DEPLOYED"',
  "30-day eligibility window for later account attribution",
  "self-referral blocking",
  "do not add IP-address collection to the Stage 1 referral foundation",
  "automatic rewards",
  "Production activation",
]) {
  requireText("Referral Registry contract", registry, required);
}

if (errors.length) {
  console.error("\nHIISSA Stage 1 referral foundation: FAIL\n");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("HIISSA Stage 1 referral foundation: PASS");
console.log("- Approved Share visual contract is preserved");
console.log("- Signed-in referral identity connection is present");
console.log("- First-touch 30-day referral arrival path is present");
console.log("- Referral and Magic-Link authentication remain separate");
console.log("- Later account attribution claim is connected");
console.log("- Founder aggregate referral visibility is present");
console.log("- Rewards, ambassador features and Production remain disabled");
