# Plan: PortOne V2 PG 심사용 결제

> 전제: `docs/work/portone-v2-pg-review-research.md`  
> **승인 전 코드 금지.**  
> 목적: PG사 심사용 **테스트 모드** 결제창. 손님용 「전면 온라인 결제」제품 전환은 별도.

## 목표

예약 흐름에서 **KG이니시스 카드 / KPN 카드**를 고르면 PortOne V2 `requestPayment` 결제창이 뜨고, 모바일 `redirectUrl`로 완료 페이지에서 `paymentId`와 「결제가 완료되었습니다」를 보여 준다.

## 하지 않음 (1차)

- FAQ·홈·공식답변을 「앱에서 카드 결제」로 전면 교체
- PortOne API Secret / 서버 결제 검증 웹훅 (B2B Functions — 후속)
- 결제 성공 ↔ `submitReservation` 자동 묶기·정산 필드 (후속 합의)
- 현금·계좌·간편결제 등 CARD 외 payMethod
- 사설주차장·eSIM 결제

## 화면·계정 범위

- [x] 비로그인 · 카카오 (예약자 이름·전화·이메일 → `customer`)
- [x] 예약 모달 확인 단계 + `/payment/complete` (또는 동등 SPA path)
- [ ] 해당 없음: PG 콘솔 설정(사람이 함)

## 데이터

- [x] UI + `VITE_` 환경변수 (storeId · channelKey 2개)
- [ ] Firestore 결제 필드 쓰기 — **1차 안 함** (완료 페이지만)
- [ ] B2B Functions — **안 함**

## 환경변수 (`.env` / `.env.example`)

| 키 | 설명 |
|----|------|
| `VITE_PORTONE_STORE_ID` | store-… |
| `VITE_PORTONE_CHANNEL_KEY_INICIS` | channel-key-… (KG이니시스) |
| `VITE_PORTONE_CHANNEL_KEY_KPN` | channel-key-… (KPN) |
| `VITE_PORTONE_ENABLED` | `true` 일 때만 예약 UI에 결제 수단 노출 (기본 꺼짐 권장) |

실제 값은 **사람이 `.env`에만** 넣고 커밋하지 않음. 요청문의 `[store-…]` 플레이스홀더는 코드에 하드코딩 금지.

## 화면 기획

### A. 예약 모달 (확인 직전 / 확인 단계)

- 결제수단 라디오·버튼 2개:
  1. **KG이니시스 카드결제**
  2. **KPN 카드결제**
- (기존) 현장 접수 CTA와 병행: 플래그 on일 때만 카드 2종 노출. 현장 접수는 유지해도 됨(심사 중 회귀 방지).
- 선택 후 「결제하기」→ `PortOne.requestPayment`.

### B. `requestPayment` 파라미터

```
storeId: VITE_PORTONE_STORE_ID
channelKey: 선택 채널
paymentId: "order-" + Date.now() (+ 필요 시 짧은 random)
orderName: "에어픽 공항주차 예약"
totalAmount: 모달에 표시 중인 결제 예정 금액(원, 정수)
currency: "CURRENCY_KRW"
payMethod: "CARD"
customer: {
  fullName: 예약자 이름,
  phoneNumber: 예약자 휴대폰,
  email: 회원 이메일이 있으면 그것, 없으면 심사용 플레이스홀더 규칙(합의) — 이니시스 필수
}
redirectUrl: `${origin}/payment/complete` (쿼리로 paymentId 전달 가능하면 함께)
```

- 응답에 `code` 있으면 → `alert(message)` (또는 동등) 후 중단.
- 없으면 → 완료 페이지로 이동 (`paymentId` 포함).

### C. 결제완료 페이지 `/payment/complete`

- URL/query/state에서 `paymentId` 표시.
- 카피: **결제가 완료되었습니다**
- 홈·내 예약 링크 정도만. 예약 문서 생성은 1차 필수 아님.

## 구현 체크리스트 (승인 후)

1. `npm i @portone/browser-sdk` (+ `vite-env.d.ts` 타입)
2. `.env.example`에 위 키 추가 (값 비움)
3. `src/lib/portonePayment.ts` — requestPayment 래퍼·에러 처리
4. BookingModal — 플래그 on 시 결제수단 UI + 호출
5. `PaymentCompletePage` + App path `/payment/complete`
6. `tsc --noEmit`
7. 로컬에서 이니시스·KPN 각각 창 오픈 확인 (키는 로컬 `.env`)

## 카피·숫자

| 위치 | 규칙 |
|------|------|
| orderName | `에어픽 공항주차 예약` 고정 |
| totalAmount | 모달 표시 금액만. 창작 금지 |
| 완료 | `결제가 완료되었습니다` |
| FAQ | 1차 변경 없음 |

## 검증

- [ ] `VITE_PORTONE_ENABLED=true` + 키 있을 때만 결제 UI
- [ ] 이니시스·KPN 각각 `requestPayment` · CARD
- [ ] customer에 이름·전화·이메일
- [ ] redirectUrl 모바일 복귀 → 완료 페이지 + paymentId
- [ ] code 있으면 alert, 성공 시 완료 페이지
- [ ] Secret 프론트 없음
- [ ] `tsc --noEmit`

## 구현 지시 (승인 후)

```
portone-v2-pg-review-plan.md 대로만 구현해.
VITE_PORTONE_* 만 사용. Secret·웹훅·FAQ 전면 전환·예약 자동 묶기 금지.
키 값은 .env에만 (커밋 금지). 플레이스홀더 하드코딩 금지.
커밋·배포는 말할 때까지 하지 마. main만.
```

## 메모 (사람이 적음)

- **승인 (2026-11-16):** 구현 진행. 키는 로컬 `.env`의 `VITE_PORTONE_*` (커밋 금지).
- 이메일 없을 때: `guest+{휴대폰숫자}@airpick.kr`
