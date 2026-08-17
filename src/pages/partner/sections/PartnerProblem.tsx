import { ArrowDown } from 'lucide-react';
import { Card, Container, FadeIn, Section, SectionTitle } from '../../../design-system';

const PAIN = ['네이버 광고', '블로그', '전화문의', '예약관리', '후기관리'] as const;

export function PartnerProblem() {
  return (
    <Section id="problem" tone="white">
      <Container>
        <div className="grid gap-12 lg:grid-cols-12 lg:items-center lg:gap-16">
          <div className="lg:col-span-5">
            <SectionTitle
              title={
                <>
                  광고비는 계속 오르는데
                  <br />
                  예약은 그대로입니다.
                </>
              }
              description="주차대행 업체는 광고, 블로그, 예약 관리, 후기 관리, 고객 응대를 모두 직접 해야 합니다."
            />
          </div>
          <div className="lg:col-span-7">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {PAIN.map((label, i) => (
                <FadeIn key={label} delay={i * 0.06}>
                  <Card className="bg-mkt-sub py-5 text-center text-sm font-semibold text-mkt-muted">
                    {label}
                  </Card>
                </FadeIn>
              ))}
            </div>
            <FadeIn delay={0.35} className="mt-8 flex flex-col items-center gap-3">
              <ArrowDown className="size-6 text-mkt-brand" aria-hidden />
              <Card className="w-full border-mkt-brand/30 bg-mkt-brand px-6 py-5 text-center text-white shadow-mkt-hover">
                <p className="text-lg font-bold tracking-tight">AirPick 하나 · 모든 기능 통합</p>
                <p className="mt-1 text-sm text-white/80">
                  비교 노출 · 예약 접수 · 입고·출고 · 후기까지 한곳에서
                </p>
              </Card>
            </FadeIn>
          </div>
        </div>
      </Container>
    </Section>
  );
}
