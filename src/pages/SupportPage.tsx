import { ChevronLeft, CircleHelp } from 'lucide-react';
import { FAQ_CATEGORIES } from '../constants/support';

export default function SupportPage({ onBack }: { onBack: () => void }) {
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
        <h1 className="text-base font-bold text-ink">자주 묻는 질문</h1>
      </header>

      <div className="mx-auto w-full max-w-lg flex-1 overflow-y-auto px-4 py-5 pb-8">
        <section className="rounded-3xl bg-gradient-to-br from-sky-tint to-sky-soft p-5 shadow-[0_4px_16px_rgba(49,130,246,0.1)]">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/15">
              <CircleHelp size={20} className="text-brand" strokeWidth={2} />
            </div>
            <div>
              <p className="text-xs font-bold text-brand">에어픽 안내</p>
              <p className="text-sm font-bold text-ink">앱·예약·MY 이용 FAQ</p>
            </div>
          </div>
          <p className="mt-3 text-xs font-medium leading-relaxed text-muted">
            입·출고, 차량 상태, 현장 일정 등은 예약하신 주차장(업체)으로 문의해 주세요.
          </p>
        </section>

        <section className="mt-5">
          <div className="mt-1 space-y-4">
            {FAQ_CATEGORIES.map((category) => (
              <div key={category.id}>
                <p className="mb-2 px-0.5 text-[11px] font-bold text-brand">{category.label}</p>
                <div className="space-y-2">
                  {category.items.map((item) => (
                    <details
                      key={item.id}
                      className="rounded-2xl bg-sky-soft px-4 py-3 ring-1 ring-sky-border/60"
                    >
                      <summary className="cursor-pointer list-none text-sm font-semibold text-ink marker:content-none">
                        {item.question}
                      </summary>
                      <p className="mt-2 text-xs font-medium leading-relaxed text-muted">
                        {item.answer}
                      </p>
                    </details>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
