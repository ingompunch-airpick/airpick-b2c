import { Container, FadeIn, Section, SectionTitle } from '../../../design-system';
import { cn } from '../../../utils/cn';

const ROWS = [
  { label: '광고비', ad: '계속 증가', air: '노출은 플랫폼 자산' },
  { label: '예약 유입', ad: '광고 중단 시 끊김', air: '검색·비교로 유입' },
  { label: '전화문의', ad: '반복 응대', air: '앱에서 자동 접수' },
  { label: '후기', ad: '직접 관리', air: '이용 후 자동 요청' },
  { label: '운영', ad: '도구가 흩어짐', air: '입고·출고 통합' },
  { label: '종료 후', ad: '남는 것 없음', air: '리뷰·신뢰가 남음' },
] as const;

export function PartnerWhyPlatform() {
  return (
    <Section id="why" tone="sub">
      <Container>
        <SectionTitle
          align="center"
          className="mb-14"
          title={
            <>
              광고만으로는 힘듭니다,
              <br />
              플랫폼에 올라타야 합니다
            </>
          }
          description="광고는 돈을 쓰는 순간 끝납니다. 플랫폼은 리뷰가 쌓일수록 신뢰가 쌓이고 예약이 늘어납니다."
        />
        <FadeIn>
          <div className="overflow-hidden rounded-mkt border border-mkt-border bg-white shadow-mkt">
            <div className="grid grid-cols-[1fr_1fr_1.15fr] border-b border-mkt-border bg-mkt-sub text-xs font-semibold uppercase tracking-wide text-mkt-muted md:text-sm">
              <div className="px-4 py-3 md:px-6">항목</div>
              <div className="px-4 py-3 md:px-6">기존 광고</div>
              <div className="bg-mkt-brand px-4 py-3 text-white md:px-6">AirPick</div>
            </div>
            {ROWS.map((row, i) => (
              <div
                key={row.label}
                className={cn(
                  'grid grid-cols-[1fr_1fr_1.15fr] text-sm md:text-base',
                  i % 2 === 1 && 'bg-mkt-sub/50'
                )}
              >
                <div className="px-4 py-4 font-semibold text-mkt-ink md:px-6">{row.label}</div>
                <div className="px-4 py-4 text-mkt-muted md:px-6">{row.ad}</div>
                <div className="bg-mkt-brand/5 px-4 py-4 font-semibold text-mkt-brand md:px-6">
                  {row.air}
                </div>
              </div>
            ))}
          </div>
        </FadeIn>
      </Container>
    </Section>
  );
}
