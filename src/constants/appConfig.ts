/**
 * 서비스·심사·인트로 공통 설정.
 * 숫자·모드는 여기서만 바꾼다 (화면·규칙 설명과 맞춤).
 */
export const APP_CONFIG = {
  /** 입고일: 오늘부터 N개월 이내 (달력) */
  maxAdvanceMonths: 6,
  /**
   * 출고 − 입고 달력 일수 상한 (≤ 90).
   * 예: 11/1 → 1/30 = 90일 차이 → 허용.
   */
  maxParkingDayDiff: 90,
  /**
   * Firestore rules 근사 — 6개월 ≈ 184일.
   * Rules: departure ≤ request.time + 이 값.
   */
  maxAdvanceDaysApprox: 184,
  /** 서비스 제공기간 고지 (결제일 기준 상한 안내) */
  serviceWindowMonths: 9,
  bookingWindowNotice:
    '예약은 출국 6개월 전부터, 한 번에 최대 90일까지 가능합니다. (서비스 제공기간: 결제일로부터 최대 9개월)',
  bookingAdvanceBlockedMessage: '예약은 출국 6개월 전부터 가능해요',
  bookingStayBlockedMessage: '한 번에 최대 90일까지 예약할 수 있어요',
  /**
   * 결제 노출. off=일반 예약만. test/live는 작업 3.
   * 채널은 포트원→토스만 (이니시스·KPN 폐기 예정).
   */
  paymentMode: 'off' as 'off' | 'test' | 'live',
  /** 인트로 상단 통계 문구 — 작업 5 */
  introStatText: '인천공항 사설 주차대행만 300곳이 넘어요. 어디에 맡기시나요?',
} as const;
