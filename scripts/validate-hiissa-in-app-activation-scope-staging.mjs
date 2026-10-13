// HIISSA R214 — executable negative/positive tests for exact original custom
// STAGING activation. No actual sending, database change or live API call.
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {
 isInAppSupportStagingActivationConfigured,
 isSingleInAppSupportTestCaseActive
} from "../lib/admin/staging-in-app-support-reply-activation.mjs";
const caseId="f8362377-35b5-4db9-ac4a-eef7717120c1";
const state={
 VERCEL_ENV:"preview",VERCEL_TARGET_ENV:"staging",
 HIISSA_STAGING_IN_APP_SUPPORT_REPLY_DELIVERY_ENABLED:"true",
 HIISSA_STAGING_IN_APP_SUPPORT_REPLY_TEST_CASE_ID:caseId
};
const enable=(patch)=>({...state,...patch});
assert.equal(isInAppSupportStagingActivationConfigured(state),true);
assert.equal(isSingleInAppSupportTestCaseActive(state,caseId),true);
for(const [label,env] of [
 ["no activation",enable({HIISSA_STAGING_IN_APP_SUPPORT_REPLY_DELIVERY_ENABLED:undefined})],
 ["disabled",enable({HIISSA_STAGING_IN_APP_SUPPORT_REPLY_DELIVERY_ENABLED:"false"})],
 ["test-case missing",enable({HIISSA_STAGING_IN_APP_SUPPORT_REPLY_TEST_CASE_ID:undefined})],
 ["allowlist invalid",enable({HIISSA_STAGING_IN_APP_SUPPORT_REPLY_TEST_CASE_ID:"all"})],
 ["prod target",enable({VERCEL_TARGET_ENV:"production",VERCEL_ENV:"production"})],
 ["prod runtime",enable({VERCEL_TARGET_ENV:"staging",VERCEL_ENV:"production"})],
 ["ordinary preview",enable({VERCEL_TARGET_ENV:"preview",VERCEL_ENV:"preview"})],
 ["wrong custom environment",enable({VERCEL_TARGET_ENV:"qa"})],
 ["local dev",enable({VERCEL_ENV:"development",VERCEL_TARGET_ENV:"staging"})],
 ["no Vercel target",enable({VERCEL_TARGET_ENV:undefined})],
 ["no Vercel environment",enable({VERCEL_ENV:undefined})],
 ["other case allowlisted",enable({HIISSA_STAGING_IN_APP_SUPPORT_REPLY_TEST_CASE_ID:"b10d93af-0db2-45a7-9a0a-54b2b8f10000"})]
]){
 assert.equal(isInAppSupportStagingActivationConfigured(env),false,label);
 assert.equal(isSingleInAppSupportTestCaseActive(env,caseId),false,label);
}
for(const wrong of [
 "", "undefined","f8362377-35b5-4db9-ac4a-eef7717120c0",
 "B10D93AF-0DB2-45A7-9A0A-54B2B8F10000","other-test"
]){
 assert.equal(isSingleInAppSupportTestCaseActive(state,wrong),false,"wrong case "+wrong);
}
const source=readFileSync("app/api/admin/control-room/customer-communications/reply-draft/deliver/route.js","utf8");
for(const clause of [
 "isInAppSupportStagingActivationConfigured(process.env)",
 "isSingleInAppSupportTestCaseActive(process.env,requestId)",
 "isSingleInAppSupportTestCaseActive(process.env,body?.requestId)",
 "if(!stagingDeliveryEnabled())return noStore",
 "verifyOperationalCentreFounder(request)",
 "new URL(origin).origin!==new URL(request.url).origin",
 "hiissa_customer_support_staging_deliver_approved_in_app_reply",
 "emailSent:false,smsSent:false",
 "productionEffectEnabled:false"
]) assert.ok(source.includes(clause),"Original gated Founder route must preserve "+clause);
assert.ok(!source.includes('process.env.VERCEL_ENV==="staging"'),"Incorrect Vercel custom environment code may not reappear");
console.log("PASS R214: exact Founder test case only; staging custom VERCEL_TARGET_ENV + preview VERCEL_ENV; other targets, prod, unconfigured or other cases FAIL CLOSED.");
console.log("NOT VERIFIED: runtime Founder-authenticated readiness/send, actual delivered reply and owner-only customer practical test.");
