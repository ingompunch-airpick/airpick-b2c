import { collection, doc, getDoc, getDocs, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import type { Company } from '../types';
import { deriveParkingAddressesFromCompanyData } from '../utils/companyParking';
import { mergePartnerPricing } from '../utils/pricing';

export interface CompanyBookingPolicy {
  isOpen: boolean;
  blockedDates: string[];
}

function normalizeCompany(id: string, data: Record<string, unknown>): Company | null {
  const name = String(data.name || '').trim();
  if (!name) return null;
  if (data.status === 'suspended') return null;

  const company: Company = {
    id,
    name,
    is_indoor: data.is_indoor !== false,
    supports_indoor: data.supports_indoor !== false,
    supports_outdoor: data.supports_outdoor !== false,
    base_price: Number(data.base_price) || 15000,
    extra_day_price: Number(data.extra_day_price) || 5000,
    base_days: Number(data.base_days) || 1,
    rating: Number(data.rating) || 4.5,
    reviews_count: Number(data.reviews_count) || 0,
    features: Array.isArray(data.features) ? (data.features as string[]) : [],
    image_url:
      String(data.image_url || '') ||
      'https://images.unsplash.com/photo-1542282088-fe8426682b8f?auto=format&fit=crop&q=80',
    terminals: Array.isArray(data.terminals) ? (data.terminals as string[]) : ['T1', 'T2'],
    phone: data.phone ? String(data.phone) : undefined,
    representative: data.representative ? String(data.representative) : undefined,
    isOpen: data.isOpen !== false,
    blockedDates: Array.isArray(data.blockedDates) ? (data.blockedDates as string[]) : [],
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
    peakStartTime: data.peakStartTime ? String(data.peakStartTime) : undefined,
    peakEndTime: data.peakEndTime ? String(data.peakEndTime) : undefined,
    peakSurcharge: Number(data.peakSurcharge) || undefined,
    status: data.status ? String(data.status) : 'active',
    sharesParkingLocation: data.sharesParkingLocation !== false,
    sharesPhotos: data.sharesPhotos !== false,
    hasInsurance: data.hasInsurance !== false,
    insuranceProvider: data.insuranceProvider ? String(data.insuranceProvider) : undefined,
    insuranceLimit: data.insuranceLimit ? Number(data.insuranceLimit) : undefined,
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
