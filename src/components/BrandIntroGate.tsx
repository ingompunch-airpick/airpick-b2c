import { useEffect, useRef, useState } from 'react';
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

/** 브랜드 게이트 — 풀스크린 영상 + 시작하기(홈)만 */
export default function BrandIntroGate({ onEnter }: { onEnter: () => void }) {
  const reducedMotion = usePrefersReducedMotion();
  const mdUp = useIsMdUp();
  const videoSrc = mdUp ? BRAND_INTRO.videoDesktop : BRAND_INTRO.videoMobile;
  const posterSrc = mdUp ? BRAND_INTRO.posterDesktop : BRAND_INTRO.posterMobile;

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
          className={
            mdUp
              ? 'absolute inset-0 bg-gradient-to-r from-black/20 via-black/40 to-[#0a1628]/90'
              : 'absolute inset-0 bg-gradient-to-t from-[#0a1628] via-[#0a1628]/60 to-[#0a1628]/35'
          }
          aria-hidden
        />
      </div>

      <div className="relative mx-auto flex h-full w-full max-w-7xl">
        <div
          className={
            mdUp
              ? 'relative z-10 ml-auto flex h-full w-full max-w-md flex-col justify-center px-10 pb-12 pt-[max(2.5rem,env(safe-area-inset-top))]'
              : 'relative z-10 mx-auto flex h-full w-full max-w-lg flex-col justify-end px-6 pb-14 pt-[max(2.5rem,env(safe-area-inset-top))]'
          }
        >
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

          <button
            type="button"
            onClick={onEnter}
            className="mt-10 w-full max-w-[16rem] rounded-full bg-[#c9a962] py-3.5 text-[15px] font-bold tracking-wide text-[#0a1628] shadow-[0_0_28px_rgba(201,169,98,0.35)] transition active:scale-[0.98]"
          >
            {BRAND_INTRO.enterCta}
          </button>
        </div>
      </div>
    </div>
  );
}
