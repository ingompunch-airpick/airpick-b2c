/** 차량번호 조회·저장용 — 공백 제거 */
export function normalizeCarNumber(raw: string): string {
  return raw.trim().replace(/\s+/g, '');
}

/** 조회 시 매칭 후보 (원문 + 공백제거) */
export function carNumberLookupNeedles(raw: string): string[] {
  const trimmed = raw.trim();
  const compact = normalizeCarNumber(raw);
  return [...new Set([trimmed, compact].filter(Boolean))];
}
