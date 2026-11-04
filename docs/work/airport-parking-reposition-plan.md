# Plan: 공항주차 재포지션 (SEO)

> research: `docs/work/airport-parking-reposition-research.md`  
> **이 파일이 승인되기 전에는 코드를 쓰지 않는다.**

## 목표

검색·AI가 에어픽을 「인천공항 **공항주차**(주차대행 + 사설주차장) 비교·예약」으로 읽게 하되,
**지금 예약되는 건 주차대행뿐**이라는 사실이 같이 보이게 한다.

## 하지 않음

- 홈 UI에 발렛/사설/셔틀 탭 추가 (입점 후 별도 plan)
- 사설주차장 업체·요금·셔틀 시간 등 숫자·예시 넣기
- 「주차대행」 문자열 일괄 치환 (발렛 설명은 유지)
- 풀 SSR / Next 전환
- Functions·rules 배포, 커밋·호스팅 배포 (요청 전)

## 화면·계정 범위

- [x] 해당 없음 (정적 HTML·상수·카피)

## 데이터

- [x] UI·카피만
- [ ] Firestore 쓰기 없음

## 변경 체크리스트

1. **정의문** — `companyLegal.ts`
   - `AIRPICK_DEFINITION`, `AIRPICK_DEFINITION_META`, `AIRPICK_CUSTOMER_PITCH` 교체 (아래 카피 표)
   - 사용처(`officialAnswers`, `SiteFooter`, `AboutPage`, `SpotsPage`) 문맥 깨지는지 확인
2. **홈 `index.html`**
   - meta description·keywords·OG·twitter description
   - JSON-LD Organization/WebSite/WebPage description
   - `#root` 셸 본문: H1 「에어픽 공항주차」 + 정의문 + **공항주차 방식 3가지** 짧은 목록(상태 표기) + 링크(허브 가이드 추가)
3. **PWA 설명** — `vite.config.ts`, `public/manifest.json`
4. **AI 정본** — `public/llms.txt`, `public/facts/`, `public/faq/`, `public/about/`
   - 정의문 교체
   - 「공항주차 방식」 섹션: 3종 정의 + 현재 가능/준비 중
   - FAQ 1문항 추가: 「에어픽에서 사설주차장·셔틀 주차도 예약되나요?」 → 지금은 주차대행만, 사설주차장은 준비 중
   - facts 기대 정답 표에 「사설주차장 예약 가능」=틀림 추가 (`docs/geo/48-ai-monitoring.md`도)
5. **허브 가이드 신규** — `data/guides/pages.json` 에 `airport-parking-types`
   - 제목: 「인천공항 주차 방식 비교: 주차대행 vs 사설주차장 vs 셔틀 · 에어픽」
   - 내용: 방식별 흐름(차 맡기는 곳·키·공항까지 이동), 이런 분께 맞음, 확인할 것(보험·위치·운영시간). 숫자 없음
   - 에어픽 상태 박스: 주차대행 예약 가능 / 사설주차장 준비 중
   - CTA `/` (「주차대행 비교·예약」)
6. **기존 가이드 손보기** — `pages.json`
   - `official-vs-private`: 사설주차장 키 맡김형·셔틀형 구분 단락 추가, 허브 링크
   - `travel-parking-tips`, `parking-compare`: 「공항주차=주차대행」으로 읽히는 문장만 수정, 허브 링크
   - 가이드 허브(`/guides/`) 설명 문구
7. **기타 노출 문구** — `public/404.html`, `public/partners/` 허브 설명(생성 스크립트), `marketing.ts`·`siteNav.ts` 중 사이트 정의에 해당하는 줄만
8. `npm run guides` · `npm run partners` · `npm run sitemap` (허브 가이드 URL 포함)
9. `./node_modules/.bin/tsc --noEmit`

## 카피·숫자 (지어내지 말 것)

| 위치 | 문구 또는 규칙 |
|------|----------------|
| `AIRPICK_DEFINITION` | 에어픽은 인천공항 주차대행과 사설주차장을 비교·예약하는 공항주차 서비스입니다. 이심(eSIM)은 제휴 할인으로 안내합니다. |
| 상태 한 줄 (정의문 뒤에 붙는 곳) | 지금은 주차대행(발렛) 업체부터 예약할 수 있고, 사설주차장은 준비 중입니다. |
| `AIRPICK_DEFINITION_META` | 에어픽 공항주차 | 인천공항 주차대행·사설주차장 비교·예약. 일정만 넣으면 가격·보험·후기를 한눈에. 지금은 주차대행부터 예약할 수 있어요. |
| 방식 1 | 주차대행(발렛): 터미널에서 기사에게 차를 맡기고, 돌아올 때 터미널에서 받음 · T1/T2 · 실내/야외 · 대면/비대면 |
| 방식 2 | 사설주차장(키 맡김): 공항 근처 주차장에 직접 주차하고 키를 맡김 |
| 방식 3 | 사설주차장(셔틀): 직접 주차 후 키를 갖고 셔틀로 공항 이동 |
| 준비 중 표기 | 「준비 중」만. 날짜·「곧」·「○월 오픈」 쓰지 않음 |
| 금지 | 사설주차장 요금·셔틀 소요/배차 시간·입점 예정 업체 수·「최저가」 |
| 홈 title | `에어픽 공항주차` 유지 |

## 검증

- [x] `rg '인천공항 주차대행을 비교·예약하고' public src index.html` → 옛 정의문 없음 (work 문서 제외)
- [x] `rg '사설주차장' public` 결과마다 「예약 가능」으로 읽히는 문장 없음
- [x] `dist/index.html` `#root` 본문에 3가지 방식 + 상태 표기 (124자 → 531자)
- [x] 허브 가이드가 `/guides/`, sitemap, `llms.txt`에 있음
- [x] `./node_modules/.bin/tsc --noEmit`
- [ ] 로컬 홈·푸터·소개 화면 문구 확인

## 구현 지시 (승인 후 붙여넣기)

```
plan.md 대로만 구현해.
plan에 없는 리팩터·부가 기능 금지.
한 단계 끝날 때마다 tsc --noEmit.
커밋·브랜치·배포는 내가 말할 때까지 하지 마.
main만 사용.
```

## 메모 (사람이 적음)

<!-- 잘못된 가정, 도메인 제약, 수정 요청을 여기 또는 인라인으로 -->
