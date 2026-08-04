'use client';

import { useEffect, useState } from 'react';
import {
  TYPES,
  type Activity,
  type ActivityInput,
  type ActivityType,
} from '@/lib/types';

interface Props {
  activity: Activity | null;
  onSave: (input: ActivityInput) => void;
  onClose: () => void;
}

const blank: ActivityInput = {
  time: '',
  title: '',
  type: 'sight',
  area: '',
  note: '',
  map_url: '',
  image_url: '',
  halal: false,
  book: false,
  opt: false,
};

/** TripApp keys this component per activity, so props->state init is safe. */
function initialForm(activity: Activity | null): ActivityInput {
  if (!activity) return blank;
  return {
    time: activity.time ?? '',
    title: activity.title,
    type: activity.type,
    area: activity.area ?? '',
    note: activity.note ?? '',
    map_url: activity.map_url ?? '',
    image_url: activity.image_url ?? '',
    halal: activity.halal,
    book: activity.book,
    opt: activity.opt,
  };
}

export default function ActivityModal({ activity, onSave, onClose }: Props) {
  const [form, setForm] = useState<ActivityInput>(() => initialForm(activity));
  const [previewOk, setPreviewOk] = useState(true);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const set = <K extends keyof ActivityInput>(k: K, v: ActivityInput[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  function save() {
    if (!form.title.trim()) return;
    onSave({ ...form, title: form.title.trim() });
  }

  return (
    <div
      className="overlay on"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal" role="dialog" aria-modal="true">
        <div className="modal-head">
          <h3>{activity ? 'Edit activity' : 'Add activity'}</h3>
          <button className="x" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <div className="modal-body">
          <div className="field">
            <label htmlFor="f_title">What / where</label>
            <input
              id="f_title"
              type="text"
              autoFocus
              value={form.title}
              placeholder="e.g. Fushimi Inari early climb"
              onChange={(e) => set('title', e.target.value)}
            />
          </div>

          <div className="grid2">
            <div className="field">
              <label htmlFor="f_time">Time</label>
              <input
                id="f_time"
                type="text"
                value={form.time}
                placeholder="e.g. 8:00 or Morning"
                onChange={(e) => set('time', e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="f_type">Type</label>
              <select
                id="f_type"
                value={form.type}
                onChange={(e) => set('type', e.target.value as ActivityType)}
              >
                {(Object.keys(TYPES) as ActivityType[]).map((k) => (
                  <option key={k} value={k}>
                    {TYPES[k].label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="field">
            <label htmlFor="f_area">Area / district</label>
            <input
              id="f_area"
              type="text"
              value={form.area}
              placeholder="e.g. Higashiyama"
              onChange={(e) => set('area', e.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="f_note">Notes</label>
            <textarea
              id="f_note"
              rows={2}
              value={form.note}
              placeholder="tips, alternatives, who's going…"
              onChange={(e) => set('note', e.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="f_img">Image URL</label>
            <input
              id="f_img"
              type="text"
              value={form.image_url}
              placeholder="https://…jpg — paste any image link"
              onChange={(e) => {
                set('image_url', e.target.value);
                setPreviewOk(true);
              }}
            />
            {form.image_url && previewOk && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                className="img-preview"
                src={form.image_url}
                alt=""
                referrerPolicy="no-referrer"
                onError={() => setPreviewOk(false)}
              />
            )}
          </div>

          <div className="field">
            <label htmlFor="f_map">Map link (optional)</label>
            <input
              id="f_map"
              type="text"
              value={form.map_url}
              placeholder="https://maps.google.com/…"
              onChange={(e) => set('map_url', e.target.value)}
            />
          </div>

          <div className="checks">
            <label className="check">
              <input
                type="checkbox"
                checked={form.halal}
                onChange={(e) => set('halal', e.target.checked)}
              />{' '}
              Halal spot
            </label>
            <label className="check">
              <input
                type="checkbox"
                checked={form.book}
                onChange={(e) => set('book', e.target.checked)}
              />{' '}
              Needs booking
            </label>
            <label className="check">
              <input
                type="checkbox"
                checked={form.opt}
                onChange={(e) => set('opt', e.target.checked)}
              />{' '}
              Optional / swap
            </label>
          </div>
        </div>

        <div className="modal-foot">
          <button className="btn ghost" onClick={onClose}>
            Cancel
          </button>
          <button className="btn" onClick={save}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
