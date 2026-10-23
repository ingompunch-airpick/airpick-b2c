import {
  OAuthProvider,
  getAdditionalUserInfo,
  getRedirectResult,
  signInWithPopup,
  updateProfile,
  type User,
  type UserCredential,
} from 'firebase/auth';
import { usableKakaoNickname } from './memberSession';
import { auth } from '../firebase';

export type SocialProviderId = 'kakao';

export interface SocialProfile {
  provider: SocialProviderId;
  uid: string;
  /** 카카오 닉네임. 예약자명으로 쓰지 않는다. */
  name: string;
  phone: string;
  email: string;
  photoUrl: string;
}

const KAKAO_REDIRECT_FLAG = 'airpick_kakao_redirect_v1';
const KAKAO_PROVIDER_ID = 'oidc.kakao';

function kakaoProvider(): OAuthProvider {
  const provider = new OAuthProvider(KAKAO_PROVIDER_ID);
  // openid는 Firebase가 붙인다. 닉네임·프로필 사진만 요청한다.
  // profile, phone_number, name은 카카오 앱에 없어서 KOE205가 난다.
  provider.addScope('profile_nickname');
  provider.addScope('profile_image');
  return provider;
}

function codeOf(err: unknown): string {
  if (err && typeof err === 'object' && 'code' in err) return String((err as { code: string }).code);
  return '';
}

function textOf(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (digits.startsWith('82') && digits.length >= 11) return `0${digits.slice(2)}`;
  return digits;
}

function photoOf(value: unknown): string {
  const text = textOf(value).replace(
    /^http:\/\/((?:k|t1|img\d*)\.kakaocdn\.net|mud-kage\.kakao\.co\.kr)/i,
    'https://$1'
  );
  if (/^https?:\/\//i.test(text)) return text;
  if (value && typeof value === 'object' && 'url' in value) {
    return photoOf((value as { url: unknown }).url);
  }
  return '';
}

function firstNickname(values: unknown[]): string {
  for (const value of values) {
    const nick = usableKakaoNickname(textOf(value));
    if (nick) return nick;
  }
  return '';
}

function firstPhoto(values: unknown[]): string {
  for (const value of values) {
    const photo = photoOf(value);
    if (photo) return photo;
  }
  return '';
}

function asRecord(value: unknown): Record<string, unknown> {
  if (typeof value === 'string') {
    try {
      return asRecord(JSON.parse(value) as unknown);
    } catch {
      return {};
    }
  }
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return {};
}

function jwtPayload(token: string | undefined): Record<string, unknown> {
  if (!token) return {};
  const part = token.split('.')[1];
  if (!part) return {};
  try {
    const base = part.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base + '='.repeat((4 - (base.length % 4)) % 4);
    const binary = atob(padded);
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    return asRecord(JSON.parse(new TextDecoder().decode(bytes)) as unknown);
  } catch {
    return {};
  }
}

const NICK_KEYS = new Set(['nickname', 'profile_nickname', 'nick_name', 'preferred_username', 'screen_name', 'screenname']);
const PHOTO_KEYS = new Set([
  'picture',
  'profile_image',
  'profile_image_url',
  'thumbnail_image',
  'thumbnail_image_url',
  'photo',
  'photourl',
]);

function collectIdentity(value: unknown): { nicknames: unknown[]; photos: unknown[] } {
  const nicknames: unknown[] = [];
  const names: unknown[] = [];
  const photos: unknown[] = [];
  const walk = (node: unknown, depth: number) => {
    if (!node || depth > 5 || typeof node !== 'object') return;
    if (Array.isArray(node)) {
      node.forEach((item) => walk(item, depth + 1));
      return;
    }
    for (const [key, child] of Object.entries(node as Record<string, unknown>)) {
      const normalized = key.toLowerCase();
      const nickKey =
        NICK_KEYS.has(normalized) ||
        (normalized.includes('nickname') && !normalized.includes('agreement') && !normalized.startsWith('is_default'));
      if (nickKey) nicknames.push(child);
      else if (normalized === 'name') names.push(child);
      if (PHOTO_KEYS.has(normalized) || normalized.endsWith('_image') || normalized.endsWith('_image_url')) {
        photos.push(child);
      }
      if (child && typeof child === 'object') walk(child, depth + 1);
    }
  };
  walk(value, 0);
  return { nicknames: [...nicknames, ...names], photos };
}

function profileFromCredential(kind: SocialProviderId, cred: UserCredential): SocialProfile {
  const extra = getAdditionalUserInfo(cred);
  const profile = asRecord(extra?.profile);
  const kakaoAccount =
    profile.kakao_account && typeof profile.kakao_account === 'object'
      ? (profile.kakao_account as Record<string, unknown>)
      : null;
  const response =
    profile.response && typeof profile.response === 'object'
      ? (profile.response as Record<string, unknown>)
      : null;

  const idPayload = jwtPayload(OAuthProvider.credentialFromResult(cred)?.idToken);
  const fromProfile = collectIdentity(profile);
  const fromToken = collectIdentity(idPayload);
  const name = firstNickname([
    ...fromProfile.nicknames,
    ...fromToken.nicknames,
    cred.user.displayName,
  ]);
  const phone = normalizePhone(
    textOf(cred.user.phoneNumber) ||
      textOf(profile.phone_number) ||
      textOf(profile.mobile) ||
      textOf(kakaoAccount?.phone_number) ||
      textOf(response?.mobile)
  );
  const email =
    textOf(cred.user.email) || textOf(profile.email) || textOf(kakaoAccount?.email) || textOf(response?.email);
  const photoUrl = firstPhoto([...fromProfile.photos, ...fromToken.photos, cred.user.photoURL]);

  return { provider: kind, uid: cred.user.uid, name, phone, email, photoUrl };
}

function profileFromUser(user: User): SocialProfile {
  return {
    provider: 'kakao',
    uid: user.uid,
    name: firstNickname([user.displayName, ...user.providerData.map((item) => item.displayName)]),
    phone: normalizePhone(textOf(user.phoneNumber)),
    email: textOf(user.email),
    photoUrl: firstPhoto([user.photoURL, ...user.providerData.map((item) => item.photoURL)]),
  };
}

/** 이미 로그인된 카카오 계정에서 닉네임·사진을 다시 읽는다. 예약자명으로는 쓰지 않는다. */
export async function readSignedInKakaoIdentity(): Promise<{ nickname: string; photoUrl: string } | null> {
  await auth.authStateReady();
  const user = auth.currentUser;
  if (!isKakaoUser(user)) return null;
  let claims: Record<string, unknown> = {};
  try {
    claims = (await user.getIdTokenResult()).claims as Record<string, unknown>;
  } catch {
    claims = {};
  }
  const nickname = firstNickname([
    claims.nickname,
    claims.name,
    user.displayName,
    ...user.providerData.map((item) => item.displayName),
  ]);
  const photoUrl = firstPhoto([
    claims.picture,
    user.photoURL,
    ...user.providerData.map((item) => item.photoURL),
  ]);
  if (!nickname && !photoUrl) return null;
  if (nickname && nickname !== user.displayName) {
    await updateProfile(user, {
      displayName: nickname,
      photoURL: photoUrl || user.photoURL || undefined,
    }).catch(() => undefined);
  }
  return { nickname, photoUrl };
}

function isKakaoUser(user: User | null): user is User {
  if (!user || user.isAnonymous) return false;
  return user.providerData.some((item) => item.providerId === KAKAO_PROVIDER_ID);
}

export function socialLoginErrorMessage(err: unknown): string | null {
  const code = codeOf(err);
  const detail =
    err && typeof err === 'object' && 'message' in err
      ? String((err as { message?: string }).message ?? '')
      : '';
  if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
    return '카카오 로그인이 취소되었습니다. 다시 눌러 주세요.';
  }
  if (code === 'auth/popup-blocked') {
    return '팝업이 막혀 있습니다. 브라우저에서 팝업을 허용한 뒤 다시 눌러 주세요.';
  }
  if (code === 'auth/operation-not-allowed' || code === 'auth/unauthorized-domain') {
    return '카카오 로그인은 아직 Firebase에 연결되지 않았습니다. 비회원으로 접수할 수 있습니다.';
  }
  if (code === 'auth/account-exists-with-different-credential') {
    return '이 메일은 다른 로그인으로 이미 쓰이고 있습니다. 그때 쓴 버튼으로 다시 들어와 주세요.';
  }
  if (
    code === 'auth/invalid-credential' ||
    code === 'auth/invalid-id-token' ||
    detail.includes('invalid_client') ||
    detail.includes('Client authentication failed') ||
    detail.includes('invalid_grant')
  ) {
    return '카카오 Client Secret이 Firebase와 맞지 않습니다. REST API 키의 시크릿을 다시 넣고 저장해 주세요.';
  }
  if (code) return `로그인 실패 (${code}). 비회원으로 접수할 수 있습니다.`;
  if (detail) return `로그인 실패. ${detail.slice(0, 120)}`;
  return '로그인에 실패했습니다. 비회원으로 접수할 수 있습니다.';
}

export function clearKakaoRedirectPending(): void {
  try {
    sessionStorage.removeItem(KAKAO_REDIRECT_FLAG);
  } catch {
    /* ignore */
  }
}

export function hasKakaoRedirectPending(): boolean {
  try {
    return sessionStorage.getItem(KAKAO_REDIRECT_FLAG) === '1';
  } catch {
    return false;
  }
}

const LOGGED_OUT_FLAG = 'airpick_logged_out_v1';

export function markKakaoLoggedOut(): void {
  try {
    sessionStorage.setItem(LOGGED_OUT_FLAG, '1');
  } catch {
    /* ignore */
  }
}

export function clearKakaoLoggedOut(): void {
  try {
    sessionStorage.removeItem(LOGGED_OUT_FLAG);
  } catch {
    /* ignore */
  }
}

export function isKakaoLoggedOutMark(): boolean {
  try {
    return sessionStorage.getItem(LOGGED_OUT_FLAG) === '1';
  } catch {
    return false;
  }
}

function tokenResponseOf(cred: UserCredential): Record<string, unknown> {
  const tagged = cred as UserCredential & { _tokenResponse?: Record<string, unknown> };
  return tagged._tokenResponse ?? {};
}

function parsedRawUserInfo(tokenResponse: Record<string, unknown>): Record<string, unknown> {
  return asRecord(tokenResponse.rawUserInfo);
}

async function kakaoJson(path: string, accessToken: string | undefined): Promise<Record<string, unknown>> {
  if (!accessToken) return {};
  try {
    const res = await fetch(path, {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: 'no-store',
      signal: AbortSignal.timeout(4000),
    });
    const body = asRecord(await res.text());
    if (!res.ok) return {};
    return body;
  } catch {
    return {};
  }
}

function stringField(record: Record<string, unknown>, key: string): string {
  return textOf(record[key]);
}

function jwtPayloads(value: unknown, depth = 0): Record<string, unknown>[] {
  if (depth > 4 || value == null) return [];
  if (typeof value === 'string') {
    if (value.split('.').length !== 3 || value.length < 40) return [];
    const payload = jwtPayload(value);
    return Object.keys(payload).length ? [payload] : [];
  }
  if (typeof value !== 'object') return [];
  return Object.values(value as Record<string, unknown>).flatMap((child) => jwtPayloads(child, depth + 1));
}

function keyPaths(value: unknown, prefix = '', depth = 0): string[] {
  const record = asRecord(value);
  const keys = Object.keys(record);
  if (!keys.length || depth > 3) return prefix ? [prefix] : [];
  return keys.flatMap((key) => {
    const path = prefix ? `${prefix}.${key}` : key;
    const child = record[key];
    if (child && typeof child === 'object') return keyPaths(child, path, depth + 1);
    return [path];
  });
}

/** 같은 창 이동은 돌아온 뒤 결과가 사라져 버튼이 그대로인 것처럼 보인다. 팝업만 쓴다. */
export async function signInWithKakao(): Promise<SocialProfile> {
  clearKakaoRedirectPending();
  clearKakaoLoggedOut();
  const cred = await signInWithPopup(auth, kakaoProvider());
  const tokenResponse = tokenResponseOf(cred);
  const accessToken =
    stringField(tokenResponse, 'oauthAccessToken') ||
    stringField(tokenResponse, 'oauth_access_token') ||
    OAuthProvider.credentialFromResult(cred)?.accessToken ||
    '';
  const idPayload = jwtPayload(
    stringField(tokenResponse, 'oauthIdToken') || stringField(tokenResponse, 'oauth_id_token') || undefined
  );
  const rawInfo = parsedRawUserInfo(tokenResponse);
  const profile = profileFromCredential('kakao', cred);
  const [oidcInfo, account, talkProfile] = await Promise.all([
    kakaoJson('/api/kakao-oidc-userinfo', accessToken),
    kakaoJson('/api/kakao-user-me', accessToken),
    kakaoJson('/api/kakao-talk-profile', accessToken),
  ]);
  const gathered = [
    collectIdentity(oidcInfo),
    collectIdentity(account),
    collectIdentity(talkProfile),
    collectIdentity(rawInfo),
    collectIdentity(idPayload),
    ...jwtPayloads(tokenResponse).map((payload) => collectIdentity(payload)),
  ];
  const accountProfile = asRecord(asRecord(account.kakao_account).profile);
  const properties = asRecord(account.properties);
  const name = firstNickname([
    ...gathered.flatMap((item) => item.nicknames),
    oidcInfo.nickname,
    accountProfile.nickname,
    properties.nickname,
    talkProfile.nickName,
    talkProfile.nickname,
    profile.name,
    tokenResponse.screenName,
    tokenResponse.displayName,
  ]);
  const photoUrl = firstPhoto([...gathered.flatMap((item) => item.photos), profile.photoUrl]);
  if (!name && import.meta.env.DEV) {
    const report = {
      hasAccessToken: Boolean(accessToken),
      token: keyPaths(tokenResponse),
      oidc: keyPaths(oidcInfo),
      account: keyPaths(account),
      talk: keyPaths(talkProfile),
      raw: keyPaths(rawInfo),
      id: keyPaths(idPayload),
      needsNicknameAgreement: account.kakao_account
        ? asRecord(account.kakao_account).profile_nickname_needs_agreement === true
        : undefined,
    };
    try {
      localStorage.setItem('airpick_kakao_keys_v1', JSON.stringify(report));
    } catch {
      /* ignore */
    }
    console.info('kakao profile missing nickname', report);
  }
  if ((name && name !== cred.user.displayName) || (photoUrl && photoUrl !== cred.user.photoURL)) {
    await updateProfile(cred.user, {
      displayName: name || cred.user.displayName || undefined,
      photoURL: photoUrl || cred.user.photoURL || undefined,
    }).catch(() => undefined);
  }
  return { ...profile, name: name || profile.name, photoUrl: photoUrl || profile.photoUrl };
}

/** React Strict Mode에서 effect가 두 번 돌아도 getRedirectResult는 한 번만 읽는다. */
let redirectResultPromise: Promise<SocialProfile | null> | null = null;

/** 예전에 쓰던 리다이렉트 복귀용. 새 로그인은 팝업을 쓴다. */
export function completeKakaoRedirectLogin(): Promise<SocialProfile | null> {
  if (!redirectResultPromise) {
    redirectResultPromise = (async () => {
      try {
        await auth.authStateReady();
        const cred = await getRedirectResult(auth);
        clearKakaoRedirectPending();
        if (cred) return profileFromCredential('kakao', cred);
        if (isKakaoUser(auth.currentUser)) return profileFromUser(auth.currentUser);
        return null;
      } catch (err) {
        clearKakaoRedirectPending();
        throw err;
      }
    })();
  }
  return redirectResultPromise;
}
