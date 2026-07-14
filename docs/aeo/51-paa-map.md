# 51 · PAA·유사 질문 → 페이지 맵

질문형 검색·PAA 후보를 FAQ `shortAnswer`·상세 답·가이드 H2에 연결한다.  
직접답은 `src/constants/officialAnswers.ts` / `support.ts` / `esimSupport.ts`와 동기.

## 주차대행 · 예약

| 질문형 키워드 (예) | 공식 답 위치 | shortAnswer 키 | 비고 |
| --- | --- | --- | --- |
| 에어픽이란 / 에어픽 뭐야 | [/faq/](https://www.에어픽.kr/faq/) · [/facts/](https://www.에어픽.kr/facts/) | `whatIs` | 정의 정본 `AIRPICK_DEFINITION` |
| 에어픽 예약 조회 | FAQ 「에어픽 예약은 어디서 조회하나요?」 | `lookup` | |
| 에어픽 예약 안됨 / 조회 실패 | FAQ 조회 실패 | `lookupFail` | |
| 인천공항 주차대행 예약 방법 | FAQ 예약 방법 · [/guides/](https://www.에어픽.kr/guides/) | `bookHow` | |
| 에어픽 예약 취소 | FAQ 변경·취소 | `cancel` | 입고 전/후 구분 |
| 에어픽 카드 결제 / 앱 결제 | FAQ 카드 결제 | `payCard` | **현장 결제** 고정 |
| 입고 사진 언제 | FAQ 입·출고 사진 | `photos` | |
| 주차 위치 확인 / 보험 | FAQ 위치·보험 | `locationInsurance` | 입점만 |
| 에어픽 고객센터 / 연락처 | FAQ 문의 · [/about/](https://www.에어픽.kr/about/) | `contact` | 현장=업체 / 앱=에어픽 |

## 입점 · 비교

| 질문형 키워드 (예) | 공식 답 위치 | 비고 |
| --- | --- | --- |
| 입점 vs 미입점 | [/guides/partner-vs-external/](https://www.에어픽.kr/guides/partner-vs-external/) | 가이드 H2 |
| 와와발렛 / 가유 에어픽 | [/partners/](https://www.에어픽.kr/partners/) | 업체 랜딩 |
| 인천공항 T1·T2 주차대행 | 가이드 터미널편 · 주차 비교 | |

## 유심 · eSIM

| 질문형 키워드 (예) | 공식 답 위치 | shortAnswer 키 |
| --- | --- | --- |
| 에어픽 유심 구매 | FAQ 유심 구매 | `esimBuy` |
| eSIM USIM 차이 / 뭐 고를까 | FAQ · 앱 eSIM 가이드 | `esimType` |
| 에어픽 유심 가격 맞나 | FAQ 가격 | `esimPrice` |
| 유심 개통 안됨 | FAQ 개통 문의 | 제휴사 CS |

## 갭 (아직 별도 FAQ 없음 · 가이드·facts로 커버)

| 후보 질문 | 현재 커버 | 다음 액션 |
| --- | --- | --- |
| 에어픽 수수료 / 중개 수수료 | facts·약관 (공개 FAQ 약함) | 필요 시 FAQ 1문항 추가 |
| 인천공항 공식 vs 주차대행 | facts 교정표 · 가이드 | 유지 |
| 알림톡 수신 / 수신거부 | 카카오·통신 설정 (앱외) | CS 스크립트만 55 문서 |

## 운영

1. 새 PAA가 GSC·시크릿 검색에 나타나면 이 표에 한 줄 추가.  
2. 답이 바뀌면 `officialAnswers` → FAQ HTML·JSON-LD·앱 Support → 배포.  
3. H2·질문 문구에 「에어픽」을 넣어 브랜드 쿼리와 꼬이지 않게 한다.
