import { ChevronLeft, Car } from 'lucide-react';
import { PARKING_GUIDE_STEPS, type GuideStep } from '../constants/parkingSupport';

export default function ParkingGuidePage({
  onBack,
  title = '이용 방법',
  headline = '접수 → 입고 → 출국 → 귀국',
  lede = '홈에서 접수한 뒤, 입고 사진·주차 위치·보험은 내 예약에서 확인합니다.',
  steps = PARKING_GUIDE_STEPS,
}: {
  onBack: () => void;
  title?: string;
  headline?: string;
  lede?: string;
  steps?: readonly GuideStep[];
}) {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-sky-bg">
      <header className="flex shrink-0 items-center gap-2 border-b border-sky-border/80 bg-sky-bg/95 px-2 py-3 pt-[max(0.75rem,env(safe-area-inset-top))] backdrop-blur-md">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-0.5 rounded-full py-2 pl-1 pr-3 text-[15px] font-semibold text-[#0f1a2e]"
          aria-label="뒤로"
        >
          <ChevronLeft size={22} strokeWidth={2.25} />
          뒤로
        </button>
        <h1 className="text-base font-bold text-ink">{title}</h1>
      </header>

      <div className="mx-auto w-full max-w-lg flex-1 overflow-y-auto px-4 py-5 pb-8">
        <section className="rounded-3xl bg-gradient-to-br from-sky-tint to-sky-soft p-5 shadow-[0_4px_16px_rgba(49,130,246,0.1)]">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/15">
              <Car size={20} className="text-brand" strokeWidth={2} />
            </div>
            <div>
              <p className="text-xs font-bold text-brand">인천공항 주차대행</p>
              <p className="text-sm font-bold text-ink">{headline}</p>
            </div>
          </div>
          <p className="mt-3 text-xs font-medium leading-relaxed text-muted">{lede}</p>
        </section>

        <ol className="mt-5 space-y-3">
          {steps.map((step) => (
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
