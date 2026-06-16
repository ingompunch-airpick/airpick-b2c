/**
 * 유심/eSIM 제휴 요금 — 구글 시트(CSV) → esimPartnerOffers.generated.ts
 *
 * 1) 구글 시트 첫 행 = 헤더 (data/esim-offers.csv 와 동일)
 * 2) 시트 → 파일 → CSV 다운로드 → data/esim-offers.csv 덮어쓰기
 *    또는 시트 "웹에 게시" 후 URL:
 *    ESIM_SHEET_CSV_URL="https://docs.google.com/spreadsheets/d/ID/export?format=csv&gid=0"
 * 3) npm run sync:esim
 */
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const csvPath = path.join(root, 'data/esim-offers.csv');
const outPath = path.join(root, 'src/config/esimPartnerOffers.generated.ts');

const VALID_DATA_PLANS = new Set(['1gb', '2gb', 'unlimited']);
const VALID_SPEEDS = new Set(['lte', '5g']);
const VALID_TYPES = new Set(['esim', 'usim']);

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

function parseBool(value) {
  const v = String(value ?? 'true').trim().toLowerCase();
  return !['false', '0', 'n', 'no', ''].includes(v);
}

function esc(str) {
  return String(str).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

async function loadCsv() {
  const url = process.env.ESIM_SHEET_CSV_URL?.trim();
  if (url) {
    console.log('Fetching CSV from ESIM_SHEET_CSV_URL…');
    const res = await fetch(url);
    if (!res.ok) throw new Error(`CSV fetch failed: ${res.status} ${res.statusText}`);
    return res.text();
  }
  console.log(`Reading ${path.relative(root, csvPath)}…`);
  return readFile(csvPath, 'utf8');
}

function rowsToOffers(rows) {
  if (rows.length < 2) throw new Error('CSV must have a header row and at least one data row');

  const header = rows[0].map((h) => h.trim());
  const required = [
    'id',
    'partnerName',
    'partnerUrl',
    'countryCode',
    'dataPlan',
    'speed',
    'days',
    'type',
    'price',
  ];
  for (const col of required) {
    if (!header.includes(col)) throw new Error(`Missing column: ${col}`);
  }

  const idx = Object.fromEntries(header.map((h, i) => [h, i]));
  const offers = [];

  for (let r = 1; r < rows.length; r++) {
    const cells = rows[r];
    if (!cells.some((c) => c.trim())) continue;

    const get = (col) => (cells[idx[col]] ?? '').trim();
    const id = get('id');
    if (!id) continue;

    const dataPlan = get('dataPlan').toLowerCase();
    const speed = get('speed').toLowerCase();
    const type = get('type').toLowerCase();
    const days = Number(get('days'));
    const price = Number(String(get('price')).replace(/,/g, ''));

    if (!VALID_DATA_PLANS.has(dataPlan)) {
      throw new Error(`Row ${r + 1}: invalid dataPlan "${dataPlan}"`);
    }
    if (!VALID_SPEEDS.has(speed)) {
      throw new Error(`Row ${r + 1}: invalid speed "${speed}"`);
    }
    if (!VALID_TYPES.has(type)) {
      throw new Error(`Row ${r + 1}: invalid type "${type}"`);
    }
    if (!Number.isFinite(days) || days <= 0) {
      throw new Error(`Row ${r + 1}: invalid days "${get('days')}"`);
    }
    if (!Number.isFinite(price) || price < 0) {
      throw new Error(`Row ${r + 1}: invalid price "${get('price')}"`);
    }

    offers.push({
      id,
      partnerName: get('partnerName'),
      partnerUrl: get('partnerUrl'),
      countryCode: get('countryCode').toUpperCase(),
      dataPlan,
      speed,
      days,
      type,
      price: Math.round(price),
      description: get('description') || undefined,
      isActive: parseBool(get('isActive')),
    });
  }

  return offers;
}

function generateTs(offers, sourceLabel) {
  const lines = offers.map((o) => {
    const parts = [
      `    id: '${esc(o.id)}'`,
      `    partnerName: '${esc(o.partnerName)}'`,
      `    partnerUrl: '${esc(o.partnerUrl)}'`,
      `    countryCode: '${esc(o.countryCode)}'`,
      `    dataPlan: '${o.dataPlan}'`,
      `    speed: '${o.speed}'`,
      `    days: ${o.days}`,
      `    type: '${o.type}'`,
      `    price: ${o.price}`,
    ];
    if (o.description) parts.push(`    description: '${esc(o.description)}'`);
    if (!o.isActive) parts.push(`    isActive: false`);
    return `  {\n${parts.join(',\n')},\n    name: '',\n    region: '',\n  }`;
  });

  return `/** AUTO-GENERATED — npm run sync:esim (${sourceLabel}) */\nimport type { EsimProduct } from '../types';\nimport { enrichEsimOffers } from './esimOfferEnrich';\n\nconst RAW: EsimProduct[] = [\n${lines.join(',\n')}\n];\n\nexport const ESIM_PARTNER_OFFERS: EsimProduct[] = enrichEsimOffers(RAW);\n`;
}

async function main() {
  const csv = await loadCsv();
  const rows = parseCsv(csv.replace(/^\uFEFF/, ''));
  const offers = rowsToOffers(rows);
  if (offers.length === 0) throw new Error('No offers found in CSV');

  const sourceLabel = process.env.ESIM_SHEET_CSV_URL ? 'google sheet url' : 'data/esim-offers.csv';
  const ts = generateTs(offers, sourceLabel);
  await writeFile(outPath, ts, 'utf8');
  console.log(`Wrote ${offers.length} offers → ${path.relative(root, outPath)}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
