import { Menu } from 'lucide-react';
import BrandLogo from './BrandLogo';
import { cn } from '../utils/cn';

export default function Header({
  onOpenMenu,
  tone = 'default',
}: {
  onOpenMenu?: () => void;
  tone?: 'default' | 'premium';
}) {
  const premium = tone === 'premium';
  return (
    <header
      className={cn(
        'sticky top-0 z-40 flex items-center justify-between overflow-visible',
        premium
          ? 'bg-[#0f1a2e] px-5 py-3 sm:px-8 md:px-10 md:py-3.5 lg:px-12'
          : 'border-b border-neutral-200/90 bg-white/90 px-4 py-2 backdrop-blur-md md:px-8'
      )}
    >
      <BrandLogo variant={premium ? 'premium' : 'color'} />
      <button
        type="button"
        onClick={onOpenMenu}
        className={cn(
          'rounded-full p-2 transition-colors',
          premium
            ? 'text-white/80 hover:bg-white/10 hover:text-white'
            : 'text-muted hover:bg-neutral-100'
        )}
        aria-label="메뉴"
      >
        <Menu size={20} strokeWidth={1.75} />
      </button>
    </header>
  );
}
