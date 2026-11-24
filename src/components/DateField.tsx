import { useId } from 'react';
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
  const inputId = useId();
  const premium = tone === 'premium';
  const large = size === 'large';

  return (
    <div className="block">
      <label
        htmlFor={inputId}
        className={cn(
          'block',
          large ? 'mb-1.5 text-[13px] font-medium text-[#0f1a2e]/55 md:mb-1' : 'mb-1 text-[11px] font-bold',
          !large && (premium ? 'text-[#0f1a2e]/50' : 'text-muted')
        )}
      >
        {label}
      </label>
      <input
        id={inputId}
        name={label}
        type="date"
        lang="ko-KR"
        value={value}
        min={min}
        max={max}
        onChange={(e) => onChange(e.target.value)}
        /* 칸 어디를 눌러도 달력이 열리게 (기본은 오른쪽 아이콘만) */
        onClick={(e) => {
          const el = e.currentTarget as HTMLInputElement & { showPicker?: () => void };
          try {
            el.showPicker?.();
          } catch {
            /* 지원 안 하는 브라우저 — 기본 동작 */
          }
        }}
        className={cn(
          'w-full cursor-pointer tabular-nums outline-none transition-colors',
          large
            ? 'h-12 rounded-2xl bg-[#f4f5f7] px-3 text-[16px] font-semibold text-[#0f1a2e] md:h-auto md:py-3'
            : cn(
                'rounded-xl border px-3 py-2.5 text-sm font-semibold',
                premium
                  ? 'border-[#0f1a2e]/12 bg-neutral-50 text-[#0f1a2e] hover:bg-[#0f1a2e]/[0.04]'
                  : 'border-sky-border bg-sky-bg text-ink hover:bg-sky-soft'
              )
        )}
      />
    </div>
  );
}
