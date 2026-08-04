'use client';

import ActivityCard from './ActivityCard';
import type { Activity, ActivityType, Day as DayT } from '@/lib/types';

interface Props {
  day: DayT;
  activeTypes: Set<ActivityType>;
  onAddActivity: (day: DayT) => void;
  onEditActivity: (day: DayT, a: Activity) => void;
  onDeleteActivity: (a: Activity) => void;
  onMoveActivity: (day: DayT, index: number, dir: 'up' | 'down') => void;
}

export default function Day({
  day,
  activeTypes,
  onAddActivity,
  onEditActivity,
  onDeleteActivity,
  onMoveActivity,
}: Props) {
  return (
    <div className="day">
      <div className="day-head">
        <span className="day-date">{day.date}</span>
        <span className="day-dow">{day.dow}</span>
        <span className="day-title">{day.title}</span>
        {day.note && <span className="day-note">{day.note}</span>}
      </div>

      <div className="acts">
        {day.activities.map((a, i) => (
          <ActivityCard
            key={a.id}
            activity={a}
            hidden={!activeTypes.has(a.type)}
            isFirst={i === 0}
            isLast={i === day.activities.length - 1}
            onMove={(dir) => onMoveActivity(day, i, dir)}
            onEdit={() => onEditActivity(day, a)}
            onDelete={() => onDeleteActivity(a)}
          />
        ))}
      </div>

      <button className="add-act" onClick={() => onAddActivity(day)}>
        + Add activity to {day.date}
      </button>
    </div>
  );
}
