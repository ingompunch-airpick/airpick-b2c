/**
 * AI Studio / 제휴 홈페이지 예약 연동 예시
 *
 * 1) airlines.json — 항공사 select
 * 2) submit-homepage-reservation.mjs — payload 생성·검증·저장
 *
 * Firebase modular SDK + 익명 로그인은 홈페이지에서 먼저 초기화하세요.
 */
import { signInAnonymously } from 'firebase/auth';
import { collection, doc, setDoc } from 'firebase/firestore';
import {
  AIRPICK_SHARED_ORIGIN,
  buildHomepageReservationPayload,
  createReservationId,
  fetchAirlines,
  validateHomepageReservation,
  formatPhoneInput,
} from 'https://airpick-b2c.web.app/shared/submit-homepage-reservation.mjs';

// --- 항공사 목록 (select 채우기) ---
export async function loadAirlineOptions(origin = AIRPICK_SHARED_ORIGIN) {
  const catalog = await fetchAirlines(origin);
  return catalog.airlines;
}

// --- 예약 제출 ---
export async function submitWawaStyleReservation({
  auth,
  db,
  companyId = 'wawa',
  companyName = '와와발렛',
  form,
  search,
  totalPrice,
}) {
  await signInAnonymously(auth);

  const err = validateHomepageReservation({ form, search });
  if (err) throw new Error(err);

  const id = createReservationId();
  const payload = buildHomepageReservationPayload({
    companyId,
    companyName,
    form,
    search,
    totalPrice,
  });
  payload.userId = auth.currentUser?.uid ?? 'guest';

  await setDoc(doc(collection(db, 'reservations'), id), payload);
  return id;
}

/**
 * form 예시:
 * {
 *   userName, phone, carModel, carNumber,  // phone은 formatPhoneInput()으로 010-0000-0000
 *   departureAirline, departureFlight,
 *   arrivalAirline, arrivalFlight,
 *   reservationPassword,  // 4자리
 *   destination?, customerNotes?,
 * }
 *
 * search 예시:
 * {
 *   departureDate, departureTime, arrivalDate, arrivalTime,
 *   terminal, arrivalTerminal?, isIndoor?,
 * }
 */
