import type { EsimProduct } from '../types';

/** 에어픽 직판 상품 — 추후 Firestore `esim_products` 로 이전 */
export const ESIM_PRODUCTS: EsimProduct[] = [
  {
    id: 'jp-7d-3gb',
    name: '일본',
    region: '일본',
    regionCode: 'JP',
    dataLabel: '3GB',
    days: 7,
    price: 8900,
    type: 'esim',
    description: 'QR 코드 즉시 발송 · 현지 LTE',
  },
  {
    id: 'sea-10d-5gb',
    name: '동남아 3개국',
    region: '태국·베트남·필리핀',
    regionCode: 'SEA',
    dataLabel: '5GB',
    days: 10,
    price: 12900,
    type: 'esim',
    description: '태국·베트남·필리핀 로밍',
  },
  {
    id: 'us-15d-10gb',
    name: '미국',
    region: '미국',
    regionCode: 'US',
    dataLabel: '10GB',
    days: 15,
    price: 19900,
    type: 'esim',
    description: 'AT&T·T-Mobile 호환',
  },
  {
    id: 'eu-14d-8gb',
    name: '유럽 33개국',
    region: '유럽',
    regionCode: 'EU',
    dataLabel: '8GB',
    days: 14,
    price: 24900,
    type: 'esim',
    description: 'EU 전역 로밍',
  },
  {
    id: 'kr-usim-airport',
    name: '인천공항 수령 유심',
    region: '글로벌',
    regionCode: 'ICN',
    dataLabel: '현장 개통',
    days: 30,
    price: 15000,
    type: 'usim',
    description: 'T1·T2 수령 후 개통 (준비 중)',
  },
];

export function getEsimProducts(): EsimProduct[] {
  return ESIM_PRODUCTS.filter((p) => p.isActive !== false);
}
