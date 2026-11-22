# 커서 작업 지시서 — 네이버 노출 + 유입 측정 (2026-11-23, Claude 작성)

Claude가 이미 반영한 것 (미커밋):
- index.html: title·description·og·twitter·JSON-LD 문구 교체, 홈 SEO 본문에 허브 3개 링크 추가
- src/constants/companyLegal.ts: AIRPICK_DEFINITION_META, AIRPICK_HOME_DOCUMENT_TITLE 같은 문구로 동기화
- data/guides/pages.json: draft 3편 추가(terminal2-valet, terminal1-valet, airport-parking-fee),
  parking-discount 제목, t1-t2-unseo·valet-price에 허브 링크 추가

⚠️ 발행된 페이지(홈, t1-t2-unseo, valet-price)가 draft 3편으로 링크합니다.
   **3편을 published로 바꾸기 전에는 본 배포(deploy:hosting) 금지** (404 생김). 미리보기 배포는 OK.

---

## 작업 1. 가이드 사진 지원 (scripts/generate-guides.mjs)

pages.json 섹션에 선택 필드 `image`를 지원한다.

```json
"image": { "src": "/guides/img/t2-dropoff.webp", "alt": "2터미널 단기주차장 입구", "caption": "2026-11 촬영", "width": 1200, "height": 800 }
```

- 섹션 h2 바로 아래에 `<figure><img src alt width height loading="lazy" decoding="async"><figcaption></figcaption></figure>` 출력. alt 필수, 없으면 빌드 에러.
- 페이지 단위 선택 필드 `ogImage`가 있으면 og:image·Article JSON-LD image에 사용(없으면 기존 og-default).
- 이미지 파일 위치: `public/guides/img/` (cleanGuideDirs가 이 폴더를 지우지 않도록 keep 목록에 추가).
- 사진 선정·변환(webp, 가로 1200)은 Claude가 함. 이 작업은 렌더링 지원만.

## 작업 2. 유입 경로 측정 (src/utils/acquisition.ts + 예약 폼 + 대시보드)

현황: src·utm_source·단축경로가 있을 때만 저장 → 11/1~22 예약 16건 중 13건 '경로 없음'.

2-1. 첫 방문 정보 저장 (경로가 없어도 저장)
- 기존 AcquisitionHit에 `referrerHost`, `landingPath`, `naver` 필드 추가.
  - referrerHost: `document.referrer`의 host (같은 사이트면 무시). 없으면 'direct'.
  - naver: URL에 있으면 저장 → `n_media, n_query, n_keyword, n_rank, n_campaign_type, n_ad_group`
    (네이버 검색광고 '자동 추적 URL 파라미터'. n_campaign_type=1 이 파워링크)
  - inApp: UA에 `KAKAOTALK` / `NAVER(inapp` / `Instagram` / `FBAN|FBAV` 있으면 표시.
- source가 비어 있으면 아래 규칙으로 자동 분류해서 source에 넣는다(기존 src 우선순위는 그대로):
  - n_campaign_type 있음 → `naver_ad`
  - referrer host에 search.naver.com / m.search.naver.com → `naver_search`
  - blog.naver.com / cafe.naver.com → `naver_blog` / `naver_cafe`
  - google.* → `google`, chatgpt.com / chat.openai.com → `chatgpt`, perplexity.ai → `perplexity`
  - youtube.com / youtu.be → `youtube`, kakao 인앱·referrer → `kakao`
  - 그 외 referrer → `ref_<host>` (정규식에 맞게 . 을 _ 로), referrer 없음 → `direct`
- utm_source에 `chatgpt.com`처럼 점(.)이 들어오면 지금은 버려짐 → 점을 `_`로 바꾸거나 위 규칙으로 처리.
- first-touch(30일) 유지 + last-touch도 별도 저장, 예약에 둘 다 기록.

2-2. 예약 폼 선택 문항 1개 (필수 아님)
- "에어픽을 어떻게 알게 되셨나요?"
  보기: 네이버 검색 / 네이버 광고 / 유튜브 / 블로그·카페 / ChatGPT 등 AI / 지인 추천 / 입점업체 소개 / 기타(직접 입력)
- 예약 문서에 `heardFrom` 저장. 기기를 바꿔서 예약한 경우도 잡기 위한 것.

2-3. 대시보드 '에어픽 짧은 경로'
- '경로 없음' 행을 2-1의 자동 분류(source)와 heardFrom으로 나눠서 보여주기.
- 파워링크는 n_query(실제 검색어)별 방문·예약 표.

2-4. (대표) 네이버 검색광고 관리 > 자동 추적 URL 파라미터 ON. 켠 뒤 광고 클릭 랜딩에 n_* 가 붙는지 확인.

## 배포 순서
1. `npm run guides:preview` 후 `npm run deploy:hosting:preview` → 미리보기 URL 대표 확인
2. 대표 "발행" → Claude가 3편 status를 published로 변경
3. `npm run guides && npm run sitemap` → `npm run deploy:hosting` → 커밋·push
4. (대표) 네이버 서치어드바이저: sitemap 제출 + 새 페이지 3개 '웹 페이지 수집' 요청
