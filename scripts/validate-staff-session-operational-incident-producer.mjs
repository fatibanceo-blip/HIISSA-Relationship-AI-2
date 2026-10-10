import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {
  checkStaffSessionOperationalSources,
  monitorStaffSessionOperationalSources
} from "../lib/admin/staff-session-operational-incident-producer-staging.js";

// Source-contract gate protects the existing Founder screen/GET/ten examples.
const route=readFileSync("app/api/admin/control-room/operational-incidents/check-staff-session-source/route.js","utf8");
const existing=readFileSync("app/api/admin/control-room/staff-session-device-control/route.js","utf8");
const sample=readFileSync("lib/hiissa-prototype-staff-directory.js","utf8");
const host=readFileSync("app/admin/control-room-preview/page.js","utf8");
assert.ok(existing.includes("export async function GET"),"Protected existing source GET must remain");
assert.ok(existing.includes("founder_staff_session_inventory") && existing.includes("founder_staff_access_inventory"),"Reuse existing real RPCs");
assert.ok(sample.includes("demo-sarah") && sample.includes("demo-john"),"Preserve fictional samples");
assert.ok(host.includes("FounderStaffSessionDeviceControl"),"Founder host connection retained");
for(const gate of [
  "export async function POST","FOUNDER_GATE_REQUIRED","UNAUTHENTICATED",
  "REQUEST_BODY_NOT_ALLOWED","target===\"staging\"",
  'hostname==="upcssfmilewwshyxyvdf.supabase.co"',
  "admin_users","staff-session-operational-incident-producer-staging.js"
])assert.ok(route.includes(gate),"Monitor route missing safety gate: "+gate);
assert.ok(!route.includes("export async function GET"),"Do not introduce GET side effects");
assert.ok(!route.includes("VERCEL_CRON") && !route.includes("CRON_SECRET"),"No automatic schedule");
assert.ok(!route.includes("targetUserId")&&!route.includes("targetSessionId"),"Monitor must not change staff access");

const expectedRPCs=["founder_staff_session_inventory","founder_staff_access_inventory"];
function mock({failure,malformed,throws,nonempty=false,duplicate=false,writeError=false}={}){
  const records={reads:[],writes:[]};
  const db={
    async rpc(name){
      assert.ok(expectedRPCs.includes(name),"Only already-approved real staff RPCs");
      records.reads.push(name);
      if(throws===name)throw new Error("TEST_ONLY: mocked read failed");
      if(failure===name)return {data:null,error:{code:"MOCK_FAILED"}};
      if(malformed===name)return {data:null,error:null};
      return {data:nonempty?[{TEST_FIXTURE_ONLY:true}]:[],error:null};
    },
    from(table){
      assert.equal(table,"hiissa_operational_incidents","Canonical incident table only");
      return {insert(row){
        records.writes.push(row);
        return {select(columns){
          assert.equal(columns,"incident_id,state,version");
          return {async single(){
            if(duplicate)return {data:null,error:{code:"23505"}};
            if(writeError)return {data:null,error:{code:"MOCK_INSERT_FAILED"}};
            return {data:{incident_id:"test-only-id",state:"needs_attention",version:1},error:null};
          }};
        }};
      }};
    }
  };
  return {db,records};
}
{
  const {db,records}=mock();
  const r=await monitorStaffSessionOperationalSources(db);
  assert.equal(r.ok,true);assert.equal(r.sourceState,"READABLE_EMPTY");
  assert.equal(r.counts.staffSessions,0);assert.equal(r.counts.staffAccess,0);
  assert.deepEqual(records.reads.sort(),[...expectedRPCs].sort());
  assert.equal(records.writes.length,0);assert.equal(r.incidentAction,"NONE");
}
{
  const {db,records}=mock({nonempty:true});
  const r=await monitorStaffSessionOperationalSources(db);
  assert.equal(r.sourceState,"READABLE_RECORDS_PRESENT");
  assert.equal(r.counts.staffSessions,1);
  assert.equal(records.writes.length,0);
}
for(const scenario of [
  {failure:"founder_staff_session_inventory"},
  {malformed:"founder_staff_access_inventory"},
  {throws:"founder_staff_session_inventory"}
]){
  const {db,records}=mock(scenario);
  const r=await monitorStaffSessionOperationalSources(db);
  assert.equal(r.ok,false);assert.equal(r.sourceState,"SOURCE_READ_FAILED");
  assert.equal(r.status,"SOURCE_FAILURE_INCIDENT_RECORDED");
  assert.equal(r.incidentPersistence,"INSERT_ACCEPTED");
  assert.equal(records.writes.length,1);
  const row=records.writes[0];
  assert.equal(row.environment,"staging");
  assert.equal(row.incident_key,"hiissa.admin.staff-session-source.unreadable");
  assert.equal(row.feature_id,"staff-session-device-control");
  assert.equal(row.owner_module_id,"admin-security-audit");
  assert.equal(row.oversight_level,2);
  assert.equal(row.recovery_classification,"HUMAN_REQUIRED");
  assert.equal(row.max_safe_retries,0);
  assert.ok(!JSON.stringify(row).includes("TEST_FIXTURE_ONLY"),"Never save mock staff rows");
}
{
  const {db,records}=mock({failure:expectedRPCs[0],duplicate:true});
  const r=await monitorStaffSessionOperationalSources(db);
  assert.equal(r.status,"SOURCE_FAILURE_ALREADY_RECORDED");
  assert.equal(r.incidentPersistence,"DUPLICATE_SUPPRESSED");
  assert.equal(records.writes.length,1);
}
{
  const {db}=mock({failure:expectedRPCs[0],writeError:true});
  const r=await monitorStaffSessionOperationalSources(db);
  assert.equal(r.status,"INCIDENT_PERSISTENCE_FAILED");
  assert.equal(r.incidentPersistence,"NOT_VERIFIED");
}
{
  const r=await checkStaffSessionOperationalSources(null);
  assert.equal(r.sourceState,"NOT_CHECKED");
  const m=await monitorStaffSessionOperationalSources(null);
  assert.equal(m.incidentPersistence,"NOT_ATTEMPTED");
}
const pkg=JSON.parse(readFileSync("package.json","utf8"));
for(const field of ["prebuild","verify:foundation"]){
  assert.ok(pkg.scripts[field].includes("npm run test:staff-session-incident-producer"),"New monitor must block build if test fails");
  assert.ok(pkg.scripts[field].includes("npm run test:staff-session-source-truth"),"Keep previously protected staff regression");
  assert.ok(pkg.scripts[field].includes("npm run test:operational-incidents"),"Keep existing canonical incident gates");
}
console.log("PASS: isolated Staging Staff Session source-to-canonical L2 incident producer tests.");
console.log("PASS: healthy/empty/nonempty, real-source-error classification, mock failure, duplicate and incident-write-failure guards.");
console.log("NOT VERIFIED: real authenticated POST, actual 401/403, Founder UI, real source outage or alert delivery.");
