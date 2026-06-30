import { ESIM_COUNTRIES } from '../config/esimCountries';
import { ESIM_PARTNER_OFFERS } from '../config/esimPartnerOffers';
import type { EsimDataPlan, EsimSearch, EsimSimType } from '../types';
import { ESIM_DATA_PLAN_OPTIONS } from '../utils/esimLabels';

const ACTIVE_OFFERS = ESIM_PARTNER_OFFERS.filter((p) => p.isActive !== false);

const COUNTRY_ORDER = ESIM_COUNTRIES.map((c) => c.code);
const DATA_PLAN_ORDER = ESIM_DATA_PLAN_OPTIONS.map((o) => o.id);

function uniqueSorted<T>(values: T[], order: T[]): T[] {
  const set = new Set(values);
  return order.filter((v) => set.has(v));
}

export function getAvailableSimTypes(): EsimSimType[] {
  const types = [...new Set(ACTIVE_OFFERS.map((p) => p.type))] as EsimSimType[];
  return types.sort((a, b) => (a === 'esim' ? -1 : b === 'esim' ? 1 : 0));
}

export function getAvailableCountries(simType: EsimSimType): string[] {
  const codes = ACTIVE_OFFERS.filter((p) => p.type === simType).map((p) => p.countryCode);
  return uniqueSorted(codes, COUNTRY_ORDER);
}

export function getAvailableDataPlans(
  simType: EsimSimType,
  countryCode: string
): EsimDataPlan[] {
  const plans = ACTIVE_OFFERS.filter(
    (p) => p.type === simType && p.countryCode === countryCode
  ).map((p) => p.dataPlan);
  return uniqueSorted(plans, DATA_PLAN_ORDER);
}

export function getAvailableDays(
  simType: EsimSimType,
  countryCode: string,
  dataPlan: EsimDataPlan
): number[] {
  const days = ACTIVE_OFFERS.filter(
    (p) => p.type === simType && p.countryCode === countryCode && p.dataPlan === dataPlan
  ).map((p) => p.days);
  return [...new Set(days)].sort((a, b) => a - b);
}

/** 시트에 실제 있는 조합만 남기고, 없는 선택은 가장 가까운 값으로 맞춤 */
export function normalizeEsimSearch(search: EsimSearch): EsimSearch {
  const simTypes = getAvailableSimTypes();
  const simType = simTypes.includes(search.simType) ? search.simType : (simTypes[0] ?? 'esim');

  const countries = getAvailableCountries(simType);
  const countryCode = countries.includes(search.countryCode)
    ? search.countryCode
    : (countries[0] ?? search.countryCode);

  const dataPlans = getAvailableDataPlans(simType, countryCode);
  const dataPlan = dataPlans.includes(search.dataPlan)
    ? search.dataPlan
    : (dataPlans[0] ?? search.dataPlan);

  const daysList = getAvailableDays(simType, countryCode, dataPlan);
  const days = daysList.includes(search.days) ? search.days : (daysList[0] ?? search.days);

  return { simType, countryCode, dataPlan, days };
}

export function hasEsimOffers(): boolean {
  return ACTIVE_OFFERS.length > 0;
}
