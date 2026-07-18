import { cn } from '../utils/cn';

function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn('animate-pulse rounded-xl bg-sky-tint/90', className)}
      aria-hidden
    />
  );
}

/** Firestore companies 로딩 — 홈 지도 허브 */
export function HomePageSkeleton() {
  return (
    <div className="relative h-full min-h-[60vh] w-full" aria-busy="true" aria-label="불러오는 중">
      <Skeleton className="absolute inset-0 rounded-none" />
      <div className="absolute inset-x-3 top-2 space-y-2">
        <Skeleton className="h-11 w-full rounded-2xl" />
        <Skeleton className="h-9 w-full rounded-full" />
      </div>
      <div className="absolute inset-x-0 bottom-0 h-[45%] rounded-t-3xl bg-white p-4 shadow-lg">
        <Skeleton className="mx-auto h-1 w-10 rounded-full" />
        <Skeleton className="mt-4 h-5 w-40" />
        <Skeleton className="mt-3 h-20 w-full rounded-2xl" />
        <Skeleton className="mt-2 h-20 w-full rounded-2xl" />
      </div>
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
