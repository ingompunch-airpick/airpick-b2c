import type { PriceBreakdown } from '../utils/pricing';
import { parkingTypeLabel } from '../utils/parkingType';
import { cn } from '../utils/cn';

export default function PriceBreakdownCard({ breakdown }: { breakdown: PriceBreakdown }) {
  return (
    <div className="rounded-2xl bg-sky-bg p-4 ring-1 ring-sky-border/70">
      <div className="mb-2 flex items-center justify-between border-b border-sky-border/60 pb-2">
        <span className="text-xs font-bold text-brand">요금 명세</span>
        <span className="text-[11px] font-semibold text-muted">총 {breakdown.days}일</span>
      </div>
      <div className="space-y-1.5 text-[12px]">
        <div className="flex justify-between gap-3 font-semibold text-ink">
          <span>
            {parkingTypeLabel(breakdown.isIndoor)} 주차 (기본 {breakdown.baseDays}일)
          </span>
          <span className="shrink-0 tabular-nums">{breakdown.basePrice.toLocaleString()}원</span>
        </div>
        {breakdown.extraDays > 0 && (
          <div className="flex justify-between gap-3 font-semibold text-ink">
            <span>초과일수 (+{breakdown.extraDays}일)</span>
            <span className="shrink-0 tabular-nums">
              {breakdown.extraAmount.toLocaleString()}원
            </span>
          </div>
        )}
        <div className="flex justify-between gap-3 font-semibold text-ink">
          <span>
            야간·새벽 할증
            {breakdown.nightDetails.length > 0 && (
              <span className="block text-[10px] font-medium text-muted">
                {breakdown.nightDetails.join(' · ')}
              </span>
            )}
          </span>
          <span
            className={cn(
              'shrink-0 tabular-nums',
              breakdown.nightSurcharge > 0 ? 'text-brand' : 'text-muted'
            )}
          >
            {breakdown.nightSurcharge > 0
              ? `+${breakdown.nightSurcharge.toLocaleString()}원`
              : '0원'}
          </span>
        </div>
        <div className="flex justify-between gap-3 font-semibold text-ink">
          <span>T2 터미널 할증</span>
          <span
            className={cn(
              'shrink-0 tabular-nums',
              breakdown.t2Surcharge > 0 ? 'text-brand' : 'text-muted'
            )}
          >
            {breakdown.t2Surcharge > 0
              ? `+${breakdown.t2Surcharge.toLocaleString()}원`
              : '0원'}
          </span>
        </div>
        {breakdown.peakSurcharge > 0 && (
          <div className="flex justify-between gap-3 font-semibold text-ink">
            <span>성수기 할증</span>
            <span className="shrink-0 tabular-nums text-brand">
              +{breakdown.peakSurcharge.toLocaleString()}원
            </span>
          </div>
        )}
        {breakdown.valetFee > 0 && (
          <div className="flex justify-between gap-3 font-semibold text-ink">
            <span>대면 입고</span>
            <span className="shrink-0 tabular-nums text-brand">
              +{breakdown.valetFee.toLocaleString()}원
            </span>
          </div>
        )}
        <div className="flex justify-between gap-3 border-t border-sky-border/60 pt-2 text-sm font-bold text-ink">
          <span>최종 합계</span>
          <span className="shrink-0 tabular-nums text-brand">
            {breakdown.total.toLocaleString()}원
          </span>
        </div>
      </div>
    </div>
  );
}
