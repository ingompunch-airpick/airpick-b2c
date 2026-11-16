# Research: 카카오 회원 저장 · 마케팅 동의 구분

> 목적: 카카오 로그인 회원을 언제 저장하고, 마케팅 동의·미동의를 어떤 값으로 나누는지.  
> 다음: `docs/work/kakao-member-marketing-plan.md`

## 1. 손님 한 명의 경로

- 시작: 카카오 로그인. Firebase Auth 계정만 생기고, 전화번호가 없으면 `members` 문서는 안 만든다.
- 중간: 예약 화면의 「에어픽의 소식·할인 안내를 받지 않겠습니다.」 체크. 기본은 켜짐(미동의). 끄면 동의.
- 끝: 회원으로 예약하고 전화번호가 10자 이상일 때만 `members/{uid}`에 `marketingOptIn`을 쓴다.
- 이탈·헷갈림이 나는 지점: 로그인만 한 사람은 동의·미동의 목록 어디에도 없다. 체크가 켜진 것(받지 않음)이 미동의라, 목록을 볼 때 반대로 읽기 쉽다.

## 2. 관련 파일

| 역할 | 경로 |
|------|------|
| 예약 화면 체크 | `src/components/BookingConsent.tsx` |
| 체크 초기값·저장 호출 | `src/components/BookingModal.tsx` |
| 회원 저장 | `src/lib/members.ts` (`saveKakaoMember`) |
| 로그인 후 저장 시도 | `src/App.tsx` |
| 세션 필드 | `src/lib/memberSession.ts` (`marketingOptIn`) |
| 예약 문서 | `src/lib/reservations.ts` — `true`일 때만 필드 추가 |
| 규칙 | `airpick2-b-to-b/firestore.rules` `members/{uid}` |

## 3. 이미 있는 규칙 (코드·합의)

- 컬렉션은 `members`. 문서 ID는 카카오 Firebase uid. 별도 회원 DB는 없다.
- `marketingOptIn === true`만 동의. `false`이거나 필드가 없으면 미동의.
- 체크가 켜져 있으면 `marketingOptIn`은 `false`. 꺼져 있으면 `true`.
- 규칙은 전화번호 10자 미만 쓰기를 거절한다. `saveKakaoMember`도 그 경우 Firestore에 안 쓴다.
- 만들 때는 `reservationIds`가 빈 목록이어야 한다. 손님이 그 목록을 바꾸면 수정이 거절된다.
- 비회원 예약을 카카오 계정에 자동으로 붙이지 않는다.
- 관리 화면에서 이 필드를 나눠 보여주는 곳은 없다. 본사 관리자만 `members`를 읽을 수 있다.

## 4. 건드리면 안 되는 것

- [x] Functions / Firestore rules 배포는 B2B(`airpick2-b-to-b`)만
- [x] 후기 수·보험 보장·복귀 시간 등 숫자 지어내기 금지
- [x] 비회원 예약을 카카오 계정에 자동 병합 금지 (합의 전까지)
- [x] main만 사용. cursor/* 브랜치 만들지 않음
- [x] 커밋·푸시·호스팅 배포는 요청 전까지 금지
- 기타: 동의하지 않은 사람을 `true`로 채우는 마이그레이션 금지. 체크 문구·기본값(켜짐 = 미동의) 변경 금지.

## 5. 모르는 것 / 확인 필요

- 로그인 직후 같은 체크를 한 번 더 띄울지는 이번 범위에서 정하지 않는다. 질문은 예약 화면에만 있다.
- 동의 시각 필드는 아직 없다. 언제 동의했는지는 지금 문서로 알 수 없다.

## 6. 한 줄 결론

이 작업의 범위는 카카오 로그인 직후 `members/{uid}`를 만들고 `marketingOptIn`을 항상 true/false로 남기는 것 이고, 하지 않는 것은 새 회원 DB, 관리 화면, 로그인 동의 팝업, 비회원 예약 병합 이다.
