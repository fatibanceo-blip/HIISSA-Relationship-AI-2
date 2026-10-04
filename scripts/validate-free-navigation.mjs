import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const files = {
  registry: path.join(root, "lib", "experience-registry.js"),
  main: path.join(root, "app", "page.js"),
  freeAccess: path.join(root, "app", "free-access", "page.js"),
  guestEntry: path.join(root, "app", "free", "page.js"),
  guestHome: path.join(root, "app", "free", "welcome", "page.js"),
  talk: path.join(root, "app", "talk", "page.js"),
};

const errors = [];

function read(name) {
  const file = files[name];
  if (!fs.existsSync(file)) {
    errors.push(`Missing access/navigation dependency: ${file}`);
    return "";
  }
  return fs.readFileSync(file, "utf8");
}

function requireText(label, source, text) {
  if (!source.includes(text)) {
    errors.push(`${label}: missing required contract text/route: ${text}`);
  }
}

function forbidText(label, source, text) {
  if (source.includes(text)) {
    errors.push(`${label}: forbidden legacy user-facing text still present: ${text}`);
  }
}

const registry = read("registry");
const main = read("main");
const freeAccess = read("freeAccess");
const guestEntry = read("guestEntry");
const guestHome = read("guestHome");
const talk = read("talk");

// Founder-approved Registry identities.
for (const id of [
  "free.access.home",
  "free.access.talk.entry",
  "free.access.explore.entry",
  "guest.account.entry",
  "guest.account.home",
  "guest.account.talk.entry",
  "guest.account.explore.entry",
]) {
  requireText("Registry", registry, `id: "${id}"`);
}
requireText("Registry", registry, 'canonicalSuccessorId: "free.access.home"');
requireText("Registry", registry, 'canonicalSuccessorId: "guest.account.entry"');
requireText("Registry", registry, 'canonicalSuccessorId: "guest.account.home"');

// Main design/order stays intact; only approved wording/routing changes.
requireText("Main", main, 'href="/free-access"');
requireText("Main", main, "Continue with FREE access — no account needed");
requireText("Main", main, 'href="/free"');
requireText("Main", main, "Get started with HIISSA Guest");
requireText("Main", main, "Create your free account");
forbidText("Main", main, "Continue as a guest — no account needed");
forbidText("Main", main, "Get started with HIISSA FREE");

// FREE Access gets its own home before canonical Talk/Explore.
requireText("FREE Access", freeAccess, "Welcome to HIISSA FREE");
requireText("FREE Access", freeAccess, "A taste of HIISSA. No account needed.");
requireText("FREE Access", freeAccess, 'href="/talk?freeAccessTalk=1"');
requireText("FREE Access", freeAccess, 'href="/talk?freeAccessExplore=1"');
requireText("FREE Access", freeAccess, 'href="/"');
requireText("FREE Access", freeAccess, "Talk");
requireText("FREE Access", freeAccess, "Listen");
requireText("FREE Access", freeAccess, "Read");
requireText("FREE Access", freeAccess, "Reflect");
requireText("FREE Access", freeAccess, "Reset");
requireText("FREE Access", freeAccess, "Grow");
requireText("FREE Access", freeAccess, "Discover");

// Account-based path is user-facing HIISSA Guest while keeping legacy technical /free routes.
requireText("Guest entry", guestEntry, "Get started with HIISSA Guest");
requireText("Guest entry", guestEntry, "HIISSA Guest welcome");
requireText("Guest home", guestHome, ">GUEST</span>");
requireText("Guest home", guestHome, "Your HIISSA Guest account is ready.");
requireText("Guest home", guestHome, 'href="/talk?guestAccountTalk=1"');
requireText("Guest home", guestHome, 'href="/talk?guestAccountExplore=1"');

// Canonical Talk/Explore preserves each origin and returns to the right home.
requireText("Talk", talk, 'params.has("freeAccessTalk")');
requireText("Talk", talk, 'params.has("freeAccessExplore")');
requireText("Talk", talk, 'setFreeAccessEntry("talk")');
requireText("Talk", talk, 'setFreeAccessEntry("explore")');
requireText("Talk", talk, 'href="/free-access"');
requireText("Talk", talk, "← Back to HIISSA FREE");

requireText("Talk", talk, 'params.has("guestAccountTalk")');
requireText("Talk", talk, 'params.has("guestAccountExplore")');
requireText("Talk", talk, 'setGuestAccountEntry("talk")');
requireText("Talk", talk, 'setGuestAccountEntry("explore")');
requireText("Talk", talk, 'href="/free/welcome"');
requireText("Talk", talk, "← Back to HIISSA Guest");

// Protected existing contexts remain available.
requireText("Talk regression", talk, "← Back to HIISSA+");
requireText("Talk regression", talk, "← Back to HIISSA TOGETHER");
requireText("Talk regression", talk, "← Back to My HIISSA");

// Legacy technical no-account route remains available for compatibility.
// It is not the Main user-facing entry after this Founder-approved correction.
requireText("Legacy compatibility", talk, 'params.has("guest")');
requireText("Legacy compatibility", talk, 'if (guestEntry && !authSession && !showAuthPanel)');

if (errors.length > 0) {
  console.error("\nHIISSA FREE Access / Guest navigation contract: FAIL\n");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("HIISSA FREE Access / Guest navigation contract: PASS");
console.log("- Main first card is FREE Access with no account required");
console.log("- FREE Access has its own hub before Talk/Explore");
console.log("- Main second card is HIISSA Guest and reuses the protected account flow");
console.log("- FREE Access and HIISSA Guest each preserve their own return navigation");
console.log("- PLUS, TOGETHER, My HIISSA and legacy compatibility markers remain present");
