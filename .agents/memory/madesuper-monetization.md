---
name: Made Super AI monetization model
description: Confirmed freemium + credit model for the madetvceo-chat app — settles repeated back-and-forth on "free" vs paid.
---

# Made Super AI monetization (user-confirmed)

Model (confirmed via user_query after several rounds of clarification):

- Signed-in users with **no plan** get a **recurring time-based free trial** of "Ask Me Anything" chat ONLY — a window of `FREE_TRIAL_MINUTES` (currently 10) that starts on their **first chat message**, not at signup. When it elapses they're prompted to buy a plan, AND a fresh window is auto-awarded every `FREE_TRIAL_RESET_HOURS` (currently 24). (This replaced the earlier "few free questions" count model — do not reintroduce a free message-count limit.)
- **Every other tool** (Social, Builder, Studio, Tools) is **paid** — visible but behind an upgrade wall.
- Plans grant **credits that deplete** (Replit-style): show usage, prompt to upgrade when low/out.
  - Basic $19.99/mo = 100 credits/mo (metered by monthly action count)
  - Pro $29/mo = unlimited
  - Business $79/mo = unlimited
  - Owner = free / unlimited
- The free trial is **NOT** "credits" — credits only exist once a user has a plan. Free = time trial; Basic = monthly credit count.

**Why:** The user iterated several times (5 uses → 10 uses → "10 minutes in the program" → finally "10 minutes, awarded again every 24 hours") and explicitly wanted an embedded countdown timer that prompts upgrade when time is up. The settled answer is: recurring time-based free chat trial → pay to remove the wait; all other tools always paid; Basic = depleting monthly credits with upgrade nudges.

**How to apply:** Free-tier gating is by elapsed time since `trialStartedAt` (server-authoritative), NOT message count. The window auto-resets: `claimTrialWindow()` re-stamps `trialStartedAt` when it's null or older than the reset window. CRITICAL: the gate's reset boundary (`claimTrialWindow`, uses `<=` cutoff) and the display's reset boundary (`trialStatus`, uses `>= resetMs`) must stay in lockstep or UI and gate disagree at the 24h mark. `trialStatus` returns `nextResetAt` when expired; the chat UI schedules a `["me"]` refetch at that time so the input auto-re-enables without a manual refresh. Enforce the gate on **every** chat-generation endpoint via shared `checkChatGate(user)` (both the streaming and legacy non-stream message routes — both must gate or the paywall is bypassable). Don't gate chat behind full entitlement (only the trial); keep all other tools entitlement-gated. Frontend seeds a local mm:ss countdown from server `trial.startedAt`/`totalSeconds`, but server 402 stays the source of truth.
