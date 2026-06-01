---
name: Made Super AI monetization model
description: Confirmed freemium + credit model for the madetvceo-chat app — settles repeated back-and-forth on "free" vs paid.
---

# Made Super AI monetization (user-confirmed)

Model (confirmed via user_query after several rounds of clarification):

- Signed-in users with **no plan** get a **time-based free trial** of "Ask Me Anything" chat ONLY — a single window (currently 10 minutes, `FREE_TRIAL_MINUTES`) that starts on their **first chat message**, not at signup. When it elapses they must buy a plan. (This replaced the earlier "few free questions" count model — do not reintroduce a free message-count limit.)
- **Every other tool** (Social, Builder, Studio, Tools) is **paid** — visible but behind an upgrade wall.
- Plans grant **credits that deplete** (Replit-style): show usage, prompt to upgrade when low/out.
  - Basic $19.99/mo = 100 credits/mo (metered by monthly action count)
  - Pro $29/mo = unlimited
  - Business $79/mo = unlimited
  - Owner = free / unlimited
- The free trial is **NOT** "credits" — credits only exist once a user has a plan. Free = time trial; Basic = monthly credit count.

**Why:** The user iterated several times (5 uses → 10 uses → finally "10 minutes in the program") and explicitly wanted an embedded countdown timer that prompts upgrade when time is up. The settled answer is: time-based free chat trial → then pay; all other tools always paid; Basic = depleting monthly credits with upgrade nudges.

**How to apply:** Free-tier gating is by elapsed time since `trialStartedAt` (server-authoritative), NOT message count. Enforce the trial/credit gate on **every** chat-generation endpoint via the shared `checkChatGate(user)` helper in storage.ts — there's both a streaming and a legacy non-stream message route, and both must gate or the paywall is bypassable. Don't gate the chat behind full entitlement (only the trial); keep all other tools entitlement-gated. Frontend seeds a local mm:ss countdown from server `trial.startedAt`/`totalSeconds` but server 402 stays the source of truth.
