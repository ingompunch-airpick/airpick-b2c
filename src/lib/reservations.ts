import { signInAnonymously } from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { auth, db } from '../firebase';
import { fetchCompanyBookingPolicy } from './companies';
import { assertHourlyCapacityAvailable } from './hourlyCapacityFirestore';
import type { BookingSearch, Reservation, ReservationLookupMode } from '../types';
import {
  bookingPolicyMessage,
  checkBookingPolicy,
} from '../utils/bookingPolicy';
import { bookingWindowMessage, checkBookingTimes, checkBookingWindow } from '../utils/bookingWindow';
import {
  getReservationCheckInPhotos,
  getReservationCheckOutPhotos,
  type ScratchPhotoSet,
} from '../utils/reservationPhotos';
import { parseInsuranceFromFirestore } from '../utils/insurance';
import { RESERVATION_CREATED_BY } from '../constants/reservationSource';
import { acquisitionFieldsForReservation } from '../utils/acquisition';
import { createReceiptToken } from '../utils/receiptToken';
import { normalizeCarNumber, carNumberTail } from '../utils/carNumber';
import { generateBookingNo, normalizeBookingNoInput, BOOKING_NO_RE } from '../utils/bookingNo';

const LOOKUP_API_PATH = '/api/reservation-lookup';
const CANCEL_API_PATH = '/api/reservation-cancel';

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

  const bookingNoRaw = data.bookingNo ? String(data.bookingNo).trim() : '';
  return {
    id,
    bookingNo: bookingNoRaw && BOOKING_NO_RE.test(bookingNoRaw) ? bookingNoRaw : undefined,
    userId: data.userId ? String(data.userId) : undefined,
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
    listPrice:
      typeof data.listPrice === 'number' && data.listPrice > 0
        ? Math.round(data.listPrice)
        : undefined,
    signupCouponWon:
      typeof data.signupCouponWon === 'number' && data.signupCouponWon > 0
        ? Math.round(data.signupCouponWon)
        : undefined,
    pointSpentWon: Math.max(0, Math.floor(Number(data.pointSpentWon) || 0)) || undefined,
    pointSpendSettled: data.pointSpendSettled === true ? true : undefined,
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
    affiliateCode: data.affiliateCode ? String(data.affiliateCode) : undefined,
    affiliateCustomerDiscountWon:
      typeof data.affiliateCustomerDiscountWon === 'number'
        ? data.affiliateCustomerDiscountWon
        : undefined,
    affiliateReferrerCreditWon:
      typeof data.affiliateReferrerCreditWon === 'number'
        ? data.affiliateReferrerCreditWon
        : undefined,
    hasReview: data.hasReview === true,
    checkedInBy: data.checkedInBy ? String(data.checkedInBy) : undefined,
    checkedInAt: data.checkedInAt ? String(data.checkedInAt) : undefined,
    checkedOutBy: data.checkedOutBy ? String(data.checkedOutBy) : undefined,
    checkedOutAt: data.checkedOutAt ? String(data.checkedOutAt) : undefined,
    paymentStatus:
      typeof (data.payment as { status?: unknown } | undefined)?.status === 'string'
        ? String((data.payment as { status: string }).status)
        : undefined,
    paidWon:
      typeof (data.payment as { amount?: unknown } | undefined)?.amount === 'number'
        ? Number((data.payment as { amount: number }).amount)
        : undefined,
    refundWon:
      typeof (data.paymentRefund as { won?: unknown } | undefined)?.won === 'number'
        ? Number((data.paymentRefund as { won: number }).won)
        : undefined,
  };
}

/**
 * 예약 문서 ID — 시각 + 추측 불가 난수(16자).
 * 같은 밀리초 덮어쓰기와, 시각으로 남의 예약 ID를 맞히는 것을 막는다.
 */
export function createReservationId(): string {
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  const rand = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
  return `res_${Date.now()}_${rand}`;
}

/** bookingNo 중복 시 재시도. 조회 권한이 없으면 생성만 하고 통과한다. */
async function allocateBookingNo(maxAttempts = 8): Promise<string> {
  for (let i = 0; i < maxAttempts; i++) {
    const candidate = generateBookingNo();
    try {
      const snap = await getDocs(
        query(collection(db, 'reservations'), where('bookingNo', '==', candidate), limit(1))
      );
      if (snap.empty) return candidate;
    } catch {
      return candidate;
    }
  }
  return generateBookingNo();
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
  const windowCheck = checkBookingWindow(departureDate, arrivalDate);
  if (!windowCheck.allowed) {
    throw new Error(bookingWindowMessage(windowCheck));
  }
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

/**
 * 예약 문서 직접 읽기 — 이 브라우저에서 예약했거나(같은 익명 계정) 카카오로 연결된 본인만 열린다.
 * 다른 기기·브라우저면 권한이 없으므로 null (차량번호·비밀번호 조회로 연다).
 */
export async function fetchReservationById(id: string): Promise<Reservation | null> {
  await ensureAnonymousAuth();
  try {
    const snap = await getDoc(doc(db, 'reservations', id));
    if (!snap.exists()) return null;
    return normalizeReservation(snap.id, snap.data() as Record<string, unknown>);
  } catch (err) {
    if ((err as { code?: string })?.code === 'permission-denied') return null;
    throw err;
  }
}

/**
 * 출고 알림톡 후기 링크용 — 가린 정보(이름·차량번호 일부)만 받아 후기 카드를 띄운다.
 * 후기 저장은 비밀번호(또는 카카오 본인)로 서버에서 확인한다.
 */
export async function fetchReviewTarget(id: string): Promise<Reservation | null> {
  const res = await fetch(`/api/reservation-review?id=${encodeURIComponent(id)}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`review_target_${res.status}`);
  const body = (await res.json()) as { reservation?: Record<string, unknown> };
  if (!body.reservation) return null;
  return normalizeReservation(id, body.reservation);
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

/** 조회·취소 비밀번호 연속 실패(429) — 화면 공통 문구 */
export const PASSWORD_RATE_LIMIT_MESSAGE =
  '비밀번호를 여러 번 틀렸어요. 5분 뒤 다시 시도하거나, 카카오 알림톡의 접수증 보기로 확인해 주세요. 고객센터 0507-1328-5746 (09:00~18:00)';

export class PasswordRateLimitedError extends Error {
  readonly code = 'rate_limited' as const;
  constructor(message = PASSWORD_RATE_LIMIT_MESSAGE) {
    super(message);
    this.name = 'PasswordRateLimitedError';
  }
}

/**
 * 예약 조회 — 서버(Cloud Function)에서 비밀번호를 검증하고
 * 민감 필드를 제거한 데이터만 반환한다. 비번이 틀리면 빈 배열이 온다.
 * 연속 실패로 차단되면 PasswordRateLimitedError.
 */
export async function lookupReservations(
  mode: ReservationLookupMode,
  value: string,
  password: string
): Promise<Reservation[]> {
  const trimmed =
    mode === 'bookingNo' ? normalizeBookingNoInput(value) : value.trim();
  const pw = password.trim();
  if (!trimmed || !/^\d{4}$/.test(pw)) return [];
  if (mode === 'bookingNo' && !BOOKING_NO_RE.test(trimmed)) return [];

  const res = await fetch(LOOKUP_API_PATH, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mode, value: trimmed, password: pw }),
  });
  if (res.status === 429) {
    throw new PasswordRateLimitedError();
  }
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
/** 결제한 예약이면 환불 금액(원)을 돌려준다 */
export async function cancelReservation(
  id: string,
  password: string
): Promise<{ refundWon: number; refundRatio?: number }> {
  const pw = password.trim();
  if (!/^\d{4}$/.test(pw)) {
    throw new Error('예약 비밀번호 4자리를 확인해 주세요.');
  }

  const res = await fetch(CANCEL_API_PATH, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, password: pw }),
  });
  if (res.ok) {
    try {
      const out = (await res.json()) as { refundWon?: number; refundRatio?: number };
      return { refundWon: Math.max(0, Number(out.refundWon) || 0), refundRatio: out.refundRatio };
    } catch {
      return { refundWon: 0 };
    }
  }

  let error = '';
  try {
    error = ((await res.json()) as { error?: string }).error ?? '';
  } catch {
    error = '';
  }
  if (res.status === 429 || error === 'rate_limited') {
    throw new PasswordRateLimitedError();
  }
  switch (error) {
    case 'invalid_password':
      throw new Error('예약 비밀번호가 일치하지 않습니다.');
    case 'already_cancelled':
      throw new Error('이미 취소된 예약입니다.');
    case 'not_found':
      throw new Error('예약을 찾을 수 없습니다.');
    case 'cancel_deadline_passed':
      throw new Error('무료 취소 기간이 지났어요. 업체로 문의해 주세요');
    case 'not_cancellable_status':
      throw new Error('입고가 시작된 예약은 업체로 문의해 주세요');
    case 'too_late':
      throw new Error('입고 24시간 전까지만 앱에서 취소할 수 있습니다. 업체로 문의해 주세요.');
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
  /** 손님이 대면을 고른 경우. 발렛비가 0이어도 픽업지 표시를 위해 전달한다. */
  faceToFace?: { valetFee: number },
  /** 제휴 링크 스냅샷 — B2B affiliates 기준 */
  affiliate?: {
    code: string;
    customerDiscountWon: number;
    referrerCreditWon: number;
  },
  /** 행사·혜택 안내 선택 동의 */
  marketingOptIn?: boolean,
  /** 포인트 적용 전 금액에서 뺄 포인트. 서버가 잔액을 확인한 뒤 totalPrice 에서 뺀다. */
  pointSpendWon?: number,
  /** 손님이 고른 주차 상품. 비대면 추가요금이 있으면 같이 남긴다 */
  parkingProduct?: { id: string; dropFee: number },
  /** listPrice=표시 합계. signupCouponWon은 폐지된 첫 예약 할인(옛 예약만) */
  pricingMeta?: { listPrice: number; signupCouponWon?: number; payOnline?: boolean },
  /** 「에어픽을 어떻게 알게 되셨나요?」(선택) */
  heardFrom?: string
): Promise<{ id: string; bookingNo: string }> {
  await ensureAnonymousAuth();
  const timeCheck = checkBookingTimes(search);
  if (!timeCheck.ok) throw new Error(timeCheck.message);
  await assertBookingAllowed(companyId, search.departureDate, search.arrivalDate);
  await assertHourlyCapacityAvailable(
    companyId,
    search.departureDate,
    search.departureTime
  );

  const id = createReservationId();
  const bookingNo = await allocateBookingNo();
  const now = new Date().toISOString();

  const payload: Record<string, unknown> = {
    userId: auth.currentUser?.uid || 'guest',
    ...(auth.currentUser && !auth.currentUser.isAnonymous ? { memberProvider: 'kakao' } : {}),
    bookingNo,
    companyId,
    companyName,
    userName: form.userName.trim(),
    carModel: form.carModel.trim(),
    carNumber: normalizeCarNumber(form.carNumber),
    carNumberTail: carNumberTail(form.carNumber) ?? undefined,
    phone: form.phone.trim(),
    departureDate: search.departureDate,
    departureTime: search.departureTime,
    departureTerminal: search.terminal,
    arrivalDate: search.arrivalDate,
    arrivalTime: search.arrivalTime,
    arrivalTerminal: search.arrivalTerminal ?? search.terminal,
    totalPrice,
    listPrice: Math.max(
      Math.round(Number(pricingMeta?.listPrice) || 0),
      Math.round(Number(totalPrice) || 0)
    ),
    ...(pricingMeta?.signupCouponWon && pricingMeta.signupCouponWon > 0
      ? { signupCouponWon: Math.round(pricingMeta.signupCouponWon) }
      : {}),
    ...(pointSpendWon && pointSpendWon >= 5000 ? { pointSpendWon } : {}),
    status: 'pending',
    createdAt: now,
    createdBy: RESERVATION_CREATED_BY.AIRPICK_B2C,
    receiptToken: createReceiptToken(),
    paymentMethod: 'unpaid',
    // 온라인 결제로 접수 — 서버가 결제 대기(15분)로 잡고 결제 확인 뒤 확정한다
    ...(pricingMeta?.payOnline ? { paymentRequested: true } : {}),
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
    if (faceToFace.valetFee > 0) payload.valetFee = faceToFace.valetFee;
  }
  if (parkingProduct) {
    payload.parkingProductId = parkingProduct.id;
    if (parkingProduct.dropFee > 0) payload.dropFee = parkingProduct.dropFee;
  }

  if (affiliate?.code) {
    payload.affiliateCode = affiliate.code;
    payload.affiliateCustomerDiscountWon = Math.max(
      0,
      Math.round(affiliate.customerDiscountWon || 0)
    );
    payload.affiliateReferrerCreditWon = Math.max(
      0,
      Math.round(affiliate.referrerCreditWon || 0)
    );
  }

  if (marketingOptIn) payload.marketingOptIn = true;

  const heard = (heardFrom || '').trim().slice(0, 80);
  if (heard) payload.heardFrom = heard;

  Object.assign(payload, acquisitionFieldsForReservation());

  await setDoc(doc(db, 'reservations', id), payload);

  return { id, bookingNo };
}

/**
 * 예약 완료 후 heardFrom만 채움. Firestore rules: 생성자 + 기존 값 비어 있을 때만.
 */
export async function updateReservationHeardFrom(
  reservationId: string,
  heardFrom: string
): Promise<void> {
  const value = heardFrom.trim().slice(0, 80);
  if (!reservationId || !value) {
    throw new Error('유입 경로를 선택해 주세요.');
  }
  await ensureAnonymousAuth();
  await updateDoc(doc(db, 'reservations', reservationId), { heardFrom: value });
}

export { normalizeBookingNoInput, BOOKING_NO_RE };
