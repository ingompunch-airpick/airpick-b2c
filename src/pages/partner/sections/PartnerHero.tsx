import { motion, useReducedMotion } from 'framer-motion';
import { Badge, Button, Container, DeviceFrame, FadeIn } from '../../../design-system';

export function PartnerHero() {
  const reduce = useReducedMotion();

  return (
    <section className="relative flex min-h-[100dvh] items-center overflow-hidden bg-mkt-bg pt-20">
      <div className="pointer-events-none absolute inset-0 mkt-grid-bg opacity-40" aria-hidden />
      <div
        className="pointer-events-none absolute -left-32 top-24 size-[28rem] rounded-full bg-mkt-brand/15 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-20 bottom-10 size-[22rem] rounded-full bg-mkt-accent/10 blur-3xl"
        aria-hidden
      />

      <Container className="relative grid items-center gap-12 py-14 lg:grid-cols-12 lg:gap-8 lg:py-20">
        <div className="lg:col-span-5">
          <FadeIn>
            <Badge>대한민국 공항 플랫폼</Badge>
          </FadeIn>
          <FadeIn delay={0.08}>
            <h1 className="mt-6 text-4xl font-bold tracking-tight text-mkt-ink md:text-5xl lg:text-[3.25rem] lg:leading-[1.12]">
              광고비는 계속 오르는데,
              <br />
              예약은 늘고 있습니까?
            </h1>
          </FadeIn>
          <FadeIn delay={0.16}>
            <p className="mt-6 max-w-md text-base font-semibold leading-relaxed text-mkt-ink md:text-lg">
              업체 경쟁률은 늘어나서 광고도 힘들어집니다.
            </p>
            <p className="mt-3 max-w-md text-sm font-bold tracking-tight text-mkt-ink md:text-base">
              2022년 40개
              <span className="mx-1.5 text-mkt-brand">→</span>
              2026년 200개+α
            </p>
          </FadeIn>
          <FadeIn delay={0.24}>
            <div className="mt-9 flex flex-wrap gap-3">
              <Button href="#apply">무료 입점 상담</Button>
              <Button href="#partner-app" variant="secondary">
                업체용 앱 보기
              </Button>
            </div>
          </FadeIn>
        </div>

        <div className="relative lg:col-span-7">
          <FadeIn delay={0.12} className="relative">
            <div
              className="pointer-events-none absolute -inset-4 rounded-[2rem] bg-mkt-brand/20 blur-2xl"
              aria-hidden
            />
            <DeviceFrame
              variant="phone"
              className="relative mx-auto max-w-[320px] lg:max-w-[360px]"
              label="www.에어픽.kr/parking"
              contentClassName="aspect-[9/19] min-h-[560px] h-[min(68vh,640px)]"
            >
              <iframe
                title="에어픽 주차대행 비교 화면"
                src="/parking"
                className="h-full w-full border-0"
                loading="lazy"
              />
            </DeviceFrame>
          </FadeIn>
        </div>
      </Container>

      <a
        href="#problem"
        className="absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-1 text-xs font-medium text-mkt-muted transition hover:text-mkt-brand"
      >
        <motion.span
          animate={reduce ? undefined : { y: [0, 6, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        >
          Scroll ↓
        </motion.span>
      </a>
    </section>
  );
}
