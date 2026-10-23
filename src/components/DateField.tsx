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
  size = 'default',
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  min?: string;
  max?: string;
  tone?: 'default' | 'premium';
  size?: 'default' | 'large';
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();
  const premium = tone === 'premium';
  const large = size === 'large';

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
          'block',
          large ? 'mb-1.5 text-[13px] font-medium text-[#0f1a2e]/55 md:mb-1' : 'mb-1 text-[11px] font-bold',
          !large && (premium ? 'text-[#0f1a2e]/50' : 'text-muted')
        )}
      >
        {label}
      </span>
      <button
        type="button"
        onClick={openPicker}
        className={cn(
          'flex w-full items-center gap-2 text-left transition-colors',
          large
            ? 'h-12 rounded-2xl bg-[#f4f5f7] px-3 md:h-auto md:py-3'
            : cn(
                'rounded-xl border px-3 py-2.5',
                premium
                  ? 'border-[#0f1a2e]/12 bg-neutral-50 hover:bg-[#0f1a2e]/[0.04] active:bg-[#0f1a2e]/[0.06]'
                  : 'border-sky-border bg-sky-bg hover:bg-sky-soft active:bg-sky-tint'
              )
        )}
        aria-labelledby={inputId}
      >
        <Calendar size={large ? 16 : 14} className={cn('shrink-0', large ? 'text-[#0f1a2e]' : 'text-muted-light')} />
        <span
          className={cn(
            'flex-1 tabular-nums',
            large ? 'text-[16px] font-semibold text-[#0f1a2e]' : 'text-sm font-semibold',
            !large && (premium ? 'text-[#0f1a2e]' : 'text-ink')
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
