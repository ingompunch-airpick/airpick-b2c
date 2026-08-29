import { Search } from 'lucide-react';
import { useState } from 'react';
import type { ReservationLookupMode } from '../types';
import { cn } from '../utils/cn';

const modes: { id: ReservationLookupMode; label: string; placeholder: string }[] = [
  { id: 'carNumber', label: '차량번호', placeholder: '예: 12가 1234' },
  { id: 'phone', label: '연락처', placeholder: '010-1234-5678' },
];

export default function ReservationLookupForm({
  onLookup,
  loading,
  initialMode,
  initialValue,
}: {
  onLookup: (mode: ReservationLookupMode, value: string, password: string) => void;
  loading?: boolean;
  initialMode?: ReservationLookupMode;
  initialValue?: string;
}) {
  const [mode, setMode] = useState<ReservationLookupMode>(initialMode ?? 'carNumber');
  const [value, setValue] = useState(initialValue ?? '');
  const [password, setPassword] = useState('');

  const active = modes.find((m) => m.id === mode)!;
  const canSubmit = value.trim() !== '' && /^\d{4}$/.test(password.trim());

  return (
    <div className="rounded-2xl bg-neutral-50 p-4 shadow-[0_2px_12px_rgba(15,26,46,0.06)] ring-1 ring-[#0f1a2e]/10">
      <div className="mb-3 flex items-center gap-2 rounded-xl bg-[#0f1a2e]/[0.06] px-3 py-2.5">
        <Search size={18} className="shrink-0 text-[#0f1a2e]" />
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
                ? 'bg-[#0f1a2e] text-white shadow-sm'
                : 'bg-white text-muted ring-1 ring-[#0f1a2e]/12'
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
          className="w-full rounded-xl border border-[#0f1a2e]/12 bg-white px-3 py-2.5 text-sm font-semibold text-ink outline-none focus:border-[#0f1a2e]"
        />
      </label>

      <label className="mt-2 block">
        <span className="mb-1 block text-xs font-bold text-muted">예약 비밀번호 (4자리)</span>
        <input
          type="password"
          inputMode="numeric"
          autoComplete="off"
          maxLength={4}
          value={password}
          onChange={(e) => setPassword(e.target.value.replace(/\D/g, '').slice(0, 4))}
          placeholder="예약 시 입력한 4자리"
          className="w-full rounded-xl border border-[#0f1a2e]/12 bg-white px-3 py-2.5 text-sm font-semibold tracking-widest text-ink outline-none focus:border-[#0f1a2e]"
        />
      </label>

      <button
        type="button"
        disabled={loading || !canSubmit}
        onClick={() => onLookup(mode, value, password)}
        className="mt-3 w-full rounded-xl bg-[#0f1a2e] py-3.5 text-sm font-bold text-white transition-colors hover:bg-[#1a2740] disabled:opacity-60"
      >
        {loading ? '조회 중…' : '예약 조회하기'}
      </button>
    </div>
  );
}
