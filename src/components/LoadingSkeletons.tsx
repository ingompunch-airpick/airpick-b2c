import { cn } from '../utils/cn';

function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn('animate-pulse rounded-xl bg-[#0f1a2e]/[0.08]', className)}
      aria-hidden
    />
  );
}

/** Firestore companies 로딩 — 홈(히어로 + 검색 카드) */
export function HomePageSkeleton() {
  return (
    <div className="bg-[#f4f6f8] pb-[calc(8rem+env(safe-area-inset-bottom))]" aria-busy="true" aria-label="불러오는 중">
      <div className="relative h-[200px] overflow-hidden bg-[#0f1a2e] md:h-[260px]">
        <Skeleton className="absolute inset-0 rounded-none bg-[#0f1a2e]/40" />
        <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-[#0f1a2e] to-transparent" />
      </div>
      <div className="relative z-10 mx-auto -mt-14 max-w-lg px-4 md:max-w-3xl">
        <div className="space-y-4 rounded-[28px] bg-white p-4 shadow-[0_12px_40px_rgba(15,26,46,0.08)] ring-1 ring-[#0f1a2e]/6 md:p-5">
          <div className="grid grid-cols-2 gap-2">
            <Skeleton className="h-12 rounded-full" />
            <Skeleton className="h-12 rounded-full" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Skeleton className="h-12 rounded-full" />
            <Skeleton className="h-12 rounded-full" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Skeleton className="h-12 rounded-2xl" />
              <Skeleton className="h-12 rounded-2xl" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-12 rounded-2xl" />
              <Skeleton className="h-12 rounded-2xl" />
            </div>
          </div>
          <Skeleton className="h-12 w-full rounded-full" />
        </div>
        <div className="mt-6 space-y-3">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-40 w-full rounded-2xl" />
          <Skeleton className="h-40 w-full rounded-2xl" />
        </div>
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

/** lazy 청크 로딩 — 이심 탭 */
export function EsimPageSkeleton() {
  return (
    <div className="space-y-5" aria-busy="true" aria-label="이심 제휴 안내 불러오는 중">
      <Skeleton className="h-10 w-full max-w-sm" />
      <Skeleton className="h-[4.5rem] w-full rounded-2xl" />
      <Skeleton className="h-3 w-64" />
    </div>
  );
}

/** lazy 청크 로딩 — 내 예약 탭 */
export function MyPageSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="예약 화면 불러오는 중">
      <Skeleton className="h-28 w-full rounded-3xl" />
      <Skeleton className="h-36 w-full rounded-3xl" />
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-40 w-full rounded-3xl" />
    </div>
  );
}
