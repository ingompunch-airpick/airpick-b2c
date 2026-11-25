import { useId } from 'react';
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
  inactiveClassName = 'bg-white text-muted ring-1 ring-[#0f1a2e]/10',
}: {
  departure: Terminal;
  arrival: Terminal;
  differentArrival: boolean;
  onDepartureChange: (terminal: Terminal) => void;
  onDifferentArrivalChange: (different: boolean) => void;
  onArrivalChange: (terminal: Terminal) => void;
  /** 비선택 옵션 배경 — SearchPanel vs BookingModal */
  inactiveClassName?: string;
}) {
  const depName = useId();
  const arrName = useId();
  const diffId = useId();

  return (
    <div className="space-y-2">
      <fieldset>
        <legend className="text-[11px] font-bold text-muted">출국 터미널</legend>
        <div className="mt-1 grid grid-cols-2 gap-2">
          {TERMINALS.map((t) => {
            const id = `${depName}-${t}`;
            const selected = departure === t;
            return (
              <label
                key={t}
                htmlFor={id}
                className={cn(
                  'cursor-pointer rounded-xl py-2 text-center text-xs font-bold transition-colors',
                  selected ? 'bg-[#0f1a2e] text-white' : inactiveClassName
                )}
              >
                <input
                  id={id}
                  type="radio"
                  name={depName}
                  value={t}
                  checked={selected}
                  onChange={() => onDepartureChange(t)}
                  className="sr-only"
                />
                {terminalLabel(t)}
              </label>
            );
          })}
        </div>
      </fieldset>
      <p className="text-[11px] font-medium leading-snug text-muted">
        대한항공·아시아나·진에어·에어부산·에어서울은 제2터미널, 제주항공·티웨이 등은 제1터미널. 항공권 터미널과 맞춰 주세요.
      </p>

      <label htmlFor={diffId} className="flex items-center gap-2 pt-0.5">
        <input
          id={diffId}
          type="checkbox"
          checked={differentArrival}
          onChange={(e) => onDifferentArrivalChange(e.target.checked)}
          className="h-4 w-4 rounded border-[#0f1a2e]/20 text-[#0f1a2e]"
        />
        <span className="text-[11px] font-semibold text-muted">귀국 터미널이 다릅니다</span>
      </label>

      {differentArrival ? (
        <fieldset>
          <legend className="text-[11px] font-bold text-muted">귀국 터미널</legend>
          <div className="mt-1 grid grid-cols-2 gap-2">
            {TERMINALS.map((t) => {
              const id = `${arrName}-${t}`;
              const selected = arrival === t;
              return (
                <label
                  key={t}
                  htmlFor={id}
                  className={cn(
                    'cursor-pointer rounded-xl py-2 text-center text-xs font-bold transition-colors',
                    selected ? 'bg-[#0f1a2e] text-white' : inactiveClassName
                  )}
                >
                  <input
                    id={id}
                    type="radio"
                    name={arrName}
                    value={t}
                    checked={selected}
                    onChange={() => onArrivalChange(t)}
                    className="sr-only"
                  />
                  {terminalLabel(t)}
                </label>
              );
            })}
          </div>
        </fieldset>
      ) : null}
    </div>
  );
}
