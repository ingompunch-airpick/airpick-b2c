import { HOME_HOW } from '../../constants/marketing';

/** 홈 · 업체 목록 아래 — 이용 방법(4단계). 안심케어는 검색 카드 아래 HomePromiseStrip. */
export default function HomeHowItWorks() {
  return (
    <section aria-labelledby="home-steps-title">
      <div>
        <h2 id="home-steps-title" className="text-[1.3rem] font-bold tracking-tight text-[#0f1a2e] md:text-[1.5rem]">
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
