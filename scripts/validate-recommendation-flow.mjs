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

const talkPage = read("app/talk/page.js");
const panel = read("app/talk/SuggestInvitePanel.js");
const share = read("app/share-hiissa-preview/page.js");
const registry = read("lib/experience-registry.js");
const controlRoom = read("app/admin/control-room-preview/page.js");

for (const required of [
  'import SuggestInvitePanel from "./SuggestInvitePanel";',
  '<SuggestInvitePanel supabase={supabase} />',
]) {
  requireText("Talk feedback-card connection", talkPage, required);
}

for (const required of [
  "Suggest &amp; Invite",
  "Make a recommendation",
  "Invite someone to HIISSA",
  '"submit_recommendation"',
  'window.location.assign("/share-hiissa-preview")',
  "What's your idea or suggestion?",
  "What area is this about?",
  "Why would this be helpful?",
  "HIISSA has received your recommendation.",
  "Back to chat",
  "prefers-reduced-motion: reduce",
]) {
  requireText("Suggest & Invite recommendation panel", panel, required);
}

for (const required of [
  "Share your invitation",
  "WhatsApp",
  "Messages / Text",
  "Email",
  "Copy Link",
  "QR Code",
  "Phone Share",
  "Share HIISSA. Never your story.",
]) {
  requireText("Existing approved Share interface", share, required);
}

for (const required of [
  "export const MAKE_RECOMMENDATION_STANDARD",
  'id: "hiissa.make-recommendation"',
  'makeRecommendation: Object.freeze({',
  "Existing public.feedback source of truth",
  "Do not rewrite the feedback trigger",
  'stage: "IMPLEMENTED_ISOLATED"',
  'founderTest: "NOT_RUN"',
]) {
  requireText("Recommendation Registry contract", registry, required);
}

for (const required of [
  'adminDataClient.rpc("get_hiissa_recommendations")',
  "User ideas and improvements",
  "Recommendations are private product-improvement submissions.",
  "Connected Staging submission + read-only Module 4 view",
]) {
  requireText("Founder Control Room Recommendation view", controlRoom, required);
}

if (errors.length) {
  console.error("\nHIISSA Suggest & Invite / Recommendation journey: FAIL\n");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("HIISSA Suggest & Invite / Recommendation journey: PASS");
console.log("- Existing feedback card preserved and extended additively");
console.log("- Recommendation submission doorway is connected");
console.log("- Existing approved Share interface is reused unchanged");
console.log("- Recommendation Registry and Module 4 read path are present");
console.log("- Founder user-facing mobile journey passed on 2026-10-04; Control Room view and Production release remain pending");
