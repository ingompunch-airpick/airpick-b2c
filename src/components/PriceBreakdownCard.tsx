import type { PriceBreakdown } from '../utils/pricing';
import { parkingTypeLabel } from '../utils/parkingType';

export default function PriceBreakdownCard({
  breakdown,
  memberDiscountWon = 0,
  pointSpendWon = 0,
}: {
  breakdown: PriceBreakdown;
  memberDiscountWon?: number;
  pointSpendWon?: number;
}) {
  const discount = Math.max(0, Math.round(memberDiscountWon));
  const points = Math.max(0, Math.round(pointSpendWon));
  const total = Math.max(0, breakdown.total - discount - points);
  return (
    <div className="rounded-2xl bg-[#f4f5f7] p-4">
      <div className="mb-2 border-b border-sky-border/60 pb-2">
        <span className="text-[13px] font-bold text-brand">요금 명세</span>
      </div>
      <div className="space-y-1.5 text-[13px]">
        <div className="flex justify-between gap-3 font-semibold text-ink">
          <span>{parkingTypeLabel(breakdown.isIndoor)} 주차</span>
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
        {breakdown.nightSurcharge > 0 && (
          <div className="flex justify-between gap-3 font-semibold text-ink">
            <span>
              야간·새벽 할증
              {breakdown.nightDetails.length > 0 && (
                <span className="block text-[13px] font-medium text-muted">
                  {breakdown.nightDetails.join(' · ')}
                </span>
              )}
            </span>
            <span className="shrink-0 tabular-nums text-brand">
              +{breakdown.nightSurcharge.toLocaleString()}원
            </span>
          </div>
        )}
        {breakdown.t2Surcharge > 0 && (
          <div className="flex justify-between gap-3 font-semibold text-ink">
            <span>T2 터미널 할증</span>
            <span className="shrink-0 tabular-nums text-brand">
              +{breakdown.t2Surcharge.toLocaleString()}원
            </span>
          </div>
        )}
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
        {(breakdown.affiliateDiscountWon ?? 0) > 0 && (
          <div className="flex justify-between gap-3 font-semibold text-ink">
            <span>제휴 할인</span>
            <span className="shrink-0 tabular-nums text-[#b8923a]">
              −{(breakdown.affiliateDiscountWon ?? 0).toLocaleString()}원
            </span>
          </div>
        )}
        {discount > 0 && (
          <div className="flex justify-between gap-3 font-semibold text-ink">
            <span>쿠폰 할인</span>
            <span className="shrink-0 tabular-nums text-gold">−{discount.toLocaleString()}원</span>
          </div>
        )}
        {points > 0 && (
          <div className="flex justify-between gap-3 font-semibold text-ink">
            <span>포인트 사용</span>
            <span className="shrink-0 tabular-nums text-gold">−{points.toLocaleString()}원</span>
          </div>
        )}
        <div className="flex justify-between gap-3 border-t border-sky-border/60 pt-2 text-sm font-bold text-ink">
          <span>최종 합계</span>
          <span className="shrink-0 tabular-nums text-gold">{total.toLocaleString()}원</span>
        </div>
      </div>
    </div>
  );
}
