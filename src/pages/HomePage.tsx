import { useState } from 'react';
import TripHomeHub from '../components/home/TripHomeHub';
import VerifiedStrip from '../components/home/VerifiedStrip';
import {
  HOME_CAMPAIGN,
  HOME_EYEBROW_PREMIUM,
  HOME_HEADLINE,
  HOME_SUBHEAD,
} from '../constants/marketing';
import type { AppTab, BookingSearch, EsimSearch } from '../types';

/** 홈 — 얇은 게이트웨이: 검증 → 일정 → 주차대행(강) */
export default function HomePage({
  onGoTab,
  onPrefillParkingSearch,
  onPrefillEsimSearch,
  partnerCount = 0,
}: {
  onGoTab: (tab: AppTab) => void;
  onPrefillParkingSearch?: (patch: Partial<BookingSearch>) => void;
  onPrefillEsimSearch?: (patch: Partial<EsimSearch>) => void;
  partnerCount?: number;
}) {
  const [hasResult, setHasResult] = useState(false);
  const showCampaign = Boolean(HOME_CAMPAIGN.title.trim());

  return (
    <div className="relative">
      <div
        className="pointer-events-none absolute inset-x-0 -top-2 -mx-4 h-[min(36vh,280px)]"
        aria-hidden
        style={{
          background:
            'radial-gradient(ellipse 90% 70% at 50% 0%, rgba(207,228,251,0.55) 0%, rgba(237,244,252,0.35) 50%, transparent 75%)',
        }}
      />

      <div className="relative space-y-4 pt-2">
        <header className={`transition-all duration-300 ${hasResult ? 'opacity-70' : ''}`}>
          {!hasResult ? (
            <p className="mb-1.5 text-[10px] font-bold tracking-[0.12em] text-[#9a7b3c]">
              {HOME_EYEBROW_PREMIUM}
            </p>
          ) : null}
          <h1
            className={`whitespace-pre-line font-bold tracking-tight text-ink ${
              hasResult
                ? 'text-xl leading-snug'
                : 'text-[1.55rem] leading-[1.25] sm:text-[1.75rem]'
            }`}
          >
            {HOME_HEADLINE}
          </h1>
          {!hasResult ? (
            <p className="mt-2 max-w-[22rem] text-[13px] font-medium leading-snug text-muted">
              {HOME_SUBHEAD}
            </p>
          ) : null}
        </header>

        {!hasResult ? <VerifiedStrip partnerCount={partnerCount} /> : null}

        <TripHomeHub
          onResultChange={setHasResult}
          onGoTab={onGoTab}
          onPrefillParkingSearch={onPrefillParkingSearch}
          onPrefillEsimSearch={onPrefillEsimSearch}
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
