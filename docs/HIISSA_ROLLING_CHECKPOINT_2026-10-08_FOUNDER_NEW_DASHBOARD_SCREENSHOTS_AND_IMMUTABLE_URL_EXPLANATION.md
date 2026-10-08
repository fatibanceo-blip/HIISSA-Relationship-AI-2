# HIISSA rolling checkpoint — 8 October 2026 — Founder opened current Employee Register; old immutable deployment URL explained

## WHAT
Founder supplied TWO new Samsung phone screenshots from the current HIISSA Staging Employee Register & Attendance experience, following recovery of the exact latest direct Vercel deployment URL. Then the Founder asked why refreshing an older link in the same app did not reveal the updated Employee Register shortcut. The screenshots show a working *visible opening/render* of the new dashboard, not complete end-to-end acceptance.

## FOUNDER ORIGINAL WORDING
“Why is it that even when I try to refresh the older link in the same app, I was still not seeing it there? I don't get it. Because once it's the same app, it's the same thing we are doing when I refresh it, the update should come there, but I don't know what is happening.”

## WHY
Founder expects one reliable always-current Staging doorway; should not have to distinguish many long Vercel links. Clarify the difference between immutable per-deployment URL and mutable canonical alias, while preserving accurately scoped screenshot evidence.

## HOW / PROCESS
1. Consulted Document 04 historical and latest records: original fixed Staging deployment `dpl_D8sodyXC6LvLPVQR1YGw2SkLmjSf` at app SHA `9d1e59a062436bfa62f6f4dd35cc941b17046462`, immutable URL `https://hiissa-relationship-ai-2-obw8gu0s6-hiissa-relationship-ai.vercel.app`; new Staging READY `dpl_ER8GnsGyzGg2U6vmVkeHePMYXb9K`, app SHA `ed00a927ec6cbcf81495d9ec91a8e32cd7f6485a`, immutable URL `https://hiissa-relationship-ai-2-q5ajwv5om-hiissa-relationship-ai.vercel.app`; shared alias `https://hiissa-relationship-ai-2-env-staging-hiissa-relationship-ai.vercel.app` verified previously pointing to new deployment.
2. Earlier Git source comparison proved old component has exactly four Staff & Workspaces links and new deployed source five links including the 4th Employee Register. Old individual deployment URLs stay pinned to their own build; refreshing one fetches same build, not newer. Shared alias is the correct ongoing bookmark, as it moves to new READY deployment when assigned; even with mutable alias, browser-side stale page may occasionally require a fresh load.
3. Founder current screenshots: first screenshot has four tabs Employee Register, Attendance, Department Overview and Reports, search and filters, Existing Staff Onboarding link and visible honest empty-source statement; second screenshot has heading Employee Register & Attendance, Staging/Founder-only badge, verified Staging records selector, refresh Staging data button, Total Staff 0, Present Today shown as em dash pending certified attendance rules. Mobile appearance seen in browser, but the screenshot does not prove query API response details, refresh functionality or all tab actions.
4. No code change required to explain immutable links; do not claim that original link has been 'fixed' or redirecting. Recommend only the established mutable Staging alias as consistent bookmark, not stale numbered/hashed deployment-specific URLs.

## WHERE / WHO / EVIDENCE
User screenshots attached in this conversation at approximately 18:30 BST on 8 October 2026 (device clock; not audited backend time), `/mnt/data/1000375672.jpg` and `/mnt/data/1000375670.jpg` are conversation-local screenshot paths, not claimed GitHub-uploaded originals. Founder supplied both screenshots and question. Assistant inspected visible screen and re-read Documents 04 and 13. Exact project `fatibanceo-blip/HIISSA-Relationship-AI-2` Staging branch `feature/founder-control-room-staging`; original source `app/admin/control-room-preview/page.js`; new read-only dashboard `app/admin/control-room-preview/FounderEmployeeRegisterAttendancePreview.js`. No Production actions.

## STATUS
**FOUNDER VISUAL RENDER / CORRECT CURRENT DEPLOYMENT ACCESS: OBSERVED PASS (limited to shown controls and content).** Historical four-shortcut link failure explained by immutable old deployment possibility, with exact link used on Founder's earlier phone NOT verified. **FULL COMPONENT FUNCTIONAL TEST, DATA API RESPONSE, 4-TAB INTERACTIONS, CSV, SEARCH/FILTER, ONBOARDING PERSISTENCE, ATTENDANCE WRITES, LIVE NOTIFICATIONS: NOT VERIFIED / NOT IMPLEMENTED as applicable.** Build/READY are separate statuses.

## FAILURES & CORRECTIONS / NON-EFFECT / NEXT
Earlier repeated generic alias links without distinguishing old pinned deployment link versus current immutable deployment link increased Founder confusion. Explain link semantics clearly and use the canonical existing Staging alias for *future* work, rather than re-sending unique immutable links as permanent bookmarks. No new app code, deployment, database rows, security/permissions, approved onboarding, Staff Access, Production, or protected Docs 11–13 changed.

NEXT: Continue Doc 04 G founder test steps for tabs, source, search/filter and reports without repeating already observed screen-opening; resume protected onboarding integration only with approved additive backend design after tests and necessary gates. Preserve this screenshot status and explain the durable one-link approach to the Founder.
