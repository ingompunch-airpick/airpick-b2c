import { Search } from 'lucide-react';
import { useState } from 'react';
import type { ReservationLookupMode } from '../types';
import { isBookingNoQuery } from '../utils/bookingNo';

/**
 * 입력값으로 조회 기준을 고른다 — 탭을 잘못 골라(연락처 탭에 차량번호 등) 못 찾는 일을 막는다.
 * 예약번호(AP-…) → 숫자만 9~11자리(0으로 시작) → 연락처 → 그 밖(한글 포함 등) → 차량번호
 */
function detectLookupMode(raw: string): ReservationLookupMode {
  const value = raw.trim();
  if (isBookingNoQuery(value) || /^AP-?/i.test(value)) return 'bookingNo';
  const digits = value.replace(/[\s-]/g, '');
  if (/^0\d{8,10}$/.test(digits)) return 'phone';
  return 'carNumber';
}

export default function ReservationLookupForm({
  onLookup,
  loading,
  initialValue,
}: {
  onLookup: (mode: ReservationLookupMode, value: string, password: string) => void;
  loading?: boolean;
  /** 예전 호출부 호환 — 이제 입력값으로 자동 판단 */
  initialMode?: ReservationLookupMode;
  initialValue?: string;
}) {
  const [value, setValue] = useState(initialValue ?? '');
  const [password, setPassword] = useState('');

  const canSubmit = value.trim() !== '' && /^\d{4}$/.test(password.trim());

  return (
    <div className="rounded-2xl bg-[#f4f5f7] p-4">
      <div className="mb-3 flex items-center gap-2 rounded-xl bg-[#0f1a2e]/[0.06] px-3 py-2.5">
        <Search size={18} className="shrink-0 text-[#0f1a2e]" />
        <span className="text-sm font-bold text-ink">예약 조회</span>
      </div>

      <label className="block">
        <span className="mb-1 block text-[13px] font-bold text-muted">차량번호 · 연락처 · 예약번호 중 하나</span>
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="예: 12가 1234 또는 010-1234-5678"
          className="w-full rounded-xl border border-[#0f1a2e]/12 bg-white px-3 py-2.5 text-sm font-semibold text-ink outline-none focus:border-[#0f1a2e]"
        />
      </label>

      <label className="mt-2 block">
        <span className="mb-1 block text-[13px] font-bold text-muted">예약 비밀번호 (4자리)</span>
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
        onClick={() => onLookup(detectLookupMode(value), value, password)}
        className="mt-3 w-full rounded-xl bg-[#0f1a2e] py-3.5 text-sm font-bold text-white transition-colors hover:bg-[#1a2740] disabled:opacity-60"
      >
        {loading ? '조회 중…' : '예약 조회하기'}
      </button>
    </div>
  );
}
