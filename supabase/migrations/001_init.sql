-- Japan itinerary schema. Run this in the Supabase SQL editor.

create table segments (
  id text primary key,
  position int not null,
  code text not null,
  phase text,
  name text not null,
  jp text,
  date_start text,
  date_end text,
  nights int not null default 0,
  travelers int not null default 0,
  color text not null,
  stay text,
  stay_note text,
  climate text,
  mosque text,
  transit_icon text,
  transit_html text
);

create table days (
  id uuid primary key default gen_random_uuid(),
  segment_id text not null references segments(id) on delete cascade,
  position int not null,
  date text not null,
  dow text,
  title text,
  note text
);

create table activities (
  id uuid primary key default gen_random_uuid(),
  day_id uuid not null references days(id) on delete cascade,
  position int not null,
  time text,
  title text not null,
  type text not null default 'sight',
  area text,
  note text,
  map_url text,
  image_url text,
  halal boolean not null default false,
  book boolean not null default false,
  booked boolean not null default false,
  opt boolean not null default false,
  updated_at timestamptz not null default now()
);

-- Secret-link access model: the site URL is the only gate, so the anon role
-- gets full CRUD. Anyone who has the link (and thus the publishable key in the
-- JS bundle) can edit — accepted tradeoff for a private friend-group tool.
--
-- The publishable key (sb_publishable_...) resolves to the `anon` Postgres role
-- for unauthenticated requests, so these policies are what govern it.
alter table segments enable row level security;
alter table days enable row level security;
alter table activities enable row level security;

create policy anon_all_segments on segments for all to anon using (true) with check (true);
create policy anon_all_days on days for all to anon using (true) with check (true);
create policy anon_all_activities on activities for all to anon using (true) with check (true);

alter publication supabase_realtime add table segments, days, activities;
