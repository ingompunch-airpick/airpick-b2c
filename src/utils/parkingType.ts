import type { BookingSearch, Company, Terminal } from '../types';
import { isGayuCompany } from './pricing';
import { findParkingProduct } from './parkingProducts';

/** UI·문구 통일 — 실외/야외 혼용 금지 */
export const PARKING_LABEL_INDOOR = '실내';
export const PARKING_LABEL_OUTDOOR = '야외';

/** 해당 터미널 발렛(직접 인계) 추가요금 — 없으면 null */
export function companyValetFee(company: Company, terminal: Terminal): number | null {
  const fee = terminal === 'T2' ? company.valetFeeT2 : company.valetFeeT1;
  return typeof fee === 'number' ? fee : null;
}

/** 주차 상품 중 이 터미널에서 대면/비대면을 받는 것이 있는지 (실내·야외 무관) */
export function companyMatchesHandoff(
  company: Company,
  terminal: Terminal,
  faceToFace: boolean
): boolean {
  return (
    findParkingProduct(company, { isIndoor: true, terminal }, faceToFace) != null ||
    findParkingProduct(company, { isIndoor: false, terminal }, faceToFace) != null
  );
}

export function parkingTypeLabel(isIndoor: boolean): string {
  return isIndoor ? PARKING_LABEL_INDOOR : PARKING_LABEL_OUTDOOR;
}

function hasIndoorFeeConfig(company: Company): boolean {
  return (
    company.indoorBasePrice != null ||
    company.indoorBaseDays != null ||
    company.indoorExtraPrice != null
  );
}

function hasOutdoorFeeConfig(company: Company): boolean {
  return (
    company.outdoorBasePrice != null ||
    company.outdoorBaseDays != null ||
    company.outdoorExtraPrice != null
  );
}

/** 실내 주차장(실내 요금) 보유 업체 */
export function companySupportsIndoor(company: Company): boolean {
  if (isGayuCompany(company.id, company.name)) return false;

  if (company.pricingProfile === 'gayu-pricing') return false;

  if (company.indoorPricingProfile) return true;

  if (company.pricingProfile) {
    return company.supports_indoor === true;
  }

  if (typeof company.supports_indoor === 'boolean') {
    return company.supports_indoor;
  }

  if (hasIndoorFeeConfig(company)) return true;
  if (hasOutdoorFeeConfig(company) && !hasIndoorFeeConfig(company)) return false;

  return company.is_indoor !== false;
}

/** 야외 주차장(야외 요금) 보유 업체 */
export function companySupportsOutdoor(company: Company): boolean {
  if (isGayuCompany(company.id, company.name)) return true;

  if (company.pricingProfile === 'gayu-pricing') return true;

  if (company.outdoorPricingProfile) return true;

  if (company.pricingProfile) {
    return company.supports_outdoor === true;
  }

  if (typeof company.supports_outdoor === 'boolean') {
    return company.supports_outdoor;
  }

  if (hasOutdoorFeeConfig(company)) return true;
  if (hasIndoorFeeConfig(company) && !hasOutdoorFeeConfig(company)) return false;

  return company.supports_outdoor !== false;
}

/** 실내/야외·터미널이 맞는 노출 상품이 있는 업체. 대면/비대면 구분은 홈 목록에서 한다 */
export function companyMatchesSearch(company: Company, search: BookingSearch): boolean {
  if (company.terminals?.length && !company.terminals.includes(search.terminal)) {
    return false;
  }
  return findParkingProduct(company, search) != null;
}
