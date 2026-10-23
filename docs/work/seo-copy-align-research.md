# Research: 검색·채널 문장 정본 + 여정 잔여

> 소스: 고객 여정 캔버스(2026-10-15) + 2026-10-20 코드  
> 코드 구현 전 리서치. plan 승인 후 구현.

## 1. 손님 한 명의 경로

- 시작: 검색·채널·가이드에서 에어픽을 보고 유입
- 중간: `/` 홈에서 터미널·주차장·픽업·날짜 → 업체 비교·접수
- 끝: 내 예약 / 알림톡 접수증
- 이탈: 밖에 적힌 「출국시간 계산」「/parking 비교 페이지」「비교센터」가 홈과 다름 → 신뢰·SEO 불일치

## 2. 관련 파일

| 역할 | 경로 |
|------|------|
| 정의문 정본 | `src/constants/companyLegal.ts` (`AIRPICK_DEFINITION`) |
| 짧은 답 | `src/constants/officialAnswers.ts` (`leaveBy*`) |
| Vite 메타 | `vite.config.ts` |
| Hosting 리다이렉트 | `firebase.json` (`/parking` → `/`) |
| 사이트맵 소스 | `data/sitemap/urls.json` → `public/sitemap.xml` |
| 가이드 생성 | `scripts/generate-guides.mjs` |
| 정적 HTML | `public/guides/**`, `public/partners/**`, `public/llms.txt`, `public/faq`, `public/facts`, `public/about` |
| 채널·STATUS | `docs/STATUS.md`, `docs/channels/**`, `docs/aeo/**`, `docs/geo/**`, `docs/naver/**` |
| 홈 엔트리 | `index.html`, `parking.html`, `esim.html` |
| 포인트(참고) | B2C `src/lib/points.ts` · B2B ledger (이 레포에서 배포 안 함) |

## 3. 이미 있는 규칙

- `AIRPICK_DEFINITION` = 주차대행 비교·예약 + 이심 제휴 할인. 출국시간·비교센터 없음.
- `/parking`, `/parking/` 301 → `/` (`firebase.json`).
- 회원 후기: `memberReview` / `asMember`로 비밀번호 없이 가능 (캔버스 1번은 완료).
- 포인트: 출고 완료 후 이용 금액 3%, 5,000원 단위 사용. 후기 보너스 없음.
- Functions·rules 배포는 B2B만.

## 4. 건드리면 안 되는 것

- [x] Functions / Firestore rules 이 레포에서 배포 금지
- [x] 후기 수·보험 보장 숫자 지어내기 금지
- [x] 비회원 예약을 카카오에 자동 병합 금지
- [x] 홈을 다시 「출국시간 계산기」로 되돌리지 않음
- [x] `/parking`을 별도 비교 SPA로 다시 열지 않음 (301 유지)
- [x] 커밋·브랜치·배포는 요청 전 금지

## 5. 모르는 것 / 이번 범위 밖

- 후기 1건당 보너스 포인트 금액 → 제품 미정. **이번 구현 제외.**
- 첫 예약 5,000원 쿠폰과 포인트 동시 사용 → 서버 규칙. **B2B plan 분리. 이번 B2C 제외.**
- `reviews_count` vs 실제 후기 집계 → B2B. **이번 제외.**

## 6. 한 줄 결론

이번 범위는 **앱 정의문·홈 경로에 맞춰 docs·정적 HTML·메타·sitemap·leaveBy를 정렬**하는 것이고, 하지 않는 것은 **포인트 보너스·쿠폰 겹침·후기 수 집계·B2B 배포**이다.
