/**
 * 인천공항 여객 출발편 → 터미널·체크인 카운터 조회.
 * 키: Secret Manager DATA_GO_KR_SERVICE_KEY
 */
import { defineSecret } from 'firebase-functions/params';
import { onRequest } from 'firebase-functions/v2/https';
import { logger } from 'firebase-functions';

const dataGoKrKey = defineSecret('DATA_GO_KR_SERVICE_KEY');

const DEPARTURE_URL =
  'https://apis.data.go.kr/B551177/StatusOfPassengerFlightsDeOdp/getPassengerDeparturesDeOdp';

type FlightItem = {
  airline?: string;
  flightId?: string;
  airport?: string;
  airportCode?: string;
  chkinrange?: string;
  terminalid?: string;
  scheduleDateTime?: string;
  estimatedDateTime?: string;
  remark?: string;
  codeshare?: string;
  masterflightid?: string;
};

type CacheEntry = { at: number; item: FlightItem | null; miss: boolean };
const cache = new Map<string, CacheEntry>();

function serviceKey(): string {
  try {
    const v = dataGoKrKey.value()?.trim();
    if (v) return v;
  } catch {
    /* local / unset */
  }
  return String(process.env.DATA_GO_KR_SERVICE_KEY ?? '').trim();
}

function seoulYmd(d = new Date()): string {
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const parts = Object.fromEntries(fmt.formatToParts(d).map((p) => [p.type, p.value]));
  return `${parts.year}${parts.month}${parts.day}`;
}

/** KE101 / ke-101 / KE 101 → KE101 */
export function normalizeFlightId(raw: string): string {
  const s = raw.toUpperCase().replace(/[^A-Z0-9]/g, '');
  const m = s.match(/^([A-Z]{1,3})(\d{1,4})$/);
  if (!m) return s;
  return `${m[1]}${m[2]}`;
}

function mapTerminal(terminalid: string | undefined): {
  terminal: 'T1' | 'T2' | null;
  terminalLabel: string | null;
  terminalId: string | null;
} {
  const id = String(terminalid ?? '').trim().toUpperCase();
  if (id === 'P03') {
    return { terminal: 'T2', terminalLabel: '제2여객터미널', terminalId: id };
  }
  if (id === 'P01') {
    return { terminal: 'T1', terminalLabel: '제1여객터미널', terminalId: id };
  }
  if (id === 'P02') {
    return { terminal: 'T1', terminalLabel: '제1여객터미널·탑승동', terminalId: id };
  }
  return { terminal: null, terminalLabel: null, terminalId: id || null };
}

function formatCheckIn(raw: string | undefined): string | null {
  const s = String(raw ?? '').trim();
  if (!s || s === '-' || s === '—' || s.toLowerCase() === 'null') return null;
  // "A B C D" → "A·B·C·D", "E01-E04" 유지
  if (/^[A-Z](\s+[A-Z])+$/i.test(s)) {
    return s.split(/\s+/).join('·');
  }
  return s.replace(/\s+/g, ' ');
}

function formatSchedule(raw: string | undefined): string | null {
  const s = String(raw ?? '').replace(/\D/g, '');
  if (s.length < 12) return null;
  return `${s.slice(8, 10)}:${s.slice(10, 12)}`;
}

function asArray<T>(items: T[] | T | undefined): T[] {
  if (!items) return [];
  return Array.isArray(items) ? items : [items];
}

async function fetchDeparture(key: string, date: string, flightId: string): Promise<FlightItem | null> {
  const cacheKey = `${date}:${flightId}`;
  const hit = cache.get(cacheKey);
  if (hit && Date.now() - hit.at < 60_000) {
    return hit.miss ? null : hit.item;
  }

  const u = new URL(DEPARTURE_URL);
  u.searchParams.set('serviceKey', key);
  u.searchParams.set('type', 'json');
  u.searchParams.set('pageNo', '1');
  u.searchParams.set('numOfRows', '20');
  u.searchParams.set('searchday', date);
  u.searchParams.set('from_time', '0000');
  u.searchParams.set('to_time', '2400');
  u.searchParams.set('lang', 'K');
  u.searchParams.set('flight_id', flightId);

  const res = await fetch(u.toString());
  if (!res.ok) throw new Error(`upstream_${res.status}`);
  const json = (await res.json()) as {
    response?: {
      header?: { resultCode?: string; resultMsg?: string };
      body?: { items?: { item?: FlightItem | FlightItem[] } | FlightItem | FlightItem[]; totalCount?: number };
    };
  };
  const code = json.response?.header?.resultCode;
  if (code !== '00') {
    throw new Error(json.response?.header?.resultMsg || 'flight_error');
  }

  const bodyItems = json.response?.body?.items;
  let list: FlightItem[] = [];
  if (bodyItems && typeof bodyItems === 'object' && 'item' in bodyItems) {
    list = asArray((bodyItems as { item?: FlightItem | FlightItem[] }).item);
  } else {
    list = asArray(bodyItems as FlightItem | FlightItem[] | undefined);
  }

  const exact = list.filter((i) => String(i.flightId ?? '').toUpperCase() === flightId);
  const pool = exact.length > 0 ? exact : list;
  // Master 편 우선, 없으면 첫 결과
  const master = pool.find((i) => String(i.codeshare ?? '').toLowerCase() === 'master');
  const item = master ?? pool[0] ?? null;

  cache.set(cacheKey, { at: Date.now(), item, miss: !item });
  return item;
}

/**
 * GET /api/icn-flight?flightId=KE101&date=20260719
 */
export const getIcnFlight = onRequest(
  {
    region: 'asia-northeast3',
    cors: true,
    secrets: [dataGoKrKey],
    timeoutSeconds: 30,
    memory: '256MiB',
  },
  async (req, res) => {
    if (req.method === 'OPTIONS') {
      res.status(204).send('');
      return;
    }
    if (req.method !== 'GET') {
      res.status(405).json({ error: 'method_not_allowed' });
      return;
    }

    const flightId = normalizeFlightId(String(req.query.flightId ?? req.query.flight_id ?? ''));
    const dateRaw = String(req.query.date ?? '').replace(/\D/g, '');
    const date = dateRaw.length === 8 ? dateRaw : seoulYmd();

    if (!flightId || flightId.length < 3) {
      res.status(400).json({ error: 'invalid_flight_id' });
      return;
    }

    const key = serviceKey();
    if (!key) {
      res.status(500).json({ error: 'missing_service_key' });
      return;
    }

    try {
      const item = await fetchDeparture(key, date, flightId);
      if (!item) {
        res.status(404).json({
          error: 'not_found',
          flightId,
          date,
          message: '해당 날짜에 출발편이 없습니다. 편명·날짜를 확인해 주세요.',
        });
        return;
      }

      const term = mapTerminal(item.terminalid);
      const checkInCounter = formatCheckIn(item.chkinrange);

      res.set('Cache-Control', 'public, max-age=60');
      res.status(200).json({
        flightId: String(item.flightId ?? flightId),
        airline: item.airline ?? null,
        destination: item.airport ?? null,
        destinationCode: item.airportCode ?? null,
        date,
        scheduleTime: formatSchedule(item.scheduleDateTime),
        estimatedTime: formatSchedule(item.estimatedDateTime),
        remark: item.remark ?? null,
        terminal: term.terminal,
        terminalLabel: term.terminalLabel,
        terminalId: term.terminalId,
        checkInCounter,
        codeshare: item.codeshare ?? null,
        masterFlightId: item.masterflightid || null,
        source: 'data.go.kr / B551177/StatusOfPassengerFlightsDeOdp',
      });
    } catch (err) {
      logger.error('getIcnFlight failed', err);
      res.status(502).json({
        error: 'upstream_failed',
        message: '운항 정보를 불러오지 못했습니다. 공공 API 활용신청·키를 확인해 주세요.',
      });
    }
  }
);
