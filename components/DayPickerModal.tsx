'use client';

import { useEffect } from 'react';
import type { Place, Segment } from '@/lib/types';

interface Props {
  place: Place;
  segments: Segment[];
  onPick: (dayId: string) => void;
  onClose: () => void;
}

// Pick which day a place should land on. Days are read straight from the
// segments already in TripApp state (terminus segments have no real days).
export default function DayPickerModal({
  place,
  segments,
  onPick,
  onClose,
}: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const stops = segments.filter((s) => !s.is_terminus && s.days.length > 0);

  return (
    <div
      className="overlay on"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal" role="dialog" aria-modal="true">
        <div className="modal-head">
          <h3>Add “{place.title}” to…</h3>
          <button className="x" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <div className="modal-body">
          {stops.length === 0 && (
            <p className="daypick-empty">No days to add to yet.</p>
          )}
          {stops.map((s) => (
            <div key={s.id} className="daypick-seg">
              <div className="daypick-seg-name mono">{s.name}</div>
              {s.days.map((d) => (
                <button
                  key={d.id}
                  className="dayrow"
                  onClick={() => onPick(d.id)}
                >
                  <span className="dayrow-date mono">{d.date}</span>
                  <span className="dayrow-title">
                    {d.title || 'Untitled day'}
                  </span>
                  <span className="dayrow-go" aria-hidden="true">
                    ＋
                  </span>
                </button>
              ))}
            </div>
          ))}
        </div>

        <div className="modal-foot">
          <button className="btn ghost" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
