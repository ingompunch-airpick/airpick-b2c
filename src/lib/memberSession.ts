const KEY = 'airpick_member_v1';
const EVENT = 'airpick-member';

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
  /** 광고성 정보 수신 동의 */
  marketingOptIn?: boolean;
  /** 지금 유효한 동의 시각(ISO). 화면 표시용 캐시 */
  marketingAgreedAt?: string;
  /** 철회 시각(ISO). 화면 표시용 캐시 */
  marketingWithdrawnAt?: string;
  /** 카카오 닉네임. 화면 표시용 */
  nickname?: string;
  /** 카카오 프로필 사진 */
  photoUrl?: string;
  /** 내 예약에서 자주 쓰는 정보를 저장했는지 */
  frequentSaved?: boolean;
  /** @deprecated 첫 예약 5천원 할인 폐지. 옛 세션 호환용으로만 읽음 */
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
      marketingAgreedAt:
        typeof data.marketingAgreedAt === 'string' && data.marketingAgreedAt
          ? data.marketingAgreedAt
          : undefined,
      marketingWithdrawnAt:
        typeof data.marketingWithdrawnAt === 'string' && data.marketingWithdrawnAt
          ? data.marketingWithdrawnAt
          : undefined,
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
