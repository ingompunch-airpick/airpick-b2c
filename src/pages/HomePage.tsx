import { useState } from 'react';
import DepartureGuideCard from '../components/map-home/DepartureGuideCard';
import { HOME_CAMPAIGN, HOME_HEADLINE, HOME_SUBHEAD } from '../constants/marketing';
import type { AppTab, BookingSearch } from '../types';

/** 홈 — SEO Hook(출국시간) → 결과에서 주차대행 비교로 전환 */
export default function HomePage({
  onGoTab,
  onPrefillParkingSearch,
}: {
  onGoTab: (tab: AppTab) => void;
  onPrefillParkingSearch?: (patch: Partial<BookingSearch>) => void;
}) {
  const [hasResult, setHasResult] = useState(false);
  const showCampaign = Boolean(HOME_CAMPAIGN.title.trim());

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
          <h1
            className={`font-bold tracking-tight text-ink ${
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

        <DepartureGuideCard
          onResultChange={setHasResult}
          onGoTab={onGoTab}
          onPrefillParkingSearch={onPrefillParkingSearch}
        />

        {showCampaign && !hasResult ? (
          <div className="border-l-2 border-brand/70 pl-3.5">
            <p className="text-[13px] font-semibold leading-relaxed text-ink/80">
              {HOME_CAMPAIGN.title}
            </p>
            {HOME_CAMPAIGN.body.trim() ? (
              <p className="mt-1 text-[12px] font-medium leading-relaxed text-muted">
                {HOME_CAMPAIGN.body}
              </p>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
