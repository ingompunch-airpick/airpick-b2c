# 71 — 법무 표면 감사 (분기)

사이트에 보이는 사업자·개인정보·연락 표기가 **실제 사업자·약관과 같은지**만 본다. (변호사 대체 아님)

## 체크 위치

| 항목 | 어디 | 확인 |
|------|------|------|
| 상호·대표·사업자번호·주소·전화 | `/about/` · **상시 푸터** · facts · `index.html` 셸 | |
| 전화·이메일·운영시간 | about · FAQ · 카카오 · 푸터 | |
| 이용약관 | `/terms/` · 예약 모달 `consent.ts` | |
| 개인정보처리방침 | `/privacy/` | |
| 취소·환불·청약철회 | `/refund/` · FAQ | |
| 상품·요금(원) | `/pricing/` 예시 스냅샷 · 홈 비교 | |
| 예약 동의 | 앱 예약 모달 · 전문 링크 `/terms` `/privacy` `/refund` | |
| 중개·현장결제 안내 | 푸터 고지 · FAQ · 약관 · refund | 공개 카피=현장 결제 |
| 통신판매업 번호 | `COMPANY_LEGAL.mailOrderNumber` — 확정 전 미표시 | |

정본 상수: `src/constants/companyLegal.ts` · 약관: `src/constants/consent.ts`  
관련 plan: `docs/work/portone-legal-surface-plan.md`

## 기록

| 년-분기 | 불일치 | 조치 | 담당 |
|---------|--------|------|------|
| 2026-Q4 | 포트원 검사: 약관·환불·상품 URL·접힌 푸터 | 정적 `/terms` `/refund` `/pricing` + 푸터 상시 노출 | |
