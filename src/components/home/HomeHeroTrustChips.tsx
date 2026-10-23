import { HOME_HERO_TRUST_CHIPS } from '../../constants/marketing';

/** 홈 히어로 · 신뢰 칩 — WHY 02와 동일 문구 */
export default function HomeHeroTrustChips() {
  return (
    <ul className="mt-4 flex flex-wrap gap-2 md:mt-5">
      {HOME_HERO_TRUST_CHIPS.map((label) => (
        <li
          key={label}
          className="rounded-full border border-[#c9a962]/35 bg-[#c9a962]/10 px-3 py-1.5 text-[12px] font-bold tracking-wide text-[#e8d5a8] md:text-[13px]"
        >
          {label}
        </li>
      ))}
    </ul>
  );
}
