import { collection, doc, getDoc, getDocs, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import type { Company } from '../types';
import { deriveParkingAddressesFromCompanyData } from '../utils/companyParking';
import { parseAllParkingDistancesFromFirestore } from '../utils/parkingDistances';
import { parseInsuranceFromFirestore } from '../utils/insurance';
import { mergePartnerPricing } from '../utils/pricing';

export interface CompanyBookingPolicy {
  isOpen: boolean;
  blockedDates: string[];
  sameDayBookingBlocked: boolean;
  hourlyCapEnabled: boolean;
  maxCarsPerHour: number;
}

function normalizeCompany(id: string, data: Record<string, unknown>): Company | null {
  const name = String(data.name || '').trim();
  if (!name) return null;
  if (data.status === 'suspended') return null;

  const insurance = parseInsuranceFromFirestore(data);

  const imageUrlsRaw = Array.isArray(data.image_urls)
    ? (data.image_urls as unknown[])
        .map((u) => String(u || '').trim())
        .filter(Boolean)
    : [];
  const primaryImage = String(data.image_url || '').trim();
  const image_urls =
    imageUrlsRaw.length > 0
      ? imageUrlsRaw
      : primaryImage
        ? [primaryImage]
        : undefined;

  const company: Company = {
    id,
    name,
    is_indoor: data.is_indoor !== false,
    supports_indoor: data.supports_indoor !== false,
    supports_outdoor: data.supports_outdoor !== false,
    base_price: Number(data.base_price) || 15000,
    extra_day_price: Number(data.extra_day_price) || 5000,
    base_days: Number(data.base_days) || 1,
    /** 실후기 집계만 사용. 시드·기본 4.5 등 가짜 평점 금지 */
    rating: Number(data.rating) > 0 ? Number(data.rating) : 0,
    reviews_count: Number(data.reviews_count) > 0 ? Number(data.reviews_count) : 0,
    features: Array.isArray(data.features) ? (data.features as string[]) : [],
    image_url:
      primaryImage ||
      'https://images.unsplash.com/photo-1542282088-fe8426682b8f?auto=format&fit=crop&q=80',
    image_urls,
    terminals: Array.isArray(data.terminals) ? (data.terminals as string[]) : ['T1', 'T2'],
    phone: data.phone ? String(data.phone) : undefined,
    representative: data.representative ? String(data.representative) : undefined,
    isOpen: data.isOpen !== false,
    blockedDates: Array.isArray(data.blockedDates) ? (data.blockedDates as string[]) : [],
    cancelCutoffHours:
      typeof data.cancelCutoffHours === 'number' ? data.cancelCutoffHours : undefined,
    sameDayBookingBlocked: data.sameDayBookingBlocked === true,
    hourlyCapEnabled: data.hourlyCapEnabled === true,
    maxCarsPerHour:
      typeof data.maxCarsPerHour === 'number'
        ? data.maxCarsPerHour
        : Number(data.maxCarsPerHour) || undefined,
    outdoorBasePrice: Number(data.outdoorBasePrice) || undefined,
    outdoorBaseDays: Number(data.outdoorBaseDays) || undefined,
    outdoorExtraPrice: Number(data.outdoorExtraPrice) || undefined,
    indoorBasePrice: Number(data.indoorBasePrice) || undefined,
    indoorBaseDays: Number(data.indoorBaseDays) || undefined,
    indoorExtraPrice: Number(data.indoorExtraPrice) || undefined,
    surchargeStartTime: data.surchargeStartTime ? String(data.surchargeStartTime) : undefined,
    surchargeEndTime: data.surchargeEndTime ? String(data.surchargeEndTime) : undefined,
    surchargePrice: Number(data.surchargePrice) || undefined,
    t2Surcharge: Number(data.t2Surcharge) || undefined,
    valetFeeT1: typeof data.valetFeeT1 === 'number' ? data.valetFeeT1 : undefined,
    valetFeeT2: typeof data.valetFeeT2 === 'number' ? data.valetFeeT2 : undefined,
    peakStartTime: data.peakStartTime ? String(data.peakStartTime) : undefined,
    peakEndTime: data.peakEndTime ? String(data.peakEndTime) : undefined,
    peakSurcharge: Number(data.peakSurcharge) || undefined,
    status: data.status ? String(data.status) : 'active',
    sharesParkingLocation: data.sharesParkingLocation !== false,
    sharesPhotos: data.sharesPhotos !== false,
    sharesInsurance: data.sharesInsurance !== false,
    isAirpickPartner: data.isAirpickPartner !== false,
    externalBookingUrl: data.externalBookingUrl ? String(data.externalBookingUrl) : undefined,
    pricingProfile: data.pricingProfile ? String(data.pricingProfile) : undefined,
    indoorPricingProfile: data.indoorPricingProfile
      ? String(data.indoorPricingProfile)
      : undefined,
    outdoorPricingProfile: data.outdoorPricingProfile
      ? String(data.outdoorPricingProfile)
      : undefined,
    insurance,
    hasInsurance: insurance?.enrolled,
    insuranceProvider: insurance?.provider,
    insuranceLimit: insurance?.coverageLimitWon,
    ...parseAllParkingDistancesFromFirestore(data),
    ...deriveParkingAddressesFromCompanyData(data),
  };

  return mergePartnerPricing(company);
}

export async function fetchCompanyBookingPolicy(
  companyId: string
): Promise<CompanyBookingPolicy | null> {
  const snap = await getDoc(doc(db, 'companies', companyId));
  if (!snap.exists()) return null;
  const data = snap.data() as Record<string, unknown>;
  return {
    isOpen: data.isOpen !== false,
    blockedDates: Array.isArray(data.blockedDates) ? (data.blockedDates as string[]) : [],
    sameDayBookingBlocked: data.sameDayBookingBlocked === true,
    hourlyCapEnabled: data.hourlyCapEnabled === true,
    maxCarsPerHour:
      typeof data.maxCarsPerHour === 'number'
        ? Math.max(0, Math.min(99, Math.floor(data.maxCarsPerHour)))
        : Math.max(0, Math.min(99, Math.floor(Number(data.maxCarsPerHour) || 0))),
  };
}

export async function fetchCompanies(): Promise<Company[]> {
  const snap = await getDocs(collection(db, 'companies'));
  return snap.docs
    .map((d) => normalizeCompany(d.id, d.data() as Record<string, unknown>))
    .filter((c): c is Company => c !== null && c.isOpen !== false)
    .sort((a, b) => a.name.localeCompare(b.name, 'ko'));
}

export function subscribeCompanies(onData: (companies: Company[]) => void): () => void {
  return onSnapshot(collection(db, 'companies'), (snap) => {
    const list = snap.docs
      .map((d) => normalizeCompany(d.id, d.data() as Record<string, unknown>))
      .filter((c): c is Company => c !== null && c.isOpen !== false)
      .sort((a, b) => a.name.localeCompare(b.name, 'ko'));
    onData(list);
  });
}
