/**
 * 에어픽 제휴 홈페이지(AI Studio 등) — Firestore 예약 저장 공용 모듈
 *
 * 사용 예 (Firebase modular SDK 이미 초기화된 페이지):
 *
 *   import { collection, doc, setDoc } from 'firebase/firestore';
 *   import {
 *     buildHomepageReservationPayload,
 *     createReservationId,
 *     validateHomepageReservation,
 *     fetchAirlines,
 *     formatPhoneInput,
 *   } from 'https://airpick-b2c.web.app/shared/submit-homepage-reservation.mjs';
 *
 *   const err = validateHomepageReservation({ form, search });
 *   if (err) throw new Error(err);
 *   const id = createReservationId();
 *   const payload = buildHomepageReservationPayload({ companyId, companyName, form, search, totalPrice });
 *   await setDoc(doc(collection(db, 'reservations'), id), payload);
 */

/** 배포 도메인 — 커스텀 도메인 연결 후 https://에어픽.kr 로 바꿔도 됨 */
export const AIRPICK_SHARED_ORIGIN = 'https://airpick-b2c.web.app';

export const CREATED_BY_HOMEPAGE = 'homepage';

export function createReceiptToken() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID().replace(/-/g, '');
  }
  return `rt${Date.now()}${Math.random().toString(36).slice(2, 14)}`;
}

export function createReservationId() {
  return `res_${Date.now()}`;
}

function trim(value) {
  return String(value ?? '').trim();
}

/** 입력 중 연락처 — 010-0000-0000 */
export function formatPhoneInput(raw) {
  const d = String(raw ?? '').replace(/\D/g, '').slice(0, 11);
  if (d.length <= 3) return d;
  if (d.length <= 7) return `${d.slice(0, 3)}-${d.slice(3)}`;
  return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}`;
}

function resolveAirlineName(airlineId, airlineName, customName) {
  if (airlineId === 'other') return trim(customName);
  return trim(airlineName) || trim(customName);
}

/**
 * @param {object} params
 * @param {string} params.companyId
 * @param {string} params.companyName
 * @param {object} params.form
 * @param {object} params.search
 * @param {number} params.totalPrice
 */
export function buildHomepageReservationPayload({
  companyId,
  companyName,
  form,
  search,
  totalPrice,
}) {
  const departureAirline = resolveAirlineName(
    form.departureAirlineId,
    form.departureAirline,
    form.departureAirlineCustom
  );
  const arrivalAirline = resolveAirlineName(
    form.arrivalAirlineId,
    form.arrivalAirline,
    form.arrivalAirlineCustom
  );

  const payload = {
    companyId: trim(companyId),
    companyName: trim(companyName),
    userName: trim(form.userName),
    phone: trim(form.phone),
    carModel: trim(form.carModel),
    carNumber: trim(form.carNumber),
    departureDate: trim(search.departureDate),
    departureTime: trim(search.departureTime),
    departureTerminal: trim(search.terminal),
    arrivalDate: trim(search.arrivalDate),
    arrivalTime: trim(search.arrivalTime),
    arrivalTerminal: trim(search.arrivalTerminal ?? search.terminal),
    departureAirline,
    departureFlight: trim(form.departureFlight).toUpperCase(),
    arrivalAirline,
    arrivalFlight: trim(form.arrivalFlight).toUpperCase(),
    reservationPassword: trim(form.reservationPassword),
    totalPrice: Math.round(Number(totalPrice) || 0),
    status: 'pending',
    createdAt: new Date().toISOString(),
    createdBy: CREATED_BY_HOMEPAGE,
    receiptToken: createReceiptToken(),
    paymentMethod: 'unpaid',
    isIndoor: search.isIndoor !== false,
    scratchPhotos: { synced: false },
  };

  const destination = trim(form.destination);
  const customerNotes = trim(form.customerNotes);
  if (destination) payload.destination = destination;
  if (customerNotes) payload.customerNotes = customerNotes;

  return payload;
}

/**
 * @param {object} params
 * @param {object} params.form
 * @param {object} params.search
 * @returns {string|null} 오류 메시지 또는 null
 */
export function validateHomepageReservation({ form, search }) {
  if (!trim(form.userName)) return '이름을 입력해 주세요.';
  if (!trim(form.phone)) return '연락처를 입력해 주세요.';
  if (!trim(form.carModel)) return '차량 모델을 입력해 주세요.';
  if (!trim(form.carNumber)) return '차량번호를 입력해 주세요.';
  if (!/^\d{4}$/.test(trim(form.reservationPassword))) {
    return '예약 비밀번호는 숫자 4자리입니다.';
  }
  if (!trim(search.departureDate) || !trim(search.arrivalDate)) {
    return '입고·출고 일정을 선택해 주세요.';
  }
  if (!trim(search.departureTime) || !trim(search.arrivalTime)) {
    return '입고·출고 시간을 선택해 주세요.';
  }
  if (!trim(search.terminal)) return '출국 터미널을 선택해 주세요.';

  const depAirline = resolveAirlineName(
    form.departureAirlineId,
    form.departureAirline,
    form.departureAirlineCustom
  );
  const arrAirline = resolveAirlineName(
    form.arrivalAirlineId,
    form.arrivalAirline,
    form.arrivalAirlineCustom
  );
  if (!depAirline) return '출국 항공사를 선택해 주세요.';
  if (!trim(form.departureFlight)) return '출국 편명을 입력해 주세요.';
  if (!arrAirline) return '입국 항공사를 선택해 주세요.';
  if (!trim(form.arrivalFlight)) return '입국 편명을 입력해 주세요.';

  return null;
}

/**
 * @param {object} firestore
 * @param {import('firebase/firestore').Firestore} firestore.db
 * @param {Function} firestore.collection
 * @param {Function} firestore.doc
 * @param {Function} firestore.setDoc
 * @param {object} params — buildHomepageReservationPayload 와 동일 + userId(선택)
 */
export async function submitHomepageReservation(firestore, params) {
  const error = validateHomepageReservation(params);
  if (error) throw new Error(error);

  const id = createReservationId();
  const payload = buildHomepageReservationPayload(params);
  if (params.userId) payload.userId = params.userId;

  const { db, collection, doc, setDoc } = firestore;
  await setDoc(doc(collection(db, 'reservations'), id), payload);
  return { id, payload };
}

export async function fetchAirlines(origin = AIRPICK_SHARED_ORIGIN) {
  const base = origin.replace(/\/$/, '');
  const res = await fetch(`${base}/shared/airlines.json`);
  if (!res.ok) throw new Error(`airlines.json load failed: ${res.status}`);
  return res.json();
}

export async function fetchReservationSchema(origin = AIRPICK_SHARED_ORIGIN) {
  const base = origin.replace(/\/$/, '');
  const res = await fetch(`${base}/shared/reservation-schema.json`);
  if (!res.ok) throw new Error(`reservation-schema.json load failed: ${res.status}`);
  return res.json();
}
