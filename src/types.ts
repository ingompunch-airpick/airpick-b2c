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
}

export type Terminal = 'T1' | 'T2';

export interface BookingSearch {
  departureDate: string;
  arrivalDate: string;
  departureTime: string;
  arrivalTime: string;
  terminal: Terminal;
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
