# bookingNo · B2B / 알림톡 후속 (B2C에서 하지 않음)

B2C는 `reservations.bookingNo`(형식 `AP-MMDD-XXXX`)를 저장·표시하고, 조회 UI에 예약번호 모드를 추가했다.  
아래는 **airpick2-b-to-b** 쪽 할 일. 템플릿 검수·HQ UI는 이 레포에서 건드리지 않는다.

## 1. Cloud Function `lookupReservation` (코드 반영됨 · 배포 필요)

- `functions/src/api/lookupReservation.ts`에 `mode: 'bookingNo'` 분기 추가됨.
- **Functions 배포는 B2B에서** 해야 B2C 미리보기/본배포 조회가 동작한다.
- 배포 전: bookingNo 등호 조회용 단일 필드 인덱스(자동 생성되는 경우 많음) 확인.

## 2. HQ / 업체 앱 UI

| 항목 | 현황 | 제안 |
|------|------|------|
| `pending` 라벨 | `reservationStatus.ts`에 `접수대기` / 탭은 `예약완료` 혼재 | B2C 「즉시 확정」과 맞추면 `예약확정` 등으로 통일 검토. 대면 확인 플로우가 있으면 `접수대기` 유지 가능 — 제품 합의 후 |
| bookingNo 표시 | 카드·상세·배차표가 문서 id(`res_…`) 위주 | `bookingNo` 있으면 손님용 번호로 표시, 없으면 `res_` 유지. 검색/필터에 bookingNo 추가 검토 |
| 홈페이지 예약 완료 | `HomepageBookingPage` 「예약번호」 | 동일 규칙으로 bookingNo 우선 |

## 3. 알림톡 템플릿 (바꾸지 말 것 · 검수 메모만)

현재 변수: `고객명`, `차량번호`, `토큰`, `업체명`, `인도일시`, … — **예약번호(bookingNo) 변수 없음**.

템플릿에 손님용 번호를 넣으려면:

1. NCP/NHN에 **새 템플릿 검수** (기존 코드 수정 금지).
2. 본문에 `#{예약번호}`(또는 합의된 변수명) 추가.
3. `functions/src/alimtalk/templateParams.ts`의 `baseParams` / `AlimtalkTemplateParams`에 `예약번호: bookingNo \|\| 문서id` 매핑.
4. 14자 클램프(`clampAlimtalkValue`) — `AP-MMDD-XXXX`는 13자라 여유 있음. 문서 id(`res_…`)는 길면 클램프·별도 정책 필요.
5. 검수 통과 후 template code 교체·배포.

## 4. 배포 순서 제안

1. B2B Functions (`lookupReservation`) 배포 → B2C bookingNo 조회 활성화  
2. (선택) HQ UI 라벨·bookingNo 표시  
3. (선택·검수 후) 알림톡 새 템플릿
