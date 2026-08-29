import { useEffect, useRef, useState } from 'react';
import { Car, ChevronRight, Smartphone } from 'lucide-react';
import { BRAND_INTRO } from '../constants/marketing';

export function hasSeenBrandIntro(): boolean {
  return false;
}

export function markBrandIntroSeen(): void {
  /* 인트로는 홈 진입마다 표시 — 영구 숨김 없음 */
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

function IntroVideo({
  src,
  className,
  reducedMotion,
}: {
  src: string;
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
      /* autoplay blocked — still show first frame if loaded */
    });
  }, [src, reducedMotion, failed]);

  if (reducedMotion || failed) return null;

  return (
    <video
      ref={ref}
      className={className}
      src={src}
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

function IntroPanel({
  onParking,
  onEsim,
  onSkipHome,
}: {
  onParking: () => void;
  onEsim: () => void;
  onSkipHome: () => void;
}) {
  return (
    <div className="relative z-10 flex h-full w-full flex-col px-6 pb-10 pt-[max(2.5rem,env(safe-area-inset-top))] md:px-8 md:pb-12">
      <div className="flex flex-1 flex-col justify-center">
        <p className="text-[10px] font-bold tracking-[0.18em] text-[#c9a962]">
          {BRAND_INTRO.eyebrow}
        </p>
        <h1 className="mt-3 text-[2.35rem] font-bold tracking-[0.08em] text-white sm:text-[2.6rem]">
          {BRAND_INTRO.brand}
        </h1>
        <div className="mt-3.5 h-px w-8 bg-[#c9a962]/80" aria-hidden={true} />
        <p className="mt-5 max-w-[16rem] text-[15px] font-medium leading-relaxed text-white/85">
          {BRAND_INTRO.line}
        </p>
      </div>

      <div className="flex items-end justify-center gap-5 pb-2 md:justify-start">
        <button
          type="button"
          onClick={onParking}
          className="group flex w-[7.5rem] flex-col items-center gap-2.5"
        >
          <span className="flex h-[7.5rem] w-[7.5rem] flex-col items-center justify-center rounded-full bg-[#c9a962] text-[#0a1628] shadow-[0_0_32px_rgba(201,169,98,0.35)] transition group-active:scale-[0.97]">
            <Car size={28} strokeWidth={2} aria-hidden />
            <span className="mt-2 text-[13px] font-bold tracking-wide">
              {BRAND_INTRO.parkingLabel}
            </span>
          </span>
          <span className="text-[11px] font-medium text-white/50">{BRAND_INTRO.parkingHint}</span>
        </button>

        <button
          type="button"
          onClick={onEsim}
          className="group flex w-[6.5rem] flex-col items-center gap-2.5"
        >
          <span className="flex h-[6.5rem] w-[6.5rem] flex-col items-center justify-center rounded-full border border-white/25 bg-white/[0.04] text-white transition group-active:scale-[0.97]">
            <Smartphone size={22} strokeWidth={2} aria-hidden />
            <span className="mt-2 text-[12px] font-bold tracking-wide">
              {BRAND_INTRO.esimLabel}
            </span>
          </span>
          <span className="text-[11px] font-medium text-white/40">{BRAND_INTRO.esimHint}</span>
        </button>
      </div>

      <button
        type="button"
        onClick={onSkipHome}
        className="mt-8 inline-flex items-center justify-center gap-0.5 text-[12px] font-medium text-white/45 underline decoration-white/25 underline-offset-4 transition hover:text-white/75 md:justify-start"
      >
        {BRAND_INTRO.skipLabel}
        <ChevronRight size={14} strokeWidth={2.5} aria-hidden />
      </button>
    </div>
  );
}

/** 브랜드 게이트 — PC: 좌 영상 / 우 패널, 모바일: 배경 영상 + 오버레이 */
export default function BrandIntroGate({
  onParking,
  onEsim,
  onSkipHome,
}: {
  onParking: () => void;
  onEsim: () => void;
  onSkipHome: () => void;
}) {
  const reducedMotion = usePrefersReducedMotion();
  /** 모바일용 없으면 desktop 사용 (없는 URL이 HTML 200으로 떨어지면 재생 실패하므로 probe 하지 않음) */
  const videoSrc = BRAND_INTRO.videoDesktop;

  return (
    <div className="fixed inset-0 z-[80] bg-[#0a1628] text-white">
      {/* 모바일: 풀블리드 배경 영상 */}
      <div className="absolute inset-0 md:hidden">
        <IntroVideo
          src={videoSrc}
          reducedMotion={reducedMotion}
          className="h-full w-full object-cover"
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-[#0a1628] via-[#0a1628]/55 to-[#0a1628]/30"
          aria-hidden
        />
      </div>

      {/* PC: 좌 영상 / 우 패널 */}
      <div className="relative mx-auto flex h-full w-full max-w-6xl md:grid md:grid-cols-[minmax(0,1.6fr)_minmax(20rem,1fr)]">
        <div className="relative hidden min-h-0 overflow-hidden md:block">
          <IntroVideo
            src={videoSrc}
            reducedMotion={reducedMotion}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[#0a1628]/85"
            aria-hidden
          />
        </div>

        <div className="relative mx-auto flex h-full w-full max-w-lg md:max-w-none md:bg-[#0a1628]/92">
          <IntroPanel onParking={onParking} onEsim={onEsim} onSkipHome={onSkipHome} />
        </div>
      </div>
    </div>
  );
}
