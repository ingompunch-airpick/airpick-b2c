# Plan: 회원 DB · 광고성 정보 수신동의 기록

> 대체: `docs/work/kakao-member-marketing-plan.md`는 폐기. 동의 시각을 안 남기고, 옛 체크 문구(받지 않겠습니다) 기준이라 이 문서로 바꾼다.  
> **이 파일이 승인되기 전에는 코드를 쓰지 않는다.**  
> 순서: ① B2B 레포에서 rules 수정·배포 → ② 이 레포 구현.

## 목표

1. 카카오 로그인만 해도 `members/{uid}`가 생긴다. 전화번호가 없어도 된다.
2. 광고성 정보 수신 동의·철회를 **언제, 어디서, 어떤 문구로** 했는지 남긴다.
3. 회원은 마이페이지에서 동의·철회를 직접 바꾸고, 처리 결과를 바로 본다.

## 하지 않음

- 광고 발송 기능, 관리자 회원 화면, 2년 재확인 발송, 알림톡 처리결과 통지 → B2B 후속
- 마이페이지 개편(진행 중 예약 카드, 예정·완료·취소 탭, 쿠폰함, 탈퇴) → 별도 plan
- 카카오 동의항목(전화번호, 채널 추가) 변경 → 카카오 콘솔에서 사람이 한다
- 비회원 예약을 회원 문서에 붙이기
- 없는 `marketingOptIn`을 `true`로 채우기. 없는 값은 미동의로 읽는다
- `reservationIds` 처리 방식 변경. 지금 코드 그대로 둔다
- `reservations` 문서 필드 추가
- 이 레포에서 rules 배포

## 화면·계정 범위

- [x] 비로그인 (예약 화면 동의 문구만)
- [x] 카카오 로그인
- [ ] 비회원 조회
- [ ] 해당 없음

## 데이터

- [ ] UI·카피만
- [ ] Firestore 읽기만
- [x] Firestore 쓰기: `members/{uid}` 마케팅 필드, `members/{uid}/consentLogs/{autoId}` 새 하위 컬렉션
- [x] B2B rules 변경 필요 → **이 레포에서 안 함. B2B 레포에서 먼저**

### `members/{uid}`

| 필드 | 타입 | 규칙 |
|------|------|------|
| 기존 (uid, name, phone, carModel, carNumber, provider, reservationIds, createdAt, updatedAt) | 그대로 | `phone`은 빈 문자열 허용 |
| `marketingOptIn` | bool | 필수. 새 문서는 `false` |
| `marketingAgreedAt` | Timestamp \| null | 지금 유효한 동의 시각. 서버 시각(`serverTimestamp`). 철회하면 `null` |
| `marketingWithdrawnAt` | Timestamp \| null | 철회 시각. 서버 시각. 동의하면 `null` |
| `marketingSource` | `'booking'` \| `'mypage'` | 마지막으로 바꾼 곳 |
| `marketingChannels` | `['sms','kakao']` \| `[]` | 동의하면 둘 다, 철회하면 빈 배열 |
| `marketingTextVersion` | string | 동의 문구 버전. `'2026-11-v1'` |

### `members/{uid}/consentLogs/{autoId}` (추가만, 수정·삭제 없음)

| 필드 | 값 |
|------|----|
| `action` | `'agree'` \| `'withdraw'` |
| `at` | `serverTimestamp()` |
| `source` | `'booking'` \| `'mypage'` |
| `channels` | `['sms','kakao']` \| `[]` |
| `textVersion` | `'2026-11-v1'` |

### 비회원 (`reservations`)

변경 없음. `marketingOptIn: true`인 예약은 동의 시각 = `createdAt`, 동의한 곳 = 예약 화면으로 본다.

## ① B2B rules (B2B 레포에서 먼저)

`airpick2-b-to-b/firestore.rules`의 `members` 블록과 `kakaoMemberWriteValid`를 먼저 읽고, 아래만 바꾼다.

- `phone`: 빈 문자열이거나 10자 이상 20자 이하
- `marketingOptIn`: 필수 bool
- `marketingAgreedAt`, `marketingWithdrawnAt`: 없음, `null`, `request.time`, 또는 기존 값과 같음
- `marketingSource`: 없음 또는 `'booking'`/`'mypage'`
- `marketingChannels`: 없음 또는 list, `size() <= 2`, `hasOnly(['sms','kakao'])`
- `marketingTextVersion`: 없음 또는 string, 20자 이하
- 허용 키 목록(`keys().hasOnly`)을 쓰면 위 5개 키 추가
- 그 외 잠금(uid, provider, createdAt 등)은 그대로
- 새 match `/members/{uid}/consentLogs/{logId}`
  - read: 본인(`request.auth.uid == uid`)
  - create: 본인 + 로그인 공급자 `oidc.kakao` + 키는 위 5개만 + `at == request.time` + 값 범위 검증
  - update, delete: `false`
- 규칙 테스트가 있으면 케이스 추가: 빈 전화번호 생성 허용, 남의 문서 거절, 로그 수정·삭제 거절, 과거 시각 위조 거절

## ② 이 레포 변경 체크리스트 (rules 배포 후)

1. `src/lib/memberSession.ts`
   - `MemberSession`에 `marketingAgreedAt?: string`, `marketingWithdrawnAt?: string` (ISO, 화면 표시용 캐시) 추가, `parse`에서 읽기
2. `src/lib/members.ts` `saveKakaoMember`
   - `if (next.phone.trim().length < 10) return;` 삭제. 전화번호가 10자리 미만이면 `phone: ''`로 쓴다
   - 서버 문서를 먼저 읽는다(카카오 uid가 맞을 때 항상). 서버에 전화번호가 있고 로컬이 비어 있으면 `phone`을 보내지 않는다
   - 마케팅 필드는 **서버 문서가 없을 때만** `marketingOptIn: false`를 넣는다. 문서가 있으면 마케팅 필드를 아예 보내지 않는다(merge로 보존)
3. 새 파일 `src/lib/marketingConsent.ts`
   - `MARKETING_TEXT_VERSION = '2026-11-v1'`
   - `readMarketingConsent(uid)`: 서버 값 `{ optIn, agreedAt, withdrawnAt }` (Timestamp → ISO)
   - `setMarketingConsent(agree: boolean, source: 'booking' | 'mypage')`
     - 카카오 로그인 uid가 아니면 에러
     - 서버 문서가 없으면 `saveKakaoMember(readMember())`로 먼저 만든다
     - 서버 `marketingOptIn`이 이미 `agree`와 같으면 쓰지 않고 현재 값 반환(로그 중복 방지)
     - `writeBatch` 하나로: 회원 문서 마케팅 필드 갱신 + `consentLogs` 1건 생성. 둘 다 되거나 둘 다 안 된다
     - 끝나면 서버 값을 다시 읽어 로컬 세션(`saveMember`)에 반영하고 `{ agree, at }` 반환
4. `src/components/BookingModal.tsx`
   - 283행 근처 회원 정보 저장에서 `marketingOptIn: marketingOptIn || existing?.marketingOptIn === true` 제거. 회원 정보 저장은 동의를 바꾸지 않는다
   - 577행 `saveKakaoMember({ ...next, marketingOptIn })` → `saveKakaoMember(next)` 다음에 `setMarketingConsent(marketingOptIn, 'booking')`. 같은 값이면 함수가 알아서 건너뛴다
   - 비회원은 지금처럼 `submitReservation`에 `marketingOptIn`만 넘긴다
   - 예약 완료 화면: 회원은 동의·철회가 실제로 바뀐 경우, 비회원은 체크한 경우에 처리결과 안내 한 줄 표시(카피 표)
5. `src/components/BookingConsent.tsx`
   - 체크 문구·보조 문구 교체(카피 표). 기본값은 빈 칸 그대로
   - `SheetKey`에 `'marketing'` 추가. 문구 옆 「자세히」 → 마케팅 동의 상세 시트(카피 표). 개인정보처리방침 링크는 시트 안으로 옮긴다
6. `src/pages/MyPage.tsx`
   - 회원 정보 섹션과 설정 섹션 사이에 「알림 설정」 섹션(회원만)
   - 행 하나: 「광고성 정보 수신 (문자·카카오톡)」 + 토글. 아래 작은 글씨로 상태(카피 표)
   - 처음 값은 `readMarketingConsent`, 실패하면 로컬 값
   - 토글 → `setMarketingConsent(next, 'mypage')`. 저장 중 비활성. 성공하면 처리결과 안내 시트, 실패하면 원래 값으로 되돌리고 에러 문구
7. `src/pages/PrivacyPolicyPage.tsx`
   - 1번 처리 목적에 한 줄 추가, 3번 보유 기간에 한 줄 추가(카피 표)

## 카피·숫자 (지어내지 말 것)

> KISA 안내서(2026.3 개정): 동의를 받을 때 '혜택 알림', '정보제공'처럼 광고가 아닌 것처럼 보이는 표현 금지. 「광고성 정보 수신동의」라고 써야 한다.

| 위치 | 문구 또는 규칙 |
|------|----------------|
| 예약 화면 체크 | `[선택] 광고성 정보 수신 동의 (문자·카카오톡)` |
| 예약 화면 보조 | `할인·이벤트 소식을 보내드려요. 동의하지 않아도 예약할 수 있어요.` |
| 상세 시트 제목 | `광고성 정보 수신 동의 (선택)` |
| 상세 시트 본문 | 항목: 이름, 휴대전화번호 / 목적: 에어픽 할인·이벤트 등 광고성 정보 전송 / 수단: 문자, 카카오톡 / 보유 기간: 동의 철회 또는 회원 탈퇴 시까지 / 철회: 마이페이지 > 알림 설정, 또는 받은 메시지의 수신거부 방법 / 동의하지 않아도 예약에 불이익이 없어요. |
| 처리결과 안내 | `에어픽 · 광고성 정보 수신 {동의/철회} · {YYYY년 M월 D일} · 처리 완료` |
| 마이페이지 섹션 | 제목 `알림 설정`, 행 `광고성 정보 수신 (문자·카카오톡)` |
| 마이페이지 상태 | 동의: `동의일 YYYY.MM.DD` / 미동의: `받지 않음` / 철회: `철회일 YYYY.MM.DD` |
| 마이페이지 에러 | `저장하지 못했어요. 잠시 후 다시 시도해 주세요.` |
| 개인정보처리방침 1번 | `광고성 정보 전송(동의한 경우에 한함): 할인·이벤트 안내` |
| 개인정보처리방침 3번 | `광고성 정보 수신 동의 정보: 동의 철회 또는 회원 탈퇴 시까지` |

## 발송 대상 정의 (구현 아님. 나중 작업 기준)

- 회원: `members.marketingOptIn == true`
- 비회원: `reservations.marketingOptIn == true` 이고 `createdBy == 'airpick-b2c'`
- 제외: `createdBy`가 `'homepage'`, `'b2b'`인 예약. 업체 고객이다
- 발송 시간: 08:00~21:00만. 제목 앞 `(광고)`, 전송자 명칭·수신거부 방법 표기
- 채널: 카카오 채널 메시지 또는 문자. **알림톡으로 광고 금지**
- 2년마다 재확인: `marketingAgreedAt` 기준 (B2B 후속)
- 비회원 철회: 받은 메시지의 수신거부로 접수 → B2B에서 처리 (후속)

## 검증

- [ ] rules 배포 전에는 전화번호 없는 회원 저장이 거절되는 것이 맞다(에러는 삼킴, 화면 영향 없음)
- [ ] 전화번호 없는 카카오 로그인 → `members/{uid}` 생성, `marketingOptIn: false`, 시각 필드 없음
- [ ] 서버 `true` 회원이 다시 로그인 → `true` 유지, 시각 필드 유지
- [ ] 마이페이지 켬 → `optIn true`, `marketingAgreedAt` 서버 시각, `withdrawnAt null`, 로그 1건 `agree`, 처리결과 안내 표시
- [ ] 마이페이지 끔 → `optIn false`, `withdrawnAt` 서버 시각, `agreedAt null`, 로그 1건 `withdraw`
- [ ] 같은 값으로 다시 저장 → 로그 안 늘어남
- [ ] 회원 예약에서 체크 켬 → `source: 'booking'`, 로그 1건
- [ ] 비회원 예약에서 체크 → `reservations.marketingOptIn: true`, `members` 안 건드림, 완료 화면 안내 표시
- [ ] 남의 uid 문서·로그 쓰기 거절, 로그 수정·삭제 거절
- [ ] `./node_modules/.bin/tsc --noEmit`
- [ ] 로컬에서 예약 화면 체크·시트, 마이페이지 알림 설정만 확인 (localhost:5173)

## 구현 지시 (승인 후 붙여넣기)

```
docs/work/member-consent-plan.md 의 ② 이 레포 변경 체크리스트대로만 구현해.
kakao-member-marketing-plan.md 는 폐기된 문서라 무시해.
plan에 없는 리팩터·부가 기능 금지. 카피는 카피 표 그대로.
한 단계 끝날 때마다 ./node_modules/.bin/tsc --noEmit.
커밋·브랜치·배포는 내가 말할 때까지 하지 마.
main만 사용.
Firestore rules 배포는 B2B 레포에서만.
```

## 메모 (사람이 적음)

<!-- 잘못된 가정, 도메인 제약, 수정 요청을 여기 또는 인라인으로 -->
