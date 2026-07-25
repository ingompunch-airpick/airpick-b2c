/** FAQ — 예약 탭·메뉴 (public/faq 와 동기). shortAnswer = PAA/스니펫용 40~60자. */

import { PARKING_TAB_LABEL } from './marketing';
import { SHORT_ANSWERS } from './officialAnswers';

export interface FaqItem {
  id: string;
  question: string;
  /** 검색·PAA용 짧은 직접답 */
  shortAnswer: string;
  answer: string;
}

export interface FaqCategory {
  id: string;
  label: string;
  items: FaqItem[];
}

export const FAQ_CATEGORIES: FaqCategory[] = [
  {
    id: 'leave-by',
    label: '출국시간 · 혼잡',
    items: [
      {
        id: 'leave-by-how',
        question: '인천공항 출국시간·나설 시각은 어떻게 계산하나요?',
        shortAnswer: SHORT_ANSWERS.leaveBy,
        answer:
          '홈 출국시간 계산기에 편명·출발일·출발지를 입력하면, 비행기 출발 3시간 전 공항 도착을 기준으로 추천 출발 시각을 안내합니다. 여유 있는 도착을 위한 계획용이며, 실시간 혼잡도 API를 그대로 보여주는 서비스는 아닙니다.',
      },
      {
        id: 'leave-by-buffer',
        question: '공항 도착 여유·혼잡도는 어떻게 반영되나요?',
        shortAnswer: SHORT_ANSWERS.leaveByBuffer,
        answer:
          '기본은 출발 3시간 전 공항 도착을 기준으로 합니다. 혼잡·대기 검색 수요에 맞춰 여유를 넉넉히 잡는 계획용이며, 현장 대기 시간은 날·시간대에 따라 달라질 수 있습니다.',
      },
      {
        id: 'long-lot-vs-valet',
        question: '직접 장기주차와 주차대행, 공항 이동 시간은 어떻게 다른가요?',
        shortAnswer: SHORT_ANSWERS.longLotVsValet,
        answer:
          '장기주차는 자리 찾기·셔틀 등 공항 이동(약 48분)을 계산에 반영합니다. 주차대행은 업체마다 인수 위치·운영 방식이 달라 하나의 시간으로 계산하지 않으며, 업체 상세에서 이용 방법을 확인하면 됩니다.',
      },
    ],
  },
  {
    id: 'my',
    label: '예약 · 조회',
    items: [
      {
        id: 'what-is',
        question: '에어픽은 어떤 서비스인가요?',
        shortAnswer: SHORT_ANSWERS.whatIs,
        answer:
          '에어픽은 곰컴퍼니가 운영하는 인천공항 출국시간 계산·주차대행 비교·이심(eSIM) 가격비교 플랫폼입니다. 입점 업체는 앱에서 예약·조회하고 위치·사진·보험을 확인할 수 있으며, 미입점은 참고 요금 비교 후 업체 홈으로 이동합니다.',
      },
      {
        id: 'my-how',
        question: '에어픽 예약은 어디서 조회하나요?',
        shortAnswer: SHORT_ANSWERS.lookup,
        answer:
          '하단 예약 탭에서 차량번호(또는 연락처)와 예약 시 설정한 비밀번호 4자리를 입력해 조회합니다. 입고 사진·주차 위치·보험 안내도 예약 카드에서 확인합니다.',
      },
      {
        id: 'my-not-found',
        question: '에어픽 예약 조회가 안 되면 어떻게 하나요?',
        shortAnswer: SHORT_ANSWERS.lookupFail,
        answer:
          '예약 접수 시 입력한 차량번호(또는 연락처)와 비밀번호 4자리가 동일한지 확인해 주세요. 차량번호는 띄어쓰기 없이 입력해 보시거나, 잠시 후 다시 시도해 주세요.',
      },
    ],
  },
  {
    id: 'booking',
    label: '예약 · 요금',
    items: [
      {
        id: 'book-how',
        question: '에어픽에서 주차대행은 어떻게 예약하나요?',
        shortAnswer: SHORT_ANSWERS.bookHow,
        answer: `${PARKING_TAB_LABEL} 탭에서 입·출국 일정과 터미널·실내/야외를 선택한 뒤 업체 가격을 비교하고 예약 접수를 완료하면 됩니다. 예약 시 조회·취소에 사용할 비밀번호 4자리를 설정하며, 결제는 현장 결제입니다.`,
      },
      {
        id: 'book-change',
        question: '에어픽 주차대행 예약 변경·취소는 어떻게 하나요?',
        shortAnswer: SHORT_ANSWERS.cancel,
        answer:
          '입고 전이라면 예약 탭에서 예약을 조회한 뒤 「예약 취소」로 직접 취소할 수 있습니다(비밀번호 필요, 업체별 마감 시간 적용). 입고 후 또는 일정 변경은 예약 카드의 「업체 문의」로 주차장에 직접 연락해 주세요.',
      },
      {
        id: 'book-pay',
        question: '에어픽에서 카드로 결제하나요?',
        shortAnswer: SHORT_ANSWERS.payCard,
        answer:
          '아니요. 입점 예약은 현장 결제입니다. 앱에서 카드 결제를 받지 않으며, 예약 접수 후 현장에서 업체 안내에 따라 결제합니다.',
      },
    ],
  },
  {
    id: 'service',
    label: '입고 · 사진 · 위치',
    items: [
      {
        id: 'photos-when',
        question: '입·출고 사진은 언제 에어픽에 올라오나요?',
        shortAnswer: SHORT_ANSWERS.photos,
        answer:
          '입고·출고 처리 후 기사가 촬영한 사진이 예약 탭에 등록됩니다. 접수 직후에는 「등록 예정」 안내가 표시될 수 있습니다.',
      },
      {
        id: 'location',
        question: '주차 위치·보험은 에어픽에서 어디서 보나요?',
        shortAnswer: SHORT_ANSWERS.locationInsurance,
        answer:
          '예약 카드의 「주차 위치」「보험」 블록에서 확인할 수 있습니다. 주차장 안내 사진과 네이버 지도 길 찾기 링크도 함께 제공됩니다. (입점 예약·제공 업체 기준)',
      },
    ],
  },
  {
    id: 'contact',
    label: '문의 · 연락',
    items: [
      {
        id: 'who',
        question: '에어픽 고객센터와 주차장 문의는 어디에 하나요?',
        shortAnswer: SHORT_ANSWERS.contact,
        answer:
          '차량 입·출고, 현장 일정, 차량 상태, 입고 후 변경·취소 → 예약 카드 「업체 문의」로 주차장에 전화해 주세요. 입고 전 취소·앱·예약 조회 방법은 이 FAQ를 참고해 주세요. 에어픽 고객센터는 010-2556-5746, 카카오톡 상담, 운영 09:00~18:00입니다.',
      },
    ],
  },
];
