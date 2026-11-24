import { ArrowRight, Check } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { APP_CONFIG } from '../constants/appConfig';
import { BRAND_INTRO } from '../constants/marketing';
import { trackCtaClick } from '../lib/analytics';

export function hasSeenBrandIntro(): boolean {
  try {
    return localStorage.getItem(BRAND_INTRO.storageKey) === '1';
  } catch {
    return false;
  }
}

export function markBrandIntroSeen(): void {
  try {
    localStorage.setItem(BRAND_INTRO.storageKey, '1');
  } catch {
    /* ignore */
  }
}

export function clearBrandIntroSeen(): void {
  try {
    localStorage.removeItem(BRAND_INTRO.storageKey);
    sessionStorage.removeItem(BRAND_INTRO.storageKey);
  } catch {
    /* ignore */
  }
}

/** ?intro=1 이면 세션 무시하고 인트로 강제 표시 */
export function shouldForceBrandIntro(): boolean {
  try {
    return new URLSearchParams(window.location.search).get('intro') === '1';
  } catch {
    return false;
  }
}

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return reduced;
}

function useIsMdUp(): boolean {
  const [mdUp, setMdUp] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia('(min-width: 768px)').matches : false
  );
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const onChange = () => setMdUp(mq.matches);
    onChange();
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return mdUp;
}

function IntroVideo({
  src,
  poster,
  className,
  reducedMotion,
}: {
  src: string;
  poster: string;
  className?: string;
  reducedMotion: boolean;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  useEffect(() => {
    const el = ref.current;
    if (!el || reducedMotion || failed) return;
    el.muted = true;
    void el.play().catch(() => {
      /* autoplay blocked — poster remains */
    });
  }, [src, reducedMotion, failed]);

  if (reducedMotion || failed) {
    return (
      <img src={poster} alt="" className={className} draggable={false} />
    );
  }

  return (
    <video
      ref={ref}
      className={className}
      src={src}
      poster={poster}
      muted
      playsInline
      loop
      autoPlay
      preload="auto"
      aria-hidden
      onError={() => setFailed(true)}
    />
  );
}

/**
 * 브랜드 게이트 — 영상 전체를 어둡게 깔고 가운데 정렬.
 * 위험(사설 업체 수) → 해결(4가지 확인) → 지향점 순서. 「안전 보장」「100%」 표현 금지.
 */
export default function BrandIntroGate({
  onEnter,
}: {
  onEnter: (target?: 'home' | 'my') => void;
}) {
  const reducedMotion = usePrefersReducedMotion();
  const mdUp = useIsMdUp();
  const videoSrc = mdUp ? BRAND_INTRO.videoDesktop : BRAND_INTRO.videoMobile;
  const posterSrc = mdUp ? BRAND_INTRO.posterDesktop : BRAND_INTRO.posterMobile;

  /** 정적 페이지로 나갈 때도 인트로는 본 것으로 처리 */
  const leaveTo = (action: string) => () => {
    markBrandIntroSeen();
    trackCtaClick(action, 'brand_intro');
  };

  const subBtn =
    'flex items-center justify-center rounded-full border border-white/30 bg-white/10 px-4 py-3 text-[14px] font-semibold text-white backdrop-blur-[2px] transition hover:bg-white/20 active:scale-[0.98] md:px-6 md:text-[15px]';

  return (
    <div className="fixed inset-0 z-[80] bg-[#0a1628] text-white">
      <div className="absolute inset-0">
        <IntroVideo
          src={videoSrc}
          poster={posterSrc}
          reducedMotion={reducedMotion}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-[#0a1628]/60" aria-hidden />
      </div>

      <div className="relative z-10 flex h-full w-full flex-col items-center px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-[max(1.25rem,env(safe-area-inset-top))] text-center">
        <div className="flex w-full max-w-5xl items-center gap-2">
          <img
            src="/brand-mark-gold.png?v=10"
            alt=""
            width={32}
            height={32}
            className="h-7 w-7 shrink-0 object-contain md:h-8 md:w-8"
            draggable={false}
          />
          <p className="text-[16px] font-bold leading-none md:text-[18px]">{BRAND_INTRO.wordmark}</p>
        </div>

        <div className="flex w-full max-w-4xl flex-1 flex-col items-center justify-center">
          <p className="text-[14px] font-medium leading-snug text-white/80 md:text-[17px]">
            {APP_CONFIG.introStatText}
          </p>
          <span className="mt-4 block h-[2px] w-10 bg-[#c9a962] md:mt-5" aria-hidden />

          <h1 className="mt-4 text-[32px] font-light leading-[1.25] tracking-[-0.02em] md:mt-5 md:text-[56px]">
            <span className="block md:inline">{BRAND_INTRO.titleLead}</span>{' '}
            <strong className="block font-extrabold md:inline">{BRAND_INTRO.titleRest}</strong>
          </h1>
          <p className="mt-3 text-[11px] font-semibold tracking-[0.35em] text-white/75 md:mt-4 md:text-[15px]">
            {BRAND_INTRO.subtitleEn}
          </p>

          <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 md:mt-8 md:gap-x-6">
            {BRAND_INTRO.checks.map((label) => (
              <li key={label} className="inline-flex items-center gap-1 text-[15px] font-semibold md:text-[17px]">
                <Check size={16} strokeWidth={3} className="text-[#c9a962]" aria-hidden />
                {label}
              </li>
            ))}
          </ul>
          <p className="mt-2 text-[13px] font-medium text-white/80 md:text-[15px]">{BRAND_INTRO.promiseLine}</p>

          <div className="mt-7 grid w-full max-w-md grid-cols-3 gap-2 md:mt-9 md:flex md:max-w-none md:flex-wrap md:justify-center md:gap-3">
            <button
              type="button"
              onClick={() => onEnter('home')}
              className="col-span-3 flex items-center justify-center gap-2 rounded-full bg-[#c9a962] px-6 py-3.5 text-[16px] font-bold text-[#0a1628] transition active:scale-[0.98] md:px-8 md:text-[17px]"
            >
              {BRAND_INTRO.enterCta}
              <ArrowRight size={18} strokeWidth={2.5} aria-hidden />
            </button>
            <button type="button" onClick={() => onEnter('my')} className={subBtn}>
              {BRAND_INTRO.myCta}
            </button>
            <a href={BRAND_INTRO.guideHref} onClick={leaveTo('brand_intro_guides')} className={subBtn}>
              {BRAND_INTRO.guideCta}
            </a>
            <a href={BRAND_INTRO.verifiedHref} onClick={leaveTo('brand_intro_verified')} className={subBtn}>
              {BRAND_INTRO.verifiedCta}
            </a>
          </div>
        </div>

        <p className="text-[14px] font-bold text-white md:text-[17px]">{BRAND_INTRO.tagline}</p>
      </div>
    </div>
  );
}
