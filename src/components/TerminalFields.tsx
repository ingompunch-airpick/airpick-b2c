import type { Terminal } from '../types';
import { cn } from '../utils/cn';
import { terminalLabel } from '../utils/terminalLabels';

const TERMINALS: Terminal[] = ['T1', 'T2'];

export default function TerminalFields({
  departure,
  arrival,
  differentArrival,
  onDepartureChange,
  onDifferentArrivalChange,
  onArrivalChange,
  inactiveClassName = 'bg-sky-bg text-muted',
}: {
  departure: Terminal;
  arrival: Terminal;
  differentArrival: boolean;
  onDepartureChange: (terminal: Terminal) => void;
  onDifferentArrivalChange: (different: boolean) => void;
  onArrivalChange: (terminal: Terminal) => void;
  /** 비활성 버튼 배경 — SearchPanel vs BookingModal */
  inactiveClassName?: string;
}) {
  return (
    <div className="space-y-2">
      <p className="text-[11px] font-bold text-muted">출국 터미널</p>
      <div className="grid grid-cols-2 gap-2">
        {TERMINALS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => onDepartureChange(t)}
            className={cn(
              'rounded-xl py-2 text-xs font-bold transition-colors',
              departure === t ? 'bg-sky-deep text-brand' : inactiveClassName
            )}
          >
            {terminalLabel(t)}
          </button>
        ))}
      </div>

      <label className="flex items-center gap-2 pt-0.5">
        <input
          type="checkbox"
          checked={differentArrival}
          onChange={(e) => onDifferentArrivalChange(e.target.checked)}
          className="h-4 w-4 rounded border-sky-border text-brand"
        />
        <span className="text-[11px] font-semibold text-muted">귀국 터미널이 다릅니다</span>
      </label>

      {differentArrival && (
        <>
          <p className="text-[11px] font-bold text-muted">귀국 터미널</p>
          <div className="grid grid-cols-2 gap-2">
            {TERMINALS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => onArrivalChange(t)}
                className={cn(
                  'rounded-xl py-2 text-xs font-bold transition-colors',
                  arrival === t ? 'bg-sky-deep text-brand' : inactiveClassName
                )}
              >
                {terminalLabel(t)}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
