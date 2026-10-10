// HIISSA Staging-only regression contract for the existing Founder Staff Session & Device Control.
// This is a static source-contract test. It does NOT simulate Founder authentication,
// perform real staff actions, claim successful HTTP/DB results, or certify browser UX.
import fs from "node:fs";
import path from "node:path";

const file=path.join(process.cwd(),"app","admin","control-room-preview","FounderStaffSessionDeviceControl.js");
const errors=[];
if(!fs.existsSync(file)) throw new Error("Staff Session & Device Control component missing");
const source=fs.readFileSync(file,"utf8");

const guards=[
  ["Initial roster is unverified",'verified:false'],
  ["Only a successful monitoring response validates the roster",'data?.status!=="MONITORING"'],
  ["Success explicitly sets roster as verified",'verified:true'],
  ["Active-staff metric distinguishes unreadable source",'state.verified?String(state.staff.length):"Unverified"'],
  ["Empty state requires independently verified source",'!state.loading&&state.verified&&!state.staff.length'],
  ["Failed source never pretends to be empty",'This is not a confirmed empty roster.'],
  ["Access change requires a recorded audited result",'data?.status!=="ACCESS_CHANGE_RECORDED_AND_EXECUTED"||data.auditRecorded!==true'],
  ["Session sign-out requires a recorded audited result",'data?.status!=="RECORDED_AND_EXECUTED"||data.auditRecorded!==true'],
  ["Uncertain access action warns against blind retry",'the action might have been recorded.'],
  ["Post-action reload can be unverified",'const verifiedAfterAction=await load()'],
  ["Loading uses a catch for source errors",'return unavailable("Staff session source is unavailable.']
];
for(const [name,pattern] of guards)if(!source.includes(pattern))errors.push(name);
if(source.includes("!state.loading&&!state.staff.length?"))
  errors.push("Unsafe old empty-state condition remains");
if(errors.length){
  for(const error of errors)console.error("FAIL: "+error);
  process.exitCode=1;
}else{
  console.log("PASS: 11 static Staging Founder staff source-truth/recovery guards.");
  console.log("NOT VERIFIED: real authenticated API, staff effects, Founder practical browser test.");
}
