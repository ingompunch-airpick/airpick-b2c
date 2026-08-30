import { HOME_TRUST_STATS } from '../../constants/marketing';

/** 홈 · 신뢰 수치 — 보험·주차장·엄선 파트너·사고차량 */
export default function HomeTrustStats({ partnerCount }: { partnerCount: number }) {
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

  items.push({
    value: HOME_TRUST_STATS.accidentValue,
    label: HOME_TRUST_STATS.accidentLabel,
  });

  return (
    <div
      className="grid gap-3 md:gap-0"
      style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}
    >
      {items.map((item, i) => (
        <div
          key={item.label}
          className={
            i > 0
              ? 'border-l border-[#0f1a2e]/10 px-2 text-center sm:px-3 md:px-5'
              : 'px-1 text-center sm:px-2'
          }
        >
          <p className="text-[1.25rem] font-bold tabular-nums tracking-tight text-[#0f1a2e] sm:text-[1.35rem] md:text-[1.75rem]">
            {item.value}
          </p>
          <p className="mt-1 text-[9px] font-semibold leading-snug text-[#0f1a2e]/45 sm:text-[10px] md:text-[11px]">
            {item.label}
          </p>
        </div>
      ))}
    </div>
  );
}
