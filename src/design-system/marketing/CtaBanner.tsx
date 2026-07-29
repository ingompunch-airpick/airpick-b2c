import type { ReactNode } from 'react';
import { Button } from '../components/Button';
import { Container } from '../components/Container';
import { FadeIn } from '../components/FadeIn';
import { cn } from '../../utils/cn';

type CtaBannerProps = {
  title: ReactNode;
  description?: ReactNode;
  primaryHref: string;
  primaryLabel: string;
  secondaryHref?: string;
  secondaryLabel?: string;
  className?: string;
};

export function CtaBanner({
  title,
  description,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
  className,
}: CtaBannerProps) {
  return (
    <div className={cn('relative overflow-hidden bg-mkt-brand py-24 md:py-32', className)}>
      <div
        className="pointer-events-none absolute inset-0 mkt-grid-bg opacity-20"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-24 -top-24 size-80 rounded-full bg-mkt-accent/40 blur-3xl"
        aria-hidden
      />
      <Container className="relative">
        <FadeIn className="mx-auto max-w-[760px] text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl lg:text-5xl lg:leading-[1.15]">
            {title}
          </h2>
          {description ? (
            <p className="mt-5 text-base text-white/80 md:text-lg">{description}</p>
          ) : null}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Button href={primaryHref} variant="white">
              {primaryLabel}
            </Button>
            {secondaryHref && secondaryLabel ? (
              <Button
                href={secondaryHref}
                variant="secondary"
                className="border-white/30 bg-transparent text-white hover:bg-white/10"
              >
                {secondaryLabel}
              </Button>
            ) : null}
          </div>
        </FadeIn>
      </Container>
    </div>
  );
}
