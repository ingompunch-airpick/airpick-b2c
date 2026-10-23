# Plan: 검색·채널 문장 정본 정렬

> research: `docs/work/seo-copy-align-research.md`  
> **승인 가정:** 채팅에서 「구현 규칙대로 구현해줘」= 이 plan 승인.

## 목표

손님·크롤러가 보는 문장·링크가 홈(`AIRPICK_DEFINITION`, `/` 비교·예약)과 같게 한다.

## 하지 않음

- 후기 보너스 포인트 / 쿠폰+포인트 동시 사용 (B2B·제품 미정)
- `reviews_count` 집계 변경
- Functions·rules 배포, TripHomeHub를 홈에 다시 붙이기
- `/parking` 301 제거 또는 별도 비교 SPA 부활
- 커밋·호스팅 배포 (요청 전)

## 화면·계정 범위

- [x] 해당 없음 (정적·docs·상수 위주). FAQ 앱 답변은 `officialAnswers`만.

## 데이터

- [x] UI·카피·생성 스크립트·docs
- [ ] Firestore 쓰기 없음

## 변경 체크리스트

1. `officialAnswers` `leaveBy` / `leaveByBuffer` — 홈에 없는 집주소 계산기 문구 제거
2. `vite.config.ts` description — 정의문·메타에 맞춤
3. `data/guides/pages.json` — `ctaHref`·본문 `/parking` → `/` (또는 가이드 경로)
4. `scripts/generate-partners.mjs` — 내비·CTA `/parking` → `/`
5. `npm run guides` · `npm run partners` · 수동 public(HTML) 잔여 `/parking`·옛 정의문
6. `esim.html` · `parking.html` FAQ/스키마 옛 포지션 문장
7. docs: STATUS, channels, aeo, geo, google, naver, partners-backlinks — 정의문·출국시간 포지션·`/parking` 링크
8. `npm run sitemap` — lastmod 오늘(서울)
9. `tsc --noEmit`

## 카피·숫자 (지어내지 말 것)

| 위치 | 문구 또는 규칙 |
|------|----------------|
| 정의문 | `AIRPICK_DEFINITION` 그대로 |
| leaveBy | 계산기 없음. 항공권·권장 도착 기준으로 손님이 직접 |
| /parking CTA | href=`/`, 라벨은 「주차대행 비교·예약」 등 유지 가능 |

## 검증

- [x] `rg 'href="/parking"' public scripts data` → 없음 (`/` 또는 가이드 경로만)
- [x] 옛 포지션 한 줄·`비교센터(에어픽)` 정의문 → docs/public 정리 (work 문서·미사용 leaveBy 코드 제외)
- [x] `./node_modules/.bin/tsc --noEmit`
- [x] sitemap lastmod `2026-10-20` (Asia/Seoul)

## 구현 지시

```
plan.md 대로만 구현해.
plan에 없는 리팩터·부가 기능 금지.
한 단계 끝날 때마다 tsc --noEmit.
커밋·브랜치·배포는 내가 말할 때까지 하지 마.
main만 사용.
```
