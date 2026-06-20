export default function PageHero({
  sub,
  line,
  desc,
}: {
  sub: string;
  line: string;
  desc?: string;
}) {
  return (
    <section className="px-1">
      <p className="text-xs font-semibold text-muted">{sub}</p>
      <h1 className="mt-1.5 text-[1.75rem] font-bold leading-[1.2] tracking-tight text-ink">
        {line}
      </h1>
      {desc ? <p className="mt-2 text-sm font-medium text-muted">{desc}</p> : null}
    </section>
  );
}
