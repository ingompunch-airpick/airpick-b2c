/** 차량번호 저장·조회용 — 공백 제거 */
export function normalizeCarNumber(raw: string): string {
  return raw.trim().replace(/\s+/g, '');
}
