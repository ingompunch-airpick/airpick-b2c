import { Clock } from 'lucide-react';
import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { cn } from '../utils/cn';

const MINUTE_STEP = 5;
const HOURS = Array.from({ length: 12 }, (_, i) => i + 1); // 1..12
const MINUTES = Array.from({ length: 60 / MINUTE_STEP }, (_, i) => i * MINUTE_STEP);

type Meridiem = 'AM' | 'PM';

function parse(value: string): { period: Meridiem; hour12: number; minute: number } {
  const [hRaw, mRaw] = value.split(':');
  const h24 = Number(hRaw) || 0;
  const minute = Number(mRaw) || 0;
  const period: Meridiem = h24 >= 12 ? 'PM' : 'AM';
  const hour12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return { period, hour12, minute };
}

function toValue(period: Meridiem, hour12: number, minute: number): string {
  let h = hour12 % 12; // 12 -> 0
  if (period === 'PM') h += 12;
  return `${String(h).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

function displayLabel(value: string): string {
  const { period, hour12, minute } = parse(value);
  return `${period === 'AM' ? '오전' : '오후'} ${hour12}:${String(minute).padStart(2, '0')}`;
}

export default function TimeField({
  label,
  value,
  onChange,
  placeholder = '시:분 선택',
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
  const [open, setOpen] = useState(false);
  const premium = tone === 'premium';
  const large = size === 'large';
  const containerRef = useRef<HTMLDivElement>(null);
  const hourColRef = useRef<HTMLDivElement>(null);
  const minuteColRef = useRef<HTMLDivElement>(null);

  const hasValue = Boolean(value && parseHmSafe(value));
  const { period, hour12, minute } = hasValue ? parse(value) : { period: 'AM' as Meridiem, hour12: 9, minute: 0 };
  /** 분이 스텝과 안 맞으면 가장 가까운 스텝을 선택 표시 */
  const selectedMinute = MINUTES.includes(minute)
    ? minute
    : MINUTES.reduce((a, b) => (Math.abs(b - minute) < Math.abs(a - minute) ? b : a), MINUTES[0]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  useLayoutEffect(() => {
    if (!open) return;
    const center = (col: HTMLDivElement | null) => {
      const active = col?.querySelector<HTMLElement>('[data-active="true"]');
      if (active && col) col.scrollTop = active.offsetTop - col.clientHeight / 2 + active.clientHeight / 2;
    };
    center(hourColRef.current);
    center(minuteColRef.current);
  }, [open]);

  const set = (next: { period?: Meridiem; hour12?: number; minute?: number }) => {
    onChange(
      toValue(
        next.period ?? period,
        next.hour12 ?? hour12,
        next.minute ?? selectedMinute
      )
    );
  };

  const openPicker = () => {
    if (!hasValue) onChange(toValue('AM', 9, 0));
    setOpen((v) => !v);
  };

  const activeFill = premium ? 'bg-[#0f1a2e] text-white' : 'bg-brand text-white';
  const softBg = premium ? 'bg-neutral-50' : 'bg-sky-bg';
  const softHover = premium ? 'hover:bg-[#0f1a2e]/[0.04]' : 'hover:bg-sky-soft';

  return (
    <div className="relative block" ref={containerRef}>
      <span
        id={inputId}
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
                open
                  ? premium
                    ? 'border-[#0f1a2e]/30 bg-neutral-50 ring-2 ring-[#0f1a2e]/20'
                    : 'border-brand bg-sky-soft ring-2 ring-brand/25'
                  : premium
                    ? 'border-[#0f1a2e]/12 bg-neutral-50 hover:bg-[#0f1a2e]/[0.04] active:bg-[#0f1a2e]/[0.06]'
                    : 'border-sky-border bg-sky-bg hover:bg-sky-soft active:bg-sky-tint'
              )
        )}
        aria-labelledby={inputId}
        aria-expanded={open}
      >
        <Clock size={large ? 16 : 14} className={cn('shrink-0', large ? 'text-[#0f1a2e]' : 'text-muted-light')} />
        <span
          className={cn(
            'flex-1 tabular-nums',
            large ? 'text-[16px] font-semibold' : 'text-sm font-semibold',
            hasValue ? (large || premium ? 'text-[#0f1a2e]' : 'text-ink') : large ? 'text-[#0f1a2e]' : 'text-muted'
          )}
        >
          {hasValue ? displayLabel(value) : placeholder}
        </span>
      </button>

      {open && (
        <div
          className={cn(
            'absolute left-0 right-0 z-50 mt-2 min-w-[190px] rounded-2xl border bg-white p-2',
            premium
              ? 'border-[#0f1a2e]/10 shadow-[0_12px_32px_rgba(15,26,46,0.16)]'
              : 'border-sky-border shadow-[0_12px_32px_rgba(49,130,246,0.18)]'
          )}
        >
          <div className={cn('mb-2 grid grid-cols-2 gap-1 rounded-xl p-1', softBg)}>
            {(['AM', 'PM'] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => set({ period: p })}
                className={cn(
                  large
                    ? 'rounded-lg py-2 text-[15px] font-bold transition-colors'
                    : 'rounded-lg py-1.5 text-xs font-bold transition-colors',
                  period === p ? `${activeFill} shadow-sm` : 'text-muted hover:text-ink'
                )}
              >
                {p === 'AM' ? '오전' : '오후'}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-1">
            <div className="flex flex-col">
              <span className={cn('pb-1 text-center font-bold', large ? 'text-[13px] text-[#0f1a2e]' : 'text-[10px] text-muted-light')}>시</span>
              <div
                ref={hourColRef}
                className={cn(
                  'h-36 overflow-y-auto scroll-smooth rounded-xl p-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
                  premium ? 'bg-neutral-50/80' : 'bg-sky-bg/60'
                )}
              >
                {HOURS.map((h) => {
                  const active = h === hour12;
                  return (
                    <button
                      key={h}
                      type="button"
                      data-active={active}
                      onClick={() => set({ hour12: h })}
                      className={cn(
                        'mb-0.5 w-full rounded-lg text-center font-semibold tabular-nums transition-colors',
                        large ? 'py-2.5 text-[17px]' : 'py-2 text-sm',
                        active ? activeFill : cn('text-ink', softHover)
                      )}
                    >
                      {h}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col">
              <span className={cn('pb-1 text-center font-bold', large ? 'text-[13px] text-[#0f1a2e]' : 'text-[10px] text-muted-light')}>분</span>
              <div
                ref={minuteColRef}
                className={cn(
                  'h-36 overflow-y-auto scroll-smooth rounded-xl p-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
                  premium ? 'bg-neutral-50/80' : 'bg-sky-bg/60'
                )}
              >
                {MINUTES.map((m) => {
                  const active = m === selectedMinute;
                  return (
                    <button
                      key={m}
                      type="button"
                      data-active={active}
                      onClick={() => set({ minute: m })}
                      className={cn(
                        'mb-0.5 w-full rounded-lg text-center font-semibold tabular-nums transition-colors',
                        large ? 'py-2.5 text-[17px]' : 'py-2 text-sm',
                        active ? activeFill : cn('text-ink', softHover)
                      )}
                    >
                      {String(m).padStart(2, '0')}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setOpen(false)}
            className={cn(
              'mt-2 w-full rounded-xl font-bold text-white transition-colors',
              large ? 'py-2.5 text-[16px]' : 'py-2 text-sm',
              premium ? 'bg-[#0f1a2e] hover:bg-[#1a2740]' : 'bg-brand hover:bg-brand-dark'
            )}
          >
            확인
          </button>
        </div>
      )}
    </div>
  );
}

function parseHmSafe(value: string): boolean {
  return /^\d{1,2}:\d{2}$/.test(value.trim());
}
