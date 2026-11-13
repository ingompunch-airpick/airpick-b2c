# Research: 서브페이지(가이드·FAQ 등) 디자인 리뉴얼

> 2026-11-13 · 계기: 대표님 「홈·이심·메뉴는 잘 잡았는데, 가이드 같은 옆 메뉴 페이지는 폰트·디자인이 너무 마음에 안 든다」

## 1. 손님 한 명의 경로

- 시작: 앱/웹 홈 → 우측 메뉴(☰) → 「가이드」「FAQ」「보험」「사실 확인」「요금 안내」 등. 또는 네이버·구글·AI 답변에서 해당 URL로 바로 진입.
- 중간: 정적 HTML 페이지(`/guides/…`, `/faq/` 등)를 읽음. 상단 뒤로가기 바 + 텍스트 내비 + 남색 히어로 + 본문.
- 끝: 「주차대행 비교·예약」 CTA로 홈 복귀 → 예약.
- 이탈·헷갈림이 나는 지점:
  - 홈에서 넘어오는 순간 **폰트가 바뀜** (아래 3-1). 같은 서비스로 안 느껴짐.
  - 가이드 목록 제목이 전부 **금색 링크**라 읽기 피곤하고 위계가 없음.
  - 본문이 기본 `ul/ol` 글머리표 위주 → 홈 카드 UI와 톤 차이가 큼.
  - 섹션 제목(h2)이 12px대 금색 라벨이라 본문보다 작아 훑어보기 어려움.
  - 텍스트 내비(주차대행 비교·이심·가이드·입점 업체·FAQ)가 모바일에서 빽빽함.

## 2. 관련 파일

| 역할 | 경로 |
|------|------|
| 공통 스타일 (모든 서브페이지) | `public/seo.css` (361줄) |
| 가이드 생성 | `scripts/generate-guides.mjs` (← `data/guides/pages.json`) → `public/guides/**/index.html` |
| 입점 업체 생성 | `scripts/generate-partners.mjs` → `public/partners/**/index.html` |
| 손으로 쓴 정적 페이지 | `public/{faq,facts,about,pricing,terms,privacy,refund,for-partners}/index.html` |
| 홈(비교 기준) | `index.html`, `src/index.css`, `src/pages/HomePage.tsx` |

## 3. 이미 있는 규칙 (코드·합의)

- 3-1. **폰트**: `seo.css`는 `'Pretendard Variable'`을 지정하지만 **어느 서브페이지도 Pretendard 웹폰트를 불러오지 않음** (`grep pretendard public/guides public/faq …` → 0건). 홈 `index.html`만 jsDelivr `pretendard@v1.3.9 … dynamic-subset.css`를 로드. → 서브페이지는 기기 기본 폰트(맥 Apple SD Gothic Neo, 윈도 맑은 고딕, 안드로이드 Noto)로 나옴. **불만의 가장 큰 원인.**
- 3-2. 색 토큰은 이미 홈과 같음 (`#0f1a2e` 남색, `#c9a244` 금색, `#6b7a8a` 보조). 색 체계 변경 불필요.
- 3-3. 홈 UI 언어: 흰 배경, 카드 `#f4f5f7` + `rounded-[28px]`/`rounded-2xl`, 본문 15px, 남색 선택 상태, 그림자 `0 12px 40px rgba(15,26,46,.08)`.
- 3-4. 서브페이지 배경은 `#f3f5f8`(sky-bg), 카드 흰색 → 홈과 명암이 반대.
- 3-5. SEO/AEO 구조는 이미 갖춰짐: BreadcrumbList·FAQPage·Article JSON-LD, 히어로 `p.answer`(직답), 「마지막 업데이트」, `canonical-host.js`. **HTML 구조·문구·URL은 유지**해야 검색 순위가 안 흔들림.
- 3-6. `docs/aeo/56-copy-sync.md` — 문구 동기화 규칙이 있음. 이번 작업은 문구를 바꾸지 않으므로 해당 없음.
- 3-7. 홈 `index.html`만 `theme-color`가 `#3182F6`(파랑), 서브페이지는 `#0f1a2e`. og:image는 `icon-512.png` + `twitter:card=summary`.

## 4. 건드리면 안 되는 것

- [x] Functions / Firestore rules 배포는 B2B(`airpick2-b-to-b`)만
- [x] 후기 수·보험 보장·복귀 시간 등 숫자 지어내기 금지
- [x] 비회원 예약을 카카오 계정에 자동 병합 금지 (합의 전까지)
- [x] main만 사용. cursor/* 브랜치 만들지 않음
- [x] 커밋·푸시·호스팅 배포는 요청 전까지 금지
- 기타:
  - 홈·이심·메뉴(React 앱) 화면은 손대지 않음
  - URL·title·description·JSON-LD·본문 문구 변경 없음 (디자인만)

## 5. 모르는 것 / 확인 필요

- 앱(Capacitor) 웹뷰에서도 이 정적 페이지를 그대로 여는지, 아니면 외부 브라우저로 여는지 → 뒤로가기 바 처리에 영향.
- 홈 공유용 og 이미지(1200×630)를 새로 만들지, 기존 `public/brand/` 이미지 중 하나를 쓸지.

## 6. 한 줄 결론

이 작업의 범위는 **서브페이지 공통 스타일(`seo.css`) + 폰트 로드 + 생성 스크립트·정적 HTML의 `<head>`/클래스 정리**이고, 하지 않는 것은 **문구·URL·스키마 변경, React 앱 화면 수정**이다.
