import type { ReactNode } from 'react';
import { cn } from '../../utils/cn';

type DeviceFrameProps = {
  children: ReactNode;
  variant?: 'macbook' | 'phone' | 'phoneNatural';
  className?: string;
  label?: string;
  /** Browser chrome address bar (macbook only) */
  urlBar?: string;
  /** Override macbook content aspect / height */
  contentClassName?: string;
};

export function DeviceFrame({
  children,
  variant = 'macbook',
  className,
  label,
  urlBar = 'www.에어픽.kr/parking',
  contentClassName,
}: DeviceFrameProps) {
  if (variant === 'phone' || variant === 'phoneNatural') {
    return (
      <div className={cn('mx-auto w-full max-w-[280px]', className)}>
        {label ? (
          <p className="mb-3 text-center text-xs font-medium text-mkt-muted">{label}</p>
        ) : null}
        <div className="rounded-[2rem] border border-mkt-border bg-mkt-ink p-2 shadow-mkt-hover">
          <div
            className={cn(
              'overflow-hidden rounded-[1.5rem] bg-white',
              variant === 'phone' ? 'aspect-[9/19]' : 'min-h-0',
              contentClassName
            )}
          >
            {children}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('w-full', className)}>
      {label ? (
        <p className="mb-3 text-center text-xs font-medium text-mkt-muted">{label}</p>
      ) : null}
      <div className="rounded-t-xl border border-b-0 border-mkt-border bg-mkt-sub px-3 py-2">
        <div className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-[#ff5f57]" />
          <span className="size-2.5 rounded-full bg-[#febc2e]" />
          <span className="size-2.5 rounded-full bg-[#28c840]" />
          <span className="ml-3 flex-1 truncate rounded-md bg-white px-2 py-1 text-[10px] text-mkt-muted">
            {urlBar}
          </span>
        </div>
      </div>
      <div
        className={cn(
          'overflow-hidden rounded-b-xl border border-mkt-border bg-white shadow-mkt-hover',
          contentClassName ?? 'aspect-[16/10]'
        )}
      >
        {children}
      </div>
    </div>
  );
}
