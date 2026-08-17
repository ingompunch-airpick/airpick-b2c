import { Container, FadeIn } from '../../../design-system';

/** Story beat between reviews and trust */
export function PartnerDivider() {
  return (
    <section className="bg-mkt-bg py-24 md:py-32" aria-hidden={false}>
      <Container>
        <FadeIn className="mx-auto max-w-[900px] text-center">
          <p className="text-4xl font-bold tracking-tight text-mkt-ink md:text-5xl lg:text-6xl lg:leading-[1.15]">
            신뢰는 광고보다 강합니다.
          </p>
        </FadeIn>
      </Container>
    </section>
  );
}
