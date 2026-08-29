import { useState } from 'react';
import DateField from './DateField';
import TimeField from './TimeField';
import TerminalFields from './TerminalFields';
import type { BookingSearch, Terminal } from '../types';
import { cn } from '../utils/cn';
import { formatDateDisplay, todayYmd } from '../utils/dates';
import { getParkingDayCount } from '../utils/pricing';
import { parkingTypeLabel } from '../utils/parkingType';
import { formatTerminalSummary } from '../utils/terminalLabels';

export default function SearchPanel({
  search,
  onChange,
  /** true면 요약만 보이고,「수정」으로 펼침 */
  defaultCollapsed = false,
}: {
  search: BookingSearch;
  onChange: (next: BookingSearch) => void;
  defaultCollapsed?: boolean;
}) {
  const [open, setOpen] = useState(!defaultCollapsed);
  const days = getParkingDayCount(search.departureDate, search.arrivalDate);
  const today = todayYmd();
  const arrivalTerminal = search.arrivalTerminal ?? search.terminal;
  const differentArrivalTerminal =
    search.arrivalTerminal != null && search.arrivalTerminal !== search.terminal;

  const handleDepartureTerminal = (terminal: Terminal) => {
    const next = { ...search, terminal };
    if (!differentArrivalTerminal) {
      next.arrivalTerminal = terminal;
    }
    onChange(next);
  };

  const handleDifferentArrival = (different: boolean) => {
    if (!different) {
      onChange({ ...search, arrivalTerminal: search.terminal });
      return;
    }
    const other: Terminal = search.terminal === 'T1' ? 'T2' : 'T1';
    onChange({ ...search, arrivalTerminal: other });
  };

  if (!open) {
    return (
      <div className="rounded-2xl bg-neutral-50 px-4 py-3.5 shadow-[0_2px_12px_rgba(15,26,46,0.06)] ring-1 ring-[#0f1a2e]/10">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-bold tracking-wide text-[#0f1a2e]">주차 요금 기준</p>
            <p className="mt-0.5 text-[14px] font-bold leading-snug text-ink">
              {formatDateDisplay(search.departureDate)} {search.departureTime} →{' '}
              {formatDateDisplay(search.arrivalDate)} {search.arrivalTime}
            </p>
            <p className="mt-0.5 text-[11px] font-medium text-muted">
              {days}일 · {formatTerminalSummary(search.terminal, arrivalTerminal)} ·{' '}
              {search.isIndoor ? parkingTypeLabel(true) : parkingTypeLabel(false)}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="shrink-0 rounded-lg px-2.5 py-1.5 text-[12px] font-bold text-[#0f1a2e] ring-1 ring-[#0f1a2e]/15"
          >
            수정
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-neutral-50 p-4 shadow-[0_2px_12px_rgba(15,26,46,0.06)] ring-1 ring-[#0f1a2e]/10">
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="text-[10px] font-bold tracking-wide text-[#0f1a2e]">주차 요금 기준</p>
        {defaultCollapsed ? (
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-lg px-2 py-1 text-[11px] font-bold text-muted"
          >
            접기
          </button>
        ) : null}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <DateField
          tone="premium"
          label="맡기는 날"
          value={search.departureDate}
          min={today}
          onChange={(departureDate) => {
            const next = { ...search, departureDate };
            if (next.arrivalDate < departureDate) {
              next.arrivalDate = departureDate;
            }
            onChange(next);
          }}
        />
        <DateField
          tone="premium"
          label="찾는 날"
          value={search.arrivalDate}
          min={search.departureDate}
          onChange={(arrivalDate) => onChange({ ...search, arrivalDate })}
        />
      </div>

      <div className="mt-2 grid grid-cols-2 gap-2">
        <TimeField
          tone="premium"
          label="맡기는 시간"
          value={search.departureTime}
          onChange={(departureTime) => onChange({ ...search, departureTime })}
        />
        <TimeField
          tone="premium"
          label="찾는 시간"
          value={search.arrivalTime}
          onChange={(arrivalTime) => onChange({ ...search, arrivalTime })}
        />
      </div>

      <div className="mt-2">
        <TerminalFields
          departure={search.terminal}
          arrival={arrivalTerminal}
          differentArrival={differentArrivalTerminal}
          onDepartureChange={handleDepartureTerminal}
          onDifferentArrivalChange={handleDifferentArrival}
          onArrivalChange={(arrivalTerminal) => onChange({ ...search, arrivalTerminal })}
        />
      </div>

      <div className="mt-2 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => onChange({ ...search, isIndoor: false })}
          className={cn(
            'rounded-xl py-2 text-xs font-bold transition-colors',
            !search.isIndoor ? 'bg-[#0f1a2e] text-white' : 'bg-white text-muted'
          )}
        >
          야외
        </button>
        <button
          type="button"
          onClick={() => onChange({ ...search, isIndoor: true })}
          className={cn(
            'rounded-xl py-2 text-xs font-bold transition-colors',
            search.isIndoor ? 'bg-[#0f1a2e] text-white' : 'bg-white text-muted'
          )}
        >
          실내
        </button>
      </div>

      <p className="mt-2 text-center text-[11px] font-semibold text-muted">
        총 <span className="font-bold text-[#0f1a2e]">{days}일</span> · {search.departureTime} →{' '}
        {search.arrivalTime} · {formatTerminalSummary(search.terminal, arrivalTerminal)} ·{' '}
        {search.isIndoor ? parkingTypeLabel(true) : parkingTypeLabel(false)}
      </p>
      <p className="mt-1 text-center text-[10px] font-medium text-muted-light">
        맡기는·찾는 시간 기준 야간 할증 포함
      </p>
    </div>
  );
}
