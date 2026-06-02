---
name: Social Hub is copy-paste only (no real posting/scheduling)
description: The Social feature in madetvceo-chat must NEVER claim to connect accounts, publish, or schedule — it only writes content with AI for the user to copy & paste manually.
---

# Social Hub = AI writer + copy/paste only

The Social feature does NOT integrate with any platform. There is no OAuth, no external API call, no background scheduler. "Connecting" only set a `connected:true` flag in `socialAccountsTable`; "Publish"/"Schedule" only inserted rows into `socialPostsTable`. None of it ever reached Twitter/IG/YouTube/FB/TikTok/LinkedIn.

**Decision (user-confirmed, owner of madesuperai.com, non-technical):** strip ALL fake states. The page must only:
- generate real AI content (the `/social/generate` OpenAI call IS real), and
- let the user **Copy** it and **Save** it to a personal library (drafts in own DB).
Tabs are now "AI Creator" + "My Posts". An amber notice explicitly states it does not auto-post or schedule. No "Connected / Disconnected / Published / Scheduled" wording anywhere.

**Why:** User was about to advertise the product and demanded total honesty; fake "connected/published/scheduled" UI is false advertising that exposes the owner to refunds/chargebacks/legal risk. Real auto-posting requires per-platform developer-app approval (days–weeks, owner-only) + a server-side scheduler — none of which exists. X API also costs ~$100/mo; Facebook only allows Page posting, never personal profiles.

**How to apply:** Do NOT reintroduce account "connect", "publish", or "schedule" actions in `social.tsx` or imply them in copy/nav/marketing. If real posting is ever requested, it's a genuine per-platform build gated on the owner obtaining approved API credentials — confirm scope first. Backend connect/publish/stats endpoints may still exist but must stay unused by the UI until real integration is built.
