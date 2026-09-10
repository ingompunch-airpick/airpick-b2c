import type { ReactNode } from 'react';
import { BRAND_INTRO } from '../constants/marketing';
import { cn } from '../utils/cn';

/** 캐시 무효화 */
const LOGO_VER = '9';

type BrandLogoVariant = 'light' | 'premium' | 'gold' | 'color' | 'white';

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
      className={cn('flex items-center overflow-visible', className)}
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

function BrandMarkWordmark({ wordmarkClass }: { wordmarkClass: string }) {
  return (
    <>
      <picture className="brand-mark-motion inline-block origin-center will-change-transform">
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
          'select-none text-[1.15rem] font-bold tracking-[0.08em] md:text-[1.25rem]',
          wordmarkClass
        )}
      >
        {BRAND_INTRO.brand}
      </span>
    </>
  );
}

/**
 * light / color / white: 골드 마크 + 네이비 AIRPICK
 * premium / gold: 골드 마크 + 흰 AIRPICK (네이비 헤더)
 */
export default function BrandLogo({ variant = 'light' }: { variant?: BrandLogoVariant }) {
  const darkWordmark = variant === 'premium' || variant === 'gold';
  return (
    <BrandLogoLink className="gap-2.5 md:gap-3">
      <BrandMarkWordmark wordmarkClass={darkWordmark ? 'text-white' : 'text-[#0f1a2e]'} />
    </BrandLogoLink>
  );
}
