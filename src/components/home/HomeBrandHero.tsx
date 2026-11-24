import { ArrowDown } from 'lucide-react';
import { APP_CONFIG } from '../../constants/appConfig';
import { BRAND_INTRO } from '../../constants/marketing';
import { trackCtaClick } from '../../lib/analytics';
import { IntroVideo, useIsMdUp, usePrefersReducedMotion } from '../BrandIntroGate';

/**
 * 홈 상단 브랜드 배너 (옛 인트로 게이트 대체).
 * 위험(사설 업체 수) → 해결(4가지 확인) → 지향점. 아래 검색 카드가 첫 화면에 살짝 보이게 높이 제한.
 * 「안전 보장」「100%」 표현 금지.
 */
export default function HomeBrandHero({ searchTargetId }: { searchTargetId: string }) {
  const reducedMotion = usePrefersReducedMotion();
  const mdUp = useIsMdUp();
  const videoSrc = mdUp ? BRAND_INTRO.videoDesktop : BRAND_INTRO.videoMobile;
  const posterSrc = mdUp ? BRAND_INTRO.posterDesktop : BRAND_INTRO.posterMobile;

  const goSearch = () => {
    trackCtaClick('home_hero_compare', 'home_hero');
    document.getElementById(searchTargetId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="relative overflow-hidden bg-[#0a1628] text-white">
      <div className="absolute inset-0">
        <IntroVideo
          src={videoSrc}
          poster={posterSrc}
          reducedMotion={reducedMotion}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-[#0a1628]/65" aria-hidden />
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_45%,rgba(10,22,40,0.6)_0%,rgba(10,22,40,0)_100%)]"
          aria-hidden
        />
      </div>

      {/* 배너는 메시지만 — 약속(안심케어)은 검색 카드 바로 아래 AIRPICK PROMISE 줄에서 */}
      <div className="relative z-10 mx-auto max-w-4xl px-5 pb-20 pt-10 md:pb-24 md:pt-16">
      <div className="flex flex-col items-center text-center [text-shadow:0_2px_14px_rgba(0,0,0,0.55)]">
        {/* 모바일은 문장 단위로 줄바꿈 — 「맡기시나 / 요?」처럼 끊기지 않게 */}
        <p className="text-[14px] font-semibold leading-snug text-white md:text-[18px]">
          {APP_CONFIG.introStatText.split(/(?<=\.)\s+/).map((part, i) => (
            <span key={i} className="block md:inline">
              {i > 0 ? <span className="hidden md:inline"> </span> : null}
              {part}
            </span>
          ))}
        </p>
        <span className="mt-3 block h-[2px] w-10 bg-[#c9a962] md:mt-4" aria-hidden />

        <p className="mt-3 text-[30px] font-medium leading-[1.25] tracking-[-0.02em] md:mt-4 md:text-[52px]">
          <span className="block md:inline">{BRAND_INTRO.titleLead}</span>{' '}
          <strong className="block font-extrabold md:inline">{BRAND_INTRO.titleRest}</strong>
        </p>
        <button
          type="button"
          onClick={goSearch}
          className="mt-7 inline-flex items-center justify-center gap-2 rounded-full bg-[#c9a962] px-7 py-3 text-[15px] font-bold text-[#0a1628] transition [text-shadow:none] active:scale-[0.98] md:mt-7 md:px-8 md:py-3.5 md:text-[17px]"
        >
          {BRAND_INTRO.homeCta}
          <ArrowDown size={18} strokeWidth={2.5} aria-hidden />
        </button>
      </div>

      </div>
    </div>
  );
}
