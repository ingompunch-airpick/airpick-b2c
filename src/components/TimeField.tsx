import { useId } from 'react';
import { cn } from '../utils/cn';

function normalizeTime(raw: string): string {
  const m = raw.trim().match(/^(\d{1,2}):(\d{2})/);
  if (!m) return raw;
  const h = Math.min(23, Math.max(0, Number(m[1])));
  const min = Math.min(59, Math.max(0, Number(m[2])));
  return `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
}

export default function TimeField({
  label,
  value,
  onChange,
  tone = 'default',
  size = 'default',
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
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
        type="time"
        step={300}
        value={value ? normalizeTime(value) : ''}
        onChange={(e) => onChange(normalizeTime(e.target.value))}
        className={cn(
          'w-full tabular-nums outline-none transition-colors',
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
