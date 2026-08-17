import {
  BadgeCheck,
  Building2,
  Camera,
  Clock,
  MapPin,
  ShieldCheck,
} from 'lucide-react';
import { Card, Container, FadeIn, Section, SectionTitle } from '../../../design-system';

const CHECKS = [
  { icon: Building2, title: '사업자 확인', body: '사업자등록증을 검수합니다.' },
  { icon: ShieldCheck, title: '보험 가입', body: '입점 시 보험 적용 · 추가 보험 가능' },
  { icon: BadgeCheck, title: '실제 주차장', body: '계약·이용 가능 여부를 확인합니다.' },
  { icon: MapPin, title: '위치 확인', body: '안내하는 위치가 실제와 맞는지 검증합니다.' },
  { icon: Camera, title: '주차장 사진', body: '실사진을 등록합니다.' },
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
          description="에어픽은 아무 업체나 입점시키지 않습니다. 고객이 안심하고 맡길 수 있는 업체만 선별합니다."
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
