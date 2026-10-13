// HIISSA R214: only ONE Founder-approved fictional case in EXISTING Vercel
// custom "staging" environment may be sent an in-app support reply.
// No timers, send side effects, customer content or Production configuration.
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export const isInAppSupportStagingActivationConfigured=(env)=>{
  const allow=env?.HIISSA_STAGING_IN_APP_SUPPORT_REPLY_TEST_CASE_ID||"";
  return env?.VERCEL_TARGET_ENV==="staging"&&
    env?.VERCEL_ENV==="preview"&&
    env?.HIISSA_STAGING_IN_APP_SUPPORT_REPLY_DELIVERY_ENABLED==="true"&&
    UUID.test(allow);
};
export const isSingleInAppSupportTestCaseActive=(env,caseId)=>
  isInAppSupportStagingActivationConfigured(env)&&
  typeof caseId==="string"&&
  caseId===env.HIISSA_STAGING_IN_APP_SUPPORT_REPLY_TEST_CASE_ID;
