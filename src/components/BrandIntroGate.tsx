import { ArrowRight, FileCheck, ShieldCheck, Warehouse } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { BRAND_INTRO } from '../constants/marketing';

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

/** 브랜드 게이트 — 영상 위 히어로. 확인 배지와 비교 버튼 */
export default function BrandIntroGate({ onEnter }: { onEnter: () => void }) {
  const reducedMotion = usePrefersReducedMotion();
  const mdUp = useIsMdUp();
  const videoSrc = mdUp ? BRAND_INTRO.videoDesktop : BRAND_INTRO.videoMobile;
  const posterSrc = mdUp ? BRAND_INTRO.posterDesktop : BRAND_INTRO.posterMobile;
  const checkIcons = [FileCheck, ShieldCheck, Warehouse] as const;

  return (
    <div className="fixed inset-0 z-[80] bg-[#0a1628] text-white">
      <div className="absolute inset-0">
        <IntroVideo
          src={videoSrc}
          poster={posterSrc}
          reducedMotion={reducedMotion}
          className="h-full w-full object-cover"
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-[#0f1a2e]/45 via-transparent to-transparent"
          aria-hidden
        />
      </div>

      <div className="relative flex h-full w-full items-center justify-center">
        <div
          className={
            mdUp
              ? 'relative z-10 flex h-full w-full max-w-xl flex-col justify-end px-6 pb-[max(2.5rem,env(safe-area-inset-bottom))]'
              : 'relative z-10 flex h-full w-full max-w-lg flex-col justify-end px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]'
          }
        >
          <div className="max-w-xl rounded-[28px] bg-[#0f1a2e]/72 px-6 py-7 backdrop-blur-[2px] md:px-8 md:py-8">
            <div className="flex items-center gap-2">
              <img
                src="/brand-mark-gold.png?v=10"
                alt=""
                width={40}
                height={40}
                className="h-9 w-9 shrink-0 object-contain md:h-10 md:w-10"
                draggable={false}
              />
              <p className="text-[18px] font-bold leading-none text-white md:text-[20px]">{BRAND_INTRO.wordmark}</p>
            </div>
            <p className="mt-3 text-[16px] font-semibold leading-snug tracking-[-0.005em] text-[#c9a962] md:text-[18px]">
              {BRAND_INTRO.kicker}
            </p>
            <h1 className="mt-4 text-[28px] font-extrabold leading-[1.25] tracking-[-0.015em] text-white md:text-[38px]">
              {BRAND_INTRO.titleLead}
              <br />
              {BRAND_INTRO.titleRest}
            </h1>

            <ul className="mt-6 grid w-full grid-cols-3 gap-1.5">
              {BRAND_INTRO.checks.map((label, index) => {
                const Icon = checkIcons[index] ?? FileCheck;
                return (
                  <li
                    key={label}
                    className="inline-flex items-center justify-center gap-1 whitespace-nowrap rounded-full border border-white/25 bg-white/10 px-1.5 py-1.5 text-[12px] font-semibold tracking-[-0.005em] text-white md:gap-1.5 md:text-[13px]"
                  >
                    <Icon size={14} strokeWidth={2.25} className="shrink-0" aria-hidden />
                    {label}
                  </li>
                );
              })}
            </ul>

            <button
              type="button"
              onClick={onEnter}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-[#c9a962] px-6 py-3.5 text-[16px] font-bold tracking-[-0.005em] text-[#0a1628] transition active:scale-[0.98]"
            >
              {BRAND_INTRO.enterCta}
              <ArrowRight size={18} strokeWidth={2.5} aria-hidden />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
