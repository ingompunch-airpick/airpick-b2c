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

/**
 * 후기 공개용 차량번호 마스킹 — 앞은 두고 끝 2자리만 **
 * 예: 31소3456 → 31소34**
 */
export function maskCarNumber(raw: string): string {
  const t = normalizeCarNumber(raw);
  if (!t) return '';
  if (t.length <= 2) return '*'.repeat(t.length);
  if (t.length <= 4) return `${t[0]}${'*'.repeat(t.length - 1)}`;
  return `${t.slice(0, -2)}**`;
}
