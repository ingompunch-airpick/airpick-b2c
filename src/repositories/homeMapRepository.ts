/**
 * 홈 지도 허브 데이터 접근 계층.
 * 현재: Sheet/정적 데이터·Firestore 구독 결과를 조합.
 * 이후: MySQL/PostgreSQL 등으로 교체해도 UI는 이 인터페이스만 보면 됨.
 */
import { ESIM_COUNTRIES } from '../config/esimCountries';
import { ESIM_PARTNER_OFFERS } from '../config/esimPartnerOffers';
import { OFFICIAL_PARKING_LOTS, type OfficialParkingLot } from '../data/officialParkingLots';
import type { Company } from '../types';
import { ICN_TERMINAL_COORDS } from '../utils/airportDistance';
import { isAirpickPartner } from '../utils/compareSort';
import { displayCompanyName } from '../utils/display';
import { calculatePrice } from '../utils/pricing';
import { defaultBookingSearch } from '../utils/dates';

export type MapPinKind = 'pickup' | 'service' | 'lot';

export interface HomeMapPin {
  id: string;
  kind: MapPinKind;
  label: string;
  lat: number;
  lng: number;
  terminal?: 'T1' | 'T2';
}

export interface ValetPartnerCard {
  id: string;
  name: string;
  imageUrl: string;
  price: number;
  insuranceEnrolled: boolean;
  sharesPhotos: boolean;
  rating: number | null;
  reviewCount: number;
}

export interface EsimCountryCard {
  countryCode: string;
  name: string;
  offerCount: number;
  fromPrice: number;
}

export function getValetServicePins(): HomeMapPin[] {
  return [
    {
      id: 'pickup-t1',
      kind: 'pickup',
      label: 'T1 픽업존',
      lat: ICN_TERMINAL_COORDS.T1.lat,
      lng: ICN_TERMINAL_COORDS.T1.lng,
      terminal: 'T1',
    },
    {
      id: 'pickup-t2',
      kind: 'pickup',
      label: 'T2 픽업존',
      lat: ICN_TERMINAL_COORDS.T2.lat,
      lng: ICN_TERMINAL_COORDS.T2.lng,
      terminal: 'T2',
    },
    {
      id: 'airpick-service',
      kind: 'service',
      label: '에어픽',
      // T1·T2 중간 부근 — 서비스 허브 표시용 (보관 위치 아님)
      lat: (ICN_TERMINAL_COORDS.T1.lat + ICN_TERMINAL_COORDS.T2.lat) / 2,
      lng: (ICN_TERMINAL_COORDS.T1.lng + ICN_TERMINAL_COORDS.T2.lng) / 2,
    },
  ];
}

export function getOfficialLotPins(): HomeMapPin[] {
  return OFFICIAL_PARKING_LOTS.map((lot) => ({
    id: lot.id,
    kind: 'lot' as const,
    label: lot.name,
    lat: lot.lat,
    lng: lot.lng,
    terminal: lot.terminal,
  }));
}

export function listOfficialParkingLots(): OfficialParkingLot[] {
  return OFFICIAL_PARKING_LOTS;
}

export function listValetPartnerCards(companies: Company[]): ValetPartnerCard[] {
  const search = defaultBookingSearch();
  return companies
    .filter((c) => isAirpickPartner(c))
    .map((company) => {
      const price = calculatePrice(
        company,
        search.departureDate,
        search.arrivalDate,
        search.isIndoor,
        false, // 홈 참고가: 기본 T1 일정
        search.departureTime,
        search.arrivalTime,
        false
      );
      const insuranceEnrolled =
        company.insurance?.enrolled === true ||
        company.hasInsurance === true ||
        company.sharesInsurance === true;
      return {
        id: company.id,
        name: displayCompanyName(company.name),
        imageUrl: company.image_url,
        price,
        insuranceEnrolled,
        sharesPhotos: company.sharesPhotos === true,
        rating: company.rating > 0 ? company.rating : null,
        reviewCount: company.reviews_count || 0,
      };
    })
    .sort((a, b) => a.price - b.price);
}

export function listEsimCountryCards(): EsimCountryCard[] {
  const active = ESIM_PARTNER_OFFERS.filter((p) => p.isActive !== false);
  return ESIM_COUNTRIES.map((country) => {
    const offers = active.filter((p) => p.countryCode === country.code);
    const fromPrice = offers.length > 0 ? Math.min(...offers.map((p) => p.price)) : 0;
    return {
      countryCode: country.code,
      name: country.name,
      offerCount: offers.length,
      fromPrice,
    };
  }).filter((c) => c.offerCount > 0);
}
