import test from "node:test";
import assert from "node:assert/strict";
import { evaluateAdminPermission as evaluate } from "../lib/admin/permission-evaluator.mjs";
const actor={id:"admin-1",role:"customer_support",active:true,environment:"staging"};
const request={module:2,resource:"account_status",action:"REVIEW",environment:"staging",scope:"case-123"};
const rule={role:actor.role,module:2,resource:"account_status",action:"REVIEW",environment:"staging",scope:"case-123",effect:"allow",oversight:"L1",active:true};
test("default deny: no roles or rules",()=>assert.equal(evaluate({actor,request}).allowed,false));
test("scoped rule allows only matching resource and case",()=>{
  assert.equal(evaluate({actor,request,rules:[rule]}).allowed,true);
  assert.equal(evaluate({actor,request:{...request,scope:"other-case"},rules:[rule]}).allowed,false);
  assert.equal(evaluate({actor,request:{...request,resource:"private_chat"},rules:[rule]}).allowed,false);
});
test("explicit deny overrides allow",()=>assert.equal(evaluate({actor,request,rules:[rule,{...rule,effect:"deny"}]}).reason,"EXPLICIT_DENY"));
test("Production authority never inherited from Staging",()=>assert.equal(evaluate({actor,request:{...request,environment:"production"},rules:[{...rule,environment:"production"}]}).reason,"CROSS_ENVIRONMENT"));
test("inactive actor and unknown role fail closed",()=>{
  assert.equal(evaluate({actor:{...actor,active:false},request,rules:[rule]}).allowed,false);
  assert.equal(evaluate({actor:{...actor,role:"superuser"},request,rules:[rule]}).allowed,false);
});
test("L2 permits with Founder notification and audit",()=>{
  const r=evaluate({actor,request,rules:[{...rule,oversight:"L2"}]});
  assert.equal(r.allowed,true);assert.equal(r.notifyFounder,true);assert.equal(r.auditRequired,true);
});
test("L3 blocks without precisely scoped separate Founder approval",()=>{
  const r3={...rule,oversight:"L3"};
  assert.equal(evaluate({actor,request,rules:[r3]}).reason,"FOUNDER_APPROVAL_REQUIRED");
  assert.equal(evaluate({actor,request,rules:[r3],approval:{approved:true,actorId:actor.id,environment:"staging",module:2,resource:"account_status",action:"REVIEW",scope:"other-case",founderId:"founder"}}).allowed,false);
  assert.equal(evaluate({actor,request,rules:[r3],approval:{approved:true,actorId:actor.id,environment:"staging",module:2,resource:"account_status",action:"REVIEW",scope:"case-123",founderId:"founder"}}).allowed,true);
});
test("self-grants, Break-Glass and raw private content are prohibited",()=>{
  assert.equal(evaluate({actor,request:{...request,action:"MANAGE_ADMIN_ACCESS",subjectId:actor.id},rules:[{...rule,action:"MANAGE_ADMIN_ACCESS"}]}).reason,"NO_SELF_GRANT");
  assert.equal(evaluate({actor,request:{...request,breakGlass:true},rules:[rule]}).allowed,false);
  assert.equal(evaluate({actor,request:{...request,unrestrictedPrivateContent:true},rules:[rule]}).allowed,false);
});
test("invalid oversight and missing inputs fail closed",()=>{
  assert.equal(evaluate({actor,request,rules:[{...rule,oversight:"L0"}]}).allowed,false);
  assert.equal(evaluate().allowed,false);
});
