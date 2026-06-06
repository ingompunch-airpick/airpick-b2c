/** 업체명 등 표시용 — 이모지·기호 접두사 제거 */
export function displayCompanyName(name: string): string {
  return name
    .replace(/\p{Extended_Pictographic}/gu, '')
    .replace(/^[\s·•\-–—]+/, '')
    .trim();
}
