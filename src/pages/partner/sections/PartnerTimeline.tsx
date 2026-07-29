import { Container, FadeIn, Section, SectionTitle } from '../../../design-system';
import { cn } from '../../../utils/cn';

const MILESTONES = [
  '주차대행 비교',
  '예약 플랫폼',
  '파트너 확대',
  'eSIM / USIM',
  '여행자보험',
  '공항 서비스',
  '국내 최대 공항 플랫폼',
] as const;

export function PartnerTimeline() {
  return (
    <Section id="timeline" tone="white">
      <Container>
        <SectionTitle
          align="center"
          className="mb-14"
          title="에어픽은 이제 시작입니다."
          description="주차대행을 시작으로, 공항에서 필요한 선택을 한 브랜드로 연결합니다."
        />
        <div className="relative">
          <div
            className="pointer-events-none absolute left-0 right-0 top-5 hidden h-px bg-gradient-to-r from-transparent via-mkt-brand/40 to-transparent lg:block"
            aria-hidden
          />
          <ol className="grid gap-6 sm:grid-cols-2 lg:grid-cols-7">
            {MILESTONES.map((m, i) => (
              <FadeIn key={m} delay={i * 0.05} as="li">
                <div className="text-center">
                  <div
                    className={cn(
                      'mx-auto mb-3 flex size-10 items-center justify-center rounded-full border-2 text-xs font-bold',
                      i === 0
                        ? 'border-mkt-brand bg-mkt-brand text-white shadow-mkt-hover'
                        : 'border-mkt-border bg-white text-mkt-muted'
                    )}
                  >
                    {i === 0 ? 'Now' : i + 1}
                  </div>
                  <p className="text-sm font-semibold text-mkt-ink">{m}</p>
                  {i === 0 ? (
                    <p className="mt-1 text-[10px] font-semibold text-mkt-brand">2026</p>
                  ) : null}
                </div>
              </FadeIn>
            ))}
          </ol>
        </div>
      </Container>
    </Section>
  );
}
