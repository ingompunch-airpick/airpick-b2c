# Research: 「공식 파트너」→「에어픽 인증 업체」

> 전제: `ai-exposure-week1-plan` 2주차 예약  
> 다음: `docs/work/partner-term-cert-plan.md`

## 1. 손님 한 명의 경로

- 시작: 홈 비교·가이드·FAQ·partners에서 「공식 파트너」를 봄 → 인천공항 **공식 주차장**과 헷갈릴 수 있음
- 중간: 입점·예약·보험 안내에 같은 말이 반복됨
- 끝: 알림톡·약관·채널 바이오에도 옛 말이 남으면 신뢰가 갈라짐
- 이탈: 「공식」만 바꿔도 `official-vs-private`(공항 공식 vs 사설) 가이드 제목의 「공식」은 **남겨야** 함

## 2. 관련 파일 (B2C)

| 역할 | 경로 |
|------|------|
| 앱 카피 허브 | `src/constants/marketing.ts` |
| 소개·법적 공통 | `src/constants/companyLegal.ts` (`PARTNER_BENEFITS` 등) |
| FAQ 앱/소스 | `src/constants/support.ts` → `public/faq/`(생성·동기 방식 확인) |
| 가이드 소스 | `data/guides/pages.json` → `npm run guides` |
| 정적 | `public/partners/`, `public/about/`, `public/llms.txt`, `public/faq/`, `parking.html` |
| About SPA | `src/pages/AboutPage.tsx` |
| 주석·유틸 | `src/utils/compareSort.ts`, `src/lib/parkingCompare.ts` (주석만이면 선택) |
| 운영 문서 | `docs/aeo/`, `docs/geo/48`, `docs/naver/`, `docs/channels/` |

## 3. 이미 있는 규칙

- 「공식 파트너」= 에어픽 입점(확인한 업체). 「인천공항 공식」= 공항 안내·공식 주차장.
- `/guides/official-vs-private/` 슬러그·「공식 vs 사설」= **공항 공식 주차** 대비. 개명 대상 아님.
- 숫자·보험 한도 지어내기 금지. 용어만 바꿈.
- Functions·알림톡 템플릿 배포는 **B2B만**.
- www · `/guides/` 유지.

## 4. 건드리면 안 되는 것

- [x] 「인천공항 공식 주차장 / 공식 안내 / 공식 vs 사설」을 「인증」으로 바꾸지 않음
- [x] URL 슬러그 `official-vs-private` 변경·301 대공사 금지 (이번 범위)
- [x] 미확인 보험·CCTV 표 추가 금지
- [x] B2B 레포 배포를 이 레포에서 하지 않음
- [x] 커밋·배포는 요청 전 금지

## 5. 모르는 것 / 사람·B2B

- 알림톡·약관·카카오 채널 자동응답에 「공식 파트너」가 얼마나 있는지 (B2B·운영)
- 표기 확정: **「에어픽 인증 업체」** vs 짧은 **「인증 업체」** (문장 안에서는 긴 표기 우선 권장)
- 「입점 업체」는 병기 유지할지 (목록 네비·partners 메뉴는 입점 유지 가능)

## 6. 한 줄 결론

이번 범위는 **에어픽 입점을 가리키는 「공식 파트너」만 「에어픽 인증 업체」로 통일**하는 것이고, 하지 않는 것은 **공항 「공식」 의미·URL 이사·B2B 배포·새 검증 숫자**이다.
