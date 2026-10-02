import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const registryPath = path.join(root, "lib", "experience-registry.js");
const source = fs.readFileSync(registryPath, "utf8");
const errors = [];
const warnings = [];

function fail(message) {
  errors.push(message);
}

const idMatches = [...source.matchAll(/\bid:\s*"([^"]+)"/g)];
const ids = idMatches.map((match) => match[1]);
const idSet = new Set();

for (const id of ids) {
  if (idSet.has(id)) {
    fail(`Duplicate Experience Registry id: ${id}`);
  }
  idSet.add(id);
}

const requiredFoundationIds = [
  "talk.canonical",
  "explore.canonical",
  "my-hiissa.conversations",
  "my-hiissa.account",
  "my-hiissa.home",
  "auth.signin",
];

for (const id of requiredFoundationIds) {
  if (!idSet.has(id)) {
    fail(`Required canonical Registry id is missing: ${id}`);
  }
}

const entryPattern = /^  ([A-Za-z0-9_]+): Object\.freeze\(\{/gm;
const entryMatches = [...source.matchAll(entryPattern)];

for (let index = 0; index < entryMatches.length; index += 1) {
  const match = entryMatches[index];
  const name = match[1];
  const start = match.index;
  const end =
    index + 1 < entryMatches.length
      ? entryMatches[index + 1].index
      : source.indexOf("\n});", start) > start
        ? source.indexOf("\n});", start)
        : source.length;

  const chunk = source.slice(start, end);

  if (!/certificationManaged:\s*true/.test(chunk)) {
    continue;
  }

  const id = chunk.match(/\bid:\s*"([^"]+)"/)?.[1] || name;

  if (!/\bstatus:\s*"[^"]+"/.test(chunk)) {
    fail(`${id}: certification-managed entry has no status`);
  }

  if (!/certification:\s*certificationContract\(\{/.test(chunk)) {
    fail(`${id}: certification-managed entry has no certification contract`);
  }

  if (!/controlRoom:\s*controlRoomContract\(\{/.test(chunk)) {
    fail(`${id}: certification-managed entry has no Control Room contract`);
  }

  const stage = chunk.match(
    /stage:\s*"(DESIGN_APPROVED|REGISTRY_REGISTERED|IMPLEMENTED_ISOLATED|AUTOMATED_CHECKS_PASS|PREVIEW_DEPLOYED|FOUNDER_TESTED|REGRESSION_PASS|CONNECTED|PRODUCTION_RELEASED)"/
  )?.[1];

  if (!stage) {
    fail(`${id}: certification stage is missing or invalid`);
  }

  const status = chunk.match(/\bstatus:\s*"([^"]+)"/)?.[1] || "";

  const claimsFounderTested =
    /(^|-)founder-tested($|-)/i.test(status) &&
    !/(^|-)not-founder-tested($|-)/i.test(status);

  if (
    claimsFounderTested &&
    !/founderTest:\s*"PASS"/.test(chunk)
  ) {
    fail(
      `${id}: status claims Founder-tested but certification founderTest is not PASS`
    );
  }

  if (
    /production-released|production-verified/i.test(status) &&
    !/release:\s*"PRODUCTION_RELEASED"/.test(chunk)
  ) {
    fail(
      `${id}: status claims Production release but certification release is not PRODUCTION_RELEASED`
    );
  }
}

const targetMatches = [...source.matchAll(/canonicalTargetId:\s*"([^"]+)"/g)];
for (const match of targetMatches) {
  const target = match[1];
  if (!idSet.has(target)) {
    fail(`Navigation contract points to missing canonical Registry id: ${target}`);
  }
}

const myHiissaStart = source.indexOf("myHiissaHome: Object.freeze({");
if (myHiissaStart < 0) {
  fail("My HIISSA home Registry entry is missing");
} else {
  const myHiissaEnd = source.indexOf(
    "canonicalSignIn: Object.freeze({",
    myHiissaStart
  );
  const myHiissaChunk = source.slice(
    myHiissaStart,
    myHiissaEnd > myHiissaStart ? myHiissaEnd : source.length
  );

  const requiredDoorLabels = [
    "Talk to HIISSA",
    "My Conversations",
    "Explore HIISSA",
    "My Space",
    "My Account",
    "Back to HIISSA",
  ];

  for (const label of requiredDoorLabels) {
    if (!myHiissaChunk.includes(`label: "${label}"`)) {
      fail(`My HIISSA navigation contract is missing door: ${label}`);
    }
  }

  if (
    !myHiissaChunk.includes(
      'connection: "NOT_CONNECTED_TO_SIGNIN"'
    )
  ) {
    fail(
      "My HIISSA must remain explicitly NOT_CONNECTED_TO_SIGNIN until Founder-tested and regression-approved"
    );
  }
}

if (!source.includes("export const FEATURE_CERTIFICATION_GATE")) {
  fail("FEATURE_CERTIFICATION_GATE definition is missing");
}

if (errors.length > 0) {
  console.error("\nHIISSA Registry certification gate: FAIL\n");
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log("HIISSA Registry certification gate: PASS");
console.log(`Registry IDs checked: ${ids.length}`);
console.log(
  `Certification-managed entries checked: ${entryMatches.filter((match, index) => {
    const start = match.index;
    const end =
      index + 1 < entryMatches.length
        ? entryMatches[index + 1].index
        : source.length;
    return /certificationManaged:\s*true/.test(source.slice(start, end));
  }).length}`
);

if (warnings.length > 0) {
  console.warn("\nWarnings:");
  for (const warning of warnings) {
    console.warn(`- ${warning}`);
  }
}
