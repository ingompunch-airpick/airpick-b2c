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
  hasInsurance?: boolean;
  insuranceProvider?: string;
  insuranceLimit?: number;
  /** 손님 MY · 실내 주차장 도로명 주소 */
  indoorParkingAddress?: string;
  /** 손님 MY · 실외 주차장 도로명 주소 */
  outdoorParkingAddress?: string;
  indoorParkingMapUrl?: string;
  outdoorParkingMapUrl?: string;
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
  insuranceProvider?: string;
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
}

export type AppTab = 'home' | 'compare' | 'esim' | 'my';

export interface EsimProduct {
  id: string;
  name: string;
  region: string;
  regionCode: string;
  dataLabel: string;
  days: number;
  price: number;
  type: 'esim' | 'usim';
  description?: string;
  isActive?: boolean;
}
