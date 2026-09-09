/** B2C 제휴·추천 코드 (?ref=) — B2B affiliates 컬렉션과 동일 규약 */

export const AFFILIATE_CODE_RE = /^[a-z0-9_]{3,16}$/;
const STORAGE_KEY = 'airpick_affiliate_ref';

export function normalizeAffiliateCode(raw: string): string | null {
  const code = String(raw || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '_');
  if (!AFFILIATE_CODE_RE.test(code)) return null;
  return code;
}

/** URL `?ref=` 를 읽고 sessionStorage에 남김 (탭 이동 시 쿼리 제거 대비) */
export function captureAffiliateRefFromUrl(): string | null {
  if (typeof window === 'undefined') return null;
  const raw = new URLSearchParams(window.location.search).get('ref');
  const code = raw ? normalizeAffiliateCode(raw) : null;
  if (code) {
    try {
      sessionStorage.setItem(STORAGE_KEY, code);
    } catch {
      // private mode 등
    }
  }
  return code ?? getStoredAffiliateCode();
}

export function getStoredAffiliateCode(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? normalizeAffiliateCode(raw) : null;
  } catch {
    return null;
  }
}

export function clearStoredAffiliateCode(): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
