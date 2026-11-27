import { useEffect, useState } from 'react';
import {
  AIRLINE_OTHER_NAME,
  AIRLINE_OPTIONS,
  icnTerminalHintForAirline,
  isKnownAirlineName,
  suggestedIcnTerminalForAirline,
} from '../constants/airlines';
import type { Terminal } from '../types';
import { cn } from '../utils/cn';

const SELECT_CLASS =
  'w-full rounded-xl border border-[#e4e7ec] bg-white px-3 py-2.5 text-sm font-semibold text-ink outline-none placeholder:font-medium placeholder:text-[#b0b6c0] focus:border-brand';

const INPUT_CLASS = SELECT_CLASS;

export default function AirlineSelect({
  label,
  value,
  onChange,
  required = false,
  /** YYYY-MM-DD — 아시아나 T2 이전일 판단용 (출국일) */
  referenceDateYmd,
  /** 지금 고른 터미널 — 항공사 터미널과 같으면 안내를 숨긴다 */
  currentTerminal,
}: {
  label: string;
  value: string;
  onChange: (name: string) => void;
  required?: boolean;
  referenceDateYmd?: string;
  currentTerminal?: Terminal;
}) {
  const isCustomValue = !!value && !isKnownAirlineName(value);
  const [otherMode, setOtherMode] = useState(isCustomValue);

  useEffect(() => {
    if (isCustomValue) setOtherMode(true);
  }, [isCustomValue]);

  const showCustomInput = otherMode || isCustomValue;
  const selectValue = showCustomInput ? AIRLINE_OTHER_NAME : value;
  const suggestedTerminal = !showCustomInput ? suggestedIcnTerminalForAirline(value, referenceDateYmd) : null;
  const terminalHint =
    !showCustomInput && !(currentTerminal && suggestedTerminal === currentTerminal)
      ? icnTerminalHintForAirline(value, referenceDateYmd)
      : null;

  return (
    <div className="block">
      <span className="mb-1 block text-[13px] font-bold text-muted">
        {label}
        {required ? ' *' : ''}
      </span>
      <select
        value={selectValue}
        onChange={(e) => {
          const next = e.target.value;
          if (next === AIRLINE_OTHER_NAME) {
            setOtherMode(true);
            if (isKnownAirlineName(value)) onChange('');
            return;
          }
          setOtherMode(false);
          onChange(next);
        }}
        className={SELECT_CLASS}
      >
        <option value="" disabled>
          항공사 선택
        </option>
        {AIRLINE_OPTIONS.map((airline) => (
          <option key={airline.id} value={airline.allowCustom ? AIRLINE_OTHER_NAME : airline.name}>
            {airline.name}
          </option>
        ))}
      </select>
      {showCustomInput && (
        <input
          value={value}
          onChange={(e) => {
            setOtherMode(true);
            onChange(e.target.value);
          }}
          placeholder="항공사명 직접 입력"
          className={cn(INPUT_CLASS, 'mt-2')}
        />
      )}
      {terminalHint ? (
        <p className="mt-1.5 text-[13px] font-semibold leading-snug text-amber-800">{terminalHint}</p>
      ) : null}
    </div>
  );
}
