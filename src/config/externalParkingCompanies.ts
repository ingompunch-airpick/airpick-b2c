import type { Company } from '../types';

const PLACEHOLDER_IMAGE =
  'https://images.unsplash.com/photo-1542282088-fe8426682b8f?auto=format&fit=crop&q=80';

function externalCompany(
  partial: Pick<Company, 'id' | 'name' | 'externalBookingUrl'> & Partial<Company>
): Company {
  return {
    isAirpickPartner: false,
    is_indoor: true,
    supports_indoor: true,
    supports_outdoor: true,
    base_price: 0,
    base_days: 1,
    extra_day_price: 0,
    rating: 0,
    reviews_count: 0,
    features: [],
    image_url: PLACEHOLDER_IMAGE,
    terminals: ['T1', 'T2'],
    isOpen: true,
    ...partial,
  };
}

/** 에어픽 미입점 주차대행 업체 (실제 요금표 기준) */
export const externalParkingCompanies: Company[] = [
  externalCompany({
    id: 'airport-valet',
    name: '에어포트 주차대행 (실내)',
    externalBookingUrl: 'http://www.air-port.co.kr/',
    pricingProfile: 'airport-pricing',
    supports_indoor: true,
    supports_outdoor: false,
    is_indoor: true,
  }),
  externalCompany({
    id: 'gate-valet',
    name: '게이트 주차대행',
    externalBookingUrl: 'https://xn--o79ak6j18s2nb9zg78lk2e.com/',
    indoorPricingProfile: 'gate-indoor-pricing',
    outdoorPricingProfile: 'gate-outdoor-pricing',
    supports_indoor: true,
    supports_outdoor: true,
  }),
  externalCompany({
    id: 'mampyeonhan-valet',
    name: '맘편한 주차대행',
    externalBookingUrl: 'https://www.xn--vk1bu3ki7n26csym9ncdj.com/',
    pricingProfile: 'mampyeonhan-pricing',
    supports_indoor: false,
    supports_outdoor: true,
    is_indoor: false,
  }),
  externalCompany({
    id: 'plain-valet',
    name: '플레인 주차대행',
    externalBookingUrl: 'https://www.xn--vk1bk9g0xpmob95gcwqfza.com/',
    pricingProfile: 'plain-pricing',
    supports_indoor: false,
    supports_outdoor: true,
    is_indoor: false,
  }),
  externalCompany({
    id: 'danyeowa-valet',
    name: '다녀와 주차대행',
    externalBookingUrl: 'https://www.xn--260b34apc815g99ch3fiyt.com/',
    pricingProfile: 'danyeowa-pricing',
    supports_indoor: false,
    supports_outdoor: true,
    is_indoor: false,
  }),
  externalCompany({
    id: 'atelier-valet',
    name: '아뜰리엔 주차대행',
    externalBookingUrl: 'http://www.xn--oy2b15snmay04b.com/',
    pricingProfile: 'atelier-outdoor-pricing',
    supports_indoor: false,
    supports_outdoor: true,
    is_indoor: false,
  }),
  externalCompany({
    id: 'honest-valet',
    name: '정직한 주차대행',
    externalBookingUrl: 'https://honestvalet.co.kr/',
    indoorPricingProfile: 'honest-indoor-pricing',
    outdoorPricingProfile: 'honest-outdoor-pricing',
    supports_indoor: true,
    supports_outdoor: true,
  }),
  externalCompany({
    id: 'onair-valet',
    name: '온에어 주차대행',
    externalBookingUrl: 'http://www.xn--oh5b1b3n868a8yc.com/',
    pricingProfile: 'onair-indoor-pricing',
    supports_indoor: true,
    supports_outdoor: false,
    is_indoor: true,
  }),
  externalCompany({
    id: 'parkingone-valet',
    name: '파킹원 주차대행',
    externalBookingUrl: 'https://www.parkingone.co.kr/',
    pricingProfile: 'parkingone-indoor-pricing',
    supports_indoor: true,
    supports_outdoor: false,
    is_indoor: true,
  }),
];

/** @deprecated externalParkingCompanies 사용 */
export const EXTERNAL_PARKING_COMPANIES = externalParkingCompanies;
