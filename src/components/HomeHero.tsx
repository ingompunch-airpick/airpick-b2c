import { HOME_HEADLINE } from '../constants/marketing';

/** @deprecated HomePage 히어로로 대체. 레거시 참조용 */
export default function HomeHero() {
  return (
    <section className="px-0.5 pb-1 pt-1">
      <h1 className="max-w-[22rem] text-[15px] font-semibold leading-snug tracking-tight text-ink/70">
        {HOME_HEADLINE}
      </h1>
    </section>
  );
}
