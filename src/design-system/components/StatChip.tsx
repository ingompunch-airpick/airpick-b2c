import type { ReactNode } from 'react';
import { DemoLabel } from './DemoLabel';
import { cn } from '../../utils/cn';

type StatChipProps = {
  label: string;
  value: ReactNode;
  className?: string;
  demo?: boolean;
};

export function StatChip({ label, value, className, demo = true }: StatChipProps) {
  return (
    <div
      className={cn(
        'rounded-mkt border border-mkt-border bg-white px-4 py-3 shadow-mkt',
        className
      )}
    >
      <div className="mb-1 flex items-center justify-between gap-2">
        <p className="text-xs font-medium text-mkt-muted">{label}</p>
        {demo ? <DemoLabel /> : null}
      </div>
      <p className="text-lg font-bold tracking-tight text-mkt-ink">{value}</p>
    </div>
  );
}
