import { COMPANY_LEGAL } from './companyLegal';
import { trackOutboundClick } from '../lib/analytics';

/** 입점·제휴 문의 — 공식 메일·카카오 (가짜 partner@ 도메인 사용 금지) */
export const PARTNER_INQUIRY_EMAIL = COMPANY_LEGAL.email;
export const PARTNER_INQUIRY_KAKAO_URL = COMPANY_LEGAL.kakaoChatUrl;

export function openPartnerInquiryEmail(): void {
  trackOutboundClick({
    category: 'email',
    destination: PARTNER_INQUIRY_EMAIL,
    itemName: '입점 제휴 이메일',
  });
  window.location.href = `mailto:${PARTNER_INQUIRY_EMAIL}?subject=${encodeURIComponent('에어픽 입점·제휴 문의')}`;
}

export function openPartnerInquiryKakao(): void {
  trackOutboundClick({
    category: 'email',
    destination: PARTNER_INQUIRY_KAKAO_URL,
    itemName: '입점 제휴 카카오톡',
  });
  window.open(PARTNER_INQUIRY_KAKAO_URL, '_blank', 'noopener,noreferrer');
}
