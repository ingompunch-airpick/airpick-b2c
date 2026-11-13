# 61 — UTM (노출 아님 · 측정만)

검색 노출·순위에는 **도움이 되지 않음**.  
유료·카카오·블로그 유입을 SEO와 **리포트에서만** 나눌 때 쓴다.

필요할 때만:

| 파라미터 | 예 |
|----------|-----|
| utm_source | kakao / naver_blog / instagram / partner |
| utm_medium | social / cpc / qr / referral |
| utm_campaign | 캠페인명_영문스네이크 |

**짧은 경로 (B2C)**: `https://www.에어픽.kr/youtubelong1` · `/blog3` · `/short1`  
앱이 첫 유입을 session에 두고 예약의 `acquisitionSource`에 저장. `/parking` `/about` 등 기존 경로는 쓰면 안 됨.  
자세한 plan: `docs/work/b2c-short-path-acquisition-plan.md`

organic SEO 랜딩 URL에는 UTM을 **심지 않음** (공유·canonical 꼬임 방지).
