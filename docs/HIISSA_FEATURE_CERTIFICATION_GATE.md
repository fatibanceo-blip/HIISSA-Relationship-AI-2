# HIISSA Feature Certification Gate

## Founder-approved purpose

HIISSA must not treat "the screen renders" as proof that a feature works.

Every substantial feature, experience or major navigation door must have one canonical Experience Registry identity and must pass a controlled certification sequence before it is connected from an approved surface or released.

Existing Founder-approved behaviour is protected. A failed new feature must be repaired in isolation rather than compensated for by changing unrelated working features.

## Certification sequence

DESIGN_APPROVED
→ REGISTRY_REGISTERED
→ IMPLEMENTED_ISOLATED
→ AUTOMATED_CHECKS_PASS
→ PREVIEW_DEPLOYED
→ FOUNDER_TESTED
→ REGRESSION_PASS
→ CONNECTED
→ PRODUCTION_RELEASED

These states are deliberately separate.

A feature may exist in code without being connected.
A feature may be deployed to Preview without being Founder-tested.
A feature may be Founder-tested without being Production-released.

## Evidence required

Each certification-managed capability records:

- canonical Registry ID;
- user job / intended behaviour;
- canonical implementation or planned route;
- identity/access family;
- entitlement rule where applicable;
- permission/privacy boundary;
- protected dependencies;
- known gaps;
- Control Room operational-intelligence contract;
- automated check evidence;
- Preview evidence;
- Founder test status;
- regression status;
- connection status;
- release status.

Rendered UI alone is never sufficient evidence.

## Connection rule

A Founder-approved surface must not connect a door to a new or materially changed capability until the destination:

1. has an approved behaviour design;
2. has one canonical Registry identity;
3. is implemented in isolation;
4. passes applicable automated checks;
5. is healthy in Preview;
6. is tested by the Founder;
7. passes regression checks against protected working features.

If a destination is not ready, the door must remain disabled, visibly pending, or unconnected. It must not point to a superficially similar legacy page.

## Failure rule

If certification fails:

1. stop;
2. identify the exact failing capability;
3. preserve unrelated working features;
4. repair only the failing capability or its declared dependency;
5. rerun automated checks;
6. redeploy Preview;
7. repeat Founder acceptance if user-visible behaviour changed.

Do not widen the fix merely to make the symptom disappear.

## My HIISSA navigation contract

### Talk to HIISSA

Canonical Registry ID: `talk.canonical`

User job: open the existing personal HIISSA conversation experience.

Rules:
- Talk is conversation, not account home.
- Talk is not account settings.
- Do not duplicate the chat engine.
- My HIISSA must not certify this door while the authenticated entry automatically renders the legacy account-home card before Talk.
- Build a neutral authenticated clean Talk entry additively; existing Guest/FREE/PLUS/TOGETHER routes remain protected.

### My Conversations

Canonical Registry ID: `my-hiissa.conversations`

User job: show only the current authenticated user's conversation history and allow the user to open the exact selected conversation.

Rules:
- Reuse `/api/conversations` and existing server conversation records.
- Do not create another conversation database.
- Generic `/talk` is not a valid substitute for conversation history.
- Selecting a conversation must hand off to canonical Talk with that exact owned conversation.
- Empty state must say there is nothing to continue; never display a false Continue action.

### Explore HIISSA

Canonical Registry ID: `explore.canonical`

User job: open the one canonical Explore experience.

Rules:
- Do not build a second Explore.
- Package/access context may determine what is permitted, but route context is not entitlement.
- My HIISSA needs a neutral authenticated Explore entry before this door can be certified.

### My Space

Current state: blocked pending reconciliation of the canonical My Space Registry identity and package/access rules.

Rules:
- Do not invent a route merely to make the card clickable.
- Do not expose unavailable storage/history.
- Keep the door truthful until its canonical capability is registered and certified.

### My Account

Canonical Registry ID: `my-hiissa.account`

User job: manage the already-authenticated account.

Rules:
- Must not ask a signed-in user to sign in again.
- Email may be displayed as account information, not as a new sign-in form.
- Support sign out on this device.
- Current plan may be shown only when the Account Access Resolver provides an authoritative value.
- The legacy `/talk?freeAccount=1` panel is not the final My HIISSA account destination.

### Back to HIISSA

Canonical destination: public HIISSA home `/`.

Rules:
- Navigation does not sign the user out.
- Returning to the public home does not change identity, entitlement or permissions.

## My HIISSA home behaviour

My HIISSA is the private authenticated home after successful general Sign in.

It must:
- recognise the current authenticated session;
- show truthful conversation state;
- show Continue only when real history exists;
- otherwise offer Start/Talk;
- keep account controls separate from Talk;
- show one current access level only after the Account Access Resolver exists;
- never infer FREE, HIISSA+ or HIISSA TOGETHER from which button the user clicked;
- keep TOGETHER membership/consent separate from identity;
- keep decorative artwork out of readable text on mobile.

Successful Sign in is not connected to My HIISSA until the home and its required doors are Founder-tested and regression-approved.

## Automated Registry gate

`npm run test:registry` validates the certification foundation.

The standard npm `prebuild` hook runs the same gate before every Next.js build on branches containing this foundation.

The gate currently checks:
- duplicate Registry IDs;
- required canonical foundation IDs;
- certification-managed entries have a status;
- certification-managed entries have a certification contract;
- certification-managed entries have a Control Room contract;
- certification stage is valid;
- Founder-tested/Production claims are not made without matching evidence state;
- My HIISSA canonical target IDs exist;
- all required My HIISSA doors are represented;
- My HIISSA remains explicitly NOT_CONNECTED_TO_SIGNIN while certification is incomplete.

## Regression set before My HIISSA may connect to Sign in

At minimum verify:

- public Main HIISSA page unchanged;
- Founder-approved Sign in button unchanged;
- standalone Sign in screen unchanged;
- Magic Link email request succeeds;
- email link opens Continue to HIISSA;
- Continue securely authenticates successfully;
- Guest Save & Sync unchanged;
- FREE welcome journey unchanged;
- HIISSA+ Preview welcome/Talk/Explore unchanged;
- HIISSA TOGETHER Preview navigation unchanged;
- My HIISSA route recognises authenticated session;
- My HIISSA Talk opens clean canonical Talk;
- My Conversations lists only owned authenticated conversations;
- exact conversation selection opens the correct conversation;
- Explore opens canonical Explore;
- My Account opens account settings without reauthentication;
- mobile layout has no botanical/text overlap;
- current plan display does not guess entitlement.

Only after this set passes and the Founder approves the rendered behaviour may general successful Sign in be connected to My HIISSA.

## Production rule

Preview certification does not authorise Production release.

Production requires separate explicit Founder approval after Preview certification and regression evidence.


## Complete account journey certification contract — Founder approved 2 October 2026

The Certification Gate now treats the signed-in account experience as one journey, not as a collection of unrelated pages.

Canonical Registry ID: `account.journey`

Approved journey contract:

SIGNED_OUT_MAIN
→ SIGN_IN
→ MAGIC_LINK
→ CONTINUE_SECURELY
→ MY_HIISSA_HOME
→ ACCOUNT / TALK / EXPLORE / CONVERSATIONS
→ BACK_TO_MY_HIISSA
→ BACK_TO_MAIN
→ SIGN_OUT_THIS_DEVICE
→ SIGNED_OUT_MAIN_AGAIN

### Journey certification rule

A passing individual screen is not enough to certify the account journey.

The journey must preserve all of these truths together:
- the public Main opening page is the front door;
- signed-out users use the one canonical HIISSA Sign in;
- successful normal authentication reaches My HIISSA;
- My HIISSA is the authenticated account home, not a duplicate product or plan;
- Account, Talk, Explore and Conversations are connected from My HIISSA;
- those destinations have clear return paths to My HIISSA;
- Back to HIISSA returns to the Main opening page without silently signing the user out;
- the finished connected Main state must distinguish an already-authenticated user from a signed-out user;
- Sign out on this device uses local-device sign out and returns to the Main opening page in a signed-out state;
- browser Back/Forward behaviour is part of Founder acceptance evidence;
- FREE, HIISSA+, HIISSA TOGETHER, Guest Save & Sync, existing authentication confirmation, and Production remain protected unless separately approved.

### Current certification state

The complete journey design is **FOUNDER-APPROVED / DESIGN_APPROVED**.

It is **not yet certified as a complete connected journey**.

The current gate therefore:
- verifies that one canonical account-journey contract exists;
- verifies that every required journey state is declared;
- verifies the already implemented route pieces that belong to the journey;
- records remaining connection work truthfully rather than pretending it has passed;
- blocks any Registry claim that the complete journey has moved beyond DESIGN_APPROVED without the contract being deliberately updated and retested.

### Automated command

`npm run test:account-journey`

The standard `prebuild` and `verify:foundation` commands now include this journey-level gate in addition to the Registry and My HIISSA route gates.

Production remains separately gated and requires explicit Founder approval.
