/**
 * 입점 업체 공개 HTML 생성
 * 소스: data/partners/pages.json
 * 출력: public/partners/{id}/index.html + public/partners/index.html (허브)
 * 수정 후: npm run partners
 */
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const dataPath = path.join(root, 'data/partners/pages.json');
const outRoot = path.join(root, 'public/partners');

const AIRPICK_DEFINITION =
  '에어픽은 곰컴퍼니가 운영하는 인천공항 출국시간 계산·주차대행 비교·이심(eSIM) 가격비교 플랫폼입니다.';

function esc(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function topicParticle(name) {
  const chars = [...String(name)];
  const last = chars[chars.length - 1];
  if (!last) return '는';
  const code = last.codePointAt(0);
  if (code >= 0xac00 && code <= 0xd7a3) {
    return (code - 0xac00) % 28 === 0 ? '는' : '은';
  }
  return '는';
}

function lotLabel(p) {
  const parts = [];
  if (p.supportsIndoor) parts.push('실내');
  if (p.supportsOutdoor) parts.push('야외');
  return parts.length ? parts.join(' · ') : '안내 예정';
}

function terminalsLabel(p) {
  const t = Array.isArray(p.terminals) ? p.terminals.filter(Boolean) : [];
  return t.length ? t.join(' · ') : '1터미널 · 2터미널';
}

function navHtml() {
  return `<nav class="topnav" aria-label="사이트 메뉴">
        <a class="brand" href="/">에어픽</a>
        <a href="/parking">주차대행 비교</a>
        <a href="/esim">이심 비교</a>
        <a href="/guides/">가이드</a>
        <a href="/partners/">입점 업체</a>
        <a href="/faq/">FAQ</a>
      </nav>`;
}

function renderPartner(p) {
  const id = String(p.id || '').trim();
  const name = String(p.name || '').trim();
  if (!id || !name) {
    throw new Error('partners 항목에 id·name 이 필요합니다.');
  }

  const url = `https://www.에어픽.kr/partners/${id}/`;
  const title = `${name} · 인천공항 주차대행 (에어픽 입점)`;
  const particle = topicParticle(name);
  const description =
    p.description?.trim() ||
    `${name}${particle} 에어픽 입점 인천공항 주차대행입니다. 실내·야외, 터미널, 보험 안내를 확인하고 일정 넣어 비교·예약하세요.`;
  const h1 = `${name} · 인천공항 주차대행`;
  const directAnswer =
    p.answer?.trim() ||
    `${name}${particle} 에어픽 입점 주차대행입니다. 일정을 넣고 비교·예약한 뒤, 위치·사진·보험은 예약 탭에서 확인하세요.`;
  const prototypeNote = p.isPrototype
    ? `<p class="note">이 페이지는 공개 URL·본문 구조 검증용 프로토타입입니다. 실제 입점 정보로 교체될 수 있습니다.</p>`
    : '';

  const imageHtml = p.imageUrl?.trim()
    ? `<p><img src="${esc(p.imageUrl.trim())}" alt="${esc(p.imageAlt || name + ' 주차장')}" width="800" height="450" style="max-width:100%;height:auto;border-radius:1rem" loading="lazy" /></p>`
    : '';

  const localBusiness = {
    '@type': 'LocalBusiness',
    '@id': `${url}#business`,
    name,
    url,
    description: `${name} — 에어픽 입점 인천공항 주차대행·발렛`,
    image: p.imageUrl?.trim() || 'https://www.에어픽.kr/icon-512.png',
    // 도로명 미공개 — 가짜 streetAddress 넣지 않음. 지역·서비스권만 명시
    address: {
      '@type': 'PostalAddress',
      addressLocality: '인천',
      addressRegion: '인천광역시',
      addressCountry: 'KR',
    },
    areaServed: {
      '@type': 'Place',
      name: '인천국제공항',
    },
    parentOrganization: { '@id': 'https://www.에어픽.kr/#organization' },
  };

  const rating = Number(p.rating);
  const reviewCount = Number(p.reviewsCount);
  if (reviewCount > 0 && rating > 0 && rating <= 5) {
    localBusiness.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: rating,
      reviewCount,
      bestRating: 5,
      worstRating: 1,
    };
  }

  const graph = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        '@id': `${url}#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: '에어픽', item: 'https://www.에어픽.kr/' },
          { '@type': 'ListItem', position: 2, name: '입점 업체', item: 'https://www.에어픽.kr/partners/' },
          { '@type': 'ListItem', position: 3, name: name, item: url },
        ],
      },
      {
        '@type': 'WebPage',
        '@id': `${url}#webpage`,
        url,
        name: title,
        description,
        isPartOf: { '@id': 'https://www.에어픽.kr/#website' },
        breadcrumb: { '@id': `${url}#breadcrumb` },
        inLanguage: 'ko-KR',
      },
      localBusiness,
    ],
  };

  return `<!doctype html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <script src="/canonical-host.js"></script>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#3182F6" />
    <title>${esc(title)}</title>
    <meta name="description" content="${esc(description)}" />
    <link rel="canonical" href="${esc(url)}" />
    <meta property="og:type" content="website" />
    <meta property="og:title" content="${esc(h1)}" />
    <meta property="og:description" content="${esc(description)}" />
    <meta property="og:url" content="${esc(url)}" />
    <meta property="og:image" content="https://www.에어픽.kr/icon-512.png" />
    <meta property="og:locale" content="ko_KR" />
    <meta property="og:site_name" content="에어픽" />
    <link rel="icon" type="image/png" sizes="48x48" href="/favicon-48.png" />
    <link rel="stylesheet" href="/seo.css" />
    <script type="application/ld+json">
${JSON.stringify(graph, null, 2)}
    </script>
  </head>
  <body>
    <div class="wrap">
      ${navHtml()}

      <header class="hero">
        <p class="eyebrow">에어픽 입점</p>
        <h1>${esc(h1)}</h1>
        <p class="answer"><strong>${esc(directAnswer)}</strong></p>
        <p>
          ${esc(AIRPICK_DEFINITION)}
          ${esc(name)}${particle} 에어픽에 입점한 인천공항 주차대행·발렛입니다.
          요금은 출국·귀국 일정·터미널·실내/야외에 따라 달라지므로,
          <strong>확정가 대신 비교 화면에서 일정을 넣고</strong> 확인한 뒤 예약하세요.
        </p>
        ${prototypeNote}
        <a class="cta" href="/parking">이 업체 기준으로 일정 넣고 비교·예약</a>
        <a class="cta secondary" href="/partners/">입점 업체 목록</a>
      </header>

      <section class="section">
        <h2>한눈에 보기</h2>
        ${imageHtml}
        <table>
          <tbody>
            <tr>
              <th scope="row">주차 유형</th>
              <td>${esc(lotLabel(p))}</td>
            </tr>
            <tr>
              <th scope="row">터미널</th>
              <td>${esc(terminalsLabel(p))}</td>
            </tr>
            <tr>
              <th scope="row">위치·거리</th>
              <td>${esc(p.distanceNote || p.addressNote || '비교 화면·앱에서 확인')}</td>
            </tr>
            <tr>
              <th scope="row">보험 안내</th>
              <td>${esc(p.insuranceNote || '앱 업체 상세·예약 카드에서 확인')}</td>
            </tr>
          </tbody>
        </table>
        <p class="note">표시 금액·보장 한도를 이 페이지에 고정해 두지 않습니다. 최신 안내는 에어픽 앱·비교 화면을 기준으로 하세요.</p>
      </section>

      <section class="section">
        <h2>에어픽에서 예약하면</h2>
        <ul>
          <li>일정·1·2터미널·실내/야외 기준 <strong>예상 요금 비교</strong></li>
          <li>입점 예약 후 <strong>주차 위치·입고 사진·보험 안내</strong>를 예약 탭에서 확인 (제공 업체)</li>
          <li>현장 결제 — 앱에서 카드 결제를 받지 않습니다</li>
        </ul>
        <a class="cta" href="/parking">주차대행 비교 열기</a>
      </section>

      <section class="section">
        <h2>함께 보면 좋은 글</h2>
        <ul>
          <li><a href="/guides/parking-compare/">인천공항 주차대행 비교·예약 가이드</a></li>
          <li><a href="/guides/partner-vs-external/">입점 vs 미입점</a></li>
          <li><a href="/guides/official-vs-private/">공식 주차장 vs 사설 주차대행</a></li>
          <li><a href="/guides/">가이드 모음</a></li>
          <li><a href="/parking">전체 업체 요금 비교</a></li>
          <li><a href="/facts/">사실 확인 · AI·보도용</a></li>
        </ul>
      </section>

      <section class="section evidence">
        <h2>근거 · 사실</h2>
        <ul>
          <li>${esc(name)}${particle} 에어픽 <strong>입점</strong> 주차대행입니다. (비교 플랫폼의 입점사)</li>
          <li>확정 요금·가짜 별점을 이 페이지에 두지 않습니다. 실후기만 앱·상세에 노출됩니다.</li>
          <li>운영사·정의: <a href="/facts/">사실 확인</a> · <a href="/about/">곰컴퍼니</a></li>
        </ul>
      </section>

      <p class="footer-note">${esc(AIRPICK_DEFINITION)} 업체 현장 정책은 예약·문의 시 확인해 주세요.</p>
    </div>
  </body>
</html>
`;
}

function renderHub(partners) {
  const url = 'https://www.에어픽.kr/partners/';
  const title = '에어픽 입점 주차대행 업체 · 인천공항';
  const description =
    '에어픽에 입점한 인천공항 주차대행·발렛 업체 목록입니다. 일정 넣어 비교·예약한 뒤 위치·사진·보험을 확인하세요.';
  const answer =
    '입점 업체는 에어픽에서 비교·예약하고, 예약 후 주차 위치·입고 사진·보험 안내를 앱에서 확인합니다.';

  const listItems = partners.map((p, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: p.name,
    url: `https://www.에어픽.kr/partners/${p.id}/`,
  }));

  const graph = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        '@id': `${url}#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: '에어픽', item: 'https://www.에어픽.kr/' },
          { '@type': 'ListItem', position: 2, name: '입점 업체', item: url },
        ],
      },
      {
        '@type': 'CollectionPage',
        '@id': `${url}#webpage`,
        url,
        name: title,
        description,
        isPartOf: { '@id': 'https://www.에어픽.kr/#website' },
        breadcrumb: { '@id': `${url}#breadcrumb` },
        inLanguage: 'ko-KR',
      },
      {
        '@type': 'ItemList',
        '@id': `${url}#list`,
        name: '에어픽 입점 주차대행',
        numberOfItems: partners.length,
        itemListElement: listItems,
      },
    ],
  };

  const cards = partners
    .map((p) => {
      const lot = lotLabel(p);
      return `<li>
          <a href="/partners/${esc(p.id)}/"><strong>${esc(p.name)}</strong></a>
          — ${esc(lot)} · ${esc(terminalsLabel(p))}
        </li>`;
    })
    .join('\n        ');

  return `<!doctype html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <script src="/canonical-host.js"></script>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#3182F6" />
    <title>${esc(title)}</title>
    <meta name="description" content="${esc(description)}" />
    <link rel="canonical" href="${esc(url)}" />
    <meta property="og:type" content="website" />
    <meta property="og:title" content="${esc(title)}" />
    <meta property="og:description" content="${esc(description)}" />
    <meta property="og:url" content="${esc(url)}" />
    <meta property="og:locale" content="ko_KR" />
    <meta property="og:site_name" content="에어픽" />
    <link rel="icon" type="image/png" sizes="48x48" href="/favicon-48.png" />
    <link rel="stylesheet" href="/seo.css" />
    <script type="application/ld+json">
${JSON.stringify(graph, null, 2)}
    </script>
  </head>
  <body>
    <div class="wrap">
      ${navHtml()}

      <header class="hero">
        <p class="eyebrow">에어픽 입점</p>
        <h1>입점 주차대행 업체</h1>
        <p class="answer"><strong>${esc(answer)}</strong></p>
        <p>${esc(AIRPICK_DEFINITION)} 아래 입점 업체를 고른 뒤, 일정 넣어 비교·예약하세요.</p>
        <a class="cta" href="/parking">주차대행 비교 · 예약</a>
        <a class="cta secondary" href="/guides/partner-vs-external/">입점 vs 미입점 가이드</a>
      </header>

      <section class="section">
        <h2>입점 업체 목록</h2>
        <ul>
        ${cards}
        </ul>
      </section>

      <section class="section evidence">
        <h2>근거 · 사실</h2>
        <ul>
          <li>${esc(AIRPICK_DEFINITION)}</li>
          <li>이 목록의 공개 입점 페이지: <strong>${partners.length}곳</strong> (미입점은 여기 없음)</li>
          <li>요금·보험 확정 숫자는 이 페이지에 박지 않습니다. 일정 넣어 비교·앱에서 확인하세요.</li>
          <li>공식 사실: <a href="/facts/">사실 확인</a></li>
        </ul>
      </section>

      <section class="section">
        <h2>함께 보면</h2>
        <ul>
          <li><a href="/parking">전체 업체 요금 비교</a></li>
          <li><a href="/guides/parking-compare/">비교·예약 가이드</a></li>
          <li><a href="/for-partners/">입점사 배지 · 소개 링크</a></li>
          <li><a href="/faq/">자주 묻는 질문</a></li>
          <li><a href="/facts/">사실 확인 · AI·보도용</a></li>
        </ul>
      </section>

      <p class="footer-note">${esc(AIRPICK_DEFINITION)}</p>
    </div>
  </body>
</html>
`;
}

async function main() {
  const raw = await readFile(dataPath, 'utf8');
  const { partners } = JSON.parse(raw);
  if (!Array.isArray(partners) || partners.length === 0) {
    throw new Error('data/partners/pages.json: partners[] 가 비어 있습니다.');
  }

  await rm(outRoot, { recursive: true, force: true });
  await mkdir(outRoot, { recursive: true });

  for (const partner of partners) {
    const id = String(partner.id || '').trim();
    const dir = path.join(outRoot, id);
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, 'index.html'), renderPartner(partner), 'utf8');
    console.log(`[partners] wrote /partners/${id}/`);
  }

  await writeFile(path.join(outRoot, 'index.html'), renderHub(partners), 'utf8');
  console.log(`[partners] wrote /partners/ hub (${partners.length} page(s))`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
