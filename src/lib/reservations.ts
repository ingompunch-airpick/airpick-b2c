import { signInAnonymously } from 'firebase/auth';
import { doc, getDoc, onSnapshot, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

const LOOKUP_API_PATH = '/api/reservation-lookup';
const CANCEL_API_PATH = '/api/reservation-cancel';
import { fetchCompanyBookingPolicy } from './companies';
import { assertHourlyCapacityAvailable } from './hourlyCapacityFirestore';
import type { BookingSearch, Reservation, ReservationLookupMode } from '../types';
import {
  bookingPolicyMessage,
  checkBookingPolicy,
} from '../utils/bookingPolicy';
import {
  getReservationCheckInPhotos,
  getReservationCheckOutPhotos,
  type ScratchPhotoSet,
} from '../utils/reservationPhotos';
import { parseInsuranceFromFirestore } from '../utils/insurance';
import { RESERVATION_CREATED_BY } from '../constants/reservationSource';
import { createReceiptToken } from '../utils/receiptToken';
import { normalizeCarNumber } from '../utils/carNumber';

export interface BookingForm {
  userName: string;
  phone: string;
  carModel: string;
  carNumber: string;
  departureAirline: string;
  departureFlight: string;
  arrivalAirline: string;
  arrivalFlight: string;
  destination: string;
  customerNotes: string;
  reservationPassword: string;
}

function normalizeReservation(id: string, data: Record<string, unknown>): Reservation {
  const scratchPhotos = data.scratchPhotos as ScratchPhotoSet | undefined;
  const images = Array.isArray(data.images) ? (data.images as string[]) : undefined;
  const rawCheckIn = Array.isArray(data.checkInPhotos) ? (data.checkInPhotos as string[]) : undefined;
  const rawCheckOut = Array.isArray(data.checkOutPhotos)
    ? (data.checkOutPhotos as string[])
    : undefined;

  const checkInPhotos = getReservationCheckInPhotos({
    checkInPhotos: rawCheckIn,
    images,
    scratchPhotos,
  });
  const checkOutPhotos = getReservationCheckOutPhotos({ checkOutPhotos: rawCheckOut });
  const insurance = parseInsuranceFromFirestore(data);

  return {
    id,
    companyId: String(data.companyId || ''),
    companyName: String(data.companyName || ''),
    userName: String(data.userName || ''),
    carNumber: String(data.carNumber || ''),
    phone: String(data.phone || ''),
    carModel: String(data.carModel || ''),
    departureDate: String(data.departureDate || ''),
    departureTime: String(data.departureTime || ''),
    arrivalDate: String(data.arrivalDate || ''),
    arrivalTime: String(data.arrivalTime || ''),
    departureTerminal: String(data.departureTerminal || 'T1'),
    arrivalTerminal: data.arrivalTerminal ? String(data.arrivalTerminal) : undefined,
    totalPrice: Number(data.totalPrice) || 0,
    status: String(data.status || 'pending'),
    isIndoor: data.isIndoor !== false,
    createdAt: String(data.createdAt || ''),
    paymentMethod: data.paymentMethod ? String(data.paymentMethod) : undefined,
    parkingLocation: data.parkingLocation
      ? String(data.parkingLocation)
      : undefined,
    parkingLocationUrl: data.parkingLocationUrl ? String(data.parkingLocationUrl) : undefined,
    parkingSpace: data.parkingSpace ? String(data.parkingSpace) : undefined,
    images,
    insurance,
    insuranceProvider: insurance?.provider ?? (data.insuranceProvider ? String(data.insuranceProvider) : undefined),
    insuranceLimit:
      insurance?.coverageLimitWon ??
      (data.insuranceLimit ? Number(data.insuranceLimit) : undefined),
    checkInPhotos: checkInPhotos.length ? checkInPhotos : undefined,
    checkOutPhotos: checkOutPhotos.length ? checkOutPhotos : undefined,
    scratchPhotos,
    departureAirline: data.departureAirline ? String(data.departureAirline) : undefined,
    departureFlight: data.departureFlight ? String(data.departureFlight) : undefined,
    arrivalAirline: data.arrivalAirline ? String(data.arrivalAirline) : undefined,
    arrivalFlight: data.arrivalFlight ? String(data.arrivalFlight) : undefined,
    destination: data.destination ? String(data.destination) : undefined,
    customerNotes: data.customerNotes ? String(data.customerNotes) : undefined,
    createdBy: data.createdBy ? String(data.createdBy) : undefined,
    faceToFace: data.faceToFace === true,
    valetFee: typeof data.valetFee === 'number' ? data.valetFee : undefined,
    hasReview: data.hasReview === true,
  };
}

export function createReservationId(): string {
  return `res_${Date.now()}`;
}

export async function ensureAnonymousAuth(): Promise<void> {
  if (auth.currentUser) return;
  await signInAnonymously(auth);
}

export async function assertBookingAllowed(
  companyId: string,
  departureDate: string,
  arrivalDate: string
): Promise<void> {
  const policy = await fetchCompanyBookingPolicy(companyId);
  if (!policy) {
    throw new Error('업체 정보를 찾을 수 없습니다.');
  }
  const check = checkBookingPolicy(
    departureDate,
    arrivalDate,
    policy.isOpen,
    policy.blockedDates,
    policy.sameDayBookingBlocked
  );
  if (!check.allowed) {
    throw new Error(bookingPolicyMessage(check, departureDate, arrivalDate));
  }
}

export async function fetchReservationById(id: string): Promise<Reservation | null> {
  await ensureAnonymousAuth();
  const snap = await getDoc(doc(db, 'reservations', id));
  if (!snap.exists()) return null;
  return normalizeReservation(snap.id, snap.data() as Record<string, unknown>);
}

/** B2B 상태·사진 변경을 MY 화면에 실시간 반영 */
export function subscribeReservation(
  id: string,
  onData: (reservation: Reservation | null) => void
): () => void {
  return onSnapshot(
    doc(db, 'reservations', id),
    (snap) => {
      if (!snap.exists()) {
        onData(null);
        return;
      }
      onData(normalizeReservation(snap.id, snap.data() as Record<string, unknown>));
    },
    (err) => {
      console.warn('subscribeReservation failed:', err);
    }
  );
}

/**
 * 예약 조회 — 서버(Cloud Function)에서 비밀번호를 검증하고
 * 민감 필드를 제거한 데이터만 반환한다. 비번이 틀리면 빈 배열이 온다.
 */
export async function lookupReservations(
  mode: ReservationLookupMode,
  value: string,
  password: string
): Promise<Reservation[]> {
  const trimmed = value.trim();
  const pw = password.trim();
  if (!trimmed || !/^\d{4}$/.test(pw)) return [];

  const res = await fetch(LOOKUP_API_PATH, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mode, value: trimmed, password: pw }),
  });
  if (!res.ok) return [];

  const json = (await res.json()) as {
    reservations?: Array<{ id: string; data: Record<string, unknown> }>;
  };
  return (json.reservations ?? [])
    .map((r) => normalizeReservation(r.id, r.data))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/**
 * 고객 셀프 취소 — 서버(Cloud Function)에서 비밀번호를 검증한 뒤
 * status: cancelled 로 변경한다.
 */
export async function cancelReservation(id: string, password: string): Promise<void> {
  const pw = password.trim();
  if (!/^\d{4}$/.test(pw)) {
    throw new Error('예약 비밀번호 4자리를 확인해 주세요.');
  }

  const res = await fetch(CANCEL_API_PATH, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, password: pw }),
  });
  if (res.ok) return;

  let error = '';
  try {
    error = ((await res.json()) as { error?: string }).error ?? '';
  } catch {
    error = '';
  }
  switch (error) {
    case 'invalid_password':
      throw new Error('예약 비밀번호가 일치하지 않습니다.');
    case 'already_cancelled':
      throw new Error('이미 취소된 예약입니다.');
    case 'not_found':
      throw new Error('예약을 찾을 수 없습니다.');
    default:
      throw new Error('예약 취소에 실패했습니다. 잠시 후 다시 시도해 주세요.');
  }
}

export async function submitReservation(
  companyId: string,
  companyName: string,
  search: BookingSearch,
  form: BookingForm,
  totalPrice: number,
  /** 대면 입고가 실제 적용된 경우에만 전달 (업체 미지원 시 undefined) */
  faceToFace?: { valetFee: number }
): Promise<string> {
  await ensureAnonymousAuth();
  await assertBookingAllowed(companyId, search.departureDate, search.arrivalDate);
  await assertHourlyCapacityAvailable(
    companyId,
    search.departureDate,
    search.departureTime
  );

  const id = createReservationId();
  const now = new Date().toISOString();

  const payload: Record<string, unknown> = {
    userId: auth.currentUser?.uid || 'guest',
    companyId,
    companyName,
    userName: form.userName.trim(),
    carModel: form.carModel.trim(),
    carNumber: normalizeCarNumber(form.carNumber),
    phone: form.phone.trim(),
    departureDate: search.departureDate,
    departureTime: search.departureTime,
    departureTerminal: search.terminal,
    arrivalDate: search.arrivalDate,
    arrivalTime: search.arrivalTime,
    arrivalTerminal: search.arrivalTerminal ?? search.terminal,
    totalPrice,
    status: 'pending',
    createdAt: now,
    createdBy: RESERVATION_CREATED_BY.AIRPICK_B2C,
    receiptToken: createReceiptToken(),
    paymentMethod: 'unpaid',
    isIndoor: search.isIndoor,
    scratchPhotos: { synced: false },
    departureFlight: form.departureFlight.trim(),
    arrivalFlight: form.arrivalFlight.trim(),
  };

  const departureAirline = form.departureAirline.trim();
  const arrivalAirline = form.arrivalAirline.trim();
  const destination = form.destination.trim();
  const customerNotes = form.customerNotes.trim();

  if (departureAirline) payload.departureAirline = departureAirline;
  if (arrivalAirline) payload.arrivalAirline = arrivalAirline;
  if (destination) payload.destination = destination;
  if (customerNotes) payload.customerNotes = customerNotes;
  payload.reservationPassword = form.reservationPassword.trim();

  /** 대면 입고 요청 — B2B 기사 앱에서 대면 인계 여부·발렛비 표시 */
  if (faceToFace) {
    payload.faceToFace = true;
    payload.valetFee = faceToFace.valetFee;
  }

  await setDoc(doc(db, 'reservations', id), payload);

  return id;
}
