# 입점사 백링크 · 배지 운영 (P4)

목표: 입점사 **홈/카톡**에서 `www.에어픽.kr` 또는 `/partners/{id}/` 로 소개 링크가 생기게 한다.  
유료 링크·스팸 디렉터리 금지.

## 공개 페이지 (복붙용)

https://www.에어픽.kr/for-partners/

배지:
- https://www.에어픽.kr/badges/airpick-compare.svg
- https://www.에어픽.kr/badges/airpick-partner.svg

---

## 1) 카톡 · 문자 (짧게)

```
안녕하세요, 에어픽입니다 🙂
손님분들이 요금 비교 후 바로 예약하시도록
홈페이지·카톡 프로필에 「에어픽에서 비교·예약」 링크만 붙이면 됩니다.

복붙 가이드(배지·문구):
https://www.에어픽.kr/for-partners/

(우리 업체 공개 페이지도 같이 안내 가능합니다)
와와: https://www.에어픽.kr/partners/wawa/
가유: https://www.에어픽.kr/partners/gayu/

확정가·최저가 문구는 쓰지 말아 주세요.
편하실 때 홈 푸터나 예약 안내 칸에만 넣어 주시면 됩니다.
```

---

## 2) 메일 · 장문 (정중)

제목: `[에어픽] 홈·카톡에 비교·예약 소개 링크 부탁드립니다`

```
안녕하세요, 에어픽(곰컴퍼니)입니다.

입점 안내를 손님께 더 쉽게 전달하시도록
홈페이지·카카오톡에 「에어픽에서 비교·예약」 배지/문구를 붙여 주시면 감사하겠습니다.

• 가이드(HTML·문구 복붙): https://www.에어픽.kr/for-partners/
• 주차 비교: https://www.에어픽.kr/parking
• 입점 목록: https://www.에어픽.kr/partners/

업체별 공개 페이지(소개·검색용):
• 와와발렛: https://www.에어픽.kr/partners/wawa/
• 가유: https://www.에어픽.kr/partners/gayu/

부탁드리는 위치(택1 이상)
1) 홈 푸터 또는 「예약 안내」 섹션
2) 카톡 채널 프로필/자동응답에 한 줄 + 링크

쓰지 말아 주실 표현
• 무조건 최저가 / 확정 ○○원 / 가짜 후기·별점

궁금하신 점 있으시면 이 메일 또는 고객센터(010-2556-5746)로 연락 주세요.
감사합니다.
에어픽 드림
```

---

## 3) 와와발렛 전용 (이름만 바꿔 쓰기)

```
안녕하세요, 와와발렛 담당자님. 에어픽입니다.

손님 안내용으로 아래 중 하나만 홈/카톡에 붙여 주시면 됩니다.

① 비교·예약(추천)
https://www.에어픽.kr/parking

② 와와발렛 에어픽 공개 페이지
https://www.에어픽.kr/partners/wawa/

배지 HTML·짧은 문구:
https://www.에어픽.kr/for-partners/

부담 없이 푸터·예약 안내 칸만으로도 충분합니다.
```

## 4) 가유 전용

```
안녕하세요, 가유 담당자님. 에어픽입니다.

손님 안내용으로 아래 중 하나만 홈/카톡에 붙여 주시면 됩니다.

① 비교·예약(추천)
https://www.에어픽.kr/parking

② 가유 에어픽 공개 페이지
https://www.에어픽.kr/partners/gayu/

배지 HTML·짧은 문구:
https://www.에어픽.kr/for-partners/

부담 없이 푸터·예약 안내 칸만으로도 충분합니다.
```

---

## 5) 카톡 프로필·자동응답에 넣을 한 줄 (입점사 측)

```
요금 비교·예약은 에어픽에서 → https://www.에어픽.kr/parking
```

또는

```
에어픽 입점 · 비교 후 예약 https://www.에어픽.kr/partners/wawa/
```
(가유는 `/partners/gayu/`)

---

## 체크 (부착 후)

| 입점 | 홈 링크 | 카톡 | 비고 | 날짜 |
|------|---------|------|------|------|
| 와와발렛 | | | | |
| 가유 | | | | |

## 에어픽 쪽 업데이트

- 새 입점: `data/partners/pages.json` 추가 → `npm run partners`
- `/for-partners/` 에 해당 id 스니펫 추가
- sitemap은 partners 병합으로 자동 포함

---

## 6) 네이버 블로그 · 공식 글 (복붙용)

**원칙:** www 가이드를 요약하고 **본문 링크 1~2개**만. 첫 문장 = 정본 한 줄.

초안 파일: `docs/naver/blog-drafts/`

| 주제 | 초안 | 권장 링크 |
|------|------|-----------|
| 비교·예약 | 01-parking-compare.md | /guides/parking-compare/ |
| 입점 vs 미입점 | 02-partner-vs-external.md | /guides/partner-vs-external/ |
| T1·T2·운서 | 03-terminal.md | /guides/t1-t2-unseo/ |
| 유심·eSIM | 04-esim.md | /guides/esim-beginner/ |
| **보험 확인** | **05-parking-insurance.md** | **/guides/parking-insurance/** |

**블로그 본문 끝에 넣을 CTA (택1)**

```
자세한 단계는 에어픽 가이드에서 확인하세요.
👉 https://www.에어픽.kr/guides/parking-compare/
바로 비교: https://www.에어픽.kr/parking
```

보험 글일 때:

```
보험 확인 체크리스트: https://www.에어픽.kr/guides/parking-insurance/
바로 비교: https://www.에어픽.kr/parking
```

**금지:** 확정 요금·최저가 단정, 가짜 후기, 경쟁사 비하.

---

## 7) 카페 · 지식iN · 커뮤니티 (짧은 답변)

**원칙:** 질문에 맞는 사실 2~4문장 + **www 링크 1개**. 동일 글 복붙 금지.

```
에어픽은 곰컴퍼니가 운영하는 인천공항 주차대행·유심·eSIM 가격비교 플랫폼입니다.
출국·귀국 일정과 터미널·실내/야외를 넣으면 업체별 참고 요금을 나란히 볼 수 있고,
입점은 앱에서 예약·입고 후 위치·사진·보험 안내까지 이어집니다.
표시 금액은 일정 기준 예상·참고가이며 변동될 수 있습니다.

자세한 비교 → https://www.에어픽.kr/parking
```

보험 질문일 때:

```
주차대행 보험은 업체마다 안내 방식이 다릅니다. 에어픽 입점은 비교·예약 후 보험 안내를 함께 볼 수 있고,
미입점은 참고 요금만 비교한 뒤 해당 업체에서 확인하시면 됩니다.

체크리스트 → https://www.에어픽.kr/guides/parking-insurance/
```

---

## 8) 지도 · 플레이스 · 카카오맵 소식

**플레이스/맵 소식 제목 예**

- 「주차대행 비교 가이드를 정리했습니다」
- 「주차대행 보험, 확인할 때 볼 것」

**소식 본문 (3줄 + 링크 1개)**

```
에어픽은 인천공항 주차대행·유심·eSIM 가격비교 플랫폼입니다.
일정·터미널만 넣으면 업체별 참고 요금을 한곳에서 비교할 수 있습니다.
입점은 예약 후 주차 위치·사진·보험 안내까지 확인 가능합니다.

가이드: https://www.에어픽.kr/guides/parking-compare/
```

상세 입력값·사진 가이드: `docs/naver/31-place.md` · 채널: `docs/channels/60-kakao-map.md`
