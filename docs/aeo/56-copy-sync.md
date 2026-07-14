# 56 · 앱·웹·알림톡 카피 동기

공식 짧은 답: `src/constants/officialAnswers.ts`  
앱 FAQ: `support.ts` + `esimSupport.ts` → `SupportPage`  
웹 FAQ: `public/faq/index.html` (JSON-LD + 본문 shortAnswer 선두)  
사실 정본: `public/facts/index.html`

## 지금 통일된 공개 카피

| 주제 | 공개 문장 | 위치 |
| --- | --- | --- |
| 정의 | `AIRPICK_DEFINITION` | facts, FAQ, llms, 카카오 |
| 결제 | 입점 예약 = **현장 결제** (앱 카드 없음) | FAQ, facts, 예약 UI |
| 조회 | 예약 탭 + 차량번호/연락처 + 비밀번호 4자리 | FAQ, 앱 |
| 문의 분기 | 현장·차량 → 업체 / 앱·조회 → FAQ·에어픽 CS | FAQ, 카카오 |
| 유심 | 비교만, 구매·개통은 제휴사 | FAQ, eSIM 탭 |

## 체크리스트 (문구 바꿀 때)

- [ ] `SHORT_ANSWERS` 수정
- [ ] `support.ts` / `esimSupport.ts` shortAnswer·answer
- [ ] `public/faq/index.html` 본문 + FAQPage JSON-LD (`short. 상세` 형태)
- [ ] `public/facts/` · 필요 시 `llms.txt`
- [ ] 카카오 자동응답을 `55-brand-scripts.md`와 맞췄는지 확인
- [ ] 알림톡 템플릿(B2B repo)에 「현장 결제」「예약 탭 조회」가 앱과 어긋나지 않는지 확인

## 약관 vs 마케팅

약관에 「현장결제 또는 플랫폼 결제」 등 **장래 가능성** 문구가 있어도, **현재 공개·CS·FAQ 카피는 현장 결제**로만 안내한다. 앱 카드 결제가 열리면 그때 FAQ·facts·이 문서를 같이 바꾼다.

## 알림톡

이 B2C repo에는 알림톡 발송 문구가 없다. 템플릿 수정은 발송 쪽 repo에서 하고, 위 표의 공개 문장을 기준으로 맞춘다.
