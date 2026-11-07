import type { Company, ParkingProduct, ParkingProductType, Terminal } from '../types';
import { companySupportsIndoor, companySupportsOutdoor } from './parkingType';

const TYPES = new Set<ParkingProductType>(['valet', 'walk', 'shuttle', 'official']);
const HHMM = /^([01]\d|2[0-3]):[0-5]\d$/;
const PRODUCT_LIMIT = 12;

/** Firestore 값 → 상품. 모르는 값·깨진 값은 버린다 (손님 화면에 안 나감) */
export function parseParkingProduct(raw: unknown): ParkingProduct | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const id = String(r.id || '').trim();
  const type = String(r.type || '') as ParkingProductType;
  const lot = r.lot === 'indoor' || r.lot === 'outdoor' ? r.lot : null;
  const terminal = r.terminal === 'T1' || r.terminal === 'T2' || r.terminal === 'both' ? r.terminal : null;
  if (!id || !TYPES.has(type) || !lot || !terminal) return null;

  const product: ParkingProduct = { id, type, lot, terminal, meet: r.meet === true, drop: r.drop === true };
  if (r.hidden === true) product.hidden = true;
  const note = typeof r.transferNote === 'string' ? r.transferNote.trim() : '';
  if (note) product.transferNote = note.slice(0, 120);
  const minutes = Number(r.transferMinutes);
  if (Number.isInteger(minutes) && minutes > 0 && minutes <= 180) product.transferMinutes = minutes;
  if (r.keyHandover === 'leave' || r.keyHandover === 'keep') product.keyHandover = r.keyHandover;
  if (r.evCharging === 'yes' || r.evCharging === 'no') product.evCharging = r.evCharging;
  const hours = parseHours(r.hours);
  if (hours) product.hours = hours;
  const meetHours = parseHours(r.meetHours);
  if (meetHours && product.meet) product.meetHours = meetHours;
  return product;
}

function parseHours(raw: unknown): ParkingProduct['hours'] | undefined {
  const h = raw as Record<string, unknown> | undefined;
  if (h?.allDay === true) return { allDay: true };
  if (h && HHMM.test(String(h.open)) && HHMM.test(String(h.close))) {
    return { open: String(h.open), close: String(h.close) };
  }
  return undefined;
}

export function parseParkingProducts(raw: unknown): ParkingProduct[] | undefined {
  if (!Array.isArray(raw)) return undefined;
  return raw
    .map(parseParkingProduct)
    .filter((p): p is ParkingProduct => p !== null)
    .slice(0, PRODUCT_LIMIT);
}

/** 상품 필드가 없는 업체 — 대면 요금이 있으면 대면만, 없으면 비대면만 받는 valet 상품 */
function legacyProducts(company: Company): ParkingProduct[] {
  const terminal: ParkingProduct['terminal'] =
    company.terminals.length === 1 && (company.terminals[0] === 'T1' || company.terminals[0] === 'T2')
      ? company.terminals[0]
      : 'both';
  const meet = typeof company.valetFeeT1 === 'number' || typeof company.valetFeeT2 === 'number';
  const lots: ParkingProduct['lot'][] = [];
  if (companySupportsIndoor(company)) lots.push('indoor');
  if (companySupportsOutdoor(company)) lots.push('outdoor');
  return lots.map((lot) => ({ id: `pp_valet_${lot}`, type: 'valet', lot, terminal, meet, drop: !meet }));
}

export function visibleParkingProducts(company: Company): ParkingProduct[] {
  const products = company.parkingProducts ?? legacyProducts(company);
  return products.filter((p) => !p.hidden);
}

function coversTerminal(product: ParkingProduct, terminal: Terminal): boolean {
  return product.terminal === 'both' || product.terminal === terminal;
}

/**
 * 검색 조건(실내/야외·터미널, 지정 시 대면/비대면)에 맞는 상품.
 * 대면은 업체에 그 터미널 대면 요금 필드가 있어야 한다 (0원 포함).
 */
export function findParkingProduct(
  company: Company,
  search: { isIndoor: boolean; terminal: Terminal },
  faceToFace?: boolean
): ParkingProduct | null {
  const lot = search.isIndoor ? 'indoor' : 'outdoor';
  const meetFee = search.terminal === 'T2' ? company.valetFeeT2 : company.valetFeeT1;
  return (
    visibleParkingProducts(company).find((p) => {
      if (p.lot !== lot || !coversTerminal(p, search.terminal)) return false;
      if (faceToFace === true) return p.meet && typeof meetFee === 'number';
      if (faceToFace === false) return p.drop;
      return p.meet || p.drop;
    }) ?? null
  );
}

/** 손님 화면 한국어. 영어는 뱃지(`valetHandoffBadge`)만 */
export function valetHandoffTitle(meet: boolean): string {
  return meet ? '출국장에서 인계' : '단기주차장 입고';
}

export function valetHandoffBadge(meet: boolean): 'Curbside' | 'Drop-off' {
  return meet ? 'Curbside' : 'Drop-off';
}

/** 비대면 입고 추가요금 — 필드 없음=0원 */
export function companyDropFee(company: Company, terminal: Terminal): number {
  const fee = terminal === 'T2' ? company.dropFeeT2 : company.dropFeeT1;
  return typeof fee === 'number' && fee > 0 ? fee : 0;
}

export interface ParkingProductFacts {
  key?: string;
  ev?: string;
  hours?: string;
  meetHours?: string;
  transfer?: string;
}

/**
 * 업체가 입력한 항목 위주. 예외 기본값(대표 확인):
 * 전기차 미입력 = 불가, 대면 시간 미입력 = 24시간 대면 운영
 */
export function parkingProductFacts(product: ParkingProduct | null): ParkingProductFacts {
  if (!product) return {};
  const facts: ParkingProductFacts = {};
  if (product.keyHandover === 'leave') facts.key = '키를 맡깁니다';
  if (product.keyHandover === 'keep') facts.key = '키를 직접 보관합니다';
  facts.ev = product.evCharging === 'yes' ? '전기차 충전 가능' : '전기차 충전 불가';
  if (product.hours) {
    facts.hours = 'allDay' in product.hours ? '연중무휴' : `${product.hours.open}–${product.hours.close} 영업`;
  }
  if (product.meet) {
    const meetHours = product.meetHours ?? { allDay: true };
    if ('allDay' in meetHours) {
      facts.meetHours = '24시간 대면 운영';
    } else {
      const range = `${meetHours.open}–${meetHours.close}`;
      facts.meetHours = product.drop ? `${range} 대면 · 그 외 비대면` : `${range} 대면`;
    }
  } else if (product.drop) {
    facts.meetHours = '모두 비대면';
  }
  const transfer = [product.transferNote, product.transferMinutes ? `약 ${product.transferMinutes}분` : '']
    .filter(Boolean)
    .join(' · ');
  if (transfer) facts.transfer = transfer;
  return facts;
}
