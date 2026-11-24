import { Clock } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';
import { cn } from '../utils/cn';

function normalizeTime(raw: string): string {
  const m = raw.trim().match(/^(\d{1,2}):(\d{2})/);
  if (!m) return raw;
  const h = Math.min(23, Math.max(0, Number(m[1])));
  const min = Math.min(59, Math.max(0, Number(m[2])));
  return `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
}

function parse(value: string): { h: number; m: number } {
  const v = normalizeTime(value || '10:00');
  const [h, m] = v.split(':').map(Number);
  return { h: Number.isFinite(h) ? h! : 10, m: Number.isFinite(m) ? m! : 0 };
}

/** 10:00 → 오전 10:00 / 15:30 → 오후 3:30 */
export function formatKoreanTime(value: string): string {
  if (!value) return '시간 선택';
  const { h, m } = parse(value);
  const ampm = h < 12 ? '오전' : '오후';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${ampm} ${h12}:${String(m).padStart(2, '0')}`;
}

const HOURS_12 = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
const MINUTES = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

/**
 * 시간 선택 — 칸 어디를 눌러도 열림.
 * PC: 칸 아래 드롭다운 / 모바일: 아래에서 올라오는 시트.
 * 오전·오후 → 시 → 분 순서로 고르면 바로 반영, 분을 고르면 닫힘.
 */
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
  const buttonId = useId();
  const panelId = useId();
  const premium = tone === 'premium';
  const large = size === 'large';
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const { h, m } = parse(value);
  const pm = h >= 12;
  const h12 = h % 12 === 0 ? 12 : h % 12;

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent | TouchEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('touchstart', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('touchstart', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const emit = (hour24: number, minute: number) =>
    onChange(`${String(hour24).padStart(2, '0')}:${String(minute).padStart(2, '0')}`);
  const to24 = (hour12: number, isPm: boolean) => (hour12 % 12) + (isPm ? 12 : 0);

  const chip = (selected: boolean) =>
    cn(
      'rounded-xl py-2.5 text-[15px] font-semibold tabular-nums transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c9a962]',
      selected ? 'bg-[#0f1a2e] text-white' : 'bg-[#f4f5f7] text-[#0f1a2e] hover:bg-[#e8eaee]'
    );

  return (
    <div className="relative block" ref={wrapRef}>
      <label
        htmlFor={buttonId}
        className={cn(
          'block',
          large ? 'mb-1.5 text-[13px] font-medium text-[#0f1a2e]/55 md:mb-1' : 'mb-1 text-[11px] font-bold',
          !large && (premium ? 'text-[#0f1a2e]/50' : 'text-muted')
        )}
      >
        {label}
      </label>
      <button
        id={buttonId}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'flex w-full items-center justify-between gap-2 text-left tabular-nums outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[#c9a962]',
          large
            ? 'h-12 rounded-2xl bg-[#f4f5f7] px-3 text-[16px] font-semibold text-[#0f1a2e] hover:bg-[#eceef1] md:h-auto md:py-3'
            : cn(
                'rounded-xl border px-3 py-2.5 text-sm font-semibold',
                premium
                  ? 'border-[#0f1a2e]/12 bg-neutral-50 text-[#0f1a2e] hover:bg-[#0f1a2e]/[0.04]'
                  : 'border-sky-border bg-sky-bg text-ink hover:bg-sky-soft'
              ),
          open && 'ring-2 ring-[#c9a962]'
        )}
      >
        <span>{formatKoreanTime(value)}</span>
        <Clock size={large ? 18 : 16} strokeWidth={2} className="shrink-0 text-[#0f1a2e]/70" aria-hidden />
      </button>

      {open ? (
        <>
          {/* 모바일 배경 */}
          <div className="fixed inset-0 z-[95] bg-black/30 md:hidden" aria-hidden onClick={() => setOpen(false)} />
          <div
            id={panelId}
            role="dialog"
            aria-label={`${label} 선택`}
            className={cn(
              'z-[96] bg-white p-4 shadow-[0_16px_48px_rgba(15,26,46,0.18)] ring-1 ring-[#0f1a2e]/10',
              'fixed inset-x-0 bottom-0 rounded-t-3xl pb-[max(1rem,env(safe-area-inset-bottom))]',
              'md:absolute md:inset-x-auto md:bottom-auto md:left-0 md:top-full md:mt-2 md:w-[22rem] md:rounded-2xl md:pb-4'
            )}
          >
            <div className="mb-3 flex items-center justify-between md:hidden">
              <p className="text-[16px] font-bold text-[#0f1a2e]">{label}</p>
              <p className="text-[15px] font-bold tabular-nums text-[#b8954a]">{formatKoreanTime(value)}</p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {[false, true].map((isPm) => (
                <button
                  key={String(isPm)}
                  type="button"
                  aria-pressed={pm === isPm}
                  onClick={() => emit(to24(h12, isPm), m)}
                  className={chip(pm === isPm)}
                >
                  {isPm ? '오후' : '오전'}
                </button>
              ))}
            </div>

            <p className="mb-1.5 mt-3 text-[12px] font-bold text-[#0f1a2e]/50">시</p>
            <div className="grid grid-cols-6 gap-1.5">
              {HOURS_12.map((hour) => (
                <button
                  key={hour}
                  type="button"
                  aria-pressed={h12 === hour}
                  onClick={() => emit(to24(hour, pm), m)}
                  className={chip(h12 === hour)}
                >
                  {hour}
                </button>
              ))}
            </div>

            <p className="mb-1.5 mt-3 text-[12px] font-bold text-[#0f1a2e]/50">분</p>
            <div className="grid grid-cols-6 gap-1.5">
              {MINUTES.map((minute) => (
                <button
                  key={minute}
                  type="button"
                  aria-pressed={m === minute}
                  onClick={() => {
                    emit(h, minute);
                    setOpen(false);
                  }}
                  className={chip(m === minute)}
                >
                  {String(minute).padStart(2, '0')}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setOpen(false)}
              className="mt-4 w-full rounded-xl bg-[#c9a962] py-3 text-[15px] font-bold text-[#0a1628]"
            >
              {formatKoreanTime(value)}로 선택
            </button>
          </div>
        </>
      ) : null}
    </div>
  );
}
