import type { CompanyReviewSnapshot } from '../lib/reviews';
import type { BookingSearch, Company, Terminal } from '../types';
import { isCompanySoldOutForSearch } from './bookingPolicy';
import { companyMatchesSearch, companyValetFee } from './parkingType';
import { calculatePrice, checkIsNightSurcharge, getParkingDayCount, isGayuCompany } from './pricing';
import { calculateGayuParkingPrice, type PricingTerminal } from './pricingProfiles';

export { companyMatchesSearch, companySupportsIndoor, companySupportsOutdoor } from './parkingType';

export function isAirpickPartner(company: Company): boolean {
  return company.isAirpickPartner !== false;
}

export interface PricedCompany {
  company: Company;
  price: number;
  /** 검색 일정 기준 예약 마감·만차 — 목록에 남기되 선택 불가 */
  soldOut?: boolean;
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
      soldOut: isCompanySoldOutForSearch(company, search),
    }));
}

/** 예약 가능 업체 먼저 → 만차는 하단 (그룹 내 기존 정렬 유지) */
function sortSoldOutLast(items: PricedCompany[]): PricedCompany[] {
  const open = items.filter((it) => !it.soldOut);
  const full = items.filter((it) => it.soldOut);
  return [...open, ...full];
}

/** 그룹 내 가격 오름차순 → 실후기 수·평점(있을 때만) → 이름 */
function sortByPrice(items: PricedCompany[]): PricedCompany[] {
  return sortSoldOutLast(
    [...items].sort((a, b) => {
      if (a.price !== b.price) return a.price - b.price;
      const aReviews = a.company.reviews_count || 0;
      const bReviews = b.company.reviews_count || 0;
      if (aReviews !== bReviews) return bReviews - aReviews;
      if (aReviews > 0 && bReviews > 0) {
        const ratingDiff = (b.company.rating || 0) - (a.company.rating || 0);
        if (ratingDiff !== 0) return ratingDiff;
      }
      return a.company.name.localeCompare(b.company.name, 'ko');
    })
  );
}

export interface ParkingCompareSections {
  partners: PricedCompany[];
  externals: PricedCompany[];
}

/** 대면 희망 시: 대면 가능 입점 업체를 상단으로(그 안에서 최저가순) */
function sortPartnersForSearch(items: PricedCompany[], search: BookingSearch): PricedCompany[] {
  const byPrice = sortByPrice(items);
  if (!search.faceToFace) return byPrice;
  const capable = byPrice.filter(
    (it) => !it.soldOut && companyValetFee(it.company, search.terminal) != null
  );
  const rest = byPrice.filter(
    (it) => it.soldOut || companyValetFee(it.company, search.terminal) == null
  );
  return sortSoldOutLast([...capable, ...rest]);
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

/** 입점 업체만 · 실후기 평점 높은 순 (후기 없으면 하단) */
export function sortPartnersByRating(
  items: PricedCompany[],
  reviewSnapshots: Record<string, CompanyReviewSnapshot>
): PricedCompany[] {
  return sortSoldOutLast(
    [...items].sort((a, b) => {
      const aSnap = reviewSnapshots[a.company.id];
      const bSnap = reviewSnapshots[b.company.id];
      const aRating =
        aSnap?.averageRating ?? (a.company.rating > 0 ? a.company.rating : null);
      const bRating =
        bSnap?.averageRating ?? (b.company.rating > 0 ? b.company.rating : null);
      const aCount = aSnap?.count ?? a.company.reviews_count ?? 0;
      const bCount = bSnap?.count ?? b.company.reviews_count ?? 0;

      if (aRating == null && bRating == null) {
        return a.company.name.localeCompare(b.company.name, 'ko');
      }
      if (aRating == null) return 1;
      if (bRating == null) return -1;
      if (bRating !== aRating) return bRating - aRating;
      if (bCount !== aCount) return bCount - aCount;
      if (a.price !== b.price) return a.price - b.price;
      return a.company.name.localeCompare(b.company.name, 'ko');
    })
  );
}

export function buildPartnerRatingList(
  companies: Company[],
  search: BookingSearch,
  reviewSnapshots: Record<string, CompanyReviewSnapshot>
): PricedCompany[] {
  const priced = priceCompaniesForSearch(companies, search).filter((item) =>
    isAirpickPartner(item.company)
  );
  return sortPartnersByRating(priced, reviewSnapshots);
}
