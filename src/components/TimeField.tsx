import { Clock } from 'lucide-react';
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import PickerPopover, { usePickerDismiss } from './PickerPopover';
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

function hourLabel(h: number): string {
  const ampm = h < 12 ? '오전' : '오후';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${ampm} ${h12}시`;
}

/** 10:00 → 오전 10:00 / 15:30 → 오후 3:30 */
export function formatKoreanTime(value: string): string {
  if (!value) return '시간 선택';
  const { h, m } = parse(value);
  const ampm = h < 12 ? '오전' : '오후';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${ampm} ${h12}:${String(m).padStart(2, '0')}`;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = [0, 10, 20, 30, 40, 50];

/**
 * 시간 선택 — 칸 어디를 눌러도 열림. 왼쪽 「시」(오전 12시~오후 11시) · 오른쪽 「분」(10분 단위) 두 줄 목록.
 * 시를 고르면 반영, 분을 고르면 반영하고 닫힘.
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
  const hourListRef = useRef<HTMLUListElement>(null);
  const { h, m } = parse(value);
  const close = useCallback(() => setOpen(false), []);
  usePickerDismiss(open, close, wrapRef);

  // 열릴 때 선택된 시가 보이도록 스크롤
  useEffect(() => {
    if (!open) return;
    const el = hourListRef.current?.querySelector<HTMLElement>('[aria-selected="true"]');
    el?.scrollIntoView({ block: 'center' });
  }, [open]);

  const emit = (hour: number, minute: number) =>
    onChange(`${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`);

  const item = (selected: boolean) =>
    cn(
      'w-full rounded-lg px-3 py-2 text-left text-[15px] font-semibold tabular-nums transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c9a962]',
      selected ? 'bg-[#0f1a2e] text-white' : 'text-[#0f1a2e] hover:bg-[#f4f5f7]'
    );

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
        <span>{formatKoreanTime(value)}</span>
        <Clock size={large ? 18 : 16} strokeWidth={2} className="shrink-0 text-[#0f1a2e]/60" aria-hidden />
      </button>

      {open ? (
        <PickerPopover id={panelId} label={label} summary={formatKoreanTime(value)} onClose={close} widthClass="md:w-[16rem]">
          <div className="grid grid-cols-[1.4fr_1fr] gap-2">
            <div>
              <p className="px-1 pb-1 text-[13px] font-bold text-[#0f1a2e]/45">시</p>
              <ul ref={hourListRef} role="listbox" aria-label="시" className="max-h-60 space-y-0.5 overflow-y-auto pr-1">
                {HOURS.map((hour) => (
                  <li key={hour}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={h === hour}
                      onClick={() => emit(hour, m)}
                      className={item(h === hour)}
                    >
                      {hourLabel(hour)}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="px-1 pb-1 text-[13px] font-bold text-[#0f1a2e]/45">분</p>
              <ul role="listbox" aria-label="분" className="space-y-0.5">
                {MINUTES.map((minute) => (
                  <li key={minute}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={m === minute}
                      onClick={() => {
                        emit(h, minute);
                        close();
                      }}
                      className={item(m === minute)}
                    >
                      {String(minute).padStart(2, '0')}분
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </PickerPopover>
      ) : null}
    </div>
  );
}
