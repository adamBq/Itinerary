'use client';

import type { CSSProperties } from 'react';
import { TYPES, type ActivityType, type Segment } from '@/lib/types';

interface Props {
  segments: Segment[];
  activeTypes: Set<ActivityType>;
  onToggleType: (t: ActivityType) => void;
  onOpenBookings: () => void;
}

export default function Toolbar({
  segments,
  activeTypes,
  onToggleType,
  onOpenBookings,
}: Props) {
  function exportJson() {
    const blob = new Blob([JSON.stringify({ segments }, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'japan-itinerary.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="toolbar">
      <div className="toolbar-inner">
        <div className="filters">
          <span className="flabel">Show</span>
          {(Object.keys(TYPES) as ActivityType[]).map((k) => {
            const on = activeTypes.has(k);
            return (
              <button
                key={k}
                className={`chip${on ? '' : ' muted'}`}
                style={{ '--c': TYPES[k].color } as CSSProperties}
                aria-pressed={on}
                onClick={() => onToggleType(k)}
              >
                <span className="swatch" />
                {TYPES[k].label}
              </button>
            );
          })}
        </div>
        <span className="spacer" />
        <button className="btn ghost" onClick={onOpenBookings}>
          ✓ Bookings
        </button>
        <button className="btn ghost" onClick={exportJson}>
          ↓ Export
        </button>
        <button className="btn ghost" onClick={() => window.print()}>
          ⎙ Print
        </button>
      </div>
    </div>
  );
}
