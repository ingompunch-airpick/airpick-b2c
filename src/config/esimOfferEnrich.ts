import { getEsimCountryName } from './esimCountries';
import type { EsimProduct } from '../types';

/** CSV 행 → name/region 채우기 */
export function enrichEsimOffers(raw: EsimProduct[]): EsimProduct[] {
  return raw.map((offer) => {
    const countryName = getEsimCountryName(offer.countryCode);
    return {
      ...offer,
      name: countryName,
      region: countryName,
    };
  });
}
