# 69 — 스테이징 `noindex`

## 현재

B2C 공개 호스팅은 **Firebase `airpick-b2c` 프로덕션**이 유일 경로에 가깝다.  
별도 스테이징 도메인이 없으면 이 항목은 **「생기면 적용」**.

## 규칙 (프리뷰·임시 URL이 생길 때)

1. `<meta name="robots" content="noindex,nofollow" />`  
2. 가능하면 `X-Robots-Tag: noindex`  
3. **프로덕션 sitemap에 프리뷰 URL 넣지 않음**  
4. canonical을 프로덕션 www로 강제하지 말고, noindex로 색인만 막기 (중복 방지)

이미 `public/404.html` 은 noindex.

## 체크

| 환경 | URL | noindex? |
|------|-----|----------|
| 프로덕션 www | https://www.에어픽.kr | 색인 OK (noindex 없음) |
| (예비) 프리뷰 | | 반드시 noindex |
