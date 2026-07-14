/**
 * 미입점 주차대행 업체 — 구글 시트 → externalParkingCompanies.generated.ts
 *
 * 시트: data/parking/sheets.json (spreadsheetId + companiesSheet)
 * 로컬 폴백: data/parking/companies.csv
 *
 * companies 탭 컬럼 (위치 기준, 그룹 병합 헤더 포함):
 *   0 업체명 · 1 업체url · 2 시설유형
 *   3 야외기본료 · 4 야외기본일수 · 5 야외초과일추가
 *   6 실내기본료 · 7 실내기본일수 · 8 실내초과일추가
 *   9 할증시작 · 10 할증종료 · 11 할증금액
 *   12 T2추가요금 · 13 발렛비용T1 · 14 발렛비용T2
 */
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const sheetsConfigPath = path.join(root, 'data/parking/sheets.json');
const localCsvPath = path.join(root, 'data/parking/companies.csv');
const outPath = path.join(root, 'src/config/externalParkingCompanies.generated.ts');

const PLACEHOLDER_IMAGE =
  'https://images.unsplash.com/photo-1542282088-fe8426682b8f?auto=format&fit=crop&w=128&h=128&q=60';

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (ch === '"' && next === '"') {
        field += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        field += ch;
      }
      continue;
    }

    if (ch === '"') {
      inQuotes = true;
    } else if (ch === ',') {
      row.push(field.trim());
      field = '';
    } else if (ch === '\n' || (ch === '\r' && next === '\n')) {
      row.push(field.trim());
      field = '';
      if (row.some((c) => c.length > 0)) rows.push(row);
      row = [];
      if (ch === '\r') i++;
    } else if (ch !== '\r') {
      field += ch;
    }
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field.trim());
    if (row.some((c) => c.length > 0)) rows.push(row);
  }

  return rows;
}

function esc(str) {
  return String(str).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

/** "45,000" · "45000" · "" → number | undefined */
function num(value) {
  const v = String(value ?? '').replace(/,/g, '').trim();
  if (!v) return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

/** "5:00" · "05:00" · "24:00:00" → "HH:MM" | undefined */
function normalizeTime(value) {
  const v = String(value ?? '').trim();
  if (!v) return undefined;
  const m = v.match(/^(\d{1,2}):(\d{2})/);
  if (!m) return undefined;
  let h = Number(m[1]);
  const min = m[2];
  if (h === 24) h = 0;
  if (h < 0 || h > 23) return undefined;
  return `${String(h).padStart(2, '0')}:${min}`;
}

/** 시설유형 → 실내/야외 지원 여부 */
function parseFacility(raw) {
  const v = String(raw ?? '').replace(/\s/g, '');
  const hasIndoor = v.includes('실내');
  const hasOutdoor = v.includes('야외') || v.includes('실외');
  // 값이 비어 있으면 요금 칸으로 추론(호출부에서 처리)
  return { hasIndoor, hasOutdoor, provided: hasIndoor || hasOutdoor };
}

/** URL 호스트 또는 업체명 기반 안정적 ID */
function buildId(name, url, seen) {
  let base = '';
  const u = String(url ?? '').trim();
  if (u) {
    try {
      base = new URL(u).hostname.replace(/^www\./, '').split('.')[0];
    } catch {
      base = '';
    }
  }
  if (!base) base = String(name ?? '').trim().replace(/\s+/g, '-');
  let id = `ext-${base}`;
  let n = 2;
  while (seen.has(id)) {
    id = `ext-${base}-${n++}`;
  }
  seen.add(id);
  return id;
}

async function loadCsv() {
  let config = null;
  try {
    config = JSON.parse(await readFile(sheetsConfigPath, 'utf8'));
  } catch {
    config = null;
  }

  const envUrl = process.env.PARKING_COMPANIES_CSV_URL?.trim();
  const id = config?.spreadsheetId?.trim();
  const sheet = config?.companiesSheet?.trim();

  if (envUrl) {
    console.log('Fetching PARKING_COMPANIES_CSV_URL…');
    const res = await fetch(envUrl);
    if (!res.ok) throw new Error(`CSV fetch failed: ${res.status}`);
    return res.text();
  }

  if (id && sheet && !id.includes('구글시트')) {
    const url = `https://docs.google.com/spreadsheets/d/${id}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheet)}`;
    console.log(`Fetching companies (Google Sheet: ${sheet})…`);
    const res = await fetch(url);
    if (!res.ok) throw new Error(`CSV fetch failed: ${res.status}`);
    return res.text();
  }

  console.log(`Reading ${path.relative(root, localCsvPath)}…`);
  return readFile(localCsvPath, 'utf8');
}

function rowToCompany(cells, seen) {
  const get = (i) => (cells[i] ?? '').trim();

  const name = get(0);
  if (!name) return null;

  const url = get(1);
  const facility = parseFacility(get(2));

  const outdoorBasePrice = num(get(3));
  const outdoorBaseDays = num(get(4));
  const outdoorExtraPrice = num(get(5));
  const indoorBasePrice = num(get(6));
  const indoorBaseDays = num(get(7));
  const indoorExtraPrice = num(get(8));

  const surchargeStartTime = normalizeTime(get(9));
  const surchargeEndTime = normalizeTime(get(10));
  const surchargePrice = num(get(11));

  const t2Surcharge = num(get(12));
  const valetFeeT1 = num(get(13));
  const valetFeeT2 = num(get(14));

  const hasOutdoorFee = outdoorBasePrice != null;
  const hasIndoorFee = indoorBasePrice != null;

  // 시설유형 우선, 없으면 요금 칸으로 추론
  const supportsOutdoor = facility.provided ? facility.hasOutdoor : hasOutdoorFee;
  const supportsIndoor = facility.provided ? facility.hasIndoor : hasIndoorFee;

  if (!supportsOutdoor && !supportsIndoor) {
    console.warn(`  skip "${name}": 시설유형·요금 정보 없음`);
    return null;
  }

  return {
    id: buildId(name, url, seen),
    name,
    externalBookingUrl: url || undefined,
    supports_indoor: supportsIndoor,
    supports_outdoor: supportsOutdoor,
    is_indoor: supportsIndoor && !supportsOutdoor,
    outdoorBasePrice,
    outdoorBaseDays,
    outdoorExtraPrice,
    indoorBasePrice,
    indoorBaseDays,
    indoorExtraPrice,
    surchargeStartTime,
    surchargeEndTime,
    surchargePrice,
    t2Surcharge,
    valetFeeT1,
    valetFeeT2,
  };
}

function emitField(key, value) {
  if (value === undefined) return null;
  if (typeof value === 'number') return `    ${key}: ${value},`;
  if (typeof value === 'boolean') return `    ${key}: ${value},`;
  return `    ${key}: '${esc(value)}',`;
}

function generateTs(companies) {
  const updatedAt = new Date().toISOString();
  const blocks = companies.map((c) => {
    const lines = [
      emitField('id', c.id),
      emitField('name', c.name),
      emitField('externalBookingUrl', c.externalBookingUrl),
      emitField('isAirpickPartner', false),
      emitField('supports_indoor', c.supports_indoor),
      emitField('supports_outdoor', c.supports_outdoor),
      emitField('is_indoor', c.is_indoor),
      emitField('outdoorBasePrice', c.outdoorBasePrice),
      emitField('outdoorBaseDays', c.outdoorBaseDays),
      emitField('outdoorExtraPrice', c.outdoorExtraPrice),
      emitField('indoorBasePrice', c.indoorBasePrice),
      emitField('indoorBaseDays', c.indoorBaseDays),
      emitField('indoorExtraPrice', c.indoorExtraPrice),
      emitField('surchargeStartTime', c.surchargeStartTime),
      emitField('surchargeEndTime', c.surchargeEndTime),
      emitField('surchargePrice', c.surchargePrice),
      emitField('t2Surcharge', c.t2Surcharge),
      emitField('valetFeeT1', c.valetFeeT1),
      emitField('valetFeeT2', c.valetFeeT2),
      emitField('image_url', PLACEHOLDER_IMAGE),
      `    terminals: ['T1', 'T2'],`,
      `    base_price: ${c.outdoorBasePrice ?? c.indoorBasePrice ?? 0},`,
      `    base_days: ${c.outdoorBaseDays ?? c.indoorBaseDays ?? 1},`,
      `    extra_day_price: ${c.outdoorExtraPrice ?? c.indoorExtraPrice ?? 0},`,
      // Company 타입 호환용 — UI·정렬·스키마는 실후기만 사용 (시드 별점 표시 금지)
      `    rating: 0,`,
      `    reviews_count: 0,`,
      `    features: [],`,
      `    isOpen: true,`,
    ].filter(Boolean);
    return `  {\n${lines.join('\n')}\n  }`;
  });

  return `/** AUTO-GENERATED — npm run sync:parking (Google Sheet) */
import type { Company } from '../types';

/** CSV sync 시각 — npm run sync:parking 할 때마다 갱신 */
export const PARKING_OFFERS_UPDATED_AT = '${updatedAt}';

/** 에어픽 미입점 주차대행 업체 (구글 시트 기준 · 비교 전용) */
export const externalParkingCompanies: Company[] = [
${blocks.join(',\n')}
];
`;
}

async function main() {
  const csv = await loadCsv();
  const rows = parseCsv(csv.replace(/^\uFEFF/, ''));
  if (rows.length < 2) throw new Error('companies 탭에 헤더 + 데이터가 필요합니다');

  const seen = new Set();
  const companies = [];
  for (let r = 1; r < rows.length; r++) {
    const company = rowToCompany(rows[r], seen);
    if (company) {
      const facilityLabel = [
        company.supports_outdoor ? '야외' : null,
        company.supports_indoor ? '실내' : null,
      ]
        .filter(Boolean)
        .join('+');
      console.log(`  ${company.name} (${facilityLabel})`);
      companies.push(company);
    }
  }

  if (companies.length === 0) throw new Error('유효한 미입점 업체가 없습니다');

  await writeFile(outPath, generateTs(companies), 'utf8');
  console.log(`Wrote ${companies.length} companies → ${path.relative(root, outPath)}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
