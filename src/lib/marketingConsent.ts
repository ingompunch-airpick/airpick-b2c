import {
  collection,
  doc,
  getDoc,
  serverTimestamp,
  writeBatch,
  type Timestamp,
} from 'firebase/firestore';
import { auth, db } from '../firebase';
import { readMember, saveMember } from './memberSession';
import { saveKakaoMember } from './members';

export const MARKETING_TEXT_VERSION = '2026-11-v1';

function tsToIso(value: unknown): string | undefined {
  if (value == null) return undefined;
  if (typeof value === 'string' && value) return value;
  if (
    typeof value === 'object' &&
    value !== null &&
    'toDate' in value &&
    typeof (value as Timestamp).toDate === 'function'
  ) {
    return (value as Timestamp).toDate().toISOString();
  }
  return undefined;
}

export type MarketingConsentSource = 'booking' | 'mypage';

export async function readMarketingConsent(uid: string): Promise<{
  optIn: boolean;
  agreedAt?: string;
  withdrawnAt?: string;
}> {
  const snap = await getDoc(doc(db, 'members', uid));
  if (!snap.exists()) {
    return { optIn: false };
  }
  const data = snap.data() as Record<string, unknown>;
  return {
    optIn: data.marketingOptIn === true,
    agreedAt: tsToIso(data.marketingAgreedAt),
    withdrawnAt: tsToIso(data.marketingWithdrawnAt),
  };
}

function syncLocalConsent(consent: {
  optIn: boolean;
  agreedAt?: string;
  withdrawnAt?: string;
}): void {
  const member = readMember();
  if (!member) return;
  saveMember({
    ...member,
    marketingOptIn: consent.optIn,
    marketingAgreedAt: consent.agreedAt,
    marketingWithdrawnAt: consent.withdrawnAt,
  });
}

/** 동의·철회를 members + consentLogs에 남긴다. 같은 값이면 쓰지 않는다. */
export async function setMarketingConsent(
  agree: boolean,
  source: MarketingConsentSource
): Promise<{ agree: boolean; at?: string }> {
  await auth.authStateReady();
  const user = auth.currentUser;
  const kakaoUid =
    user && !user.isAnonymous && user.providerData.some((item) => item.providerId === 'oidc.kakao')
      ? user.uid
      : null;
  if (!kakaoUid) {
    throw new Error('카카오 로그인이 필요합니다.');
  }

  let snap = await getDoc(doc(db, 'members', kakaoUid)).catch(() => null);
  if (!snap?.exists()) {
    const local = readMember();
    if (!local) {
      throw new Error('회원 세션이 없습니다. 다시 로그인해 주세요.');
    }
    await saveKakaoMember({ ...local, uid: local.uid || kakaoUid, provider: 'kakao' });
    snap = await getDoc(doc(db, 'members', kakaoUid));
  }

  if (!snap.exists()) {
    throw new Error('회원 문서를 만들지 못했습니다.');
  }

  const currentOptIn = (snap.data() as Record<string, unknown>).marketingOptIn === true;
  if (currentOptIn === agree) {
    const consent = await readMarketingConsent(kakaoUid);
    syncLocalConsent(consent);
    return {
      agree: consent.optIn,
      at: consent.optIn ? consent.agreedAt : consent.withdrawnAt,
    };
  }

  const memberRef = doc(db, 'members', kakaoUid);
  const logRef = doc(collection(db, 'members', kakaoUid, 'consentLogs'));
  const batch = writeBatch(db);
  const updatedAt = new Date().toISOString();

  if (agree) {
    batch.set(
      memberRef,
      {
        marketingOptIn: true,
        marketingAgreedAt: serverTimestamp(),
        marketingWithdrawnAt: null,
        marketingSource: source,
        marketingChannels: ['sms', 'kakao'],
        marketingTextVersion: MARKETING_TEXT_VERSION,
        updatedAt,
      },
      { merge: true }
    );
    batch.set(logRef, {
      action: 'agree',
      at: serverTimestamp(),
      source,
      channels: ['sms', 'kakao'],
      textVersion: MARKETING_TEXT_VERSION,
    });
  } else {
    batch.set(
      memberRef,
      {
        marketingOptIn: false,
        marketingAgreedAt: null,
        marketingWithdrawnAt: serverTimestamp(),
        marketingSource: source,
        marketingChannels: [],
        marketingTextVersion: MARKETING_TEXT_VERSION,
        updatedAt,
      },
      { merge: true }
    );
    batch.set(logRef, {
      action: 'withdraw',
      at: serverTimestamp(),
      source,
      channels: [],
      textVersion: MARKETING_TEXT_VERSION,
    });
  }

  await batch.commit();
  const consent = await readMarketingConsent(kakaoUid);
  syncLocalConsent(consent);
  return {
    agree: consent.optIn,
    at: consent.optIn ? consent.agreedAt : consent.withdrawnAt,
  };
}

/** 처리결과 안내: `에어픽 · 광고성 정보 수신 {동의/철회} · {YYYY년 M월 D일} · 처리 완료` */
export function formatMarketingResultLine(agree: boolean, atIso?: string): string {
  const when = atIso ? new Date(atIso) : new Date();
  const datePart = Number.isNaN(when.getTime())
    ? ''
    : `${when.getFullYear()}년 ${when.getMonth() + 1}월 ${when.getDate()}일`;
  return `에어픽 · 광고성 정보 수신 ${agree ? '동의' : '철회'} · ${datePart} · 처리 완료`;
}

/** 마이페이지 상태: `동의일 YYYY.MM.DD` / `받지 않음` / `철회일 YYYY.MM.DD` */
export function formatMarketingStatusLine(consent: {
  optIn: boolean;
  agreedAt?: string;
  withdrawnAt?: string;
}): string {
  if (consent.optIn) {
    if (consent.agreedAt) {
      const d = new Date(consent.agreedAt);
      if (!Number.isNaN(d.getTime())) {
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        return `동의일 ${d.getFullYear()}.${mm}.${dd}`;
      }
    }
    return '동의일';
  }
  if (consent.withdrawnAt) {
    const d = new Date(consent.withdrawnAt);
    if (!Number.isNaN(d.getTime())) {
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      return `철회일 ${d.getFullYear()}.${mm}.${dd}`;
    }
    return '철회일';
  }
  return '받지 않음';
}
