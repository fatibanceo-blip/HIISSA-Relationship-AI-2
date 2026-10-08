# HIISSA rolling checkpoint — 8 October 2026, 18:09 BST — Founder four-shortcut FAIL and staging mismatch investigation

## WHAT
The Founder reported, verbatim: “Employee register and attendance has disappeared again. I don't know what is happening.” She uploaded a mobile screenshot showing the fully expanded “Staff & Workspaces areas” shortcut section. Exactly four buttons were visible, in sequence: Departments & Workspaces; Private Appreciation; Staff Directory; Access & Security. The expected “Employee Register & Attendance” shortcut was absent. This supersedes the earlier *inconclusive cropped-image* navigation observation with a **confirmed Founder visual navigation FAIL**, but NOT proof that the feature's underlying data or deployment has disappeared.

## WHY
A previously implemented Founder Control Room staging feature is not reliably discoverable on the Founder’s phone. The Founder must not be made to keep hunting, and read-only build/READY evidence cannot be promoted to practical acceptance. The issue must be isolated without redesigning onboarding, changing approved navigation, or damaging working functionality.

## HOW / PROCESS
1. Inspected the Founder-supplied screenshot in this chat. The shortcut list is fully visible: four buttons, with Access & Security last. This rules out the earlier explanation that the missing item might simply be lower in the same shortcut list.
2. Read-only checked connected Vercel project `hiissa-relationship-ai-2`. Alias `hiissa-relationship-ai-2-env-staging-hiissa-relationship-ai.vercel.app` currently maps to deployment `dpl_ER8GnsGyzGg2U6vmVkeHePMYXb9K`, target `staging`, READY, application SHA `ed00a927ec6cbcf81495d9ec91a8e32cd7f6485a`; no alias error.
3. Read-only compared `app/admin/control-room-preview/page.js` at older commit `9d1e59a062436bfa62f6f4dd35cc941b17046462` and deployed app SHA `ed00a927ec6cbcf81495d9ec91a8e32cd7f6485a`. Older JSX has exactly the four labels shown on the phone. New JSX includes fifth `["Employee Register & Attendance", "staff-employee-register-attendance"]` between Staff Directory and Access & Security. At new SHA, `FounderEmployeeRegisterAttendancePreview` is imported and rendered; the area navigator maps entries without a filtering condition.
4. Examined `app/admin/control-room/page.js`; this returns the authenticated Control Room outside Production. Inspected CSS for relevant global/conditional hide evidence; no verified CSS cause established.
5. Did NOT access the user’s authenticated browser session or obtain its address/headers, so cannot yet distinguish stale browser page, wrong hostname/tab, edge-delivery/caching, or other runtime discrepancy. No app-level API acceptance test performed.

## WHERE
GitHub `fatibanceo-blip/HIISSA-Relationship-AI-2`; existing branch `feature/founder-control-room-staging`; UI source `app/admin/control-room-preview/page.js` and related `FounderEmployeeRegisterAttendancePreview.js`; Staging route `/admin/control-room?view=staff#staff-employee-register-attendance`; Vercel existing Staging alias as above. This checkpoint is documentation-only.

## WHO
Founder: screenshot and practical observation. Assistant: read-only screenshot review, GitHub source comparison and Vercel alias/deployment inspection.

## EVIDENCE / STATUS
- Founder screenshot in current 8 October 2026 conversation, phone clock 18:07 (displayed phone time, not certified server event time); screenshot shows four shortcuts and the “Gentle check-in snoozed” panel.
- Read-only Vercel alias and deployment metadata as above (checked after screenshot).
- Read-only GitHub source content for old and deployed SHAs as above, proving exact four-versus-five source difference.
- Status: **FOUNDER VISUAL NAVIGATION FAIL / ROOT CAUSE NOT VERIFIED**. Vercel latest deployment READY and source includes feature; actual Founder runtime behaviour not accepted. No evidence of feature deletion. Earlier partial screenshot remains historically inconclusive; the new full screenshot definitively shows missing shortcut in the observed render.
- Existing wider Employee Register end-to-end workflow remains incomplete; no Production activation.

## FAILURES & CORRECTIONS
Do not repeat the mistake of telling the Founder to scroll lower after a full screenshot demonstrates absence. Correct guidance is to identify the actual page URL in the Founder's browser and compare with a fresh navigation to the canonical Staging alias. The older four-button menu matches the Founder screenshot exactly, suggesting an older render, but this is a hypothesis, not a proven cache root cause. Fix only after root cause verified and Founder approval under change-control.

## NON-EFFECT
No application code edits, data writes, onboarding UI changes, permission changes, staff onboarding, attendance/employee creation, environment creation, Production release or protected Document 11–13 amendments. Separate automatic documentation-only Git commit may update branch HEAD; this is NOT a code deployment or Founder acceptance.

## NEXT
Ask Founder to open the exact current Staging URL in a new Chrome tab and inspect whether “Employee Register & Attendance” appears between Staff Directory and Access & Security. If absent, capture browser address bar alongside the shortcut list to discriminate incorrect URL/cached older page from staging delivery. Avoid requesting secrets or auth tokens. If persistent, diagnose served route/alias/build and use narrowly scoped Founder-approved staging repair. Retest same menu and the real four-tab section in the Founder’s mobile browser; record PASS/FAIL and screenshots. Do not disturb protected onboarding and previously passed Sarah Staff Access tests.
