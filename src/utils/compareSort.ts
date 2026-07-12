import type { BookingSearch, Company, Terminal } from '../types';
import { companyMatchesSearch, companyValetFee } from './parkingType';
import { calculatePrice, checkIsNightSurcharge, getParkingDayCount, isGayuCompany } from './pricing';
import { calculateGayuParkingPrice, type PricingTerminal } from './pricingProfiles';
import {
  getTerminalDistanceKm,
  sortPartnersByTerminalDistance,
  type DistanceRankedPartner,
} from './terminalDistance';

export { companyMatchesSearch, companySupportsIndoor, companySupportsOutdoor } from './parkingType';

export function isAirpickPartner(company: Company): boolean {
  return company.isAirpickPartner !== false;
}

export interface PricedCompany {
  company: Company;
  price: number;
}

function toPricingTerminal(terminal: Terminal): PricingTerminal {
  return terminal === 'T2' ? '2T' : '1T';
}

export function calculateComparePrice(company: Company, search: BookingSearch): number {
  const totalDays = getParkingDayCount(search.departureDate, search.arrivalDate);
  const terminal = toPricingTerminal(search.terminal);
  /** 비교 화면은 현금·계좌 기준 (카드 결제 시 현장 +10%) */
  const isCard = false;

  let base: number;
  if (isGayuCompany(company.id, company.name) || company.pricingProfile === 'gayu-pricing') {
    base = calculateGayuParkingPrice({
      totalDays,
      terminal,
      isCard,
      departureDate: search.departureDate,
      arrivalDate: search.arrivalDate,
      departureTime: search.departureTime,
      arrivalTime: search.arrivalTime,
      checkNightSurcharge: checkIsNightSurcharge,
    });
  } else {
    /** 출국·귀국 중 한쪽이라도 T2면 T2 할증 1회 부과 */
    const isT2 = search.terminal === 'T2' || (search.arrivalTerminal ?? search.terminal) === 'T2';
    base = calculatePrice(
      company,
      search.departureDate,
      search.arrivalDate,
      search.isIndoor,
      isT2,
      search.departureTime,
      search.arrivalTime,
      isCard
    );
  }

  /**
   * 발렛비 반영:
   * - 미입점(홈페이지 이동): 항상 가격에 포함
   * - 입점(에어픽 예약): 손님이 대면(faceToFace) 선택 시에만 포함
   */
  const valet = companyValetFee(company, search.terminal);
  if (valet != null && (!isAirpickPartner(company) || search.faceToFace)) {
    base += valet;
  }

  return base;
}

export function priceCompaniesForSearch(
  companies: Company[],
  search: BookingSearch
): PricedCompany[] {
  return companies
    .filter((company) => companyMatchesSearch(company, search))
    .map((company) => ({
      company,
      price: calculateComparePrice(company, search),
    }));
}

/** 그룹 내 가격 오름차순 → 평점 → 이름 */
function sortByPrice(items: PricedCompany[]): PricedCompany[] {
  return [...items].sort((a, b) => {
    if (a.price !== b.price) return a.price - b.price;
    const ratingDiff = (b.company.rating || 0) - (a.company.rating || 0);
    if (ratingDiff !== 0) return ratingDiff;
    return a.company.name.localeCompare(b.company.name, 'ko');
  });
}

export interface ParkingCompareSections {
  partners: PricedCompany[];
  externals: PricedCompany[];
}

/** 대면 희망 시: 대면 가능 입점 업체를 상단으로(그 안에서 최저가순) */
function sortPartnersForSearch(items: PricedCompany[], search: BookingSearch): PricedCompany[] {
  const byPrice = sortByPrice(items);
  if (!search.faceToFace) return byPrice;
  const capable = byPrice.filter((it) => companyValetFee(it.company, search.terminal) != null);
  const rest = byPrice.filter((it) => companyValetFee(it.company, search.terminal) == null);
  return [...capable, ...rest];
}

/** 섹션에 해당 터미널 대면 가능 업체가 하나라도 있는지 */
export function sectionHasFaceToFace(items: PricedCompany[], terminal: Terminal): boolean {
  return items.some((item) => companyValetFee(item.company, terminal) != null);
}

/**
 * 입점 업체 먼저(그룹 내 최저가순) → 그 아래 비입점 업체.
 * 입점만 대면 희망 시 대면 가능 업체를 상단으로 정렬한다.
 */
export function buildParkingCompareSections(
  companies: Company[],
  search: BookingSearch
): ParkingCompareSections {
  const priced = priceCompaniesForSearch(companies, search);
  const partners = sortPartnersForSearch(priced.filter((item) => isAirpickPartner(item.company)), search);
  const externals = sortByPrice(priced.filter((item) => !isAirpickPartner(item.company)));
  return { partners, externals };
}

export function buildPartnerDistanceList(
  companies: Company[],
  search: BookingSearch
): DistanceRankedPartner[] {
  const priced = priceCompaniesForSearch(companies, search).filter((item) =>
    isAirpickPartner(item.company)
  );

  return sortPartnersByTerminalDistance(
    priced.map((item) => ({
      company: item.company,
      price: item.price,
      distanceKm: getTerminalDistanceKm(item.company, search.terminal, search.isIndoor),
    }))
  );
}
