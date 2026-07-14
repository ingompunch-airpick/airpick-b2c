# 68 — SEO 변경 PR 체크리스트

공개 URL·메타·스키마·내비에 손대는 PR마다.

## 필수 확인

- [ ] **title / meta description** — 비교·과장 금지, 브랜드 꼬임 없음  
- [ ] **canonical** — `https://www.에어픽.kr/...` (punycode 혼용 시 canonical-host.js 전제)  
- [ ] **noindex** — 실수로 중요한 공개 URL에 안 붙였는지 / 404·내부만 noindex  
- [ ] **H1** 하나, 첫 문단에 정의 또는 주제 명확  
- [ ] **sitemap** — 새 공개 URL이면 `data/*/pages.json` 또는 sitemap 스크립트에 포함  
- [ ] **JSON-LD** — FAQ/HowTo/Breadcrumb/ItemList가 본문과 모순 없는지  
- [ ] **내부링크** — 홈·비교·가이드·파트너·FAQ 중 최소 1곳과 연결  
- [ ] **컴플라이언스** — `src/constants/complianceCopy.ts` · [70](./70-compliance-policy.md)  
- [ ] **og:image / logo** — 깨진 경로 없는지  

## 배포 후 (대표·또는 위임)

- [ ] 해당 URL 실기기·시크릿 창  
- [ ] 네이버/GSC URL 검사(중요 페이지만)
