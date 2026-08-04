import { supabase } from './supabase';
import type { Activity, ActivityInput, Day, Segment } from './types';

export async function fetchTrip(): Promise<Segment[]> {
  const { data, error } = await supabase
    .from('segments')
    .select('*, days(*, activities(*))')
    .order('position')
    .order('position', { referencedTable: 'days' })
    .order('position', { referencedTable: 'days.activities' });
  if (error) throw error;
  return (data ?? []) as Segment[];
}

export async function insertActivity(day: Day, input: ActivityInput) {
  const position =
    day.activities.reduce((m, a) => Math.max(m, a.position), -1) + 1;
  const { error } = await supabase
    .from('activities')
    .insert({ day_id: day.id, position, ...input });
  if (error) throw error;
}

export async function updateActivity(id: string, input: ActivityInput) {
  const { error } = await supabase
    .from('activities')
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
}

export async function deleteActivity(id: string) {
  const { error } = await supabase.from('activities').delete().eq('id', id);
  if (error) throw error;
}

export async function swapActivities(a: Activity, b: Activity) {
  const r1 = await supabase
    .from('activities')
    .update({ position: b.position })
    .eq('id', a.id);
  if (r1.error) throw r1.error;
  const r2 = await supabase
    .from('activities')
    .update({ position: a.position })
    .eq('id', b.id);
  if (r2.error) throw r2.error;
}

export async function insertDay(segment: Segment) {
  const position =
    segment.days.reduce((m, d) => Math.max(m, d.position), -1) + 1;
  const { error } = await supabase.from('days').insert({
    segment_id: segment.id,
    position,
    date: 'New day',
    dow: '',
    title: 'Untitled',
    note: '',
  });
  if (error) throw error;
}

export async function setBooked(id: string, booked: boolean) {
  const { error } = await supabase
    .from('activities')
    .update({ booked })
    .eq('id', id);
  if (error) throw error;
}
