// Founder R147: Keep HIISSA entirely uppercase in every title generated from audit IDs.
// This protects UI labels, while preserving original database event keys and timeline behaviour.
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import vm from "node:vm";

const source=readFileSync("app/api/admin/control-room/activity-timeline/route.js","utf8");
const dashboard=readFileSync("app/admin/control-room-preview/page.js","utf8");

const formatter=source.match(/function humanise\(value\) \{[\s\S]*?\n\}/);
assert.ok(formatter, "Existing canonical Activity Timeline humanise formatter must remain.");
const humanise=vm.runInNewContext("("+formatter[0]+")");

const activity=source.match(/function eventTitle\(event\) \{[\s\S]*?\n\}/);
assert.ok(activity, "Existing original audit event title translator must remain.");
const eventTitle=vm.runInNewContext("("+activity[0]+")",{humanise});

assert.equal(humanise("hiissa_customer_communication_staging"),"HIISSA Customer Communication Staging");
assert.equal(humanise("hiissa_people_experience"),"HIISSA People Experience");
assert.equal(humanise("Hiissa-customer-update"),"HIISSA Customer Update");
assert.equal(humanise("HIISSA_service"),"HIISSA Service");
assert.equal(humanise("staff_work_started"),"Staff Work Started","Unrelated audit titles must not change");
assert.equal(eventTitle({event_type:"hiissa_customer_communication_staging"}),"HIISSA Customer Communication Staging");
assert.equal(eventTitle({event_type:"founder_control_room_visit"}),"Founder entered the Control Room");
assert.ok(dashboard.includes('latestEvent?.title || "No verified recent activity"'),"Founder brief must still display the original audited title, with no conflicting UI reformatting.");
assert.ok(source.includes('return humanise(event.event_type || event.action_id || "HIISSA activity")'),"Do not rewrite canonical original event codes.");
console.log("PASS: displayed HIISSA brand is all caps in the original Founder Activity Timeline and Latest Verified Activity.");
console.log("PASS: historical audit identifiers untouched and unrelated Founder activity titles preserved.");
console.log("NOT VERIFIED: fresh Founder mobile visual acceptance; requires the updated READY Staging deployment.");
