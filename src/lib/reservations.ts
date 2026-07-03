import { signInAnonymously } from 'firebase/auth';
import { collection, doc, getDoc, getDocs, onSnapshot, query, setDoc, where } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { fetchCompanyBookingPolicy } from './companies';
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
  };
}

function normalizeLookupValue(mode: ReservationLookupMode, value: string): string {
  const trimmed = value.trim();
  if (mode === 'phone') return trimmed.replace(/\D/g, '');
  return trimmed.replace(/\s/g, '');
}

function matchesLookup(mode: ReservationLookupMode, reservation: Reservation, value: string): boolean {
  const normalized = normalizeLookupValue(mode, value);
  if (!normalized) return false;
  const target =
    mode === 'phone'
      ? reservation.phone.replace(/\D/g, '')
      : reservation.carNumber.replace(/\s/g, '');
  return target === normalized;
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
    policy.blockedDates
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

type RawReservationDoc = { id: string; data: Record<string, unknown> };

function reservationPasswordMatches(data: Record<string, unknown>, password: string): boolean {
  const stored = String(data.reservationPassword ?? '').trim();
  return stored !== '' && stored === password;
}

export async function lookupReservations(
  mode: ReservationLookupMode,
  value: string,
  password: string
): Promise<Reservation[]> {
  await ensureAnonymousAuth();
  const field = mode === 'carNumber' ? 'carNumber' : 'phone';
  const trimmed = value.trim();
  const pw = password.trim();
  if (!trimmed || !/^\d{4}$/.test(pw)) return [];

  const runQuery = async (needle: string): Promise<RawReservationDoc[]> => {
    const snap = await getDocs(
      query(collection(db, 'reservations'), where(field, '==', needle))
    );
    return snap.docs.map((d) => ({ id: d.id, data: d.data() as Record<string, unknown> }));
  };

  let docs = await runQuery(trimmed);

  if (docs.length === 0 && mode === 'phone') {
    docs = await runQuery(trimmed.replace(/\D/g, ''));
  }

  if (docs.length === 0 && mode === 'carNumber') {
    docs = await runQuery(trimmed.replace(/\s/g, ''));
  }

  return docs
    .filter((d) => reservationPasswordMatches(d.data, pw))
    .map((d) => normalizeReservation(d.id, d.data))
    .filter((r) => matchesLookup(mode, r, value))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function submitReservation(
  companyId: string,
  companyName: string,
  search: BookingSearch,
  form: BookingForm,
  totalPrice: number
): Promise<string> {
  await ensureAnonymousAuth();
  await assertBookingAllowed(companyId, search.departureDate, search.arrivalDate);

  const id = createReservationId();
  const now = new Date().toISOString();

  const payload: Record<string, unknown> = {
    userId: auth.currentUser?.uid || 'guest',
    companyId,
    companyName,
    userName: form.userName.trim(),
    carModel: form.carModel.trim(),
    carNumber: form.carNumber.trim(),
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
    notifyOnCreate: true,
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

  await setDoc(doc(db, 'reservations', id), payload);

  return id;
}
