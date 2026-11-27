/**
 * 본사 「에어픽 확인」 — 사업자·보험·주차장·CCTV.
 * 본사(B2B)가 확인할 때 본 내용의 지문을 함께 저장한다. 업체가 서류·주소·보험을 바꾸면
 * 지문이 달라져서 여기서는 그 항목을 「확인」으로 보여주지 않는다.
 * 지문 규칙은 airpick2-b-to-b/src/utils/verification.ts 와 같아야 한다.
 */

export type VerificationKey = 'business' | 'insurance' | 'parking' | 'cctv';

/** 손님 화면용 — 확인 표시를 해도 되는 항목만 날짜(YYYY-MM-DD)로 */
export interface CompanyVerificationView {
  business?: string;
  parking?: string;
  cctv?: string;
  insurance?: { verifiedOn: string; periodStart?: string; periodEnd?: string };
  /** 본사 확인 기록이 하나라도 있는지 (없으면 예전 안내 그대로) */
  hasRecords: boolean;
  /** 업체가 적은 보험 만기가 지남 — 「보험 갱신 확인 중」 */
  insuranceExpired: boolean;
  /** 업체가 적은 보험기간 (확인 여부와 무관) */
  insurancePeriodStart?: string;
  insurancePeriodEnd?: string;
}

const REVERIFY_DAYS = 365;

export function fingerprintText(text: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i += 1) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, '0');
}

export function kstToday(now: Date = new Date()): string {
  return new Date(now.getTime() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

export function normalizeIsoDate(raw: unknown): string {
  const s = String(raw ?? '').trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return '';
  const d = new Date(`${s}T00:00:00Z`);
  return Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== s ? '' : s;
}

function daysBetween(fromIso: string, toIso: string): number {
  return Math.round(
    (Date.parse(`${toIso}T00:00:00Z`) - Date.parse(`${fromIso}T00:00:00Z`)) / 86_400_000
  );
}

function clean(value: unknown): string {
  return String(value ?? '').replace(/\s+/g, ' ').trim();
}

function asRecord(value: unknown): Record<string, unknown> | undefined {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined;
}

function parkingBasisParts(data: Record<string, unknown>): string[] {
  const parts: string[] = [];
  if (Array.isArray(data.parkingLots)) {
    for (const row of data.parkingLots as unknown[]) {
      const lot = asRecord(row);
      if (!lot) continue;
      const type = lot.type === 'outdoor' ? 'outdoor' : lot.type === 'indoor' ? 'indoor' : null;
      if (!type) continue;
      const addr = clean(lot.parkingAddress || lot.customerAddress || lot.parkingLotAddress);
      if (addr) parts.push(`${type}|${addr}`);
    }
  }
  if (parts.length === 0) {
    const indoor = clean(data.indoorParkingAddress);
    const outdoor = clean(data.outdoorParkingAddress);
    if (indoor) parts.push(`indoor|${indoor}`);
    if (outdoor) parts.push(`outdoor|${outdoor}`);
  }
  return parts.sort();
}

/** Firestore 업체 문서 그대로 받아 지금 지문을 만든다. 확인할 내용이 없으면 null */
export function currentVerificationBasis(
  data: Record<string, unknown>,
  key: VerificationKey
): string | null {
  if (key === 'business') {
    const url = clean(asRecord(data.verificationDocuments)?.businessRegistrationUrl);
    return url ? fingerprintText(`business|${url}`) : null;
  }
  if (key === 'insurance') {
    const ins = asRecord(data.insurance);
    if (!ins || ins.enrolled !== true) return null;
    const url = clean(ins.certificateUrl);
    if (!url) return null;
    return fingerprintText(
      [
        'insurance',
        url,
        clean(ins.provider),
        clean(ins.productName),
        clean(ins.coverageLimitText),
        normalizeIsoDate(ins.periodStart),
        normalizeIsoDate(ins.periodEnd),
      ].join('|')
    );
  }
  if (key === 'parking') {
    const lots = parkingBasisParts(data);
    return lots.length ? fingerprintText(`parking|${lots.join(';')}`) : null;
  }
  return fingerprintText('cctv');
}

/** 확인 기록이 지금 내용과 맞고 1년 안이면 확인일(YYYY-MM-DD) */
function validCheckDay(
  data: Record<string, unknown>,
  key: VerificationKey,
  today: string
): string | null {
  const check = asRecord(asRecord(data.verification)?.[key]);
  const verifiedAt = clean(check?.verifiedAt);
  if (!verifiedAt) return null;
  const basis = currentVerificationBasis(data, key);
  if (basis == null) return null;
  if (check?.basis && check.basis !== basis) return null;
  const day = kstToday(new Date(verifiedAt));
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) return null;
  if (key !== 'insurance' && daysBetween(day, today) > REVERIFY_DAYS) return null;
  return day;
}

export function parseVerificationView(
  data: Record<string, unknown>,
  today: string = kstToday()
): CompanyVerificationView {
  const records = asRecord(data.verification);
  const ins = asRecord(data.insurance);
  const periodStart = normalizeIsoDate(ins?.periodStart);
  const periodEnd = normalizeIsoDate(ins?.periodEnd);
  const insuranceExpired = ins?.enrolled === true && !!periodEnd && periodEnd < today;

  const view: CompanyVerificationView = {
    hasRecords: !!records && Object.keys(records).length > 0,
    insuranceExpired,
    ...(periodStart ? { insurancePeriodStart: periodStart } : {}),
    ...(periodEnd ? { insurancePeriodEnd: periodEnd } : {}),
  };
  const business = validCheckDay(data, 'business', today);
  const parking = validCheckDay(data, 'parking', today);
  const cctv = validCheckDay(data, 'cctv', today);
  const insurance = insuranceExpired ? null : validCheckDay(data, 'insurance', today);
  if (business) view.business = business;
  if (parking) view.parking = parking;
  if (cctv) view.cctv = cctv;
  if (insurance) {
    view.insurance = {
      verifiedOn: insurance,
      ...(periodStart ? { periodStart } : {}),
      ...(periodEnd ? { periodEnd } : {}),
    };
  }
  return view;
}

/** 2026-11-27 → 2026.11.27 */
export function formatDotDate(iso?: string): string {
  return iso ? iso.replace(/-/g, '.') : '';
}
