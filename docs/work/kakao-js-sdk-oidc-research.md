# Research: 카카오 JS SDK OIDC → Firebase credential

> 다음: `docs/work/kakao-js-sdk-oidc-plan.md`

## 1. 손님 한 명의 경로

- 시작: 홈·내 예약·예약 시트에서 「카카오 로그인」
- 중간: 지금은 Firebase `oidc.kakao` 팝업 → `*.firebaseapp.com` 중개 → 카카오 → 복귀 후 프로필 API 3회
- 끝: Firebase Auth 세션 + `members/{uid}` / localStorage 회원
- 이탈·헷갈림: Firebase 도메인 노출·딜레이. 카카오톡 인앱에서는 팝업이 약함

## 2. 관련 파일

| 역할 | 경로 |
|------|------|
| 로그인 본체 | `src/lib/socialAuth.ts` |
| 회원 세션 저장 | `src/lib/members.ts`, `src/lib/memberSession.ts` |
| 진입점 | `HomePage` / `MyPage` `applyKakaoLogin`, `BookingModal` `signInWithKakao`, `App` `completeKakaoRedirectLogin` |
| Auth 설정 | `src/config/firebase.ts` (`authDomain: airpick-reservation.firebaseapp.com`) |
| 프로필 프록시(dev) | `vite.config.ts` `/api/kakao-*` |
| 익명 로그인 | `src/lib/reservations.ts` `signInAnonymously` (접수 시) |
| 규칙 참고 | `docs/FIRESTORE_RULES_CANONICAL.md` — 공급자 `oidc.kakao` |

## 3. 이미 있는 규칙 (코드·합의)

- B2C 가입은 카카오만. Firestore `members/{uid}` ID = Firebase Auth uid. 공급자 `oidc.kakao`.
- 비회원 예약 자동 병합 금지.
- 로그인 후 닉네임·사진은 표시용. 예약자명은 손님이 적은 값 / 기존 저장값만.
- 전화번호 10자 미만이면 `members` 문서 쓰기 스킵(규칙은 번호 요구).
- Functions·rules 배포는 B2B만.
- 현재 팝업: 익명이면 `linkWithPopup`, 이미 카카오면 `signInWithCredential` / `signInWithPopup`.

## 4. 건드리면 안 되는 것

- [x] Functions / Firestore rules 배포는 B2B만
- [x] 후기 수·보험 등 숫자 지어내기 금지
- [x] 비회원 예약 카카오 자동 병합 금지
- [x] main만
- [x] 커밋·푸시·배포는 요청 전 금지
- 기타: 기존 `oidc.kakao` Firebase 제공자·동일 카카오 앱(REST Client ID)을 바꿔 UID가 갈라지게 하지 않음

## 5. 모르는 것 / 확인 필요

- 카카오 개발자 콘솔에 **OpenID Connect**·redirect URI(`https://www.에어픽.kr/...`, localhost) 등록 여부.
- Firebase `oidc.kakao`에 넣은 Client ID가 **REST API 키**인지. JS 키로 받은 `id_token.aud`와 다르면 Firebase가 거절하거나 **별 UID**가 난다(카카오 데브톡·Firebase 앱키 단위 구분).
- 인가 코드 → 토큰 교환 시 Client Secret을 브라우저에 둘지, B2B Functions로 둘지. (비밀은 B2B가 맞음. 공개 클라이언트면 JS만으로 가능한지 콘솔 설정 확인.)
- `Kakao.Auth.authorize` + `openid` + `nonce`로 `id_token`까지 오는지(토큰 응답 필드). 안 오면 REST 토큰 교환 필수.
- 안드로이드 외부 브라우저에서 `throughTalk: true` 복귀 이슈 → 인앱/환경별 분기 필요할 수 있음.

## 6. UID·회원 데이터 유지 (확인 결과)

- Firebase는 OIDC `sub`(카카오 회원번호) + 제공자 `oidc.kakao`로 기존 사용자를 찾는다.
- **같은 Firebase 프로젝트 · 같은 `oidc.kakao` · Firebase에 등록된 것과 같은 카카오 Client ID로 발급된 `id_token`** 이면, 이미 카카오로 들어본 손님의 **Firebase UID는 그대로**다.
- `members/{uid}`, `pointAccounts/{uid}`, 예약의 `userId` 등 uid 키 데이터도 **그대로** 붙는다.
- 예전에 익명 → `linkWithPopup`으로 카카오를 붙인 계정도, 이후에는 provider `sub`로 그 사용자가 조회되므로 `signInWithCredential(id_token)`도 **같은 UID**로 들어온다.
- 깨지는 경우: JS 키/다른 앱키로 토큰을 받거나, Firebase OIDC Client ID를 바꾸거나, 새 OIDC 제공자를 만들 때 → **새 UID**. 이번 작업에서 금지.

## 7. 한 줄 결론

이 작업의 범위는 **카카오 JS(또는 동등 redirect)로 openid `id_token`+nonce를 받아 `oidc.kakao` credential로 Firebase 로그인하고, 프로필은 토큰 우선·부족분만 백그라운드**이며, 하지 않는 것은 **회원 스키마 변경·UID 마이그레이션·비회원 병합·B2B rules 배포·결제**이다.
