import {
  BadgeCheck,
  BookOpen,
  Building2,
  CircleHelp,
  FileText,
  LayoutGrid,
  Mail,
  ShieldCheck,
  Smartphone,
  Store,
  ChevronRight,
  X,
} from 'lucide-react';
import { openPartnerInquiryEmail } from '../constants/partnerContact';
import { SITE_NAV_SECTIONS } from '../constants/siteNav';

const MENU_ICONS: Record<string, typeof CircleHelp> = {
  '/parking': LayoutGrid,
  '/esim': Smartphone,
  '/guides/': BookOpen,
  '/guides/partner-vs-external/': Store,
  '/guides/parking-insurance/': ShieldCheck,
  '/partners/': Store,
  '/faq/': CircleHelp,
  '/about/': Building2,
  '/facts/': FileText,
  '/for-partners/': BadgeCheck,
  '/privacy/': ShieldCheck,
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
      className="flex w-full items-center justify-between rounded-2xl bg-sky-bg px-4 py-3.5 text-left ring-1 ring-sky-border/60 transition-colors hover:bg-sky-tint"
    >
      <span className="flex min-w-0 items-center gap-2.5">
        <Icon size={18} className="shrink-0 text-brand" strokeWidth={2} />
        <span className="text-sm font-bold text-ink">{label}</span>
      </span>
      <ChevronRight size={18} className="shrink-0 text-muted-light" />
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
        className="absolute inset-0 bg-sky-deep/50 backdrop-blur-[2px]"
        aria-label="메뉴 닫기"
        onClick={onClose}
      />
      <div className="absolute right-0 top-0 flex h-full w-[min(100%,300px)] flex-col bg-sky-soft shadow-xl">
        <div className="flex items-center justify-between border-b border-sky-border/70 px-4 py-3">
          <p className="text-sm font-bold text-ink">더보기</p>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-muted hover:bg-sky-tint"
            aria-label="닫기"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="space-y-5 overflow-y-auto p-3 pb-8" aria-label="사이트 메뉴">
          {SITE_NAV_SECTIONS.map((section) => (
            <div key={section.id}>
              <p className="mb-2 px-1 text-[11px] font-bold tracking-wide text-muted">
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
                        onClose();
                        if ('openInApp' in item && item.openInApp === 'faq') {
                          onOpenSupport();
                          return;
                        }
                        if (item.href === 'mailto:partner') {
                          openPartnerInquiryEmail();
                          return;
                        }
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
