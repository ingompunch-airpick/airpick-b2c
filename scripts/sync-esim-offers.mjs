/**
 * 유심/eSIM 제휴 요금 — 구글 시트(CSV) → esimPartnerOffers.generated.ts
 *
 * partners 탭     → data/esim/partners.csv
 * usimsa_esim     → data/esim/offers/usimsa_esim.csv
 * dokkebi_esim    → data/esim/offers/dokkebi_esim.csv
 * (파일명: {partnerId}_{esim|usim}.csv)
 *
 * 요금 탭 컬럼: countryCode, dataPlan, days, price, description
 */
import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const legacyCsvPath = path.join(root, 'data/esim-offers.csv');
const partnersCsvPath = path.join(root, 'data/esim/partners.csv');
const offersDir = path.join(root, 'data/esim/offers');
const outPath = path.join(root, 'src/config/esimPartnerOffers.generated.ts');

const VALID_DATA_PLANS = new Set(['500mb', '1gb', '2gb', '3gb', '4gb', '5gb', 'unlimited']);
const VALID_SPEEDS = new Set(['lte', '5g']);
const VALID_TYPES = new Set(['esim', 'usim']);
const OFFER_FILE_RE = /^([a-z0-9-]+)_(esim|usim)\.csv$/i;

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

function parseBool(value, defaultWhenEmpty = false) {
  if (value === undefined || value === null) return defaultWhenEmpty;
  const v = String(value).trim().toLowerCase();
  if (v === '') return defaultWhenEmpty;
  return !['false', '0', 'n', 'no'].includes(v);
}

function esc(str) {
  return String(str).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

async function fileExists(filePath) {
  try {
    await readFile(filePath);
    return true;
  } catch {
    return false;
  }
}

async function loadTextFromPathOrUrl(filePath, envUrlKey) {
  const url = process.env[envUrlKey]?.trim();
  if (url) {
    console.log(`Fetching ${envUrlKey}…`);
    const res = await fetch(url);
    if (!res.ok) throw new Error(`CSV fetch failed (${envUrlKey}): ${res.status}`);
    return res.text();
  }
  console.log(`Reading ${path.relative(root, filePath)}…`);
  return readFile(filePath, 'utf8');
}

function normalizeDataPlan(raw) {
  const v = String(raw ?? '').trim().toLowerCase().replace(/\s/g, '');
  if (!v) return '';
  if (v === '무제한' || v === 'unlimited' || v === '무한') return 'unlimited';
  if (v === '500' || v === '500mb') return '500mb';
  if (v === '1' || v === '1gb' || v === '1g') return '1gb';
  if (v === '2' || v === '2gb' || v === '2g') return '2gb';
  if (v === '3' || v === '3gb' || v === '3g') return '3gb';
  if (v === '4' || v === '4gb' || v === '4g') return '4gb';
  if (v === '5' || v === '5gb' || v === '5g') return '5gb';
  return v;
}

function buildOfferId(partner, get) {
  const explicit = get('id');
  if (explicit && !explicit.includes('template')) return explicit;

  const country = get('countryCode').toUpperCase();
  const dataPlan = normalizeDataPlan(get('dataPlan'));
  const speed = (get('speed') || 'lte').toLowerCase();
  const days = get('days');
  return `${partner.partnerId}-${country}-${dataPlan}-${speed}-${days}d-${partner.simType}`;
}

function parseOfferRow(get, rowNum, partner) {
  const dataPlan = normalizeDataPlan(get('dataPlan'));
  const speed = (get('speed') || 'lte').toLowerCase();
  const type = (get('type') || partner.simType).toLowerCase();
  const days = Number(get('days'));
  const price = Number(String(get('price')).replace(/,/g, ''));

  if (!VALID_DATA_PLANS.has(dataPlan)) {
    throw new Error(`Row ${rowNum}: invalid dataPlan "${get('dataPlan')}"`);
  }
  if (get('speed') && !VALID_SPEEDS.has(speed)) {
    throw new Error(`Row ${rowNum}: invalid speed "${get('speed')}"`);
  }
  if (!VALID_TYPES.has(type)) {
    throw new Error(`Row ${rowNum}: invalid type "${type}"`);
  }
  if (!Number.isFinite(days) || days <= 0) {
    throw new Error(`Row ${rowNum}: invalid days "${get('days')}"`);
  }
  if (!Number.isFinite(price) || price < 0) {
    throw new Error(`Row ${rowNum}: invalid price "${get('price')}"`);
  }

  return {
    id: buildOfferId(partner, get),
    partnerName: partner.partnerName,
    partnerUrl: partner.partnerUrl,
    countryCode: get('countryCode').toUpperCase(),
    dataPlan,
    speed,
    days,
    type,
    price: Math.round(price),
    description: get('description') || undefined,
    isActive: parseBool(get('isActive') || undefined, true),
  };
}

function rowsToPartnerOffers(rows, partner, sourceLabel) {
  if (rows.length < 2) return [];

  const header = rows[0].map((h) => h.trim());
  const required = ['countryCode', 'dataPlan', 'days', 'price'];
  for (const col of required) {
    if (!header.includes(col)) {
      throw new Error(`${sourceLabel}: missing column "${col}"`);
    }
  }

  const idx = Object.fromEntries(header.map((h, i) => [h, i]));
  const offers = [];

  for (let r = 1; r < rows.length; r++) {
    const cells = rows[r];
    if (!cells.some((c) => c.trim())) continue;

    const get = (col) => (cells[idx[col]] ?? '').trim();
    if (!get('countryCode') || !get('dataPlan')) continue;
    if (header.includes('isActive') && !parseBool(get('isActive'), true)) continue;
    if (Number(String(get('price')).replace(/,/g, '')) <= 0) continue;

    offers.push(parseOfferRow(get, r + 1, partner));
  }

  return offers;
}

function parsePartners(rows) {
  if (rows.length < 2) throw new Error('partners.csv needs header + at least one partner');

  const header = rows[0].map((h) => h.trim());
  for (const col of ['partnerId', 'partnerName', 'partnerUrl']) {
    if (!header.includes(col)) throw new Error(`partners.csv missing column: ${col}`);
  }

  const idx = Object.fromEntries(header.map((h, i) => [h, i]));
  const byId = new Map();

  for (let r = 1; r < rows.length; r++) {
    const cells = rows[r];
    if (!cells.some((c) => c.trim())) continue;

    const get = (col) => (cells[idx[col]] ?? '').trim();
    const partnerId = get('partnerId').toLowerCase();
    if (!partnerId) continue;
    if (!parseBool(get('isActive') || undefined, true)) continue;

    byId.set(partnerId, {
      partnerId,
      partnerName: get('partnerName'),
      partnerUrl: get('partnerUrl'),
    });
  }

  return byId;
}

async function loadPartnerTabOffers() {
  const partnersCsv = await loadTextFromPathOrUrl(partnersCsvPath, 'ESIM_PARTNERS_CSV_URL');
  const partnerById = parsePartners(parseCsv(partnersCsv.replace(/^\uFEFF/, '')));
  if (partnerById.size === 0) throw new Error('No active partners in partners.csv');

  const entries = await readdir(offersDir);
  const offerFiles = entries
    .filter((name) => OFFER_FILE_RE.test(name))
    .sort((a, b) => a.localeCompare(b));

  if (offerFiles.length === 0) {
    throw new Error(
      'No offer files in data/esim/offers/. Expected usimsa_esim.csv, dokkebi_esim.csv, etc.'
    );
  }

  const offers = [];

  for (const fileName of offerFiles) {
    const match = fileName.match(OFFER_FILE_RE);
    const partnerId = match[1].toLowerCase();
    const simType = match[2].toLowerCase();
    const meta = partnerById.get(partnerId);
    if (!meta) {
      console.warn(`  skip ${fileName}: partnerId "${partnerId}" not in partners.csv`);
      continue;
    }

    const csv = await readFile(path.join(offersDir, fileName), 'utf8');
    const rows = parseCsv(csv.replace(/^\uFEFF/, ''));
    const partnerOffers = rowsToPartnerOffers(rows, { ...meta, simType }, fileName);
    console.log(`  ${meta.partnerName} (${simType}): ${partnerOffers.length} offers ← ${fileName}`);
    offers.push(...partnerOffers);
  }

  return { offers, sourceLabel: 'data/esim/partners + offers/*_{esim|usim}.csv' };
}

function generateTs(offers, sourceLabel) {
  const updatedAt = new Date().toISOString();
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

  return `/** AUTO-GENERATED — npm run sync:esim (${sourceLabel}) */\nimport type { EsimProduct } from '../types';\nimport { enrichEsimOffers } from './esimOfferEnrich';\n\n/** CSV sync 시각 — npm run sync:esim 할 때마다 갱신 */\nexport const ESIM_OFFERS_UPDATED_AT = '${updatedAt}';\n\nconst RAW: EsimProduct[] = [\n${lines.join(',\n')}\n];\n\nexport const ESIM_PARTNER_OFFERS: EsimProduct[] = enrichEsimOffers(RAW);\n`;
}

async function main() {
  if (!(await fileExists(partnersCsvPath))) {
    throw new Error('Missing data/esim/partners.csv');
  }

  const { offers, sourceLabel } = await loadPartnerTabOffers();
  if (offers.length === 0) {
    throw new Error('No offers found. Check price column and CSV file names.');
  }

  const ts = generateTs(offers, sourceLabel);
  await writeFile(outPath, ts, 'utf8');
  console.log(`Wrote ${offers.length} offers → ${path.relative(root, outPath)}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
