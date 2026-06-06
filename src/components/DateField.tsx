import { Calendar } from 'lucide-react';
import { useId, useRef } from 'react';
import { formatDateDisplay } from '../utils/dates';

export default function DateField({
  label,
  value,
  onChange,
  min,
  max,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  min?: string;
  max?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();

  const openPicker = () => {
    const input = inputRef.current;
    if (!input) return;
    input.focus({ preventScroll: true });
    if (typeof input.showPicker === 'function') {
      input.showPicker();
    } else {
      input.click();
    }
  };

  return (
    <div className="block">
      <span className="mb-1 block text-[11px] font-bold text-muted">{label}</span>
      <button
        type="button"
        onClick={openPicker}
        className="flex w-full items-center gap-2 rounded-xl border border-sky-border bg-sky-bg px-3 py-2.5 text-left transition-colors hover:bg-sky-soft active:bg-sky-tint"
        aria-labelledby={inputId}
      >
        <Calendar size={14} className="shrink-0 text-muted-light" />
        <span className="flex-1 text-sm font-semibold text-ink tabular-nums">
          {formatDateDisplay(value)}
        </span>
      </button>
      <input
        id={inputId}
        ref={inputRef}
        type="date"
        lang="ko-KR"
        value={value}
        min={min}
        max={max}
        onChange={(e) => onChange(e.target.value)}
        className="sr-only"
        tabIndex={-1}
        aria-label={label}
      />
    </div>
  );
}
