export function formatYmd(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** 화면 표시용 — 2026.06.10 */
export function formatDateDisplay(ymd: string): string {
  const [y, m, d] = ymd.split('-');
  if (!y || !m || !d) return ymd;
  return `${y}.${m}.${d}`;
}

export function todayYmd(): string {
  return formatYmd(new Date());
}

/** 맡기는 날~찾는 날. days는 달력일(당일 1, 다음날 2). */
export function formatStayPhrase(days: number): string {
  const nights = Math.max(0, Math.round(days) - 1);
  if (nights === 0) return '당일';
  return `${nights}박 ${days}일`;
}

export function defaultBookingSearch() {
  const start = new Date();
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return {
    departureDate: formatYmd(start),
    arrivalDate: formatYmd(end),
    departureTime: '10:00',
    arrivalTime: '10:00',
    terminal: 'T1' as const,
    arrivalTerminal: 'T1' as const,
    isIndoor: true,
    isCardPayment: false,
  };
}
