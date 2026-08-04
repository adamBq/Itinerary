'use client';

import type { CSSProperties } from 'react';
import type { Segment } from '@/lib/types';

export default function RouteRibbon({ segments }: { segments: Segment[] }) {
  return (
    <nav className="route" aria-label="Route overview">
      <div className="route-inner">
        <div className="route-track">
          {segments.map((s) => (
            <button
              key={s.id}
              className={`stop${s.is_terminus ? ' terminus' : ''}`}
              // A terminus has no section in the body to scroll to.
              disabled={s.is_terminus}
              // Width tracks time spent, so Tokyo (6 nights) draws a longer bar
              // than Kawaguchiko (3). Day trips have 0 nights — they still get a
              // sliver so they stay visible and clickable.
              style={
                {
                  '--sl': s.color,
                  flexGrow: Math.max(s.nights, 0.8),
                } as CSSProperties
              }
              onClick={() =>
                document
                  .getElementById(s.id)
                  ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
              }
            >
              <span className="line" />
              <span className="dot" />
              <span className="code">{s.code}</span>
              <span className="nm">{s.name}</span>
              <span className="dt">
                {s.date_start === s.date_end
                  ? s.date_start
                  : `${s.date_start}–${s.date_end}`}
              </span>
              <span className="pax">{s.travelers} pax</span>
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}
