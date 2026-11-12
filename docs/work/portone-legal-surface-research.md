# Research: 포트원 심사용 약관·정책 표면

> 다음: `docs/work/portone-legal-surface-plan.md`  
> 입력: 2026-11-11 클로드 「에어픽 약관·정책 초안」(사업자·약관·개인정보·환불·상품·가격) + 포트원 「확인 필요」 5항목 스크린샷.

## 1. 손님 한 명의 경로

- 시작: 홈·정적 SEO 페이지·예약 모달에서 사업자·약관·개인정보를 본다.
- 중간: 예약 시 `consent.ts` 4동의(중개 약관·업체 약관·개인정보·마케팅) + FAQ 취소 안내.
- 끝: 현장 결제·입고 24시간 전 앱 취소. 선결제·비율 환불 UI 없음.
- 이탈·헷갈림: 포트원 자동검사는 **홈 HTML에 펼쳐진 사업자·약관 URL·환불·상품가격**을 찾고, 손님 UI는 **접힌 푸터·모달 약관·SPA 견적**이라 검사가 실패한다.

## 2. 관련 파일

| 역할 | 경로 |
|------|------|
| 사업자 상수 | `src/constants/companyLegal.ts` |
| 예약 동의·약관 정본 | `src/constants/consent.ts` |
| 앱 푸터(접힘) | `src/components/SiteFooter.tsx` |
| 마케팅 푸터 | `src/design-system/marketing/MarketingFooter.tsx` |
| 개인정보 SPA | `src/pages/PrivacyPolicyPage.tsx` |
| 소개 SPA | `src/pages/AboutPage.tsx` |
| 정적 개인정보·소개 | `public/privacy/index.html`, `public/about/index.html` |
| FAQ 취소 | `src/constants/support.ts`, `public/faq/index.html` |
| 사이트 내비 | `src/constants/siteNav.ts`, `src/components/AppMenuSheet.tsx` |
| SEO 경로 | `src/utils/appPath.ts` |
| 호스팅·캐시 | `firebase.json` (`/privacy/**` 등) |
| sitemap | `data/sitemap/urls.json`, `public/sitemap.xml` |
| 법무 감사 메모 | `docs/gov/71-legal-surface-audit.md` |

## 3. 이미 있는 규칙 (코드·합의)

- 상호 에어픽 · 대표 김인원 · 사업자 776-32-01655 · 주소·이메일·전화(`01025565746`) · 카카오 상담 — `COMPANY_LEGAL`.
- **통신판매중개자** 고지: `INTERMEDIARY_DISCLAIMER`, 예약 모달·동의문.
- 결제: **현장 결제** (BookingModal·FAQ·consent 제휴약관 「선결제 금액 없음」).
- 취소: **입고 예정 24시간 전까지** 앱 직접 취소. 그 이후·변경은 업체 문의.
- `/privacy/`·`/about/` 정적 HTML 200. **`/terms/`·환불 전용 URL 없음** (404).
- `SiteFooter`는 `<details>`로 사업자 접음. **전화는 dl에 없고** 고객센터=카카오 링크.
- partners 랜딩은 **확정 요금을 HTML에 박지 않음** (일정 넣으면 비교). 포트원 「상품 등록」과 충돌.
- 후기·보험·요금 숫자 **지어내기 금지**.
- Functions·rules 배포는 B2B만. 커밋·배포는 요청 시만. main만.

## 4. 건드리면 안 되는 것

- [ ] Functions / Firestore rules 배포는 B2B(`airpick2-b-to-b`)만
- [ ] 후기 수·보험 보장·복귀 시간 등 숫자 지어내기 금지
- [ ] 비회원 예약을 카카오 계정에 자동 병합 금지 (합의 전까지)
- [ ] main만 사용. cursor/* 브랜치 만들지 않음
- [ ] 커밋·푸시·호스팅 배포는 요청 전까지 금지
- 기타:
  - 클로드 초안의 **3일/50%/노쇼 선결제 환불표**를 현행 현장결제 제품에 그대로 올리지 않음.
  - 홈 풀 SSR·결제 PG 연동 구현은 이번 범위 밖 (표면·크롤만).
  - 통신판매업 신고번호를 **없는 값을 만들어** 넣지 않음.

## 5. 모르는 것 / 확인 필요

- **통신판매업 신고번호** 보유 여부·문구. 없으면 해당 줄 생략 + 대표 신고 일정.
- 포트원/PG **실제 수탁자명**(초안 KG이니시스) — 계약서 기준. 미도입이면 개인정보 「결제 위탁」은 「도입 시」또는 생략.
- 문자·알림톡 수탁자 상호(B2B 알림톡 벤더).
- 「상품·가격」페이지에 쓸 **실견적 스냅샷** 방식 합의: 고정 예시 일정으로 앱과 동일 계산 결과를 정적 HTML에 텍스트로 둘지, 대표가 준 요금표만 둘지. **가짜 요금표 금지.**
- 변호사 검토 일정 (초안 자체 고지). 구현은 법무 대체 아님.
- 온라인 결제·포인트 도입 시점 — 그때 환불표·약관 제4조를 **별도 plan**으로 교체.

## 6. 한 줄 결론

이 작업의 범위는 **포트원 자동검사가 읽는 공개 HTML·푸터·`/terms`·`/refund`(취소·환불)·개인정보 보강·크롤 가능 요금 안내**를 **현장결제·24시간 취소·기존 consent 정본**에 맞춰 만드는 것이고, 하지 않는 것은 **선결제 환불표 채택·요금 창작·PG/Functions 연동·미확인 통신판매업 번호 기입**이다.
