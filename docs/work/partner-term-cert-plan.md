# Plan: 「공식 파트너」→「에어픽 인증 업체」

> 전제: `docs/work/partner-term-cert-research.md`  
> **승인 전 코드 금지.**

## 목표

손님·AI·채널에서 에어픽 입점 업체를 **「에어픽 인증 업체」**로 읽게 하고, **인천공항 공식 주차장**과 말이 안 섞이게 한다.

## 표기 규칙 (이번 합의안)

| 말 | 쓰임 |
|----|------|
| **에어픽 인증 업체** | 기본. 제목·eyebrow·한 줄 정의 |
| **인증 업체** | 같은 문장에 「에어픽」이 이미 있을 때만 짧게 |
| **입점 업체** | 메뉴·`/partners/` 네비·「입점」행위 — 유지 가능 |
| **인천공항 공식 / 공식 주차장 / 공식 안내** | **유지** (공항) |
| **공식 vs 사설** 가이드 제목·슬러그 | **유지** |

바꾸지 말 예:  
`공식 파트너의 보험` → `에어픽 인증 업체의 보험`  
`공식 공항 주차장` → 그대로  
`검증한 공식 파트너만` → `확인한 에어픽 인증 업체만`

## 하지 않음

- `/guides/official-vs-private/` 경로·파일명 변경
- 「입점」을 전부 「인증」으로 치환 (메뉴·URL `/partners/` 유지)
- 접수증→예약확인서·Curbside 한글화 등 **다른 용어 묶음** (별도 plan)
- 보험·CCTV 숫자 추가
- B2B Functions·알림톡 **이 레포에서 배포**
- 홈 IA·하단 탭·풀 SSR

## 화면·계정 범위

- [x] 비로그인 (홈·가이드·FAQ·partners 카피)
- [x] 카카오 로그인 (동일 카피 경로)
- [ ] 비회원 조회
- [x] 정적 SEO·llms·문서

## 데이터

- [x] UI·카피만 (+ 가이드 HTML 재생성)
- [ ] Firestore 스키마 변경 없음
- [x] B2B 알림톡·약관 → **체크리스트만**. 배포는 B2B

## 변경 체크리스트

### A. 앱 정본 (먼저)

1. `src/constants/marketing.ts` — eyebrow, homeLine, title, titleRating, subtitleNote, `parkingPartnerSectionTitle`, lead/body, partnersLabel 등 **입점 의미의 「공식 파트너」** 전부.
2. `src/constants/companyLegal.ts` — `PARTNER_BENEFITS` title·points.
3. `src/constants/support.ts` — whatIs 등 FAQ 본문. 앱 Support와 `public/faq/` 동기 방식에 맞춰 **FAQ HTML도 같이** (수동이면 동일 문장 패치, 생성기면 재생성).
4. `src/pages/AboutPage.tsx` — Section title 「공식 파트너」.
5. 코드 주석(`compareSort`, `parkingCompare`)은 검색 혼선 없게 짧게 맞춤 (동작 변경 없음).

### B. 가이드·정적

6. `data/guides/pages.json` — 「공식 파트너」만 치환. 「공식 공항」「공식 vs 사설」「인천공항 공식」은 건드리지 않음.  
   특히 `parking-compare`, `parking-insurance`, `airport-parking-types` FAQ 질문(`공식 파트너면 보험이…` → `에어픽 인증 업체면…`).
7. `npm run guides`로 `public/guides/**` 재생성.
8. `public/partners/index.html` eyebrow.
9. `public/about/index.html`, `public/llms.txt`, `public/faq/index.html`(미동기면), `parking.html` 해당 문장.
10. partners 개별 랜딩에 「공식 파트너」가 있으면 동일 규칙.

### C. 운영 문서 (같은 PR에 맞추기)

11. `docs/geo/48-ai-monitoring.md` 질문 2번 문구.  
12. `docs/aeo/51-paa-map.md`, `55-brand-scripts.md`, `docs/channels/60`, `docs/naver/*` 초안, `docs/ops/63` 등 **손님·채널에 나가는 복붙**만. 내부 히스토리 문서는 필수는 아님.

### D. B2B·대표 (코드 밖 · 같은 주 체크)

13. 약관·이용안내 공개 HTML에 「공식 파트너」 있으면 B2B/해당 파일 목록만 이슈로 적고 **배포는 B2B**.  
14. 알림톡 템플릿·카카오 채널 자동응답·플레이스/맵 바이오 복붙 갱신 (**대표**).  
15. 구현 후: `rg '공식 파트너' --glob '!docs/work/**'` 로 잔여 확인. 공항 「공식」만 남아야 함.

## 카피·숫자

| 위치 | 규칙 |
|------|------|
| 정의 한 줄 | 기존 `AIRPICK_DEFINITION` 톤 + 「확인한 에어픽 인증 업체만 비교·예약」 |
| 파트너 수 | `에어픽 인증 업체 N곳` (N은 기존 로직 그대로, 숫자 창작 금지) |
| 보험 FAQ | 인증 업체라도 안내·시점에 따라 다를 수 있음 — 기존 답 유지, 호칭만 변경 |

## 검증

- [ ] 홈·비교·About·partners eyebrow에 「공식 파트너」 없음 (입점 의미)
- [ ] `/guides/official-vs-private/`·본문에 「인천공항 공식」 의미 유지
- [ ] FAQ·llms·parking-compare에 「에어픽 인증 업체」
- [ ] `rg '공식 파트너' src public data/guides` → 0건 (또는 주석/의도적 제외 목록만)
- [ ] `./node_modules/.bin/tsc --noEmit`
- [ ] 로컬 홈·partners·가이드 한 페이지씩 확인

## 구현 지시 (승인 후 붙여넣기)

```
docs/work/partner-term-cert-plan.md 대로만 구현해.
공항「공식」·official-vs-private 슬러그는 건드리지 마.
plan에 없는 리팩터·예약확인서 용어·이심 탭 금지.
guides 재생성 포함.
한 단계 끝날 때마다 tsc --noEmit (TS 변경 시).
커밋·브랜치·배포는 내가 말할 때까지 하지 마.
main만 사용.
```

## 메모 (사람이 적음)

- 구현됨 (B2C). 알림톡·약관·채널 바이오 잔여는 **대표/B2B**.
- 「에어픽은 … 확인한 인증 업체」처럼 문장에 에어픽이 있으면 짧은 표기 사용.
