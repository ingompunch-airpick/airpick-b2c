export interface CompanyInsurance {
  enrolled: boolean;
  provider?: string;
  productName?: string;
  coverageLimitWon?: number;
  updatedAt?: string;
}

export interface Company {
  id: string;
  name: string;
  is_indoor: boolean;
  supports_indoor: boolean;
  supports_outdoor: boolean;
  base_price: number;
  extra_day_price: number;
  base_days: number;
  rating: number;
  reviews_count: number;
  features: string[];
  image_url: string;
  terminals: string[];
  phone?: string;
  representative?: string;
  isOpen?: boolean;
  blockedDates?: string[];
  outdoorBasePrice?: number;
  outdoorBaseDays?: number;
  outdoorExtraPrice?: number;
  indoorBasePrice?: number;
  indoorBaseDays?: number;
  indoorExtraPrice?: number;
  surchargeStartTime?: string;
  surchargeEndTime?: string;
  surchargePrice?: number;
  t2Surcharge?: number;
  peakStartTime?: string;
  peakEndTime?: string;
  peakSurcharge?: number;
  status?: string;
  sharesParkingLocation?: boolean;
  sharesPhotos?: boolean;
  sharesInsurance?: boolean;
  /** B2B 마스터 — 업체 보험 안내 (표시용) */
  insurance?: CompanyInsurance;
  /** @deprecated insurance.enrolled 사용 */
  hasInsurance?: boolean;
  /** @deprecated insurance.provider 사용 */
  insuranceProvider?: string;
  /** @deprecated insurance.coverageLimitWon 사용 */
  insuranceLimit?: number;
  /** 손님 MY · 실내 주차장 도로명 주소 */
  indoorParkingAddress?: string;
  /** 손님 MY · 야외 주차장 도로명 주소 */
  outdoorParkingAddress?: string;
  indoorParkingMapUrl?: string;
  outdoorParkingMapUrl?: string;
  /** 손님 MY · 주차장 시설 사진 (B2B 등록) */
  indoorParkingPhotos?: string[];
  outdoorParkingPhotos?: string[];
  /** true(기본): 에어픽 앱에서 바로 예약 · false: 홈페이지 링크만 */
  isAirpickPartner?: boolean;
  /** 미입점 업체 예약 페이지 */
  externalBookingUrl?: string;
  /** 업체별 요금 산식 (단일) */
  pricingProfile?: string;
  /** 실내·야외 요금이 다른 업체 — 검색 조건에 따라 선택 */
  indoorPricingProfile?: string;
  outdoorPricingProfile?: string;
  /** B2B 입력 · 터미널별 현재 주차장 거리 (계약 변경 시 업데이트) */
  parkingDistances?: CompanyParkingDistances;
}

export interface Reservation {
  id: string;
  companyId: string;
  companyName: string;
  userName: string;
  carNumber: string;
  phone: string;
  carModel: string;
  departureDate: string;
  departureTime: string;
  arrivalDate: string;
  arrivalTime: string;
  departureTerminal: string;
  arrivalTerminal?: string;
  totalPrice: number;
  status: string;
  isIndoor: boolean;
  createdAt: string;
  paymentMethod?: string;
  parkingLocation?: string;
  parkingLocationUrl?: string;
  parkingSpace?: string;
  images?: string[];
  insurance?: CompanyInsurance;
  /** @deprecated insurance 사용 */
  insuranceProvider?: string;
  /** @deprecated insurance 사용 */
  insuranceLimit?: number;
  checkInPhotos?: string[];
  checkOutPhotos?: string[];
  scratchPhotos?: {
    synced?: boolean;
    urls?: string[];
    front?: string;
    rear?: string;
    left?: string;
    right?: string;
  };
  departureAirline?: string;
  departureFlight?: string;
  arrivalAirline?: string;
  arrivalFlight?: string;
  destination?: string;
  customerNotes?: string;
}

export type ReservationLookupMode = 'carNumber' | 'phone';

export type Terminal = 'T1' | 'T2';

/** Firestore `companies/{id}.parkingDistances.T1|T2` */
export interface ParkingDistanceEntry {
  distanceKm: number;
  driveMinutes?: number;
  parkingLotName?: string;
  parkingLotAddress?: string;
  /** 이 주차장 사용 시작일 (YYYY-MM-DD) */
  effectiveFrom?: string;
  updatedAt?: string;
}

export type CompanyParkingDistances = Partial<Record<Terminal, ParkingDistanceEntry>>;

export type CompareSortMode = 'price' | 'distance';

export interface BookingSearch {
  departureDate: string;
  arrivalDate: string;
  departureTime: string;
  arrivalTime: string;
  /** 입국(출국) 터미널 */
  terminal: Terminal;
  /** 귀국 터미널 — 없으면 terminal과 동일 */
  arrivalTerminal?: Terminal;
  isIndoor: boolean;
  /** 신용카드 결제 시 미입점 업체 요금 +10% 반영 */
  isCardPayment?: boolean;
}

export type AppTab = 'home' | 'compare' | 'esim' | 'my';

export interface CompanyReview {
  id: string;
  companyId: string;
  rating: number;
  body?: string;
  authorMask: string;
  createdAt: string;
}

export type EsimDataPlan = '500mb' | '1gb' | '2gb' | '3gb' | '4gb' | '5gb' | 'unlimited';
export type EsimSpeed = 'lte' | '5g';
export type EsimSimType = 'esim' | 'usim';

/** 유심 탭 필터 — 유형 · 나라 · 용량 · 일수 */
export interface EsimSearch {
  simType: EsimSimType;
  countryCode: string;
  dataPlan: EsimDataPlan;
  days: number;
}

export interface EsimProduct {
  id: string;
  /** 제휴사 표시명 */
  partnerName: string;
  /** 제휴사 구매·상세 랜딩 URL */
  partnerUrl: string;
  name: string;
  region: string;
  countryCode: string;
  dataPlan: EsimDataPlan;
  speed: EsimSpeed;
  days: number;
  /** 비교용 참고가 (제휴사 실결제가와 다를 수 있음) */
  price: number;
  type: EsimSimType;
  description?: string;
  isActive?: boolean;
}
