import type { FaqCategory } from './support';
import { ESIM_TAB_LABEL } from './marketing';

/** 초보자 유심/eSIM 이용 가이드 — 예약 탭 */
export const ESIM_GUIDE_STEPS = [
  {
    id: 'compare',
    title: `1. ${ESIM_TAB_LABEL} 탭에서 요금 비교`,
    body: `하단 「${ESIM_TAB_LABEL}」 탭 → eSIM·유심, 나라, 용량, 일수를 선택하면 제휴사별 가격이 낮은 순으로 표시됩니다.`,
  },
  {
    id: 'esim-vs-usim',
    title: '2. eSIM과 USIM 차이',
    body: 'eSIM은 QR 코드로 휴대폰에 바로 설치합니다. USIM은 실물 카드를 받아 끼워야 합니다. 휴대폰 eSIM 지원 여부를 먼저 확인해 주세요.',
  },
  {
    id: 'purchase',
    title: '3. 제휴사에서 구매',
    body: '에어픽은 가격 비교만 제공합니다. 카드를 누르면 해당 제휴사 사이트로 이동해 주문·결제·개통을 진행합니다.',
  },
  {
    id: 'after',
    title: '4. 개통·사용 문의',
    body: '개통 방법, APN 설정, 환불 등은 구매한 제휴사 고객센터로 문의해 주세요. 주문·개통 내역도 제휴사에서 확인합니다.',
  },
] as const;

export const ESIM_FAQ_CATEGORY: FaqCategory = {
  id: 'esim',
  label: ESIM_TAB_LABEL,
  items: [
    {
      id: 'esim-buy-here',
      question: '에어픽 앱에서 바로 구매할 수 있나요?',
      answer:
        '아니요. 에어픽은 제휴 요금 비교만 제공합니다. 원하는 요금제를 선택한 뒤 제휴사 사이트에서 구매·개통해 주세요.',
    },
    {
      id: 'esim-diff',
      question: 'eSIM과 USIM 중 무엇을 선택해야 하나요?',
      answer:
        'eSIM을 지원하는 최신 스마트폰이면 eSIM이 편합니다(물리 카드 없이 QR 설치). eSIM 미지원 기기는 USIM을 선택해 주세요.',
    },
    {
      id: 'esim-price',
      question: '표시된 가격이 최종 금액인가요?',
      answer:
        '제휴사가 제공한 참고 요금입니다. 제휴사 사이트에서 쿠폰·환율·옵션에 따라 달라질 수 있으니 결제 전 최종 금액을 확인해 주세요.',
    },
    {
      id: 'esim-update',
      question: '요금은 언제 업데이트되나요?',
      answer:
        `${ESIM_TAB_LABEL} 탭 상단 「마지막 수정」 날짜를 참고해 주세요. 제휴사 요금은 수시로 변동될 수 있습니다.`,
    },
    {
      id: 'esim-support',
      question: '개통이 안 되거나 데이터가 안 될 때는?',
      answer:
        '구매한 제휴사 고객센터로 문의해 주세요. APN 설정·eSIM 재설치 방법은 제휴사 안내를 따르시면 됩니다.',
    },
  ],
};
