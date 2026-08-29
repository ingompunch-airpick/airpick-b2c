import { HOME_TRUST_STATS } from '../../constants/marketing';

/** 홈 · 신뢰 수치 — 시트 상단 브리지 */
export default function HomeTrustStats({
  partnerCount,
  avgRating,
}: {
  partnerCount: number;
  /** 실후기 가중 평균. 없으면 해당 칸 숨김 */
  avgRating: number | null;
}) {
  const items: { value: string; label: string }[] = [
    {
      value: HOME_TRUST_STATS.insuranceValue,
      label: HOME_TRUST_STATS.insuranceLabel,
    },
    {
      value: HOME_TRUST_STATS.parkingValue,
      label: HOME_TRUST_STATS.parkingLabel,
    },
  ];

  if (partnerCount > 0) {
    items.push({
      value: `${partnerCount}`,
      label: HOME_TRUST_STATS.partnersLabel,
    });
  }

  if (avgRating != null && avgRating > 0) {
    items.push({
      value: avgRating.toFixed(1),
      label: HOME_TRUST_STATS.ratingLabel,
    });
  }

  return (
    <div
      className="grid gap-4 md:gap-0"
      style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}
    >
      {items.map((item, i) => (
        <div
          key={item.label}
          className={
            i > 0
              ? 'border-l border-[#0f1a2e]/10 px-3 text-center md:px-6'
              : 'px-2 text-center md:px-4'
          }
        >
          <p className="text-[1.35rem] font-bold tabular-nums tracking-tight text-[#0f1a2e] md:text-[1.75rem]">
            {item.value}
          </p>
          <p className="mt-1 text-[10px] font-semibold leading-snug text-[#0f1a2e]/45 md:text-[12px]">
            {item.label}
          </p>
        </div>
      ))}
    </div>
  );
}
