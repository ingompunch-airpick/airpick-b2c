# 서버 함수(Cloud Functions)는 B2B 저장소에 있습니다

에어픽.kr 이 쓰는 `/api/*` (접수증·예약 조회·취소·후기·공항 정보·입점 신청 등) 함수는
**`airpick2-b-to-b/functions`** 에서만 고치고 배포합니다.

- 2026-11-14: 이 저장소의 옛 `functions/` 복사본 삭제 (배포된 코드와 7개 파일이 달라 혼란, `submitPartnerApplication` 만 여기 있어 404였음 → B2B로 이동)
- 이 저장소 `firebase.json` 은 Hosting 만 배포합니다.
