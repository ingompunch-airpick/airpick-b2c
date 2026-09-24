import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { SITE_NOTICE } from '../constants/marketing';

function isNoticeActive(): boolean {
  if (!SITE_NOTICE.body.trim()) return false;
  const end = Date.parse(SITE_NOTICE.hideAfterIso);
  if (!Number.isFinite(end)) return true;
  return Date.now() < end;
}

/** 홈·비교 상단 — 기간 지나면 자동 숨김, 닫기는 세션 유지 */
export default function SiteNoticeBanner() {
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
      className="rounded-2xl bg-[#0f1a2e] px-4 py-3.5 text-white ring-1 ring-[#c9a962]/35"
    >
      <div className="flex items-start gap-3">
        <p className="min-w-0 flex-1 text-[13px] font-semibold leading-relaxed text-white/92">
          {SITE_NOTICE.body}
        </p>
        <button
          type="button"
          onClick={dismiss}
          className="shrink-0 rounded-full p-1 text-white/55 transition hover:bg-white/10 hover:text-white"
          aria-label="공지 닫기"
        >
          <X size={16} strokeWidth={2.25} />
        </button>
      </div>
    </div>
  );
}
