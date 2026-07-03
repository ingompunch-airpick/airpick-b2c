/** Firestore reservations.createdBy — 알림톡·분석 공통 */
export const RESERVATION_CREATED_BY = {
  AIRPICK_B2C: 'airpick-b2c',
  /** 제휴사 자체 홈페이지 (와와 등) */
  HOMEPAGE: 'homepage',
  /** B2B 현장·관리자 접수 */
  B2B: 'b2b',
} as const;

export type ReservationCreatedBy =
  (typeof RESERVATION_CREATED_BY)[keyof typeof RESERVATION_CREATED_BY];
