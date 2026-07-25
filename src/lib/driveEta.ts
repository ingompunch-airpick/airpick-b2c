export interface DriveEtaResponse {
  address: string;
  start: { lat: number; lng: number };
  goal: { lat: number; lng: number };
  durationMs: number;
  durationMinutes: number;
  distanceM: number;
  source?: string;
  error?: string;
  message?: string;
}

export async function fetchDriveEta(
  address: string,
  goal: { lat: number; lng: number }
): Promise<
  | { ok: true; data: DriveEtaResponse }
  | { ok: false; status: number; data: DriveEtaResponse | null }
> {
  const qs = new URLSearchParams({
    address: address.trim(),
    goalLat: String(goal.lat),
    goalLng: String(goal.lng),
  });
  try {
    const res = await fetch(`/api/drive-eta?${qs.toString()}`);
    const data = (await res.json().catch(() => null)) as DriveEtaResponse | null;
    if (!res.ok) return { ok: false, status: res.status, data };
    return { ok: true, data: data! };
  } catch {
    return { ok: false, status: 0, data: null };
  }
}
