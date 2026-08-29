import { Calendar } from 'lucide-react';
import { useId, useRef } from 'react';
import { formatDateDisplay } from '../utils/dates';
import { cn } from '../utils/cn';

export default function DateField({
  label,
  value,
  onChange,
  min,
  max,
  tone = 'default',
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  min?: string;
  max?: string;
  tone?: 'default' | 'premium';
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();
  const premium = tone === 'premium';

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
      <span
        className={cn(
          'mb-1 block text-[11px] font-bold',
          premium ? 'text-[#0f1a2e]/50' : 'text-muted'
        )}
      >
        {label}
      </span>
      <button
        type="button"
        onClick={openPicker}
        className={cn(
          'flex w-full items-center gap-2 rounded-xl border px-3 py-2.5 text-left transition-colors',
          premium
            ? 'border-[#0f1a2e]/12 bg-neutral-50 hover:bg-[#0f1a2e]/[0.04] active:bg-[#0f1a2e]/[0.06]'
            : 'border-sky-border bg-sky-bg hover:bg-sky-soft active:bg-sky-tint'
        )}
        aria-labelledby={inputId}
      >
        <Calendar size={14} className="shrink-0 text-muted-light" />
        <span
          className={cn(
            'flex-1 text-sm font-semibold tabular-nums',
            premium ? 'text-[#0f1a2e]' : 'text-ink'
          )}
        >
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
