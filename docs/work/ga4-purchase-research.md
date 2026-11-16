# Research: GA4 purchase (예약 완료)

> 다음: `docs/work/ga4-purchase-plan.md`  
> 요청: G-258VBKY6C2로 A(`/h/{slug}`)·B(에어픽.kr) 예약 성공 시 `purchase` 1회.

## 1. 손님 경로

- A: `airpick-reservation.web.app/h/{업체}` → 저장 성공 → 완료 화면 (B2B `HomepageBookingPage`)
- B: 에어픽.kr 모달 → 확인 → 카카오/비회원 접수 → `submitReservation` 성공 (B2C `BookingModal.placeReservation`)

## 2. 관련 파일

| 역할 | 경로 |
|------|------|
| B2C GA | `src/lib/analytics.ts`, `src/firebase.ts` (이미 measurementId) |
| B2C 예약 성공 | `src/components/BookingModal.tsx` |
| B2B /h/ | `airpick2-b-to-b` `HomepageBookingPage.tsx`, `homepageGtm.ts` |
| B2B config | `firebase-applet-config.json` measurementId 동일 |

## 3. 이미 있는 규칙

- B2C: Firebase Analytics = G-258 (gtag 기반). `parking_book_complete`는 「내 예약 보기」클릭 시.
- B2B /h/: 업체 GTM + `reservation_complete` dataLayer (`homepageGtm.ts`). GA4 G-258은 /h/에 **미로드**.
- 중복 방지 패턴: GTM은 sessionStorage + Set.

## 4. 건드리면 안 되는 것

- 업체별 GTM·`reservation_complete` 유지
- Functions/rules 배포 없음
- 예약 저장 로직·필드 변경 없음

## 5. 한 줄 결론

범위는 **성공 직후 `purchase` 1회 + /h/에 G-258 로드(중복 없이)** 이고, GTM·기존 예약 로직은 그대로다.
