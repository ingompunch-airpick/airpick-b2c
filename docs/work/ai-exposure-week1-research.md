# Research: AI 노출 1주 — 할 수 있는 것만

> 소스: 클로드 제안(읽을 수 있게 → 인용할 답 → 바깥 언급) + 현재 레포  
> 다음: `docs/work/ai-exposure-week1-plan.md`

## 1. 손님·크롤러 경로

- 시작: ChatGPT/Gemini/Perplexity·빙·구글이 URL·사이트맵·제3자 글을 봄
- 중간: **정적 HTML**(`/guides/` `/partners/` `/faq/` `/facts/` `/about/` `/llms.txt`) vs **SPA 홈**(`/` 비교·예약, JS로 업체 카드)
- 끝: 인용·유입. 지금은 입점 업체 개별 랜딩이 AI에 더 잘 잡히고, 에어픽 브랜드·비교 허브는 약함
- 이탈: 홈 SPA만 보면 “빈 앱”으로 오해. 가이드·파트너는 이미 HTML에 본문이 있음

## 2. 관련 파일

| 역할 | 경로 |
|------|------|
| robots | `public/robots.txt` (`Allow: /` 전체 — AI 차단 없음) |
| AI 요약 | `public/llms.txt`, `public/facts/` |
| 질문형 가이드 | `public/guides/**` (비교·공식vs사설·T1/T2·보험·성수기 팁 등) |
| 입점 정적 | `public/partners/**` |
| 사이트맵 | `data/sitemap/urls.json` → `public/sitemap.xml` |
| AI 측정 | `docs/geo/48-ai-monitoring.md` |
| 로드맵 | `docs/STATUS.md` P5 GEO · P4 GSC |
| 홈 SPA | `src/pages/HomePage.tsx`, `index.html` SEO 셸 |

## 3. 이미 있는 것 (클로드 항목 대비)

| 클로드 | 상태 |
|--------|------|
| 가이드·FAQ·facts를 HTML로 | **됨** (SSG성 정적 파일) |
| 홈·업체 비교 카드 SSR | **안 됨** (SPA). 이전에 풀 SSR/Next **보류** |
| robots AI 허용 | **사실상 됨** (`Allow: /`). 봇 이름 명시는 없음 |
| 빙·IndexNow | **문서·코드 없음**. GSC는 대표 운영 |
| 질문형 가이드 | **대부분 있음** (parking-compare, official-vs-private, parking-insurance, t1-t2-unseo, travel-parking-tips 성수기 문단) |
| 성수기·만차 **단독** 페이지 | 약함 (팁·공식vs사설에 흩어짐) |
| “○곳 조사·보험 ○곳” 표 | **없음**. 숫자 지어내기 금지 |
| 바깥 언급·보도·카페 | 코드 밖 · 대표/영업 |
| AI 주간 측정 20문항 | 문서에 **5문항** 수준 |

## 4. 건드리면 안 되는 것

- [x] Functions / rules 배포 B2B만
- [x] 후기 수·보험 보장·복귀 분·업체 수·“확인된 ○곳” **지어내기 금지**
- [x] 입점만 무조건 1등·가짜 추천순 금지 (표시광고·신뢰)
- [x] 비회원 예약 자동 병합 금지
- [x] 풀 SSR/Next 전환은 **이번 범위 밖** (합의 전)
- [x] 커밋·배포는 요청 전 금지

## 5. 모르는 것 / 사람만 가능

- Bing Webmaster 계정·사이트 소유 확인 (대표)
- IndexNow 키 발급·키 파일 공개 경로 합의
- 입점 8곳 중 2곳만 공개된 이유·공개 여부 (대표)
- 하단 탭 이심 유지/제거 (대표)
- 보험·CCTV 서류 (대표 수집 후 기입)

## 6. 승인 피드백

- www·`/guides` 유지.
- 1주 추가: 아시아나→T2(2026-01-14~), 전화 11자리, `/partners` 「가짜 별점」 문구.
- 「공식 파트너→인증 업체」는 **2주 필수**.

## 7. 한 줄 결론

이번 범위는 **AI 정적 구멍 + CS 버그·파트너 문구**이고, 하지 않는 것은 **홈 풀 SSR·미확인 숫자·1주의 인증 업체 일괄 개명**이다.
