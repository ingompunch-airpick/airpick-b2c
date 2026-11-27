import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import PickerPopover, { usePickerDismiss } from './PickerPopover';
import { cn } from '../utils/cn';

const WEEK = ['일', '월', '화', '수', '목', '금', '토'];

function pad(n: number) {
  return String(n).padStart(2, '0');
}
function ymd(y: number, m0: number, d: number) {
  return `${y}-${pad(m0 + 1)}-${pad(d)}`;
}
function parseYmd(v: string): { y: number; m0: number; d: number } | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(v || '');
  if (!m) return null;
  return { y: Number(m[1]), m0: Number(m[2]) - 1, d: Number(m[3]) };
}
function todayYmdLocal() {
  const t = new Date();
  return ymd(t.getFullYear(), t.getMonth(), t.getDate());
}

/** 2026-11-24 → 2026.11.24 (화) */
export function formatKoreanDate(value: string): string {
  const p = parseYmd(value);
  if (!p) return '날짜 선택';
  const wd = WEEK[new Date(p.y, p.m0, p.d).getDay()];
  return `${p.y}.${pad(p.m0 + 1)}.${pad(p.d)} (${wd})`;
}

/**
 * 날짜 선택 — 칸 어디를 눌러도 에어픽 달력이 열림(브라우저 기본 달력 대신).
 * min·max 밖 날짜는 못 고름. 고르면 바로 닫힘.
 */
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
  const buttonId = useId();
  const panelId = useId();
  const premium = tone === 'premium';
  const large = size === 'large';
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setOpen(false), []);
  usePickerDismiss(open, close, wrapRef);

  const base = parseYmd(value) ?? parseYmd(min || '') ?? parseYmd(todayYmdLocal())!;
  const [view, setView] = useState({ y: base.y, m0: base.m0 });
  useEffect(() => {
    if (open) setView({ y: base.y, m0: base.m0 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const monthKey = (y: number, m0: number) => y * 12 + m0;
  const minP = parseYmd(min || '');
  const maxP = parseYmd(max || '');
  const canPrev = !minP || monthKey(view.y, view.m0) > monthKey(minP.y, minP.m0);
  const canNext = !maxP || monthKey(view.y, view.m0) < monthKey(maxP.y, maxP.m0);
  const shift = (delta: number) =>
    setView((v) => {
      const k = monthKey(v.y, v.m0) + delta;
      return { y: Math.floor(k / 12), m0: k % 12 };
    });

  const firstWd = new Date(view.y, view.m0, 1).getDay();
  const days = new Date(view.y, view.m0 + 1, 0).getDate();
  const today = todayYmdLocal();
  const cells: (number | null)[] = [...Array(firstWd).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)];

  return (
    <div className="relative block" ref={wrapRef}>
      <label
        htmlFor={buttonId}
        className={cn(
          'block',
          large ? 'mb-1.5 text-[14px] font-medium text-[#0f1a2e]/55 md:mb-1' : 'mb-1 text-[13px] font-bold',
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
        <span>{formatKoreanDate(value)}</span>
        <CalendarDays size={large ? 18 : 16} strokeWidth={2} className="shrink-0 text-[#0f1a2e]/60" aria-hidden />
      </button>

      {open ? (
        <PickerPopover id={panelId} label={label} summary={formatKoreanDate(value)} onClose={close}>
          <div className="flex items-center justify-between px-1 pb-2">
            <button
              type="button"
              onClick={() => shift(-1)}
              disabled={!canPrev}
              aria-label="이전 달"
              className="rounded-full p-1.5 text-[#0f1a2e] hover:bg-[#f4f5f7] disabled:opacity-25"
            >
              <ChevronLeft size={20} />
            </button>
            <p className="text-[15px] font-bold tabular-nums text-[#0f1a2e]">
              {view.y}년 {view.m0 + 1}월
            </p>
            <button
              type="button"
              onClick={() => shift(1)}
              disabled={!canNext}
              aria-label="다음 달"
              className="rounded-full p-1.5 text-[#0f1a2e] hover:bg-[#f4f5f7] disabled:opacity-25"
            >
              <ChevronRight size={20} />
            </button>
          </div>
          <div className="grid grid-cols-7 text-center text-[13px] font-bold text-[#0f1a2e]/45">
            {WEEK.map((w, i) => (
              <span key={w} className={cn('py-1', i === 0 && 'text-rose-500/80')}>
                {w}
              </span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-0.5">
            {cells.map((d, i) => {
              if (d == null) return <span key={`b${i}`} />;
              const key = ymd(view.y, view.m0, d);
              const disabled = Boolean((min && key < min) || (max && key > max));
              const selected = key === value;
              const isToday = key === today;
              const sunday = (firstWd + d - 1) % 7 === 0;
              return (
                <button
                  key={key}
                  type="button"
                  disabled={disabled}
                  aria-pressed={selected}
                  aria-label={formatKoreanDate(key)}
                  onClick={() => {
                    onChange(key);
                    close();
                  }}
                  className={cn(
                    'aspect-square rounded-xl text-[15px] font-semibold tabular-nums transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c9a962]',
                    selected
                      ? 'bg-[#0f1a2e] text-white'
                      : disabled
                        ? 'cursor-default text-[#0f1a2e]/20'
                        : cn('hover:bg-[#f4f5f7]', sunday ? 'text-rose-500' : 'text-[#0f1a2e]'),
                    isToday && !selected && 'ring-1 ring-inset ring-[#c9a962]'
                  )}
                >
                  {d}
                </button>
              );
            })}
          </div>
        </PickerPopover>
      ) : null}
    </div>
  );
}
