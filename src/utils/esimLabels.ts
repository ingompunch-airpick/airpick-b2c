import type { EsimDataPlan, EsimSearch, EsimSimType, EsimSpeed } from '../types';
import { getEsimCountryName } from '../config/esimCountries';

export const ESIM_DAY_OPTIONS = [3, 5, 7, 10, 14, 15, 30] as const;

export const ESIM_DATA_PLAN_OPTIONS: { id: EsimDataPlan; label: string }[] = [
  { id: '1gb', label: '1GB' },
  { id: '2gb', label: '2GB' },
  { id: 'unlimited', label: '무제한' },
];

export const ESIM_SPEED_OPTIONS: { id: EsimSpeed; label: string }[] = [
  { id: 'lte', label: 'LTE' },
  { id: '5g', label: '5G' },
];

export const ESIM_SIM_TYPE_OPTIONS: { id: EsimSimType; label: string }[] = [
  { id: 'esim', label: 'eSIM' },
  { id: 'usim', label: '유심' },
];

export function formatEsimDataPlan(plan: EsimDataPlan): string {
  if (plan === 'unlimited') return '무제한';
  if (plan === '1gb') return '1GB';
  return '2GB';
}

export function formatEsimSpeed(speed: EsimSpeed): string {
  return speed === '5g' ? '5G' : 'LTE';
}

export function formatEsimSimType(type: EsimSimType): string {
  return type === 'esim' ? 'eSIM' : '유심';
}

export function formatEsimSearchSummary(search: EsimSearch): string {
  return [
    getEsimCountryName(search.countryCode),
    formatEsimDataPlan(search.dataPlan),
    formatEsimSpeed(search.speed),
    `${search.days}일`,
    formatEsimSimType(search.simType),
  ].join(' · ');
}
