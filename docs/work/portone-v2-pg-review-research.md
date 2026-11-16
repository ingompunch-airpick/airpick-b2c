# Research: PortOne V2 PG 심사용 결제

> 다음: `docs/work/portone-v2-pg-review-plan.md`  
> 입력: PortOne V2 · 이니시스/KPN 채널 · PG 심사용 테스트 모드

## 1. 손님 한 명의 경로

- 시작: 홈에서 일정·업체 선택 → 예약 모달(연락처·차량·항공).
- 중간: 지금은 **접수만** 하고 결제는 **현장**. FAQ·약관·카드 UI도 현장 결제 전제.
- 끝(이번 작업): PG 심사용으로 예약/결제 화면에 **카드 결제(이니시스·KPN)** 선택 → PortOne 결제창 → `redirectUrl`로 완료 페이지.
- 이탈·헷갈림: 공개 FAQ는 여전히 「앱 카드 결제 없음」. 심사·테스트와 손님 안내를 섞으면 안 됨.

## 2. 관련 파일

| 역할 | 경로 |
|------|------|
| 예약 모달·금액 | `src/components/BookingModal.tsx` |
| 라우팅·탭 | `src/App.tsx` (SPA path, 전용 payment 라우트 없음) |
| 환경변수 | `.env` / `.env.example` / `src/vite-env.d.ts` |
| 결제 카피 | `support.ts` · `officialAnswers.ts` · `consent.ts` |
| 패키지 | `package.json` (PortOne SDK 없음) |

## 3. 이미 있는 규칙 (코드·합의)

- 입점 예약 공개 카피 = **현장 결제** (앱 카드 결제 없음).
- 온라인 결제는 네오파킹 plan 등에서 **별도 plan**으로 분리되어 있었음.
- Functions / payment webhook 배포는 **B2B 레포만**. 이 레포는 Hosting 프론트.
- Vite `VITE_*` 는 클라이언트에 노출됨 → PortOne **storeId·channelKey**는 브라우저 SDK용으로 OK. **API Secret은 프론트 금지**.
- 예약 접수는 `submitReservation` — 결제 성공과 예약 문서의 강제 연동은 아직 없음.

## 4. 건드리면 안 되는 것

- [ ] Functions / rules 배포는 B2B만
- [ ] FAQ·홈 카피를 「이제 앱에서 결제합니다」로 **전면 교체하지 않음** (심사 테스트와 분리)
- [ ] PortOne API Secret을 `.env`의 `VITE_` 로 넣지 않음
- [ ] 숫자·요금 창작 금지 (결제 금액 = 예약 모달 표시 총액)
- [ ] 커밋·배포는 요청 시만 · main만

## 5. 모르는 것 / 확인 필요

- 실제 `storeId` · 이니시스/KPN `channelKey` 전문 (요청문에 플레이스홀더만 있음 → 사람이 `.env`에 채움).
- PG 심사 URL이 **프로덕션 www** 인지 **preview 채널** 인지.
- 결제 성공 후 **예약 Firestore 접수까지** 묶을지, 심사용은 **결제 UI만** 할지. (1차는 UI·redirect 완료 표시 권장)
- 서버 `payment` complete/webhook 검증 — 실서비스 필수이나 **1차(심사) 범위 밖**으로 둘지.

## 6. 한 줄 결론

이 작업의 범위는 **PortOne V2 브라우저 SDK로 이니시스·KPN 카드 결제창 + 완료 페이지(PG 심사용)** 이고, 하지 않는 것은 **FAQ 전면 온라인결제 전환 · API Secret 프론트 · Functions 웹훅 배포 · 예약-결제 정산 스키마 확정**이다.
