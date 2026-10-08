import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import {HIISSA_PROTOTYPE_STAFF_DEPARTMENTS, HIISSA_PROTOTYPE_STAFF} from "../lib/hiissa-prototype-staff-directory.js";

const root=process.cwd();
const read=(p)=>fs.readFileSync(path.join(root,p),"utf8");
const required=[
 ["demo-sarah","Sarah Mensah","customer_support"],
 ["demo-mary","Mary Okafor","customer_support"],
 ["demo-john","John Adeyemi","finance_subscriptions"],
 ["demo-claire","Claire Martin","finance_subscriptions"],
 ["demo-amina","Amina Diallo","technical_operations"],
 ["demo-daniel","Daniel Kim","technical_operations"],
 ["demo-nadia","Nadia Hassan","safety_safeguarding"],
 ["demo-elena","Elena Rossi","privacy_data_protection"],
 ["demo-kwame","Kwame Boateng","content_moderation"],
 ["demo-mei","Mei Chen","product_quality"],
];
assert.equal(HIISSA_PROTOTYPE_STAFF.length,10,"Prototype roster must contain exactly ten identities");
assert.equal(new Set(HIISSA_PROTOTYPE_STAFF.map(p=>p.id)).size,10,"Each prototype ID must be unique");
assert.deepEqual(HIISSA_PROTOTYPE_STAFF.map(p=>[p.id,p.name,p.departmentId]),required,"Do not alter the Founder-approved names, IDs or departments");
assert.equal(HIISSA_PROTOTYPE_STAFF_DEPARTMENTS.length,7);
for(const person of HIISSA_PROTOTYPE_STAFF) {
 assert.ok(person.role && person.locale && person.timeZone && person.departmentLabel,"Preserve full prototype identity fields");
 assert.ok(Object.isFrozen(person),"Prototype identities must be immutable");
 assert.ok(person.name.toLowerCase().includes(person.name.split(" ")[0].toLowerCase()),"Name search must accept first name");
}
const appreciation=read("components/people-experience/PrivateAppreciation.js");
const access=read("app/admin/control-room-preview/FounderStaffAccessPractice.js");
const registry=read("lib/experience-registry.js");
assert.ok(appreciation.includes('from "../../lib/hiissa-prototype-staff-directory.js"'));
assert.ok(appreciation.includes("const ALL_DEMO_PEOPLE = HIISSA_PROTOTYPE_STAFF;"));
assert.ok(access.includes('from "../../../lib/hiissa-prototype-staff-directory.js"'));
assert.ok(access.includes("const examples=HIISSA_PROTOTYPE_STAFF.map("));
assert.ok(access.includes('search.trim().toLowerCase()'));
assert.ok(access.includes("INTERACTIVE SAMPLE · FICTIONAL STAFF ONLY"));
assert.ok(!access.includes('sample-customer-support') && !access.includes('Sample Finance Worker'));
assert.ok(registry.includes('id: "hiissa.founder.staff-prototype-directory"'));
assert.ok(registry.includes('"prototype-staff-source-divergence"'));
assert.ok(!["fetch(", "localStorage", "sessionStorage"].some((snippet)=>access.includes(snippet)), "Staff practice must remain local fictional simulation");
const employeePreview=read("app/admin/control-room-preview/FounderEmployeeRegisterAttendancePreview.js");
const founderPreviewPage=read("app/admin/control-room-preview/page.js");
assert.ok(employeePreview.includes('from "../../../lib/hiissa-prototype-staff-directory.js"'));
assert.ok(employeePreview.includes("const demo=HIISSA_PROTOTYPE_STAFF.map("));
assert.ok(employeePreview.includes("Attendance not connected"));
assert.ok(employeePreview.includes("Not recorded"));
assert.ok(employeePreview.includes("Prototype ID"));
assert.ok(employeePreview.includes("NO REAL RECORDS"));
assert.ok(founderPreviewPage.includes('<FounderEmployeeRegisterAttendancePreview />'));
assert.ok(founderPreviewPage.includes('["Employee Register & Attendance", "staff-employee-register-attendance"]'));
assert.ok(registry.includes('id: "hiissa.founder.employee-register-attendance-preview"'));
assert.ok(!["method:\"POST\"", ".insert(", ".update(", ".delete(", "localStorage", "sessionStorage"].some(snippet=>employeePreview.includes(snippet)),"Employee Register must not write staff or attendance");
console.log("Employee Register & Attendance Staging design preview gate: PASS — shared fiction-only roster; read-only UI; no actual attendance, staff account, security or persistence effects");
console.log("HIISSA Prototype Staff Directory gate: PASS — 10 stable fictional identities, shared screens, guarded Control Room contract; no real access effects");
