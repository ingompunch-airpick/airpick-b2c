export default function HomeHero() {
  return (
    <section className="shadow-card rounded-3xl bg-sky-soft px-5 py-5 ring-1 ring-sky-border/45">
      <span className="inline-flex items-center rounded-full bg-brand/10 px-2.5 py-1 text-[11px] font-semibold text-brand">
        인천공항 주차대행 비교
      </span>

      <h2 className="mt-3.5 text-[1.375rem] font-bold leading-[1.35] tracking-tight text-ink">
        가격 · 위치 · 평점 · 보험
        <br />
        <span className="text-brand">한눈에 비교</span>
      </h2>

      <p className="mt-2.5 text-[13px] leading-[1.6] text-muted">
        제휴 업체 요금, 주차장 위치, 평점, 보험 가입 여부를
        <br />
        한곳에서 확인하고 예약하세요.
      </p>
    </section>
  );
}
