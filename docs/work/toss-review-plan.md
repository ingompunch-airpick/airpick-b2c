# Plan: 토스 카드사 심사 대응 (작업 4→1→2→3→5)

> 지시서: `Desktop/cursor-2026-11-24-toss-review.md`  
> 대상: 에어픽 B2C만. 업체 홈·B2B 예약 흐름 제외.

## 작업 순서

4(상호) → 1(기간) → 2(환불) → 3(테스트 결제) → 5(인트로)

---

## 작업 1 서버 검증 (확정·구현)

B2C는 **클라이언트 `setDoc`** → Rules가 실제 create 차단 가능해야 함.

| 층 | 역할 |
|----|------|
| UI | 날짜 min/max · 고지 문구 · `checkBookingWindow` (달력 6개월·90일 차이) |
| `assertBookingAllowed` | 저장 직전 동일 검사 |
| **Firestore rules** | `createdBy==airpick-b2c`만: 입고 ≤ `request.time+184d`, 출고≤입고+90d (근사 차단) |
| **Functions** `enforceBookingPolicyOnCreate` | 동일 근사 + KST today 기준. 통과해도 문서 삭제 백스톱. 홈페이지·B2B createdBy 제외 |

달력 6개월은 클라/`addCalendarMonths`. Rules·Function advance는 **184일 근사**.

---

## 작업 3 사전 확정: 결제 연동 방식

**계약:** 포트원 경유 토스페이먼츠 · 카드 MID `im_xnoh5bq0pi`.

### 기존 코드

| 항목 | 현재 |
|------|------|
| SDK | `@portone/browser-sdk/v2` (`src/lib/portonePayment.ts`) |
| 채널 | 기존 코드: 이니시스·KPN (포트원에서 **취소 예정**) |
| SDK | `@portone/browser-sdk/v2` 유지 |

**확정 (작업 3):** 포트원 → **토스페이먼츠 테스트 채널만** (`im_xnoh5bq0pi`). 이니시스·KPN 연동/버튼 제거.  
`paymentMode=off|test|live`, test는 관리자/`?payreview=1`. 토스 네이티브 SDK 직연동 없음.

**비범위:** 서버 결제 검증·실결제 오픈·지급대행.

---

## 작업 5 사전: 「확인 기준 보기」페이지

**현황:** `/verified/` **틀만** 둠 (`public/verified/index.html`). 섹션 4개(사업자·주차장·보험·CCTV) placeholder.  
`AIRPICK_VERIFIED.criteriaHref` → `/verified/`. **본문은 대표 제공 후 채움.**

---

## 작업 4 (이번 구현)

상호 칸 `에어픽 공항주차`만 / 별도 줄 `서비스명: 에어픽`.

- `SiteFooter`, `MarketingFooter`, `index.html#pg-legal-footer`, `scripts/legal-site-footer.mjs` → 정적 재생성
- About React는 이미 상호만 — `public/about` SSG만 맞춤

## 작업 2 취소·환불 규정 (11-24 구현)
- 규칙(대표 확정): 기준 = 입고 예정 시각(KST). 24시간 전까지(그 시각 포함) 100% / 그 뒤~입고 전 50% / 입고 이후(노쇼 포함) 0%. 결항 등 4항 예외는 기존대로 전액.
- `APP_CONFIG.refund` (fullRefundHours 24, lateRefundRatio 0.5) + `src/utils/refundPolicy.ts` `calcRefund` / `kstCheckInDate` / `formatRefundLine`. 경계값 테스트 PASS(25h·24h·23h·1분 전·입고 시각·입고 후).
- 문구: `public/refund/index.html` 2항 표·3항(온라인/현장 결제 구분)·5항, 개정일 표기. `consent.ts` 플랫폼 약관 제5조·업체 약관 제3조①.
- 현장 결제 예약은 동작 그대로(24시간 이내 앱 취소 불가 → 업체 연락).
- 작업 3으로 넘김: 결제 직전 필수 동의 체크, 온라인 결제 건 취소 화면의 예상 환불액(`formatRefundLine`), 24시간 이내 50% 셀프 취소·포트원 부분 환불. 결제 금액 필드가 생긴 뒤에 붙인다.

## 작업 3 테스트 결제창 (11-24 구현)
- 채널: 포트원 → 토스페이먼츠 테스트 채널만(`VITE_PORTONE_CHANNEL_KEY_TOSS`, 공용 MID iamporttest_3). 이니시스·KPN 코드·env 제거.
- `APP_CONFIG.paymentMode = 'test'` + `lib/paymentMode.ts`: `?payreview=1`로 들어온 탭(sessionStorage)만 결제 단계 노출, `?payreview=0`으로 끔. live는 전원.
- 확인 화면(「이 내용이 맞나요?」)에 결제 섹션: 결제 금액 · 환불 규정 요약 · [필수] 취소·환불 동의 체크 · 「카드 결제 · N원」. 동의 전 버튼 비활성.
- 상품명 `{업체} 주차대행 {N박 M일}`. 결제 요약을 sessionStorage에 저장 → `/payment/complete`에서 상품·일정·금액·결제번호 표시, 모바일 리다이렉트 실패(`code`) 처리. 테스트 결제 안내 문구.
- 예약 문서는 만들지 않음(심사용) → 업체 전달·알림톡·정산 영향 없음. 이전 화면의 「테스트용 · PG 심사 전용」 이니시스/KPN 버튼(모든 손님에게 보이던 것) 제거.
- 비범위: 서버 결제 검증, 결제-예약 연결, 실결제, 지급대행, 취소 화면 예상 환불액.

## 작업 5 인트로 → 홈 상단 배너 (11-24, 대표 결정)
- 인트로 게이트는 처음 한 번만 뜨고, 예약하러 온 손님에게 한 단계를 더 만듦 → 폐지. 옛 게이트는 `?intro=1` 미리보기만.
- `components/home/HomeBrandHero.tsx`: 영상 배경(오버레이 65% + 가운데 방사형) · 300곳 문구 · 「확인된 업체에만 내 차를 맡기세요」 · ✓4가지 · 확인 기준 링크 · 「업체·요금 비교하기」(아래 #home-search로 스크롤). 하단 패딩으로 검색 카드가 첫 화면에 겹쳐 보이게.
- 홈 날짜 아래 안내는 짧은 문구(`bookingWindowShort`), 9개월 전체 문구는 업체 상세·결제 칸.
- 영상 약 2.2MB(브라우저 캐시). 동작 줄이기 설정이면 포스터 이미지.
