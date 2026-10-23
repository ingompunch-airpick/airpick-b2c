import { getCancelCutoffHours } from '../utils/reservationCancel';

export type GuideStep = {
  id: string;
  title: string;
  body: string;
};

/** 이용 방법 — 홈 접수 흐름과 예약 탭에서 확인하는 항목만 */
export const PARKING_GUIDE_STEPS: GuideStep[] = [
  {
    id: 'book',
    title: '접수',
    body: '홈에서 터미널, 실내·야외, 픽업지, 맡기는 날과 찾는 날을 고른 뒤 업체를 선택합니다. 차량·연락처를 입력하고, 조회와 취소에 쓸 비밀번호 4자리를 설정합니다. 결제는 현장에서 합니다.',
  },
  {
    id: 'checkin',
    title: '입고',
    body: '고른 픽업지에서 차를 맡깁니다. 비대면은 단기주차장에 세우고 바로 입장하고, 대면은 시간을 맞춘 뒤 출국장에서 기사에게 직접 넘깁니다. 입고 후 내 예약에서 입고 사진, 주차 위치, 보험 안내를 확인합니다.',
  },
  {
    id: 'depart',
    title: '출국',
    body: '차를 맡긴 뒤 출국합니다. 일정이나 차량 상태는 예약 카드의 「업체 문의」로 주차장에 연락합니다.',
  },
  {
    id: 'return',
    title: '귀국',
    body: '입국 후 업체 안내에 따라 차량을 받습니다. 출고 후 기사가 촬영한 사진은 내 예약에 등록됩니다.',
  },
];

/** 취소·변경 — 앱 직접 취소 시간은 reservationCancel 과 같다 */
export function cancelGuideSteps(): GuideStep[] {
  const hours = getCancelCutoffHours();
  return [
    {
      id: 'self',
      title: '앱에서 직접 취소',
      body: `입고 예정 ${hours}시간 전까지 내 예약에서 「예약 취소」로 직접 취소할 수 있습니다. 예약할 때 설정한 비밀번호 4자리가 필요합니다.`,
    },
    {
      id: 'after',
      title: '그 이후·일정 변경',
      body: `입고 ${hours}시간 전을 지났거나 이미 입고된 예약, 일정 변경은 예약 카드의 「업체 문의」로 주차장에 연락해 주세요.`,
    },
    {
      id: 'pay',
      title: '결제',
      body: '입점 예약은 현장 결제입니다. 앱에서 카드 결제를 받지 않습니다.',
    },
  ];
}
