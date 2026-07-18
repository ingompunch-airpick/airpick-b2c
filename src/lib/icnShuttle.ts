export interface IcnShuttleResponse {
  lotId: string;
  routeId: string;
  routeLabel: string;
  note: string;
  predMinutes: number | null;
  updatedAt?: string | null;
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
  if (predMinutes == null) return '실시간 도착 정보 없음';
  if (predMinutes <= 0) return '곧 도착 · 또는 운행 대기';
  return `셔틀 약 ${predMinutes}분 뒤`;
}
