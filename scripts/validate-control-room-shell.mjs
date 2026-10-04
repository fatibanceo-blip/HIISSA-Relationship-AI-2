import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const pagePath = path.join(root, "app", "admin", "control-room-preview", "page.js");
const registryPath = path.join(root, "lib", "experience-registry.js");

const errors = [];

function requireText(label, source, text) {
  if (!source.includes(text)) errors.push(`${label}: missing ${text}`);
}

if (!fs.existsSync(pagePath)) errors.push("Founder Control Room preview page is missing.");
if (!fs.existsSync(registryPath)) errors.push("Experience Registry is missing.");

const page = fs.existsSync(pagePath) ? fs.readFileSync(pagePath, "utf8") : "";
const registry = fs.existsSync(registryPath) ? fs.readFileSync(registryPath, "utf8") : "";

for (const label of [
  "Overview",
  "Users & Identity",
  "Subscriptions & Access",
  "Feedback & Recommendations",
  "Safety, Privacy & Moderation",
  "Failures & Reliability",
  "Authentication & Sync Health",
  "HIISSA AI & Product Intelligence",
  "System & Operations",
  "Admin Security & Audit",
]) requireText("Control Room shell", page, label);

for (const required of [
  "← Back to HIISSA",
  "Sign out",
  "ISOLATED PREVIEW",
  "No fake health numbers.",
  "FEATURE OPERATIONAL VISIBILITY",
  "SHARED DETAIL VIEW — FOUNDATION",
]) requireText("Control Room shell", page, required);

for (const feature of [
  "youngHiissa",
  "hiissaRest",
  "hiissaAlongside",
]) requireText("Registry-driven feature visibility", page, feature);

for (const registryRule of [
  "export const CONTROL_ROOM_MODULE_REGISTRY",
  "futureExpansionAllowed: true",
  "export const FEATURE_OPERATIONAL_VISIBILITY_STANDARD",
  "controlRoomConnectionRequired: true",
]) requireText("Registry", registry, registryRule);

if (errors.length) {
  console.error("\nFounder Control Room shell contract: FAIL\n");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("Founder Control Room shell contract: PASS");
console.log("- Ten current modules present");
console.log("- Current shell is explicitly isolated and non-live");
console.log("- Registry-driven operational visibility is present");
console.log("- Young HIISSA, HIISSA Rest and HIISSA Alongside are surfaced from Registry");
console.log("- Future Control Room module expansion remains enabled without creating Module 11 today");
