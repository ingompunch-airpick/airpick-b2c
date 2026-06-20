import { trackOutboundClick } from '../lib/analytics';

/** 입점·제휴 문의 수신 메일 — 변경 시 이 값만 수정 */
export const PARTNER_INQUIRY_EMAIL = 'partner@airpick.com';

export function openPartnerInquiryEmail(): void {
  trackOutboundClick({
    category: 'email',
    destination: PARTNER_INQUIRY_EMAIL,
    itemName: '입점 제휴 문의',
  });
  window.location.href = `mailto:${PARTNER_INQUIRY_EMAIL}`;
}
