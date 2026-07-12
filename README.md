# 에어픽 B2C (airpick-b2c)

고객용 인천공항 발렛 **업체 비교·예약** 웹/PWA.

---

## 에어픽 전체 구조 (B2B · B2C · 홈페이지)

에어픽은 **플랫폼 본사**이고, 와와·가유 등은 **제휴 업체**입니다. 코드는 repo별로 나뉘지만 **DB는 하나**입니다.

| 구분 | 폴더 / repo | 사용자 | 역할 | 로컬 포트 |
|------|-------------|--------|------|-----------|
| **B2C (이 프로젝트)** | `airpick-b2c` | 일반 고객 | 업체 비교·가격·예약·(예정) 조회 | `5173` |
| **B2B** | `airpick2-b-to-b` | 기사·업체 관리자 | 입출고·현장 접수·통계·제휴사 등록 | `3000` |
| **와와 홈페이지** | 별도 repo (`wawavalet.com`) | 와와 고객 | 예약·조회 (점차 B2C로 통합 예정) | — |

**공통 백엔드:** Firebase 프로젝트 `airpick-reservation`

### Firestore · Storage 규칙

- `firestore.rules`는 **B2B(`airpick2-b-to-b`)와 동일**해야 합니다.
- **rules 배포는 B2B에서만** 하세요. B2C에서 `firebase deploy --only firestore` 하면 잠금이 풀리거나 어긋날 수 있습니다.
- 동기화: B2B `firestore.rules`를 이 repo로 복사한 뒤 커밋.


```
                    ┌─────────────────────┐
                    │  Firebase           │
                    │  airpick-reservation│
                    └──────────┬──────────┘
           ┌───────────────────┼───────────────────┐
           ▼                   ▼                   ▼
    companies/{id}      reservations/{id}    (Storage 등)
    업체·요금·마감        예약·상태·결제
           ▲                   ▲                   ▲
           │                   │                   │
    B2B 제휴업체 등록    B2C / 홈 / B2B 현장접수
                         B2B에서 상태 변경
```

### 데이터 흐름

1. **제휴 업체 등록 (B2B)**  
   슈퍼관리자 → `② 제휴업체 관리` 또는 관리 대시보드  
   → Firestore `companies/{업체id}` (와와는 `companies/wawa`)

2. **고객 예약 (B2C)**  
   날짜·터미널 선택 → 업체 가격 비교 → 예약 접수  
   → Firestore `reservations/{id}` (`companyId`, `createdBy: 'airpick-b2c'`)

3. **기사 처리 (B2B)**  
   같은 `reservations` 문서를 `onSnapshot`으로 수신  
   → **입고예정** 탭에 표시 → 입고·출고 상태 변경

4. **요금 계산**  
   B2C `src/utils/pricing.ts` ↔ B2B 요금 로직과 동일 규칙  
   → `companies` 문서의 실내/실외·야간·T2 할증 필드 사용

### 이 repo에서 하지 않는 것

- 기사 타임라인·입출고 버튼 → **B2B** (`airpick2-b-to-b`)
- 제휴사 직원·요금 마스터 설정 → **B2B**
- 와와 전용 홈페이지 UI → **wawavalet.com** (별도)

### 관련 문서 (B2B repo)

- `airpick2-b-to-b/docs/HOMEPAGE_FIREBASE_SYNC.md` — 홈페이지·B2B·B2C 공통 Firestore 규칙

---

## 실행 (Windows)

```powershell
cd "C:\Users\tonad\OneDrive\문서\GitHub\airpick-b2c"
npm.cmd install
npm.cmd run dev
```

브라우저: http://localhost:5173

B2B와 동시 실행 가능 (B2B는 http://localhost:3000).

## Firestore 컬렉션

| 컬렉션 | 설명 |
|--------|------|
| `companies` | 제휴 업체 목록·요금 (**B2B에서 등록**, B2C는 읽기) |
| `reservations` | 고객 예약 (**B2C·홈·B2B 현장**에서 생성, B2B에서 상태 변경) |

## Firebase 설정

- 프로젝트 ID: `airpick-reservation`
- 설정 파일: `firebase-applet-config.json`, `src/config/firebase.ts`
- 예약 저장 전 **익명 로그인** 필요  
  → Console → **Authentication → Sign-in method → Anonymous** 활성화

## 다음 단계

- MY 탭: 차량번호·연락처 예약 조회
- Firebase Hosting 배포 (고객용 도메인)
- 카카오 알림톡 (예약 접수 시, Cloud Functions 등)
