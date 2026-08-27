'use server';

import { sql } from './db';
import type { Activity, ActivityInput, Day, Segment } from './types';

// These run on the server (Next.js Server Actions) and are the only code that
// touches the database. The client in components/TripApp.tsx imports and calls
// them like normal async functions; Next.js turns each call into a POST.

export async function fetchTrip(): Promise<Segment[]> {
  // Three flat, ordered reads, then assembled into the segments→days→activities
  // tree in JS. Simpler and cheaper than a nested join for a dataset this size.
  const [segments, days, activities] = (await Promise.all([
    sql`select * from segments order by position`,
    sql`select * from days order by position`,
    sql`select * from activities order by position`,
  ])) as unknown as [Segment[], Day[], Activity[]];

  const actsByDay = new Map<string, Activity[]>();
  for (const a of activities) {
    (actsByDay.get(a.day_id) ?? actsByDay.set(a.day_id, []).get(a.day_id)!).push(
      a
    );
  }

  const daysBySegment = new Map<string, Day[]>();
  for (const d of days) {
    d.activities = actsByDay.get(d.id) ?? [];
    (
      daysBySegment.get(d.segment_id) ??
      daysBySegment.set(d.segment_id, []).get(d.segment_id)!
    ).push(d);
  }

  for (const s of segments) s.days = daysBySegment.get(s.id) ?? [];
  return segments;
}

export async function insertActivity(dayId: string, input: ActivityInput) {
  await sql`
    insert into activities
      (day_id, position, time, title, type, area, note, map_url, image_url, halal, book, opt)
    values (
      ${dayId},
      (select coalesce(max(position), -1) + 1 from activities where day_id = ${dayId}),
      ${input.time}, ${input.title}, ${input.type}, ${input.area}, ${input.note},
      ${input.map_url}, ${input.image_url}, ${input.halal}, ${input.book}, ${input.opt}
    )`;
}

export async function updateActivity(id: string, input: ActivityInput) {
  await sql`
    update activities set
      time = ${input.time}, title = ${input.title}, type = ${input.type},
      area = ${input.area}, note = ${input.note}, map_url = ${input.map_url},
      image_url = ${input.image_url}, halal = ${input.halal}, book = ${input.book},
      opt = ${input.opt}, updated_at = now()
    where id = ${id}`;
}

export async function deleteActivity(id: string) {
  await sql`delete from activities where id = ${id}`;
}

export async function swapActivities(a: Activity, b: Activity) {
  // Both writes in one HTTP transaction so positions can never end up crossed.
  await sql.transaction([
    sql`update activities set position = ${b.position} where id = ${a.id}`,
    sql`update activities set position = ${a.position} where id = ${b.id}`,
  ]);
}

export async function insertDay(segmentId: string) {
  await sql`
    insert into days (segment_id, position, date, dow, title, note)
    values (
      ${segmentId},
      (select coalesce(max(position), -1) + 1 from days where segment_id = ${segmentId}),
      'New day', '', 'Untitled', ''
    )`;
}

export async function setBooked(id: string, booked: boolean) {
  await sql`update activities set booked = ${booked} where id = ${id}`;
}
