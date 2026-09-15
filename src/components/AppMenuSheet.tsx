import {
  BookOpen,
  Building2,
  CircleHelp,
  FileText,
  LayoutGrid,
  Mail,
  MessageCircle,
  ShieldCheck,
  Smartphone,
  Store,
  ChevronRight,
  X,
} from 'lucide-react';
import {
  markReturnToMenu,
} from '../utils/returnToMenu';
import {
  openPartnerInquiryEmail,
  openPartnerInquiryKakao,
} from '../constants/partnerContact';
import { SITE_NAV_SECTIONS } from '../constants/siteNav';

const MENU_ICONS: Record<string, typeof CircleHelp> = {
  '/parking': LayoutGrid,
  '/esim': Smartphone,
  '/guides/': BookOpen,
  '/guides/parking-insurance/': ShieldCheck,
  '/partners/': Store,
  '/faq/': CircleHelp,
  '/about/': Building2,
  '/facts/': FileText,
  '/privacy/': ShieldCheck,
  'kakao:partner': MessageCircle,
  'mailto:partner': Mail,
};

function MenuItem({
  label,
  icon: Icon,
  onClick,
}: {
  label: string;
  icon: typeof CircleHelp;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-between rounded-2xl bg-white px-4 py-3.5 text-left ring-1 ring-[#d8dee8] transition-colors hover:bg-[#f4f6f9]"
    >
      <span className="flex min-w-0 items-center gap-2.5">
        <Icon size={18} className="shrink-0 text-[#b8923a]" strokeWidth={2} />
        <span className="text-sm font-bold text-[#0f1a2e]">{label}</span>
      </span>
      <ChevronRight size={18} className="shrink-0 text-[#94a3b8]" />
    </button>
  );
}

export default function AppMenuSheet({
  onClose,
  onOpenSupport,
}: {
  onClose: () => void;
  onOpenSupport: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[65]">
      <button
        type="button"
        className="absolute inset-0 bg-[#0f1a2e]/45 backdrop-blur-[2px]"
        aria-label="메뉴 닫기"
        onClick={onClose}
      />
      <div className="absolute right-0 top-0 flex h-full w-[min(100%,300px)] flex-col bg-[#f4f6f9] shadow-xl">
        <div className="flex items-center justify-between border-b border-[#d8dee8] bg-white px-4 py-3">
          <p className="text-sm font-bold text-[#0f1a2e]">더보기</p>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-[#6b7a8a] hover:bg-[#eef1f5]"
            aria-label="닫기"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="space-y-5 overflow-y-auto p-3 pb-8" aria-label="사이트 메뉴">
          {SITE_NAV_SECTIONS.map((section) => (
            <div key={section.id}>
              <p className="mb-2 px-1 text-[11px] font-bold tracking-wide text-[#6b7a8a]">
                {section.title}
              </p>
              <div className="space-y-2">
                {section.items.map((item) => {
                  const Icon = MENU_ICONS[item.href] ?? CircleHelp;
                  return (
                    <MenuItem
                      key={`${section.id}-${item.href}`}
                      label={item.label}
                      icon={Icon}
                      onClick={() => {
                        if ('openInApp' in item && item.openInApp === 'faq') {
                          onOpenSupport();
                          return;
                        }
                        if (item.href === 'kakao:partner') {
                          onClose();
                          openPartnerInquiryKakao();
                          return;
                        }
                        if (item.href === 'mailto:partner') {
                          onClose();
                          openPartnerInquiryEmail();
                          return;
                        }
                        markReturnToMenu();
                        onClose();
                        window.location.assign(item.href);
                      }}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>
    </div>
  );
}
