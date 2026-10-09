import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {checkEmployeeOperationalSources,monitorEmployeeOperationalSources} from "../lib/admin/employee-operational-incident-producer-staging.js";

const sourcePath="app/api/admin/control-room/employee-register-health/route.js";
const routePath="app/api/admin/control-room/operational-incidents/check-employee-source/route.js";
const protectedSource=readFileSync(sourcePath,"utf8");
const monitorRoute=readFileSync(routePath,"utf8");
assert.ok(protectedSource.includes("export async function GET"),"Original health GET must remain present");
assert.ok(protectedSource.includes('incidentEventPersistence: "NOT_WIRED"'),"Do not falsely present original read-only endpoint as writable");
assert.ok(monitorRoute.includes("export async function POST"),"Separate Founder POST must exist");
assert.ok(!monitorRoute.includes("export async function GET"),"Never make incident writes happen in GET");
assert.ok(monitorRoute.includes("FOUNDER_GATE_REQUIRED") && monitorRoute.includes("UNAUTHENTICATED"));
assert.ok(monitorRoute.includes('return new NextResponse(null,{status:404})'),"Fail-closed non-Staging gate");
assert.ok(monitorRoute.includes("REQUEST_BODY_NOT_ALLOWED"),"Ignore user-provided fault data");
assert.ok(monitorRoute.includes('hostname==="upcssfmilewwshyxyvdf.supabase.co"'),"Exact staging DB boundary");
assert.ok(!monitorRoute.includes("VERCEL_CRON") && !monitorRoute.includes("CRON_SECRET"),"No unapproved autonomous schedule");
const pkg=JSON.parse(readFileSync("package.json","utf8"));
assert.ok(pkg.scripts.prebuild.includes("npm run test:employee-incident-producer"),"Prebuild mandatory gate");
assert.ok(pkg.scripts["verify:foundation"].includes("npm run test:employee-incident-producer"),"Foundation mandatory gate");

function fake({errorTable,invalidCountTable,throwTable,duplicate=false,writeError=false,nonzero=false}={}){
  const state={writes:[],reads:[]};
  const db={
    from(table){
      if(table==="hiissa_operational_incidents")return {
        insert(row){state.writes.push(row);return {
          select(){return {async single(){
            if(duplicate)return {data:null,error:{code:"23505"}};
            if(writeError)return {data:null,error:{code:"XX000"}};
            return {data:{incident_id:"mock-id",state:"needs_attention",version:1},error:null};
          }}}
        }}
      };
      return {
        select(_column,opt){
          assert.equal(opt.head,true);assert.equal(opt.count,"exact");
          return {eq(field,value){
            assert.equal(field,"environment");assert.equal(value,"staging");
            state.reads.push(table);
            const result=()=>{if(throwTable===table)throw new Error("synthetic test query rejected");
              if(errorTable===table)return {count:null,error:{code:"MOCK_UNREADABLE"}};
              if(invalidCountTable===table)return {count:null,error:null};
              return {count:nonzero?1:0,error:null};};
            const query={then(resolve,reject){return Promise.resolve().then(result).then(resolve,reject)},
              in(field,values){assert.equal(field,"submission_state");
                assert.deepEqual(values,["submitted","under_review"]);return Promise.resolve().then(result)}};
            return query;
          }};
        }
      };
    }
  };
  return {db,state};
}
{
  const {db,state}=fake();
  const r=await monitorEmployeeOperationalSources(db);
  assert.equal(r.ok,true);assert.equal(r.sourceState,"READABLE_EMPTY");
  assert.equal(r.incidentAction,"NONE");assert.equal(state.writes.length,0);
  assert.equal(state.reads.length,4);
}
{
  const {db,state}=fake({nonzero:true});
  const r=await monitorEmployeeOperationalSources(db);
  assert.equal(r.sourceState,"READABLE_RECORDS_PRESENT");assert.equal(state.writes.length,0);
}
for(const options of [
  {errorTable:"hiissa_employee_register"},
  {invalidCountTable:"hiissa_attendance_events"},
  {throwTable:"hiissa_staff_onboarding_applications"}
]) {
  const {db,state}=fake(options);
  const r=await monitorEmployeeOperationalSources(db);
  assert.equal(r.ok,false);assert.equal(r.sourceState,"SOURCE_READ_FAILED");
  assert.equal(r.status,"SOURCE_FAILURE_INCIDENT_RECORDED");
  assert.equal(r.incidentPersistence,"INSERT_ACCEPTED");
  assert.equal(state.writes.length,1);
  assert.equal(state.writes[0].oversight_level,2);
  assert.equal(state.writes[0].recovery_classification,"HUMAN_REQUIRED");
  assert.equal(state.writes[0].max_safe_retries,0);
  assert.equal(state.writes[0].environment,"staging");
  assert.ok(!JSON.stringify(state.writes[0]).includes("@"));
}
{
  const {db}=fake({errorTable:"hiissa_employee_register",duplicate:true});
  const r=await monitorEmployeeOperationalSources(db);
  assert.equal(r.status,"SOURCE_FAILURE_ALREADY_RECORDED");
  assert.equal(r.incidentPersistence,"DUPLICATE_SUPPRESSED");
}
{
  const {db}=fake({errorTable:"hiissa_employee_register",writeError:true});
  const r=await monitorEmployeeOperationalSources(db);
  assert.equal(r.status,"INCIDENT_PERSISTENCE_FAILED");
  assert.equal(r.incidentPersistence,"NOT_VERIFIED");
}
{
  const r=await checkEmployeeOperationalSources(null);
  assert.equal(r.status,"MONITOR_CLIENT_UNAVAILABLE");
}
console.log("Employee source-to-canonical-incident isolated staging producer: PASS");
console.log("Actual real-source failure, authenticated live route, Vercel scheduled monitoring and Founder practical display: NOT VERIFIED");
