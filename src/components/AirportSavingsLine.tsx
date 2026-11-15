import { AIRPORT_PARKING_RATES, airportParkingSavingsWon } from '../data/airportParkingRates';
import { cn } from '../utils/cn';

/** 카드·예약 확인 — 총액 바로 아래. N≤0이면 렌더 안 함 */
export default function AirportSavingsLine({
  days,
  displayPriceWon,
  className,
  compact = false,
}: {
  days: number;
  displayPriceWon: number;
  className?: string;
  /** 확인창 등 한 줄만 */
  compact?: boolean;
}) {
  const savings = airportParkingSavingsWon(days, displayPriceWon);
  if (savings <= 0) return null;

  return (
    <div className={cn(className)}>
      <p
        className={cn(
          'font-bold tabular-nums text-[#b8923a]',
          compact ? 'text-[13px]' : 'text-[14px]'
        )}
      >
        인천공항 주차장 대비 약 {savings.toLocaleString()}원
      </p>
      {compact ? null : (
        <p className="mt-0.5 text-[11px] font-medium text-[#0f1a2e]/45">
          참고 · 공식 요금표 · {AIRPORT_PARKING_RATES.asOf}
        </p>
      )}
    </div>
  );
}
