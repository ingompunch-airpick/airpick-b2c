/** Firestore reservations — 알림톡 트리거가 읽는 필드 */
export interface ReservationRecord {
  companyId?: string;
  companyName?: string;
  userName?: string;
  phone?: string;
  carNumber?: string;
  carModel?: string;
  departureDate?: string;
  departureTime?: string;
  arrivalDate?: string;
  arrivalTime?: string;
  departureTerminal?: string;
  arrivalTerminal?: string;
  destination?: string;
  departureAirline?: string;
  departureFlight?: string;
  arrivalAirline?: string;
  arrivalFlight?: string;
  isIndoor?: boolean;
  totalPrice?: number;
  status?: string;
  createdBy?: string;
  /** false면 접수 예약 알림톡 생략 (기본 true) */
  notifyOnCreate?: boolean;
  receiptToken?: string;
  kakaoSentAt?: string;
  kakaoTemplateCode?: string;
  kakaoSendStatus?: 'sent' | 'skipped' | 'failed';
  kakaoSendError?: string;
}

export function parseReservationRecord(
  data: FirebaseFirestore.DocumentData | undefined
): ReservationRecord {
  if (!data) return {};
  return data as ReservationRecord;
}
