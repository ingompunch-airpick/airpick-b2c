# Firestore 규칙 정본

**프로젝트:** `airpick-reservation` (B2B · B2C · 홈페이지 예약 공유)  
**정본:** B2B 저장소 `airpick2-b-to-b/firestore.rules` · `firestore.indexes.json` 하나뿐입니다.  
B2C 저장소에는 규칙 파일이 없고, `firebase.json`도 규칙·색인을 배포하지 않습니다.  
프로덕션 반영: B2B에서 `firebase deploy --only firestore --project airpick-reservation`

## 배포 원칙 (중요)

1. B2C에 필요한 규칙(회원, 포인트, 후기 등)도 B2B `firestore.rules`에 넣고 B2B에서 배포합니다.
2. B2C에 규칙 파일을 다시 만들지 않습니다. 나중에 배포한 쪽이 다른 쪽 보호를 지웁니다.
3. Functions·Storage rules도 **B2B에서만** 배포합니다.  
   → 소유권·라이브 함수 목록: [`docs/FIREBASE_DEPLOY_OWNERSHIP.md`](./FIREBASE_DEPLOY_OWNERSHIP.md)  
   → 통합 전까지 Functions **전체** 배포 금지 (`docs/LAUNCH_CHECKLIST.md`)

## 권한 모델 (요약)

| 컬렉션 | 클라이언트 | Cloud Functions (Admin SDK) |
|--------|------------|------------------------------|
| `companies` create/delete | **불가** | `adminUpsertCompany` / `adminDeleteCompany` |
| `companies` HQ 프로필 (핀·보험·사진·password·status 등) | **불가** | `adminUpsertCompany` / `adminSetCompanyStatus` |
| `companies/.../secrets` (로그인 비번) | **불가** | Admin SDK만 (`verifyPartnerLogin` 검증) |
| `companies` 운영 필드 (요금·직원·마감·isOpen 등) | 로그인 후 update 허용 | — |
| `system_settings` / `parking_lots` write | **불가** | 필요 시 Functions |
| `reviews` write | **불가** | Functions만 |
| `reservations` | 로그인 + 필드 검증 | 보안 필드·삭제는 본사/Functions |

## 카카오 회원 `members/{uid}`

B2C 가입은 카카오만 받는다. 문서 ID는 Firebase Auth uid다. 손님은 자기 문서만 읽고 쓴다. 로그인 공급자는 `oidc.kakao`여야 한다. 규칙은 B2B `firestore.rules`의 `members` 블록이다.

## 아직 안 넣은 것 (다음 단계)

- `.env` 본사 비밀번호 로그인 제거 → **완료** (Gate Firebase 이메일 로그인)
- Firebase Custom Claims `companyId` 로 가맹점 update 범위 제한

---

## 반영 후 스모크 테스트

- [ ] 가맹점 마스터에서 요금 저장 → 성공
- [ ] 가맹점이 브라우저에서 companies의 `indoorParkingAddress` / `password` / `status`를 직접 바꾸려 하면 → 실패
- [ ] 본사 AdminDashboard에서 주소·사진·보험 저장 (Callable) → 성공
- [ ] 본사에서 업체 생성·삭제·상태 토글 (Callable) → 성공
- [ ] B2C에서 예약 생성 → 성공
- [ ] B2C/B2B가 `reservationPassword` / `createdBy`를 클라이언트로 바꾸려 하면 → 실패
- [ ] MY에서 published 후기 목록 조회 → 성공
- [ ] 예약 문서 클라이언트 삭제 시도(비본사) → 실패
