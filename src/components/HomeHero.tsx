import { HOME_PLATFORM_LINE, HOME_PLATFORM_SUB } from '../constants/marketing';

export default function HomeHero() {
  return (
    <section className="px-1 pt-1">
      <p className="text-xs font-semibold text-muted">{HOME_PLATFORM_SUB}</p>
      <h1 className="mt-1.5 text-[1.75rem] font-bold leading-[1.2] tracking-tight text-ink">
        {HOME_PLATFORM_LINE}
      </h1>
    </section>
  );
}
