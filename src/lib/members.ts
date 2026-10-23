import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import type { SocialProfile } from './socialAuth';
import {
  isSavedBookerName,
  MEMBER_PLACEHOLDER_NAME,
  memberHasFrequentInfo,
  readMember,
  saveMember,
  usableKakaoNickname,
  type MemberSession,
} from './memberSession';

/** 카카오 닉네임·사진은 표시용으로만 붙인다. 예약자명은 기존에 저장한 값이나 손님이 적은 값만 남긴다. */
export function memberFromKakaoProfile(
  profile: SocialProfile,
  existing: MemberSession | null,
  booker?: { name?: string; phone?: string; carNumber?: string; carModel?: string }
): MemberSession {
  const nickname = usableKakaoNickname(profile.name) || existing?.nickname || '';
  const photoUrl = profile.photoUrl || existing?.photoUrl || '';
  const keep = Boolean(existing && memberHasFrequentInfo(existing));
  const typedName = (booker?.name ?? '').trim();
  const name = isSavedBookerName(typedName)
    ? typedName
    : keep && existing && isSavedBookerName(existing.name)
      ? existing.name.trim()
      : MEMBER_PLACEHOLDER_NAME;
  const incomingPhone = (booker?.phone ?? '').trim();
  const phone =
    incomingPhone.replace(/\D/g, '').length >= 10
      ? incomingPhone
      : keep
        ? (existing?.phone ?? '')
        : '';
  const incomingCar = (booker?.carNumber ?? '').trim();
  const carNumber = incomingCar || (keep ? (existing?.carNumber ?? '') : '');
  const incomingModel = (booker?.carModel ?? '').trim();
  const carModel = incomingModel || (keep ? (existing?.carModel ?? '') : '');
  const typedSaved = isSavedBookerName(typedName) && incomingPhone.replace(/\D/g, '').length >= 10;
  return {
    name,
    phone,
    carModel,
    carNumber,
    reservationIds: existing?.reservationIds ?? [],
    provider: 'kakao',
    uid: profile.uid || existing?.uid,
    createdAt: existing?.createdAt,
    marketingOptIn: existing?.marketingOptIn === true,
    nickname: nickname || undefined,
    photoUrl: photoUrl || undefined,
    frequentSaved: typedSaved ? true : keep ? existing?.frequentSaved !== false : false,
    signupCouponUsed: existing?.signupCouponUsed === true ? true : undefined,
  };
}

function bookerSessionFromAccount(uid: string, data: Record<string, unknown>): MemberSession | null {
  if (data.uid !== uid || data.provider !== 'kakao') return null;
  const name = typeof data.name === 'string' ? data.name : '';
  const phone = typeof data.phone === 'string' ? data.phone : '';
  const carNumber = typeof data.carNumber === 'string' ? data.carNumber : '';
  const carModel = typeof data.carModel === 'string' ? data.carModel : '';
  const hasBooker =
    isSavedBookerName(name) ||
    phone.replace(/\D/g, '').length >= 10 ||
    Boolean(carNumber.trim()) ||
    Boolean(carModel.trim());
  if (!hasBooker) return null;
  return {
    name: name || MEMBER_PLACEHOLDER_NAME,
    phone,
    carModel,
    carNumber,
    reservationIds: Array.isArray(data.reservationIds) ? data.reservationIds.map(String).slice(0, 20) : [],
    provider: 'kakao',
    uid,
    createdAt: typeof data.createdAt === 'string' ? data.createdAt : undefined,
    marketingOptIn: data.marketingOptIn === true,
    frequentSaved: true,
    signupCouponUsed: data.signupCouponUsed === true ? true : undefined,
  };
}

/** 로그아웃으로 브라우저 저장이 지워져도, 계정에 적어 둔 예약 정보를 다시 붙인다. */
export async function rememberedKakaoMember(
  uid: string,
  local: MemberSession | null
): Promise<MemberSession | null> {
  const same = local?.uid === uid ? local : null;
  if (same && memberHasFrequentInfo(same)) return same;
  const snap = await getDoc(doc(db, 'members', uid)).catch(() => null);
  const account = snap?.exists() ? bookerSessionFromAccount(uid, snap.data() as Record<string, unknown>) : null;
  if (!account) return same;
  return {
    ...account,
    nickname: same?.nickname || account.nickname,
    photoUrl: same?.photoUrl || account.photoUrl,
    reservationIds: same?.reservationIds.length ? same.reservationIds : account.reservationIds,
    marketingOptIn: same?.marketingOptIn === true || account.marketingOptIn === true,
    createdAt: account.createdAt || same?.createdAt,
    signupCouponUsed: same?.signupCouponUsed === true || account.signupCouponUsed === true ? true : undefined,
  };
}

/** 카카오 팝업으로 닉네임·사진을 받아 이 브라우저 세션에 붙인다. 예약자명은 바꾸지 않는다. */
export async function applyKakaoLogin(): Promise<MemberSession> {
  const { signInWithKakao } = await import('./socialAuth');
  const profile = await signInWithKakao();
  const base = await rememberedKakaoMember(profile.uid, readMember());
  const phone = base && base.phone.replace(/\D/g, '').length >= 10 ? base.phone : '';
  const session = memberFromKakaoProfile(profile, base, { phone });
  await saveKakaoMember(session).catch(() => undefined);
  return readMember() ?? session;
}

/** Firestore `members/{uid}` — 카카오 로그인 회원. 이 브라우저 캐시와 같이 갱신한다. */
export async function saveKakaoMember(session: MemberSession): Promise<void> {
  const now = new Date().toISOString();
  await auth.authStateReady();
  const user = auth.currentUser;
  const kakaoUid =
    user && !user.isAnonymous && user.providerData.some((item) => item.providerId === 'oidc.kakao')
      ? user.uid
      : null;

  let createdAt = session.createdAt || now;
  if (session.uid && kakaoUid === session.uid && session.phone.trim().length >= 10) {
    const snap = await getDoc(doc(db, 'members', session.uid)).catch(() => null);
    const prev = snap?.exists() ? snap.data()?.createdAt : undefined;
    if (typeof prev === 'string' && prev.length > 0 && prev.length <= 40) createdAt = prev;
  }

  const next: MemberSession = {
    ...session,
    provider: 'kakao',
    createdAt,
    reservationIds: (session.reservationIds ?? []).slice(0, 20),
  };
  saveMember(next);
  if (!next.uid) return;
  // 배포된 규칙은 전화번호 10자 미만을 거절한다. 번호는 예약할 때 저장한다.
  if (next.phone.trim().length < 10) return;
  if (kakaoUid !== next.uid) {
    throw new Error('카카오 로그인이 풀려 있습니다. 로그아웃 후 다시 로그인한 뒤 저장해 주세요.');
  }

  await setDoc(
    doc(db, 'members', next.uid),
    {
      uid: next.uid,
      name: next.name,
      phone: next.phone,
      carModel: (next.carModel ?? '').slice(0, 40),
      carNumber: next.carNumber,
      provider: 'kakao',
      reservationIds: next.reservationIds,
      marketingOptIn: next.marketingOptIn === true,
      ...(next.signupCouponUsed ? { signupCouponUsed: true } : {}),
      createdAt,
      updatedAt: now,
    },
    { merge: true }
  );
}
