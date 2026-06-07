/** 에어픽 고객센터 — 연락처·FAQ (배포 전 phone·kakaoChannelUrl 확인) */

export const AIRPICK_SUPPORT = {
  /** tel: 링크용 (하이픈 가능) — 에어픽 고객센터 번호 */
  phone: '010-2556-5746',
  phoneDisplay: '010-2556-5746',
  /** 카카오톡 채널 — 1:1 채팅 바로 열기 */
  kakaoChannelUrl: 'http://pf.kakao.com/_lxhEnn/chat',
  kakaoLabel: '카카오톡 @airpickup',
  hours: '평일 09:00 – 18:00',
  guide: '예약·앱·MY 조회 문의는 에어픽, 입·출고·차량 문의는 해당 주차장으로 연락해 주세요.',
} as const;

export interface FaqItem {
  id: string;
  question: string;
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
    label: 'MY · 예약 조회',
    items: [
      {
        id: 'my-how',
        question: '예약 내역은 어디서 보나요?',
        answer:
          '하단 MY 탭에서 차량번호 또는 예약 시 입력한 연락처로 조회할 수 있습니다. 입고 사진·주차 위치·보험 안내도 MY 예약 카드에서 확인합니다.',
      },
      {
        id: 'my-not-found',
        question: '조회가 안 돼요.',
        answer:
          '예약 접수 시 입력한 차량번호·연락처와 동일하게 입력했는지 확인해 주세요. 띄어쓰기 없이 입력해 보시거나, 잠시 후 다시 시도해 주세요.',
      },
    ],
  },
  {
    id: 'booking',
    label: '예약 · 요금',
    items: [
      {
        id: 'book-how',
        question: '예약은 어떻게 하나요?',
        answer:
          '주차 탭에서 입·출국 일정과 터미널·실내/실외를 선택한 뒤 업체 가격을 비교하고 예약 접수를 완료하면 됩니다. 결제는 현장 결제입니다.',
      },
      {
        id: 'book-change',
        question: '예약 변경·취소는 어떻게 하나요?',
        answer:
          'MY에서 예약을 확인한 뒤, 해당 주차장(업체 문의) 또는 에어픽 고객센터(에어픽 문의)로 연락해 주세요.',
      },
    ],
  },
  {
    id: 'service',
    label: '입고 · 사진 · 위치',
    items: [
      {
        id: 'photos-when',
        question: '입·출고 사진은 언제 올라오나요?',
        answer:
          '입고·출고 처리 후 기사가 촬영한 사진이 MY에 등록됩니다. 접수 직후에는 「등록 예정」 안내가 표시될 수 있습니다.',
      },
      {
        id: 'location',
        question: '주차 위치·보험은 어디서 보나요?',
        answer:
          'MY 예약 카드의 「주차 위치」「보험」 블록에서 확인할 수 있습니다. 주차장 안내 사진과 네이버 지도 길 찾기 링크도 함께 제공됩니다.',
      },
    ],
  },
  {
    id: 'contact',
    label: '문의 · 연락',
    items: [
      {
        id: 'who',
        question: '어디로 전화해야 하나요?',
        answer:
          '차량 입·출고, 현장 일정, 차량 상태 → MY 예약 카드의 「업체 문의」. 앱 사용, 예약 접수, MY 조회 → 「에어픽 문의」 또는 고객센터 FAQ 하단 연락처를 이용해 주세요.',
      },
    ],
  },
];
