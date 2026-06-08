import { ChevronRight, CircleHelp, X } from 'lucide-react';

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
        <nav className="flex-1 p-3">
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenSupport();
            }}
            className="flex w-full items-center justify-between rounded-2xl bg-sky-bg px-4 py-3.5 text-left ring-1 ring-sky-border/60 transition-colors hover:bg-sky-tint"
          >
            <span className="flex items-center gap-2.5">
              <CircleHelp size={18} className="text-brand" strokeWidth={2} />
              <span className="text-sm font-bold text-ink">자주 묻는 질문</span>
            </span>
            <ChevronRight size={18} className="text-muted-light" />
          </button>
        </nav>
      </div>
    </div>
  );
}
