import type { BookingSearch, Company, Terminal } from '../types';
import { companyMatchesSearch } from './parkingType';
import { calculatePrice, checkIsNightSurcharge, getParkingDayCount, isGayuCompany } from './pricing';
import {
  calculateGayuParkingPrice,
  calculateRealParkingPrice,
  resolveCompanyPricingProfile,
  type PricingTerminal,
} from './pricingProfiles';
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

  if (isGayuCompany(company.id, company.name) || company.pricingProfile === 'gayu-pricing') {
    return calculateGayuParkingPrice({
      totalDays,
      terminal,
      isCard,
      departureDate: search.departureDate,
      arrivalDate: search.arrivalDate,
      departureTime: search.departureTime,
      arrivalTime: search.arrivalTime,
      checkNightSurcharge: checkIsNightSurcharge,
    });
  }

  const profileId = resolveCompanyPricingProfile(company, search.isIndoor);
  if (profileId) {
    return calculateRealParkingPrice(profileId, totalDays, terminal, isCard, {
      departureDate: search.departureDate,
      arrivalDate: search.arrivalDate,
      departureTime: search.departureTime,
      arrivalTime: search.arrivalTime,
      checkNightSurcharge: checkIsNightSurcharge,
    });
  }

  const isT2 = search.terminal === 'T2';
  return calculatePrice(
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

/** 입점 업체 먼저(그룹 내 최저가순) → 그 아래 비입점 업체 */
export function buildParkingCompareSections(
  companies: Company[],
  search: BookingSearch
): ParkingCompareSections {
  const priced = priceCompaniesForSearch(companies, search);
  const partners = sortByPrice(priced.filter((item) => isAirpickPartner(item.company)));
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
      distanceKm: getTerminalDistanceKm(item.company, search.terminal),
    }))
  );
}

/** @deprecated buildParkingCompareSections 사용 */
export function buildParkingCompareList(
  companies: Company[],
  search: BookingSearch
): PricedCompany[] {
  const { partners, externals } = buildParkingCompareSections(companies, search);
  return [...partners, ...externals];
}
