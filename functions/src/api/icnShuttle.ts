/**
 * 인천공항 무료 셔틀 — 공공데이터포털 ShtbusInfo 프록시.
 * 키: Secret Manager DATA_GO_KR_SERVICE_KEY (functions/.env 로컬 폴백).
 */
import { defineSecret } from 'firebase-functions/params';
import { onRequest } from 'firebase-functions/v2/https';
import { logger } from 'firebase-functions';

const dataGoKrKey = defineSecret('DATA_GO_KR_SERVICE_KEY');

const ARRIVAL_URL = 'https://apis.data.go.kr/B551177/ShtbusInfo/getShtbArrivalPredInfo';
const TIME_URL = 'https://apis.data.go.kr/B551177/ShtbusInfo/getShtbTimeInfo';

/** 공식 노선 매핑 (공항01=T1 장기, 공항02=T2 장기) — stop 이름은 API에 없어 route 단위로 집계 */
export const SHUTTLE_BY_LOT: Record<
  string,
  { routeId: string; routeLabel: string; note: string }
> = {
  'icn-t1-longterm': {
    routeId: '11100001',
    routeLabel: '공항01 · T1↔장기주차장',
    note: 'T1 장기주차장 순환 · 배차·정차는 현장·공식 안내 기준',
  },
  'icn-t2-longterm': {
    routeId: '11100006',
    routeLabel: '공항02 · T2↔장기주차장',
    note: 'T2 장기주차장 순환 · 배차·정차는 현장·공식 안내 기준',
  },
};

type ArrivalItem = {
  stopId?: string;
  routeId?: string;
  predTimes?: string;
  ofrTime?: string;
  ord?: string;
};

type TimeItem = {
  routeId?: string;
  dayType?: string;
  stopId?: string;
  startTime?: string;
  staOrd?: string;
};

let arrivalCache: { at: number; items: ArrivalItem[] } | null = null;
let timeCache: { at: number; items: TimeItem[] } | null = null;

function serviceKey(): string {
  try {
    const v = dataGoKrKey.value()?.trim();
    if (v) return v;
  } catch {
    /* local / unset */
  }
  return String(process.env.DATA_GO_KR_SERVICE_KEY ?? '').trim();
}

function seoulParts(now = new Date()) {
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  });
  const parts = Object.fromEntries(fmt.formatToParts(now).map((p) => [p.type, p.value]));
  const hhmm = `${parts.hour ?? '00'}${parts.minute ?? '00'}`;
  const weekday = parts.weekday ?? '';
  const isWeekend = weekday === 'Sat' || weekday === 'Sun';
  return { hhmm, isWeekend };
}

function formatHhmm(raw: string): string {
  const s = raw.replace(/\D/g, '').padStart(4, '0').slice(0, 4);
  return `${s.slice(0, 2)}:${s.slice(2, 4)}`;
}

async function fetchJson(url: string, key: string, pageNo: number, numOfRows: number) {
  const u = new URL(url);
  u.searchParams.set('serviceKey', key);
  u.searchParams.set('type', 'json');
  u.searchParams.set('pageNo', String(pageNo));
  u.searchParams.set('numOfRows', String(numOfRows));
  const res = await fetch(u.toString());
  if (!res.ok) throw new Error(`upstream_${res.status}`);
  return (await res.json()) as {
    response?: {
      header?: { resultCode?: string; resultMsg?: string };
      body?: { items?: ArrivalItem[] | TimeItem[] | ArrivalItem | TimeItem; totalCount?: number };
    };
  };
}

function asArray<T>(items: T[] | T | undefined): T[] {
  if (!items) return [];
  return Array.isArray(items) ? items : [items];
}

async function loadArrivals(key: string): Promise<ArrivalItem[]> {
  const now = Date.now();
  if (arrivalCache && now - arrivalCache.at < 60_000) return arrivalCache.items;
  const json = await fetchJson(ARRIVAL_URL, key, 1, 100);
  const code = json.response?.header?.resultCode;
  if (code !== '00') {
    throw new Error(json.response?.header?.resultMsg || 'arrival_error');
  }
  const items = asArray(json.response?.body?.items as ArrivalItem[] | ArrivalItem | undefined);
  arrivalCache = { at: now, items };
  return items;
}

async function loadTimes(key: string): Promise<TimeItem[]> {
  const now = Date.now();
  if (timeCache && now - timeCache.at < 30 * 60_000) return timeCache.items;

  const all: TimeItem[] = [];
  let page = 1;
  const pageSize = 1000;
  let total = Infinity;
  while (all.length < total && page <= 8) {
    const json = await fetchJson(TIME_URL, key, page, pageSize);
    const code = json.response?.header?.resultCode;
    if (code !== '00') {
      throw new Error(json.response?.header?.resultMsg || 'time_error');
    }
    total = Number(json.response?.body?.totalCount ?? 0);
    const batch = asArray(json.response?.body?.items as TimeItem[] | TimeItem | undefined);
    if (batch.length === 0) break;
    all.push(...batch);
    page += 1;
  }
  timeCache = { at: now, items: all };
  return all;
}

function nextPredMinutes(items: ArrivalItem[], routeId: string): number | null {
  const mins = items
    .filter((i) => i.routeId === routeId)
    .map((i) => Number(i.predTimes))
    .filter((n) => Number.isFinite(n) && n >= 0);
  if (mins.length === 0) return null;
  // 전부 0이면 운행 종료/대기일 수 있음 — 그래도 최솟값 반환 (클라이언트에서 문구 처리)
  return Math.min(...mins);
}

function upcomingTimes(
  items: TimeItem[],
  routeId: string,
  hhmm: string,
  isWeekend: boolean
): string[] {
  const preferredDay = isWeekend ? '2' : '1';
  let rows = items.filter((i) => i.routeId === routeId && i.dayType === preferredDay);
  if (rows.length === 0) {
    rows = items.filter((i) => i.routeId === routeId && i.dayType === '1');
  }
  // 노선 대표: 정류장 순번 1 (staOrd) — 필터 없으면 route 전체에서 시각만
  const ord1 = rows.filter((i) => String(i.staOrd) === '1');
  const pool = ord1.length > 0 ? ord1 : rows;

  const unique = [...new Set(pool.map((i) => String(i.startTime ?? '').replace(/\D/g, '')).filter(Boolean))]
    .sort();

  const upcoming = unique.filter((t) => t >= hhmm).slice(0, 12);
  if (upcoming.length > 0) return upcoming.map(formatHhmm);
  // 다음날 첫 운행
  return unique.slice(0, 8).map(formatHhmm);
}

/**
 * GET /api/icn-shuttle?lotId=icn-t1-longterm
 * 또는 ?lotId=...&detail=1 이면 출발 시각 목록 포함
 */
export const getIcnShuttle = onRequest(
  {
    region: 'asia-northeast3',
    cors: true,
    secrets: [dataGoKrKey],
    timeoutSeconds: 60,
    memory: '512MiB',
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

    const lotId = String(req.query.lotId ?? '').trim();
    const detail = String(req.query.detail ?? '') === '1';
    const meta = SHUTTLE_BY_LOT[lotId];
    if (!meta) {
      res.status(400).json({ error: 'unsupported_lot' });
      return;
    }

    const key = serviceKey();
    if (!key) {
      res.status(500).json({ error: 'missing_service_key' });
      return;
    }

    try {
      const { hhmm, isWeekend } = seoulParts();
      const arrivals = await loadArrivals(key);
      const predMinutes = nextPredMinutes(arrivals, meta.routeId);
      const ofr = arrivals.find((a) => a.routeId === meta.routeId)?.ofrTime;

      const payload: Record<string, unknown> = {
        lotId,
        routeId: meta.routeId,
        routeLabel: meta.routeLabel,
        note: meta.note,
        predMinutes,
        updatedAt: ofr ?? null,
        source: 'data.go.kr / B551177/ShtbusInfo',
      };

      if (detail) {
        const times = await loadTimes(key);
        payload.departures = upcomingTimes(times, meta.routeId, hhmm, isWeekend);
        payload.dayHint = isWeekend ? 'weekend' : 'weekday';
      }

      res.set('Cache-Control', detail ? 'public, max-age=60' : 'public, max-age=30');
      res.status(200).json(payload);
    } catch (err) {
      logger.error('getIcnShuttle failed', err);
      res.status(502).json({ error: 'upstream_failed' });
    }
  }
);
