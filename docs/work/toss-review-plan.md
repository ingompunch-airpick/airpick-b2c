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
