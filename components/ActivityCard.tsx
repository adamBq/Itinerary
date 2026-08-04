'use client';

import { useState } from 'react';
import { TYPES, type Activity } from '@/lib/types';

interface Props {
  activity: Activity;
  hidden: boolean;
  isFirst: boolean;
  isLast: boolean;
  onMove: (dir: 'up' | 'down') => void;
  onEdit: () => void;
  onDelete: () => void;
}

export default function ActivityCard({
  activity: a,
  hidden,
  isFirst,
  isLast,
  onMove,
  onEdit,
  onDelete,
}: Props) {
  const [open, setOpen] = useState(false);
  const [imgOk, setImgOk] = useState(true);
  const ty = TYPES[a.type] ?? TYPES.free;
  const hasDetail = Boolean(a.note || a.map_url);

  return (
    <div
      className="act"
      data-open={open}
      style={hidden ? { display: 'none' } : undefined}
      onClick={(e) => {
        // Don't toggle when the click was on a control or a link.
        if ((e.target as HTMLElement).closest('button, a')) return;
        if (hasDetail) setOpen((o) => !o);
      }}
    >
      {a.image_url && imgOk ? (
        // Plain <img>: image URLs are free-text and span arbitrary domains,
        // so next/image would need open-ended remotePatterns for no benefit.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          className="act-thumb"
          src={a.image_url}
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

      <div className="act-time">{a.time}</div>

      <div className="act-body">
        <div className="an">{a.title}</div>
        <div className="ameta">
          <span className="tag" style={{ background: ty.color }}>
            {ty.label}
          </span>
          {a.area && <span className="area">◍ {a.area}</span>}
          {a.halal && <span className="badge halal">حلال halal</span>}
          {a.book && <span className="badge book">◷ book</span>}
          {a.opt && <span className="badge opt">⇄ optional</span>}
        </div>
      </div>

      <div className="act-ctl">
        {hasDetail && (
          <button
            className="act-chev"
            aria-expanded={open}
            aria-label={open ? 'Hide details' : 'Show details'}
            onClick={() => setOpen((o) => !o)}
          >
            ▶
          </button>
        )}
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
          {a.note && <div className="anote">{a.note}</div>}
          {a.map_url && (
            <a
              className="amap"
              href={a.map_url}
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
