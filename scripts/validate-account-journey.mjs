import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const files = {
  registry: path.join(root, "lib", "experience-registry.js"),
  main: path.join(root, "app", "page.js"),
  myHiissa: path.join(root, "app", "my-hiissa", "page.js"),
  account: path.join(root, "app", "my-hiissa", "account", "page.js"),
  conversations: path.join(root, "app", "my-hiissa", "conversations", "page.js"),
  talk: path.join(root, "app", "talk", "page.js"),
  authContinue: path.join(root, "app", "auth", "continue", "page.js"),
};

const errors = [];
const pending = [];

function read(key) {
  const file = files[key];
  if (!fs.existsSync(file)) {
    errors.push(`Missing account-journey dependency: ${file}`);
    return "";
  }
  return fs.readFileSync(file, "utf8");
}

function requireText(label, source, text) {
  if (!source.includes(text)) {
    errors.push(`${label}: missing required journey contract text/route: ${text}`);
  }
}

const registry = read("registry");
const main = read("main");
const myHiissa = read("myHiissa");
const account = read("account");
const conversations = read("conversations");
const talk = read("talk");
const authContinue = read("authContinue");

const journeyStart = registry.indexOf("accountJourney: Object.freeze({");
const journeyEnd = registry.indexOf(
  "canonicalSignIn: Object.freeze({",
  journeyStart
);

if (journeyStart < 0 || journeyEnd < 0) {
  errors.push("Canonical account journey Registry contract is missing");
} else {
  const journey = registry.slice(journeyStart, journeyEnd);

  requireText("Account journey Registry", journey, 'id: "account.journey"');
  requireText("Account journey Registry", journey, 'stage: "DESIGN_APPROVED"');
  requireText("Account journey Registry", journey, '"SIGNED_OUT_MAIN"');
  requireText("Account journey Registry", journey, '"SIGN_IN"');
  requireText("Account journey Registry", journey, '"MAGIC_LINK"');
  requireText("Account journey Registry", journey, '"CONTINUE_SECURELY"');
  requireText("Account journey Registry", journey, '"MY_HIISSA_HOME"');
  requireText("Account journey Registry", journey, '"ACCOUNT"');
  requireText("Account journey Registry", journey, '"TALK"');
  requireText("Account journey Registry", journey, '"EXPLORE"');
  requireText("Account journey Registry", journey, '"CONVERSATIONS"');
  requireText("Account journey Registry", journey, '"BACK_TO_MY_HIISSA"');
  requireText("Account journey Registry", journey, '"BACK_TO_MAIN"');
  requireText("Account journey Registry", journey, '"SIGN_OUT_THIS_DEVICE"');
  requireText("Account journey Registry", journey, '"SIGNED_OUT_MAIN_AGAIN"');
}

// Existing working pieces that already form part of the approved journey.
requireText("Public Main", main, 'href="/talk?signin=1&from=home"');
requireText("Auth Continue", authContinue, ': "/my-hiissa",');
requireText("My HIISSA", myHiissa, 'href="/my-hiissa/account"');
requireText("My HIISSA", myHiissa, 'href="/my-hiissa/conversations"');
requireText("My HIISSA", myHiissa, 'href="/talk?myHiissaTalk=1#hiissa-conversation"');
requireText("My HIISSA", myHiissa, 'href="/talk?myHiissaExplore=1"');
requireText("My HIISSA", myHiissa, 'href="/"');
requireText("My Account", account, 'scope: "local"');
requireText("My Account", account, 'window.location.assign("/")');
requireText("My Account", account, 'href="/my-hiissa"');
requireText("My Conversations", conversations, 'href="/my-hiissa"');
requireText("Talk", talk, "← Back to My HIISSA");

// The Founder has approved the complete journey design, but the remaining
// navigation connections must not be silently treated as complete.
const mainAppearsSessionAware =
  main.includes("auth.getSession") ||
  main.includes("onAuthStateChange") ||
  main.includes("My HIISSA");

if (!mainAppearsSessionAware) {
  pending.push(
    "Public Main is not yet session-aware: signed-in users still need the approved My HIISSA entry behaviour connected."
  );
}

const privateHomeHasSignedOutGuard =
  myHiissa.includes('authState !== "ready"') &&
  myHiissa.includes("/talk?signin=1&from=home");

if (!privateHomeHasSignedOutGuard) {
  pending.push(
    "My HIISSA signed-out protection still needs to be reconciled with the one canonical Sign-in journey."
  );
}

if (errors.length > 0) {
  console.error("\nHIISSA complete account journey contract: FAIL\n");
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log("HIISSA complete account journey contract: PASS");
console.log("- One canonical account journey Registry contract is present");
console.log("- Existing Main → Sign in → authentication → My HIISSA handoff is represented");
console.log("- My HIISSA child destinations and return paths are represented");
console.log("- Local-device sign out returns to Main");
console.log("- The gate distinguishes approved design from completed connection");

if (pending.length > 0) {
  console.log("\nApproved journey connections still pending Founder-authorised implementation:");
  for (const item of pending) {
    console.log(`- ${item}`);
  }
}
