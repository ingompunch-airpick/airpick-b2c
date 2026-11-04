# Research: 공항주차 재포지션 (SEO)

> 다음: `airport-parking-reposition-plan.md`

## 1. 손님 한 명의 경로

- 시작: 네이버·구글·ChatGPT에서 「인천공항 주차」「인천공항 사설주차장」「인천공항 주차대행 추천」 검색
- 중간: 검색 결과·AI 답변에서 에어픽 정의문, `/facts`, `/guides/` 글을 봄
- 끝: 홈(`/`)에서 터미널·주차장·날짜 → 이용 가능 업체 → 예약 (현재는 주차대행만)
- 이탈·헷갈림이 나는 지점:
  - 사이트 전체가 「인천공항 주차대행 비교」로만 정의되어 사설주차장·셔틀 검색 의도에 안 걸림
  - 반대로 사설주차장을 미리 쓰면서 「예약 가능」처럼 읽히면 손님이 홈에서 못 찾음

## 2. 앞으로의 서비스 3종 (대표 합의, 2026-11-04)

| # | 방식 | 세부 | 상태 |
|---|------|------|------|
| 1 | 주차대행(발렛) | 실내/야외, 대면/비대면, T1/T2 | **예약 가능** (입점: 와와발렛·가유) |
| 2 | 사설주차장 · 키 맡김/가져감 | 실내/야외 | 준비 중 (1~2달 내 입점 목표) |
| 3 | 사설주차장 · 셔틀 | 주차 후 키 가져가고 셔틀로 공항 | 준비 중 |

검색어: 손님은 「민영주차장」보다 **「사설주차장」「셔틀 주차장」**을 씀 → SEO 문구는 사설주차장으로.

## 3. 관련 파일

| 역할 | 경로 |
|------|------|
| 정의문 정본 | `src/constants/companyLegal.ts` (`AIRPICK_DEFINITION`, `_META`, `AIRPICK_CUSTOMER_PITCH`) |
| 정의문 사용처 | `officialAnswers.ts`, `SiteFooter.tsx`, `AboutPage.tsx`, `SpotsPage.tsx` |
| 홈 메타·셸·JSON-LD | `index.html` |
| PWA 설명 | `vite.config.ts`, `public/manifest.json` |
| AI 정본 | `public/llms.txt`, `public/facts/`, `public/faq/`, `public/about/` (수동 HTML) |
| 가이드 | `data/guides/pages.json` → `scripts/generate-guides.mjs` |
| 입점 페이지 | `data/partners/pages.json` → `scripts/generate-partners.mjs` |
| sitemap | `data/sitemap/urls.json` → `npm run sitemap` |
| 기타 | `public/404.html`, `src/constants/marketing.ts`, `homeCategories.ts`, `siteNav.ts`, `support.ts` |

「주차대행」 문자열이 위 파일들에 약 400곳. 대부분 발렛 설명이라 **그대로 두는 게 맞음**.

## 4. 이미 있는 규칙

- 정의문은 `AIRPICK_DEFINITION` 한 줄을 채널·FAQ·facts에 그대로 씀 (`docs/geo/48-ai-monitoring.md`)
- 요금은 참고가·변동 가능. 「무조건 최저가」 금지
- 입점 결제는 현장 결제
- 홈 타이틀 `에어픽 공항주차` (2026-11-04 배포)

## 5. 건드리면 안 되는 것

- [x] Functions / Firestore rules 배포는 B2B(`airpick2-b-to-b`)만
- [x] 숫자 지어내기 금지 — 사설주차장 요금·셔틀 소요 시간·배차 간격·업체 수
- [x] main만. 커밋·배포는 요청 시
- 기타:
  - 사설주차장·셔틀을 **예약 가능**하다고 쓰지 않음 (AI가 그대로 인용함)
  - 가짜 사설주차장 업체·예시 가격 넣지 않음
  - 홈 UI에 방식 탭 추가하지 않음 (입점 후)

## 6. 모르는 것 / 확인 필요

- 사설주차장 입점 시점 확정일 (지금은 「준비 중」으로만)
- 2번(키 맡김)과 1번(발렛)의 손님용 구분 라벨 — SEO 문서는 「사설주차장(키 맡김)」으로 두고 화면 라벨은 입점 때 결정

## 7. 한 줄 결론

이 작업의 범위는 **정의문·AI 정본·홈 셸·허브 가이드 1편·기존 문구 중 「공항주차=주차대행만」으로 읽히는 곳**이고, 하지 않는 것은 **홈 UI 탭·사설주차장 업체/요금·풀 SSR**이다.
