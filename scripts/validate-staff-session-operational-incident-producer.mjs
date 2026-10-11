import assert from "node:assert/strict";
import vm from "node:vm";
import {readFileSync} from "node:fs";
import {
  checkStaffSessionOperationalSources,
  monitorStaffSessionOperationalSources
} from "../lib/admin/staff-session-operational-incident-producer-staging.js";
import {projectFounderCanonicalIncidentAlerts} from "../lib/admin/founder-canonical-incident-alert-projection.js";

// Source-contract gate protects the existing Founder screen/GET/ten examples.
const route=readFileSync("app/api/admin/control-room/operational-incidents/check-staff-session-source/route.js","utf8");
const existing=readFileSync("app/api/admin/control-room/staff-session-device-control/route.js","utf8");
const sample=readFileSync("lib/hiissa-prototype-staff-directory.js","utf8");
const host=readFileSync("app/admin/control-room-preview/page.js","utf8");
assert.ok(existing.includes("export async function GET"),"Protected existing source GET must remain");
assert.ok(existing.includes("founder_staff_session_inventory") && existing.includes("founder_staff_access_inventory"),"Reuse existing real RPCs");
assert.ok(sample.includes("demo-sarah") && sample.includes("demo-john"),"Preserve fictional samples");
assert.ok(host.includes("FounderStaffSessionDeviceControl"),"Founder host connection retained");

const checkUi=readFileSync("app/admin/control-room-preview/FounderOnDemandStaffSourceCheck.js","utf8");
for(const text of [
  "FOUNDER ONLY · STAGING TEST",
  "Ask HIISSA to check staff sessions",
  "Check now",
  "Check again",
  'method:"POST",credentials:"same-origin",cache:"no-store"',
  'headers:{Authorization:"Bearer "+session.access_token}',
  "aria-live=\"polite\"",
  "productionEffectEnabled===false",
  "SOURCE_FAILURE_INCIDENT_RECORDED",
  "SOURCE_FAILURE_ALREADY_RECORDED",
  "INCIDENT_PERSISTENCE_FAILED",
  "Automatic scheduling, repair and direct notifications are not yet active",
  "Number.isInteger(data?.sourceCounts?.staffSessions)",
  "if(running.current)return;"
]) assert.ok(checkUi.includes(text),"Missing on-demand safety/UX contract: "+text);
assert.ok(!checkUi.includes("body:")&&!checkUi.includes('"Content-Type"'),"On-demand POST must carry no body");
assert.ok(!checkUi.includes("targetUserId")&&!checkUi.includes("targetSessionId"),"Check must not target people/sessions");
assert.ok(host.includes('<FounderOnDemandStaffSourceCheck authenticated={authenticated} location="overview" />'),"Approved Overview doorway missing");
assert.ok(host.includes('<FounderOnDemandStaffSourceCheck authenticated={authenticated} location="staff" />'),"Approved Staff doorway missing");
assert.ok(host.includes('import FounderOnDemandStaffSourceCheck from "./FounderOnDemandStaffSourceCheck.js";'),"Shared component import missing");


// Pure display-contract tests: evaluate ONLY the isolated JSX-free result interpreter.
// All inputs are artificial fixed fixtures; never invoke the real Staging endpoint.
const pureStart=checkUi.indexOf("function interpret(response,data){");
const pureEnd=checkUi.indexOf("\nexport default function FounderOnDemandStaffSourceCheck",pureStart);
assert.ok(pureStart>0&&pureEnd>pureStart,"Expected safe isolated interpretation function");
const interpret=vm.runInNewContext(checkUi.slice(pureStart,pureEnd)+"\ninterpret;");
function expectExplanation(label,http,data,expectedTitle,expectedKind){
  const result=interpret({status:http,ok:http>=200&&http<300},data);
  assert.equal(result.title,expectedTitle,label+" must explain the real category");
  assert.equal(result.kind,expectedKind,label+" must preserve safe status");
  assert.ok(result.did&&result.next,label+" must explain what HIISSA did and next action");
  assert.ok(!JSON.stringify(result).includes("Bearer ")&&!JSON.stringify(result).includes("service_role"),
    label+" must not display credentials");
}
const healthyData={status:"MONITORING",productionEffectEnabled:false,
  sourceState:"READABLE_EMPTY",sourceFlags:{staffSessions:true,staffAccess:true},
  sourceCounts:{staffSessions:0,staffAccess:0},incidentAction:"NONE"};
expectExplanation("healthy verified empty",200,healthyData,"Monitoring — sources are readable","checked");
expectExplanation("never accept incomplete healthy",200,{...healthyData,sourceFlags:{staffSessions:false,staffAccess:true}},
  "Check answer was incomplete","unknown");
expectExplanation("missing Founder sign-in",401,{status:"UNAUTHENTICATED"},"Founder sign-in needs checking","unknown");
expectExplanation("Founder permission denied",403,{status:"FOUNDER_GATE_REQUIRED"},"Founder permission could not be confirmed","unknown");
expectExplanation("Staging environment unavailable",404,null,"Staging check is not available here","unknown");
expectExplanation("secure configuration missing",503,{status:"STAGING_ADMIN_DATA_NOT_CONFIGURED"},
  "Staging check connection needs attention","unknown");
expectExplanation("server exception",503,{status:"STAFF_SOURCE_MONITOR_UNAVAILABLE",productionEffectEnabled:false},
  "HIISSA's secure checker is unavailable","unknown");
expectExplanation("bad request",400,{status:"REQUEST_BODY_NOT_ALLOWED"},"Check request was rejected safely","unknown");
expectExplanation("unverified source error",503,{status:"INCIDENT_PERSISTENCE_FAILED",productionEffectEnabled:false},
  "Problem detected — recording not confirmed","unknown");
expectExplanation("real incident recorded",503,{status:"SOURCE_FAILURE_INCIDENT_RECORDED",productionEffectEnabled:false,
  incidentPersistence:"INSERT_ACCEPTED"},"Needs attention — source not readable","attention");
expectExplanation("duplicate incident suppressed",503,{status:"SOURCE_FAILURE_ALREADY_RECORDED",productionEffectEnabled:false,
  incidentPersistence:"DUPLICATE_SUPPRESSED"},"Needs attention — previously recorded problem","attention");
expectExplanation("unknown technical error",502,null,"Check service returned an error","unknown");
console.log("PASS: Founder plain-English failed-check reasons, healthy/incomplete/permission/staging/config/incident responses (mock only).");


for(const gate of [
  "export async function POST","FOUNDER_GATE_REQUIRED","UNAUTHENTICATED",
  "REQUEST_BODY_NOT_ALLOWED","target===\"staging\"",
  'hostname==="upcssfmilewwshyxyvdf.supabase.co"',
  "admin_users","staff-session-operational-incident-producer-staging.js"
])assert.ok(route.includes(gate),"Monitor route missing safety gate: "+gate);
assert.ok(!route.includes("export async function GET"),"Do not introduce GET side effects");
assert.ok(!route.includes("VERCEL_CRON") && !route.includes("CRON_SECRET"),"No automatic schedule");
assert.ok(!route.includes("targetUserId")&&!route.includes("targetSessionId"),"Monitor must not change staff access");


// Founder-approved Staging body guard regression: execute the real extracted
// pure route helper with actual Node WHATWG Request streams (not the live API).
// Source contains only this helper, not secrets, authentication or database writes.
const bodyFunctionStart=route.indexOf("async function hasUnexpectedRequestBody(request){");
const bodyFunctionEnd=route.indexOf("\nexport async function POST(request){",bodyFunctionStart);
assert.ok(bodyFunctionStart>0&&bodyFunctionEnd>bodyFunctionStart,"Verified bounded byte checker missing");
const bodySource=route.slice(bodyFunctionStart,bodyFunctionEnd);
const hasUnexpectedRequestBody=vm.runInNewContext(bodySource+"\nhasUnexpectedRequestBody;",{Uint8Array});
const request=(body,headers)=>new Request("https://staging.invalid/check",{
  method:"POST",headers,...(body===undefined?{}:{body,duplex:"half"})
});
const emptyByteStream=()=>new ReadableStream({start(controller){controller.enqueue(new Uint8Array(0));controller.close();}});
const emptyChunked=()=>new ReadableStream({start(controller){controller.close();}});
async function checkBody(label,source,expected){
  assert.equal(await hasUnexpectedRequestBody(source),expected,label);
}
await checkBody("no request body",request(undefined),false);
await checkBody("empty string body",request(""),false);
await checkBody("empty body with content length zero",request("",{"content-length":"0"}),false);
await checkBody("zero-byte stream",request(emptyByteStream()),false);
await checkBody("chunked zero-byte stream",request(emptyChunked(),{"transfer-encoding":"chunked"}),false);
await checkBody("nonempty JSON fault-injection body",request('{"simulate":"failure"}'),true);
await checkBody("nonempty byte stream",request(new ReadableStream({start(c){c.enqueue(new Uint8Array([1]));c.close();}})),true);
await checkBody("claimed nonzero content length",request("",{"content-length":"5"}),true);
await checkBody("malformed content length",request("",{"content-length":"garbage"}),true);
await checkBody("negative content length",request("",{"content-length":"-1"}),true);
await checkBody("stream read throws",{
  headers:new Headers(),body:{getReader(){throw new Error("TEST_ONLY stream unavailable");}}
},true);
await checkBody("bounded empty chunks",request(new ReadableStream({start(c){
  for(let i=0;i<9;i++)c.enqueue(new Uint8Array(0));
  c.close();
}})),true);
for(const guard of [
  'request.headers.get("content-length")','request.body===null',
  'request.body.getReader()','reader.read()','part.value.byteLength>0',
  'return true; // suspicious stream never completed'
]) assert.ok(bodySource.includes(guard),"Empty-request validation regression missing: "+guard);
assert.ok(route.includes('if(await hasUnexpectedRequestBody(request))return reply({status:"REQUEST_BODY_NOT_ALLOWED"},400);'));
assert.ok(!route.includes('if(request.body!==null ||'),"Do not regress to stream-presence rejection");
console.log("PASS: exact empty POST/no-body/chunked-zero accepted; nonempty/false length/malformed/failed-stream rejected (local Request fixtures).");


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

// Explicit approved Staff-to-Founder-Alerts canonical projection regression.
// All cases use in-memory fixtures and original pure projection; NEVER write to
// Staging DB or fake an outage in the real protected monitoring endpoint.
{
  const {db,records}=mock({failure:"founder_staff_session_inventory"});
  const failure=await monitorStaffSessionOperationalSources(db);
  assert.equal(failure.status,"SOURCE_FAILURE_INCIDENT_RECORDED");
  assert.equal(failure.incidentPersistence,"INSERT_ACCEPTED");
  assert.equal(records.writes.length,1);
  const saved=records.writes[0];
  assert.equal(saved.incident_key,"hiissa.admin.staff-session-source.unreadable");
  assert.equal(saved.environment,"staging");
  assert.equal(saved.oversight_level,2);
  assert.equal(saved.recovery_classification,"HUMAN_REQUIRED");
  assert.equal(saved.max_safe_retries,0);
  // Model only the existing Founder GET route's public metadata projection
  // of one already-recorded incident; this is NOT an actual live GET response.
  const founderGetFixture={
    status:"MONITORING",sourceState:"RECORDED_INCIDENTS",openIncidentCount:1,
    incidents:[{
      incidentId:"fixture-only-staff-source-incident-001",
      state:"needs_attention",severity:saved.severity,
      title:saved.title,oversightLevel:saved.oversight_level
    }]
  };
  const visible=projectFounderCanonicalIncidentAlerts(founderGetFixture);
  assert.equal(visible.verified,true,"Canonical Staging row must project into existing Founder Alerts");
  assert.equal(visible.attentionCount,1,"One real-source failure fixture must need attention");
  assert.equal(visible.criticalCount,0,"L2 source failure must not masquerade as critical/L3");
  assert.equal(visible.items[0].title,"Staff access operational source unreadable");
  assert.equal(visible.items[0].oversightLevel,2);
  assert.equal(visible.items[0].severity,"unavailable");
  assert.equal(visible.items[0].state,"needs_attention");
  const healthy=projectFounderCanonicalIncidentAlerts({
    status:"MONITORING",sourceState:"READABLE_EMPTY",openIncidentCount:0,incidents:[]
  });
  assert.equal(healthy.verified,true);assert.equal(healthy.attentionCount,0);
  const unknown=projectFounderCanonicalIncidentAlerts(null);
  assert.equal(unknown.verified,false,"Unavailable incident GET must not be treated as healthy");
  assert.equal(projectFounderCanonicalIncidentAlerts({...founderGetFixture,openIncidentCount:0}).verified,false,
    "Contradictory count must not present a false reliable alert source");
  assert.ok(host.includes('const incidentAlerts=useFounderCanonicalIncidentAlerts(authenticated,60000);'),
    "Preserve existing Founder header polling of canonical incidents");
  assert.ok(host.includes('const canonicalIncidents=useFounderCanonicalIncidentAlerts(authenticated)'),
    "Preserve existing Founder Alerts panel use of canonical incidents");
  assert.ok(host.includes("Recorded operational incidents — Staging"),
    "Preserve original Founder Alerts verified-incident presentation");
  const founderGetRoute=readFileSync("app/api/admin/control-room/operational-incidents/route.js","utf8");
  assert.ok(founderGetRoute.includes('from("hiissa_operational_incidents")'),
    "Founder GET must read same canonical table as staff source incident producer");
  assert.ok(founderGetRoute.includes('return reply({status:"FOUNDER_GATE_REQUIRED"},403)'),
    "Preserve protected Founder authorisation gate");
  assert.ok(founderGetRoute.includes('return reply({status:"UNAUTHENTICATED"},401)'),
    "Preserve authenticated access gate");
  assert.ok(founderGetRoute.includes('notificationDelivery:"NOT_YET_WIRED"') &&
    founderGetRoute.includes('automaticRecovery:"NOT_YET_WIRED"'),
    "No direct notification delivery, scheduler or automated recovery approval");
}
console.log("PASS: fixture-only Staff source failure -> canonical L2 incident -> existing Founder Alerts projection; healthy vs unavailable and immutable permissions.");
console.log("NOT VERIFIED: real Staff source outage, real incident persistence, live Founder Alerts fault-path journey, external delivery or autonomous recovery.");

const pkg=JSON.parse(readFileSync("package.json","utf8"));
for(const field of ["prebuild","verify:foundation"]){
  assert.ok(pkg.scripts[field].includes("npm run test:staff-session-incident-producer"),"New monitor must block build if test fails");
  assert.ok(pkg.scripts[field].includes("npm run test:staff-session-source-truth"),"Keep previously protected staff regression");
  assert.ok(pkg.scripts[field].includes("npm run test:operational-incidents"),"Keep existing canonical incident gates");
}
console.log("PASS: isolated Staging Staff Session source-to-canonical L2 incident producer tests.");
console.log("PASS: healthy/empty/nonempty, real-source-error classification, mock failure, duplicate and incident-write-failure guards.");
console.log("NOT VERIFIED: real authenticated POST, actual 401/403, Founder UI, real source outage or alert delivery.");
