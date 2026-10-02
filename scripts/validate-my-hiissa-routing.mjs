import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const files = {
  home: path.join(root, "app", "my-hiissa", "page.js"),
  account: path.join(root, "app", "my-hiissa", "account", "page.js"),
  conversations: path.join(root, "app", "my-hiissa", "conversations", "page.js"),
  talk: path.join(root, "app", "talk", "page.js"),
  authContinue: path.join(root, "app", "auth", "continue", "page.js"),
};

const errors = [];

function requireFile(key) {
  if (!fs.existsSync(files[key])) {
    errors.push(`Missing required My HIISSA file: ${files[key]}`);
    return "";
  }
  return fs.readFileSync(files[key], "utf8");
}

const home = requireFile("home");
const account = requireFile("account");
const conversations = requireFile("conversations");
const talk = requireFile("talk");
const authContinue = requireFile("authContinue");

function requireText(label, source, text) {
  if (!source.includes(text)) {
    errors.push(`${label}: missing required contract text/route: ${text}`);
  }
}

function forbidText(label, source, text) {
  if (source.includes(text)) {
    errors.push(`${label}: forbidden legacy connection still present: ${text}`);
  }
}

forbidText("My HIISSA home", home, 'href="/talk?freeAccount=1"');
forbidText("My HIISSA home", home, '<Link href="/talk"');
requireText("My HIISSA home", home, 'href="/my-hiissa/account"');
requireText("My HIISSA home", home, 'href="/my-hiissa/conversations"');
requireText("My HIISSA home", home, 'href="/talk?myHiissaTalk=1#hiissa-conversation"');
requireText("My HIISSA home", home, 'href="/talk?myHiissaExplore=1"');
requireText("My HIISSA home", home, "myHiissaConversation=");
requireText("My HIISSA home", home, "Not connected yet");

requireText("My Account", account, "session?.user?.email");
requireText("My Account", account, 'scope: "local"');
forbidText("My Account", account, 'type="email"');
forbidText("My Account", account, "Email me a secure sign-in link");

requireText("My Conversations", conversations, 'fetch("/api/conversations"');
requireText("My Conversations", conversations, "myHiissaConversation=");
requireText("My Conversations", conversations, "Nothing to continue yet.");
forbidText("My Conversations", conversations, '<Link href="/talk"');

requireText("Talk", talk, 'params.has("myHiissaTalk")');
requireText("Talk", talk, 'params.has("myHiissaExplore")');
requireText("Talk", talk, 'params.has("myHiissaConversation")');
forbidText("Talk", talk, "Continue my conversations");
forbidText("Talk", talk, "Your HIISSA space is ready whenever you are.");
requireText("Talk", talk, "← Back to My HIISSA");
requireText("Talk", talk, 'params.has("signin")');
requireText("Talk", talk, 'from === "plus"');
requireText("Talk", talk, 'from === "together"');
requireText("Talk", talk, 'window.location.replace(\n    "/my-hiissa"');
requireText("Talk", talk, "/api/messages?conversationId=");
requireText("Talk", talk, "/api/conversations");

requireText("Auth Continue", authContinue, '          : "/my-hiissa",');
requireText("Auth Continue", authContinue, '        ? "/free/welcome"');
requireText("Auth Continue", authContinue, '          ? "/"');
requireText("Auth Continue", authContinue, "window.location.replace(");
requireText("Auth Continue", authContinue, "window.location.assign(");
forbidText("Auth Continue", authContinue, '          : "/talk",');

if (errors.length > 0) {
  console.error("\nHIISSA My HIISSA routing contract: FAIL\n");
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log("HIISSA My HIISSA routing contract: PASS");
console.log("- Dedicated Account route present");
console.log("- Dedicated Conversations route present");
console.log("- Neutral My HIISSA Talk/Explore entries present");
console.log("- Legacy Account/Conversation shortcuts blocked from My HIISSA home");
console.log("- Exact conversation handoff route present");
console.log("- Normal Sign in routes to My HIISSA");
console.log("- FREE and Guest Save & Sync destinations remain declared");
console.log("- One-time normal Continue page uses history replacement");
console.log("- Obsolete authenticated Talk-home block is absent");
console.log("- Stale authenticated general Sign-in history redirects to My HIISSA");
