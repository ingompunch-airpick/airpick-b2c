import { Search } from 'lucide-react';
import { useState } from 'react';
import type { ReservationLookupMode } from '../types';
import { cn } from '../utils/cn';

const modes: { id: ReservationLookupMode; label: string; placeholder: string }[] = [
  { id: 'carNumber', label: '차량번호', placeholder: '12가 3456' },
  { id: 'phone', label: '연락처', placeholder: '010-1234-5678' },
];

export default function ReservationLookupForm({
  onLookup,
  loading,
}: {
  onLookup: (mode: ReservationLookupMode, value: string) => void;
  loading?: boolean;
}) {
  const [mode, setMode] = useState<ReservationLookupMode>('carNumber');
  const [value, setValue] = useState('');

  const active = modes.find((m) => m.id === mode)!;

  return (
    <div className="rounded-2xl bg-sky-soft p-4 shadow-[0_2px_12px_rgba(49,130,246,0.08)]">
      <div className="mb-3 flex items-center gap-2 rounded-xl bg-sky-tint px-3 py-2.5">
        <Search size={18} className="shrink-0 text-brand" />
        <span className="text-sm font-bold text-ink">예약 조회</span>
      </div>

      <div className="mb-3 flex gap-2">
        {modes.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setMode(id)}
            className={cn(
              'flex-1 rounded-xl py-2.5 text-xs font-bold transition-colors',
              mode === id
                ? 'bg-brand text-white shadow-sm'
                : 'bg-sky-bg text-muted ring-1 ring-sky-border'
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <label className="block">
        <span className="mb-1 block text-xs font-bold text-muted">{active.label}</span>
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={active.placeholder}
          className="w-full rounded-xl border border-sky-border bg-sky-bg px-3 py-2.5 text-sm font-semibold text-ink outline-none focus:border-brand"
        />
      </label>

      <button
        type="button"
        disabled={loading || !value.trim()}
        onClick={() => onLookup(mode, value)}
        className="mt-3 w-full rounded-xl bg-brand py-3.5 text-sm font-bold text-white transition-colors hover:bg-brand-dark disabled:opacity-60"
      >
        {loading ? '조회 중…' : '예약 조회하기'}
      </button>
    </div>
  );
}
