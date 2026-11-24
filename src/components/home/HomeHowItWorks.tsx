import { HOME_HOW } from '../../constants/marketing';

/** 홈 · 업체 목록 아래 — 왜 에어픽(3) + 이용 방법(4단계). 실제 제공 기능만 적는다. */
export default function HomeHowItWorks() {
  return (
    <section aria-labelledby="home-why-title" className="space-y-10">
      <div>
        <h2 id="home-why-title" className="text-[1.3rem] font-bold tracking-tight text-[#0f1a2e] md:text-[1.5rem]">
          {HOME_HOW.whyTitle}
        </h2>
        <ul className="mt-4 grid gap-3 md:grid-cols-3">
          {HOME_HOW.why.map((item, index) => (
            <li key={item.id} className="rounded-2xl bg-white p-5 ring-1 ring-[#0f1a2e]/8">
              <span className="text-[13px] font-bold tabular-nums text-[#b8954a]">
                {String(index + 1).padStart(2, '0')}
              </span>
              <p className="mt-1.5 text-[16px] font-bold leading-snug text-[#0f1a2e]">{item.title}</p>
              <p className="mt-1.5 text-[14px] font-medium leading-relaxed text-[#0f1a2e]/65">{item.body}</p>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h2 className="text-[1.3rem] font-bold tracking-tight text-[#0f1a2e] md:text-[1.5rem]">
          {HOME_HOW.stepsTitle}
        </h2>
        <ol className="mt-4 grid gap-3 sm:grid-cols-2 md:grid-cols-4">
          {HOME_HOW.steps.map((step, index) => (
            <li key={step.id} className="flex gap-3 rounded-2xl bg-white p-4 ring-1 ring-[#0f1a2e]/8 md:flex-col md:gap-2">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#0f1a2e] text-[13px] font-bold text-white">
                {index + 1}
              </span>
              <div className="min-w-0">
                <p className="text-[15px] font-bold text-[#0f1a2e]">{step.title}</p>
                <p className="mt-0.5 text-[13px] font-medium leading-relaxed text-[#0f1a2e]/65">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
