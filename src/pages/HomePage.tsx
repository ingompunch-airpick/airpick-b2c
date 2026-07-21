import { useState } from 'react';
import DepartureGuideCard from '../components/map-home/DepartureGuideCard';
import { HOME_EYEBROW, HOME_HEADLINE, HOME_SUBHEAD } from '../constants/marketing';
import type { AppTab } from '../types';

/** 홈 — SEO Hook(출국시간 계산) → 주차·이심·예약 전환 */
export default function HomePage({ onGoTab }: { onGoTab: (tab: AppTab) => void }) {
  const [hasResult, setHasResult] = useState(false);

  return (
    <div className="relative">
      <div
        className="pointer-events-none absolute inset-x-0 -top-2 -mx-4 h-[min(52vh,420px)]"
        aria-hidden
        style={{
          background:
            'radial-gradient(ellipse 90% 70% at 50% 0%, #cfe4fb 0%, #edf4fc 55%, transparent 75%)',
        }}
      />

      <div className="relative space-y-5 pt-2">
        <header className={`transition-all duration-300 ${hasResult ? 'opacity-70' : ''}`}>
          <p className="text-[11px] font-bold tracking-wide text-brand">{HOME_EYEBROW}</p>
          <h1
            className={`mt-2 font-bold tracking-tight text-ink ${
              hasResult
                ? 'text-xl leading-snug'
                : 'text-[1.65rem] leading-tight sm:text-[1.9rem]'
            }`}
          >
            {HOME_HEADLINE}
          </h1>
          {!hasResult ? (
            <p className="mt-2 max-w-[20rem] text-[13px] font-medium leading-snug text-muted">
              {HOME_SUBHEAD}
            </p>
          ) : null}
        </header>

        <DepartureGuideCard onResultChange={setHasResult} onGoTab={onGoTab} />
      </div>
    </div>
  );
}
