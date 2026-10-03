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
  const allowedJourneyStages = [
    "DESIGN_APPROVED",
    "REGISTRY_REGISTERED",
    "IMPLEMENTED_ISOLATED",
    "AUTOMATED_CHECKS_PASS",
    "PREVIEW_DEPLOYED",
    "FOUNDER_TESTED",
    "REGRESSION_PASS",
    "CONNECTED",
  ];

  if (
    !allowedJourneyStages.some((stage) =>
      journey.includes(`stage: "${stage}"`)
    )
  ) {
    errors.push(
      "Account journey Registry: certification stage is invalid for pre-Production journey work"
    );
  }
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
requireText("My Account", account, 'window.location.replace("/")');
requireText("My Account", account, 'href="/my-hiissa"');
requireText("My Account", account, 'authState === "signedout"');
requireText(
  "My Account",
  account,
  'window.location.replace(\n      "/talk?signin=1&from=home"'
);
requireText("My Conversations", conversations, 'href="/my-hiissa"');
requireText("My Conversations", conversations, 'authState === "signedout"');
requireText(
  "My Conversations",
  conversations,
  'window.location.replace(\n      "/talk?signin=1&from=home"'
);
requireText("Talk", talk, "← Back to My HIISSA");
requireText("Talk", talk, "!myHiissaEntry");
requireText(
  "Talk",
  talk,
  "}, [authInitialised, authSession, myHiissaEntry]);"
);

// The Founder has approved the complete journey design, but the remaining
// navigation connections must not be silently treated as complete.
requireText("Public Main", main, "createBrowserClient");
requireText("Public Main", main, "supabase.auth");
requireText("Public Main", main, ".getSession()");
requireText("Public Main", main, "onAuthStateChange");
requireText("Public Main", main, 'authState === "ready"');
requireText("Public Main", main, 'href="/my-hiissa"');
requireText("Public Main", main, '>My HIISSA</Link>');
requireText("Public Main", main, 'authState === "signedout"');
requireText("Public Main", main, '>Sign in</Link>');

requireText("My HIISSA protection", myHiissa, 'authState === "signedout"');
requireText(
  "My HIISSA protection",
  myHiissa,
  'window.location.replace(\n      "/talk?signin=1&from=home"'
);

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
console.log("- Public Main session-aware Sign in / My HIISSA switch is enforced");
console.log("- Signed-out My HIISSA access is routed through canonical Sign in");
console.log("- Signed-out Account, Conversations and My HIISSA Talk/Explore entries use the same Sign-in door");
console.log("- Local-device sign out replaces Account with signed-out Main in browser history");

if (pending.length > 0) {
  console.log("\nApproved journey connections still pending Founder-authorised implementation:");
  for (const item of pending) {
    console.log(`- ${item}`);
  }
}
