/** 차량번호 저장·조회용 — 공백 제거 */
export function normalizeCarNumber(raw: string): string {
  return raw.trim().replace(/\s+/g, '');
}

/** 끝 숫자 4자리 — 조회 보조 키 (61소0272 → 0272) */
export function carNumberTail(raw: string): string | null {
  const digits = normalizeCarNumber(raw).replace(/\D/g, '');
  if (digits.length < 4) return null;
  return digits.slice(-4);
}

/**
 * 예약 입력 검증 — 12가3456 · 123가4567 · 서울12가3456 형태.
 * 오타로 조회·기사 배차가 막히는 것을 막는 용도(과도한 제한은 하지 않음).
 */
export function isLikelyCarNumber(raw: string): boolean {
  return /^[가-힣]{0,3}\d{2,3}[가-힣]\d{4}$/.test(normalizeCarNumber(raw));
}
