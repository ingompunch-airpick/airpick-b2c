import { BRAND_INTRO } from '../constants/marketing';
import { cn } from '../utils/cn';

/** 캐시 무효화 */
const LOGO_VER = '6';

/**
 * color: 주황 풀로고 (제품 탭)
 * premium: 골드 마크 + 흰 AIRPICK 워드마크 (홈 · 인트로와 동일 타이포)
 * white: 흰 풀로고 (예비)
 */
export default function BrandLogo({
  variant = 'color',
}: {
  variant?: 'color' | 'premium' | 'gold' | 'white';
}) {
  if (variant === 'premium' || variant === 'gold') {
    return (
      <a
        href="/"
        className="flex items-center gap-2.5 overflow-visible md:gap-3"
        aria-label="에어픽 홈"
        onClick={(e) => {
          if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
          e.preventDefault();
          if (window.location.pathname === '/' || window.location.pathname === '') return;
          window.history.pushState({ tab: 'home' }, '', '/');
          window.dispatchEvent(new PopStateEvent('popstate'));
        }}
      >
        <picture>
          <source type="image/webp" srcSet={`/brand-mark-gold.webp?v=${LOGO_VER}`} />
          <img
            src={`/brand-mark-gold.png?v=${LOGO_VER}`}
            alt=""
            width={88}
            height={88}
            className="block h-9 w-9 select-none object-contain md:h-10 md:w-10"
            draggable={false}
            decoding="async"
            fetchPriority="high"
          />
        </picture>
        <span
          className={cn(
            'select-none text-[1.15rem] font-bold tracking-[0.08em] text-white md:text-[1.25rem]'
          )}
        >
          {BRAND_INTRO.brand}
        </span>
      </a>
    );
  }

  const src =
    variant === 'white'
      ? {
          webp: `/brand-logo-white.webp?v=${LOGO_VER}`,
          png: `/brand-logo-white-sm.png?v=${LOGO_VER}`,
        }
      : {
          webp: `/brand-logo.webp?v=${LOGO_VER}`,
          png: `/brand-logo-sm.png?v=${LOGO_VER}`,
        };

  return (
    <a
      href="/"
      className="flex items-center overflow-visible"
      aria-label="에어픽 홈"
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
        e.preventDefault();
        if (window.location.pathname === '/' || window.location.pathname === '') return;
        window.history.pushState({ tab: 'home' }, '', '/');
        window.dispatchEvent(new PopStateEvent('popstate'));
      }}
    >
      <picture className="overflow-visible">
        <source type="image/webp" srcSet={src.webp} />
        <img
          src={src.png}
          alt="AirPick"
          width={288}
          height={144}
          className="block h-20 w-auto max-w-none select-none object-contain object-left"
          draggable={false}
          decoding="async"
          fetchPriority="high"
        />
      </picture>
    </a>
  );
}
