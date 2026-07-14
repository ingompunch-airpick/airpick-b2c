# 72 — 장애 알림 (도메인·SSL·대량 404)

자동 페이저가 없으면 **주간 루틴 + 콘솔 메일**로 대체.

## 무엇이면 즉시

| 증상 | 어디 봄 | 조치 |
|------|---------|------|
| www/SSL 오류·인증서 | 브라우저 · Firebase Hosting | 재배포·도메인 연결 확인 |
| apex↔www 깨짐 | `에어픽.kr` / `www` | 301·canonical-host |
| 대량 404·소프트 404 | GSC · 네이버 서치어드바이저 | 리다이렉트·sitemap·구 URL |
| robots로 전체 차단 | `/robots.txt` | 즉시 수정·재배포 |
| 사이트맵 실패 | 콘솔 sitemap 리포트 | `npm run sitemap` 후 배포 |

## 알림 채널 (대표가 켜 두기)

- [ ] Google Search Console → 이메일 수신  
- [ ] 네이버 서치어드바이저 → 알림  
- [ ] Firebase / 호스팅 이상 시 배포자 슬랙·카톡 (팀 합의)

## 주간과 연결

`docs/naver/35-weekly.md` · `docs/routines/README.md`
