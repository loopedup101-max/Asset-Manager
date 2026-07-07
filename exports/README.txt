MADE SUPER AI — EXPORT CONTENTS
================================

1) made-super-ai-source.zip
   Your complete source code (362 files). Everything needed to rebuild the app.
   To run it elsewhere: install Node.js, run `pnpm install`, then start it.
   NOTE: node_modules is intentionally NOT included — `pnpm install` downloads
   those libraries fresh (hundreds of MB, always regenerated, never edited).

2) made-super-ai-database.sql
   A full dump of your PostgreSQL database — schema AND all data.
   Tables: users, conversations, messages, sent_emails, social_accounts,
   social_posts, usage.
   To restore into another Postgres database:
     psql "YOUR_DATABASE_URL" -f made-super-ai-database.sql

WHAT IS *NOT* IN HERE, AND WHY
------------------------------
- API keys / secrets (Stripe, Clerk, session secret, database URL, etc.):
  Deliberately excluded for security — bundling live keys in a downloadable
  file is unsafe. You re-enter them as environment variables on any new host.
  The names you'll need: DATABASE_URL, SESSION_SECRET, plus your Stripe and
  Clerk keys, and the Google Mail connection (managed by Replit).

- Login identities (Clerk): The `users` table above holds your app-side user
  records, but the actual sign-in accounts/passwords live in Clerk's system,
  not in this project. Export those from your Clerk dashboard if migrating.

- Uploaded/generated videos & images: There are NONE stored on the server.
  The Video Studio generates images/voiceover on demand and renders the final
  video in the browser, which the user then downloads. Any photos/clips a user
  adds stay on their device. So there's nothing server-side to export here.
