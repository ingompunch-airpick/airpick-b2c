# Plan: 가이드 콘텐츠 시스템 (1단계)

> research: `docs/work/guide-content-system-research.md`  
> **이 파일이 승인되기 전에는 코드를 쓰지 않는다.**  
> 피드백: 메모 반영 → plan만 수정. 구현 금지.

## 목표

기존 `/guides/{slug}/` 정적 가이드에 **발행 상태·확인일·출처·Article JSON-LD·sitemap/llms 자동·draft 미리보기**를 붙이고, 예약 CTA는 **`/?src=guide_{slug}`** 로 기존 유입 추적에 태운다.

## 하지 않음

- md 이관 · `/guide/` URL · `?g=` 신규 파라미터
- `acquisition.ts` / 예약·결제·업체·회원 코드·DB / Functions·rules
- 새 npm 라이브러리 (marked 등) — 본문은 계속 JSON `sections`
- robots.txt AI Allow 변경
- 기존 10편 본문·FAQ·레이아웃 리디자인 (승인된 메타·표시만 추가)

## 화면·계정 범위

- [x] 해당 없음 (정적 SEO HTML + 생성 스크립트)

## 데이터

- [x] UI·카피·정적 HTML만 (`data/guides/pages.json`, 생성물, sitemap, llms)
- [ ] Firestore / Functions — 없음

## 변경 체크리스트

### A. `data/guides/pages.json`

1. 각 페이지에 필드 추가 (기존 키 유지):
   - `status`: `"published"` | `"draft"` — **기존 10편 전부 `"published"`**
   - `verified`: `"YYYY-MM-DD"` — **각 편의 현재 `updated`와 동일 값으로 시드** (새 날짜 지어내지 않음)
   - `category`: 짧은 문자열 — 시드안:

| slug | category |
|------|----------|
| airport-parking-types | 공항주차 방식 |
| curbside | 주차대행 |
| parking-compare | 주차대행 |
| official-vs-private | 공항주차 방식 |
| t1-t2-unseo | 터미널 |
| long-vs-short | 요금·일정 |
| travel-parking-tips | 요금·일정 |
| peak-soldout | 요금·일정 |
| parking-insurance | 신뢰·보험 |
| esim-beginner | 이심 |

   - `sources`: `{ "name": string, "url": string }[]` — 기존 10편은 **`[]`** (출처 섹션은 비어 있으면 HTML에 안 냄 → 본문 톤 유지)

2. 샘플 **draft 1편** 추가 (임시 본문, 구현 검수용):
   - slug 예: `sample-draft-guide`
   - `status: "draft"`
   - 짧은 sections·faqs·verified/updated/published 오늘(서울) 가능 — **샘플만** 새 날짜 허용
   - 본 배포 전 status를 published로 바꾸라는 완료 보고에 명시

### B. `scripts/generate-guides.mjs`

3. **발행 필터**
   - 환경변수 `AIRPICK_GUIDES_INCLUDE_DRAFT=1` 일 때만 draft HTML 생성
   - 기본(프로덕션·일반 `npm run guides` / `build`): **published만** 쓰기
   - 매 실행 시 `public/guides/` 아래 기존 slug 디렉터리를 **재생성 기준으로 정리**: published(+옵션 draft)만 남기고, 출력 대상이 아닌 slug 폴더는 삭제 (구 draft가 prod에 남는 것 방지)
   - 허브 `index.html`: 같은 집합만 나열. `category` 있으면 **카테고리별** `<h2>` + 목록 (카테고리 없는 페이지는 「기타」)

4. **페이지 HTML (published·draft 공통 템플릿)**
   - URL·경로 유지: `/guides/{slug}/`
   - 히어로 날짜: 기존 `마지막 업데이트` →  
     **`최종 수정일: YYYY.MM.DD` / `정보 확인일: YYYY.MM.DD`** (`updated` / `verified`)
   - FAQ 뒤·관련 가이드 전: `sources.length > 0` 이면  
     `<h2>출처</h2>` + 이름·링크 목록 + 확인일 한 줄
   - 「더 알아보기」 관련 가이드: **published만** 링크 (draft 빌드에서도 목록은 published 기준 권장; draft끼리 링크는 불필요)
   - **CTA**: `ctaHref`가 `/` 이면 → `/?src=guide_{slug}`  
     `ctaHref`가 `/esim` 이면 → `/esim?src=guide_{slug}`  
     (이미 쿼리 있으면 `&src=` 병합. 히어로·하단 CTA 동일)
   - draft 페이지 `<head>`: `<meta name="robots" content="noindex,nofollow" />` (미리보기 유출 완화)

5. **JSON-LD**
   - `@graph`에서 페이지 노드: **`WebPage` → `Article`**
   - `datePublished` = `published`, `dateModified` = `updated`
   - `publisher`: `{ "@type": "Organization", "name": "에어픽", "url": "https://www.에어픽.kr/" }`
   - `headline` = `h1` (또는 title), `description`, `url`, `inLanguage`, `mainEntityOfPage`
   - **BreadcrumbList · FAQPage · HowTo(있을 때) 유지**

6. 기존 10편: 위 메타·날짜 라벨·Article·CTA 쿼리·(빈 sources면 출처 섹션 없음) 외 **본문 HTML 구조는 동일**

### C. sitemap

7. `scripts/generate-sitemap.mjs`
   - partners와 같이 `data/guides/pages.json`에서 **`status===published`** 만 병합
   - path: `/guides/` 허브 + `/guides/{slug}/`
   - `lastmod` = 해당 페이지 `updated` (없으면 오늘 서울)
   - `data/sitemap/urls.json`에서 **개별 가이드 path 10개 제거** (허브 `/guides/` 는 유지해도 되고, 병합과 중복이면 skip — partners와 동일 패턴)

### D. llms.txt

8. `public/llms.txt`에 마커 블록 도입:

```text
<!-- guides:auto:start -->
## 가이드
- 제목: URL — 한줄요약(description 앞쪽 짧게)
...
<!-- guides:auto:end -->
```

9. `generate-guides.mjs` 끝(또는 작은 `scripts/patch-llms-guides.mjs`를 guides에서 호출)에서  
   **마커 사이만** published 목록으로 덮어씀. 마커 밖(브랜드 소개·핵심 페이지 비가이드·신뢰 원칙 등) **손대지 않음**
10. 기존 「핵심 페이지」 안의 `/guides/...` 줄은 **한 번 수동 정리**: 가이드 URL은 auto 블록으로만 두어 중복 제거 (구현 시 llms 편집 = 이 정리만)

### E. draft ↔ 미리보기 채널

11. `package.json`에 스크립트 추가 (예):

```json
"guides:preview": "AIRPICK_GUIDES_INCLUDE_DRAFT=1 npm run guides",
"deploy:hosting:preview": "AIRPICK_GUIDES_INCLUDE_DRAFT=1 npm run build && npx -y firebase-tools@latest hosting:channel:deploy preview --site airpick-b2c --expires 7d"
```

    - 기존 `deploy:hosting` / `build` 는 draft **미포함**
    - 구현 후 검수: `npm run deploy:hosting:preview` → 채널 URL 보고 → 승인 시 샘플 draft를 published로 바꾸거나 삭제 후 본 배포는 사용자 지시

### F. `src` 추적 — 확인만 (코드 수정 금지)

12. **보고용 확인 결과 (구현 시 재검증·완료 보고에 포함):**

| 단계 | 동작 (현재 코드) |
|------|------------------|
| 랜딩 | `/?src=guide_curbside` → `App`이 `captureAcquisitionFromLocation` |
| 저장 | `normalizeSource`: `^[a-z0-9_-]{1,40}$` → `guide_{slug}` 허용 (예: `guide_airport-parking-types` ≤40자) |
| 예약 | `submitReservation` → `acquisitionFieldsForReservation()` → payload `acquisitionSource` 등 |
| 조건 | **첫 유입만** 저장(30일). 이미 다른 acquisition이 있으면 `src`로 안 덮음 |

→ **수정 없이** CTA `?src=guide_{slug}` 만으로 예약 문서에 남을 수 있음. `acquisition.ts` **수정하지 않음**.

## 카피·숫자 (지어내지 말 것)

| 위치 | 문구 또는 규칙 |
|------|----------------|
| 날짜 줄 | `최종 수정일: {updated}` / `정보 확인일: {verified}` (점 구분 `YYYY.MM.DD`) |
| 출처 헤딩 | `출처` (sources 있을 때만) |
| CTA 라벨 | pages.json 기존 `ctaLabel` 유지 |
| publisher | `에어픽` + `https://www.에어픽.kr/` |
| verified 시드 | 기존 10편 = 각 `updated`와 동일 |

## 검증

- [ ] `npm run guides` 후 기존 10 slug HTML 존재, `sample-draft-guide` **없음**
- [ ] `AIRPICK_GUIDES_INCLUDE_DRAFT=1 npm run guides` 후 draft HTML 존재 + noindex
- [ ] curl(로컬 public 또는 preview): 본문, Article+FAQ+Breadcrumb JSON-LD, 최종수정/확인일
- [ ] `npm run sitemap` → published 가이드 lastmod=`updated`, draft 없음
- [ ] llms.txt 마커 안만 갱신, 바깥 수동 문단 유지
- [ ] CTA href에 `src=guide_{slug}`
- [ ] 기존 10편: 본문 단락·FAQ 텍스트 diff는 메타/날짜라벨/LD/CTA쿼리/출처(없음) 수준인지 보고
- [ ] `./node_modules/.bin/tsc --noEmit` (TS 앱 미변경이어도 빌드 경로 확인)
- [ ] 완료 보고: (1) 10편 HTML 전후 차이 요약 (2) curl 결과 (3) 새 가이드 추가 3줄

## 구현 지시 (승인 후 붙여넣기)

```
docs/work/guide-content-system-plan.md 대로만 구현해.
plan에 없는 리팩터·부가 기능 금지.
acquisition.ts·예약·결제·업체·회원·DB 수정 금지.
한 단계 끝날 때마다 필요하면 tsc --noEmit.
커밋·브랜치·배포는 내가 말할 때까지 하지 마.
main만 사용.
```

## 메모 (사람이 적음)

<!-- 승인 전제 1–10 반영. URL /guides/ 유지. md 없음. -->
- 기존 10편 `verified`는 **비움**. 비어 있으면 「정보 확인일」생략, 「최종 수정일」만.
- `deploy:hosting`(prod) 경로에서 `AIRPICK_GUIDES_INCLUDE_DRAFT`가 켜져 있으면 **빌드 실패**.
