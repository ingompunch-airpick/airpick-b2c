import { BookOpen, Building2, ChevronRight, CircleHelp, Mail, X } from 'lucide-react';
import { openPartnerInquiryEmail } from '../constants/partnerContact';

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
      <div className="absolute right-0 top-0 flex h-full w-[min(100%,280px)] flex-col bg-sky-soft shadow-xl">
        <div className="flex items-center justify-between border-b border-sky-border/70 px-4 py-3">
          <p className="text-sm font-bold text-ink">메뉴</p>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-muted hover:bg-sky-tint"
            aria-label="닫기"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="space-y-2 p-3">
          <MenuItem
            label="에어픽 소개"
            icon={Building2}
            onClick={() => {
              onClose();
              window.location.assign('/about/');
            }}
          />
          <MenuItem
            label="주차대행 가이드"
            icon={BookOpen}
            onClick={() => {
              onClose();
              window.location.assign('/guides/');
            }}
          />
          <MenuItem
            label="자주 묻는 질문"
            icon={CircleHelp}
            onClick={() => {
              onClose();
              onOpenSupport();
            }}
          />
          <MenuItem
            label="입점 · 제휴 문의 (주차 / 유심·eSIM)"
            icon={Mail}
            onClick={() => {
              onClose();
              openPartnerInquiryEmail();
            }}
          />
        </nav>
      </div>
    </div>
  );
}
