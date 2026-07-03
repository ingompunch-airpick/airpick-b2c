import { useEffect, useState } from 'react';
import { AIRLINE_OTHER_NAME, AIRLINE_OPTIONS, isKnownAirlineName } from '../constants/airlines';
import { cn } from '../utils/cn';

const SELECT_CLASS =
  'w-full rounded-xl border border-sky-border bg-sky-soft px-3 py-2.5 text-sm font-semibold text-ink outline-none focus:border-brand';

const INPUT_CLASS = SELECT_CLASS;

export default function AirlineSelect({
  label,
  value,
  onChange,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (name: string) => void;
  required?: boolean;
}) {
  const isCustomValue = !!value && !isKnownAirlineName(value);
  const [otherMode, setOtherMode] = useState(isCustomValue);

  useEffect(() => {
    if (isCustomValue) setOtherMode(true);
  }, [isCustomValue]);

  const showCustomInput = otherMode || isCustomValue;
  const selectValue = showCustomInput ? AIRLINE_OTHER_NAME : value;

  return (
    <div className="block">
      <span className="mb-1 block text-xs font-bold text-muted">
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
    </div>
  );
}
