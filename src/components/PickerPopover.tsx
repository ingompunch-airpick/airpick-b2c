import { useEffect, useRef, type ReactNode } from 'react';
import { cn } from '../utils/cn';
import { useBackToClose } from '../lib/backStack';

/**
 * 날짜·시간 선택 공통 껍데기.
 * PC: 칸 바로 아래 작은 창 / 모바일: 아래에서 올라오는 시트(+어두운 배경).
 * 바깥 클릭·Esc로 닫힘.
 */
export function usePickerDismiss(open: boolean, onClose: () => void, wrapRef: React.RefObject<HTMLElement | null>) {
  // 폰에서 시트가 열린 채 뒤로가기 → 시트만 닫기
  useBackToClose(open, onClose);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent | TouchEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) onClose();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('touchstart', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('touchstart', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, onClose, wrapRef]);
}

export default function PickerPopover({
  id,
  label,
  summary,
  onClose,
  widthClass = 'md:w-[19rem]',
  align = 'left',
  children,
}: {
  id: string;
  label: string;
  /** 모바일 시트 머리에 보이는 현재 값 */
  summary: string;
  onClose: () => void;
  widthClass?: string;
  align?: 'left' | 'right';
  children: ReactNode;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  return (
    <>
      <div className="fixed inset-0 z-[95] bg-black/30 md:hidden" aria-hidden onClick={onClose} />
      <div
        ref={panelRef}
        id={id}
        role="dialog"
        aria-label={`${label} 선택`}
        className={cn(
          'z-[96] bg-white p-3 shadow-[0_16px_48px_rgba(15,26,46,0.18)] ring-1 ring-[#0f1a2e]/10',
          'fixed inset-x-0 bottom-0 rounded-t-3xl px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4',
          'md:absolute md:inset-x-auto md:bottom-auto md:top-full md:mt-2 md:rounded-2xl md:p-3',
          align === 'right' ? 'md:right-0' : 'md:left-0',
          widthClass
        )}
      >
        <div className="mb-3 flex items-center justify-between md:hidden">
          <p className="text-[16px] font-bold text-[#0f1a2e]">{label}</p>
          <p className="text-[15px] font-bold tabular-nums text-[#b8954a]">{summary}</p>
        </div>
        {children}
      </div>
    </>
  );
}
