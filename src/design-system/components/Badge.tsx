import type { ReactNode } from 'react';
import { cn } from '../../utils/cn';

type BadgeProps = {
  children: ReactNode;
  className?: string;
  tone?: 'brand' | 'muted' | 'dark' | 'warn';
};

export function Badge({ children, className, tone = 'brand' }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-mkt-pill px-3 py-1 text-xs font-semibold tracking-tight',
        tone === 'brand' && 'bg-mkt-brand/10 text-mkt-brand',
        tone === 'muted' && 'bg-mkt-sub text-mkt-muted border border-mkt-border',
        tone === 'dark' && 'bg-white/10 text-white',
        tone === 'warn' && 'bg-amber-50 text-amber-800 border border-amber-200',
        className
      )}
    >
      {children}
    </span>
  );
}
