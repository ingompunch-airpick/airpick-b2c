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
