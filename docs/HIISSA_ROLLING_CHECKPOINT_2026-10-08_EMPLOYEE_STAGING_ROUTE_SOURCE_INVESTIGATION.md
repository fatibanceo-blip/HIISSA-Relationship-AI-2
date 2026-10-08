# HIISSA rolling checkpoint — 8 October 2026 — Employee Register Staging route/source diagnosis

## WHAT
Following the Founder's “Okay, carry on” instruction, performed further READ-ONLY investigation of the previously observed four-shortcut Staff & Workspaces FAIL. Reconsulted Document 04, section G, steps 1–3, and protected Document 12 sections 1/4 and Document 13 sections 3/4 before provider actions. No feature design or code modification.

## WHY
Document 04 requires exact staging route/alias, page hydration/session redirection, and caching to be investigated rather than asking the Founder to scroll. The Founder has a full screenshot at 18:07 UK showing only four shortcuts; the deployed source declares five.

## HOW / PROCESS
1. Re-read Doc 04, lines around 9688–9732, 9872–9960: staging deployment id `dpl_ER8GnsGyzGg2U6vmVkeHePMYXb9K`; app SHA `ed00a927ec6cbcf81495d9ec91a8e32cd7f6485a`; canonical existing alias and exact browser route; missing-shortcut investigation instruction. Re-read Docs 12/13 for preservation and evidence.
2. Independently queried Vercel current project, existing alias and deployment. Alias still resolves to deployment `dpl_ER8GnsGyzGg2U6vmVkeHePMYXb9K`, ready, target `staging`, app SHA `ed00a927...`, no alias error. Deployment READY timestamp: 2026-10-08T16:23:20.537Z = 17:23:20 BST.
3. Inspected source at exact deployed app SHA for:
  - `app/admin/control-room/page.js` renders `AuthenticatedControlRoom` outside Production; no deliberate old route fallback.
  - `app/admin/control-room/AuthenticatedControlRoom.js` imports `../control-room-preview/page.js` and displays it only after Supabase session and `is_hiissa_admin` verification. It redirects sign-out/no-session to /admin/login; does not selectively hide menu items.
  - `app/admin/control-room-preview/page.js`: `FounderAccessCentre` has literal five-item navigator, with `Employee Register & Attendance` 4th, target `staff-employee-register-attendance`. `FounderEmployeeRegisterAttendancePreview` imported and rendered after workspaces; `ControlRoomAreaNavigator` blindly maps all provided entries to `a` tags.
  - `app/admin/control-room-preview/FounderEmployeeRegisterAttendancePreview.js` is present, renders section with same id and GET-only API; four-tab read-only module remains separate.
  - `app/admin/control-room-preview/page.module.css` navigation styles inspected; no rule hiding the fourth entry established.
  - `middleware.js` session refresh and `vercel.json` deployment controls inspected; latter disables automatic git deployment for this Staging branch, so documentation-only Git commits do not deploy a new app.
  - `public/` includes only approved image assets, not a service worker file.
4. Historical `page.js` at SHA `9d1e59...` contains exact four-item order visible in screenshot. New deployed `page.js` SHA `ed00a927...` has five. Therefore current backend source and observed Founder browser render mismatch.
5. Queried Vercel exact deployment and verified direct alias resolution. Attempted source deployment file listing via Vercel: unsupported/error in connector; no compiled bundle independent inspection was claimed.
6. Latest Staging Git branch includes documentation-only checkpoints; latest app deployment remains the earlier SHA.

## WHERE / WHO / EVIDENCE
Repository `fatibanceo-blip/HIISSA-Relationship-AI-2`, branch `feature/founder-control-room-staging`; app code paths above. Staging alias `hiissa-relationship-ai-2-env-staging-hiissa-relationship-ai.vercel.app`, exact handover route `/admin/control-room?view=staff#staff-employee-register-attendance`. Founder screenshot in current 8 October conversation shows four options with phone clock 18:07 BST (browser URL not visible). Assistant conducted read-only connected GitHub/Vercel checks. No authenticated Founder browser observation after explicitly opening the current alias.

## STATUS
SOURCE/ALIAS/DEPLOYMENT CURRENTLY VERIFIED as described. FOUNDER MOBILE NAVIGATION FAIL. ROOT CAUSE STILL NOT VERIFIED. Browser delivering a previously loaded/cached client page or another hostname is supported as a *hypothesis*, but not established without the actual on-phone URL and a fresh load. No reliable evidence of changed/deleted deployed feature.

## FAILURES, CORRECTIONS, NON-EFFECT
No changes to application, CSS, protected onboarding, Staff Access, Production, Supabase/data, Vercel deployment, or protected Docs 11–13. No feature pass declared. Old instruction to scroll down is specifically rejected due full screenshot. A refreshed canonical Staging load and screenshot with address bar is the remaining narrow human-authenticated observation needed to distinguish client/browser circumstances. No broad Sarah re-tests required.

## NEXT
Founder opens the *exact canonical existing Staging alias in a new Chrome tab*, signs in if required, captures the address bar and complete Staff & Workspaces shortcut block (or simply reports five-button success). If still four on canonical URL after fresh navigation, escalate to reproducible Staging served bundle/hydration investigation and propose the smallest authorised correction before code changes. If fifth appears, test its four-tab render, source selection, filtering and reports in Staging and obtain Founder practical PASS/FAIL. Maintain Doc 12 checkpoint discipline.
