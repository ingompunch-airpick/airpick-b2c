export interface IcnFlightResponse {
  flightId: string;
  airline: string | null;
  destination: string | null;
  destinationCode: string | null;
  date: string;
  scheduleTime: string | null;
  estimatedTime: string | null;
  remark: string | null;
  terminal: 'T1' | 'T2' | null;
  terminalLabel: string | null;
  terminalId: string | null;
  checkInCounter: string | null;
  codeshare?: string | null;
  masterFlightId?: string | null;
  error?: string;
  message?: string;
}

export async function fetchIcnFlight(
  flightId: string,
  date?: string
): Promise<{ ok: true; data: IcnFlightResponse } | { ok: false; status: number; data: IcnFlightResponse | null }> {
  const qs = new URLSearchParams({ flightId: flightId.trim() });
  if (date) qs.set('date', date.replace(/\D/g, ''));
  try {
    const res = await fetch(`/api/icn-flight?${qs.toString()}`);
    const data = (await res.json().catch(() => null)) as IcnFlightResponse | null;
    if (!res.ok) return { ok: false, status: res.status, data };
    return { ok: true, data: data! };
  } catch {
    return { ok: false, status: 0, data: null };
  }
}

export function todaySeoulYmd(): string {
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const parts = Object.fromEntries(fmt.formatToParts(new Date()).map((p) => [p.type, p.value]));
  return `${parts.year}${parts.month}${parts.day}`;
}

export function ymdToInputValue(ymd: string): string {
  if (ymd.length !== 8) return '';
  return `${ymd.slice(0, 4)}-${ymd.slice(4, 6)}-${ymd.slice(6, 8)}`;
}

export function inputValueToYmd(value: string): string {
  return value.replace(/\D/g, '').slice(0, 8);
}
