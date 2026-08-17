import { Card, Container, DemoLabel, FadeIn, Section, SectionTitle } from '../../../design-system';

const REVIEWS = [
  {
    stars: 5,
    body: '비교해서 예약하니 편했고, 입고 사진이 바로 와서 안심됐어요.',
    meta: '입점 후기 · Demo',
  },
  {
    stars: 5,
    body: '위치 공유 덕분에 출고 때 헤매지 않았습니다.',
    meta: '입점 후기 · Demo',
  },
  {
    stars: 5,
    body: '보험·실내 여부를 미리 보고 골랐어요. 다음에도 에어픽으로 찾을 듯.',
    meta: '입점 후기 · Demo',
  },
  {
    stars: 4,
    body: '전화로만 알아보던 때보다 훨씬 빠릅니다.',
    meta: '입점 후기 · Demo',
  },
] as const;

export function PartnerReviews() {
  return (
    <Section id="reviews" tone="white">
      <Container>
        <SectionTitle
          align="center"
          className="mb-4"
          title="리뷰가 예약을 만듭니다."
          description="실후기가 쌓일수록 비교 화면에서의 신뢰가 커집니다. 아래 문구는 Demo UI입니다."
        />
        <div className="mb-10 flex justify-center">
          <DemoLabel />
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {REVIEWS.map((r, i) => (
            <FadeIn key={r.body} delay={i * 0.06}>
              <Card className="h-full">
                <p className="text-amber-500" aria-label={`${r.stars}점`}>
                  {'★'.repeat(r.stars)}
                  {'☆'.repeat(5 - r.stars)}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-mkt-ink md:text-base">{r.body}</p>
                <p className="mt-4 text-xs font-medium text-mkt-muted">{r.meta}</p>
              </Card>
            </FadeIn>
          ))}
        </div>
        <FadeIn className="mt-12">
          <Card className="relative overflow-hidden bg-mkt-sub">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold text-mkt-ink">예약 증가 추이</p>
              <DemoLabel label="Coming Soon" />
            </div>
            <svg viewBox="0 0 400 120" className="h-28 w-full text-mkt-brand" aria-hidden>
              <polyline
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                points="0,95 40,88 80,90 120,70 160,72 200,50 240,55 280,35 320,40 360,22 400,18"
              />
              <polyline
                fill="url(#reviewGrad)"
                stroke="none"
                points="0,120 0,95 40,88 80,90 120,70 160,72 200,50 240,55 280,35 320,40 360,22 400,18 400,120"
                opacity="0.2"
              />
              <defs>
                <linearGradient id="reviewGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3182F6" />
                  <stop offset="100%" stopColor="#3182F6" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
            <p className="mt-2 text-xs text-mkt-muted">실데이터 연동 후 표시 예정</p>
          </Card>
        </FadeIn>
      </Container>
    </Section>
  );
}
