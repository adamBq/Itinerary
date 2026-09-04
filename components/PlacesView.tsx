'use client';

import { useState, type CSSProperties } from 'react';
import { TYPES, type ActivityType, type Place } from '@/lib/types';

interface Props {
  places: Place[];
  onAdd: () => void;
  onEdit: (place: Place) => void;
  onDelete: (place: Place) => void;
  onMove: (index: number, dir: 'up' | 'down') => void;
  onAddToTrip: (place: Place) => void;
}

export default function PlacesView({
  places,
  onAdd,
  onEdit,
  onDelete,
  onMove,
  onAddToTrip,
}: Props) {
  // Client-local type filter, mirroring the itinerary Toolbar.
  const [active, setActive] = useState<Set<ActivityType>>(
    () => new Set(Object.keys(TYPES) as ActivityType[])
  );
  const toggle = (t: ActivityType) =>
    setActive((prev) => {
      const next = new Set(prev);
      if (next.has(t)) next.delete(t);
      else next.add(t);
      return next;
    });

  return (
    <section className="places-wrap">
      <div className="places-head">
        <div className="filters">
          <span className="flabel">Show</span>
          {(Object.keys(TYPES) as ActivityType[]).map((k) => {
            const on = active.has(k);
            return (
              <button
                key={k}
                className={`chip${on ? '' : ' muted'}`}
                style={{ '--c': TYPES[k].color } as CSSProperties}
                aria-pressed={on}
                onClick={() => toggle(k)}
              >
                <span className="swatch" />
                {TYPES[k].label}
              </button>
            );
          })}
        </div>
        <span className="spacer" />
        <button className="btn" onClick={onAdd}>
          ＋ Add a place
        </button>
      </div>

      {places.length === 0 ? (
        <div className="places-empty">
          <p>No places yet.</p>
          <p className="mono">
            Collect spots you’d like to visit here, then drop any of them onto a
            day in the itinerary.
          </p>
          <button className="btn" onClick={onAdd}>
            ＋ Add your first place
          </button>
        </div>
      ) : (
        <div className="places">
          {places.map((p, i) => (
            <PlaceCard
              key={p.id}
              place={p}
              hidden={!active.has(p.type)}
              isFirst={i === 0}
              isLast={i === places.length - 1}
              onEdit={() => onEdit(p)}
              onDelete={() => onDelete(p)}
              onMove={(dir) => onMove(i, dir)}
              onAddToTrip={() => onAddToTrip(p)}
            />
          ))}
        </div>
      )}
    </section>
  );
}

interface CardProps {
  place: Place;
  hidden: boolean;
  isFirst: boolean;
  isLast: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onMove: (dir: 'up' | 'down') => void;
  onAddToTrip: () => void;
}

function PlaceCard({
  place: p,
  hidden,
  isFirst,
  isLast,
  onEdit,
  onDelete,
  onMove,
  onAddToTrip,
}: CardProps) {
  const [open, setOpen] = useState(false);
  const [imgOk, setImgOk] = useState(true);
  const ty = TYPES[p.type] ?? TYPES.free;
  const hasDetail = Boolean(p.note || p.map_url);

  return (
    <div
      className="act"
      data-open={open}
      style={hidden ? { display: 'none' } : undefined}
      onClick={(e) => {
        if ((e.target as HTMLElement).closest('button, a')) return;
        if (hasDetail) setOpen((o) => !o);
      }}
    >
      {p.image_url && imgOk ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          className="act-thumb"
          src={p.image_url}
          alt=""
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => setImgOk(false)}
        />
      ) : (
        <div className="act-thumb placeholder" aria-hidden="true">
          ◎
        </div>
      )}

      <div className="act-body">
        <div className="an">{p.title}</div>
        <div className="ameta">
          <span className="tag" style={{ background: ty.color }}>
            {ty.label}
          </span>
          {p.area && <span className="area">◍ {p.area}</span>}
          {p.halal && <span className="badge halal">حلال halal</span>}
        </div>
      </div>

      <div className="act-ctl">
        <button className="btn ghost addtrip" title="Add to itinerary" onClick={onAddToTrip}>
          ＋ Add to trip
        </button>
        <button
          className="ib"
          title="Move up"
          disabled={isFirst}
          onClick={() => onMove('up')}
        >
          ▲
        </button>
        <button
          className="ib"
          title="Move down"
          disabled={isLast}
          onClick={() => onMove('down')}
        >
          ▼
        </button>
        <button className="ib" title="Edit" onClick={onEdit}>
          ✎
        </button>
        <button className="ib del" title="Delete" onClick={onDelete}>
          ✕
        </button>
      </div>

      {hasDetail && (
        <div className="act-detail act-body">
          {p.note && <div className="anote">{p.note}</div>}
          {p.map_url && (
            <a
              className="amap"
              href={p.map_url}
              target="_blank"
              rel="noopener noreferrer"
            >
              ◎ map ↗
            </a>
          )}
        </div>
      )}
    </div>
  );
}
