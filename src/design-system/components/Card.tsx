import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../../utils/cn';

type CardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  hover?: boolean;
  glass?: boolean;
  dark?: boolean;
};

export function Card({
  children,
  className,
  hover = false,
  glass = false,
  dark = false,
  ...rest
}: CardProps) {
  return (
    <div
      className={cn(
        'rounded-mkt border p-6 shadow-mkt transition duration-500 ease-out',
        dark
          ? 'border-white/10 bg-white/5 text-white'
          : 'border-mkt-border bg-white text-mkt-ink',
        glass && 'backdrop-blur-xl bg-white/70 border-white/40',
        dark && glass && 'bg-white/8 border-white/12',
        hover && 'hover:-translate-y-1 hover:shadow-mkt-hover',
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
