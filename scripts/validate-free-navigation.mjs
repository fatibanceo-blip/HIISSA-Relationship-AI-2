import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const files = {
  registry: path.join(root, "lib", "experience-registry.js"),
  main: path.join(root, "app", "page.js"),
  freeWelcome: path.join(root, "app", "free", "welcome", "page.js"),
  talk: path.join(root, "app", "talk", "page.js"),
};

const errors = [];

function read(name) {
  const file = files[name];
  if (!fs.existsSync(file)) {
    errors.push(`Missing FREE navigation dependency: ${file}`);
    return "";
  }
  return fs.readFileSync(file, "utf8");
}

function requireText(label, source, text) {
  if (!source.includes(text)) {
    errors.push(`${label}: missing required contract text/route: ${text}`);
  }
}

const registry = read("registry");
const main = read("main");
const freeWelcome = read("freeWelcome");
const talk = read("talk");

// Registry-first contract for this repair.
requireText("Registry", registry, 'id: "free.talk.entry"');
requireText("Registry", registry, 'id: "free.explore.entry"');
requireText("Registry", registry, 'id: "free.navigation.home"');
requireText("Registry", registry, 'canonicalTargetId: "talk.canonical"');
requireText("Registry", registry, 'canonicalTargetId: "explore.canonical"');

// Existing Main doors remain present and unchanged in purpose.
requireText("Main", main, 'href="/talk?guest=1"');
requireText("Main", main, 'href="/free"');

// FREE welcome continues to reuse canonical Talk and Explore and now has a visible top return.
requireText("FREE welcome", freeWelcome, 'href="/talk?freeTalk=1"');
requireText("FREE welcome", freeWelcome, 'href="/talk?freeExplore=1"');
requireText("FREE welcome", freeWelcome, '← Back to HIISSA');

// Canonical Talk/Explore preserves FREE origin and returns to the same FREE home.
requireText("Talk", talk, 'setFreeEntry("talk")');
requireText("Talk", talk, 'setFreeEntry("explore")');
requireText("Talk", talk, 'href="/free/welcome"');
requireText("Talk", talk, '← Back to HIISSA FREE');
requireText("Talk", talk, 'HIISSA FREE • Explore');
requireText("Talk", talk, 'HIISSA FREE • Talk');

// Protected navigation contexts must remain present.
requireText("Talk regression", talk, '← Back to HIISSA+');
requireText("Talk regression", talk, '← Back to HIISSA TOGETHER');
requireText("Talk regression", talk, '← Back to My HIISSA');

// Guest remains separate and untouched by this repair.
requireText("Guest regression", talk, 'params.has("guest")');
requireText(
  "Guest regression",
  talk,
  'if (guestEntry && !authSession && !showAuthPanel)'
);

if (errors.length > 0) {
  console.error("\nHIISSA FREE navigation contract: FAIL\n");
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log("HIISSA FREE navigation contract: PASS");
console.log("- FREE Talk reuses canonical Talk and keeps a return-to-FREE context");
console.log("- FREE Explore reuses canonical Explore and keeps a return-to-FREE context");
console.log("- Authenticated FREE welcome has a visible top return to canonical Main");
console.log("- Guest, PLUS, TOGETHER and My HIISSA navigation markers remain present");
console.log("- Registry identities for FREE navigation are present");
