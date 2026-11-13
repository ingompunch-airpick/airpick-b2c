# Plan: B2C 짧은 경로 유입 → 예약 저장

> 전제: `docs/work/b2c-short-path-acquisition-research.md`  
> **승인됨** (2026-11-13). 구현은 plan대로.

## 목표

유튜브·블로그에 `https://www.에어픽.kr/youtubelong1`처럼 **짧은 주소**를 달면, 그 손님이 예약한 건에 **같은 이름**이 남아 「경로별 예약 N건」을 셀 수 있게 한다.

운영 예 (링크만 바꾸면 됨, 코드에 목록 고정 불필요):

| 링크 | 의미 |
|------|------|
| `/youtubelong1` | 유튜브 롱폼 1 |
| `/youtubeshort1` | 숏폼 1 |
| `/blog1` | 블로그 1 |

## 하지 않음

- `createdBy`를 youtube/blog로 변경 (계속 `airpick-b2c`)
- 업체 홈용 `partnerHomepageStats` 방문 카운터 복제
- B2B HQ UI·시트 컬럼 추가 (필드만 저장; 조회는 Firestore/콘솔·후속)
- Functions / rules 배포
- SEO canonical에 짧은 경로를 정식 페이지로 등록

## 화면·계정 범위

- [x] 비로그인
- [x] 카카오 로그인
- [x] 비회원 예약 접수
- [ ] 해당 없음

## 데이터

- [x] sessionStorage(또는 localStorage) + 예약 Firestore 필드
- [x] 쓰는 필드 (B2B 타입에 **이미 있음**):
  - `acquisitionSource` ← 짧은 경로 이름 (`youtubelong1`)
  - `acquisitionMedium` ← 고정 `"path"` (짧은 경로일 때) 또는 UTM medium
  - `acquisitionCampaign` ← UTM 있으면 그것, 경로만이면 비움 또는 source와 동일(아래 카피)
  - `acquisitionClickId` ← 있으면 `gclid` 등만
- [ ] B2B Functions/rules 변경 없음 (클라이언트 예약 write가 이미 acquisition* 허용인지 — rules는 B2B 정본. **쓰기 거부되면 B2B 이슈로 분리**)

## 동작 규칙

1. **짧은 경로란**: pathname이 `/단어` 하나뿐 (슬래시 없음).  
   `^[a-z0-9_-]{1,40}$` (소문자 정규화).  
2. **예약 경로 제외** (절대 유입으로 안 씀):  
   `parking`, `esim`, `my`, `spots`, `partner`, `partners`, `guides`, `faq`, `about`, `privacy`, `terms`, `refund`, `pricing`, `facts`, `for-partners`, `badges`, `admin`, `r`, `api`, `assets`, `shared`, `brand`, `directions` 및 SEO prefix·기존 탭.  
3. 매칭되면:
   - sessionStorage 키 예: `airpick.acquisition` JSON `{ source, medium, campaign, clickId, capturedAt }`
   - **이미 값이 있으면 덮지 않음**(첫 유입 유지). 승인 시 「항상 최신」으로 바꿀 수 있음 → 기본은 **첫 유입**.
   - `history.replaceState`로 `/` (홈) — 지금 App이 하던 것과 같되, **저장 후** replace.
4. **쿼리 UTM**이 같이 오면: `utm_source` 우선, 없으면 경로. (업체 홈과 동일.)
5. 예약 생성 (`reservations.ts`): session에 source 있으면 payload에 `acquisition*` 넣기. 없으면 필드 생략.
6. 보관: **sessionStorage만** (탭 닫으면 끝). 7일 재방문까지 남기려면 localStorage + TTL — **기본은 session**. 메모로 바꾸기 가능.

## 변경 체크리스트

1. `src/utils/acquisition.ts` (신규) — parse path/UTM, reserved set, read/write session, `captureAcquisitionFromLocation()`, `peekAcquisition()`.
2. `src/App.tsx` (또는 `main.tsx` 초입) — 마운트 시 한 번 `capture…` 후 홈 sync. 기존「모르는 path → home」과 합치기.
3. `src/lib/reservations.ts` — create 시 `peekAcquisition()` → `acquisitionSource` 등.
4. (선택) `docs/channels/61-utm-measure-only.md`에 짧은 경로 예 2줄 추가.
5. `tsc --noEmit`.

## 카피·숫자

| 위치 | 규칙 |
|------|------|
| 링크 | 소문자·숫자·`-` `_`만. 예: `youtubelong1` |
| 손님 UI | 출처 표시 **안 함** (추적만) |
| createdBy | 항상 `airpick-b2c` |

## 검증

- [x] 코드: 짧은 경로·UTM 캡처 → session → 예약 `acquisition*` (`tsc` 통과)
- [ ] 로컬: `/youtubelong1` → `/` + session source
- [ ] 로컬: `/parking` `/about/` 미캡처
- [ ] 배포 후: 예약 1건에 `acquisitionSource` + `createdBy: airpick-b2c`
- [x] `./node_modules/.bin/tsc --noEmit`

## 구현 지시 (승인 후 붙여넣기)

```
plan.md 대로만 구현해.
plan에 없는 리팩터·부가 기능 금지.
한 단계 끝날 때마다 tsc --noEmit.
커밋·브랜치·배포는 내가 말할 때까지 하지 마.
main만 사용.
createdBy는 airpick-b2c 유지. 짧은 경로는 acquisitionSource에만.
첫 유입 유지(덮어쓰지 않음). sessionStorage만.
```

## 메모 (사람이 적음)

<!-- 첫 유입 vs 최신 / session vs 7일 / 허용 슬러그 화이트리스트 여부 -->
