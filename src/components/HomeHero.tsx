import { HOME_HEADLINE } from '../constants/marketing';

export default function HomeHero() {
  return (
    <section className="px-0.5 pb-1 pt-1">
      <h1 className="max-w-[20rem] text-[1.75rem] font-bold leading-[1.25] tracking-tight text-ink">
        {HOME_HEADLINE}
      </h1>
    </section>
  );
}
