'use server';

import { sql } from './db';
import type { Place, PlaceInput } from './types';

// Server Actions for the "Places to go" list. Same shape as lib/trip.ts:
// raw tagged-template SQL, integer `position` for ordering, one HTTP
// transaction whenever two rows must stay consistent.

export async function fetchPlaces(): Promise<Place[]> {
  return (await sql`select * from places order by position`) as unknown as Place[];
}

export async function insertPlace(input: PlaceInput) {
  await sql`
    insert into places
      (position, title, type, area, note, map_url, image_url, halal)
    values (
      (select coalesce(max(position), -1) + 1 from places),
      ${input.title}, ${input.type}, ${input.area}, ${input.note},
      ${input.map_url}, ${input.image_url}, ${input.halal}
    )`;
}

export async function updatePlace(id: string, input: PlaceInput) {
  await sql`
    update places set
      title = ${input.title}, type = ${input.type}, area = ${input.area},
      note = ${input.note}, map_url = ${input.map_url},
      image_url = ${input.image_url}, halal = ${input.halal}
    where id = ${id}`;
}

export async function deletePlace(id: string) {
  await sql`delete from places where id = ${id}`;
}

export async function swapPlaces(a: Place, b: Place) {
  await sql.transaction([
    sql`update places set position = ${b.position} where id = ${a.id}`,
    sql`update places set position = ${a.position} where id = ${b.id}`,
  ]);
}

// Move a place onto a specific day: insert it as an activity (schedule-only
// fields default: time '', book/opt false) then drop it from the list — both
// in one transaction so it can never exist in both places or neither.
export async function addPlaceToItinerary(placeId: string, dayId: string) {
  await sql.transaction([
    sql`
      insert into activities
        (day_id, position, time, title, type, area, note, map_url, image_url, halal, book, opt)
      select
        ${dayId},
        (select coalesce(max(position), -1) + 1 from activities where day_id = ${dayId}),
        '', p.title, p.type, p.area, p.note, p.map_url, p.image_url, p.halal, false, false
      from places p where p.id = ${placeId}`,
    sql`delete from places where id = ${placeId}`,
  ]);
}
