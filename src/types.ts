export interface CompanyInsurance {
  enrolled: boolean;
  provider?: string;
  productName?: string;
  /** 표시·집계 시 {@link CANONICAL_INSURANCE_PRODUCT_NAME} 권장 (레거시: 발렛보험) */
  coverageLimitWon?: number;
  /** 보험증권 이미지·PDF URL (손님 상세에서 확인) */
  certificateUrl?: string;
  updatedAt?: string;
}

/** B2B 입점 심사 서류 — 사업자등록증·주차장 계약서 */
export interface CompanyVerificationDocuments {
  businessRegistrationUrl?: string;
  parkingContractUrl?: string;
}

/** B2B 업체 주차장 (실내·야외 다수) */
export interface CompanyParkingLot {
  id: string;
  type: 'indoor' | 'outdoor';
  /** 표시 이름 — 예: 실내1, 야외2 */
  name: string;
  parkingAddress: string;
  lat?: number;
  lng?: number;
  mapUrl?: string;
  photos?: string[];
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
  /** B2B 주차장 갤러리 (첫 장 ≈ image_url) */
  image_urls?: string[];
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
  /** 발렛(직접 인계) 추가요금 — 터미널별. 있으면 가격에 포함 */
  valetFeeT1?: number;
  valetFeeT2?: number;
  peakStartTime?: string;
  peakEndTime?: string;
  peakSurcharge?: number;
  status?: string;
  /** 손님 셀프 취소 마감 — 입고 O시간 전 (미지정 시 기본값) */
  cancelCutoffHours?: number;
  /** true면 입고일이 오늘인 예약 차단 (B2B 설정) */
  sameDayBookingBlocked?: boolean;
  /** true일 때만 시간당 입고 한도 적용 (B2B 설정, 기본 OFF) */
  hourlyCapEnabled?: boolean;
  /** 시간당 최대 대수 1–99. hourlyCapEnabled일 때만 */
  maxCarsPerHour?: number;
  sharesParkingLocation?: boolean;
  sharesPhotos?: boolean;
  sharesInsurance?: boolean;
  /** B2B 마스터 — 업체 보험 안내 (표시용) */
  insurance?: CompanyInsurance;
  /** B2B 업로드 — 사업자등록증·주차장 계약서 */
  verificationDocuments?: CompanyVerificationDocuments;
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
  /** B2B 핀 · 실내 주차장 좌표 */
  indoorParkingLat?: number;
  indoorParkingLng?: number;
  /** B2B 핀 · 야외 주차장 좌표 */
  outdoorParkingLat?: number;
  outdoorParkingLng?: number;
  /** 손님 MY · 주차장 시설 사진 (B2B 등록) */
  indoorParkingPhotos?: string[];
  outdoorParkingPhotos?: string[];
  /** B2B parkingLots[] — 실내·야외 여러 곳 */
  parkingLots?: CompanyParkingLot[];
  /** true(기본): 에어픽 앱에서 바로 예약 · false: 홈페이지 링크만 */
  isAirpickPartner?: boolean;
  /** 레거시: 외부 예약 URL (미사용) */
  externalBookingUrl?: string;
  /** B2B 픽업지 안내 (고객 만남 장소) */
  pickupLocation?: string;
  /**
   * 파트너 홈 이용방법 steps
   * companies/{id}.partnerHomepage.config.steps
   */
  usageSteps?: { title: string; body: string; mediaSrc?: string }[];
  /** 업체별 요금 산식 (단일) */
  pricingProfile?: string;
  /** 실내·야외 요금이 다른 업체 — 검색 조건에 따라 선택 */
  indoorPricingProfile?: string;
  outdoorPricingProfile?: string;
  /** B2B 입력 · 터미널별 현재 주차장 거리 (계약 변경 시 업데이트) — 레거시 폴백 */
  parkingDistances?: CompanyParkingDistances;
  /** 실내 대표 주차장 T1/T2 거리 */
  parkingDistancesIndoor?: CompanyParkingDistances;
  /** 야외 대표 주차장 T1/T2 거리 */
  parkingDistancesOutdoor?: CompanyParkingDistances;
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
  /** airpick-b2c | homepage | b2b — 신뢰 정보(위치·사진) 노출 구분 */
  createdBy?: string;
  /** 손님이 대면(출국장 앞 직접 인계) 입고를 요청함 (입점 예약) */
  faceToFace?: boolean;
  /** 대면 입고 발렛비 (totalPrice에 이미 포함) */
  valetFee?: number;
  /** 에어픽 B2C 제휴·추천 코드 */
  affiliateCode?: string;
  /** 예약 시점 스냅샷 — 손님 할인(원) */
  affiliateCustomerDiscountWon?: number;
  /** 예약 시점 스냅샷 — 제휴 페이백(원) */
  affiliateReferrerCreditWon?: number;
  /** 출고 완료 예약에 대한 업체 후기 작성 여부 (lookup API) */
  hasReview?: boolean;
  /** B2B 입고 완료 담당 (직원 이름 또는 「업체 담당」) */
  checkedInBy?: string;
  checkedInAt?: string;
  /** B2B 출고 완료 담당 */
  checkedOutBy?: string;
  checkedOutAt?: string;
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

export type CompareSortMode = 'price' | 'rating';

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
  /** 신용카드 결제 시 요금 +10% 반영 (현장 카드) */
  isCardPayment?: boolean;
  /** 입점 업체 대면(출국장 앞 직접 인계) 입고 희망 — 대면 가능 업체 우선·발렛비 합산 */
  faceToFace?: boolean;
}

export type AppTab = 'home' | 'compare' | 'esim' | 'my';

export interface CompanyReview {
  id: string;
  companyId: string;
  rating: number;
  body?: string;
  /** 후기 사진 URL (선택) */
  photoUrls?: string[];
  authorMask: string;
  /** 끝 2자리 마스킹 차량번호 — 없으면 미표시 */
  carMask?: string;
  createdAt: string;
}

