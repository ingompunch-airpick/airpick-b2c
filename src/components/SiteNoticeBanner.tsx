import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { SITE_NOTICE } from '../constants/marketing';
import { cn } from '../utils/cn';

function isNoticeActive(): boolean {
  if (!SITE_NOTICE.title.trim() && !SITE_NOTICE.body.trim()) return false;
  const end = Date.parse(SITE_NOTICE.hideAfterIso);
  if (!Number.isFinite(end)) return true;
  return Date.now() < end;
}

/** 홈·비교 — 기간 지나면 자동 숨김, 닫기는 세션 유지 */
export default function SiteNoticeBanner({
  className,
}: {
  className?: string;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!isNoticeActive()) return;
    try {
      if (sessionStorage.getItem(SITE_NOTICE.storageKey) === '1') return;
    } catch {
      /* ignore */
    }
    setVisible(true);
  }, []);

  if (!visible) return null;

  const dismiss = () => {
    setVisible(false);
    try {
      sessionStorage.setItem(SITE_NOTICE.storageKey, '1');
    } catch {
      /* ignore */
    }
  };

  return (
    <div
      role="status"
      className={cn(
        'rounded-2xl bg-amber-50 px-4 py-3.5 ring-2 ring-amber-400/80 shadow-[0_4px_20px_rgba(245,158,11,0.18)]',
        className
      )}
    >
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          {SITE_NOTICE.title.trim() ? (
            <p className="text-[15px] font-bold leading-snug text-amber-950">
              {SITE_NOTICE.title}
            </p>
          ) : null}
          {SITE_NOTICE.body.trim() ? (
            <p
              className={cn(
                'text-[12px] font-semibold leading-relaxed text-amber-950/75',
                SITE_NOTICE.title.trim() && 'mt-1.5'
              )}
            >
              {SITE_NOTICE.body}
            </p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={dismiss}
          className="shrink-0 rounded-full p-1 text-amber-900/45 transition hover:bg-amber-200/60 hover:text-amber-950"
          aria-label="공지 닫기"
        >
          <X size={16} strokeWidth={2.25} />
        </button>
      </div>
    </div>
  );
}
