/**
 * 보험 한도 문구 표시용 정규화. Firestore 원문은 바꾸지 않는다.
 * 예: "대인 : 5,000만원, 대물 : 2억" → "대인 5천만원 · 대물 2억"
 */

/** 금액 안 천단위 쉼표는 구간 구분자로 쓰지 않도록 먼저 정규화 */
function normalizeAmountToken(raw: string): string {
  let s = raw.replace(/\s+/g, '');
  // 5,000만원 / 1,000만원 / 12,000만원 → 5천만원 / 1천만원 / 1억2천만원 등
  s = s.replace(/(\d{1,3}(?:,\d{3})+)만원/g, (full, grouped: string) => {
    const n = Number(grouped.replace(/,/g, ''));
    if (!Number.isFinite(n)) return full;
    if (n >= 10_000 && n % 10_000 === 0) return `${n / 10_000}억원`;
    if (n >= 1_000 && n % 1_000 === 0) return `${n / 1_000}천만원`;
    return `${n.toLocaleString('ko-KR')}만원`;
  });
  s = s.replace(/(\d+)000만원/g, (_, a: string) => {
    const n = Number(a);
    if (!Number.isFinite(n)) return `${a}000만원`;
    if (n >= 10 && n % 10 === 0) return `${n / 10}억원`;
    return `${n}천만원`;
  });
  // 2억 / 2억원 유지
  s = s.replace(/(\d+(?:\.\d+)?)억(?!원)/g, '$1억');
  return s;
}

function normalizeSegment(seg: string): string | null {
  let s = seg.trim();
  if (!s) return null;
  s = s.replace(/\s*[:：]\s*/g, ' ');
  s = s.replace(/\s+/g, ' ').trim();
  const m = s.match(/^(대인|대물|자차|자기신체|차량)\s*(.+)$/i);
  if (m) {
    return `${m[1]} ${normalizeAmountToken(m[2]!)}`;
  }
  return normalizeAmountToken(s);
}

/** 구간 분리: 금액 내부 `5,000` 쉼표는 제외 */
function splitCoverageParts(text: string): string[] {
  const parts: string[] = [];
  let buf = '';
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]!;
    if (ch === '·' || ch === '∙' || ch === '•' || ch === '|' || ch === '/' || ch === '、' || ch === '，') {
      if (buf.trim()) parts.push(buf);
      buf = '';
      continue;
    }
    if (ch === ',') {
      const prev = text[i - 1];
      const next = text[i + 1];
      const inAmount = prev != null && /\d/.test(prev) && next != null && /\d/.test(next);
      if (!inAmount) {
        if (buf.trim()) parts.push(buf);
        buf = '';
        continue;
      }
    }
    buf += ch;
  }
  if (buf.trim()) parts.push(buf);
  return parts;
}

/** coverageLimitText 표시용. 빈 입력은 빈 문자열 */
export function formatCoverageLimitDisplay(raw?: string | null): string {
  const text = (raw || '').trim();
  if (!text) return '';
  const parts = splitCoverageParts(text)
    .map((p) => normalizeSegment(p))
    .filter((p): p is string => Boolean(p));
  return parts.join(' · ');
}
