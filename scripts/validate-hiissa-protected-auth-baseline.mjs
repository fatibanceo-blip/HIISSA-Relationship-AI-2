// HIISSA R172 — mandatory source-integrity gate for previously protected identity routes.
// The Founder's rule: no unrelated work may silently modify protected authentication paths.
// This verifies SOURCE BASELINE only; it NEVER certifies full live Magic Link or cross-browser E2E.
// A future Founder-approved auth repair requires its own documented new baseline and journey tests.
import assert from "node:assert/strict";
import {createHash} from "node:crypto";
import {readFileSync} from "node:fs";

const locked = Object.freeze({
  "app/auth/continue/page.js": "9ab0549c27e82cb73104411619340fd8797e598c",
  "app/auth/confirm/route.js": "367eeebecd07f1bdccce212fa4cadc6566224a83",
  "app/free/auth/continue/page.js": "8dab7441fc2c6d2711405a3767e2976decb0c9b6",
  "app/admin/login/page.js": "e7ee78e907c50216bb8be66b2b339e76073a4779",
  "middleware.js": "e3cbc98d10c544769d7858a349ec31d8d3726d28"
});

const failed = [];
const source = {};
for (const [path,expected] of Object.entries(locked)){
  try{
    const bytes = readFileSync(path);
    const object = createHash("sha1")
      .update(Buffer.from("blob "+bytes.length+"\0"))
      .update(bytes).digest("hex");
    if(object!==expected) failed.push(
      "Protected authentication file changed: "+path+
      ". Founder-specific authorisation, dependent journey tests, and documented baseline review are required. "+
      "Expected Git blob "+expected+"; actual "+object
    );
    source[path] = bytes.toString("utf8");
  }catch{
    failed.push("Protected authentication file missing or unreadable: "+path);
  }
}
const talk = readFileSync("app/talk/page.js","utf8");
const account = readFileSync("app/my-hiissa/account/page.js","utf8");
const home = readFileSync("app/my-hiissa/page.js","utf8");
const support = readFileSync("app/my-hiissa/support/page.js","utf8");
for(const [label,src,required] of [
  ["Canonical general Magic Link",talk,
   "window.location.origin}/auth/continue?flow="],
  ["Canonical Magic Link does not create a new user",talk,"shouldCreateUser: false"],
  ["Passwordless email link",talk,"supabase.auth.signInWithOtp"],
  ["Original Account cookie-aware client",account,"createBrowserClient"],
  ["Original My HIISSA cookie-aware client",home,"createBrowserClient"],
  ["Existing Support cookie-aware client",support,"createBrowserClient"],
  ["Support never submits an email link",support,"Your saved support requests"],
  ["Auth Continue token hash handling",source["app/auth/continue/page.js"]||"","token_hash"],
  ["Auth Confirm verification",source["app/auth/confirm/route.js"]||"","await supabase.auth.verifyOtp"],
  ["Auth Confirm sends successful browser to authenticated destination",
   source["app/auth/confirm/route.js"]||"","NextResponse.redirect(destination)"],
  ["Server cookie preservation",source["app/auth/confirm/route.js"]||"","response.cookies.set"],
  ["Middleware refreshes user session",source["middleware.js"]||"","await supabase.auth.getUser()"]
]){
  if(!src.includes(required))failed.push(label+": missing "+required);
}
if(failed.length){
  console.error("FAIL: HIISSA protected authentication baseline / dependency safeguards");
  for(const f of failed)console.error("- "+f);
  process.exit(1);
}
assert.equal(Object.keys(locked).length,5);
console.log("PASS: HIISSA protected auth source baseline (five historically governed files) and sign-in dependency contracts remain unchanged.");
console.log("NOT VERIFIED: real email delivery, one-time Magic Link browser completion, return to originating feature/browser, Founder admin session continuity, and negative/expired-link E2E.");
console.log("PRODUCTION GATE: no promotion/activation without separately evidenced actual protected golden-journey PASS and Founder release approval.");
