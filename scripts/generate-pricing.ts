/**
 * 입점 업체 요금표 HTML·llms — Firestore companies + calculatePrice.
 * 손으로 금액을 넣지 말 것. 수정 후: npm run pricing
 *
 * 이전에는 data/partners/pages.json(SEO 랜딩 2곳)만 써서 앱 목록(6곳)과 어긋남.
 * 지금은 앱과 같이 Firestore 입점·요금 설정을 읽는다.
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { deleteApp, initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { collection, getDocs, getFirestore } from 'firebase/firestore';
import type { Company } from '../src/types';
import { displayCompanyName } from '../src/utils/display';
import { formatStayPhrase } from '../src/utils/dates';
import {
  calculatePrice,
  isGayuCompany,
  mergePartnerPricing,
} from '../src/utils/pricing';
import { LEGAL_SITE_FOOTER_HTML } from './legal-site-footer.mjs';
import { parseVerificationView } from '../src/utils/verification';
import { DEFAULT_CANCEL_CUTOFF_HOURS } from '../src/utils/reservationCancel';
import { APP_CONFIG } from '../src/constants/appConfig';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const cachePath = path.join(root, 'data/partners/pricing-companies.generated.json');
const outDir = path.join(root, 'public/pricing');
const outHtml = path.join(outDir, 'index.html');
const llmsPath = path.join(root, 'public/llms.txt');
/** 업체 상세 공개 페이지(/partners/{id}/)용 — generate-partners.mjs 가 읽는다 */
const profilesPath = path.join(root, 'data/partners/profiles.generated.json');
const PROFILE_DAYS = [2, 3, 5, 7] as const;

const LLMS_START = '<!-- pricing:auto:start -->';
const LLMS_END = '<!-- pricing:auto:end -->';

const SAMPLE_TIME = '10:00';
const STAY_DAYS = [3, 5, 7] as const;

const firebaseConfig = {
  projectId: 'airpick-reservation',
  appId: '1:417452643834:web:b42b0c3f863b3b7c370043',
  apiKey: 'AIzaSyDbZyPUwzp166aX8PzDmoIzqER8bDV8tyo',
  authDomain: 'airpick-reservation.firebaseapp.com',
  storageBucket: 'airpick-reservation.firebasestorage.app',
  messagingSenderId: '417452643834',
};

function kstTodayYmd(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

function formatDisplayYmd(ymd: string): string {
  const [y, m, d] = ymd.split('-');
  if (!y || !m || !d) return ymd;
  return `${y}.${m}.${d}`;
}

function endDateForStay(startYmd: string, days: number): string {
  const [y, m, d] = startYmd.split('-').map(Number);
  const dt = new Date(y!, m! - 1, d!);
  dt.setDate(dt.getDate() + (days - 1));
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
}

function sampleStartYmd(asOf: string): string {
  return endDateForStay(asOf, 2);
}

function esc(s: string): string {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function won(n: number): string {
  return `${Math.round(n).toLocaleString('ko-KR')}원`;
}

/** Firestore에 요금 칸이 하나라도 잡힌 업체 (기본값만 있는 빈 문서 제외) */
function hasPricingConfigured(data: Record<string, unknown>, id: string, name: string): boolean {
  if (isGayuCompany(id, name) || data.pricingProfile) return true;
  const keys = [
    'outdoorBasePrice',
    'indoorBasePrice',
    'base_price',
    'outdoorExtraPrice',
    'indoorExtraPrice',
    'extra_day_price',
  ] as const;
  return keys.some((k) => {
    const n = Number(data[k]);
    return Number.isFinite(n) && n > 0;
  });
}

/** B2B 상품 「에어픽 앱에서 숨김」 — 숨기지 않은 상품이 있는 실내/야외만 요금표에 싣는다 */
function visibleLotsFromProducts(data: Record<string, unknown>): { indoor: boolean; outdoor: boolean } | null {
  if (!Array.isArray(data.parkingProducts)) return null;
  const visible = data.parkingProducts.filter(
    (p) => p && typeof p === 'object' && (p as Record<string, unknown>).hidden !== true
  ) as Record<string, unknown>[];
  return {
    indoor: visible.some((p) => p.lot === 'indoor'),
    outdoor: visible.some((p) => p.lot === 'outdoor'),
  };
}

function companyFromFirestore(id: string, data: Record<string, unknown>): Company | null {
  const name = String(data.name || '').trim();
  if (!name) return null;
  if (String(data.status || '') === 'suspended') return null;
  if (data.listingApproved === false) return null;
  if (data.isAirpickPartner === false) return null;
  if (data.isOpen === false) return null;
  if (!hasPricingConfigured(data, id, name)) return null;
  const lots = visibleLotsFromProducts(data);
  if (lots && !lots.indoor && !lots.outdoor) return null;

  return mergePartnerPricing({
    id,
    name,
    is_indoor: data.is_indoor !== false,
    supports_indoor: data.supports_indoor !== false && (lots ? lots.indoor : true),
    supports_outdoor: data.supports_outdoor !== false && (lots ? lots.outdoor : true),
    base_price: Number(data.base_price) || undefined,
    base_days: Number(data.base_days) || undefined,
    extra_day_price: Number(data.extra_day_price) || undefined,
    outdoorBasePrice: Number(data.outdoorBasePrice) || undefined,
    outdoorBaseDays: Number(data.outdoorBaseDays) || undefined,
    outdoorExtraPrice: Number(data.outdoorExtraPrice) || undefined,
    indoorBasePrice: Number(data.indoorBasePrice) || undefined,
    indoorBaseDays: Number(data.indoorBaseDays) || undefined,
    indoorExtraPrice: Number(data.indoorExtraPrice) || undefined,
    surchargeStartTime: data.surchargeStartTime ? String(data.surchargeStartTime) : undefined,
    surchargeEndTime: data.surchargeEndTime ? String(data.surchargeEndTime) : undefined,
    surchargePrice: Number(data.surchargePrice) || undefined,
    t2Surcharge: Number(data.t2Surcharge) || undefined,
    peakStartTime: data.peakStartTime ? String(data.peakStartTime) : undefined,
    peakEndTime: data.peakEndTime ? String(data.peakEndTime) : undefined,
    peakSurcharge: Number(data.peakSurcharge) || undefined,
    pricingProfile: data.pricingProfile ? String(data.pricingProfile) : undefined,
    isAirpickPartner: true,
    listingApproved: true,
    isOpen: true,
  } as Company);
}

type Cell = {
  partnerId: string;
  partnerName: string;
  terminal: 'T1' | 'T2';
  parking: '실내' | '야외';
  days: number;
  departureDate: string;
  arrivalDate: string;
  total: number;
};

function stayHeader(startYmd: string, days: number): { title: string; sub: string } {
  const end = endDateForStay(startYmd, days);
  return {
    title: `${days}일 · ${formatStayPhrase(days)}`,
    sub: `${formatDisplayYmd(startYmd)} ${SAMPLE_TIME} ~ ${formatDisplayYmd(end)} ${SAMPLE_TIME}`,
  };
}

function buildCells(companies: Company[], startYmd: string): Cell[] {
  const cells: Cell[] = [];
  for (const company of companies) {
    const outdoorOk = company.supports_outdoor !== false;
    const indoorOk = company.supports_indoor !== false;
    /** 가유 등 야외 전용 — supports_indoor false */
    const modes: { indoor: boolean; parking: '실내' | '야외' }[] = [];
    if (outdoorOk) modes.push({ indoor: false, parking: '야외' });
    if (indoorOk) modes.push({ indoor: true, parking: '실내' });
    if (!modes.length) continue;

    const partnerName = displayCompanyName(company.name);
    for (const terminal of ['T1', 'T2'] as const) {
      for (const mode of modes) {
        for (const days of STAY_DAYS) {
          const arrivalDate = endDateForStay(startYmd, days);
          const total = calculatePrice(
            company,
            startYmd,
            arrivalDate,
            mode.indoor,
            terminal === 'T2',
            SAMPLE_TIME,
            SAMPLE_TIME,
            false
          );
          cells.push({
            partnerId: company.id,
            partnerName,
            terminal,
            parking: mode.parking,
            days,
            departureDate: startYmd,
            arrivalDate,
            total,
          });
        }
      }
    }
  }
  return cells;
}

function pageChrome(title: string): string {
  return `<header class="page-bar">
        <a class="page-bar-back" href="/" data-seo-back aria-label="뒤로">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg>
        </a>
        <p class="page-bar-title">${esc(title)}</p>
      </header>
      <nav class="topnav" aria-label="사이트 메뉴">
        <a class="brand" href="/">에어픽</a>
        <a href="/">주차대행 비교</a>
        <a href="/partners/">입점 업체</a>
        <a href="/terms/">이용약관</a>
      </nav>`;
}

function renderPartnerTable(partnerName: string, rows: Cell[], startYmd: string): string {
  const headers = STAY_DAYS.map((days) => {
    const h = stayHeader(startYmd, days);
    return `<th scope="col"><span class="pricing-day">${esc(h.title)}</span><span class="pricing-range">${esc(h.sub)}</span></th>`;
  }).join('\n                ');

  const byKey = new Map<string, Partial<Record<3 | 5 | 7, number>>>();
  for (const row of rows) {
    const key = `${row.terminal}|${row.parking}`;
    const cell = byKey.get(key) || {};
    cell[row.days as 3 | 5 | 7] = row.total;
    byKey.set(key, cell);
  }
  const bodyRows = [...byKey.entries()]
    .sort(([a], [b]) => a.localeCompare(b, 'ko'))
    .map(([key, totals]) => {
      const [terminal, parking] = key.split('|');
      return `<tr>
                <td>${esc(terminal!)}</td>
                <td>${esc(parking!)}</td>
                <td>${won(totals[3] ?? 0)}</td>
                <td>${won(totals[5] ?? 0)}</td>
                <td>${won(totals[7] ?? 0)}</td>
              </tr>`;
    })
    .join('\n');

  return `<section class="section">
        <h2>${esc(partnerName)}</h2>
        <div class="card table-scroll">
          <table class="pricing-table">
            <thead>
              <tr>
                <th scope="col">터미널</th>
                <th scope="col">보관</th>
                ${headers}
              </tr>
            </thead>
            <tbody>
${bodyRows}
            </tbody>
          </table>
        </div>
      </section>`;
}

/** </script> 조기 종료 방지 */
function jsonLdForScript(data: unknown): string {
  return JSON.stringify(data, null, 2).replace(/</g, '\\u003c');
}

/**
 * 요금표와 같은 숫자를 Offer 로 — AI·검색이 표를 읽지 않아도 업체별 가격을 알 수 있게.
 * offeredBy 는 업체 상세 페이지(/partners/{id}/)의 LocalBusiness @id 와 같다.
 */
function pricingJsonLd(opts: { asOf: string; startYmd: string; companies: Company[]; cells: Cell[] }) {
  const { asOf, startYmd, companies, cells } = opts;
  const pageUrl = 'https://www.에어픽.kr/pricing/';
  const catalogs = companies
    .map((c) => {
      const rows = cells.filter((cell) => cell.partnerId === c.id && cell.total > 0);
      if (!rows.length) return null;
      const name = displayCompanyName(c.name);
      const business = { '@id': `https://www.에어픽.kr/partners/${c.id}/#business`, name };
      return {
        '@type': 'OfferCatalog',
        name: `${name} 인천공항 주차대행 요금`,
        itemListElement: rows.map((row) => ({
          '@type': 'Offer',
          name: `${name} · ${row.terminal === 'T1' ? '1터미널' : '2터미널'} · ${row.parking} · ${formatStayPhrase(row.days)}`,
          description: `${formatDisplayYmd(row.departureDate)} ${SAMPLE_TIME} 출국 ~ ${formatDisplayYmd(row.arrivalDate)} ${SAMPLE_TIME} 귀국 기준 예상 요금(기준일 ${asOf})`,
          price: row.total,
          priceCurrency: 'KRW',
          url: `https://www.에어픽.kr/partners/${c.id}/`,
          offeredBy: business,
          itemOffered: {
            '@type': 'Service',
            name: `인천공항 주차대행 (${row.parking} 보관)`,
            serviceType: '공항 주차대행',
            areaServed: { '@type': 'Airport', name: '인천국제공항', iataCode: 'ICN' },
          },
        })),
      };
    })
    .filter(Boolean);
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${pageUrl}#webpage`,
        name: '요금 안내',
        url: pageUrl,
        dateModified: asOf,
        isPartOf: { '@id': 'https://www.에어픽.kr/#website' },
        about: { '@id': 'https://www.에어픽.kr/#organization' },
        mainEntity: { '@id': `${pageUrl}#catalog` },
        inLanguage: 'ko-KR',
      },
      {
        '@type': 'OfferCatalog',
        '@id': `${pageUrl}#catalog`,
        name: `에어픽 입점 주차대행 요금표 (${formatDisplayYmd(startYmd)} 출국 기준)`,
        itemListElement: catalogs,
      },
    ],
  };
}

function buildHtml(opts: {
  asOf: string;
  startYmd: string;
  companies: Company[];
  cells: Cell[];
}): string {
  const { asOf, startYmd, companies, cells } = opts;
  const sections = companies
    .map((c) =>
      renderPartnerTable(
        displayCompanyName(c.name),
        cells.filter((cell) => cell.partnerId === c.id),
        startYmd
      )
    )
    .join('\n\n');

  const dayLines = STAY_DAYS.map((days) => {
    const h = stayHeader(startYmd, days);
    return `<li><strong>${esc(h.title)}</strong> — ${esc(h.sub)}</li>`;
  }).join('\n            ');

  return `<!doctype html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <script src="/canonical-host.js"></script>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#0f1a2e" />
    <title>요금 안내 · 에어픽</title>
    <meta
      name="description"
      content="에어픽 입점 주차대행 요금표. T1/T2·실내/야외·3·5·7일 기준 예상 요금(앱 견적과 동일 산식). 기준일 ${esc(asOf)}."
    />
    <link rel="canonical" href="https://www.에어픽.kr/pricing/" />
    <meta property="og:type" content="website" />
    <meta property="og:title" content="요금 안내 · 에어픽" />
    <meta
      property="og:description"
      content="입점 업체별 T1/T2·실내/야외·3·5·7일 예상 요금. 앱 견적과 같은 계산. 기준일 ${esc(asOf)}."
    />
    <meta property="og:url" content="https://www.에어픽.kr/pricing/" />
    <meta property="og:locale" content="ko_KR" />
    <meta property="og:site_name" content="에어픽" />
    <meta property="og:image" content="https://www.에어픽.kr/brand/og-default.jpg" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <link rel="icon" type="image/png" sizes="48x48" href="/favicon-48.png?v=8" />
    <link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin />
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.css" />
    <link rel="stylesheet" href="/seo.css?v=20261114b" />
    <style>
      .pricing-table th { vertical-align: top; }
      .pricing-day { display: block; font-weight: 700; }
      .pricing-range { display: block; margin-top: 0.25rem; font-size: 0.8rem; font-weight: 500; color: #5a6578; white-space: nowrap; }
      .table-scroll { overflow-x: auto; -webkit-overflow-scrolling: touch; }
      .table-scroll .pricing-table { min-width: 520px; }
      @media (max-width: 640px) {
        .pricing-range { white-space: normal; }
      }
    </style>
    <script type="application/ld+json">
${jsonLdForScript(pricingJsonLd({ asOf, startYmd, companies, cells }))}
    </script>
  </head>
  <body>
    <div class="wrap">
      ${pageChrome('요금 안내')}

      <header class="hero">
        <p class="eyebrow">상품 · 가격</p>
        <h1>요금 안내</h1>
        <p>
          에어픽에서 예약할 수 있는 상품은 <strong>인천공항 주차대행(발렛) 비교·예약</strong>입니다.
          아래 금액은 앱 예약 화면과 <strong>같은 견적 함수</strong>로, Firestore 입점 요금 설정을 읽어 계산한 스냅샷입니다.
          온라인 결제(카드·간편결제)를 준비 중이며, 오픈 전까지는 현장에서 결제합니다.
        </p>
      </header>

      <section class="section">
        <h2>계산 기준</h2>
        <div class="card">
          <dl class="dl">
            <div>
              <dt>기준일</dt>
              <dd>${esc(formatDisplayYmd(asOf))} (요금표 생성일, KST)</dd>
            </div>
            <div>
              <dt>예시 일정</dt>
              <dd>
                <ul style="margin:0;padding-left:1.1rem">
            ${dayLines}
                </ul>
              </dd>
            </div>
            <div>
              <dt>포함</dt>
              <dd>터미널(T1/T2) · 실내/야외(업체 지원 범위) · 주간 입출고(심야 할증 없음) · 발렛·비대면 추가요금 0원</dd>
            </div>
            <div>
              <dt>주의</dt>
              <dd>
                실제 예약 화면 견적이 우선입니다. 심야·대면 인계·성수기 등에 따라 달라질 수 있으며, 최저가 단정이 아닙니다.
                최신 비교는 <a href="/">홈</a>·입점 목록은 <a href="/partners/">/partners/</a>.
              </dd>
            </div>
          </dl>
        </div>
      </section>

      <section class="section">
        <h2>상품 설명</h2>
        <div class="card">
          <dl class="dl">
            <div>
              <dt>상품명</dt>
              <dd>인천공항 주차대행 예약 (중개)</dd>
            </div>
            <div>
              <dt>제공 내용</dt>
              <dd>
                터미널·실내/야외·일정 기준으로 에어픽 인증 업체를 비교하고 예약을 접수합니다. 차량
                인수·이동·보관·반환은 선택한 입점 업체가 제공합니다.
              </dd>
            </div>
            <div>
              <dt>결제</dt>
              <dd>
                온라인 결제(카드·간편결제)를 준비 중이며, 오픈 전까지는 현장에서 결제합니다.
              </dd>
            </div>
            <div>
              <dt>취소</dt>
              <dd>
                입고 예정 24시간 전 앱 취소 가능 —
                <a href="/refund/">취소·환불 정책</a>
              </dd>
            </div>
          </dl>
        </div>
      </section>

${sections}

      <section class="section"><h2>사업자 정보</h2><div class="card"><p>상호·연락처는 아래 푸터를 확인해 주세요.</p></div></section>
      ${LEGAL_SITE_FOOTER_HTML}
    </div>
    <script src="/seo-back.js?v=20261114b" defer></script>
  </body>
</html>
`;
}

function buildLlmsBlock(opts: {
  asOf: string;
  startYmd: string;
  companies: Company[];
  cells: Cell[];
}): string {
  const { asOf, startYmd, companies, cells } = opts;
  const lines: string[] = [
    LLMS_START,
    '## 입점 업체 요금표 (앱 견적과 동일 산식)',
    `- 기준일: ${asOf} (KST)`,
    `- 상세 표: https://www.에어픽.kr/pricing/`,
  ];
  for (const days of STAY_DAYS) {
    const h = stayHeader(startYmd, days);
    lines.push(`- ${h.title}: ${h.sub}`);
  }

  for (const c of companies) {
    const name = displayCompanyName(c.name);
    lines.push(`### ${name}`);
    const rows = cells.filter((cell) => cell.partnerId === c.id);
    const byKey = new Map<string, Partial<Record<3 | 5 | 7, number>>>();
    for (const row of rows) {
      const key = `${row.terminal} ${row.parking}`;
      const cell = byKey.get(key) || {};
      cell[row.days as 3 | 5 | 7] = row.total;
      byKey.set(key, cell);
    }
    for (const [label, totals] of [...byKey.entries()].sort(([a], [b]) =>
      a.localeCompare(b, 'ko')
    )) {
      lines.push(
        `- ${label}: 3일(${formatStayPhrase(3)}) ${won(totals[3] ?? 0)} · 5일(${formatStayPhrase(5)}) ${won(totals[5] ?? 0)} · 7일(${formatStayPhrase(7)}) ${won(totals[7] ?? 0)}`
      );
    }
  }

  lines.push(LLMS_END);
  return lines.join('\n');
}

async function patchLlms(block: string): Promise<void> {
  let raw = await readFile(llmsPath, 'utf8');
  const start = raw.indexOf(LLMS_START);
  const end = raw.indexOf(LLMS_END);
  if (start >= 0 && end > start) {
    raw = `${raw.slice(0, start)}${block}${raw.slice(end + LLMS_END.length)}`;
  } else {
    const anchor = raw.indexOf('## 핵심 페이지');
    if (anchor >= 0) {
      raw = `${raw.slice(0, anchor)}${block}\n\n${raw.slice(anchor)}`;
    } else {
      raw = `${raw.trimEnd()}\n\n${block}\n`;
    }
  }
  await writeFile(llmsPath, raw.replace(/\n{3,}/g, '\n\n'), 'utf8');
}

/** 마지막으로 읽은 Firestore 원본 — 업체 상세 페이지용 */
const rawById = new Map<string, Record<string, unknown>>();

async function fetchCompaniesFromFirestore(): Promise<Company[]> {
  // 개발용: Firestore 대신 업체 문서 덤프(JSON {id: data})로 돌려 보기
  const dumpPath = process.env.AIRPICK_COMPANIES_DUMP;
  if (dumpPath) {
    const dump = JSON.parse(await readFile(dumpPath, 'utf8')) as Record<string, Record<string, unknown>>;
    for (const [id, data] of Object.entries(dump)) rawById.set(id, data);
    return [...rawById.entries()]
      .map(([id, data]) => companyFromFirestore(id, data))
      .filter((c): c is Company => c !== null)
      .sort((a, b) => displayCompanyName(a.name).localeCompare(displayCompanyName(b.name), 'ko'));
  }
  const app = initializeApp(firebaseConfig);
  try {
    await signInAnonymously(getAuth(app));
    const snap = await getDocs(collection(getFirestore(app), 'companies'));
    for (const d of snap.docs) rawById.set(d.id, d.data() as Record<string, unknown>);
    const list = snap.docs
      .map((d) => companyFromFirestore(d.id, d.data() as Record<string, unknown>))
      .filter((c): c is Company => c !== null)
      .sort((a, b) => displayCompanyName(a.name).localeCompare(displayCompanyName(b.name), 'ko'));
    await writeFile(
      cachePath,
      JSON.stringify(
        {
          generatedAt: new Date().toISOString(),
          companies: list.map((c) => ({
            id: c.id,
            name: c.name,
            supports_indoor: c.supports_indoor,
            supports_outdoor: c.supports_outdoor,
            base_price: c.base_price,
            base_days: c.base_days,
            extra_day_price: c.extra_day_price,
            outdoorBasePrice: c.outdoorBasePrice,
            outdoorBaseDays: c.outdoorBaseDays,
            outdoorExtraPrice: c.outdoorExtraPrice,
            indoorBasePrice: c.indoorBasePrice,
            indoorBaseDays: c.indoorBaseDays,
            indoorExtraPrice: c.indoorExtraPrice,
            surchargeStartTime: c.surchargeStartTime,
            surchargeEndTime: c.surchargeEndTime,
            surchargePrice: c.surchargePrice,
            t2Surcharge: c.t2Surcharge,
            peakStartTime: c.peakStartTime,
            peakEndTime: c.peakEndTime,
            peakSurcharge: c.peakSurcharge,
            pricingProfile: c.pricingProfile,
          })),
        },
        null,
        2
      ) + '\n',
      'utf8'
    );
    return list;
  } finally {
    await deleteApp(app);
  }
}

async function loadCompaniesFromCache(): Promise<Company[]> {
  const raw = JSON.parse(await readFile(cachePath, 'utf8')) as {
    companies: Company[];
  };
  return (raw.companies || [])
    .map((c) => mergePartnerPricing(c))
    .sort((a, b) => displayCompanyName(a.name).localeCompare(displayCompanyName(b.name), 'ko'));
}

function str(v: unknown): string {
  return String(v ?? '').replace(/\s+/g, ' ').trim();
}

function numOrNull(v: unknown): number | null {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : null;
}

/** 주차장 — 종류·이름·주소 (좌표·사진은 넣지 않음) */
function lotsOf(data: Record<string, unknown>) {
  const out: { type: 'indoor' | 'outdoor'; name: string; address: string }[] = [];
  if (Array.isArray(data.parkingLots)) {
    for (const row of data.parkingLots as Record<string, unknown>[]) {
      if (!row || typeof row !== 'object') continue;
      const type = row.type === 'outdoor' ? 'outdoor' : row.type === 'indoor' ? 'indoor' : null;
      const address = str(row.parkingAddress || row.customerAddress || row.parkingLotAddress);
      if (type && address) out.push({ type, name: str(row.name), address });
    }
  }
  if (!out.length) {
    const i = str(data.indoorParkingAddress);
    const o = str(data.outdoorParkingAddress);
    if (i) out.push({ type: 'indoor', name: '실내', address: i });
    if (o) out.push({ type: 'outdoor', name: '야외', address: o });
  }
  return out;
}

/** 업체 상세 공개 페이지 데이터 — 요금은 앱과 같은 calculatePrice, 확인 표시는 손님 앱과 같은 규칙 */
function buildProfiles(companies: Company[], startYmd: string, asOf: string) {
  return companies.map((c) => {
    const data = rawById.get(c.id) || {};
    const view = parseVerificationView(data, asOf);
    const ins = (data.insurance && typeof data.insurance === 'object' ? data.insurance : {}) as Record<
      string,
      unknown
    >;
    const lots = lotsOf(data);
    const modes: { indoor: boolean; parking: '실내' | '야외' }[] = [];
    if (c.supports_outdoor !== false) modes.push({ indoor: false, parking: '야외' });
    if (c.supports_indoor !== false) modes.push({ indoor: true, parking: '실내' });
    const examples: { terminal: 'T1' | 'T2'; parking: '실내' | '야외'; days: number; total: number }[] = [];
    for (const terminal of ['T1', 'T2'] as const) {
      for (const mode of modes) {
        for (const days of PROFILE_DAYS) {
          examples.push({
            terminal,
            parking: mode.parking,
            days,
            total: calculatePrice(
              c,
              startYmd,
              endDateForStay(startYmd, days),
              mode.indoor,
              terminal === 'T2',
              SAMPLE_TIME,
              SAMPLE_TIME,
              false
            ),
          });
        }
      }
    }
    const handoff = {
      curbT1: numOrNull(data.valetFeeT1),
      curbT2: numOrNull(data.valetFeeT2),
      dropT1: numOrNull(data.dropFeeT1),
      dropT2: numOrNull(data.dropFeeT2),
    };
    const images = (Array.isArray(data.image_urls) ? data.image_urls : [data.image_url])
      .map((u) => str(u))
      // 실제 업체 사진만 (스톡 사진 등 외부 이미지는 빼기)
      .filter((u) => u.startsWith('https://firebasestorage.googleapis.com/'))
      .slice(0, 3);
    return {
      id: c.id,
      name: displayCompanyName(c.name),
      phone: str(data.phone) || null,
      supportsIndoor: c.supports_indoor !== false,
      supportsOutdoor: c.supports_outdoor !== false,
      lots,
      images,
      insurance:
        ins.enrolled === true
          ? {
              provider: str(ins.provider) || null,
              productName: str(ins.productName) || null,
              coverageLimitText: str(ins.coverageLimitText) || null,
              periodStart: view.insurancePeriodStart || null,
              periodEnd: view.insurancePeriodEnd || null,
            }
          : null,
      insuranceExpired: view.insuranceExpired,
      verification: {
        hasRecords: view.hasRecords,
        business: view.business || null,
        insurance: view.insurance?.verifiedOn || null,
        parking: view.parking || null,
        cctv: view.cctv || null,
      },
      night:
        c.surchargePrice && c.surchargeStartTime && c.surchargeEndTime
          ? { start: c.surchargeStartTime, end: c.surchargeEndTime, price: Number(c.surchargePrice) }
          : null,
      t2Surcharge: numOrNull(c.t2Surcharge),
      handoff,
      cancel: {
        freeHours: DEFAULT_CANCEL_CUTOFF_HOURS,
        lateRefundPercent: Math.round(APP_CONFIG.refund.lateRefundRatio * 100),
      },
      examples,
    };
  });
}

async function main() {
  let companies: Company[];
  try {
    companies = await fetchCompaniesFromFirestore();
  } catch (err) {
    console.warn('[pricing] Firestore fetch failed, using cache', err);
    try {
      companies = await loadCompaniesFromCache();
    } catch {
      throw new Error('[pricing] no Firestore companies and no cache');
    }
  }

  if (!companies.length) {
    throw new Error('[pricing] no priced open partners');
  }

  const asOf = kstTodayYmd();
  const startYmd = sampleStartYmd(asOf);
  const cells = buildCells(companies, startYmd);

  await mkdir(outDir, { recursive: true });
  await writeFile(outHtml, buildHtml({ asOf, startYmd, companies, cells }), 'utf8');
  await patchLlms(buildLlmsBlock({ asOf, startYmd, companies, cells }));

  // Firestore에서 새로 읽었을 때만 업체 상세 데이터를 갱신 (캐시로 돌 때는 지난 파일 유지)
  if (rawById.size) {
    const profiles = buildProfiles(companies, startYmd, asOf);
    await writeFile(
      profilesPath,
      JSON.stringify(
        { generatedAt: new Date().toISOString(), asOf, startYmd, sampleTime: SAMPLE_TIME, partners: profiles },
        null,
        2
      ) + '\n',
      'utf8'
    );
    console.log(`[pricing] wrote ${path.relative(root, profilesPath)} (${profiles.length} profile(s))`);
  }

  console.log(
    `[pricing] wrote /pricing/ + llms (${companies.length} partner(s): ${companies
      .map((c) => c.id)
      .join(', ')}, asOf ${asOf}, start ${startYmd}, ${cells.length} cells)`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
