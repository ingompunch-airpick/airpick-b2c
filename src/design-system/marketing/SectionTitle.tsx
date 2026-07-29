import type { ReactNode } from 'react';
import { FadeIn } from '../components/FadeIn';
import { cn } from '../../utils/cn';

type SectionTitleProps = {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: 'left' | 'center';
  light?: boolean;
  className?: string;
};

export function SectionTitle({
  eyebrow,
  title,
  description,
  align = 'left',
  light = false,
  className,
}: SectionTitleProps) {
  return (
    <FadeIn
      className={cn(
        'max-w-[760px]',
        align === 'center' && 'mx-auto text-center',
        className
      )}
    >
      {eyebrow ? (
        <p
          className={cn(
            'mb-4 text-sm font-semibold tracking-tight',
            light ? 'text-white/70' : 'text-mkt-brand'
          )}
        >
          {eyebrow}
        </p>
      ) : null}
      <h2
        className={cn(
          'text-3xl font-bold tracking-tight md:text-4xl lg:text-[2.75rem] lg:leading-[1.15]',
          light ? 'text-white' : 'text-mkt-ink'
        )}
      >
        {title}
      </h2>
      {description ? (
        <p
          className={cn(
            'mt-5 text-base leading-relaxed md:text-lg',
            light ? 'text-white/75' : 'text-mkt-muted'
          )}
        >
          {description}
        </p>
      ) : null}
    </FadeIn>
  );
}
