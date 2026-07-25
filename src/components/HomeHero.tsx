import { HOME_HEADLINE } from '../constants/marketing';

/** @deprecated HomePage 히어로로 대체. 레거시 참조용 */
export default function HomeHero() {
  return (
    <section className="px-0.5 pb-1 pt-1">
      <h1 className="max-w-[20rem] whitespace-pre-line text-[1.75rem] font-bold leading-[1.25] tracking-tight text-ink">
        {HOME_HEADLINE}
      </h1>
    </section>
  );
}
