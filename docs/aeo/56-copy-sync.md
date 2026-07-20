# 56 · 앱·웹·알림톡 카피 동기

공식 짧은 답: `src/constants/officialAnswers.ts`  
앱 FAQ: `support.ts` + `esimSupport.ts` → `SupportPage`  
웹 FAQ: `public/faq/index.html` (JSON-LD + 본문 shortAnswer 선두)  
사실 정본: `public/facts/index.html`  
메뉴·허브 카피: `src/constants/marketing.ts`

## 지금 통일된 공개 카피

| 주제 | 공개 문장 | 위치 |
| --- | --- | --- |
| 정의 | `AIRPICK_DEFINITION` | facts, FAQ, llms, 카카오, about |
| 출국시간 | 홈 계산기 · 혼잡·대기 **여유 계획** | FAQ leaveBy*, 홈, llms |
| 결제 | 입점 예약 = **현장 결제** (앱 카드 없음) | FAQ, facts, 예약 UI |
| 조회 | 예약 탭 + 차량번호/연락처 + 비밀번호 4자리 | FAQ, 앱 |
| 문의 분기 | 현장·차량 → 업체 / 앱·조회 → FAQ·에어픽 CS | FAQ, 카카오 |
| 이심 | 비교만, 구매·개통은 제휴사 · 메인 키워드 **이심(eSIM)** | FAQ, /esim, 탭 라벨 |
| 탭 라벨 | 출국시간 · 주차대행 비교 · 이심 비교 | `marketing.ts` BottomNav |

## 체크리스트 (문구 바꿀 때)

- [ ] `AIRPICK_DEFINITION` / `AIRPICK_SERVICES` (`companyLegal.ts`)
- [ ] `SHORT_ANSWERS` (`officialAnswers.ts`)
- [ ] `support.ts` / `esimSupport.ts` shortAnswer·answer
- [ ] `marketing.ts` 탭·홈·비교 H1·document title
- [ ] `public/faq/index.html` 본문 + FAQPage JSON-LD
- [ ] `public/facts/` · `public/llms.txt` · `public/about/`
- [ ] `index.html` / `parking.html` / `esim.html` 정적 메타·H1
- [ ] `npm run guides` · `npm run partners` (생성 HTML)
- [ ] 카카오 자동응답을 `55-brand-scripts.md`와 맞췄는지 확인
- [ ] 알림톡 템플릿(B2B repo)에 「현장 결제」「예약 탭 조회」가 앱과 어긋나지 않는지 확인
- [ ] `docs/aeo/51-paa-map.md` · `docs/geo/` · 채널 초안 정의 한 줄

## 약관 vs 마케팅

약관에 「현장결제 또는 플랫폼 결제」 등 **장래 가능성** 문구가 있어도, **현재 공개·CS·FAQ 카피는 현장 결제**로만 안내한다. 앱 카드 결제가 열리면 그때 FAQ·facts·이 문서를 같이 바꾼다.

## 알림톡

이 B2C repo에는 알림톡 발송 문구가 없다. 템플릿 수정은 발송 쪽 repo에서 하고, 위 표의 공개 문장을 기준으로 맞춘다.
