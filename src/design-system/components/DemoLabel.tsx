import { cn } from '../../utils/cn';

type DemoLabelProps = {
  label?: 'Demo UI' | 'Coming Soon' | '예시 UI' | '실제 앱';
  className?: string;
};

/** Metrics that are not live ops data must show this. */
export function DemoLabel({ label = 'Demo UI', className }: DemoLabelProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border border-dashed border-mkt-border bg-mkt-sub/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-mkt-muted',
        className
      )}
    >
      {label}
    </span>
  );
}
