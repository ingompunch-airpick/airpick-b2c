import type { ReactNode } from 'react';
import { BRAND_INTRO } from '../constants/marketing';
import { cn } from '../utils/cn';

/** 캐시 무효화 */
const LOGO_VER = '7';

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
 * light: 골드 마크 + 네이비 AIRPICK (제품 탭 · 흰 헤더)
 * premium: 골드 마크 + 흰 AIRPICK (홈 · 네이비 헤더)
 * color / white: 레거시 풀로고 (예비)
 */
export default function BrandLogo({ variant = 'light' }: { variant?: BrandLogoVariant }) {
  if (variant === 'premium' || variant === 'gold') {
    return (
      <BrandLogoLink className="gap-2.5 md:gap-3">
        <BrandMarkWordmark wordmarkClass="text-white" />
      </BrandLogoLink>
    );
  }

  if (variant === 'light') {
    return (
      <BrandLogoLink className="gap-2.5 md:gap-3">
        <BrandMarkWordmark wordmarkClass="text-[#0f1a2e]" />
      </BrandLogoLink>
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
    <BrandLogoLink>
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
    </BrandLogoLink>
  );
}
