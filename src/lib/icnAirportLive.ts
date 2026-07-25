export type IcnAirportLiveHall = {
  gate: string;
  side: string | null;
  passengers: number;
  waitMinutes?: number | null;
  level: '여유' | '보통' | '혼잡' | '매우혼잡';
};

export type IcnAirportLiveResponse = {
  terminal: 'T1' | 'T2';
  referenceOnly: true;
  disclaimer: string;
  congestion: {
    available: boolean;
    asOf: string | null;
    halls: IcnAirportLiveHall[];
    busiest: IcnAirportLiveHall | null;
    note: string | null;
  };
  parking: {
    available?: boolean;
    asOf: string | null;
    longAvailable: number;
    shortAvailable: number;
    lots: Array<{
      name: string;
      occupied: number;
      total: number;
      available: number | null;
      operating: boolean;
    }>;
  };
  source?: string;
  error?: string;
  message?: string;
};

export async function fetchIcnAirportLive(
  terminal: 'T1' | 'T2' = 'T1'
): Promise<
  | { ok: true; data: IcnAirportLiveResponse }
  | { ok: false; status: number; data: IcnAirportLiveResponse | null }
> {
  try {
    const res = await fetch(
      `/api/icn-airport-live?terminal=${encodeURIComponent(terminal)}`
    );
    const data = (await res.json().catch(() => null)) as IcnAirportLiveResponse | null;
    if (!res.ok) return { ok: false, status: res.status, data };
    return { ok: true, data: data! };
  } catch {
    return { ok: false, status: 0, data: null };
  }
}
