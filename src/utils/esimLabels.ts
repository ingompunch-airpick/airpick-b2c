import type { EsimDataPlan, EsimSearch, EsimSimType, EsimSpeed } from '../types';
import { getEsimCountryName } from '../config/esimCountries';

export const ESIM_DAY_OPTIONS = Array.from({ length: 30 }, (_, i) => i + 1);

export const ESIM_DATA_PLAN_OPTIONS: { id: EsimDataPlan; label: string }[] = [
  { id: '500mb', label: '500MB' },
  { id: '1gb', label: '1GB' },
  { id: '2gb', label: '2GB' },
  { id: '3gb', label: '3GB' },
  { id: '4gb', label: '4GB' },
  { id: '5gb', label: '5GB' },
  { id: 'unlimited', label: '무제한' },
];

export const ESIM_SIM_TYPE_OPTIONS: { id: EsimSimType; label: string }[] = [
  { id: 'esim', label: 'eSIM' },
  { id: 'usim', label: '유심' },
];

const DATA_PLAN_LABEL: Record<EsimDataPlan, string> = {
  '500mb': '500MB',
  '1gb': '1GB',
  '2gb': '2GB',
  '3gb': '3GB',
  '4gb': '4GB',
  '5gb': '5GB',
  unlimited: '무제한',
};

export function formatEsimDataPlan(plan: EsimDataPlan): string {
  return DATA_PLAN_LABEL[plan];
}

export function formatEsimSpeed(speed: EsimSpeed): string {
  return speed === '5g' ? '5G' : 'LTE';
}

export function formatEsimSimType(type: EsimSimType): string {
  return type === 'esim' ? 'eSIM' : '유심';
}

export function formatEsimSearchSummary(search: EsimSearch): string {
  return [
    formatEsimSimType(search.simType),
    getEsimCountryName(search.countryCode),
    formatEsimDataPlan(search.dataPlan),
    `${search.days}일`,
  ].join(' · ');
}

export function formatEsimOffersUpdatedAt(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return `${d.getFullYear()}. ${d.getMonth() + 1}. ${d.getDate()}.`;
}
