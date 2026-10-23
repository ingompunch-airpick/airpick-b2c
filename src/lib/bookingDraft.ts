import type { BookingSearch } from '../types';
import type { BookingForm } from './reservations';
import type { SocialProfile } from './socialAuth';

const KEY = 'airpick_booking_draft_v1';
const PROFILE_KEY = 'airpick_kakao_profile_v1';
const ERROR_KEY = 'airpick_kakao_error_v1';

export interface BookingDraft {
  companyId: string;
  search: BookingSearch;
  form: BookingForm;
  marketingOptIn: boolean;
  savedAt: string;
  /** 접수를 눌러 확인 화면까지 갔는지 */
  confirmed?: boolean;
  agreedPlatformTerms?: boolean;
  agreedServiceTerms?: boolean;
  agreedPrivacy?: boolean;
  agreedThirdParty?: boolean;
}

export function saveBookingDraft(draft: Omit<BookingDraft, 'savedAt'>): void {
  try {
    sessionStorage.setItem(KEY, JSON.stringify({ ...draft, savedAt: new Date().toISOString() }));
  } catch {
    /* ignore */
  }
}

export function readBookingDraft(): BookingDraft | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as BookingDraft;
    if (!data?.companyId || !data.search || !data.form) return null;
    return data;
  } catch {
    return null;
  }
}

export function clearBookingDraft(): void {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}

export function saveKakaoProfileDraft(profile: SocialProfile): void {
  try {
    sessionStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch {
    /* ignore */
  }
}

export function takeKakaoProfileDraft(): SocialProfile | null {
  try {
    const raw = sessionStorage.getItem(PROFILE_KEY);
    sessionStorage.removeItem(PROFILE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as SocialProfile;
    if (!data?.uid) return null;
    return data;
  } catch {
    return null;
  }
}

const loginErrorListeners = new Set<(message: string) => void>();

export function subscribeKakaoLoginError(listener: (message: string) => void): () => void {
  loginErrorListeners.add(listener);
  return () => loginErrorListeners.delete(listener);
}

export function saveKakaoLoginError(message: string): void {
  try {
    sessionStorage.setItem(ERROR_KEY, message);
  } catch {
    /* ignore */
  }
  loginErrorListeners.forEach((listener) => listener(message));
}

export function takeKakaoLoginError(): string | null {
  try {
    const raw = sessionStorage.getItem(ERROR_KEY);
    sessionStorage.removeItem(ERROR_KEY);
    return raw || null;
  } catch {
    return null;
  }
}
