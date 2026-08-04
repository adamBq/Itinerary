/**
 * Loads the itinerary into Supabase. Idempotent — rerunning wipes and reloads,
 * so this doubles as a factory reset.
 *
 *   npx tsx scripts/seed.ts
 */
import { createClient } from '@supabase/supabase-js';
import { SEED } from './seed-data';

// tsx doesn't auto-load .env.local (Node >= 20.12).
process.loadEnvFile('.env.local');

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
if (!url || !key) {
  console.error(
    'Missing NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in .env.local'
  );
  process.exit(1);
}

const supabase = createClient(url, key);

function die(step: string, error: unknown): never {
  console.error(`✗ ${step}:`, error);
  process.exit(1);
}

async function main() {
  const ids = SEED.map((s) => s.id);

  // Cascade deletes days + activities.
  const del = await supabase.from('segments').delete().in('id', ids);
  if (del.error) die('wiping existing segments', del.error);

  const segRows = SEED.map(({ days, ...rest }, i) => {
    void days; // days are inserted separately, below
    return { ...rest, position: i, is_terminus: rest.is_terminus ?? false };
  });
  const segIns = await supabase.from('segments').insert(segRows);
  if (segIns.error) die('inserting segments', segIns.error);

  let dayCount = 0;
  let actCount = 0;

  for (const seg of SEED) {
    const dayRows = seg.days.map((d, i) => ({
      segment_id: seg.id,
      position: i,
      date: d.date,
      dow: d.dow,
      title: d.title,
      note: d.note,
    }));
    const dayIns = await supabase.from('days').insert(dayRows).select('id');
    if (dayIns.error) die(`inserting days for ${seg.id}`, dayIns.error);

    const dayIds = dayIns.data!.map((r) => r.id);
    dayCount += dayIds.length;

    const actRows = seg.days.flatMap((d, di) =>
      d.activities.map((a, ai) => ({
        day_id: dayIds[di],
        position: ai,
        time: a.time,
        title: a.title,
        type: a.type,
        area: a.area,
        note: a.note,
        map_url: a.map_url,
        image_url: a.image_url,
        halal: a.halal ?? false,
        book: a.book ?? false,
        opt: a.opt ?? false,
      }))
    );
    if (actRows.length) {
      const actIns = await supabase.from('activities').insert(actRows);
      if (actIns.error) die(`inserting activities for ${seg.id}`, actIns.error);
      actCount += actRows.length;
    }
  }

  console.log(
    `✓ Seeded ${SEED.length} segments, ${dayCount} days, ${actCount} activities`
  );
}

main();
