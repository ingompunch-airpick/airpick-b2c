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

export function defaultBookingSearch() {
  const start = new Date();
  start.setDate(start.getDate() + 1);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
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
