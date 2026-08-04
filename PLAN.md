# Implementation Plan — Japan Itinerary → Next.js + Supabase

> **STATUS: executed.** This is a historical handoff document; see `README.md`
> for current setup. One decision changed during execution: the app now uses the
> **publishable** key (`sb_publishable_…`) via
> `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, not the legacy `anon` JWT key that
> this document refers to throughout.

Execution handoff document. The architecture was approved by the user; scaffolding is already done.
Execute the remaining steps **in order**. Do not re-litigate decisions marked **[DECIDED]**.

## 0. Decisions already made [DECIDED]

- Next.js App Router + TypeScript on Vercel; **no custom server, no Next API routes**. All data access from the browser via `@supabase/supabase-js` with the anon key.
- Supabase Postgres + Realtime. Secret-link access model: anon RLS policies allow full CRUD (accepted tradeoff, noted in README).
- Concurrency: last-write-wins. Sync model: optimistic local update → supabase call → realtime `postgres_changes` triggers a debounced (~150 ms) full refetch. No client-side merging.
- **No Tailwind, no CSS modules.** The original stylesheet is ported nearly verbatim into `app/globals.css`; class names map 1:1 to JSX.
- Images: plain `<img loading="lazy" referrerPolicy="no-referrer">` with `object-fit:cover`, NOT `next/image`. Broken/missing URLs degrade to no-thumbnail.
- Segments are **seeded-only** (no edit UI). Days are add-only. Activities are full CRUD.
- Ordering: integer `position` column; move = swap two rows' positions; insert = `max+1`.
- Preserve the existing visual design language (palette, fonts, route ribbon). The activity-card restructure is a readability restyle, not a redesign.

## 1. Current state (already done — do not redo)

- `reference/japan-itinerary.html` — the original single-file app. **Source of truth for porting**: CSS at lines 7–232, HTML shells at 236–306, `TYPES`+`INITIAL` data at lines 310–516, behaviors at 522–783.
- Next.js scaffolded in repo root (create-next-app, TS, App Router, no Tailwind, npm). Git repo initialized by create-next-app. Deps installed: `@supabase/supabase-js`, dev `tsx`.
- `supabase/migrations/001_init.sql` — complete schema (segments/days/activities, anon RLS `anon_all_*` policies, realtime publication). Done; don't modify.
- `.env.example` — `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- `lib/types.ts` — `ActivityType`, `TYPES` color map, `Activity`, `Day`, `Segment`, `ActivityInput` interfaces (DB column names: snake_case, e.g. `map_url`, `image_url`, `day_id`).
- `lib/supabase.ts` — client singleton.
- `lib/trip.ts` — `fetchTrip()` (nested select ordered by position at all 3 levels), `insertActivity`, `updateActivity`, `deleteActivity`, `swapActivities`, `insertDay`, `setBooked`.
- Task list in the harness: tasks #3 (seed) → #7 (verify) remain.

`app/page.tsx`, `app/layout.tsx`, `app/globals.css`, `app/page.module.css` are still create-next-app boilerplate — replace them (delete `page.module.css`).

## 2. Finish image curation (task #3, first half)

A Wikipedia REST `page/summary` sweep already resolved these 640px thumbs — **use them as-is**:

| Wiki title | image_url |
|---|---|
| Sensō-ji | https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/Sensoji_2023.jpg/640px-Sensoji_2023.jpg |
| Sushi | https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/Sushi_platter.jpg/640px-Sushi_platter.jpg |
| Kappabashi-dori | https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Kappabashi-dori_streetcorner_%28Kitchen_town_-_southern_end%29_Tokyo_Japan.jpg/640px-Kappabashi-dori_streetcorner_%28Kitchen_town_-_southern_end%29_Tokyo_Japan.jpg |
| Japanese cuisine | https://upload.wikimedia.org/wikipedia/commons/thumb/5/57/Oseti.jpg/640px-Oseti.jpg |
| Tokyo National Museum | https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Tokyo_National_Museum%2C_Honkan_2010.jpg/640px-Tokyo_National_Museum%2C_Honkan_2010.jpg |
| Ameya-Yokochō | https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Ueno_20241210_133139.jpg/640px-Ueno_20241210_133139.jpg |
| Akihabara | https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/Sotokanda%2C_Akihabara_Electric_Town_at_night_20231114.png/640px-Sotokanda%2C_Akihabara_Electric_Town_at_night_20231114.png |
| Meiji Shrine | https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/Meiji_Jingu_2023-3.jpg/640px-Meiji_Jingu_2023-3.jpg |
| Takeshita Street | https://upload.wikimedia.org/wikipedia/commons/thumb/b/bd/JRE-Harajuku-Station-07.jpg/640px-JRE-Harajuku-Station-07.jpg |
| Shibuya Crossing | https://upload.wikimedia.org/wikipedia/commons/thumb/8/88/Shibuya_Crossing%2C_Aerial.jpg/640px-Shibuya_Crossing%2C_Aerial.jpg |
| Odaiba | https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Odaiba_close_up_-_2025_Jan_14_01-27PM.jpeg/640px-Odaiba_close_up_-_2025_Jan_14_01-27PM.jpeg |
| Mount Fuji | https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/View_of_Mount_Fuji_from_%C5%8Cwakudani_20211202.jpg/640px-View_of_Mount_Fuji_from_%C5%8Cwakudani_20211202.jpg |
| Kamo River | https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Kamogawa_sakura.jpg/640px-Kamogawa_sakura.jpg |
| Yakiniku | https://upload.wikimedia.org/wikipedia/commons/thumb/b/b7/Yakiniku_002.jpg/640px-Yakiniku_002.jpg |
| Fushimi Inari-taisha | https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Torii_path_with_lantern_at_Fushimi_Inari_Taisha_Shrine%2C_Kyoto%2C_Japan.jpg/640px-Torii_path_with_lantern_at_Fushimi_Inari_Taisha_Shrine%2C_Kyoto%2C_Japan.jpg |
| Kiyomizu-dera | https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Kiyomizu.jpg/640px-Kiyomizu.jpg |
| Gion | https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/150124_Gion_Kyoto_Japan01s3.jpg/640px-150124_Gion_Kyoto_Japan01s3.jpg |
| Nishiki Market | https://upload.wikimedia.org/wikipedia/commons/thumb/c/ce/Nishiki_Ichiba_by_matsuyuki.jpg/640px-Nishiki_Ichiba_by_matsuyuki.jpg |
| Ramen | https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Shoyu_Ramen%EF%BC%88Tokyo_Ramen%EF%BC%89_-_01.jpg/640px-Shoyu_Ramen%EF%BC%88Tokyo_Ramen%EF%BC%89_-_01.jpg |
| Osaka Castle | https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Osaka_Castle_03bs3200.jpg/640px-Osaka_Castle_03bs3200.jpg |
| Dōtonbori | https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/Osaka_Dotonbori_Ebisu_Bridge.jpg/640px-Osaka_Dotonbori_Ebisu_Bridge.jpg |
| Izakaya | https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Izakaya_Exterior_Gotanda.jpg/640px-Izakaya_Exterior_Gotanda.jpg |
| Arashiyama | https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/Arashiyama%2C_Part_II_-_Arashiyama7534.jpg/640px-Arashiyama%2C_Part_II_-_Arashiyama7534.jpg |
| Kinkaku-ji | https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Golden_Pavilion_Kinkaku-ji_water_mirror_2024.jpg/640px-Golden_Pavilion_Kinkaku-ji_water_mirror_2024.jpg |
| Hiroshima Peace Memorial (A-Bomb Dome) | https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/Genbaku_Dome04-r.JPG/640px-Genbaku_Dome04-r.JPG |
| Hiroshima Peace Memorial Park | https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/20181111_Hiroshima_Memorial_Cenotaph-1.jpg/640px-20181111_Hiroshima_Memorial_Cenotaph-1.jpg |
| Okonomiyaki | https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/Okonomiyaki_001.jpg/640px-Okonomiyaki_001.jpg |
| Itsukushima Shrine | https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/Itsukushima_Shrine_Torii_Gate_%2813890465459%29.jpg/640px-Itsukushima_Shrine_Torii_Gate_%2813890465459%29.jpg |
| Kabukichō | https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/Kabukicho_red_gate_and_colorful_neon_street_signs_at_night%2C_Shinjuku%2C_Tokyo%2C_Japan.jpg/640px-Kabukicho_red_gate_and_colorful_neon_street_signs_at_night%2C_Shinjuku%2C_Tokyo%2C_Japan.jpg |
| Shinjuku Gyoen | https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/Shinjuku_Gyoen_National_Garden_-_sakura_3.JPG/640px-Shinjuku_Gyoen_National_Garden_-_sakura_3.JPG |
| Tokyo Camii | https://upload.wikimedia.org/wikipedia/commons/thumb/2/25/Tokyo_Camii_2009.jpg/640px-Tokyo_Camii_2009.jpg |

**Still unresolved** (REST summary had no thumbnail). Retry with the pageimages API, which follows redirects:

```
curl -s "https://en.wikipedia.org/w/api.php?action=query&format=json&prop=pageimages&piprop=thumbnail&pithumbsize=640&redirects=1&titles=Ry%C5%8Dgoku%20Kokugikan|Omoide%20Yokocho|Shinjuku|Tsukiji|Ginza|TeamLab|Nakano%20Broadway|K%C5%8Dtoku-in|Lake%20Kawaguchi|Wagyu|Arakurayama%20Sengen%20Park|Oshino%20Hakkai|Kachi%20Kachi%20Ropeway|Kebab|Lake%20Sai|Narusawa%20Ice%20Cave|Lake%20Motosu|H%C5%8Dt%C5%8D|Nikk%C5%8D%20T%C5%8Dsh%C5%8D-g%C5%AB|Hakone|Shibuya"
```

(Max ~50 titles per call; this fits in one.) For any title still without a thumbnail after that, search Wikimedia Commons (`https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=<term>&gsrlimit=5&prop=imageinfo&iiprop=url&iiurlwidth=640&format=json`) and hand-pick a sensible photo. As a last resort an activity may ship with `image_url: null` — the card degrades gracefully. **Verify every final URL returns 200 via `curl -sI`** before baking into seed data.

### Activity → wiki-title assignment

Transit/logistics/free-buffer rows get `null` (no image). Everything else maps as follows (titles reference the tables above; reuse the same URL where a title repeats):

- **Tokyo I**: check-in → null · Naritaya Halal Ramen → Ramen · Sensō-ji → Sensō-ji · Sushiken → Sushi · Kappabashi → Kappabashi-dori · Ryōgoku sumo → Ryōgoku Kokugikan · Sankyu Halal → Japanese cuisine · Ueno Park/Museum → Tokyo National Museum · Ameyoko → Ameya-Yokochō · Akihabara → Akihabara · Okachimachi halal dinner → Kebab · Meiji Shrine → Meiji Shrine · Takeshita St → Takeshita Street · Shibuya Sky → Shibuya Crossing · Omoide Yokocho + Shinjuku Tei → Omoide Yokocho (fallback Ramen) · Tsukiji breakfast → Tsukiji · Ginza → Ginza · teamLab Planets → TeamLab (any variant) · Gundam/Rainbow Bridge → Odaiba · Option A gaming crawl → Nakano Broadway · Option B Kamakura → Kōtoku-in · pack/checkout → null
- **Kawaguchiko**: check-in → null · Maple Corridor → Lake Kawaguchi · IDATEN BETTEI → Wagyu · sunrise lakeshore → Mount Fuji · Chureito Pagoda → Arakurayama Sengen Park (the pagoda) · Oshino Hakkai → Oshino Hakkai · Ropeway + Oishi Park → Kachi Kachi Ropeway · Aladdin kebab → Kebab · Saiko Iyashi-no-Sato → Lake Sai · Jumu'ah → null · Ice/Wind cave → Narusawa Ice Cave · Lake Motosu → Lake Motosu · HOUTO LABO → Hōtō · return car → null
- **Kyoto**: check-in/Kamo walk → Kamo River · GYUMON → Yakiniku · Fushimi Inari → Fushimi Inari-taisha · Kiyomizu-dera → Kiyomizu-dera · Gion → Gion · Nishiki Market → Nishiki Market · halal yakiniku dinner → Ramen · Osaka Castle → Osaka Castle · Dōtonbori → Dōtonbori · Tsuki no Odori → Izakaya · Bamboo Grove → Arashiyama · Kinkaku-ji → Kinkaku-ji · optional-Hiroshima-swap row → null · checkout → null
- **Hiroshima**: all Shinkansen/flight/bus rows → null · Peace Park & Museum (both options) → Hiroshima Peace Memorial Park (Option 1) / A-Bomb Dome image (Option 2 — vary them) · Okonomiyaki → Okonomiyaki · Miyajima ferry → Itsukushima Shrine
- **Tokyo II**: Kabukichō walk → Kabukichō · Shinjuku Tei → Ramen · Shinjuku Gyoen → Shinjuku Gyoen · Tokyo Camii (both rows) → Tokyo Camii · teamLab-if-skipped → TeamLab · Nikkō → Nikkō Tōshō-gū · Hakone → Hakone · Nakano Broadway cameras → Nakano Broadway · Shibuya/Ginza flagships → Shibuya · flex day → null · farewell dinner → Japanese cuisine · airport → null

## 3. `scripts/seed-data.ts` (task #3, second half)

Hand-port `INITIAL` from `reference/japan-itinerary.html` lines 324–516 into typed TS. **Port ALL segments, days, and activities verbatim** (titles, times, notes, flags) — including all three Hiroshima "Option" days. Transforms:

- Drop `uid()` — DB generates ids. Segments keep their literal ids: `tokyo1`, `kawa`, `kyoto`, `hiro`, `tokyo2`.
- Expand `M+'query'` → `https://www.google.com/maps/search/?api=1&query=query`; rename `map` → `map_url`; empty string → `null`.
- `transitIn: {ic, html}` → `transit_icon`, `transit_html` (keep the HTML strings verbatim, they contain `<b>` tags).
- snake_case columns: `dateStart→date_start`, `dateEnd→date_end`, `stayNote→stay_note`.
- `position` = array index at every level.
- Add `image_url` per the §2 assignment table.
- Shape: `export const SEED: SeedSegment[]` where days omit ids and nest activities. Define local seed types (segment/day/activity minus generated ids).
- `color` keeps literal `var(--tokyo)` etc. strings — globals.css defines those custom properties.

## 4. `scripts/seed.ts`

Run with `npx tsx scripts/seed.ts`. Reads `.env.local` manually (parse the file with `fs` — tsx doesn't auto-load it; a tiny parser or `process.loadEnvFile('.env.local')` on Node ≥20.12 works). Then:

1. `delete from segments` where id in seed ids (cascade wipes days/activities) — makes it idempotent; doubles as factory reset.
2. Insert all segments (batch), then per segment insert days with `.select()` to get generated ids, then batch-insert activities mapped to their day ids.
3. Log row counts; exit non-zero on any error.

## 5. UI port (task #4)

### `app/layout.tsx`
`next/font/google`: Bricolage Grotesque (weights 600–800), Zen Kaku Gothic New (400/500/700), JetBrains Mono (400/500/700), each with `variable:` CSS custom property (`--font-bricolage`, `--font-zen`, `--font-mono`), classes on `<html>`. Metadata title: `Japan · Oct 29 – Nov 16`. Import `./globals.css`.

### `app/globals.css`
Port reference lines 7–232 verbatim, EXCEPT: delete the `@import url(fonts…)` line; replace every `'Bricolage Grotesque'` → `var(--font-bricolage)`, `'Zen Kaku Gothic New'` → `var(--font-zen)`, `'JetBrains Mono',monospace` → `var(--font-mono)`. Keep every class name unchanged. Append new styles needed by §6 (thumb, expand, controls-on-hover) at the bottom under a `/* ---- v2 additions ---- */` banner.

### `app/page.tsx`
Server component: `import TripApp from '@/components/TripApp'; export default () => <TripApp/>`.

### Components (`components/`)
All render the same class names as the original HTML so the ported CSS applies. React escapes text automatically (the original `esc()` is unnecessary). Only `transit_html` uses `dangerouslySetInnerHTML` — safe because it is seeded-only, never user-editable (leave a comment saying exactly that).

- **`TripApp.tsx`** (`'use client'`, the only stateful root): state = `segments: Segment[] | null`, `activeTypes: Set<ActivityType>`, `collapsed: Set<string>`, modal state (`{mode:'add', day} | {mode:'edit', day, activity} | null`), bookings-open flag, toast string. On mount: `fetchTrip()`; realtime channel `postgres_changes` `event:'*', schema:'public'` (one listener per table) → debounced 150 ms `fetchTrip()`; cleanup `supabase.removeChannel` on unmount. All mutations live here (see §6 flows) and are passed down as props. Renders Masthead, RouteRibbon, Toolbar, `segments.map(<Segment/>)`, footer, modals, toast. Loading state: simple centered mono "loading…" until first fetch resolves; error state with retry button.
- **`Masthead.tsx`**: port of masthead + `renderStats` (stops/nights/days/activities counts computed from props; keep the `7→5 Travellers` and `حلال` stats). Subtitle trimmed to ONE line: "Oct 29 – Nov 16 · five stops, two group sizes, one maple season. Tap any card for details — edits save for everyone, live." (drop the export copy — obsolete).
- **`RouteRibbon.tsx`**: port of `renderRoute`; click scrolls to `document.getElementById(seg.id)`.
- **`Toolbar.tsx`**: filter chips from `TYPES` (aria-pressed + muted class from `activeTypes`), Bookings, Export (downloads fetched trip as JSON — port of btnExport), Print (`window.print()`). **Drop Import and Reset buttons entirely.**
- **`Segment.tsx`**: port of `segmentHTML` — seg-head (code/phase/pax/collapse toggle), title+jp, meta rows (Stay/Weather/Prayer), transit note, days list, "+ Add a day" button. Transit note: render first sentence only (split on first `. ` of the text content) with a "more" toggle expanding to the full `transit_html` — collapsed/expanded is local `useState`.
- **`Day.tsx`**: port of `dayHTML` — day head (date/dow/title/note), activities list, "+ Add activity to {date}" button.
- **`ActivityCard.tsx`**: restructured per §6.
- **`ActivityModal.tsx`**: port of the activity modal — fields time/title/type/area/note/map_url + **new Image URL field with a live 64px thumbnail preview** (`onError` hides preview) + halal/book/opt checkboxes. Controlled inputs initialized from the activity being edited (or blanks). Save disabled/no-op when title empty; Escape and backdrop click close (port of closeModals behavior).
- **`BookingsModal.tsx`**: port of checklist modal, grouped by segment with `--gc` color; checkboxes are **controlled by `activity.booked`** and call `setBooked` (shared state — this replaces the old ephemeral checkboxes).
- Toast: fixed div + 1.8 s timeout, same `.toast.on` classes, managed in TripApp.

## 6. Mutations + realtime flows (task #5) and compact-card restyle (task #6)

Every mutation: **optimistically mutate local state** (clone via `structuredClone` or immutable spread), fire the `lib/trip.ts` call; on error → toast "Couldn't save — retrying fetch" + `fetchTrip()` to roll back. The realtime refetch reconciles everything else.

- Save (add): `insertActivity(day, input)` · Save (edit): `updateActivity(id, input)` · Delete: `confirm('Delete this activity?')` then `deleteActivity` · Move: `swapActivities(a, neighbor)` — buttons disabled at top/bottom · Add day: `insertDay(segment)` then scroll segment into view + toast · Booked toggle: `setBooked`.

**ActivityCard layout** (readability restyle — same tokens/palette): grid `56px thumb | 58px time | 1fr body | auto controls`. Collapsed (default) shows: thumb (rounded 8px, `object-fit:cover`, hidden if no/broken `image_url`), time, title, type tag + area + halal/book/opt badges. Long `note` + map link live in an expandable region — card click (or chevron) toggles, `max-height` CSS transition, `aria-expanded`. Controls (▲▼✎✕) appear on hover (desktop) / always on touch via the existing `@media (max-width:620px)` fallback pattern. Card click must NOT trigger when clicking controls/links (check `e.target.closest`). Print stylesheet: expand all notes, hide thumbs/controls (extend existing `@media print` block).

Filters: chips toggle membership in `activeTypes`; cards with inactive types get `display:none` (same as original). Filter/collapse state is client-local, never persisted.

## 7. Supabase setup + verification (task #7)

**User-side steps** (present as a short checklist when reached; the user must do these in the browser):
1. Create a project at supabase.com (free tier).
2. SQL editor → paste + run `supabase/migrations/001_init.sql`.
3. Project Settings → API → copy URL + anon key into `.env.local` (copy from `.env.example`).

**Then:**
4. `npx tsx scripts/seed.ts` — verify counts (5 segments, ~29 days, ~60 activities) and spot-check rows in Table Editor.
5. `npm run dev` → walk EVERY mutation, hard-refreshing after each (persistence is the point): add/edit/delete activity, move up/down incl. disabled end states, add day, filters, bookings check/uncheck, export JSON, print preview.
6. Realtime: two browser windows — edit in A appears in B within ~1 s; conflicting saves to the same activity converge to the later write.
7. Images: Wikimedia thumbs render; replacing an image URL in one window shows in the other; a garbage URL degrades to no-thumb.
8. `npm run build` must pass clean.
9. Write `README.md`: what it is, setup (Supabase steps above), seed/reset command, dev/deploy, and the secret-link security tradeoff (anon key ships in the bundle; anyone with the URL can edit — accepted).
10. Deploy: push to GitHub, import repo in Vercel, set the two env vars, deploy, open prod URL on a phone and make one edit to confirm.

Commit at sensible checkpoints (scaffold done at start; then seed, UI port, mutations+realtime, readability, docs) with `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>` (adjust to the executing model).

## Verification summary

The end-state demo: two browser windows on the deployed URL, add "Ghibli Museum" with an image URL in one window → card with thumbnail appears in the other window within a second, survives hard refresh in both.
