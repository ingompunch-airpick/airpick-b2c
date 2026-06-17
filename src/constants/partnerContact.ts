/** 입점·제휴 문의 수신 메일 — 변경 시 이 값만 수정 */
export const PARTNER_INQUIRY_EMAIL = 'partner@airpick.com';

export function openPartnerInquiryEmail(): void {
  window.location.href = `mailto:${PARTNER_INQUIRY_EMAIL}`;
}
