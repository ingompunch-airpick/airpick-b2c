# Plan: 카카오 회원 저장 · 마케팅 동의 구분

> 전제: `docs/work/kakao-member-marketing-research.md`  
> **이 파일이 승인되기 전에는 코드를 쓰지 않는다.**

## 목표

카카오 로그인이 끝나면 `members/{uid}`가 생긴다. 마케팅은 그 문서의 `marketingOptIn` 하나로 나눈다. `true`는 소식·할인을 받는 사람, `false`는 받지 않는 사람이다.

## 하지 않음

- 회원 컬렉션을 새로 만들거나 Auth 사용자 목록을 복사하지 않는다.
- 로그인 직후 동의 팝업을 추가하지 않는다. 질문은 지금 예약 화면 체크 하나만 쓴다.
- 체크 문구와 기본값(켜짐 = 받지 않음)을 바꾸지 않는다.
- 관리자 목록 화면, 문자 발송, 동의 시각 필드는 만들지 않는다.
- 없는 `marketingOptIn`을 `true`로 메우지 않는다. 없는 값은 읽을 때만 미동의로 본다.
- 비회원 예약을 이 회원 문서에 붙이지 않는다.
- 이 레포에서 Firestore rules를 배포하지 않는다.

## 화면·계정 범위

- [ ] 비로그인
- [x] 카카오 로그인
- [ ] 비회원 조회
- [ ] 해당 없음

## 데이터

- [ ] UI·카피만 (localStorage / 기존 필드)
- [ ] Firestore 읽기만
- [x] Firestore 쓰기 (어느 컬렉션·필드): `members/{uid}` · `marketingOptIn` bool. 전화번호가 없어도 로그인 직후 생성.
- [x] B2B Functions / rules 변경 필요 → **이 레포에서 안 함. B2B 이슈로 분리**

규칙이 먼저다. 지금은 전화번호 10자 미만이면 `members` 쓰기가 거절되므로, B2C만 고쳐도 로그인 회원은 저장되지 않는다.

B2B `firestore.rules`의 `kakaoMemberWriteValid`만 다음처럼 느슨하게 한다.

- `phone`은 빈 문자열이거나, 10자 이상 20자 이하.
- `marketingOptIn`은 필수 bool. 필드를 빼면 거절.
- 그 외 이름, uid, provider, `reservationIds`, `createdAt` 잠금은 유지.

볼 곳: Firebase 콘솔 → Firestore → `members`. 동의는 `marketingOptIn == true`, 미동의는 `== false`.

## 변경 체크리스트

1. B2B rules를 위 조건으로 고친 뒤, B2B 레포에서만 배포한다. 이 레포 작업은 그 배포 다음에 한다.
2. `saveKakaoMember`는 전화번호가 없어도 `members/{uid}`를 만든다. 로그인만 한 회원의 `marketingOptIn`은 `false`다. 이미 `true`인 문서는 로그인 저장이 `false`로 되돌리지 않는다.
3. 수정할 때는 서버에 있는 `reservationIds`와 `createdAt`을 그대로 다시 쓴다. 로컬 예약 번호로 서버 목록을 바꾸지 않는다. 서버에 전화번호가 있으면 빈 번호로 덮지 않는다.
4. 예약 화면 체크 결과는 같은 필드를 갱신한다. 체크 켜짐 → `false`. 체크 끔 → `true`. 예약 문서에는 지금처럼 `true`일 때만 `marketingOptIn: true`를 넣는다.

## 카피·숫자 (지어내지 말 것)

| 위치 | 문구 또는 규칙 |
|------|----------------|
| 예약 화면 | 기존 문구 유지. 「에어픽의 소식·할인 안내를 받지 않겠습니다.」 기본 체크 = 미동의 |
| `members.marketingOptIn` | `true` 동의, `false` 미동의. 필드 없음은 예전 문서이며 미동의로 해석 |

## 검증

- [ ] 전화번호 없는 카카오 로그인 후 `members/{uid}`가 생기고 `marketingOptIn`이 `false`
- [ ] 한 번 `true`인 회원이 다시 로그인해도 `false`로 바뀌지 않음
- [ ] 예약에서 체크를 끄면 그 회원 문서가 `true`, 켜면 `false`
- [ ] 비회원 예약은 `members`에 연결되지 않음
- [ ] 서버 `reservationIds`가 로그인 저장으로 비워지지 않음
- [ ] `./node_modules/.bin/tsc --noEmit`
- [ ] 로컬에서 예약 체크만 확인 (localhost:5173). rules 배포 전에는 빈 전화번호 저장이 거절되는 것이 맞다.

## 구현 지시 (승인 후 붙여넣기)

```
plan.md 대로만 구현해.
plan에 없는 리팩터·부가 기능 금지.
한 단계 끝날 때마다 tsc --noEmit.
커밋·브랜치·배포는 내가 말할 때까지 하지 마.
main만 사용.
Firestore rules 배포는 B2B 레포에서만.
```

## 메모 (사람이 적음)

<!-- 잘못된 가정, 도메인 제약, 수정 요청을 여기 또는 인라인으로 -->
