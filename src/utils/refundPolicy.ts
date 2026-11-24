import { APP_CONFIG } from '../constants/appConfig';

/**
 * 취소·환불 계산 — 화면 표시와 실제 취소 처리 모두 이 함수만 쓴다.
 * 기준 시각: 입고 예정 시각(한국 시간). 취소 시각은 서버 시각을 넘길 것.
 */
export type RefundTier = 'full' | 'late' | 'none';

export interface RefundResult {
  tier: RefundTier;
  /** 0 ~ 1 */
  ratio: number;
  /** 환불 금액(원, 원 단위 내림) */
  refundWon: number;
}

/** 'YYYY-MM-DD' + 'HH:mm' → 한국 시간 기준 Date. 형식 오류면 null */
export function kstCheckInDate(departureDate: string, departureTime?: string): Date | null {
  const ymd = String(departureDate || '').trim().slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(ymd)) return null;
  const time = /^\d{2}:\d{2}$/.test(String(departureTime || '')) ? departureTime : '00:00';
  const dt = new Date(`${ymd}T${time}:00+09:00`);
  return Number.isNaN(dt.getTime()) ? null : dt;
}

export function calcRefund(params: {
  checkIn: Date;
  /** 실제 결제 금액(포인트·할인 제외) */
  paidWon: number;
  cancelAt: Date;
}): RefundResult {
  const { checkIn, cancelAt } = params;
  const paidWon = Math.max(0, Math.floor(Number(params.paidWon) || 0));
  const { fullRefundHours, lateRefundRatio } = APP_CONFIG.refund;
  const fullDeadline = checkIn.getTime() - fullRefundHours * 60 * 60 * 1000;
  const t = cancelAt.getTime();

  if (t <= fullDeadline) {
    return { tier: 'full', ratio: 1, refundWon: paidWon };
  }
  if (t < checkIn.getTime()) {
    return {
      tier: 'late',
      ratio: lateRefundRatio,
      refundWon: Math.floor(paidWon * lateRefundRatio),
    };
  }
  return { tier: 'none', ratio: 0, refundWon: 0 };
}

/** 예: "지금 취소하면 33,500원 환불 (50%)" */
export function formatRefundLine(result: RefundResult): string {
  if (result.tier === 'none') return '입고 예정 시각이 지나 환불되지 않아요';
  const pct = Math.round(result.ratio * 100);
  return `지금 취소하면 ${result.refundWon.toLocaleString()}원 환불 (${pct}%)`;
}
