import fs from "node:fs";
import assert from "node:assert/strict";
import {createHash} from "node:crypto";
import {HIISSA_PROTOTYPE_STAFF,HIISSA_PROTOTYPE_STAFF_DEPARTMENTS} from "../lib/hiissa-prototype-staff-directory.js";
import {filterHiissaEmployeeRegister,summarizeHiissaEmployeeDepartments} from "../lib/hiissa-employee-register-prototype-view.js";
const read=path=>fs.readFileSync(path,"utf8");
const blobSha=text=>createHash("sha1").update("blob "+Buffer.byteLength(text)).update(Buffer.from([0])).update(text).digest("hex");
const onboarding=read("app/admin/control-room-preview/page.js");
assert.equal(blobSha(onboarding),"d123b707477854d1811f6f7e2534248c5c7ba056",
  "STOP: Founder-approved onboarding host source changed; explicit Founder permission is required");
const applicant=read("lib/experience-registry.js");
assert.ok(applicant.includes('export const ADMIN_STAFF_ONBOARDING_WORKFLOW = Object.freeze({'));
assert.ok(applicant.includes('export const STAFF_SECURE_ONBOARDING_EXPERIENCE_STANDARD = Object.freeze({'));
const api=read("app/api/admin/control-room/employee-register/route.js");
assert.ok(api.includes('branch==="feature/founder-control-room-staging"'));
assert.ok(api.includes('target!=="production"'));
assert.ok(api.includes('auth.getUser(token)'));
assert.ok(api.includes('from("admin_users")'));
assert.ok(api.includes('from("hiissa_employee_register")'));
assert.ok(api.includes('from("hiissa_staff_onboarding_applications")'));
assert.ok(api.includes('from("hiissa_attendance_events")'));
assert.ok(!api.includes("export async function POST"));
assert.ok(!api.includes("export async function PATCH"));
assert.ok(!api.includes("export async function DELETE"));
const preview=read("app/admin/control-room-preview/FounderEmployeeRegisterAttendancePreview.js");
for(const label of ["Employee Register","Attendance","Department Overview","Reports","Verified Staging records","Fictional demonstration team","Prototype Employees","No verified attendance events","Not recorded","Prototype ID","NO REAL RECORDS"]){
  assert.ok(preview.includes(label),"Missing truth-safe preview text: "+label);
}
assert.ok(preview.includes('const [source,setSource]=useState("demo");'));
assert.ok(preview.includes("filterHiissaEmployeeRegister(rows,{search,department,type,status})"));
assert.ok(preview.includes("summarizeHiissaEmployeeDepartments(visible)"));
assert.ok(preview.includes('method:"GET"'));
assert.ok(preview.includes("HIISSA_PROTOTYPE_STAFF"));
assert.ok(!preview.includes('method:"POST"'));
assert.ok(!preview.includes(".insert("));
assert.ok(!preview.includes(".update("));
const schema=read("supabase/migrations/20261008161359_hiissa_founder_employee_attendance_foundation_staging.sql");
for(const name of ["hiissa_staff_onboarding_applications","hiissa_employee_register","hiissa_attendance_events"])
  assert.ok(schema.includes("create table if not exists public."+name));
assert.ok(schema.includes("from public, anon, authenticated"));
assert.ok(!schema.includes("grant select on table public.hiissa_employee_register to authenticated"));
const prototype=HIISSA_PROTOTYPE_STAFF.map(p=>({employee_id:p.id,display_name:p.name,department:p.departmentLabel,role_label:p.role,engagement_type:"Not recorded",employment_state:"Not recorded"}));
assert.equal(filterHiissaEmployeeRegister(prototype,{department:"all"}).length,10);
assert.deepEqual(filterHiissaEmployeeRegister(prototype,{search:"Sarah"}).map(p=>p.employee_id),["demo-sarah"]);
assert.deepEqual(filterHiissaEmployeeRegister(prototype,{search:"jOhN"}).map(p=>p.employee_id),["demo-john"]);
assert.equal(filterHiissaEmployeeRegister(prototype,{department:"Finance & Subscriptions",search:"Sarah"}).length,0);
assert.equal(filterHiissaEmployeeRegister(prototype,{type:"Not recorded",status:"Not recorded"}).length,10);
const bars=summarizeHiissaEmployeeDepartments(prototype);
assert.equal(bars.length,7);
assert.equal(bars.reduce((n,p)=>n+p.count,0),10);
for(const group of HIISSA_PROTOTYPE_STAFF_DEPARTMENTS){
  const matching=filterHiissaEmployeeRegister(prototype,{department:group.label});
  assert.equal(matching.length,group.people.length,"Wrong count in "+group.label);
  assert.ok(matching.every(p=>p.department===group.label));
  assert.equal(summarizeHiissaEmployeeDepartments(matching).length,1);
  assert.equal(summarizeHiissaEmployeeDepartments(matching)[0].count,matching.length);
}
assert.equal(summarizeHiissaEmployeeDepartments(filterHiissaEmployeeRegister(prototype,{search:"Sarah"}))[0].count,1);
assert.equal(filterHiissaEmployeeRegister(prototype,{search:"Unlisted Person"}).length,0);
console.log("Prototype filter gate: PASS — All departments=10, Sarah/John, seven department filters, filtered chart counts");
console.log("Employee Register Staging live-read gate: PASS — Founder-only GET, honest source separation, protected onboarding blob and RLS migration contracts");
