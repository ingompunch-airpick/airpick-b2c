import { useEffect, useState, type ReactNode } from 'react';
import { Button } from '../components/Button';
import { Container } from '../components/Container';
import { cn } from '../../utils/cn';

export type MarketingNavLink = {
  href: string;
  label: string;
};

type MarketingNavbarProps = {
  brandHref?: string;
  brand?: ReactNode;
  links: MarketingNavLink[];
  ctaHref: string;
  ctaLabel?: string;
};

export function MarketingNavbar({
  brandHref = '/',
  brand = 'AirPick',
  links,
  ctaHref,
  ctaLabel = '입점 신청',
}: MarketingNavbarProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition duration-500 ease-out',
        scrolled
          ? 'border-b border-mkt-border/80 bg-white/80 shadow-mkt backdrop-blur-xl'
          : 'bg-transparent'
      )}
    >
      <Container className="flex h-16 items-center justify-between gap-4 lg:h-[4.25rem]">
        <a
          href={brandHref}
          className="text-lg font-bold tracking-tight text-mkt-ink transition hover:text-mkt-brand"
        >
          {brand}
        </a>
        <nav className="hidden items-center gap-8 md:flex" aria-label="파트너 메뉴">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-mkt-muted transition hover:text-mkt-ink"
            >
              {link.label}
            </a>
          ))}
        </nav>
        <Button href={ctaHref} className="px-5 py-2.5 text-sm">
          {ctaLabel}
        </Button>
      </Container>
    </header>
  );
}
