import { Bell, Menu } from 'lucide-react';
import BrandLogo from './BrandLogo';

export default function Header({ onOpenMenu }: { onOpenMenu?: () => void }) {
  return (
    <header className="sticky top-0 z-40 flex items-center justify-between border-b border-sky-border/80 bg-sky-bg/90 px-4 py-3 backdrop-blur-md">
      <BrandLogo />
      <div className="flex items-center gap-0.5">
        <button
          type="button"
          className="rounded-full p-2 text-muted transition-colors hover:bg-sky-soft"
          aria-label="알림"
        >
          <Bell size={20} strokeWidth={1.75} />
        </button>
        <button
          type="button"
          onClick={onOpenMenu}
          className="rounded-full p-2 text-muted transition-colors hover:bg-sky-soft"
          aria-label="메뉴"
        >
          <Menu size={20} strokeWidth={1.75} />
        </button>
      </div>
    </header>
  );
}
