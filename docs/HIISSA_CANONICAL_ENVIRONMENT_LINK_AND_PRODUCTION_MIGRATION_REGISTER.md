# HIISSA — CANONICAL ENVIRONMENT LINKS & PRODUCTION MIGRATION REGISTER
**ACTIVE — READ BEFORE ANY HIISSA NAVIGATION, DEPLOYMENT, HANDOVER OR PRODUCTION MIGRATION**
**Established:** 8 October 2026 (Europe/London)
**Authority:** The Founder-approved latest 13-document HIISSA Controlled Close package, especially Documents 01, 04, 05, 08, 10 and protected Documents 11–13. This operational index is *additive*: it does not replace them or alter approved designs. Document 12 governs documentation; Document 13 governs rolling checkpoints and Controlled Close.

> **FOUNDER'S INSTRUCTION (verbatim, 8 October 2026):**
> "Please make sure that in the future chat we don't confuse it again. So protect it so that it will be easier to be identified. Most especially when it is time for us to migrate to the main, to the main production."

## 1. THE ONE REUSABLE STAGING LINK — BOOKMARK THIS, NOT A VERSION-SPECIFIC LINK

**CANONICAL, MOVABLE STAGING ALIAS — authoritative Founder testing doorway:**

**https://hiissa-relationship-ai-2-env-staging-hiissa-relationship-ai.vercel.app**

**Direct Founder Control Room / Employee Register path under that same alias:**

**https://hiissa-relationship-ai-2-env-staging-hiissa-relationship-ai.vercel.app/admin/control-room?view=staff#staff-employee-register-attendance**

The domain preceding `/admin/control-room` is the reusable Staging alias, NOT an individual deployment URL. It should point to the intended latest Founder-approved **Staging** deployment; VERIFY the Vercel alias mapping every time before relying on it. Reassignment of alias after deploying a new build changes which build new visits receive. An already-open tab can still hold an earlier application until a fresh navigation/reload. This does NOT change immutable deployment-specific URLs.

As independently checked on 8 Oct 2026, the alias pointed to deployment `dpl_ER8GnsGyzGg2U6vmVkeHePMYXb9K`, READY, Staging target, application commit `ed00a927ec6cbcf81495d9ec91a8e32cd7f6485a`. This is a **timestamped observation, not an assertion that this SHA/deployment stays latest forever**.

Do not equate the Founder's opened-screen screenshot with a complete Employee/Attendance end-to-end PASS: screenshots showed the Staging/Founder-only dashboard, Employee Register, Attendance, Department Overview, Reports, filters, honest empty live records and total 0. Real onboarding persistence, attendance writes, live reporting/health, protected API integration and comprehensive certification remain unverified/incomplete as recorded in Document 04 and later checkpoints.

## 2. VERSION-SPECIFIC URLS — HISTORICAL / DIAGNOSTIC ONLY

| Link type | Exact hostname | Deployment | App SHA | Status / allowed use |
| --- | --- | --- | --- | --- |
| **OLDER immutable Staging deployment — DO NOT BOOKMARK FOR NEW WORK** | `hiissa-relationship-ai-2-obw8gu0s6-hiissa-relationship-ai.vercel.app` | `dpl_D8sodyXC6LvLPVQR1YGw2SkLmjSf` | `9d1e59a062436bfa62f6f4dd35cc941b17046462` | READY at its historical time; contains **four** Staff & Workspaces shortcuts, WITHOUT Employee Register shortcut; refreshing this exact hostname continues serving that old build |
| **8 Oct newer immutable Staging deployment — diagnostic link only** | `hiissa-relationship-ai-2-q5ajwv5om-hiissa-relationship-ai.vercel.app` | `dpl_ER8GnsGyzGg2U6vmVkeHePMYXb9K` | `ed00a927ec6cbcf81495d9ec91a8e32cd7f6485a` | READY; **five** shortcuts, Employee Register as fourth; Founder screenshot proves visible dashboard opening. This hostname also remains fixed to this build once superseded |
| **CANONICAL Staging alias — PERMANENT NAVIGATION REFERENCE** | `hiissa-relationship-ai-2-env-staging-hiissa-relationship-ai.vercel.app` | **Look up live mapping** | **Look up live SHA** | Existing stable alias intended to move to verified latest Staging deployment. Do not assume a previously recorded target is still current. |

**CRITICAL:** The old and new immutable hostnames are two releases of ONE Vercel project, NOT two different apps or environments. A refresh of the historical immutable hostname can never import UI changes from a later deployment. Do not treat the two hostnames interchangeably. The older hostname may remain functional for historical diagnosis; never tell the Founder it is the current application.

## 3. EXACT SOURCE / ENVIRONMENT IDENTITY — VERIFIED RECORD

- Repository: `fatibanceo-blip/HIISSA-Relationship-AI-2`.
- Existing Staging branch: `feature/founder-control-room-staging`. This is NOT `main`. The branch HEAD moves after commits; always read it live.
- Vercel project: `hiissa-relationship-ai-2`, ID `prj_akN8AFEg0rlyCFmyn5LUSdjyWIF0`. Existing custom target `staging`; do not create a duplicate project/environment.
- Existing Staging Supabase project (documented): `upcssfmilewwshyxyvdf`. Do not confuse with Production Supabase.
- Staging application route: `app/admin/control-room/page.js` → `app/admin/control-room/AuthenticatedControlRoom.js` → `app/admin/control-room-preview/page.js` (FounderAccessCentre).
- New Employee Register UI: `app/admin/control-room-preview/FounderEmployeeRegisterAttendancePreview.js`.
- Staging Founder read-only API: `app/api/admin/control-room/employee-register/route.js`.
- Approved onboarding UI source: `app/admin/control-room-preview/page.js`, preserved protected blob `d123b707477854d1811f6f7e2534248c5c7ba056` in last verified build; compare latest exact blob before touching anything (Founder approval needed for changes).
- Registry source: `lib/experience-registry.js`.
- Automated Staging branch Git deployment: DISABLED via `vercel.json` key `git.deploymentEnabled["feature/founder-control-room-staging"] = false`. GitHub documentation commits DO NOT themselves deploy the application. Deploy only a specifically verified app SHA to existing Staging as a separate controlled action.

## 4. WHAT THE FOUNDER ACTUALLY OBSERVED — PROTECTED EVIDENCE

Prior Founder screenshots (Document 04 pages 191, 197–198; Documents 07/08 also preserve originals) show a full Staff & Workspaces shortcuts list with four entries (Departments & Workspaces, Private Appreciation, Staff Directory, Access & Security). Historical older code SHA `9d1e59...` has exactly those four entries. New SHA `ed00a927...` has the Employee Register fourth, making five. The old screenshot did not reveal its complete browser hostname; therefore its exact cause is not proven just by source match.

Later Founder phone screenshots in the 8 October 2026 successor conversation (local conversation files `1000375672.jpg` and `1000375670.jpg`) show updated Staging Employee Register & Attendance page opened: four tabs, source selector 'Verified Staging records', Founder-only Staging label, 0 total staff, honest absence of inferred presence, filters and Existing Staff Onboarding link. **Visible route/screen opening OBSERVED PASS; full interaction and persistence NOT YET VERIFIED.** This checkpoint retains these image references; the uploaded screenshots themselves are not represented as Git-tracked media by this index.

## 5. NO-SURPRISE PRODUCTION MIGRATION GATE — TWO SEPARATE FOUNDER DECISIONS

**NEVER merge, promote, redeploy, point alias to Production, change Production environment variables/data/authentication, or activate a feature simply because a Staging link opened or a Vercel build says READY.**

Follow the Founder-approved sequence from Document 10 and Document 12:

1. Re-read the latest 13 controlled documents and this index. Determine latest Staging branch, commit, deployment, Supabase project, alias map, feature status, tests, known failures and protected systems. Review all rolling checkpoint updates since the package.
2. Finish the COMPLETE working approved Staging feature journey (not static cards): authentic onboarding invitation, applicant form completion/save/send, distinct Founder review/approval, engagement verification and single employee identity, evidence-backed attendance event writing and reporting, role isolation, safety/privacy/accessibility and integrations. Keep original Founder-approved onboarding layout, copy and journey unchanged unless explicit approved change.
3. Run required staging automated, permission-denied/security, accessibility/mobile, failure/retry, Registry, Control Room health, operational alerts, and protected journey regression gates. Document automated outcomes separately from Founder practical tests. Obtain Founder's actual practical acceptance for end-to-end changed experience.
4. Prepare a **Production deployment proposal** specifying exact source branch and commit, intended target branch `main`, actual Production Vercel project/domain/alias (verify live, DO NOT assume a staging-looking URL is Production), Production Supabase project identity (verify independently, not from Staging), configured environment-variable NAMES only, feature flags, migration scripts, backup/rollback, activation OFF, privacy/permissions, build/regression results and change/non-effect list. Reconcile existing Production features. Do not copy Staging secrets/data into Production.
5. Obtain **separate explicit Founder approval for deploying the completed feature to Production, activation OFF**. Only after approval, execute tightly scoped rollout/merge and verify Production code+schema+routing, while the feature remains hibernated/inactive to ordinary users.
6. Seek **another explicit Founder approval to activate**. No automatic activation, no inference that Production deploy equals release. Follow documented Founder Control Room visibility, telemetry, fail-safe and rollback gates.

**PRODUCTION CANONICAL URL/DOMAIN: NOT DESIGNATED BY THIS REGISTER.** Vercel project metadata currently exposes domains including `hiissa-relationship-ai-2.vercel.app`, `hiissa-relationship-ai-2-hiissa-relationship-ai.vercel.app`, and `hiissa-relationship-ai-2-git-main-hiissa-relationship-ai.vercel.app`, but none is hereby claimed as the approved current public Production entry point. Determine from authoritative Production settings and Founder approval at migration time; never choose one by name alone. Never repoint the Staging alias to Production.

## 6. EVERY SUCCESSOR CHAT FIRST-MINUTE CHECK — REQUIRED

When a new conversation starts with the 13 DOCX files, **open/reconcile Document 04 latest appendix and Document 10 latest handover, then this exact GitHub file in the already-known repository and existing Staging branch before suggesting a link or deploying**. Do not ask the Founder to rediscover the difference between old fixed deployment URLs and the single reusable Staging alias. Treat historical `CURRENT` statements as timestamped checkpoints, not permanent pointers.

Read-only verification commands through connected GitHub/Vercel tools:
- Get Vercel alias `hiissa-relationship-ai-2-env-staging-hiissa-relationship-ai.vercel.app` → exact deployment ID.
- Get that deployment → `target == staging`, `readyState == READY`, Git branch and app SHA.
- Get GitHub source and branch HEAD → distinguish *documentation-only* HEAD from *deployed app code* SHA.
- Inspect correct `/admin/control-room?view=staff#staff-employee-register-attendance` under alias, then test at evidence-appropriate level.
- Before Production migration, verify target project/domain/branch/DB distinctly and get both separate approvals.

**STOP if any identity, environment, alias, commit, screenshot or approval conflicts.** Document what conflicts rather than silently overwriting.

## 7. CONTROLLED DOCUMENT 12 ROLLING RECORD FOR THIS REGISTRY

**WHAT:** Established one explicit canonical environment URL/migration index.
**WHY:** Founder asked never to confuse old and current links again, particularly when migrating to `main`/Production.
**HOW:** Reconciled 13-document latest and historical handovers with independent GitHub and Vercel project, alias and both historical immutable-deployment lookups.
**PROCESS:** Founder instruction → source/release-rule reconciliation → provider-state verification → durable document-only Staging repository record → reference index in README → future Controlled Close additive incorporation.
**WHERE:** This file at `docs/HIISSA_CANONICAL_ENVIRONMENT_LINK_AND_PRODUCTION_MIGRATION_REGISTER.md` in `feature/founder-control-room-staging`; project `prj_akN8AFEg0rlyCFmyn5LUSdjyWIF0`.
**WHO:** Founder approved protection/document-identification instruction; assistant implemented documentary safeguards only; no production actions authorised.
**EVIDENCE:** Document 04 old and new exact SHA/deployment/aliases; Document 10 Production hibernation sequence; Document 12 status gates; Vercel alias/latest deployment read-only verification 8 October; Founder updated dashboard screenshots.
**STATUS:** Document link map and checklist established; protected Staging/Production separation **documented**, NOT a new software access control or forced redirect; app and Production unchanged. Mobile current dashboard render observed, whole feature incomplete.
**FAILURES/CORRECTIONS:** Historical old immutable URL wrongly treated as current application; restore canonical alias vs immutable release distinction. Previous screenshot-source mismatch resolved at least to current feature visible through new release-specific URL; original phone URL not verified.
**NON-EFFECT:** No Protected Docs 11–13 edited, no app redesign, no Prod promotion, no Staging/Production alias change, no database/API auth/feature activation alteration.
**NEXT:** Use stable Staging alias as the canonical future URL; verify it live before every handover. On Controlled Close, add this register by reference and the exact distinctions in living DOCX 01–10 without removing history; carry only one current 13-DOCX ZIP. Resume approved Staging Employee Register phase gates, then separately seek Founder consent for Production deployment/activation only when ready.
