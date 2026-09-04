'use client';

export type View = 'itinerary' | 'places';

interface Props {
  view: View;
  onChange: (v: View) => void;
  placesCount: number;
}

const TABS: { key: View; label: string }[] = [
  { key: 'itinerary', label: 'Itinerary' },
  { key: 'places', label: 'Places to go' },
];

export default function ViewTabs({ view, onChange, placesCount }: Props) {
  return (
    <nav className="viewtabs" aria-label="Views">
      <div className="viewtabs-inner" role="tablist">
        {TABS.map((t) => (
          <button
            key={t.key}
            role="tab"
            aria-selected={view === t.key}
            className={`viewtab${view === t.key ? ' on' : ''}`}
            onClick={() => onChange(t.key)}
          >
            {t.label}
            {t.key === 'places' && placesCount > 0 && (
              <span className="viewtab-count">{placesCount}</span>
            )}
          </button>
        ))}
      </div>
    </nav>
  );
}
