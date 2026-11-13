/**
 * FAQ 정본 — 앱(예약 탭 FAQ 시트)·웹 /faq/·홈 FAQ 가 모두 이 파일을 씁니다.
 * public/faq/index.html 과 index.html 의 FAQ 부분은 `npm run faq`(scripts/generate-faq.mjs)가
 * 이 데이터로 다시 만듭니다. 문구는 여기서만 고치세요. shortAnswer = PAA/스니펫용 40~60자.
 */

import { SHORT_ANSWERS } from './officialAnswers';

export interface FaqItem {
  id: string;
  question: string;
  /** 검색·PAA용 짧은 직접답 */
  shortAnswer: string;
  answer: string;
  /** 웹 FAQ 답변 아래에 붙는 관련 링크 (앱 시트에는 표시 안 함) */
  links?: { href: string; label: string }[];
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
          '에어픽은 인천공항 주차대행과 사설주차장을 비교·예약하는 공항주차 서비스이고, 이심(eSIM)은 제휴 할인으로 안내합니다. 지금은 주차대행(발렛) 업체부터 예약할 수 있고, 사설주차장은 준비 중입니다. 확인한 인증 업체만 비교·예약하며, 예약 후 위치·사진·보험을 내 예약에서 확인할 수 있습니다.',
      },
      {
        id: 'private-lot',
        question: '에어픽에서 사설주차장·셔틀 주차도 예약되나요?',
        shortAnswer: SHORT_ANSWERS.privateLot,
        answer:
          '아직은 주차대행(발렛)만 예약할 수 있습니다. 공항 근처 사설주차장에 직접 주차하고 키를 맡기는 방식과, 주차 후 셔틀로 공항에 가는 방식은 준비 중입니다. 열리면 홈에서 함께 비교할 수 있게 안내합니다.',
        links: [{ href: '/guides/airport-parking-types/', label: '주차 방식 비교 가이드' }],
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
          '홈에서 터미널, 실내·야외, 날짜를 고른 뒤 업체를 비교하고 접수합니다. 비회원은 조회·취소에 쓸 비밀번호 4자리를 정하고, 결제는 현장 결제입니다.',
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
    id: 'handoff',
    label: '맡기는 방법',
    items: [
      {
        id: 'pay-when',
        question: '인천공항 주차대행 요금은 언제 내나요?',
        shortAnswer: '입점 예약은 현장 결제이며, 앱에서 카드를 받지 않습니다.',
        answer:
          '예약 접수 후 현장에서 업체 안내에 따라 결제합니다. 에어픽 앱에서는 주차 요금을 카드로 받지 않습니다.',
      },
      {
        id: 'cancel-free',
        question: '주차대행을 무료로 취소할 수 있나요?',
        shortAnswer: '입고 24시간 전이면 예약 탭에서 무료 취소할 수 있습니다.',
        answer:
          '그 이후이거나 이미 입고된 뒤에는 예약 카드의 「업체 문의」로 주차장에 연락합니다. 조회와 취소에는 예약 때 정한 비밀번호 4자리가 필요합니다.',
      },
      {
        id: 'curbside',
        question: 'Curbside는 무엇인가요?',
        shortAnswer: '출국장에서 기사에게 차를 넘기는 주차대행입니다.',
        answer: '홈에서 실내를 고르면 Curbside 업체만 나옵니다. 출국장에서 키를 맡깁니다.',
      },
      {
        id: 'drop-off',
        question: 'Drop-off는 무엇인가요?',
        shortAnswer: '단기주차장에 차를 세우고 키를 맡기는 주차대행입니다.',
        answer: '야외를 고르면 Curbside와 함께 비교됩니다. 실내를 고르면 Curbside만 나옵니다.',
      },
      {
        id: 'indoor-outdoor',
        question: '실내와 야외는 어떻게 다른가요?',
        shortAnswer: '실내는 출국장에서 인계하는 Curbside만 나옵니다.',
        answer: '야외는 출국장 인계(Curbside)와 단기주차장 입고(Drop-off)가 함께 나옵니다.',
      },
      {
        id: 'terminal',
        question: '제1터미널과 제2터미널은 어디서 고르나요?',
        shortAnswer: '출국하는 터미널을 홈에서 고릅니다.',
        answer:
          '제1터미널 또는 제2터미널을 고른 뒤 실내·야외와 날짜를 정하면, 그 조건으로 이용 가능한 업체가 나옵니다. 귀국 터미널이 다르면 예약 화면에서 따로 지정합니다.',
      },
      {
        id: 'keys',
        question: '차 키는 맡기나요?',
        shortAnswer: '네. Curbside와 Drop-off 모두 키를 맡깁니다.',
        answer: 'Curbside는 출국장에서, Drop-off는 단기주차장에서 맡깁니다.',
      },
      {
        id: 'guest-book',
        question: '로그인 없이 예약하고 진행을 볼 수 있나요?',
        shortAnswer: '네. 차량번호와 비밀번호 4자리로 내 예약에서 조회합니다.',
        answer:
          '예약할 때 비밀번호 4자리를 정합니다. 로그인 없이도 접수, 조회, 입고 24시간 전 취소가 됩니다.',
      },
      {
        id: 'progress',
        question: '차를 맡긴 뒤 진행은 어디서 보나요?',
        shortAnswer: '내 예약에서 접수 완료, 입고 예정, 주차 중, 출고를 확인합니다.',
        answer: '출고가 시작되면 출고 대기, 끝나면 출고 완료로 표시됩니다.',
      },
      {
        id: 'photo-in',
        question: '입고 사진은 언제 보나요?',
        shortAnswer: '입고 처리 후 내 예약에 올라옵니다.',
        answer: '접수 직후에는 아직 없습니다. 입고되면 내 예약에서 주차장 위치와 사진을 봅니다.',
      },
      {
        id: 'photo-out',
        question: '출고 사진도 볼 수 있나요?',
        shortAnswer: '출고 처리 후 기사가 찍은 사진이 내 예약에 올라옵니다.',
        answer: '입고 사진과 같이 내 예약에서 확인합니다. 접수 직후에는 사진이 없습니다.',
      },
      {
        id: 'where-parked',
        question: '주차장 위치는 언제 확인하나요?',
        shortAnswer: '입고 후 내 예약에서 확인합니다.',
        answer: '접수만 된 상태에서는 위치와 사진이 아직 없습니다.',
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
        links: [{ href: 'tel:01025565746', label: '고객센터 전화 010-2556-5746' }],
      },
    ],
  },
];

/** 홈 하단 FAQ 4개 (HomeFaq · index.html 프리렌더·FAQPage JSON-LD 가 같이 씀) */
export const HOME_FAQ_IDS = ['what-is', 'book-how', 'pay-when', 'cancel-free'] as const;

/** 홈 안내 기준일 — 홈 FAQ 문구를 바꾸면 같이 갱신 (index.html WebPage.dateModified 도 생성기가 맞춤) */
export const HOME_FAQ_UPDATED = '2026-11-14';

export function allFaqItems(): FaqItem[] {
  return FAQ_CATEGORIES.flatMap((c) => c.items);
}

/** answer 가 shortAnswer 로 시작하면 겹치는 문장을 뺀 나머지 */
export function faqRestAnswer(item: FaqItem): string {
  return item.answer.startsWith(item.shortAnswer)
    ? item.answer.slice(item.shortAnswer.length).trim()
    : item.answer;
}

/** 구조화 데이터(FAQPage)용 전체 답: 화면에 보이는 shortAnswer + 나머지와 같은 문장 */
export function faqFullAnswer(item: FaqItem): string {
  const rest = faqRestAnswer(item);
  return rest ? `${item.shortAnswer} ${rest}` : item.shortAnswer;
}
