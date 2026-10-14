import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {ORIGINAL_SUPPORT_RETURN_KEY,markOriginalSupportReturn,consumeOriginalSupportReturn} from "../lib/hiissa-original-support-return.mjs";
const base=1792000000000;
function store(){const data=new Map();return{data,setItem(k,v){data.set(k,v)},getItem(k){return data.has(k)?data.get(k):null},removeItem(k){data.delete(k)}}}
let x=store();
assert.equal(markOriginalSupportReturn(x,base),true);
assert.equal(consumeOriginalSupportReturn(x,base+1000),"/my-hiissa/support");
assert.equal(consumeOriginalSupportReturn(x,base+2000),null,"one time");
x=store();markOriginalSupportReturn(x,base);assert.equal(consumeOriginalSupportReturn(x,base+16*60000),null,"expired");
x=store();markOriginalSupportReturn(x,base);assert.equal(consumeOriginalSupportReturn(x,base-1),null,"future timestamp");
x=store();x.setItem(ORIGINAL_SUPPORT_RETURN_KEY,"https://evil.example");assert.equal(consumeOriginalSupportReturn(x,base),null,"external URL");
x=store();x.setItem(ORIGINAL_SUPPORT_RETURN_KEY,"javascript:alert(1)");assert.equal(consumeOriginalSupportReturn(x,base),null,"injection");
assert.equal(consumeOriginalSupportReturn(store(),base),null,"ordinary sign-in");
const disabled={getItem(){throw Error("blocked")},setItem(){throw Error("blocked")},removeItem(){throw Error("blocked")}};
assert.equal(markOriginalSupportReturn(disabled,base),false);
assert.equal(consumeOriginalSupportReturn(disabled,base),null);
const page=readFileSync("app/my-hiissa/page.js","utf8");
const support=readFileSync("app/my-hiissa/support/page.js","utf8");
const auth=readFileSync("app/auth/continue/page.js","utf8");
const talk=readFileSync("app/talk/page.js","utf8");
const account=readFileSync("app/my-hiissa/account/page.js","utf8");
for(const [source,needle] of [
 [page,"consumeOriginalSupportReturn(window.localStorage)"],
 [page,'authState !== "ready" || !session?.access_token'],
 [support,"markOriginalSupportReturn(window.localStorage)"],
 [support,'href="/talk?signin=1&from=home"'],
 [auth,': "/my-hiissa",'],
 [auth,'"/free/welcome"'],
 [talk,"shouldCreateUser: false"],
 [account,'scope: "local"'],
 [support,'fetch("/api/support/requests/replies"'],
 [support,'fetch("/api/support/requests/followups"'],
])assert.ok(source.includes(needle),"Protected old/new integration missing: "+needle);
console.log("PASS: original Support task return one-use, 15-min expiry, browser-storage failure, no open redirect, existing auth and dependent old/new source guards");
console.log("NOT VERIFIED: full same-browser Magic Link, actual customer receipt and Founder practical acceptance");
