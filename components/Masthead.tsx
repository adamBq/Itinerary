import type { Segment } from '@/lib/types';

/** "Oct 29", "Nov 4" — a real calendar day, as opposed to "Option 1"/"New day". */
const CALENDAR_DATE = /^[A-Z][a-z]{2}\s+\d{1,2}$/;

export default function Masthead({ segments }: { segments: Segment[] }) {
  // Counting day rows would overcount: travel days appear in the segment on
  // both sides of the move, and Hiroshima's rows are routing alternatives
  // rather than dates. Count distinct real dates instead.
  const days = new Set(
    segments
      .flatMap((s) => s.days.map((d) => d.date.trim()))
      .filter((d) => CALENDAR_DATE.test(d))
  ).size;
  const acts = segments.reduce(
    (a, s) => a + s.days.reduce((b, d) => b + d.activities.length, 0),
    0
  );
  const nights = segments.reduce((a, s) => a + (s.nights || 0), 0);

  // Home isn't a stop on the trip.
  const stops = segments.filter((s) => !s.is_terminus).length;

  const stats: [string, string][] = [
    [String(stops), 'Stops'],
    [String(nights), 'Nights'],
    [String(days), 'Days planned'],
    [String(acts), 'Activities'],
    ['7→5', 'Travellers'],
    ['حلال', 'Diet-aware'],
  ];

  return (
    <header className="masthead">
      <div className="kicker">Itinerary · Autumn 2026 · 紅葉</div>
      <h1 className="title">
        <span className="en">Japan by Rail</span>
        <span className="jp">東京 → 河口湖 → 京都 → 広島 → 東京</span>
      </h1>
      <p className="subtitle">
        Oct 29 – Nov 16. Tap a card for details — every edit saves for everyone,
        live.
      </p>
      <div className="stats">
        {stats.map(([n, l], i) => (
          <div key={l} className={`stat${i > 3 ? ' hideprint' : ''}`}>
            <div className="n">{n}</div>
            <div className="l">{l}</div>
          </div>
        ))}
      </div>
    </header>
  );
}
