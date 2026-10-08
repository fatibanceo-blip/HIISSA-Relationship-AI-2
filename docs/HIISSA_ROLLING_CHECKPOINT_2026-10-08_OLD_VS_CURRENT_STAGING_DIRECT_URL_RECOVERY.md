# HIISSA rolling checkpoint — 8 October 2026 — Document-recovered Staging URL/version discrepancy and correct link

## Founder directive (verbatim)
“Have you fixed it? What do you want me to check if you have not fixed it? What you need to do is to go to the document and do the necessary check and then fix it, find the right one, and let's carry on.”
“Go to the documents. The document must have recorded what we did, how it was done. So you will find the link there. That will give you a clue on which one we use.”

## WHAT / WHY
Revisited historical and latest Document 04 records instead of repeating a browser-test request. Found **two distinct immutable Staging deployment URLs**. The earlier READY application source `9d1e59a062436bfa62f6f4dd35cc941b17046462` contains exactly the four Staff & Workspaces shortcuts in the Founder's screenshot; the later READY source `ed00a927ec6cbcf81495d9ec91a8e32cd7f6485a` includes a fifth “Employee Register & Attendance” shortcut and the actual new dashboard component. The earlier direct deployment URL remains addressable; a Vercel alias changing to newer builds does not rewrite the old immutable hostname. Therefore reopening an old full deployment hostname could show the old screen even after a successful newer deployment.

## HOW / PROCESS / WHERE / EVIDENCE
1. Re-read Document 04, archived historical section around page 183, lines 9091–9134: historical deployment `dpl_D8sodyXC6LvLPVQR1YGw2SkLmjSf`, source `9d1e59...`, **historical immutable deployment URL** `https://hiissa-relationship-ai-2-obw8gu0s6-hiissa-relationship-ai.vercel.app`; shared alias `https://hiissa-relationship-ai-2-env-staging-hiissa-relationship-ai.vercel.app`.
2. Re-read Document 04 latest section G page 200 lines 9872–9903 and C29-11 lines 9694 onward: updated app deploy `dpl_ER8GnsGyzGg2U6vmVkeHePMYXb9K`, SHA `ed00a927...`, canonical existing Staging alias with `/admin/control-room?view=staff#staff-employee-register-attendance`.
3. Independently asked Vercel to resolve **both immutable hostnames**:
  OLD `hiissa-relationship-ai-2-obw8gu0s6-hiissa-relationship-ai.vercel.app` → `dpl_D8sodyXC6LvLPVQR1YGw2SkLmjSf`, Staging READY, SHA `9d1e59...`.
  NEW `hiissa-relationship-ai-2-q5ajwv5om-hiissa-relationship-ai.vercel.app` → `dpl_ER8GnsGyzGg2U6vmVkeHePMYXb9K`, Staging READY, SHA `ed00a927...`.
  Existing alias was independently checked previously pointing to NEW `dpl_ER8G...`.
4. GitHub file comparison `app/admin/control-room-preview/page.js`: old SHA has four shortcuts in exact screenshot order, new has five including Employee Register 4th. New `FounderEmployeeRegisterAttendancePreview.js` is imported and rendered in new deployed code; no broad new-code fix warranted without verifying what URL the Founder's device loaded.
5. Corrective action is identifying unambiguously the **new exact deployment URL**, not creating an unnecessary duplicate environment, modifying the protected onboarding interface, or redeploying an already-READY new implementation. Use `https://hiissa-relationship-ai-2-q5ajwv5om-hiissa-relationship-ai.vercel.app/admin/control-room?view=staff#staff-employee-register-attendance` as a distinct current-deployment-specific Staging verification doorway; the stable alias also points to it but could be confused with an old browser tab/deploy hostname.

## WHO / STATUS
Founder submitted historical and new four-shortcut screenshot and insisted on document-first investigation. Assistant read exact Docs and independently verified Vercel endpoints. **Older link/version mismatch proven; actual user-device URL NOT VERIFIED.** The newest source has the intended shortcut, but no Founder practical acceptance yet. Do NOT claim real runtime bug fixed or Employee/Attendance full phase complete. This is a URL/version recovery, not new app implementation.

## FAILURES & CORRECTIONS
Previous assistant repeatedly proposed the generic alias without first recovering the older immutable URL recorded in Document 04. The current recovery explains a concrete possible reason why an older page persists. If the Founder was actually on the stable alias, the remaining cache/client runtime cause is not resolved and must be investigated further; do not classify hypothesis as proof.

## NON-EFFECT / NEXT
No Production, Supabase, feature entitlement, personal data, protected onboarding UI, Staff Access, private appreciation, original source `page.js`, Docs 11–13 or Vercel configuration changed. No code deployment created, because current correct build already READY. Next Founder screen test should use **different exact current immutable deployment URL**, not repeat an unchanged ambiguous link. If current direct URL still renders four options, investigate rendering/hydration and browser URL before proposing a narrow, Founder-approved Staging correction. Once the current menu is visible, test the new four-tab section and preserve screenshots and actual Founder PASS/FAIL. Resume only authorised end-to-end Staging work after that gate.