import { BadgeCheck, Building2, Cctv, Clock, MapPin, ShieldCheck } from 'lucide-react';
import { Card, Container, FadeIn, Section, SectionTitle } from '../../../design-system';

/** 앞 4개는 /verified/ 「확인하는 4가지」와 같은 기준 */
const CHECKS = [
  { icon: Building2, title: '사업자 확인', body: '사업자등록증으로 등록 여부와 상호·대표자를 확인합니다.' },
  { icon: BadgeCheck, title: '주차장 확인', body: '서류와 현장 방문으로 실제 차량 보관 장소를 확인합니다.' },
  { icon: ShieldCheck, title: '보험 확인', body: '업체의 주차대행 보험 가입 서류를 확인합니다.' },
  { icon: Cctv, title: 'CCTV 확인', body: '차량 보관 주차장의 CCTV 설치를 현장에서 확인합니다.' },
  { icon: MapPin, title: '위치·사진', body: '안내 위치가 실제와 맞는지 보고, 주차장 실사진을 등록합니다.' },
  { icon: Clock, title: '운영 정보', body: '운영시간·요금·서비스 범위를 확인합니다.' },
] as const;

export function PartnerTrust() {
  return (
    <Section id="trust" tone="dark" className="overflow-hidden">
      <Container>
        <SectionTitle
          light
          align="center"
          className="mb-14"
          title={
            <>
              우리는 예약을 판매하지 않습니다.
              <br />
              신뢰를 만듭니다.
            </>
          }
          description="에어픽은 아무 업체나 입점시키지 않습니다. 사업자·주차장·보험·CCTV를 확인한 업체만 입점합니다."
        />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {CHECKS.map((c, i) => (
            <FadeIn key={c.title} delay={i * 0.05}>
              <Card dark glass hover className="h-full">
                <c.icon className="size-6 text-sky-300" aria-hidden />
                <h3 className="mt-4 text-base font-bold text-white">{c.title}</h3>
                <p className="mt-2 text-sm text-white/70">{c.body}</p>
              </Card>
            </FadeIn>
          ))}
        </div>

        <FadeIn className="mt-12">
          <div
            role="note"
            className="rounded-mkt border border-amber-400/40 bg-amber-400/10 px-6 py-5 text-amber-50"
          >
            <p className="text-base font-bold text-amber-200">허위 정보는 브랜드를 무너뜨립니다.</p>
            <p className="mt-2 text-sm leading-relaxed text-amber-50/85">
              보험, 주차장 위치, 사진, 운영 방식, 요금 등을 사실과 다르게 등록한 사실이 확인되면
              비교 노출이 중단되고 입점 계약이 종료될 수 있습니다.
            </p>
          </div>
        </FadeIn>
      </Container>
    </Section>
  );
}
