import type { ReactNode } from 'react';
import { cn } from '../../utils/cn';

type SectionProps = {
  id?: string;
  children: ReactNode;
  className?: string;
  tone?: 'white' | 'sub' | 'dark' | 'brand';
  /** default section vertical rhythm ~160px */
  compact?: boolean;
};

export function Section({
  id,
  children,
  className,
  tone = 'white',
  compact = false,
}: SectionProps) {
  return (
    <section
      id={id}
      className={cn(
        compact ? 'py-20 md:py-24' : 'py-24 md:py-32 lg:py-40',
        tone === 'white' && 'bg-mkt-bg',
        tone === 'sub' && 'bg-mkt-sub',
        tone === 'dark' && 'bg-mkt-dark text-white',
        tone === 'brand' && 'bg-mkt-brand text-white',
        className
      )}
    >
      {children}
    </section>
  );
}
