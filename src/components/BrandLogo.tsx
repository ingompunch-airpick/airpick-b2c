import type { ReactNode } from 'react';
import { BRAND_INTRO } from '../constants/marketing';
import { cn } from '../utils/cn';

/** 캐시 무효화 */
const LOGO_VER = '9';

type BrandLogoVariant = 'light' | 'premium' | 'gold' | 'color' | 'white';

function BrandMark() {
  return (
    <picture>
      <source type="image/webp" srcSet={`/brand-mark-gold.webp?v=${LOGO_VER}`} />
      <img
        src={`/brand-mark-gold.png?v=${LOGO_VER}`}
        alt=""
        width={88}
        height={88}
        className="block h-full w-full select-none object-contain"
        draggable={false}
        decoding="async"
        fetchPriority="high"
      />
    </picture>
  );
}

function BrandLogoLink({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <a
      href="/"
      className={cn('flex items-center', className)}
      aria-label="에어픽 홈"
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
        e.preventDefault();
        if (window.location.pathname === '/' || window.location.pathname === '') return;
        window.history.pushState({ tab: 'home' }, '', '/');
        window.dispatchEvent(new PopStateEvent('popstate'));
      }}
    >
      {children}
    </a>
  );
}

/**
 * light / color / white: 골드 마크 + 네이비 AIRPICK
 * premium / gold: 골드 마크 + 흰 AIRPICK (네이비 헤더)
 * 마크만 은색 → 금색 → 은색으로 바뀐다.
 */
export default function BrandLogo({ variant = 'light' }: { variant?: BrandLogoVariant }) {
  const darkWordmark = variant === 'premium' || variant === 'gold';
  return (
    <BrandLogoLink className="gap-2.5 md:gap-3">
      <span className="brand-mark-stage">
        <span className="brand-mark">
          <BrandMark />
        </span>
        <span className="brand-mark brand-mark-silver" aria-hidden>
          <BrandMark />
        </span>
      </span>
      <span
        className={cn(
          'select-none text-[1.15rem] font-bold tracking-[0.08em] md:text-[1.25rem]',
          darkWordmark ? 'text-white' : 'text-[#0f1a2e]'
        )}
      >
        {BRAND_INTRO.brand}
      </span>
    </BrandLogoLink>
  );
}
