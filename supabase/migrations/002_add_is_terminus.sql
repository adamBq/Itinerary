-- Adds the "home" endpoint marker (Sydney) to the route ribbon.
--
-- A terminus is not a stop on the trip: it exists so the final leg (the flight
-- home) has somewhere to draw to. It is skipped in the day-by-day body and in
-- the "stops" count.
--
-- Safe to run on a database that already has 001 applied. Safe to re-run.

alter table segments
  add column if not exists is_terminus boolean not null default false;
