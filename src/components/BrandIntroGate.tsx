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

/** Tailwind md(768px) */
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
  desktop,
}: {
  onParking: () => void;
  onEsim: () => void;
  onSkipHome: () => void;
  desktop: boolean;
}) {
  return (
    <div
      className={
        desktop
          ? 'relative z-10 ml-auto flex h-full w-full max-w-md flex-col px-10 pb-12 pt-[max(2.5rem,env(safe-area-inset-top))]'
          : 'relative z-10 flex h-full w-full max-w-lg flex-col px-6 pb-10 pt-[max(2.5rem,env(safe-area-inset-top))]'
      }
    >
      <div className={`flex flex-1 flex-col justify-center ${desktop ? '' : ''}`}>
        <p className="text-[10px] font-bold tracking-[0.18em] text-[#c9a962]">
          {BRAND_INTRO.eyebrow}
        </p>
        <h1 className="mt-3 text-[2.35rem] font-bold tracking-[0.08em] text-white sm:text-[2.75rem]">
          {BRAND_INTRO.brand}
        </h1>
        <div className="mt-3.5 h-px w-8 bg-[#c9a962]/80" aria-hidden={true} />
        <p className="mt-5 max-w-[16rem] text-[15px] font-medium leading-relaxed text-white/90 drop-shadow-[0_1px_8px_rgba(0,0,0,0.45)]">
          {BRAND_INTRO.line}
        </p>
      </div>

      <div className={`flex items-end gap-5 pb-2 ${desktop ? 'justify-start' : 'justify-center'}`}>
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
          <span className="text-[11px] font-medium text-white/55">{BRAND_INTRO.parkingHint}</span>
        </button>

        <button
          type="button"
          onClick={onEsim}
          className="group flex w-[6.5rem] flex-col items-center gap-2.5"
        >
          <span className="flex h-[6.5rem] w-[6.5rem] flex-col items-center justify-center rounded-full border border-white/30 bg-black/25 text-white backdrop-blur-[2px] transition group-active:scale-[0.97]">
            <Smartphone size={22} strokeWidth={2} aria-hidden />
            <span className="mt-2 text-[12px] font-bold tracking-wide">
              {BRAND_INTRO.esimLabel}
            </span>
          </span>
          <span className="text-[11px] font-medium text-white/45">{BRAND_INTRO.esimHint}</span>
        </button>
      </div>

      <button
        type="button"
        onClick={onSkipHome}
        className={`mt-8 inline-flex items-center gap-0.5 text-[12px] font-medium text-white/50 underline decoration-white/25 underline-offset-4 transition hover:text-white/80 ${
          desktop ? 'justify-start' : 'justify-center'
        }`}
      >
        {BRAND_INTRO.skipLabel}
        <ChevronRight size={14} strokeWidth={2.5} aria-hidden />
      </button>
    </div>
  );
}

/** 브랜드 게이트 — PC/모바일 모두 풀스크린 영상 + UI 오버레이 */
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
  const mdUp = useIsMdUp();
  const videoSrc = mdUp ? BRAND_INTRO.videoDesktop : BRAND_INTRO.videoMobile;

  return (
    <div className="fixed inset-0 z-[80] bg-[#0a1628] text-white">
      <div className="absolute inset-0">
        <IntroVideo
          src={videoSrc}
          reducedMotion={reducedMotion}
          className="h-full w-full object-cover"
        />
        {/* 가독성용 그라데이션 — PC는 우측, 모바일은 하단 강조 */}
        <div
          className={
            mdUp
              ? 'absolute inset-0 bg-gradient-to-r from-black/25 via-black/35 to-[#0a1628]/88'
              : 'absolute inset-0 bg-gradient-to-t from-[#0a1628] via-[#0a1628]/55 to-[#0a1628]/30'
          }
          aria-hidden
        />
      </div>

      <div className="relative mx-auto flex h-full w-full max-w-7xl">
        <IntroPanel
          desktop={mdUp}
          onParking={onParking}
          onEsim={onEsim}
          onSkipHome={onSkipHome}
        />
      </div>
    </div>
  );
}
