export function phoneDigits(phone: string): string {
  return phone.replace(/\D/g, '');
}

export function buildTelHref(phone?: string): string | undefined {
  const digits = phone ? phoneDigits(phone) : '';
  if (!digits) return undefined;
  return `tel:${digits}`;
}

export function formatPhoneDisplay(phone: string): string {
  const d = phoneDigits(phone);
  if (d.length === 11) return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}`;
  return phone;
}

/**
 * 예약·프로필 저장용 휴대전화.
 * 01X-XXXX-XXXX (숫자 11자리)만 허용. 010-414-2709 같은 10자리는 거절.
 * 비회원 조회 입력은 이 함수를 쓰지 않아 옛 10자리 예약 조회는 가능.
 */
export function isValidMobilePhone(phone: string): boolean {
  return /^01\d{9}$/.test(phoneDigits(phone));
}

/** 입력 중 연락처 — 010-0000-0000 형식 */
export function formatPhoneInput(raw: string): string {
  const d = phoneDigits(raw).slice(0, 11);
  if (d.length <= 3) return d;
  if (d.length <= 7) return `${d.slice(0, 3)}-${d.slice(3)}`;
  return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}`;
}
