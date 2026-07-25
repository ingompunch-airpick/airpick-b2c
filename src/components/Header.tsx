import { Menu } from 'lucide-react';
import BrandLogo from './BrandLogo';

export default function Header({ onOpenMenu }: { onOpenMenu?: () => void }) {
  return (
    <header className="sticky top-0 z-40 flex items-center justify-between overflow-visible border-b border-sky-border/80 bg-sky-bg/90 px-4 py-2 backdrop-blur-md">
      <BrandLogo />
      <button
        type="button"
        onClick={onOpenMenu}
        className="rounded-full p-2 text-muted transition-colors hover:bg-sky-soft"
        aria-label="메뉴"
      >
        <Menu size={20} strokeWidth={1.75} />
      </button>
    </header>
  );
}
