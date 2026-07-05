import { ChevronLeft, BookOpen } from 'lucide-react';
import { ESIM_GUIDE_STEPS } from '../constants/esimSupport';
import { ESIM_GUIDE_TITLE } from '../constants/marketing';

export default function EsimGuidePage({ onBack }: { onBack: () => void }) {
  return (
    <div className="fixed inset-0 z-[70] flex flex-col bg-sky-bg">
      <header className="flex shrink-0 items-center gap-2 border-b border-sky-border/80 bg-sky-bg/95 px-2 py-3 backdrop-blur-md">
        <button
          type="button"
          onClick={onBack}
          className="rounded-full p-2 text-muted transition-colors hover:bg-sky-soft"
          aria-label="닫기"
        >
          <ChevronLeft size={22} />
        </button>
        <h1 className="text-base font-bold text-ink">{ESIM_GUIDE_TITLE}</h1>
      </header>

      <div className="mx-auto w-full max-w-lg flex-1 overflow-y-auto px-4 py-5 pb-8">
        <section className="rounded-3xl bg-gradient-to-br from-sky-tint to-sky-soft p-5 shadow-[0_4px_16px_rgba(49,130,246,0.1)]">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/15">
              <BookOpen size={20} className="text-brand" strokeWidth={2} />
            </div>
            <div>
              <p className="text-xs font-bold text-brand">초보자 안내</p>
              <p className="text-sm font-bold text-ink">비교 → 제휴사 구매 → 개통</p>
            </div>
          </div>
          <p className="mt-3 text-xs font-medium leading-relaxed text-muted">
            에어픽은 여행 데이터 요금을 비교해 드립니다. 구매와 개통은 각 제휴사에서 진행합니다.
          </p>
        </section>

        <ol className="mt-5 space-y-3">
          {ESIM_GUIDE_STEPS.map((step) => (
            <li
              key={step.id}
              className="rounded-2xl bg-sky-soft px-4 py-4 ring-1 ring-sky-border/60"
            >
              <p className="text-sm font-bold text-ink">{step.title}</p>
              <p className="mt-2 text-xs font-medium leading-relaxed text-muted">{step.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
