import HomeHookCtas from '../components/home/HomeHookCtas';
import HomeTravelServices from '../components/home/HomeTravelServices';
import HomeTrustCriteria from '../components/home/HomeTrustCriteria';
import HomeTrustStats from '../components/home/HomeTrustStats';
import HomeWhyAirpick from '../components/home/HomeWhyAirpick';
import SiteFooter from '../components/SiteFooter';
import {
  HOME_CAMPAIGN,
  HOME_HEADLINE,
  HOME_SUBHEAD,
} from '../constants/marketing';
import type { AppTab } from '../types';

/**
 * 홈 — 네이비 히어로(풀블리드) → 흰 시트가 살짝 올라타며 이어짐.
 * md+: 히어로 2열, 본문 2열.
 */
export default function HomePage({
  onGoTab,
  partnerCount = 0,
}: {
  onGoTab: (tab: AppTab) => void;
  partnerCount?: number;
}) {
  const showCampaign = Boolean(HOME_CAMPAIGN.title.trim());

  return (
    <div>
      {/* 풀블리드 네이비 — 헤더와 한 면, 하단은 시트에 넘김 */}
      <section className="relative bg-[#0f1a2e] px-5 pb-14 pt-4 text-white sm:px-8 md:px-10 md:pb-20 md:pt-6 lg:px-12">
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden
          style={{
            background:
              'radial-gradient(ellipse 70% 55% at 85% -10%, rgba(201,169,98,0.12) 0%, transparent 55%), radial-gradient(ellipse 50% 40% at 10% 100%, rgba(201,169,98,0.05) 0%, transparent 50%)',
          }}
        />

        <div className="relative mx-auto grid max-w-5xl gap-10 md:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] md:items-end md:gap-12 lg:gap-16">
          <div>
            <h1 className="max-w-xl whitespace-pre-line text-[1.75rem] font-bold leading-[1.18] tracking-tight sm:text-[2rem] md:text-[2.5rem] md:leading-[1.12] lg:text-[2.75rem]">
              {HOME_HEADLINE}
            </h1>
            {HOME_SUBHEAD.trim() ? (
              <p className="mt-3.5 max-w-md text-[13px] font-medium leading-relaxed text-white/58 md:mt-5 md:text-[15px] md:leading-relaxed">
                {HOME_SUBHEAD}
              </p>
            ) : null}
          </div>

          <div className="md:pb-1">
            <HomeHookCtas onGoTab={onGoTab} tone="dark" showEsim={false} />
          </div>
        </div>
      </section>

      {/* 흰 시트 — 둥근 상단이 네이비를 살짝 덮어 끊김·맞닿음 모두 완화 */}
      <div className="relative z-[1] -mt-6 rounded-t-[1.75rem] bg-white px-5 pb-28 pt-8 shadow-[0_-12px_40px_rgba(15,26,46,0.12)] sm:px-8 md:-mt-8 md:rounded-t-[2rem] md:px-10 md:pb-28 md:pt-10 lg:px-12">
        <div className="mx-auto max-w-5xl space-y-10 md:space-y-14">
          <HomeTrustStats partnerCount={partnerCount} />

          <div className="grid gap-10 md:grid-cols-2 md:gap-12 lg:gap-16">
            <HomeTrustCriteria />
            <HomeWhyAirpick />
          </div>

          <HomeTravelServices onGoTab={onGoTab} />

          {showCampaign ? (
            <div className="border-l-2 border-[#c9a962]/50 pl-3.5">
              <p className="text-[13px] font-semibold leading-relaxed text-[#0f1a2e]/80">
                {HOME_CAMPAIGN.title}
              </p>
              {HOME_CAMPAIGN.body.trim() ? (
                <p className="mt-1 text-[12px] font-medium leading-relaxed text-[#0f1a2e]/50">
                  {HOME_CAMPAIGN.body}
                </p>
              ) : null}
            </div>
          ) : null}

          <SiteFooter tone="premium" />
        </div>
      </div>
    </div>
  );
}
