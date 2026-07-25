export interface IcnShuttleStop {
  stopId: string;
  ord: number;
  name: string;
  predMinutes: number | null;
  departures?: string[];
}

export interface IcnShuttleResponse {
  lotId: string;
  routeId: string;
  routeLabel: string;
  note: string;
  predMinutes: number | null;
  /** live: 실시간 유효 / unavailable: 심야·운행대기·제공 중단 */
  liveStatus?: 'live' | 'unavailable';
  liveReason?: string | null;
  stopCount?: number;
  stops?: IcnShuttleStop[];
  updatedAt?: string | null;
  /** @deprecated 노선 대표 시각 — stops[].departures 사용 */
  departures?: string[];
  dayHint?: string;
  error?: string;
}

export async function fetchIcnShuttle(
  lotId: string,
  detail = false
): Promise<IcnShuttleResponse | null> {
  const qs = new URLSearchParams({ lotId });
  if (detail) qs.set('detail', '1');
  try {
    const res = await fetch(`/api/icn-shuttle?${qs.toString()}`);
    if (!res.ok) return null;
    return (await res.json()) as IcnShuttleResponse;
  } catch {
    return null;
  }
}

export function formatShuttlePred(predMinutes: number | null | undefined): string {
  if (predMinutes == null) return '—';
  if (predMinutes <= 0) return '곧 도착';
  return `약 ${predMinutes}분`;
}
