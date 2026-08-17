import { DemoLabel } from '../../../design-system';
import {
  Button,
  Card,
  Container,
  DeviceFrame,
  FadeIn,
  Section,
  SectionTitle,
} from '../../../design-system';

const APP_URL = 'https://airpick-reservation.web.app/';

/** 업체용 앱(airpick-reservation) 실제 기능 안내 */
const FEATURES = [
  {
    step: '01',
    title: '로그인 · 업체 계정',
    body: '업체 ID와 비밀번호로 로그인합니다. 입점 심사 후 계정이 발급됩니다.',
  },
  {
    step: '02',
    title: '예약 목록 · 오늘/기간 조회',
    body: '에어픽 고객 비교에서 들어온 예약을 목록으로 확인합니다. 차량번호·일정·터미널을 한눈에 봅니다.',
  },
  {
    step: '03',
    title: '상태 변경 (접수 → 입고 → 주차중 → 출고)',
    body: '현장 진행에 맞춰 상태를 넘깁니다. 고객 예약 탭에도 같은 흐름이 반영됩니다.',
  },
  {
    step: '04',
    title: '입고 사진 업로드',
    body: '입고 시 차량 사진을 올리면 고객이 www.에어픽.kr 예약 조회에서 바로 확인할 수 있습니다.',
  },
  {
    step: '05',
    title: '주차 위치 등록',
    body: '주차장 위치(핀·안내)를 등록하면 출고 때 “어디 있어요?” 전화가 줄어듭니다.',
  },
  {
    step: '06',
    title: '출고 처리 · 후기 연결',
    body: '출고 완료 후 고객에게 안내가 이어지고, 실후기 요청으로 연결됩니다.',
  },
] as const;

export function PartnerApp() {
  return (
    <Section id="partner-app" tone="white">
      <Container>
        <SectionTitle
          align="center"
          className="mb-4"
          eyebrow="B2B · 업체용 앱"
          title="에어픽 파트너 앱 미리보기"
          description="고객은 www.에어픽.kr에서 비교·예약하고, 사장님은 파트너 앱에서 현장 예약을 처리합니다. 오른쪽은 실제 앱 화면입니다."
        />
        <FadeIn className="mb-12 flex justify-center">
          <DemoLabel label="실제 앱" />
        </FadeIn>

        <div className="grid items-start gap-12 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-5">
            <FadeIn>
              <DeviceFrame
                className="relative"
                label="파트너 앱 미리보기"
                urlBar="airpick-reservation.web.app"
              >
                <iframe
                  title="에어픽 파트너 앱"
                  src={APP_URL}
                  className="h-full w-full border-0 bg-mkt-sub"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </DeviceFrame>
              <p className="mt-3 text-center text-xs text-mkt-muted">
                로그인 화면이 보이면 정상입니다. 입점 후 계정으로 들어갑니다.
              </p>
              <div className="mt-5 flex justify-center">
                <Button href={APP_URL} target="_blank" rel="noopener noreferrer">
                  새 탭에서 앱 열기
                </Button>
              </div>
            </FadeIn>
          </div>

          <div className="lg:col-span-7">
            <FadeIn className="mb-6">
              <Card className="border-mkt-brand/25 bg-mkt-brand/[0.04]">
                <p className="text-sm font-semibold text-mkt-ink">역할 구분</p>
                <ul className="mt-2 space-y-1.5 text-sm text-mkt-muted">
                  <li>
                    <strong className="text-mkt-ink">고객</strong> — www.에어픽.kr · 비교·예약·위치·사진
                    확인
                  </li>
                  <li>
                    <strong className="text-mkt-ink">업체</strong> — {APP_URL.replace('https://', '')} ·
                    접수·입고·출고 처리
                  </li>
                </ul>
              </Card>
            </FadeIn>

            <ol className="space-y-4">
              {FEATURES.map((f, i) => (
                <FadeIn key={f.step} delay={i * 0.04} as="li">
                  <div className="flex gap-4 rounded-mkt border border-mkt-border bg-white p-4 shadow-mkt transition duration-500 hover:shadow-mkt-hover sm:p-5">
                    <span className="shrink-0 text-sm font-bold text-mkt-brand">{f.step}</span>
                    <div>
                      <h3 className="text-base font-bold text-mkt-ink">{f.title}</h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-mkt-muted">{f.body}</p>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </ol>
          </div>
        </div>
      </Container>
    </Section>
  );
}
