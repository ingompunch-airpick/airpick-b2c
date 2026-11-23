import * as PortOne from '@portone/browser-sdk/v2';

export type PortoneChannel = 'inicis' | 'kpn';

const ORDER_NAME = '에어픽 공항주차 예약';

export function isPortoneEnabled(): boolean {
  if (import.meta.env.VITE_PORTONE_ENABLED !== 'true') return false;
  return Boolean(
    import.meta.env.VITE_PORTONE_STORE_ID?.trim() &&
      import.meta.env.VITE_PORTONE_CHANNEL_KEY_INICIS?.trim() &&
      import.meta.env.VITE_PORTONE_CHANNEL_KEY_KPN?.trim()
  );
}

function channelKey(channel: PortoneChannel): string {
  const key =
    channel === 'inicis'
      ? import.meta.env.VITE_PORTONE_CHANNEL_KEY_INICIS
      : import.meta.env.VITE_PORTONE_CHANNEL_KEY_KPN;
  const trimmed = key?.trim() ?? '';
  if (!trimmed) throw new Error('PortOne 채널키가 없습니다.');
  return trimmed;
}

function storeId(): string {
  const id = import.meta.env.VITE_PORTONE_STORE_ID?.trim() ?? '';
  if (!id) throw new Error('PortOne storeId가 없습니다.');
  return id;
}

/** 이니시스 필수 이메일 — 회원 이메일이 없으면 심사용 플레이스홀더 */
export function portoneCustomerEmail(opts: {
  memberEmail?: string | null;
  phone: string;
}): string {
  const fromMember = opts.memberEmail?.trim();
  if (fromMember && fromMember.includes('@')) return fromMember;
  const digits = opts.phone.replace(/\D/g, '').slice(-11) || 'guest';
  return `guest+${digits}@airpick.kr`;
}

/**
 * KPN은 paymentId에 영문·숫자만 허용 (하이픈 등 특수문자 불가).
 * 이니시스와 공통으로 안전한 형태를 쓴다.
 */
export function newPortonePaymentId(): string {
  return `order${Date.now()}${Math.random().toString(36).slice(2, 10)}`;
}

export function paymentCompleteUrl(paymentId: string): string {
  const url = new URL('/payment/complete', window.location.origin);
  url.searchParams.set('paymentId', paymentId);
  return url.toString();
}

/**
 * TODO(온라인 결제): 상품 결제는 `/pay/{reservationId}` 예약별 고유 URL.
 * (현재 `/payment/complete` 는 PG 심사용이며 예약 점유·실패 시 자동취소 금지 원칙과 별개.)
 */

export async function requestPortoneCardPayment(opts: {
  channel: PortoneChannel;
  totalAmount: number;
  fullName: string;
  phoneNumber: string;
  email: string;
}): Promise<{ paymentId: string }> {
  const amount = Math.round(Number(opts.totalAmount) || 0);
  if (amount <= 0) throw new Error('결제 금액이 올바르지 않습니다.');

  const paymentId = newPortonePaymentId();
  const redirectUrl = paymentCompleteUrl(paymentId);

  const response = await PortOne.requestPayment({
    storeId: storeId(),
    channelKey: channelKey(opts.channel),
    paymentId,
    orderName: ORDER_NAME,
    totalAmount: amount,
    currency: 'CURRENCY_KRW',
    payMethod: 'CARD',
    redirectUrl,
    customer: {
      fullName: opts.fullName.trim(),
      phoneNumber: opts.phoneNumber.trim(),
      email: opts.email.trim(),
    },
  });

  if (response && typeof response === 'object' && 'code' in response && response.code != null) {
    const message =
      'message' in response && typeof response.message === 'string' && response.message
        ? response.message
        : '결제에 실패했습니다.';
    throw new Error(message);
  }

  return { paymentId };
}
