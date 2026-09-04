'use client';

import { useState, type CSSProperties, type ReactNode } from 'react';
import Day from './Day';
import type {
  Activity,
  ActivityType,
  Day as DayT,
  Segment as SegmentT,
} from '@/lib/types';

interface Props {
  segment: SegmentT;
  activeTypes: Set<ActivityType>;
  onAddDay: (s: SegmentT) => void;
  onAddActivity: (day: DayT) => void;
  onEditActivity: (day: DayT, a: Activity) => void;
  onDeleteActivity: (a: Activity) => void;
  onMoveActivity: (day: DayT, index: number, dir: 'up' | 'down') => void;
}

/** Strips tags so we can measure/split the transit note as plain prose. */
function firstSentence(html: string) {
  const text = html.replace(/<[^>]+>/g, '');
  const end = text.search(/\.\s/);
  return end === -1 ? text : text.slice(0, end + 1);
}

export default function Segment({
  segment: s,
  activeTypes,
  onAddDay,
  onAddActivity,
  onEditActivity,
  onDeleteActivity,
  onMoveActivity,
}: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);

  // stay_note doubles as either a free-text note or a Google Maps link. When
  // it's a URL, render it as a "map ↗" link like activity cards do; otherwise
  // keep appending it as descriptive text.
  const stayIsLink = /^https?:\/\//.test(s.stay_note ?? '');
  const stayValue: ReactNode = stayIsLink ? (
    <>
      {s.stay}{' '}
      <a
        className="amap"
        href={s.stay_note!}
        target="_blank"
        rel="noopener noreferrer"
      >
        ◎ map ↗
      </a>
    </>
  ) : (
    s.stay + (s.stay_note ? ` — ${s.stay_note}` : '')
  );

  const meta: [string, ReactNode][] = [
    ['Stay', stayValue],
    ['Weather', s.climate ?? ''],
    ['Prayer', s.mosque ?? ''],
  ];

  const tn = s.transit_html;
  const short = tn ? firstSentence(tn) : '';
  const truncated = Boolean(tn && short.length < tn.replace(/<[^>]+>/g, '').length);

  return (
    <section
      className="segment"
      id={s.id}
      style={{ '--line': s.color } as CSSProperties}
    >
      <div className="seg-head">
        <div className="seg-eyebrow">
          <span className="seg-code">{s.code}</span>
          <span className="seg-phase">{s.phase}</span>
          <span className="seg-pax">{s.travelers} travelling</span>
          <button
            className="seg-collapse"
            onClick={() => setCollapsed((c) => !c)}
          >
            {collapsed ? '+ expand' : '– collapse'}
          </button>
        </div>
        <h2 className="seg-title">
          {s.name}
          <span className="jp">{s.jp}</span>
        </h2>
        <div className="seg-meta">
          {meta.map(([k, v]) => (
            <div className="mi" key={k}>
              <b>{k}</b>
              <span>{v}</span>
            </div>
          ))}
        </div>
      </div>

      {tn && (
        <div className="transit-note">
          <span className="ic">{s.transit_icon}</span>
          <div>
            {noteOpen || !truncated ? (
              // Seeded, trusted HTML — there is no edit UI for this field.
              <span dangerouslySetInnerHTML={{ __html: tn }} />
            ) : (
              <span>{short}</span>
            )}
            {truncated && (
              <button
                className="tn-more"
                onClick={() => setNoteOpen((o) => !o)}
              >
                {noteOpen ? 'less' : 'more'}
              </button>
            )}
          </div>
        </div>
      )}

      {!collapsed && (
        <div className="seg-body">
          <div className="days">
            {s.days.map((d) => (
              <Day
                key={d.id}
                day={d}
                activeTypes={activeTypes}
                onAddActivity={onAddActivity}
                onEditActivity={onEditActivity}
                onDeleteActivity={onDeleteActivity}
                onMoveActivity={onMoveActivity}
              />
            ))}
          </div>
          <div className="add-day-row">
            <button className="add-day" onClick={() => onAddDay(s)}>
              + Add a day to {s.name}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
