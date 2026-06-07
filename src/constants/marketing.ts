/** 에어픽 B2C 마케팅 — 위치 · 사진 · 보험 통일 카피 */

export const BRAND_TAGLINE = '맡긴 차, 어디 있는지까지';

export const BRAND_SUBLINE = '입고 사진 · 주차 위치 · 보험 — MY에서 확인하세요';

export const PARTNER_PROMISE = '에어픽 제휴 업체는 맡긴 뒤에도 보입니다';

export const TRUST_PILLARS = [
  {
    id: 'location',
    title: '주차 위치',
    desc: '입고 후 주차장 위치를 MY에서 바로 확인',
  },
  {
    id: 'photos',
    title: '입·출고 사진',
    desc: '기사가 찍은 차량 사진을 예약 조회에서 공유',
  },
  {
    id: 'insurance',
    title: '보험',
    desc: '가입 여부·보장 한도를 미리 확인',
  },
] as const;

export const TRUST_BADGES = [
  { id: 'location', label: '위치 공유' },
  { id: 'photos', label: '사진 공유' },
  { id: 'insurance', label: '보험' },
] as const;

export const RESERVATION_STEPS = ['접수', '입고', '주차중', '출고'] as const;
