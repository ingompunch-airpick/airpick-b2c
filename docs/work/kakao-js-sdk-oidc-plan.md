# Plan: 카카오 JS SDK OIDC → Firebase credential

> 전제: `docs/work/kakao-js-sdk-oidc-research.md`  
> **승인 전 코드 금지.**

## 목표

손님에게 카카오 로그인 시 **Firebase 중개 화면 없이** 리다이렉트(인앱·카톡 간편로그인 포함)로 들어가게 하고, 로그인 직후 체감 지연을 줄인다. **기존 Firebase UID·`members`는 유지**한다.

## 하지 않음

- Firebase `oidc.kakao` 제공자 교체·Client ID 변경·새 OIDC 앱 생성
- 비회원 예약 자동 병합
- 회원/포인트 스키마 변경, 결제
- B2B Functions·rules **배포** (토큰 교환을 Functions에 둘 경우 **코드는 B2B 이슈로 분리**, 이 레포에서 배포 안 함)
- 카카오 로그아웃 UX 전면 개편(기존 플래그·세션 정리만 맞춤)
- `authDomain` 커스텀 도메인 작업(별도)

## 화면·계정 범위

- [x] 비로그인
- [x] 카카오 로그인
- [x] 비회원 조회 (동작 유지, 로그인 경로만 변경)
- [ ] 해당 없음

## 데이터

- [x] UI·카피만 아님 — Auth 흐름 변경
- [x] Firestore 쓰기: 기존과 동일 `members/{uid}` (`saveKakaoMember`)
- [ ] B2B Functions 변경 필요 가능 → 토큰 교환에 Client Secret이 필요하면 **B2B 이슈로 분리**. 공개 클라이언트로 콘솔에서 가능하면 B2C만.

## UID 유지 (구현 조건)

1. Firebase 콘솔 `oidc.kakao`의 Client ID = 토큰 발급에 쓰는 카카오 앱 키(현재 REST API 키 전제).
2. `OAuthProvider('oidc.kakao').credential({ idToken, rawNonce })` → `signInWithCredential` / 익명이면 `linkWithCredential`(실패 시 기존처럼 credential-already-in-use면 `signInWithCredential`).
3. `members/{uid}` 키·필드는 그대로. 마이그레이션 없음.

위가 아니면 구현 중단하고 보고.

## 변경 체크리스트

1. **환경값**  
   - `VITE_KAKAO_JS_KEY`(또는 문서화한 공개 키) 추가.  
   - Redirect URI는 앱 origin 기준 고정 경로(예: `https://www.에어픽.kr/` 및 `/my`, localhost). 카카오 콘솔·실제 `redirect_uri` 문자열 일치.

2. **nonce**  
   - 로그인 시작 시 cryptographically random `rawNonce` 생성 → `sessionStorage` 저장.  
   - 카카오 authorize 요청에 `nonce`(스펙: raw를 그대로 넣거나 카카오 문서 기준; Firebase는 id_token의 `nonce`가 **SHA-256(rawNonce)** 와 일치해야 함 → 카카오/Firebase 문서에 맞춰 해시·전달).

3. **로그인 시작 (`signInWithKakao` 개편)**  
   - 팝업/`signInWithPopup`/`linkWithPopup` 제거(신규 경로).  
   - Kakao JS SDK 로드·`Kakao.init`.  
   - `Kakao.Auth.authorize({ redirectUri, scope: 'openid,profile_nickname,profile_image', nonce, throughTalk })`.  
   - 카카오톡 인앱(`KAKAOTALK` UA 등): `throughTalk: true`로 간편로그인.  
   - Android 외부 브라우저에서 throughTalk 복귀 문제가 확인되면 해당 UA만 `throughTalk: false`(리서치 이슈).  
   - 출발 전 `KAKAO_REDIRECT_FLAG`·부킹 드래프트는 기존처럼 유지.

4. **리다이렉트 복귀**  
   - URL `code`(또는 에러) 감지.  
   - 인가 코드 → 토큰 응답에서 `id_token`(·필요 시 `access_token`).  
     - Client Secret 불필요 설정이면 B2C에서 교환.  
     - Secret 필요하면 B2B HTTPS Function 호출만 하고, **배포는 B2B**.  
   - `rawNonce` 읽어 `OAuthProvider('oidc.kakao').credential({ idToken, rawNonce })`.  
   - 익명 세션: `linkWithCredential` 시도 → 이미 연결된 카카오면 `signInWithCredential`.  
   - 비익명: `signInWithCredential`.  
   - 쿼리에서 `code`/`state` 제거(replaceState).  
   - `completeKakaoRedirectLogin` / App 복귀 effect를 이 흐름에 맞게 단일화. Firebase `getRedirectResult` 의존 제거(레거시 한 번 호출해도 무해하면 남겨도 됨, 신규 성공 경로 아님).

5. **프로필**  
   - 1차: `id_token` JWT claim(`nickname`, `picture`, `sub` 등) + Firebase `updateProfile`은 있을 때만.  
   - 로그인 **완료 후** 백그라운드: access_token 있으면 기존 `/api/kakao-user-me`(또는 OIDC userinfo)로 부족 닉네임·사진만 보강 → `saveKakaoMember` / `updateProfile`. 예약 버튼은 토큰 로그인 성공 직후 진행 가능.

6. **진입점 정리**  
   - `applyKakaoLogin` / `BookingModal` / `MyPage` / `HomePage`: 시작은 authorize(창 이동), 복귀는 App(또는 boot) 한곳에서 처리.  
   - 에러 메시지: unauthorized-domain·invalid-credential 등 기존 `socialLoginErrorMessage` 재사용·OIDC/nonce 실패 문구 추가.

7. **검증용 메모(콘솔)**  
   - 구현 PR/검증 전에: 카카오 Redirect URI, OIDC 사용, Firebase Client ID = 토큰 `aud` 일치 여부를 체크리스트로 확인.

## 카피·숫자 (지어내지 말 것)

| 위치 | 문구 또는 규칙 |
|------|----------------|
| 로그인 실패 | 기존 톤 유지. Firebase Client Secret 불일치 문구는 토큰 교환 실패 시에만 |
| 할인·포인트 | 변경 없음 |

## 검증

- [ ] 기존 카카오 테스트 계정: 로그인 후 **UID가 변경 전과 동일** (`auth.currentUser.uid`, `members/{uid}`)
- [ ] 신규 카카오: 로그인·`members` 생성(전화번호 규칙 기존과 동일)
- [ ] 익명 접수 이력이 있는 세션에서 카카오 로그인: link 또는 기존 카카오 UID로 안정 진입(에러 없이)
- [ ] www / localhost redirect 복귀 후 예약 시트·내 예약 배너 정상
- [ ] 카카오톡 인앱에서 간편로그인 시도(실기기)
- [ ] 주소창에 Firebase `firebaseapp.com` 중개 없음
- [ ] `./node_modules/.bin/tsc --noEmit`
- [ ] 로컬 해당 탭만 확인

## 구현 지시 (승인 후 붙여넣기)

```
plan.md 대로만 구현해.
plan에 없는 리팩터·부가 기능 금지.
한 단계 끝날 때마다 tsc --noEmit.
커밋·브랜치·배포는 내가 말할 때까지 하지 마.
main만 사용.
```

## 메모 (사람이 적음)

<!-- Client Secret / Redirect URI / throughTalk Android 이슈 확인 결과 -->
