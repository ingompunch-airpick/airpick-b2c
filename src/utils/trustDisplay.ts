import type { Company } from '../types';
import { displayInsuranceLabel } from './trust';

export function companyHasParkingLocation(company: Company): boolean {
  return !!(
    company.indoorParkingAddress?.trim() || company.outdoorParkingAddress?.trim()
  );
}

export function companyHasParkingPhotos(company: Company): boolean {
  const indoor = company.indoorParkingPhotos?.length || 0;
  const outdoor = company.outdoorParkingPhotos?.length || 0;
  return indoor + outdoor > 0;
}

export function shouldShowLocationBadge(company: Company): boolean {
  if (company.sharesParkingLocation === false) return false;
  return companyHasParkingLocation(company);
}

export function shouldShowPhotosBadge(company: Company): boolean {
  if (company.sharesPhotos === false) return false;
  return companyHasParkingPhotos(company);
}

export function shouldShowInsuranceBadge(company: Company): boolean {
  if (company.sharesInsurance === false) return false;
  return !!displayInsuranceLabel(company);
}
