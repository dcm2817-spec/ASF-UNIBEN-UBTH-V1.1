# ASF UNIBEN/UBTH — Website (v1, flat file structure)

No build step, no npm, no React, and **no subfolders** — every file sits in
one flat folder on purpose, so uploading file-by-file on a phone (e.g. via
GitHub's mobile upload, which doesn't preserve folder structure) can't break
any links. Just Supabase loaded from a CDN link.

## Uploading to GitHub
Select **all files in this folder at once** and upload them together in one
go — that keeps everything at the same (root) level, which is exactly what
these files expect. Don't upload one file at a time across multiple visits;
it works, just select everything together if you can, to save yourself trips.

## Pages
- `index.html` — About/History (public)
- `leadership.html` — Leadership directory (public)
- `register.html` — Register (single form: account + member profile) / Sign in
- `ministry-groups.html` — Ministry groups (members only)
- `chat.html` — Ask ASF, FAQ chatbot (members only)
- `admin.html` — Admin: member list + CSV export + announcements (GS/AGS only)
- `announcements.html` — Announcements board (members only)

## How it's connected to Supabase
`js/supabase-client.js` already has your project URL and publishable (anon)
key filled in — that key is safe to expose in frontend code, it's designed
for that. No `.env` file, no build variables needed.

## Deploying (Netlify or Vercel)
This is a static site — there is **no build command**. When importing the
repo:
- Framework preset: **Other** / **No framework**
- Build command: leave **empty**
- Output/publish directory: `.` (the repo root)

A `netlify.toml` is included that sets this automatically for Netlify. On
Vercel, since there's no `package.json`, it should auto-detect as static and
skip the build step entirely — that's what was causing your earlier
"Command npm run build exited with 1" error with the React version.

## Supabase setup
1. In the Supabase SQL editor, run `supabase/schema.sql` once.
2. Register through the site (you, then the GS).
3. In Supabase's Table Editor → `members` table, set your `role` (and the
   GS's) to `admin`. There's no self-service admin signup — intentional.
4. **For password reset to work**: Supabase dashboard → Authentication →
   URL Configuration → add your live site's `reset-password.html` URL
   (e.g. `https://yoursite.vercel.app/reset-password.html`) to Redirect
   URLs. Without this, the reset email link won't be allowed to load.

## v1.1 updates (this batch)
- Self-service password reset (`register.html` → "Forgot your password?" → `reset-password.html`)
- `profile.html` — members can view/edit their own details without asking an admin
- Admin page: search/filter members, one-click "Make admin" button, birthdays-this-month card
- Ministry Groups page highlights the signed-in member's own group
- Open Graph tags + `manifest.json` so shared links preview nicely and the site can be added to a phone home screen
  — **update the `og:image` placeholder URL in every HTML file's `<head>` once you have your final domain**
- See `supabase-updates/v1.1-updates.sql` for the one small database change this batch needs (an index, not a policy change)

## Adding/updating leader photos
Photos live in `leaders/`. To change one, replace the file (keep the same
name) or add a new file and update the matching `photo` / `leadPhoto` /
`asstPhoto` field in `js/leaders-data.js`.

## Backup / export
Admins can export the full member list as CSV from the Admin page. Supabase
also keeps its own automatic backups on paid tiers — see the notes at the
bottom of `supabase/schema.sql`.

## What's deferred to v2 (by design)
DSS tracker, events calendar, prayer wall, giving page, electoral/nomination
portal, registration-approval gating.
