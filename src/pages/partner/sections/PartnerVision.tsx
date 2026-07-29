import { Container, FadeIn, Section } from '../../../design-system';

export function PartnerVision() {
  return (
    <Section
      id="vision"
      className="relative overflow-hidden bg-gradient-to-b from-mkt-sub via-white to-mkt-brand/10"
    >
      <Container>
        <FadeIn className="mx-auto max-w-[860px] text-center">
          <h2 className="text-3xl font-bold tracking-tight text-mkt-ink md:text-4xl lg:text-5xl lg:leading-[1.15]">
            우리는 공식보다 더 신뢰받는
            <br />
            사설 주차대행을 만듭니다.
          </h2>
          <p className="mt-10 text-2xl font-bold tracking-tight text-mkt-muted md:text-3xl">
            광고 경쟁 <span className="text-mkt-brand">↓</span>
            <br />
            가격 경쟁 <span className="text-mkt-brand">↓</span>
            <br />
            <span className="text-mkt-ink">신뢰 경쟁</span>
          </p>
          <p className="mt-8 text-lg font-semibold text-mkt-brand md:text-xl">
            AirPick가 시장 구조를 바꿉니다.
          </p>
        </FadeIn>
      </Container>
    </Section>
  );
}
