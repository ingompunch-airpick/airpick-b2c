/** B2C 짧은 경로·src·UTM·referrer 첫/마지막 유입 — 예약 acquisition* 필드용 */

const STORAGE_KEY = 'airpick.acquisition';
const LAST_STORAGE_KEY = 'airpick.acquisition.last';
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

const OWN_HOST_RE =
  /(^|\.)(에어픽\.kr|xn--oh5b1bw17d\.kr|airpick-b2c\.web.app|localhost|127\.0\.0\.1)$/i;

const NAVER_PARAM_KEYS = [
  'n_media',
  'n_query',
  'n_keyword',
  'n_rank',
  'n_campaign_type',
  'n_ad_group',
] as const;

export type NaverTrackParams = Partial<Record<(typeof NAVER_PARAM_KEYS)[number], string>>;

export type AcquisitionHit = {
  source: string;
  medium: string;
  campaign: string;
  clickId: string;
  capturedAt: string;
  /** 만료 시각 (ISO). 없으면 capturedAt+30일로 간주 */
  expiresAt?: string;
  referrerHost?: string;
  landingPath?: string;
  naver?: NaverTrackParams;
  /** 인앱이면 표시 문자열 (예: KAKAOTALK) */
  inApp?: string;
};

export type AcquisitionCaptureOpts = {
  referrer?: string;
  userAgent?: string;
  pageHost?: string;
  /**
   * true(기본·첫 진입): referrer 자동 분류 허용.
   * false(popstate·앱 내 이동): src·utm·단축경로·naver_ad 만.
   */
  allowOrganic?: boolean;
};

function campaignValue(raw: string | null | undefined): string {
  return (raw || '').trim().slice(0, 80);
}

/** utm 등에 점이 있으면 _ 로 바꿈. 예약·방문 키용 */
function normalizeSource(raw: string): string | null {
  const source = raw
    .trim()
    .toLowerCase()
    .replace(/\./g, '_')
    .replace(/[^a-z0-9_-]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
    .slice(0, 40);
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

function parseReferrerHost(referrer: string, pageHost: string): string {
  const raw = (referrer || '').trim();
  if (!raw) return 'direct';
  try {
    const url = new URL(raw);
    const host = url.hostname.toLowerCase();
    if (!host) return 'direct';
    if (host === pageHost.toLowerCase()) return 'direct';
    if (OWN_HOST_RE.test(host)) return 'direct';
    return host;
  } catch {
    return 'direct';
  }
}

function detectInApp(ua: string): string {
  if (!ua) return '';
  if (ua.includes('KAKAOTALK')) return 'KAKAOTALK';
  if (ua.includes('NAVER(inapp')) return 'NAVER';
  if (ua.includes('Instagram')) return 'Instagram';
  if (ua.includes('FBAN') || ua.includes('FBAV')) return 'Facebook';
  if (ua.includes('Line/')) return 'Line';
  return '';
}

function readNaverParams(params: URLSearchParams): NaverTrackParams | undefined {
  const out: NaverTrackParams = {};
  let any = false;
  for (const key of NAVER_PARAM_KEYS) {
    const value = campaignValue(params.get(key));
    if (!value) continue;
    out[key] = value;
    any = true;
  }
  return any ? out : undefined;
}

function hostLooksLike(host: string, needle: string): boolean {
  return host === needle || host.endsWith(`.${needle}`);
}

function hostIsGoogle(host: string): boolean {
  return host === 'google.com' || host.endsWith('.google.com') || /^google\.[a-z.]+$/i.test(host);
}

/** first-touch가 약한 유입(자동 분류)인지 */
function isSoftFirstTouch(hit: AcquisitionHit): boolean {
  return hit.medium === 'direct' || hit.medium === 'referrer';
}

/** src·utm·단축경로·네이버 광고로 찍힌 유입 */
function isTaggedHit(hit: AcquisitionHit): boolean {
  return (
    hit.medium === 'src' ||
    hit.medium === 'path' ||
    hit.medium === 'utm' ||
    hit.medium === 'naver_ad'
  );
}

/**
 * src·utm·단축경로가 없을 때 referrer·네이버 파라미터·인앱으로 source 분류.
 */
export function classifyOrganicSource(opts: {
  referrerHost: string;
  naver?: NaverTrackParams;
  inApp?: string;
}): string {
  const { referrerHost, naver, inApp } = opts;
  if (naver?.n_campaign_type) return 'naver_ad';

  const host = (referrerHost || 'direct').toLowerCase();
  if (host === 'search.naver.com' || host === 'm.search.naver.com') return 'naver_search';
  if (hostLooksLike(host, 'blog.naver.com')) return 'naver_blog';
  if (hostLooksLike(host, 'cafe.naver.com')) return 'naver_cafe';
  if (hostIsGoogle(host)) return 'google';
  if (host === 'chatgpt.com' || hostLooksLike(host, 'chat.openai.com')) return 'chatgpt';
  if (hostLooksLike(host, 'perplexity.ai')) return 'perplexity';
  if (hostLooksLike(host, 'youtube.com') || host === 'youtu.be') return 'youtube';
  if (inApp === 'KAKAOTALK' || host.includes('kakao')) return 'kakao';
  if (!host || host === 'direct') return 'direct';
  return normalizeSource(`ref_${host.replace(/\./g, '_')}`) || 'direct';
}

/** `/youtubelong1` → youtubelong1. 예약·다단 경로는 null */
export function sourceFromPath(pathname: string): string | null {
  const slug = pathname.replace(/^\/+|\/+$/g, '').toLowerCase();
  if (!slug || slug.includes('/')) return null;
  return normalizeSource(slug);
}

/**
 * 우선순위: src → utm_source → 단축 경로 → (허용 시) referrer 자동 분류.
 */
export function sourceFromLocation(
  pathname: string,
  search = '',
  opts?: AcquisitionCaptureOpts
): string | null {
  const hit = campaignFromLocation(pathname, search, opts);
  return hit?.source ?? null;
}

export function campaignFromLocation(
  pathname: string,
  search = '',
  opts?: AcquisitionCaptureOpts
): AcquisitionHit | null {
  const allowOrganic = opts?.allowOrganic !== false;
  const params = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search);
  const pathSource = sourceFromPath(pathname) || '';
  const srcParam = normalizeSource(campaignValue(params.get('src') || params.get('source'))) || '';
  const querySource = normalizeSource(campaignValue(params.get('utm_source'))) || '';

  const pageHost =
    opts?.pageHost ||
    (typeof window !== 'undefined' ? window.location.hostname : '');
  const referrerRaw =
    opts?.referrer ?? (typeof document !== 'undefined' ? document.referrer : '');
  const ua =
    opts?.userAgent ?? (typeof navigator !== 'undefined' ? navigator.userAgent : '');
  const referrerHost = parseReferrerHost(referrerRaw, pageHost);
  const inApp = detectInApp(ua);
  const naver = readNaverParams(params);
  const landingPath = pathname || '/';

  let source = srcParam || querySource || pathSource;
  if (!source && naver?.n_campaign_type) source = 'naver_ad';
  if (!source) {
    if (!allowOrganic) return null;
    source = classifyOrganicSource({ referrerHost, naver, inApp });
  }

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
    else if (querySource) medium = 'utm';
    else if (naver?.n_campaign_type) medium = 'naver_ad';
    else if (referrerHost && referrerHost !== 'direct') medium = 'referrer';
    else medium = 'direct';
  }

  return withExpiry({
    source,
    medium,
    campaign: campaignValue(params.get('utm_campaign') || params.get('cmp')),
    clickId,
    capturedAt: new Date().toISOString(),
    referrerHost,
    landingPath,
    ...(naver ? { naver } : {}),
    ...(inApp ? { inApp } : {}),
  });
}

function readStoredRaw(key: string): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const fromLocal = localStorage.getItem(key);
    if (fromLocal) return fromLocal;
  } catch {
    /* private mode */
  }
  if (key === STORAGE_KEY) {
    try {
      return sessionStorage.getItem(LEGACY_SESSION_KEY);
    } catch {
      return null;
    }
  }
  return null;
}

function parseHit(raw: string | null): AcquisitionHit | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<AcquisitionHit>;
    const source = typeof parsed.source === 'string' ? normalizeSource(parsed.source) : null;
    if (!source) return null;
    const naver =
      parsed.naver && typeof parsed.naver === 'object'
        ? (Object.fromEntries(
            NAVER_PARAM_KEYS.filter((k) => typeof parsed.naver?.[k] === 'string' && parsed.naver[k])
              .map((k) => [k, String(parsed.naver![k]).slice(0, 80)])
          ) as NaverTrackParams)
        : undefined;
    const hit = withExpiry({
      source,
      medium: typeof parsed.medium === 'string' ? parsed.medium.slice(0, 80) : '',
      campaign: typeof parsed.campaign === 'string' ? parsed.campaign.slice(0, 80) : '',
      clickId: typeof parsed.clickId === 'string' ? parsed.clickId.slice(0, 80) : '',
      capturedAt:
        typeof parsed.capturedAt === 'string' ? parsed.capturedAt : new Date().toISOString(),
      expiresAt: typeof parsed.expiresAt === 'string' ? parsed.expiresAt : undefined,
      referrerHost:
        typeof parsed.referrerHost === 'string' ? parsed.referrerHost.slice(0, 120) : undefined,
      landingPath:
        typeof parsed.landingPath === 'string' ? parsed.landingPath.slice(0, 200) : undefined,
      ...(naver && Object.keys(naver).length ? { naver } : {}),
      inApp: typeof parsed.inApp === 'string' ? parsed.inApp.slice(0, 40) : undefined,
    });
    if (isExpired(hit)) return null;
    return hit;
  } catch {
    return null;
  }
}

export function peekAcquisition(): AcquisitionHit | null {
  const hit = parseHit(readStoredRaw(STORAGE_KEY));
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

export function peekLastAcquisition(): AcquisitionHit | null {
  const hit = parseHit(readStoredRaw(LAST_STORAGE_KEY));
  if (!hit) {
    try {
      localStorage.removeItem(LAST_STORAGE_KEY);
    } catch {
      /* ignore */
    }
    return null;
  }
  return hit;
}

function writeAcquisition(hit: AcquisitionHit, key: string): void {
  const payload = JSON.stringify(withExpiry(hit));
  try {
    localStorage.setItem(key, payload);
  } catch {
    /* ignore quota / private mode */
  }
  if (key === STORAGE_KEY) {
    try {
      sessionStorage.setItem(LEGACY_SESSION_KEY, payload);
    } catch {
      /* ignore */
    }
  }
}

/**
 * 현재 URL에서 유입 저장.
 * - allowOrganic=false 이면 태그된 유입만.
 * - first-touch: 비어 있으면 저장. soft(direct/referrer)는 tagged로 덮어씀.
 * - last-touch: direct로는 갱신하지 않음.
 */
export function captureAcquisitionFromLocation(
  pathname = typeof window !== 'undefined' ? window.location.pathname : '/',
  search = typeof window !== 'undefined' ? window.location.search : '',
  opts?: AcquisitionCaptureOpts
): AcquisitionHit | null {
  const hit = campaignFromLocation(pathname, search, opts);
  if (!hit) return null;

  if (hit.medium !== 'direct') {
    writeAcquisition(hit, LAST_STORAGE_KEY);
  }

  const existing = peekAcquisition();
  if (!existing) {
    writeAcquisition(hit, STORAGE_KEY);
    return hit;
  }
  if (isSoftFirstTouch(existing) && isTaggedHit(hit)) {
    writeAcquisition(hit, STORAGE_KEY);
    return hit;
  }
  return null;
}

function appendHitFields(
  out: Record<string, string>,
  hit: AcquisitionHit,
  prefix: '' | 'Last'
): void {
  const srcKey = prefix ? `acquisition${prefix}Source` : 'acquisitionSource';
  out[srcKey] = hit.source;
  if (hit.medium) out[`acquisition${prefix}Medium`] = hit.medium;
  if (hit.campaign) out[`acquisition${prefix}Campaign`] = hit.campaign;
  if (hit.clickId) out[`acquisition${prefix}ClickId`] = hit.clickId;
}

/** 예약 payload용 — first + last. 빈 문자열 필드는 생략 */
export function acquisitionFieldsForReservation(
  first: AcquisitionHit | null = peekAcquisition(),
  last: AcquisitionHit | null = peekLastAcquisition()
): Record<string, string> {
  const out: Record<string, string> = {};
  const primary = first || last;
  if (!primary?.source) return {};

  if (first?.source) appendHitFields(out, first, '');
  else appendHitFields(out, primary, '');

  if (last?.source) appendHitFields(out, last, 'Last');

  const meta = first || last;
  if (meta?.referrerHost) out.acquisitionReferrerHost = meta.referrerHost;
  if (meta?.landingPath) out.acquisitionLandingPath = meta.landingPath;
  if (meta?.inApp) out.acquisitionInApp = meta.inApp;
  const naver = meta?.naver;
  if (naver) {
    if (naver.n_media) out.acquisitionNMedia = naver.n_media;
    if (naver.n_query) out.acquisitionNQuery = naver.n_query;
    if (naver.n_keyword) out.acquisitionNKeyword = naver.n_keyword;
    if (naver.n_rank) out.acquisitionNRank = naver.n_rank;
    if (naver.n_campaign_type) out.acquisitionNCampaignType = naver.n_campaign_type;
    if (naver.n_ad_group) out.acquisitionNAdGroup = naver.n_ad_group;
  }
  return out;
}
