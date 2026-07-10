import type { Terminal } from '../types';

export function terminalLabel(t: Terminal): string {
  return t === 'T1' ? '1터미널' : '2터미널';
}

/** 요약용 — 같으면 T1, 다르면 T1 → T2 */
export function formatTerminalSummary(departure: Terminal, arrival?: Terminal): string {
  const arr = arrival ?? departure;
  return departure === arr ? departure : `${departure} → ${arr}`;
}
