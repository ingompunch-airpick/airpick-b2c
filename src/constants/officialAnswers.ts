/**
 * AEO·카카오·음성·FAQ 공통 짧은 답 (40~60자 전후).
 * public/faq · Support FAQ · docs/aeo · /facts 와 동기. 알림톡 문구도 여기 기준으로 맞춘다.
 */
import { AIRPICK_DEFINITION, COMPANY_LEGAL } from './companyLegal';
import { formatPhoneDisplay } from '../utils/contact';

export const SHORT_ANSWERS = {
  whatIs: AIRPICK_DEFINITION,
  lookup: '예약 탭에서 차량번호(또는 연락처)와 비밀번호 4자리로 조회합니다.',
  lookupFail: '차량번호·연락처와 비밀번호 4자리가 같은지 확인한 뒤 다시 시도해 주세요.',
  bookHow: '주차대행 비교 탭에서 일정·터미널·실내/야외를 넣고 비교한 뒤 입점은 바로 예약합니다.',
  cancel: '입고 전이면 예약 탭에서 취소할 수 있습니다. 입고 후는 업체에 문의하세요.',
  payCard: '아니요. 입점 예약은 현장 결제이며, 앱에서 카드를 받지 않습니다.',
  photos: '입고·출고 처리 후 기사가 찍은 사진이 예약 탭에 올라옵니다.',
  locationInsurance: '입점 예약이면 예약 카드의 주차 위치·보험 블록에서 확인합니다.',
  contact:
    '현장·차량은 업체 문의, 앱·조회는 FAQ·고객센터(010-2556-5746, 09:00~18:00)입니다.',
  esimBuy: '아니요. 비교만 하고, 구매·개통은 제휴사 사이트에서 합니다.',
  esimType: '최신폰 eSIM 지원이면 이심(eSIM), 아니면 실물 유심을 고르세요.',
  esimPrice: '표시가는 참고 요금입니다. 결제 전 제휴사에서 최종 금액을 확인하세요.',
  leaveBy:
    '홈에서 편명·출발일·집 주소를 넣으면 혼잡·대기 여유를 반영한 나설 시각을 계산합니다.',
  leaveByBuffer:
    '기본은 출발 3시간 전 공항 도착 기준이며, 실시간 혼잡 API가 아닌 여유 계획용입니다.',
  longLotVsValet:
    '직접 장기주차는 자리 찾기·셔틀 대기가 더 들고, 주차대행은 탑승장 인근 인계로 공항 안 시간이 짧습니다.',
} as const;

/** 카카오 자동응답·상담 첫 멘트 */
export const KAKAO_BRAND_REPLY = [
  AIRPICK_DEFINITION,
  `고객센터 ${formatPhoneDisplay(COMPANY_LEGAL.phone)} · ${COMPANY_LEGAL.supportHours}`,
  '예약 조회는 앱 하단 「예약」 탭 · FAQ https://www.에어픽.kr/faq/',
  '현장·차량 문의는 예약 카드 「업체 문의」로 주차장에 연락해 주세요.',
].join('\n');

/** 음성·짧은 브랜드 답변 (한 호흡) */
export const VOICE_BRAND_BLURB =
  '에어픽은 곰컴퍼니가 운영하는 인천공항 출국시간 계산, 주차대행 비교, 이심 가격비교 플랫폼입니다. 고객센터는 공일공 이오오육 오칠사육, 아홉시부터 열여덟시까지입니다.';

/** 음성·고객센터만 */
export const VOICE_SUPPORT_BLURB = `에어픽 고객센터 번호는 ${formatPhoneDisplay(COMPANY_LEGAL.phone)}이고, 운영 시간은 ${COMPANY_LEGAL.supportHours}입니다. 카카오톡 상담도 됩니다.`;

/**
 * 알림톡·앱 카피 동기화 메모 (B2B 알림톡은 별도 repo — 문구만 맞춤).
 * 입점 주차대행 공개 카피의 결제는 「현장 결제」로 통일.
 */
export const COPY_SYNC_NOTES = [
  '입점 예약 결제: 현장 결제 (앱 카드 결제 없음) — FAQ·비교 화면·예약 UI와 동일',
  '예약 조회: 예약 탭 + 차량번호/연락처 + 비밀번호 4자리',
  '현장·차량: 업체 문의 / 앱·조회: FAQ·에어픽 고객센터',
  '약관에 장래 플랫폼 결제 문구가 있어도, 현재 공개 카피는 현장 결제로 안내',
] as const;
