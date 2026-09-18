import { cn } from '../utils/cn';

type AffiliatePriceProps = {
  /** 실제 결제·견적가(할인 반영 후) */
  price: number;
  /** 제휴 손님 할인액(원). 0이면 할인가만 표시 */
  affiliateDiscountWon?: number;
  size?: 'sm' | 'md' | 'lg';
  align?: 'start' | 'end' | 'center';
  /** 할인가 숫자 클래스 (기본: text-[#0f1a2e]) */
  priceClassName?: string;
  className?: string;
};

/**
 * 제휴 할인이 있으면 정상가 취소선 + 할인가.
 * `price`는 이미 할인 반영된 금액이어야 한다.
 */
export default function AffiliatePrice({
  price,
  affiliateDiscountWon = 0,
  size = 'md',
  align = 'end',
  priceClassName,
  className,
}: AffiliatePriceProps) {
  const discount = Math.max(0, Math.round(affiliateDiscountWon));
  const listPrice = discount > 0 ? price + discount : price;
  const alignCls =
    align === 'start'
      ? 'items-start text-left'
      : align === 'center'
        ? 'items-center text-center'
        : 'items-end text-right';
  const priceCls =
    size === 'lg'
      ? 'text-lg font-bold'
      : size === 'sm'
        ? 'text-sm font-bold'
        : 'text-base font-bold';
  const listCls =
    size === 'lg' ? 'text-xs' : size === 'sm' ? 'text-[10px]' : 'text-[11px]';
  const finalPriceCls = cn('tabular-nums', priceCls, priceClassName ?? 'text-[#0f1a2e]');

  if (discount <= 0) {
    return (
      <p className={cn(finalPriceCls, align === 'end' && 'shrink-0', className)}>
        {price.toLocaleString()}원
      </p>
    );
  }

  return (
    <div
      className={cn(
        'flex flex-col gap-0.5',
        alignCls,
        align === 'end' && 'shrink-0',
        className
      )}
    >
      <span className={cn('font-semibold tabular-nums text-muted-light line-through', listCls)}>
        {listPrice.toLocaleString()}원
      </span>
      <span className={finalPriceCls}>
        {price.toLocaleString()}
        <span className="text-[0.85em]">원</span>
      </span>
      <span className={cn('font-bold tabular-nums text-[#b8923a]', listCls)}>
        −{discount.toLocaleString()}원
      </span>
    </div>
  );
}
