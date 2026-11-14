import { ArrowRight, ChevronRight, X } from 'lucide-react';
import { markReturnToMenu } from '../utils/returnToMenu';
import {
  SITE_NAV_JOIN,
  SITE_NAV_LEGAL,
  SITE_NAV_QUICK,
  SITE_NAV_SECTIONS,
} from '../constants/siteNav';
import { trackCtaClick } from '../lib/analytics';

/**
 * ≡ 메뉴 — 입점 페이지(/join)와 같은 흰 바탕·굵은 글씨·남색 알약.
 * 맨 위 큰 버튼 2개(예약) → 고객용 목록 → 업체 배너 → 약관.
 * 계획: docs/work/subpage-partner-style-plan.md
 */
export default function AppMenuSheet({
  onClose,
  onGoTab,
}: {
  onClose: () => void;
  /** 주차대행·이심은 앱 안에서 탭만 바꿈 (새로고침 없이) */
  onGoTab?: (tab: 'home' | 'esim') => void;
}) {
  const openPage = (href: string) => {
    markReturnToMenu();
    onClose();
    window.location.assign(href);
  };

  const openQuick = (href: string) => {
    const tab = href === '/esim' ? 'esim' : 'home';
    trackCtaClick(`menu_quick_${tab}`, 'menu');
    if (onGoTab) {
      onClose();
      onGoTab(tab);
      return;
    }
    onClose();
    window.location.assign(href);
  };

  return (
    <div className="fixed inset-0 z-[65]">
      <button
        type="button"
        className="absolute inset-0 bg-[#0f1a2e]/45 backdrop-blur-[2px]"
        aria-label="메뉴 닫기"
        onClick={onClose}
      />
      <div className="absolute bottom-[var(--app-tab-h,56px)] right-0 top-[var(--app-header-h,60px)] flex w-[min(100%,340px)] flex-col bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-[#e5e7eb] px-5 py-3">
          <p className="text-[18px] font-extrabold tracking-tight text-[#0f1a2e]">메뉴</p>
          <button
            type="button"
            onClick={onClose}
            className="-mr-2 rounded-full p-2 text-[#6b7280] hover:bg-[#f8fafc]"
            aria-label="닫기"
          >
            <X size={22} />
          </button>
        </div>

        <nav
          className="flex-1 overflow-y-auto pb-6"
          aria-label="사이트 메뉴"
        >
          <div className="grid grid-cols-2 gap-2.5 px-5 pt-5">
            {SITE_NAV_QUICK.map((item, i) => (
              <button
                key={item.href}
                type="button"
                onClick={() => openQuick(item.href)}
                className={
                  i === 0
                    ? 'rounded-[20px] bg-[#0f1a2e] p-4 text-left text-white transition active:scale-[0.98]'
                    : 'rounded-[20px] border border-[#e5e7eb] bg-[#f8fafc] p-4 text-left text-[#0f1a2e] transition active:scale-[0.98]'
                }
              >
                <span className="block text-[12px] font-semibold opacity-70">{item.caption}</span>
                <span className="mt-4 block text-[16px] font-bold tracking-tight">{item.label}</span>
              </button>
            ))}
          </div>

          {SITE_NAV_SECTIONS.map((section) => (
            <div key={section.id} className="px-5 pt-6">
              <p className="mb-1 text-[12px] font-bold text-[#9ca3af]">{section.title}</p>
              <ul>
                {section.items.map((item) => (
                  <li key={item.href} className="border-b border-[#f1f3f6] last:border-b-0">
                    <button
                      type="button"
                      onClick={() => openPage(item.href)}
                      className="flex w-full items-center justify-between py-3.5 text-left text-[16px] font-semibold tracking-tight text-[#0f1a2e] active:opacity-60"
                    >
                      {item.label}
                      <ChevronRight size={18} className="shrink-0 text-[#9ca3af]" aria-hidden />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="px-5 pt-6">
            <button
              type="button"
              onClick={() => {
                trackCtaClick('menu_join', 'menu');
                openPage(SITE_NAV_JOIN.href);
              }}
              className="block w-full rounded-[20px] bg-gradient-to-br from-[#0f1a2e] to-[#1d2b47] p-5 text-left text-white transition active:scale-[0.99]"
            >
              <span className="block text-[12px] font-bold text-[#d9b866]">{SITE_NAV_JOIN.caption}</span>
              <span className="mt-1.5 block text-[18px] font-bold tracking-tight">{SITE_NAV_JOIN.title}</span>
              <span className="mt-1 block text-[13px] text-white/70">{SITE_NAV_JOIN.body}</span>
              <span className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2.5 text-[14px] font-bold text-[#0f1a2e]">
                {SITE_NAV_JOIN.cta}
                <ArrowRight size={16} aria-hidden />
              </span>
            </button>
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-2 px-5 pt-6 text-[12px] text-[#9ca3af]">
            {SITE_NAV_LEGAL.map((item) => (
              <button
                key={item.href}
                type="button"
                onClick={() => openPage(item.href)}
                className="hover:text-[#6b7280]"
              >
                {item.label}
              </button>
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
}
