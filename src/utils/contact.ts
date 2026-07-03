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

/** 입력 중 연락처 — 010-0000-0000 형식 */
export function formatPhoneInput(raw: string): string {
  const d = phoneDigits(raw).slice(0, 11);
  if (d.length <= 3) return d;
  if (d.length <= 7) return `${d.slice(0, 3)}-${d.slice(3)}`;
  return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}`;
}
