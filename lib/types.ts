export type ActivityType =
  | 'sight'
  | 'food'
  | 'shop'
  | 'nature'
  | 'culture'
  | 'transit'
  | 'free';

// Tag colors carry white text at very small sizes — every value here is
// tuned to keep ≥4.5:1 contrast against #fff.
export const TYPES: Record<ActivityType, { label: string; color: string }> = {
  sight: { label: 'Sight', color: '#A8511C' },
  food: { label: 'Food', color: '#B23A2E' },
  shop: { label: 'Shop', color: '#77601F' },
  nature: { label: 'Nature', color: '#376F46' },
  culture: { label: 'Culture', color: '#6E3A55' },
  transit: { label: 'Transit', color: '#3A3C3F' },
  free: { label: 'Free', color: '#49677A' },
};

export interface Activity {
  id: string;
  day_id: string;
  position: number;
  time: string | null;
  title: string;
  type: ActivityType;
  area: string | null;
  note: string | null;
  map_url: string | null;
  image_url: string | null;
  halal: boolean;
  book: boolean;
  booked: boolean;
  opt: boolean;
}

export interface Day {
  id: string;
  segment_id: string;
  position: number;
  date: string;
  dow: string | null;
  title: string | null;
  note: string | null;
  activities: Activity[];
}

export interface Segment {
  id: string;
  position: number;
  code: string;
  phase: string | null;
  name: string;
  jp: string | null;
  date_start: string | null;
  date_end: string | null;
  nights: number;
  travelers: number;
  color: string;
  stay: string | null;
  stay_note: string | null;
  climate: string | null;
  mosque: string | null;
  transit_icon: string | null;
  transit_html: string | null;
  /** Home / endpoint marker — shown on the route ribbon only. */
  is_terminus: boolean;
  days: Day[];
}

export interface ActivityInput {
  time: string;
  title: string;
  type: ActivityType;
  area: string;
  note: string;
  map_url: string;
  image_url: string;
  halal: boolean;
  book: boolean;
  opt: boolean;
}

// "Places to go" — a place someone wants to visit, not yet scheduled. Fields
// mirror an Activity minus the schedule-only ones (time/book/opt) so a place
// maps directly onto an ActivityInput when promoted into the itinerary.
export interface Place {
  id: string;
  position: number;
  title: string;
  type: ActivityType;
  area: string | null;
  note: string | null;
  map_url: string | null;
  image_url: string | null;
  halal: boolean;
}

export interface PlaceInput {
  title: string;
  type: ActivityType;
  area: string;
  note: string;
  map_url: string;
  image_url: string;
  halal: boolean;
}
