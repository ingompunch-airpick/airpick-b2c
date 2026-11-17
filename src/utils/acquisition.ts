/** B2C 짧은 경로·src·UTM 첫 유입 — 예약 acquisition* 필드용 (createdBy와 별개) */

const STORAGE_KEY = 'airpick.acquisition';
const LEGACY_SESSION_KEY = 'airpick.acquisition';
const TTL_MS = 30 * 24 * 60 * 60 * 1000;
const SOURCE_KEY_RE = /^[a-z0-9_-]{1,40}$/;

/** 앱·SEO·API 경로 — 유입 슬러그로 쓰지 않음 */
const RESERVED_PATHS = new Set([
  'parking',
  'esim',
  'my',
  'spots',
  'partner',
  'partners',
  'guides',
  'faq',
  'about',
  'privacy',
  'terms',
  'refund',
  'pricing',
  'facts',
  'for-partners',
  'join',
  'badges',
  'admin',
  'r',
  'api',
  'assets',
  'shared',
  'brand',
  'directions',
  'drop-off',
  'curbside',
  'compare',
  'index.html',
]);

export type AcquisitionHit = {
  source: string;
  medium: string;
  campaign: string;
  clickId: string;
  capturedAt: string;
  /** 만료 시각 (ISO). 없으면 capturedAt+30일로 간주 */
  expiresAt?: string;
};

function campaignValue(raw: string | null | undefined): string {
  return (raw || '').trim().slice(0, 80);
}

function normalizeSource(raw: string): string | null {
  const source = raw.trim().toLowerCase();
  if (!SOURCE_KEY_RE.test(source) || RESERVED_PATHS.has(source)) return null;
  return source;
}

function isExpired(hit: AcquisitionHit, now = Date.now()): boolean {
  const exp =
    typeof hit.expiresAt === 'string' && hit.expiresAt
      ? Date.parse(hit.expiresAt)
      : Date.parse(hit.capturedAt || '') + TTL_MS;
  if (!Number.isFinite(exp)) return true;
  return exp <= now;
}

function withExpiry(hit: Omit<AcquisitionHit, 'expiresAt'> & { expiresAt?: string }): AcquisitionHit {
  const capturedAt = hit.capturedAt || new Date().toISOString();
  const capturedMs = Date.parse(capturedAt);
  const expiresAt =
    hit.expiresAt ||
    new Date((Number.isFinite(capturedMs) ? capturedMs : Date.now()) + TTL_MS).toISOString();
  return { ...hit, capturedAt, expiresAt };
}

/** `/youtubelong1` → youtubelong1. 예약·다단 경로는 null */
export function sourceFromPath(pathname: string): string | null {
  const slug = pathname.replace(/^\/+|\/+$/g, '').toLowerCase();
  if (!slug || slug.includes('/')) return null;
  return normalizeSource(slug);
}

/**
 * 우선순위: src → utm_source → 단축 경로.
 * 방문 집계·예약 귀속에 같은 키를 쓴다.
 */
export function sourceFromLocation(pathname: string, search = ''): string | null {
  const params = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search);
  const fromSrc = normalizeSource(campaignValue(params.get('src') || params.get('source')));
  if (fromSrc) return fromSrc;
  const fromUtm = normalizeSource(campaignValue(params.get('utm_source')));
  if (fromUtm) return fromUtm;
  return sourceFromPath(pathname);
}

export function campaignFromLocation(pathname: string, search = ''): AcquisitionHit | null {
  const params = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search);
  const pathSource = sourceFromPath(pathname) || '';
  const srcParam = normalizeSource(campaignValue(params.get('src') || params.get('source'))) || '';
  const querySource = normalizeSource(campaignValue(params.get('utm_source'))) || '';
  const source = srcParam || querySource || pathSource;
  if (!source) return null;

  const queryMedium = campaignValue(params.get('utm_medium') || params.get('med'));
  const clickId =
    campaignValue(params.get('gclid')) ||
    campaignValue(params.get('fbclid')) ||
    campaignValue(params.get('ttclid')) ||
    campaignValue(params.get('oppref'));

  let medium = queryMedium;
  if (!medium) {
    if (srcParam) medium = 'src';
    else if (pathSource && !querySource) medium = 'path';
  }

  return withExpiry({
    source,
    medium,
    campaign: campaignValue(params.get('utm_campaign') || params.get('cmp')),
    clickId,
    capturedAt: new Date().toISOString(),
  });
}

function readStoredRaw(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const fromLocal = localStorage.getItem(STORAGE_KEY);
    if (fromLocal) return fromLocal;
  } catch {
    /* private mode */
  }
  try {
    return sessionStorage.getItem(LEGACY_SESSION_KEY);
  } catch {
    return null;
  }
}

function parseHit(raw: string | null): AcquisitionHit | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<AcquisitionHit>;
    const source = typeof parsed.source === 'string' ? normalizeSource(parsed.source) : null;
    if (!source) return null;
    const hit = withExpiry({
      source,
      medium: typeof parsed.medium === 'string' ? parsed.medium.slice(0, 80) : '',
      campaign: typeof parsed.campaign === 'string' ? parsed.campaign.slice(0, 80) : '',
      clickId: typeof parsed.clickId === 'string' ? parsed.clickId.slice(0, 80) : '',
      capturedAt:
        typeof parsed.capturedAt === 'string' ? parsed.capturedAt : new Date().toISOString(),
      expiresAt: typeof parsed.expiresAt === 'string' ? parsed.expiresAt : undefined,
    });
    if (isExpired(hit)) return null;
    return hit;
  } catch {
    return null;
  }
}

export function peekAcquisition(): AcquisitionHit | null {
  const hit = parseHit(readStoredRaw());
  if (!hit) {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
    return null;
  }
  return hit;
}

function writeAcquisition(hit: AcquisitionHit): void {
  const payload = JSON.stringify(withExpiry(hit));
  try {
    localStorage.setItem(STORAGE_KEY, payload);
  } catch {
    /* ignore quota / private mode */
  }
  try {
    sessionStorage.setItem(LEGACY_SESSION_KEY, payload);
  } catch {
    /* ignore */
  }
}

/**
 * 현재 URL에서 첫 유입만 저장. 유효한 기존 값(30일)이 있으면 덮지 않음.
 * @returns 이번에 새로 잡았으면 hit, 아니면 null
 */
export function captureAcquisitionFromLocation(
  pathname = typeof window !== 'undefined' ? window.location.pathname : '/',
  search = typeof window !== 'undefined' ? window.location.search : ''
): AcquisitionHit | null {
  if (peekAcquisition()) return null;
  const hit = campaignFromLocation(pathname, search);
  if (!hit) return null;
  writeAcquisition(hit);
  return hit;
}

/** 예약 payload용 — 빈 문자열 필드는 생략 */
export function acquisitionFieldsForReservation(
  hit: AcquisitionHit | null = peekAcquisition()
): Record<string, string> {
  if (!hit?.source) return {};
  const out: Record<string, string> = { acquisitionSource: hit.source };
  if (hit.medium) out.acquisitionMedium = hit.medium;
  if (hit.campaign) out.acquisitionCampaign = hit.campaign;
  if (hit.clickId) out.acquisitionClickId = hit.clickId;
  return out;
}
