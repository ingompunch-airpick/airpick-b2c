import { ChevronLeft, Car } from 'lucide-react';
import { PARKING_GUIDE_STEPS } from '../constants/parkingSupport';

export default function ParkingGuidePage({ onBack }: { onBack: () => void }) {
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
        <h1 className="text-base font-bold text-ink">주차대행 이용 가이드</h1>
      </header>

      <div className="mx-auto w-full max-w-lg flex-1 overflow-y-auto px-4 py-5 pb-8">
        <section className="rounded-3xl bg-gradient-to-br from-sky-tint to-sky-soft p-5 shadow-[0_4px_16px_rgba(49,130,246,0.1)]">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/15">
              <Car size={20} className="text-brand" strokeWidth={2} />
            </div>
            <div>
              <p className="text-xs font-bold text-brand">인천공항 주차대행</p>
              <p className="text-sm font-bold text-ink">비교 → 예약 → 맡긴 차 확인</p>
            </div>
          </div>
          <p className="mt-3 text-xs font-medium leading-relaxed text-muted">
            에어픽 입점 업체는 예약 후 사진·위치·보험을 이 탭에서 확인할 수 있습니다.
          </p>
        </section>

        <ol className="mt-5 space-y-3">
          {PARKING_GUIDE_STEPS.map((step) => (
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
