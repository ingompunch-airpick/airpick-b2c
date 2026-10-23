const KEY = 'airpick_member_v1';
const EVENT = 'airpick-member';

export const MEMBER_DISCOUNT_WON = 5000;

/** 가입 후 첫 예약 한 장. 이미 예약한 계정에는 다시 주지 않는다. */
export function hasSignupCoupon(member: MemberSession | null | undefined): boolean {
  if (!member?.uid || member.provider !== 'kakao') return false;
  if (member.signupCouponUsed) return false;
  return member.reservationIds.length === 0;
}
export const MEMBER_PLACEHOLDER_NAME = '카카오 회원';

export interface MemberSession {
  /** 예약자명. 카카오 닉네임은 넣지 않는다. */
  name: string;
  phone: string;
  /** 차량 모델. 다음 예약에 그대로 채운다. */
  carModel?: string;
  carNumber: string;
  reservationIds: string[];
  provider?: 'kakao';
  uid?: string;
  createdAt?: string;
  /** 행사·혜택 안내(문자·카카오톡) 선택 동의 */
  marketingOptIn?: boolean;
  /** 카카오 닉네임. 화면 표시용 */
  nickname?: string;
  /** 카카오 프로필 사진 */
  photoUrl?: string;
  /** 내 예약에서 자주 쓰는 정보를 저장했는지 */
  frequentSaved?: boolean;
  /** 가입 쿠폰을 이미 썼는지 */
  signupCouponUsed?: boolean;
}

export function isSavedBookerName(name: string | undefined | null): boolean {
  const stored = (name ?? '').trim();
  return /[0-9A-Za-z가-힣]/.test(stored) && stored !== MEMBER_PLACEHOLDER_NAME;
}

/** 카카오가 준 표시 이름. 마침표만 있어도 그대로 쓴다. */
export function usableKakaoNickname(name: string | undefined | null): string {
  const stored = (name ?? '').trim();
  if (!stored || stored === MEMBER_PLACEHOLDER_NAME) return '';
  return stored;
}

export function memberHasFrequentInfo(member: MemberSession | null | undefined): boolean {
  if (!member) return false;
  if (member.frequentSaved === true) return true;
  if (member.frequentSaved === false) return false;
  const phoneOk = member.phone.replace(/\D/g, '').length >= 10;
  const carOk = Boolean(member.carNumber.trim());
  return isSavedBookerName(member.name) && (phoneOk || carOk);
}

export function frequentInfoSummary(member: MemberSession): string {
  const name = isSavedBookerName(member.name) ? member.name.trim() : '';
  const car = member.carNumber.trim();
  const line = [name, car].filter(Boolean).join(' · ');
  return line || member.phone.trim();
}

function httpPhoto(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const url = value.trim();
  return /^https?:\/\//i.test(url) ? url : undefined;
}

function parse(raw: string | null): MemberSession | null {
  if (!raw) return null;
  try {
    const data = JSON.parse(raw) as MemberSession;
    const kakaoWithoutPhone = data.provider === 'kakao' && Boolean(data.uid);
    if (!data?.name || (!data.phone && !kakaoWithoutPhone)) return null;
    const nickname = usableKakaoNickname(typeof data.nickname === 'string' ? data.nickname : '');
    return {
      name: String(data.name),
      phone: String(data.phone),
      carModel: typeof data.carModel === 'string' ? data.carModel : '',
      carNumber: String(data.carNumber ?? ''),
      reservationIds: Array.isArray(data.reservationIds) ? data.reservationIds.map(String) : [],
      provider: data.provider === 'kakao' ? 'kakao' : undefined,
      uid: data.uid ? String(data.uid) : undefined,
      createdAt: data.createdAt ? String(data.createdAt) : undefined,
      marketingOptIn: data.marketingOptIn === true,
      nickname: nickname || undefined,
      photoUrl: httpPhoto(data.photoUrl),
      frequentSaved:
        data.frequentSaved === true ? true : data.frequentSaved === false ? false : undefined,
      signupCouponUsed: data.signupCouponUsed === true ? true : undefined,
    };
  } catch {
    return null;
  }
}

export function readMember(): MemberSession | null {
  try {
    return parse(localStorage.getItem(KEY));
  } catch {
    return null;
  }
}

export function saveMember(next: MemberSession): void {
  localStorage.setItem(KEY, JSON.stringify(next));
  window.dispatchEvent(new Event(EVENT));
}

export function rememberMemberReservation(id: string, carNumber: string): MemberSession | null {
  const current = readMember();
  if (!current) return null;
  const reservationIds = [id, ...current.reservationIds.filter((item) => item !== id)].slice(0, 20);
  const next = { ...current, carNumber: carNumber || current.carNumber, reservationIds };
  saveMember(next);
  return next;
}

export function clearMember(): void {
  localStorage.removeItem(KEY);
  window.dispatchEvent(new Event(EVENT));
}

export function subscribeMember(onChange: () => void): () => void {
  const handler = () => onChange();
  window.addEventListener(EVENT, handler);
  window.addEventListener('storage', handler);
  return () => {
    window.removeEventListener(EVENT, handler);
    window.removeEventListener('storage', handler);
  };
}
