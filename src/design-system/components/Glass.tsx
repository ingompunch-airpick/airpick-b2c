import type { ReactNode } from 'react';
import { cn } from '../../utils/cn';

type GlassProps = {
  children: ReactNode;
  className?: string;
  dark?: boolean;
};

export function Glass({ children, className, dark = false }: GlassProps) {
  return (
    <div
      className={cn(
        'rounded-mkt border backdrop-blur-2xl shadow-mkt',
        dark
          ? 'border-white/12 bg-white/8 text-white'
          : 'border-white/50 bg-white/70 text-mkt-ink',
        className
      )}
    >
      {children}
    </div>
  );
}
