import { cn } from '../utils/cn';

function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn('animate-pulse rounded-xl bg-sky-tint/90', className)}
      aria-hidden
    />
  );
}

/** Firestore companies 로딩 — 홈 Hero·카테고리 */
export function HomePageSkeleton() {
  return (
    <div className="space-y-6 pb-2" aria-busy="true" aria-label="불러오는 중">
      <section className="px-0.5 pb-1 pt-1">
        <Skeleton className="h-9 w-[88%] max-w-sm" />
        <Skeleton className="mt-2 h-7 w-[70%] max-w-xs" />
      </section>
      <Skeleton className="h-40 w-full rounded-3xl" />
      <Skeleton className="h-36 w-full rounded-3xl" />
    </div>
  );
}

/** Firestore companies 로딩 — 주차대행 비교 탭 */
export function ComparePageSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="제휴 업체 불러오는 중">
      <div className="space-y-2 px-0.5">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-7 w-56" />
        <Skeleton className="h-4 w-full max-w-xs" />
      </div>
      <Skeleton className="h-52 w-full rounded-3xl" />
      <Skeleton className="h-10 w-full rounded-xl" />
      <Skeleton className="h-4 w-40" />
      <div className="space-y-2.5">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-[4.5rem] w-full rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
