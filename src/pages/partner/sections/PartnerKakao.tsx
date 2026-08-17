import {
  Container,
  DemoLabel,
  DeviceFrame,
  FadeIn,
  Section,
  SectionTitle,
} from '../../../design-system';

/** 알림톡 + 접수증. 접수증은 잘리지 않게 자연 높이 폰 프레임 */
export function PartnerKakao() {
  return (
    <Section id="kakao" tone="sub">
      <Container>
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-5">
            <SectionTitle
              eyebrow="카카오 알림톡"
              title={
                <>
                  예약이 들어오면
                  <br />
                  세련된 접수증이 갑니다.
                </>
              }
              description="고객에게 알림톡이 도착하고, 「접수증 보기」를 누르면 에어픽 접수 확인증이 열립니다. 업체는 같은 안내를 반복해서 보낼 필요가 없습니다."
            />
            <FadeIn delay={0.1} className="mt-8 space-y-3 text-sm text-mkt-muted">
              <p className="flex items-start gap-2">
                <span className="mt-0.5 font-bold text-mkt-brand">1</span>
                예약 접수 완료 알림톡 자동 발송
              </p>
              <p className="flex items-start gap-2">
                <span className="mt-0.5 font-bold text-mkt-brand">2</span>
                버튼 한 번으로 접수증(확인증) 확인
              </p>
              <p className="flex items-start gap-2">
                <span className="mt-0.5 font-bold text-mkt-brand">3</span>
                차량·일정·금액·항공편까지 한 장에 정리
              </p>
            </FadeIn>
          </div>

          <FadeIn delay={0.08} className="lg:col-span-7">
            <DeviceFrame
              variant="phone"
              className="mx-auto max-w-[300px]"
              label="① 카카오 알림톡"
            >
              <AlimtalkPreview />
            </DeviceFrame>
          </FadeIn>
        </div>

        <FadeIn delay={0.12} className="mt-14 md:mt-16">
          <div className="mb-5 flex flex-wrap items-center justify-center gap-3">
            <p className="text-sm font-semibold text-mkt-ink">② 「접수증 보기」를 누르면</p>
            <DemoLabel label="실제 앱" />
          </div>
          {/* 고정 비율 crop 없이 — 알림톡과 같은 폭, 이미지는 전체 보이게 */}
          <DeviceFrame
            variant="phoneNatural"
            className="mx-auto max-w-[300px]"
            label="접수 확인증"
          >
            <ElegantReceiptCard />
          </DeviceFrame>
          <p className="mt-4 text-center text-xs text-mkt-muted">
            고객이 받는 에어픽 접수 확인증입니다.
          </p>
        </FadeIn>
      </Container>
    </Section>
  );
}

function AlimtalkPreview() {
  return (
    <div className="flex h-full flex-col bg-[#9eabb8]">
      <div className="flex items-center justify-between bg-[#fee500] px-3 py-2.5">
        <p className="text-[13px] font-bold text-[#191919]">알림톡 도착</p>
        <span className="text-[10px] font-semibold text-[#191919]/70">Kakao</span>
      </div>
      <div className="flex flex-1 flex-col justify-center p-3">
        <div className="overflow-hidden rounded-2xl bg-white shadow-md">
          <div className="border-b border-neutral-100 px-4 pb-3 pt-4">
            <p className="text-[11px] text-neutral-400">예약접수 완료</p>
            <p className="mt-1 text-[17px] font-bold leading-snug text-neutral-900">
              [에어픽] 주차 예약
            </p>
          </div>
          <div className="space-y-2 px-4 py-4 text-[12px] leading-relaxed text-neutral-800">
            <p>
              [에어픽] 홍*동님 <span className="font-semibold">12가 1234</span> 예약 접수가
              완료되었습니다.
            </p>
            <p>아래 버튼에서 접수증을 확인하세요.</p>
          </div>
          <div className="px-3 pb-3">
            <div className="w-full rounded-xl bg-neutral-100 py-3.5 text-center text-[13px] font-semibold text-neutral-900">
              접수증 보기
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** 여유 있는 접수증 UI — 스크린샷 crop 대신 랜딩용 재구성 */
function ElegantReceiptCard() {
  return (
    <div className="bg-[#f6f2ea] text-[#0b1f3a]">
      <div className="bg-[#0b1f3a] px-4 pb-6 pt-4 text-white">
        <div className="flex items-start justify-between gap-2">
          <p className="text-[9px] font-semibold tracking-[0.14em] text-[#e8c547]">
            AIRPICK VALET
          </p>
          <span className="rounded-md border border-[#e8c547]/70 px-2 py-0.5 text-[9px] font-semibold text-[#e8c547]">
            접수완료
          </span>
        </div>
        <h3 className="mt-4 text-[20px] font-bold tracking-tight">예약 접수 확인증</h3>
        <p className="mt-2 text-[11px] text-white/50">가유 주차대행 · No. demo</p>
        <p className="mt-4 flex flex-wrap items-center gap-1.5 text-[12px]">
          <span className="text-white/75">인천공항 · T1</span>
          <span className="text-[#e8c547]">→</span>
          <span className="font-semibold">Osaka</span>
          <span className="text-white/40">KE</span>
        </p>
      </div>

      <div className="space-y-4 px-4 pb-5 pt-5">
        <div>
          <p className="text-[10px] text-[#0b1f3a]/45">차량 번호</p>
          <p className="mt-1 text-[28px] font-bold tracking-tight">12가1234</p>
          <p className="mt-1 text-[12px] text-[#0b1f3a]/45">그랜저 · 홍*동</p>
        </div>

        <div className="flex items-center justify-between rounded-2xl bg-[#0b1f3a] px-4 py-3.5">
          <span className="text-[12px] text-white/75">총 주차 금액</span>
          <span className="text-[20px] font-bold text-[#e8c547]">60,000원</span>
        </div>

        <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
          <div className="grid grid-cols-2 divide-x divide-neutral-100 border-b border-neutral-100">
            <MiniCell label="접수일시" value="26.07.17 10:00" />
            <MiniCell label="출차예정" value="26.07.23 10:00" />
          </div>
          <div className="grid grid-cols-2 divide-x divide-neutral-100 border-b border-neutral-100">
            <MiniCell label="출국편" value="T1 · KE101" />
            <MiniCell label="귀국편" value="T1 · KE101" />
          </div>
          <div className="border-b border-neutral-100 px-3.5 py-3">
            <p className="text-[9px] text-neutral-400">고객 연락처</p>
            <p className="mt-0.5 text-[12px] font-semibold">010-****-5746</p>
          </div>
          <div className="px-3.5 py-3">
            <p className="text-[9px] text-neutral-400">픽업지</p>
            <p className="mt-0.5 text-[12px] font-medium leading-snug text-[#0b1f3a]/80">
              업체로 연락해 안내받으세요
            </p>
          </div>
        </div>

        <p className="pb-1 text-center text-[10px] text-neutral-400">표준약관 보기</p>
      </div>
    </div>
  );
}

function MiniCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-3.5 py-3">
      <p className="text-[9px] text-neutral-400">{label}</p>
      <p className="mt-0.5 text-[12px] font-semibold leading-snug">{value}</p>
    </div>
  );
}
