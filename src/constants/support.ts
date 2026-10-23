/** FAQ — 예약 탭·메뉴 (public/faq 와 동기). shortAnswer = PAA/스니펫용 40~60자. */

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
    id: 'my',
    label: '예약 · 조회',
    items: [
      {
        id: 'what-is',
        question: '에어픽은 어떤 서비스인가요?',
        shortAnswer: SHORT_ANSWERS.whatIs,
        answer:
          '에어픽은 인천공항 주차대행을 비교·예약하고, 이심(eSIM)은 제휴 할인으로 안내합니다. 확인한 공식 파트너만 비교·예약하며, 예약 후 위치·사진·보험을 내 예약에서 확인할 수 있습니다.',
      },
      {
        id: 'my-how',
        question: '에어픽 예약은 어디서 조회하나요?',
        shortAnswer: SHORT_ANSWERS.lookup,
        answer:
          '하단 예약 탭에서 차량번호(전체 또는 숫자 끝 4자리)나 연락처와, 예약 시 설정한 비밀번호 4자리를 입력해 조회합니다. 입고 사진·주차 위치·보험 안내도 예약 카드에서 확인합니다.',
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
        answer:
          '홈에서 터미널, 실내·야외, 픽업지, 날짜를 고른 뒤 업체를 비교하고 접수합니다. 비회원은 조회·취소에 쓸 비밀번호 4자리를 정하고, 결제는 현장 결제입니다.',
      },
      {
        id: 'pickup',
        question: '픽업지는 어디서 확인하나요?',
        shortAnswer: SHORT_ANSWERS.pickup,
        answer:
          '픽업지는 업체와 터미널마다 다릅니다. 접수 후 내 예약 카드와 접수증에 그 업체의 픽업지가 나옵니다.',
      },
      {
        id: 'signup-coupon',
        question: '5,000원 할인은 언제 적용되나요?',
        shortAnswer: SHORT_ANSWERS.signupCoupon,
        answer:
          '카카오 가입 후 첫 예약 한 번만 5,000원이 빠집니다. 이미 예약한 계정과 그다음 예약은 정가입니다.',
      },
      {
        id: 'book-change',
        question: '에어픽 주차대행 예약 변경·취소는 어떻게 하나요?',
        shortAnswer: SHORT_ANSWERS.cancel,
        answer:
          '입고 예정 24시간 전까지는 예약 탭에서 예약을 조회한 뒤 「예약 취소」로 직접 취소할 수 있습니다(비밀번호 필요). 그 이후·입고 후 또는 일정 변경은 예약 카드의 「업체 문의」로 주차장에 직접 연락해 주세요.',
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
          '차량 입·출고, 현장 일정, 차량 상태, 입고 24시간 이내 변경·취소 → 예약 카드 「업체 문의」로 주차장에 전화해 주세요. 입고 24시간 전까지의 취소·앱·예약 조회 방법은 이 FAQ를 참고해 주세요. 에어픽 고객센터는 010-2556-5746, 카카오톡 상담, 운영 09:00~18:00입니다.',
      },
    ],
  },
];
