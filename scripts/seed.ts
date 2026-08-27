/**
 * Loads the itinerary into Neon (Postgres). Idempotent — rerunning wipes the
 * seeded segments (days + activities cascade) and reloads, so this doubles as a
 * factory reset.
 *
 *   npx tsx scripts/seed.ts
 */
import { neon } from '@neondatabase/serverless';
import { SEED } from './seed-data';

// tsx doesn't auto-load .env.local (Node >= 20.12).
process.loadEnvFile('.env.local');

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('Missing DATABASE_URL in .env.local');
  process.exit(1);
}

const sql = neon(url);

async function main() {
  const ids = SEED.map((s) => s.id);

  // Cascade deletes days + activities.
  await sql`delete from segments where id = any(${ids})`;

  let dayCount = 0;
  let actCount = 0;

  for (const [i, seg] of SEED.entries()) {
    const { days, ...s } = seg;
    await sql`
      insert into segments
        (id, position, code, phase, name, jp, date_start, date_end, nights,
         travelers, color, stay, stay_note, climate, mosque, transit_icon,
         transit_html, is_terminus)
      values (
        ${s.id}, ${i}, ${s.code}, ${s.phase ?? null}, ${s.name}, ${s.jp ?? null},
        ${s.date_start ?? null}, ${s.date_end ?? null}, ${s.nights ?? 0},
        ${s.travelers ?? 0}, ${s.color}, ${s.stay ?? null}, ${s.stay_note ?? null},
        ${s.climate ?? null}, ${s.mosque ?? null}, ${s.transit_icon ?? null},
        ${s.transit_html ?? null}, ${s.is_terminus ?? false}
      )`;

    for (const [di, d] of days.entries()) {
      const [{ id: dayId }] = (await sql`
        insert into days (segment_id, position, date, dow, title, note)
        values (${seg.id}, ${di}, ${d.date}, ${d.dow ?? null}, ${d.title ?? null}, ${d.note ?? null})
        returning id`) as { id: string }[];
      dayCount++;

      for (const [ai, a] of d.activities.entries()) {
        await sql`
          insert into activities
            (day_id, position, time, title, type, area, note, map_url,
             image_url, halal, book, opt)
          values (
            ${dayId}, ${ai}, ${a.time ?? null}, ${a.title}, ${a.type},
            ${a.area ?? null}, ${a.note ?? null}, ${a.map_url ?? null},
            ${a.image_url ?? null}, ${a.halal ?? false}, ${a.book ?? false},
            ${a.opt ?? false}
          )`;
        actCount++;
      }
    }
  }

  console.log(
    `✓ Seeded ${SEED.length} segments, ${dayCount} days, ${actCount} activities`
  );
}

main().catch((e) => {
  console.error('✗ Seed failed:', e);
  process.exit(1);
});
