import { HOME_WHY_AIRPICK } from '../../constants/marketing';

/** 홈 · 고객이 에어픽을 선택하는 이유 */
export default function HomeWhyAirpick() {
  return (
    <section>
      <p className="text-[10px] font-bold tracking-[0.14em] text-[#c9a962]">
        {HOME_WHY_AIRPICK.eyebrow}
      </p>
      <h2 className="mt-1 text-[1.2rem] font-bold leading-snug tracking-tight text-[#0f1a2e] md:text-[1.4rem]">
        {HOME_WHY_AIRPICK.title}
      </h2>
      <p className="mt-2 max-w-xl text-[13px] font-medium leading-relaxed text-[#0f1a2e]/50 md:text-[14px]">
        {HOME_WHY_AIRPICK.lead}
      </p>

      <ol className="mt-6 space-y-5 border-t border-[#0f1a2e]/10 pt-6 md:mt-7 md:space-y-6">
        {HOME_WHY_AIRPICK.items.map((item, index) => (
          <li key={item.id} className="grid grid-cols-[2rem_1fr] gap-3 md:gap-4">
            <span className="text-[13px] font-bold tabular-nums text-[#c9a962]">
              {String(index + 1).padStart(2, '0')}
            </span>
            <div className="min-w-0">
              <p className="text-[14px] font-bold text-[#0f1a2e]">{item.title}</p>
              <p className="mt-1 text-[12px] font-medium leading-relaxed text-[#0f1a2e]/50 md:text-[13px]">
                {item.body}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
