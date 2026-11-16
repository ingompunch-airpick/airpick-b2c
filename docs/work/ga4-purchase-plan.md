# Plan: GA4 purchase (예약 완료)

> 전제: `docs/work/ga4-purchase-research.md`  
> **승인됨** (사용자 상세 스펙 = 구현 지시, 2026-11-14).

## 목표

예약 저장 성공 직후 GA4 `purchase`가 예약당 1회 전송된다.

## 하지 않음

- GTM/`reservation_complete` 제거·변경
- 버튼 클릭·완료 화면 재방문 시 재전송
- Functions 배포

## 변경

### B2C
1. `analytics.ts` — `trackPurchaseOnce` (sessionStorage 키 `ga4.purchase.{id}`, gtag event; 태그 이미 있으면 재로드 안 함)
2. `BookingModal.placeReservation` — `submitReservation` 성공 직후 호출 (`airpick_main`, `kakao`|`guest`)

### B2B (`airpick2-b-to-b`)
3. `homepageGtm.ts` 또는 `ga4Purchase.ts` — G-258 ensure 로드 + 동일 `trackPurchaseOnce`
4. `HomepageBookingPage` — 거절 확인 통과 후·`setDone` 직전/직후 purchase (`vendor_page`, `vendor_form`); 기존 `pushHomepageReservationComplete` 유지

## 검증

- [ ] B2C 비회원·카카오 각 1건 → DebugView purchase 1회
- [ ] /h/ 1건 → purchase + reservation_complete
- [ ] 새로고침 완료 화면 → purchase 재전송 없음
- [ ] tsc (양 레포)
