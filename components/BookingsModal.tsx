'use client';

import { useEffect, type CSSProperties } from 'react';
import type { Activity, Segment } from '@/lib/types';

interface Props {
  segments: Segment[];
  onToggleBooked: (a: Activity, booked: boolean) => void;
  onClose: () => void;
}

export default function BookingsModal({
  segments,
  onToggleBooked,
  onClose,
}: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const groups = segments
    .map((s) => ({
      segment: s,
      items: s.days.flatMap((d) =>
        d.activities.filter((a) => a.book).map((a) => ({ day: d, activity: a }))
      ),
    }))
    .filter((g) => g.items.length > 0);

  return (
    <div
      className="overlay on"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal" role="dialog" aria-modal="true">
        <div className="modal-head">
          <h3>Book ahead</h3>
          <button className="x" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <div className="modal-body">
          {groups.length === 0 ? (
            <p className="ck-empty">
              Nothing flagged to book yet. Tick &quot;Needs booking&quot; on an
              activity and it&apos;ll show up here.
            </p>
          ) : (
            groups.map(({ segment, items }) => (
              <div
                className="ck-group"
                key={segment.id}
                style={{ '--gc': segment.color } as CSSProperties}
              >
                <h4>{segment.name}</h4>
                {items.map(({ day, activity }) => (
                  <label className="ck-item" key={activity.id}>
                    <input
                      type="checkbox"
                      checked={activity.booked}
                      onChange={(e) =>
                        onToggleBooked(activity, e.target.checked)
                      }
                    />
                    <span>
                      <span className="ct">{activity.title}</span>
                      <br />
                      <span className="cd">
                        {day.date} · {activity.area ?? ''}
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            ))
          )}
        </div>

        <div className="modal-foot">
          <button className="btn" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
