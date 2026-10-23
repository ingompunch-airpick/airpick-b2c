# B2C 작업 문서 (research → plan → 구현)

코드를 쓰기 전에 **손님 경로와 금지 규칙**을 마크다운에 고정한다.  
채팅만으로 끝내지 않는다.

## 언제 쓰나

| 크기 | 예 | 문서 |
|------|----|------|
| 작음 | 문구, 건수 제외, 한 줄 접기 | 문서 생략 가능. 방향 승인 후 바로 구현 |
| 중간 | 내 예약 타일, 홈 지난 업체 | `*-plan.md`만 |
| 큼 | 접수·로그인·포인트·조회 경로가 섞임 | `*-research.md` → `*-plan.md` |

## 순서

1. `research.template.md` 복사 → `〈이름〉-research.md` 작성·검토  
2. `plan.template.md` 복사 → `〈이름〉-plan.md` 작성  
3. 에디터에서 메모 → 「메모 반영해 plan만. 구현 금지」 반복  
4. plan 승인 후 구현 지시 블록을 붙여 구현  
5. 화면 확인. 방향이 틀리면 조금씩 고치지 말고 해당 파일 리셋 후 plan 다시

## 에이전트에게 시킬 말 (예시)

- Research: `docs/work/research.template.md`를 보고 `docs/work/foo-research.md`를 채워. 코드는 쓰지 마.  
- Plan: research를 읽고 `docs/work/foo-plan.md`를 써. 구현 금지.  
- 수정: plan 메모 반영해서 plan만 업데이트. 구현 금지.  
- 구현: plan 승인됨. plan대로만 구현. 커밋 금지.
