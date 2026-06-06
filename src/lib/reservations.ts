import { signInAnonymously } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import type { BookingSearch } from '../types';

export interface BookingForm {
  userName: string;
  phone: string;
  carModel: string;
  carNumber: string;
}

export function createReservationId(): string {
  return `res_${Date.now()}`;
}

export async function ensureAnonymousAuth(): Promise<void> {
  if (auth.currentUser) return;
  await signInAnonymously(auth);
}

export async function submitReservation(
  companyId: string,
  companyName: string,
  search: BookingSearch,
  form: BookingForm,
  totalPrice: number
): Promise<string> {
  await ensureAnonymousAuth();
  const id = createReservationId();
  const now = new Date().toISOString();

  await setDoc(doc(db, 'reservations', id), {
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
    arrivalTerminal: search.terminal,
    totalPrice,
    status: 'pending',
    createdAt: now,
    createdBy: 'airpick-b2c',
    paymentMethod: 'unpaid',
    isIndoor: search.isIndoor,
    scratchPhotos: { synced: false },
  });

  return id;
}
