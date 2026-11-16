# Plan: 홈 지난달 예약 1위 메리트

> research: `docs/work/home-winner-merit-research.md`  
> **이 파일이 승인되기 전에는 코드를 쓰지 않는다.**

## 목표

홈 카드에서 와와에 붙어 있는 고정 「후기 많은」을 없앤다.  
지난달 입고가 가장 많았던 입점 업체에게 **칩 하나 + 기본 정렬 맨 위**를 준다.  
후기는 지난달 데이터가 없거나 입고 수가 동점일 때만 쓴다.

## 하지 않음

- 와와(또는 특정 업체)만 배지 제외하는 하드코딩
- 손님 화면에 예약 건수·후기 건수·매출을 새로 쓰기
- `companyMonthSnapshots` 공개 읽기 (매출 필드)
- 「추천순」 라벨
- 입점 수수료 할인 등 정산 메리트
- 이번 달 실시간 예약 집계 (B2C가 reservations를 훑지 않음)
- Functions·rules를 이 레포에서 배포

## 화면·계정 범위

- [x] 비로그인
- [x] 카카오 로그인
- [ ] 비회원 조회
- 홈 이용 가능 업체 카드만. 자세히 시트·예약 모달 칩은 그대로.

## 데이터

- [ ] UI·카피만 (localStorage / 기존 필드)
- [x] Firestore 읽기만 (B2C: 공개 하이라이트 문서 + 기존 `reviewSummaries`)
- [x] Firestore 쓰기 (B2B Functions): `homeHighlights/latest`
- [x] B2B Functions / rules 변경 필요 → **이 레포에서 안 함. B2B에서 구현·배포**

### 공개 문서 `homeHighlights/latest`

Functions가 `freezePastHqMonths`로 지난달 `companyMonthSnapshots`를 쓴 뒤, 같은 작업에서 승자만 기록한다.

| 필드 | 값 |
|------|----|
| `month` | `YYYY-MM` (지난달) |
| `companyId` | 그달 `admitted`가 가장 큰 입점 업체 ID |
| `metric` | `'admitted'` |
| `updatedAt` | ISO |

건수·매출·2위 목록은 넣지 않는다. 동점이면 문서를 안 쓰거나 `companyId`를 비운다 (배지 없음).

규칙 (B2B): `homeHighlights/{id}` `id == 'latest'` 만 **읽기 공개**, 쓰기는 Functions만.

B2C는 이 문서 하나와 기존 후기 요약만 읽는다.

## 변경 체크리스트

### B2B (`airpick2-b-to-b`) — 별도, 이 레포에서 배포하지 않음

1. `freezePastHqMonths` 성공 후 `homeHighlights/latest` 갱신. 후보: 스냅샷에 `admitted > 0` 인 업체. 최댓값 1곳만.
2. `firestore.rules`에 공개 읽기 추가.
3. 배포는 사용자가 B2B에서 시킬 때만.

### B2C

4. `homeHighlights/latest`를 읽는 작은 loader. 문서 없거나 `month`가 지난달이 아니면 승자 없음.
5. `productBadge`에서 「후기 많은」 삭제.
6. 지금 목록의 비만차 업체 중 `companyId`가 승자면 칩 **「지난달 예약 1위」**. 목록에 없으면 칩 없음.
7. 승자 문서가 없을 때만 기존 `mostReviewedId`로 칩 **「후기 많은」** (동점이면 없음). 누적 후기 1위가 와와여도, 지난달 승자가 있으면 후기 칩은 안 붙는다.
8. 기본 정렬(`후기 많은 순` 탭): 승자가 목록에 있으면 **맨 위**, 그다음 후기 수 → 가격. 탭 라벨은 「후기 많은 순」 유지 (가짜 추천순 안 씀). 「최저가」 탭은 가격순 유지, 칩만 동일 규칙.
9. `tsc --noEmit`

## 카피·숫자 (지어내지 말 것)

| 위치 | 문구 또는 규칙 |
|------|----------------|
| 지난달 승자 칩 | `지난달 예약 1위` |
| 폴백 칩 | `후기 많은` (지난달 문서 없을 때만) |
| 최저가 칩 | 지금과 같음. 승자 칩이 있으면 최저가 칩은 그 카드에 안 겹침 (지금처럼 배지 하나) |
| 건수 | 칩·본문에 숫자 없음 |

## 검증

- [ ] 와와가 지난달 1위가 아니면 와와 카드에 「후기 많은」이 안 붙는다
- [ ] 지난달 1위가 현재 목록에 있으면 그 카드만 「지난달 예약 1위」, 기본 정렬 맨 위
- [ ] 하이라이트 문서 없음 → 지금처럼 후기 최다 1곳에만 「후기 많은」
- [ ] 동점(입고 또는 후기) → 그 종류 칩 없음
- [ ] 손님 네트워크에 `companyMonthSnapshots` / `revenue` 요청이 없음
- [ ] `./node_modules/.bin/tsc --noEmit`
- [ ] localhost:5173 홈 카드 (와와·다른 업체, 실내/야외)

## 구현 지시 (승인 후 붙여넣기)

```
plan.md 대로만 구현해.
plan에 없는 리팩터·부가 기능 금지.
한 단계 끝날 때마다 tsc --noEmit.
커밋·브랜치·배포는 내가 말할 때까지 하지 마.
main만 사용.
B2B Functions·rules는 이 레포에서 배포하지 마.
```

## 메모 (사람이 적음)

<!-- 잘못된 가정, 도메인 제약, 수정 요청을 여기 또는 인라인으로 -->
