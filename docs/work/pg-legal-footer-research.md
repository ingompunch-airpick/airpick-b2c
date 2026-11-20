# Research: PG 심사 — 약관·방침·푸터

> 소스: 2026-11-20 PG 심사 대응 초안(@총인원) + 사전검사 실패 화면  
> 다음: `docs/work/pg-legal-footer-plan.md`

## 1. 손님·크롤러 경로

- 시작: PG 사전검사 봇·브라우저가 `에어픽.kr` 공개 HTML을 읽음 (로그인·JS 없이)
- 중간: 홈·가이드·파트너·FAQ 하단 사업자 줄 + `/terms/` `/privacy/` `/refund/` 본문
- 끝: 「사업자 정보·약관·방침·환불·상품」 5항목 확인 완료
- 이탈: 주소·전화 불일치, 환불 키워드 부족, 가이드 푸터가 사업자 줄 없이 “참고용”만 있음, 상호가 ‘에어픽’만 표기

## 2. 관련 파일

| 역할 | 경로 |
|------|------|
| 정본 상수 | `src/constants/companyLegal.ts` |
| 앱 푸터 | `src/components/SiteFooter.tsx`, `MarketingFooter.tsx` |
| 홈 셸 푸터 | `index.html` |
| 정적 약관 | `public/terms/index.html`, `privacy/`, `refund/` |
| 호스팅 | `firebase.json` (`/terms/**` 등 헤더) |
| 동의 카피 | `src/constants/consent.ts` (현장결제·24h 취소) |
| 가이드 푸터 | `scripts/generate-guides.mjs` → `footer-note` |

## 3. 이미 있는 규칙

- `/terms/` `/privacy/` `/refund/` **정적 HTML 이미 존재** (본문은 초안보다 짧고 현장결제 전제)
- `COMPANY_LEGAL`: 상호 `에어픽`, 주소 **중구**, 전화 **01025565746**, `mailOrderNumber: null`
- 초안 자리표시자: 상호 **에어픽공항주차**, 주소 **영종구**, 전화 **0507-1328-5746**, 시행일 **2026-07-01**
- 손님 앱 취소: **입고 24시간 전**까지 무료 취소 (`reservationCancel.ts`) — 선결제 환불 % 코드 없음
- Functions 리전: `asia-northeast3`(서울) — Firestore도 동일 프로젝트. 국외이전 조항은 **유지 여부 결정 필요**
- 중개자 고지 문구는 `FOOTER_INTERMEDIARY_NOTICE`로 이미 사용 중 (초안과 동취지)
- 「현장 결제」문구는 FAQ·가이드·partners·index 다수 — **결제 오픈 날 일괄 수정**은 이번 범위 밖(초안 체크리스트)

## 4. 건드리면 안 되는 것

- B2B Functions·Firestore rules 배포
- 가이드 본문 요금·보험 **숫자 창작**
- 통신판매업 신고번호 **가짜 기입** (`신고 진행 중` 또는 미표시만)
- 취소 수수료 **%를 입점 합의 없이 지어내기**

## 5. 모르는 것 / 사람만 가능

- 입고 24h 이내 취소 시 환불 **몇 %** (입점 합의)
- `[PG사명]` (심사 후 확정)
- 입점업체 제3자 제공 보유 **[ ]개월**
- Firebase 데이터 저장을 국외이전으로 볼지(서울 리전 vs Google LLC 처리)
- 상품 항목: 파트너 SSG에 요금·사업자 노출이 검사기에 충분한지 — 별도 확인

## 6. 한 줄 결론

페이지·푸터 **골격은 이미 있고**, PG 실패는 **사업자 정본 불일치 + 본문/환불 키워드·푸터 통일 부족**이 핵심이다. 초안으로 세 페이지·푸터를 갈아끼우되, **환불 %·PG사명·보유개월**은 합의 전 안전하게 채운다.
