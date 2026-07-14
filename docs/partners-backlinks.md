# 입점사 백링크 · 배지 운영 (P4)

목표: 입점사 **홈/카톡**에서 `www.에어픽.kr` 또는 `/partners/{id}/` 로 소개 링크가 생기게 한다.  
유료 링크·스팸 디렉터리 금지.

## 공개 페이지 (복붙용)

https://www.에어픽.kr/for-partners/

배지 파일:
- https://www.에어픽.kr/badges/airpick-compare.svg
- https://www.에어픽.kr/badges/airpick-partner.svg

## 입점사에 보낼 메시지 (복붙)

안녕하세요, 에어픽입니다.
입점 안내 페이지에 「에어픽에서 비교·예약」 배지/링크를 붙여 주시면
손님이 요금 비교 후 예약하기 쉬워집니다.

가이드·복붙 HTML:
https://www.에어픽.kr/for-partners/

(우리 업체 공개 페이지)
- 와와: https://www.에어픽.kr/partners/wawa/
- 가유: https://www.에어픽.kr/partners/gayu/

금지: 무조건 최저가 / 확정가 단정 / 가짜 후기

## 체크 (부착 후)

| 입점 | 홈 링크 | 카톡 | 비고 | 날짜 |
|------|---------|------|------|------|
| 와와발렛 | | | | |
| 가유 | | | | |

## 에어픽 쪽 업데이트

- 새 입점: `data/partners/pages.json` 추가 → `npm run partners`
- `/for-partners/` 에 해당 id 스니펫 추가
- sitemap은 partners 병합으로 자동 포함
