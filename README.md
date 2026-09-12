# 🎅 Marques Family Secret Santa

A private Secret Santa site for the Marques family — nine people, exclusion rules, a PIN-based way to check your match, and a shared Christmas wishlist. No email involved anywhere.

Built with Next.js (App Router) + Tailwind, backed by Supabase, deployed on Vercel — all on free tiers.

## How it works

- Everyone picks their name from a list and sets a secret word (a PIN, but a word rather than digits) the first time they visit.
- The moment all nine people have set their word, the draw runs automatically once, respecting the family's exclusion rules, and locks.
- Anyone can come back, pick their name, enter their word, and see who they're buying for.
- Everyone can browse everyone else's wishlist without a PIN; you need your own name + word to add to your own list.
- A separate admin ("sorting master") password lets you reset a stuck person's PIN or force a re-run of the draw.

## One-time setup

### 1. Create a Supabase project (free tier)

1. Go to [supabase.com](https://supabase.com) and create a new project.
2. Once it's ready, open the **SQL Editor** and run the contents of [`db/schema.sql`](db/schema.sql). This creates the tables and seeds the nine participants and exclusion rules.
3. Go to **Project Settings → API** and copy:
   - **Project URL** → `SUPABASE_URL`
   - **service_role key** (not the anon key) → `SUPABASE_SERVICE_ROLE_KEY`

The service role key is powerful — it's only ever used from server-side code in this app (`src/lib/supabaseAdmin.ts`) and must never be exposed to the browser.

### 2. Set environment variables

Copy `.env.local.example` to `.env.local` and fill in:

```
SUPABASE_URL=https://YOUR-PROJECT.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SESSION_SECRET=<long random string>
ADMIN_SESSION_SECRET=<a different long random string>
ADMIN_PASSWORD=<the sorting master's password>
```

Generate random strings with:

```bash
openssl rand -hex 32
```

### 3. Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 4. Deploy to Vercel (free tier)

1. Push this repo to GitHub.
2. In Vercel, "Add New Project" → import the repo.
3. Add the same five environment variables from `.env.local` in the Vercel project's **Settings → Environment Variables**.
4. Deploy. The default `your-project.vercel.app` URL is fine — no custom domain needed.

## Admin access

Visit `/admin/login` and sign in with `ADMIN_PASSWORD`. From there the sorting master can:

- See every participant's PIN/lock status and wishlist item count.
- Reset any participant's PIN (the only way a PIN can change).
- Force a manual re-run of the draw.

Participants never see or reach this page through normal navigation.

## Notes on the rules this implements

- **Exclusions** live in `src/lib/participants.ts` (and are mirrored into the `exclusions` table for reference/troubleshooting).
- **The draw** (`src/lib/draw.ts`) uses backtracking (`src/lib/matching.ts`) to find a provably valid assignment — it does not randomly shuffle and retry. It's triggered automatically the instant the ninth PIN is set, using an atomic conditional update on `draw_state` so it can only ever run once outside of an admin-triggered re-run.
- **PINs** are hashed with bcrypt and never stored or displayed in plain text, including to the sorting master. After 3 wrong attempts in a row, that person is locked out for 1 minute; after 5 wrong attempts total, they're locked out until the sorting master resets them.
