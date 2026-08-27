-- Japan itinerary schema for Neon (plain Postgres).
-- Apply with:  psql "$DATABASE_URL" -f scripts/schema.sql
-- or paste into the Neon SQL editor. Safe to re-run.

create table if not exists segments (
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
  transit_html text,
  is_terminus boolean not null default false
);

create table if not exists days (
  id uuid primary key default gen_random_uuid(),
  segment_id text not null references segments(id) on delete cascade,
  position int not null,
  date text not null,
  dow text,
  title text,
  note text
);

create table if not exists activities (
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
