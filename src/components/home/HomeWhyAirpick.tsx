import { HOME_WHY_AIRPICK } from '../../constants/marketing';

/** 홈 · WHY — 대표 사진 1장 + 캡션 + 증거형 01~03 */
export default function HomeWhyAirpick() {
  return (
    <section>
      <div className="overflow-hidden rounded-2xl">
        <picture>
          <source type="image/webp" srcSet={HOME_WHY_AIRPICK.imageSrc} />
          <img
            src={HOME_WHY_AIRPICK.imageFallbackSrc}
            alt={HOME_WHY_AIRPICK.imageAlt}
            width={1400}
            height={933}
            className="aspect-[4/3] w-full max-h-[14rem] object-cover object-center sm:max-h-[16rem] md:max-h-[18rem]"
            loading="lazy"
            decoding="async"
          />
        </picture>
      </div>

      <p className="mt-4 text-[15px] font-bold leading-snug tracking-tight text-[#0f1a2e] md:mt-5 md:text-[1.05rem]">
        {HOME_WHY_AIRPICK.caption}
      </p>

      <p className="mt-4 text-[10px] font-bold tracking-[0.14em] text-[#c9a962]">
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
              <p className="mt-2 text-[10px] font-bold tracking-[0.08em] text-[#9a7b3c]">
                {item.evidence}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
