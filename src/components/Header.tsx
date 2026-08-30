import { Menu } from 'lucide-react';
import BrandLogo from './BrandLogo';
import { cn } from '../utils/cn';

/** 앱 공통 — 네이비 스티키 헤더 (홈·탭 동일) */
export default function Header({
  onOpenMenu,
  wide = false,
}: {
  onOpenMenu?: () => void;
  /** 홈·PC 넓은 레이아웃 */
  wide?: boolean;
}) {
  return (
    <header className="sticky top-0 z-40 w-full bg-[#0f1a2e]">
      <div
        className={cn(
          'mx-auto flex items-center justify-between overflow-visible px-5 py-3 sm:px-8 md:py-3.5',
          wide ? 'max-w-6xl md:px-10 lg:px-12' : 'max-w-lg md:px-8'
        )}
      >
        <BrandLogo variant="premium" />
        <button
          type="button"
          onClick={onOpenMenu}
          className="rounded-full p-2 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
          aria-label="메뉴"
        >
          <Menu size={20} strokeWidth={1.75} />
        </button>
      </div>
    </header>
  );
}
