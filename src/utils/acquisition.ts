/** B2C 짧은 경로·UTM 첫 유입 — 예약 acquisition* 필드용 (createdBy와 별개) */

const STORAGE_KEY = 'airpick.acquisition';
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
};

function campaignValue(raw: string | null | undefined): string {
  return (raw || '').trim().slice(0, 80);
}

function normalizeSource(raw: string): string | null {
  const source = raw.trim().toLowerCase();
  if (!SOURCE_KEY_RE.test(source) || RESERVED_PATHS.has(source)) return null;
  return source;
}

/** `/youtubelong1` → youtubelong1. 예약·다단 경로는 null */
export function sourceFromPath(pathname: string): string | null {
  const slug = pathname.replace(/^\/+|\/+$/g, '').toLowerCase();
  if (!slug || slug.includes('/')) return null;
  return normalizeSource(slug);
}

export function campaignFromLocation(pathname: string, search = ''): AcquisitionHit | null {
  const params = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search);
  const pathSource = sourceFromPath(pathname) || '';
  const querySource = normalizeSource(campaignValue(params.get('utm_source'))) || '';
  const source = querySource || pathSource;
  if (!source) return null;

  const queryMedium = campaignValue(params.get('utm_medium'));
  const clickId =
    campaignValue(params.get('gclid')) ||
    campaignValue(params.get('fbclid')) ||
    campaignValue(params.get('ttclid'));

  return {
    source,
    medium: queryMedium || (pathSource && !querySource ? 'path' : ''),
    campaign: campaignValue(params.get('utm_campaign')),
    clickId,
    capturedAt: new Date().toISOString(),
  };
}

export function peekAcquisition(): AcquisitionHit | null {
  if (typeof sessionStorage === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<AcquisitionHit>;
    const source = typeof parsed.source === 'string' ? normalizeSource(parsed.source) : null;
    if (!source) return null;
    return {
      source,
      medium: typeof parsed.medium === 'string' ? parsed.medium.slice(0, 80) : '',
      campaign: typeof parsed.campaign === 'string' ? parsed.campaign.slice(0, 80) : '',
      clickId: typeof parsed.clickId === 'string' ? parsed.clickId.slice(0, 80) : '',
      capturedAt:
        typeof parsed.capturedAt === 'string' ? parsed.capturedAt : new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

function writeAcquisition(hit: AcquisitionHit): void {
  if (typeof sessionStorage === 'undefined') return;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(hit));
  } catch {
    /* ignore quota / private mode */
  }
}

/**
 * 현재 URL에서 첫 유입만 저장. 이미 있으면 덮지 않음.
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
