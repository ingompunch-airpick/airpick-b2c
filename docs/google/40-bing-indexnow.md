# 40 — Bing Webmaster · IndexNow

사이트 정본: `https://www.에어픽.kr` (punycode `www.xn--oh5b1bw17d.kr`).

## Bing Webmaster Tools (대표)

1. https://www.bing.com/webmasters 로그인  
2. `https://www.에어픽.kr` 추가 · 소유 확인 (HTML 메타 / XML 파일 / DNS 중 하나)  
3. 사이트맵 제출: `https://www.에어픽.kr/sitemap.xml`  
4. IndexNow가 켜져 있는지 확인 (Bing이 키를 읽으면 자동 연동되는 경우 많음)

## IndexNow 키 (코드)

| 항목 | 값 |
|------|-----|
| 키 내용 | `public/indexnow-key.txt` |
| 공개 위치 | `https://www.에어픽.kr/{키}.txt` (`public/{키}.txt`와 동일 내용) |
| 전송 스크립트 | `node scripts/indexnow.mjs` (배포 후 · 요청 시에만) |

배포 전에 키 파일이 Hosting에 올라갔는지 확인:

```bash
curl -sI "https://www.에어픽.kr/$(tr -d '\n' < public/indexnow-key.txt).txt"
```

200이면 `node scripts/indexnow.mjs` 실행.

## 하지 말 것

- CI에서 매 커밋 자동 IndexNow (스팸성) — 배포·콘텐츠 갱신 후 수동  
- apex(`에어픽.kr`)만 등록하고 www를 빼기 — canonical은 **www**
