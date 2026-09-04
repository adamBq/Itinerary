'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Masthead from './Masthead';
import RouteRibbon from './RouteRibbon';
import Toolbar from './Toolbar';
import Segment from './Segment';
import ActivityModal from './ActivityModal';
import BookingsModal from './BookingsModal';
import ViewTabs, { type View } from './ViewTabs';
import PlacesView from './PlacesView';
import DayPickerModal from './DayPickerModal';
import * as api from '@/lib/trip';
import * as placesApi from '@/lib/places';
import {
  TYPES,
  type Activity,
  type ActivityInput,
  type ActivityType,
  type Day,
  type Place,
  type PlaceInput,
  type Segment as SegmentT,
} from '@/lib/types';

type ModalState =
  | { mode: 'add'; day: Day }
  | { mode: 'edit'; day: Day; activity: Activity }
  | null;

type PlaceModalState =
  | { mode: 'add' }
  | { mode: 'edit'; place: Place }
  | null;

export default function TripApp() {
  const [segments, setSegments] = useState<SegmentT[] | null>(null);
  const [places, setPlaces] = useState<Place[]>([]);
  const [view, setView] = useState<View>('itinerary');
  const [error, setError] = useState<string | null>(null);
  const [activeTypes, setActiveTypes] = useState<Set<ActivityType>>(
    () => new Set(Object.keys(TYPES) as ActivityType[])
  );
  const [modal, setModal] = useState<ModalState>(null);
  const [placeModal, setPlaceModal] = useState<PlaceModalState>(null);
  const [promoting, setPromoting] = useState<Place | null>(null);
  const [bookingsOpen, setBookingsOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  );

  const toast = useCallback((msg: string) => {
    setToastMsg(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMsg(''), 1800);
  }, []);

  const load = useCallback(async () => {
    try {
      const [trip, pl] = await Promise.all([
        api.fetchTrip(),
        placesApi.fetchPlaces(),
      ]);
      setSegments(trip);
      setPlaces(pl);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load the itinerary.');
    }
  }, []);

  // Initial fetch, plus a refetch whenever the tab regains focus. Neon has no
  // realtime channel, so instead of pushing changes we re-pull on focus — that
  // reconciles edits made from another device/tab the next time you look at
  // this one. A single debounced refetch is the whole reconciliation model.
  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;

    const fetchNow = async () => {
      try {
        const [data, pl] = await Promise.all([
          api.fetchTrip(),
          placesApi.fetchPlaces(),
        ]);
        if (!cancelled) {
          setSegments(data);
          setPlaces(pl);
          setError(null);
        }
      } catch (e) {
        if (!cancelled) {
          setError(
            e instanceof Error ? e.message : 'Could not load the itinerary.'
          );
        }
      }
    };

    fetchNow();

    const refetch = () => {
      clearTimeout(timer);
      timer = setTimeout(fetchNow, 150);
    };
    const onVisible = () => {
      if (document.visibilityState === 'visible') refetch();
    };

    window.addEventListener('focus', refetch);
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      cancelled = true;
      clearTimeout(timer);
      window.removeEventListener('focus', refetch);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);

  /** Applies an optimistic local change, then persists it. Rolls back by refetching. */
  const mutate = useCallback(
    async (
      optimistic: (segs: SegmentT[]) => SegmentT[],
      persist: () => Promise<void>,
      okMsg?: string
    ) => {
      setSegments((s) => (s ? optimistic(structuredClone(s)) : s));
      try {
        await persist();
        if (okMsg) toast(okMsg);
      } catch (e) {
        console.error(e);
        toast("Couldn't save — reloading");
        load();
      }
    },
    [load, toast]
  );

  function saveActivity(input: ActivityInput) {
    const m = modal;
    if (!m) return;
    setModal(null);

    if (m.mode === 'edit') {
      const id = m.activity.id;
      mutate(
        (segs) => {
          for (const s of segs)
            for (const d of s.days) {
              const a = d.activities.find((x) => x.id === id);
              if (a) Object.assign(a, input);
            }
          return segs;
        },
        () => api.updateActivity(id, input),
        'Saved'
      );
    } else {
      // The insert's generated id arrives with the refetch that persist runs.
      mutate(
        (segs) => segs,
        async () => {
          await api.insertActivity(m.day.id, input);
          await load();
        },
        'Added'
      );
    }
  }

  function deleteActivity(a: Activity) {
    if (!confirm('Delete this activity?')) return;
    mutate(
      (segs) => {
        for (const s of segs)
          for (const d of s.days)
            d.activities = d.activities.filter((x) => x.id !== a.id);
        return segs;
      },
      () => api.deleteActivity(a.id),
      'Deleted'
    );
  }

  function moveActivity(day: Day, index: number, dir: 'up' | 'down') {
    const j = dir === 'up' ? index - 1 : index + 1;
    if (j < 0 || j >= day.activities.length) return;
    const a = day.activities[index];
    const b = day.activities[j];

    mutate(
      (segs) => {
        for (const s of segs)
          for (const d of s.days) {
            if (d.id !== day.id) continue;
            const arr = d.activities;
            [arr[index], arr[j]] = [arr[j], arr[index]];
            [arr[index].position, arr[j].position] = [
              arr[j].position,
              arr[index].position,
            ];
          }
        return segs;
      },
      () => api.swapActivities(a, b)
    );
  }

  function addDay(segment: SegmentT) {
    mutate(
      (segs) => segs,
      async () => {
        await api.insertDay(segment.id);
        await load();
      },
      'Day added'
    );
  }

  function toggleBooked(a: Activity, booked: boolean) {
    mutate(
      (segs) => {
        for (const s of segs)
          for (const d of s.days) {
            const found = d.activities.find((x) => x.id === a.id);
            if (found) found.booked = booked;
          }
        return segs;
      },
      () => api.setBooked(a.id, booked)
    );
  }

  // Same optimistic pattern as `mutate`, but over the flat places array.
  const mutatePlaces = useCallback(
    async (
      optimistic: (p: Place[]) => Place[],
      persist: () => Promise<void>,
      okMsg?: string
    ) => {
      setPlaces((p) => optimistic(structuredClone(p)));
      try {
        await persist();
        if (okMsg) toast(okMsg);
      } catch (e) {
        console.error(e);
        toast("Couldn't save — reloading");
        load();
      }
    },
    [load, toast]
  );

  function savePlace(input: PlaceInput) {
    const m = placeModal;
    if (!m) return;
    setPlaceModal(null);

    if (m.mode === 'edit') {
      const id = m.place.id;
      mutatePlaces(
        (arr) => {
          const p = arr.find((x) => x.id === id);
          if (p) Object.assign(p, input);
          return arr;
        },
        () => placesApi.updatePlace(id, input),
        'Saved'
      );
    } else {
      // The insert's generated id arrives with the refetch that persist runs.
      mutatePlaces(
        (arr) => arr,
        async () => {
          await placesApi.insertPlace(input);
          await load();
        },
        'Added'
      );
    }
  }

  function deletePlace(place: Place) {
    if (!confirm('Delete this place?')) return;
    mutatePlaces(
      (arr) => arr.filter((x) => x.id !== place.id),
      () => placesApi.deletePlace(place.id),
      'Deleted'
    );
  }

  function movePlace(index: number, dir: 'up' | 'down') {
    const j = dir === 'up' ? index - 1 : index + 1;
    if (j < 0 || j >= places.length) return;
    const a = places[index];
    const b = places[j];
    mutatePlaces(
      (arr) => {
        [arr[index], arr[j]] = [arr[j], arr[index]];
        [arr[index].position, arr[j].position] = [
          arr[j].position,
          arr[index].position,
        ];
        return arr;
      },
      () => placesApi.swapPlaces(a, b)
    );
  }

  function addPlaceToDay(dayId: string) {
    const place = promoting;
    if (!place) return;
    setPromoting(null);
    // Both the new activity and the removed place come back on the refetch.
    mutatePlaces(
      (arr) => arr.filter((x) => x.id !== place.id),
      async () => {
        await placesApi.addPlaceToItinerary(place.id, dayId);
        await load();
      },
      'Added to trip'
    );
  }

  function toggleType(t: ActivityType) {
    setActiveTypes((prev) => {
      const next = new Set(prev);
      if (next.has(t)) next.delete(t);
      else next.add(t);
      return next;
    });
  }

  if (error) {
    return (
      <div className="loading">
        <div>{error}</div>
        <button className="btn" onClick={load}>
          Retry
        </button>
      </div>
    );
  }
  if (!segments) return <div className="loading">loading itinerary…</div>;

  return (
    <>
      <Masthead segments={segments} />
      <ViewTabs view={view} onChange={setView} placesCount={places.length} />

      {view === 'itinerary' ? (
        <>
          <RouteRibbon segments={segments} />
          <Toolbar
            segments={segments}
            activeTypes={activeTypes}
            onToggleType={toggleType}
            onOpenBookings={() => setBookingsOpen(true)}
          />

          <main>
            {/* Terminus rows (home) exist only to close the route ribbon. */}
            {segments
              .filter((s) => !s.is_terminus)
              .map((s) => (
                <Segment
                  key={s.id}
                  segment={s}
                  activeTypes={activeTypes}
                  onAddDay={addDay}
                  onAddActivity={(day) => setModal({ mode: 'add', day })}
                  onEditActivity={(day, activity) =>
                    setModal({ mode: 'edit', day, activity })
                  }
                  onDeleteActivity={deleteActivity}
                  onMoveActivity={moveActivity}
                />
              ))}
          </main>
        </>
      ) : (
        <main>
          <PlacesView
            places={places}
            onAdd={() => setPlaceModal({ mode: 'add' })}
            onEdit={(place) => setPlaceModal({ mode: 'edit', place })}
            onDelete={deletePlace}
            onMove={movePlace}
            onAddToTrip={(place) => setPromoting(place)}
          />
        </main>
      )}

      <footer>
        <div className="mono">
          BUILT FOR A GROUP OF 7 → 5 · HALAL-CONSCIOUS · MAPLE SEASON
        </div>
        <p style={{ margin: '10px 0 0', maxWidth: '70ch' }}>
          Halal spots are marked <b style={{ color: '#2b7a4b' }}>حلال</b> —
          always confirm on arrival. Items marked{' '}
          <b style={{ color: '#b06a00' }}>BOOK</b> are collected under Bookings.
        </p>
      </footer>

      {modal && (
        <ActivityModal
          key={modal.mode === 'edit' ? modal.activity.id : `add-${modal.day.id}`}
          activity={modal.mode === 'edit' ? modal.activity : null}
          onSave={saveActivity}
          onClose={() => setModal(null)}
        />
      )}

      {placeModal && (
        <ActivityModal
          key={
            placeModal.mode === 'edit' ? placeModal.place.id : 'add-place'
          }
          variant="place"
          activity={
            placeModal.mode === 'edit'
              ? // ActivityModal only reads shared fields; the schedule-only
                // ones it ignores in place mode are filled with blanks.
                ({
                  ...placeModal.place,
                  time: '',
                  book: false,
                  booked: false,
                  opt: false,
                  day_id: '',
                } as Activity)
              : null
          }
          onSave={(input) => savePlace(input)}
          onClose={() => setPlaceModal(null)}
        />
      )}

      {promoting && (
        <DayPickerModal
          place={promoting}
          segments={segments}
          onPick={addPlaceToDay}
          onClose={() => setPromoting(null)}
        />
      )}

      {bookingsOpen && (
        <BookingsModal
          segments={segments}
          onToggleBooked={toggleBooked}
          onClose={() => setBookingsOpen(false)}
        />
      )}

      <div className={`toast${toastMsg ? ' on' : ''}`}>{toastMsg}</div>
    </>
  );
}
