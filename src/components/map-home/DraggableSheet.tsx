import { useEffect, useRef, useState, type ReactNode } from 'react';
import { cn } from '../../utils/cn';

type SheetSnap = 'peek' | 'mid' | 'full';

const SNAP_VH: Record<SheetSnap, number> = {
  peek: 0.28,
  mid: 0.52,
  full: 0.82,
};

export default function DraggableSheet({
  title,
  subtitle,
  children,
  initialSnap = 'mid',
  className,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  initialSnap?: SheetSnap;
  className?: string;
}) {
  const [snap, setSnap] = useState<SheetSnap>(initialSnap);
  const startY = useRef(0);
  const startSnap = useRef<SheetSnap>(initialSnap);

  useEffect(() => {
    setSnap(initialSnap);
  }, [initialSnap, title]);

  const heightVh = SNAP_VH[snap] * 100;

  const onPointerDown = (e: React.PointerEvent) => {
    startY.current = e.clientY;
    startSnap.current = snap;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const onPointerUp = (e: React.PointerEvent) => {
    const dy = startY.current - e.clientY;
    const order: SheetSnap[] = ['peek', 'mid', 'full'];
    const idx = order.indexOf(startSnap.current);
    if (dy > 48) setSnap(order[Math.min(idx + 1, order.length - 1)]!);
    else if (dy < -48) setSnap(order[Math.max(idx - 1, 0)]!);
  };

  return (
    <section
      className={cn(
        'pointer-events-auto absolute inset-x-0 bottom-0 z-20 flex flex-col rounded-t-3xl bg-white shadow-[0_-8px_32px_rgba(25,31,40,0.12)] ring-1 ring-sky-border/60 transition-[height] duration-300 ease-out',
        className
      )}
      style={{ height: `${heightVh}vh` }}
      aria-label={title}
    >
      <div
        className="flex shrink-0 cursor-grab flex-col items-center px-4 pb-2 pt-3 active:cursor-grabbing"
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
      >
        <div className="h-1 w-10 rounded-full bg-sky-border" />
        <div className="mt-3 w-full text-left">
          <h2 className="text-base font-bold text-ink">{title}</h2>
          {subtitle ? <p className="mt-0.5 text-xs font-medium text-muted">{subtitle}</p> : null}
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        {children}
      </div>
    </section>
  );
}
