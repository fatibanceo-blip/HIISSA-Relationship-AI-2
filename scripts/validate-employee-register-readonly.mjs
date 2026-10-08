import fs from "node:fs";
import assert from "node:assert/strict";
import {createHash} from "node:crypto";
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
for(const label of ["Employee Register","Attendance","Department Overview","Reports","Verified Staging records","Fictional demonstration team","No verified attendance events","Not recorded","Prototype ID","NO REAL RECORDS"]){
  assert.ok(preview.includes(label),"Missing truth-safe preview text: "+label);
}
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
console.log("Employee Register Staging live-read gate: PASS — Founder-only GET, honest source separation, protected onboarding blob and RLS migration contracts");
