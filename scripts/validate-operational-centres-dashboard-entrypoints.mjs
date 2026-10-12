// R143: Existing Founder Control Room operational-centre entrypoint contract.
// Source-level automation supplements, never substitutes, actual Founder testing.
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=(p)=>readFileSync(p,"utf8");
const host=read("app/admin/control-room-preview/page.js");
const centre=read("app/admin/control-room-preview/FounderOperationalCentresDashboard.js");
const customer=read("app/api/admin/control-room/customer-communications/route.js");
const staff=read("app/api/admin/control-room/staff-trust-review/route.js");
const registry=read("lib/experience-registry.js");
const required=[
 ['import FounderOperationalCentresDashboard from "./FounderOperationalCentresDashboard.js";',host],
 ['<FounderOperationalCentresDashboard authenticated={authenticated} kind="customer" />',host],
 ['<FounderOperationalCentresDashboard authenticated={authenticated} kind="staff" />',host],
 ['kind="customer"',host],
 ['kind="staff"',host],
 ["getSession()",centre],
 ["cache:\"no-store\"",centre],
 ["canonicalIncidentFeedVerified",centre],
 ["productionEffectEnabled",centre],
 ["SOURCE UNAVAILABLE",centre],
 ["Real incoming customer messages: NOT CONNECTED",centre],
 ["Automatic acknowledgement: NOT ACTIVE",centre],
 ["My Training: NOT COMPLETED",centre],
 ["/admin/control-room/customer-communications",centre],
 ["staff-trust-training-access-review",centre],
 ["Open {centre.label}",centre],
 ["hiissa_operational_incidents",customer],
 ["hiissa_operational_incidents",staff],
 ["operationalCentreStagingAllowed()",customer],
 ["operationalCentreStagingAllowed()",staff],
 ["verifyOperationalCentreFounder(request)",customer],
 ["verifyOperationalCentreFounder(request)",staff],
 ['id: "customer-communication-service-level-centre"',registry],
 ['id: "staff-trust-training-access-review"',registry]
];
for(const [token,source] of required)assert.ok(source.includes(token),"Source-level dashboard control lost: "+token);
for(const token of ['method:"POST"',"setInterval(","localStorage",".insert(",".update("])
 assert.ok(!centre.includes(token),"Founder dashboard status card must stay read-only: "+token);
assert.ok(host.includes("function FounderDailyBrief")&&host.includes("function FounderAlerts"),"Original Founder monitoring must remain");
console.log("PASS: two additive module-specific Founder Control Room entrypoints, original source verification and no external changes.");
console.log("NOT VERIFIED: Founder browser journey, practical source refresh, genuine customer messages, real staff Training Library, Production.");
