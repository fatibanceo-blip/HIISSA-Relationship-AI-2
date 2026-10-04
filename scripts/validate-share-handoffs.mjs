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
const registry = read("lib/experience-registry.js");
const pkg = read("package.json");

for (const required of [
  'import QRCode from "qrcode"',
  'https://wa.me/?text=${encodeURIComponent(sampleMessage)}',
  'sms:?body=${encodeURIComponent(sampleMessage)}',
  'const emailHref = `mailto:?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(sampleMessage)}`;',
  'const isAndroid =',
  '/Android/i.test(navigator.userAgent || "")',
  'if (isAndroid && navigator.share)',
  'await navigator.share({',
  'window.location.assign(emailHref)',
  'navigator.clipboard.writeText(sampleLink)',
  'document.execCommand("copy")',
  'QRCode.toDataURL(value',
  'if (!navigator.share)',
  'await navigator.share({',
  'text: sampleMessage',
  'onClick={selected === "whatsapp" ? openWhatsApp : openMessages}',
  'onClick={openEmail}',
  'onClick={copyInvitationLink}',
  'onClick={openPhoneShare}',
  'STAGING HANDOFF TEST · NOTHING SENDS AUTOMATICALLY',
  'You still choose the recipient and press Send',
  'On Android, HIISSA opens your phone’s share chooser',
  'Copying does not send it to anyone',
  'HIISSA does not silently send anything',
]) {
  requireText("Stage 2 Share handoff implementation", share, required);
}

for (const required of [
  'status: "founder-approved-stage-2-real-share-handoffs-staging-implementation"',
  'stage2CurrentAuthority: Object.freeze({',
  'environment: "STAGING_ONLY"',
  'productionMain: "UNTOUCHED_AND_NOT_AUTHORISED"',
  'HIISSA does not choose the recipient',
  'HIISSA does not ask for or store a recipient WhatsApp number to perform the handoff',
  'HIISSA does not press Send or silently transmit the invitation',
  'Production activation requires separate Founder approval after Stage 2 testing and regression',
  'status: "founder-tested-stage-2-share-handoffs-pass"',
  'stage: "FOUNDER_TESTED"',
  'WhatsApp, Messages/Text, Email handoff and receipt, Copy Link, QR Code, and Native Phone Share all passed',
  'PASS_STAGE_2_ALL_SIX_SHARE_HANDOFFS_2026_10_04',
]) {
  requireText("Stage 2 Registry authority", registry, required);
}

for (const required of [
  '"qrcode": "^1.5.4"',
  '"test:share-handoffs": "node scripts/validate-share-handoffs.mjs"',
]) {
  requireText("Stage 2 package/build contract", pkg, required);
}

if (errors.length) {
  console.error("\nHIISSA Stage 2 Share handoffs: FAIL\n");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("HIISSA Stage 2 Share handoffs: PASS");
console.log("- WhatsApp handoff present");
console.log("- Messages/Text handoff present");
console.log("- Email handoff present");
console.log("- Copy Link handoff with fallback present");
console.log("- Local QR generation present");
console.log("- Native phone share handoff present");
console.log("- User remains responsible for choosing recipient and pressing Send");
console.log("- Production activation remains unauthorised");
