# Research: B2C 짧은 경로 유입 (`/youtubelong1`)

> 다음: `docs/work/b2c-short-path-acquisition-plan.md`  
> 배경: 업체 홈은 `/naverplace`처럼 짧게 달아 방문 출처를 센다. B2C도 유튜브 롱/숏·블로그만 구별하고 싶음. 예약 N건까지 남기려면 경로 → 예약 필드 저장이 필요.

## 1. 손님 한 명의 경로

- 시작: 유튜브/블로그에서 `https://www.에어픽.kr/youtubelong1` 클릭.
- 중간: 홈·비교·예약 모달. URL은 `/`로 바뀌어도 출처는 기억되어야 함.
- 끝: 예약 문서에 출처가 남아 「youtubelong1 → N건」을 셀 수 있음.
- 이탈·헷갈림: 지금은 알 수 없는 경로를 **홈으로만 replace**하고 출처를 안 남김 (`App.tsx`). 예약은 `createdBy: airpick-b2c`만 저장.

## 2. 관련 파일

| 역할 | 경로 |
|------|------|
| URL·탭 | `src/utils/appPath.ts`, `src/App.tsx` |
| 예약 쓰기 | `src/lib/reservations.ts` |
| 채널 상수 | `src/constants/reservationSource.ts` |
| 참고(업체 홈) | `airpick-partner-homepage` `src/lib/utm.ts`, `pageStats.ts` |
| 예약 필드(이미 있음) | B2B `types.ts` `acquisitionSource` / `Medium` / `Campaign` / `ClickId` |
| 호스팅 | `firebase.json` SPA rewrite → `index.html` (한 단어 경로도 앱으로 옴) |

## 3. 이미 있는 규칙 (코드·합의)

- 업체 홈: 한 단어 경로 = `utm_source`로 취급. `a-z0-9_-` 1~40자. 예약 경로명(`admin` 등) 제외.
- B2B 예약에 **`acquisitionSource` 등 필드 스키마 이미 존재** (명함 QR 등). B2C는 아직 안 씀.
- `createdBy`는 `homepage | airpick-b2c | b2b`만. 유튜브를 `createdBy`에 넣지 않음.
- SEO 정적 문서(`/guides` `/about` …)는 짧은 유입 경로가 아님.
- UTM 긴 쿼리는 `docs/channels/61-utm-measure-only.md` — 이번 요청은 **짧은 경로 우선**.

## 4. 건드리면 안 되는 것

- [ ] Functions / Firestore rules 배포는 B2B만
- [ ] 후기·보험 숫자 지어내기
- [ ] 비회원↔카카오 자동 병합
- [ ] main만. 커밋·배포는 요청 시
- 기타:
  - `createdBy`를 youtube 등으로 바꾸지 않음
  - `/parking` `/my` `/esim` `/about` `/terms` `/guides` 등 **기존 공개 경로를 유입 슬러그로 쓰지 않음**
  - 업체 홈 `partnerHomepageStats` 일별 방문 카운터를 B2C에 복제하는 것은 **이번 범위 밖**(예약 건수 우선)

## 5. 모르는 것 / 확인 필요

- 출처 기억 기간: **세션만** vs **localStorage 7~30일** (광고→나중에 재방문).
- 허용 슬러그: **자유 한 단어**(업체 홈과 동일) vs **화이트리스트만** (`youtubelong1` …).
- B2B 시트·HQ에 acquisition 컬럼 노출은 이번 B2C만인지, B2B 후속인지.

## 6. 한 줄 결론

이 작업의 범위는 **짧은 경로(및 선택적 UTM)를 잡아 session에 두고 예약의 `acquisition*`에 저장한 뒤 홈으로 보내는 것**이고, 하지 않는 것은 **createdBy 변경·방문 일별 대시보드·Functions 배포**이다.
