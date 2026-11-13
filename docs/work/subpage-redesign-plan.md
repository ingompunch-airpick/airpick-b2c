# Plan: 서브페이지(가이드·FAQ 등) 디자인 리뉴얼

> 2026-11-13 · 전제: `docs/work/subpage-redesign-research.md`  
> **이 파일이 승인되기 전에는 코드를 쓰지 않는다.**

## 목표

손님이 홈 → 메뉴 → 가이드·FAQ로 넘어가도 **같은 서비스로 느끼게** 한다. 홈과 같은 폰트(Pretendard), 같은 카드 톤, 읽기 쉬운 위계로 맞춘다.

## 하지 않음

- 본문 문구, title·description, URL, JSON-LD 변경 (SEO 순위 유지)
- 홈·이심·메뉴·내 예약 등 React 앱 화면 수정
- 색 체계 변경 (남색 `#0f1a2e` · 금색 `#c9a244` 그대로)
- 새 페이지·새 콘텐츠 추가 (별도 plan)
- 이미지·아이콘 신규 제작 (단, 4단계 og 이미지는 대표님 결정 시)

## 화면·계정 범위

- [x] 비로그인
- [ ] 카카오 로그인
- [ ] 비회원 조회
- [x] 해당 없음 (정적 페이지, 로그인 무관)

## 데이터

- [x] UI·카피만 (CSS·HTML `<head>`만)
- [ ] Firestore 읽기/쓰기 없음
- [ ] B2B 변경 없음

## 적용 대상

| 종류 | 페이지 | 수정 방식 |
|------|--------|-----------|
| 생성 | `/guides/` + 가이드 10편 | `scripts/generate-guides.mjs` 템플릿 → 재생성 |
| 생성 | `/partners/` + 업체 상세 | `scripts/generate-partners.mjs` 템플릿 → 재생성 |
| 정적 | `/faq/` `/facts/` `/about/` `/pricing/` `/terms/` `/privacy/` `/refund/` `/for-partners/` | `<head>` 한 줄 추가 |
| 공통 | 전부 | `public/seo.css` |

본문 마크업(`.hero` `.section` `h2` `ol/ul` `.card` `details.faq`)이 이미 일관돼서, **디자인 변경은 거의 `seo.css` 한 파일에서 끝난다.**

## 변경 체크리스트

### 1단계 — 폰트 (가장 체감 큼, 단독 배포 가능)

1. 위 모든 페이지 `<head>`에 홈 `index.html`과 **같은** 줄 추가:
   - `<link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin />`
   - `<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.css" />`
   - 위치: `seo.css` 링크 바로 위.
2. 생성 스크립트 2개의 템플릿(guides 194·316행, partners 339·494행 부근)에도 같은 줄 추가 → 재생성해도 유지.

### 2단계 — 바탕·타이포 (`seo.css`)

3. 배경을 홈처럼 **흰색**(`#fff`)으로, 카드·박스는 `#f4f5f7`로 반전.
4. 글자 크기·줄간격
   - 본문 `p, li`: 16px / line-height 1.7 / 색 `#0f1a2e` 85%
   - `h1`: 24px / 800 / line-height 1.35
   - **`h2`**: 지금 12px 금색 라벨 → **19px 700 남색** 제목. 금색은 위쪽 3px 짧은 바(또는 eyebrow)로만.
   - 보조 텍스트(업데이트일 등): 13px `#6b7a8a`
5. 본문 최대 폭 `40rem` 유지, 좌우 여백 20px.

### 3단계 — 컴포넌트 (`seo.css`)

6. **히어로**: 남색 카드 유지하되 `rounded 28px`, 그림자 홈과 동일. `p.answer`(직답)는 흰 반투명 박스로 감싸 강조 → AEO 직답이 눈에도 띄게.
7. **CTA 버튼**: 홈 버튼과 같은 높이(48px)·라운드(14px)·폰트 16px 700. 주 버튼 금색, 보조 버튼 흰 테두리.
8. **`ol` (순서)**: 기본 숫자 → 남색 원형 번호 배지(24px) + 카드형 줄. CSS `counter`로 처리, HTML 변경 없음.
9. **`ul` (목록)**: 기본 점 → 금색 6px 점, 항목 간격 8px.
10. **`.section`**: 섹션마다 위 32px 여백 + 얇은 구분선 대신 여백으로 구분.
11. **가이드 목록(`/guides/`)**: 금색 링크 제목 → **남색 제목 + 회색 요약 + 날짜**의 `#f4f5f7` 카드. 카드 전체 탭 가능, 오른쪽 `›`. 금색은 hover/press 때만.
12. **FAQ 아코디언(`details.faq`)**: `#f4f5f7` 카드, 질문 16px 600, 오른쪽 `+`/`−`, 펼침 시 답변 15px.
13. **표(`.card table`)**: 헤더 `#f4f5f7`, 셀 패딩 12px, 모바일에서 가로 스크롤 래퍼.
14. **상단 텍스트 내비(`.topnav`)**: 모바일에서 가로 스크롤 칩(`#f4f5f7`, 현재 페이지는 남색 칩)으로. 빽빽함 해소.
15. **하단**: 모든 가이드 끝에 「일정 넣고 업체 보기」 CTA 카드가 이미 있으면 스타일만 통일, 없으면 추가하지 않음(문구 변경 금지 원칙).

### 4단계 — 홈 `<head>` 정리 (작음, 대표님 확인 후)

16. `index.html` `theme-color` `#3182F6` → `#0f1a2e` (서브페이지와 통일).
17. og:image **새로 제작** (대표님 결정 2026-11-13): `public/brand/og-default.jpg` 1200×630
    - 남색 `#0f1a2e` 바탕 + 금색 로고(`brand-mark-gold.png`) + 「인천공항 주차대행 비교·예약」 + 「에어픽」
    - 글자는 기존 title 문구만 사용 (새 카피 없음). 카톡 썸네일 잘림 대비 핵심 요소는 가운데 630×630 안에.
    - 홈 + 모든 서브페이지 `og:image`·`twitter:image` 교체, `twitter:card` → `summary_large_image`, `og:image:width/height` 추가.
    - 시안 1장 먼저 보여드리고 확정 후 반영.

### 5단계 — FAQ 경로 통일

현재: 웹 `/faq/` 페이지는 있음(Q&A 24개, FAQPage JSON-LD, sitemap 포함). 그런데 앱 메뉴의 FAQ는 `openInApp: 'faq'`로 **URL 없는 앱 내부 시트(`SupportPage`)**를 띄움 → 주소창에 /faq가 안 보이고, 내용은 `src/constants/support.ts`와 `public/faq/index.html` 두 곳을 손으로 맞추는 중(`docs/aeo/56-copy-sync.md`).

18. `src/constants/siteNav.ts` 메뉴 FAQ 항목에서 `openInApp: 'faq'` 제거 → 가이드처럼 `/faq/` 페이지로 이동 (앱 웹뷰 안에서 열림 확인됨). 리뉴얼된 디자인을 그대로 씀.
19. 예약 화면 등 다른 곳의 FAQ 버튼(`App.tsx` `open_faq` 'reservation')은 **그대로 시트 유지** (예약 흐름 이탈 방지).
20. (선택, 별도 plan) `public/faq/index.html`을 `support.ts`에서 생성하는 스크립트 → 두 곳 수동 동기화 제거.

## 카피·숫자 (지어내지 말 것)

| 위치 | 문구 또는 규칙 |
|------|----------------|
| 전 페이지 | 문구·숫자 변경 없음. 기존 텍스트 그대로 |
| 업데이트 날짜 | 기존 값 유지 (디자인만 바꿨으므로 날짜 갱신 안 함) |

## 검증

- [x] `npm run guides && npm run partners` 재생성 후 `git diff`에서 본문 텍스트·JSON-LD 변경 0건 (head 링크 추가만)
- [x] 모바일 390px·데스크톱 1280px 스크린샷 비교: `/guides/`, 가이드 1편, `/faq/`, `/facts/`, `/pricing/` (전·후)
- [x] 폰트: 렌더된 폰트가 Pretendard인지 (document.fonts 확인)
- [ ] 홈 → 메뉴 → 가이드 이동 시 폰트·톤 끊김 없는지 (앱 웹뷰 포함)
- [ ] Lighthouse 모바일 접근성: 본문 대비 4.5:1 이상, 탭 영역 44px 이상
- [x] `./node_modules/.bin/tsc --noEmit -p tsconfig.app.json` · `vite build` 통과

## 구현 순서·소요

| 단계 | 내용 | 비고 |
|------|------|------|
| 1 | 폰트 로드 | 단독으로 먼저 배포해도 됨 |
| 2–3 | `seo.css` 리뉴얼 | 스크린샷 전·후 비교 후 확정 |
| 4 | 홈 head | og 이미지 결정 필요 |

## 구현 지시 (승인 후 붙여넣기)

```
subpage-redesign-plan.md 대로만 구현해.
plan에 없는 리팩터·부가 기능 금지. 본문 문구·URL·JSON-LD 변경 금지.
한 단계 끝날 때마다 전·후 스크린샷 비교.
커밋·브랜치·배포는 내가 말할 때까지 하지 마.
main만 사용.
```

## 메모 (사람이 적음)

- 2026-11-13 대표: 가이드는 앱 안(웹뷰)에서 열림. → 뒤로가기 바(`page-bar`) 유지.
- 2026-11-13 대표: 카톡 공유 이미지는 새로 제작.
- 2026-11-13 대표: FAQ가 /faq로 안 보이는 문제 → 5단계 추가.
- 2026-11-13 구현: 1·2·3·5단계 + 4단계 16번(theme-color, manifest 포함). 17번 og 이미지는 시안 확인 대기 (아직 미반영).
- 구현 중 발견(문구라 이번 범위 밖): `/facts/`에 「저장소 docs/aeo/55-brand-scripts.md 참고」, `/pricing/`에 「`getPriceBreakdown`」처럼 내부 경로·함수명이 손님에게 노출됨 → 별도 수정 필요.
