# Japan Itinerary

A shared, editable trip plan for Japan (Oct 29 – Nov 16). Everyone with the link
sees the same itinerary and can add, edit, delete and reorder events — changes
save to Supabase and appear on everyone else's screen within about a second.

Built with Next.js (App Router) + Supabase. There is no custom backend: the
browser talks to Supabase directly.

## Setup

1. **Create a Supabase project** at [supabase.com](https://supabase.com) (the free tier is plenty).

2. **Create the tables.** In the Supabase dashboard → SQL Editor, run each file
   in `supabase/migrations/` once, in filename order.

   Migrations are append-only: once a file has been run against your database,
   don't edit it — add a new numbered file instead. If you've already run `001`
   and a new file appears here later, you only need to run the new one.

3. **Add your keys.** Copy `.env.example` to `.env.local` and fill in the values
   from Project Settings → API Keys:

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
   ```

   Use the **publishable** key (`sb_publishable_…`), not the legacy `anon` JWT
   key — Supabase is
   [retiring the legacy keys by the end of 2026](https://supabase.com/docs/guides/getting-started/migrating-to-new-api-keys).
   It has the same privileges as `anon` did and resolves to the same Postgres
   role, so the RLS policies in the migration govern it unchanged. Never put the
   **secret** key (`sb_secret_…`) in this file — it bypasses RLS entirely.

4. **Load the itinerary:**

   ```sh
   npm run seed
   ```

5. **Run it:**

   ```sh
   npm run dev
   ```

## Resetting

`npm run seed` wipes the five seeded stops (cascading to their days and
activities) and reloads the original plan. It is the factory reset — any edits
made in the app are lost. Use the **Export** button first if you want a backup.

## Deploying

Push to GitHub, import the repo at [vercel.com](https://vercel.com), and set the
same two `NEXT_PUBLIC_SUPABASE_*` environment variables (URL and publishable
key) in the Vercel project settings. Share the resulting URL with the group.

## A note on access

There is no login. The URL is the only gate — anyone who has it can view and
edit, and the publishable key is visible in the page source (by design; that key
is safe to expose), so treat the link itself as the secret. That is a deliberate
tradeoff for a small private trip; just don't post the link publicly.

## Images

Each activity can carry an image URL, shown as a thumbnail on its card. The
seeded ones point at Wikimedia Commons. To change one, hit ✎ on a card and paste
any image URL — it updates for everyone. Broken or missing images fall back to a
plain placeholder.

Note: Wikimedia only serves a fixed set of thumbnail widths. `500px-` works;
`640px-` returns HTTP 400. Keep that in mind if you add Wikimedia URLs by hand.

## Layout of the code

```
app/          layout, page shell, the full stylesheet
components/   TripApp (state, mutations, realtime) + presentational pieces
lib/          supabase client, TypeScript types, all DB queries
scripts/      seed data (ported from the original) + seed runner
supabase/     the SQL migration
reference/    the original single-file version, kept for comparison
```
