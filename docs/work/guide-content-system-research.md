# Research: 가이드 콘텐츠 시스템 (0단계)

> 목적: SEO·AEO용 가이드 확장 전, 현재 구조만 확인. **코드 수정 없음.**  
> 다음: 승인 후 plan → 1단계 구현.

## 1. 손님 한 명의 경로

- 시작: 구글·네이버·AI가 `/guides/{slug}/` 정적 HTML을 읽음 (JS 불필요)
- 중간: CTA → `/` (또는 `/esim`) SPA 홈에서 비교·예약
- 끝: 예약 접수 (`acquisition*`는 홈 유입 쿼리/단축경로만 현재 기록)
- 이탈·헷갈림: `/guide` vs `/guides` 혼동 가능. 기존 정본은 **복수형 `/guides/`**

## 2. 관련 파일

| 역할 | 경로 |
|------|------|
| 가이드 소스 | `data/guides/pages.json` |
| HTML 생성 | `scripts/generate-guides.mjs` → `public/guides/**/index.html` |
| 목록 | `public/guides/index.html` (같은 스크립트) |
| sitemap 소스 | `data/sitemap/urls.json` → `scripts/generate-sitemap.mjs` → `public/sitemap.xml` |
| llms | `public/llms.txt` (**수동** 편집) |
| robots | `public/robots.txt` (수동, AI 봇 Allow 유지) |
| SPA 앱 | Vite + React (`src/`), 예약·결제·회원 |
| SEO 경로 보호 | `src/utils/appPath.ts` `isSeoDocumentPath`, `vite` `seoDocumentRewrite` |
| 유입 추적 | `src/utils/acquisition.ts` → 예약 `acquisitionSource` 등 |

## 3. 이미 있는 규칙 (코드·합의)

- 빌드: `npm run build`가 `guides` → faq → partners → **sitemap** → vite
- 가이드 URL: `https://www.에어픽.kr/guides/{slug}/` (trailing slash)
- 생성 HTML: h1·answer·본문·FAQ·JSON-LD(BreadcrumbList·**WebPage**·FAQPage·선택 HowTo)·canonical·OG
- 구 슬러그 301: `meet-and-greet`→`curbside`, `partner-vs-external`→`/partners/`
- Functions/rules 배포는 B2B만 (이 기능은 Hosting 정적만)

## 4. 건드리면 안 되는 것

- [x] Functions / Firestore rules 배포는 B2B만
- [x] 숫자 지어내기 금지
- [x] 비회원→카카오 자동 병합 금지
- [x] main만
- [x] 커밋·푸시·배포는 요청 전 금지
- 기타: **예약·결제·업체·회원 로직/DB는 1단계에서 기본 비접촉**. `?g=` 예약 귀속만 필요 시 `acquisition.ts` 소폭 확장(별도 합의)

## 5. 모르는 것 / 확인 필요 (승인 시 plan에 넣을 것)

- URL을 `/guide/`로 바꿀지 → **권장: `/guides/` 유지** (이미 인덱싱·llms·sitemap·301 존재)
- `pages.json` 10편을 md로 이관할지, 병행할지
- `Article` vs 현재 `WebPage` 스키마 교체 여부
- draft 미리보기: Hosting preview 채널만인지, `?preview=` 로컬도인지
- `?g={slug}` vs 기존 `src` / 단축경로(`/youtubelong1`) — **`?v=` 전용 키는 없음**

## 6. curl·생성 확인 요약 (0단계)

- 라이브 `/guides/curbside/`: HTML에 h1·본문·FAQ·`application/ld+json` 존재 (JS 없이 본문 노출)
- 가이드 10개 슬러그: airport-parking-types, curbside, parking-compare, official-vs-private, t1-t2-unseo, long-vs-short, travel-parking-tips, esim-beginner, parking-insurance, peak-soldout
- sitemap: guides 경로는 `urls.json`에 **수동** 등록 (partners만 스크립트 병합)
- llms.txt: 가이드 목록 **수동** 유지
