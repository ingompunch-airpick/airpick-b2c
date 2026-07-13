/**
 * 가이드 랜딩 HTML 생성
 * 소스: data/guides/pages.json
 * 출력: public/guides/{slug}/index.html
 * 수정 후: npm run guides
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const dataPath = path.join(root, 'data/guides/pages.json');
const outRoot = path.join(root, 'public/guides');

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function faqJsonLd(faqs) {
  return faqs.map((f) => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a },
  }));
}

function formatUpdated(iso) {
  if (!iso) return '';
  const m = String(iso).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return esc(iso);
  return `${m[1]}.${m[2]}.${m[3]}`;
}

function howToJsonLd(howTo, pageUrl) {
  if (!howTo?.name || !Array.isArray(howTo.steps) || howTo.steps.length === 0) return null;
  return {
    '@type': 'HowTo',
    '@id': `${pageUrl}#howto`,
    name: howTo.name,
    description: howTo.description || undefined,
    step: howTo.steps.map((s, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      name: s.name,
      text: s.text,
    })),
  };
}

function renderPage(page, allPages) {
  const url = `https://www.에어픽.kr/guides/${page.slug}/`;
  const otherGuides = allPages
    .filter((p) => p.slug !== page.slug)
    .map((p) => `<li><a href="/guides/${esc(p.slug)}/">${esc(p.h1)}</a></li>`)
    .join('\n            ');

  const sectionsHtml = page.sections
    .map((sec) => {
      const body = (sec.paragraphs || []).map((p) => `<p>${p}</p>`).join('\n        ');
      const list = sec.list
        ? `<ul>\n${sec.list.map((li) => `          <li>${li}</li>`).join('\n')}\n        </ul>`
        : '';
      const table = sec.table
        ? `<table>
          <thead><tr>${sec.table.headers.map((h) => `<th scope="col">${h}</th>`).join('')}</tr></thead>
          <tbody>
${sec.table.rows
  .map(
    (row) =>
      `            <tr>${row.map((c, i) => (i === 0 ? `<th scope="row">${c}</th>` : `<td>${c}</td>`)).join('')}</tr>`
  )
  .join('\n')}
          </tbody>
        </table>`
        : '';
      return `      <section class="section">
        <h2>${sec.h2}</h2>
        ${body}
        ${list}
        ${table}
      </section>`;
    })
    .join('\n\n');

  const faqHtml = page.faqs
    .map(
      (f, i) => `        <details${i === 0 ? ' open' : ''}>
          <summary>${esc(f.q)}</summary>
          <p>${esc(f.a)}</p>
        </details>`
    )
    .join('\n');

  const updated = page.updated || page.dateModified || '';
  const published = page.published || page.datePublished || updated;
  const updatedLabel = formatUpdated(updated);
  const howTo = howToJsonLd(page.howTo, url);

  const howToHtml =
    page.howTo?.steps?.length > 0
      ? `      <section class="section">
        <h2>${esc(page.howTo.name || '따라하기')}</h2>
        ${page.howTo.description ? `<p>${esc(page.howTo.description)}</p>` : ''}
        <ol>
${page.howTo.steps.map((s) => `          <li><strong>${esc(s.name)}</strong> — ${esc(s.text)}</li>`).join('\n')}
        </ol>
      </section>`
      : '';

  const graph = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        '@id': `${url}#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: '에어픽', item: 'https://www.에어픽.kr/' },
          { '@type': 'ListItem', position: 2, name: '가이드', item: 'https://www.에어픽.kr/guides/' },
          { '@type': 'ListItem', position: 3, name: page.h1, item: url },
        ],
      },
      {
        '@type': 'WebPage',
        '@id': `${url}#webpage`,
        url,
        name: page.title,
        description: page.description,
        ...(published ? { datePublished: published } : {}),
        ...(updated ? { dateModified: updated } : {}),
        isPartOf: { '@id': 'https://www.에어픽.kr/#website' },
        breadcrumb: { '@id': `${url}#breadcrumb` },
        inLanguage: 'ko-KR',
      },
      {
        '@type': 'FAQPage',
        '@id': `${url}#faq`,
        url,
        mainEntity: faqJsonLd(page.faqs),
      },
      ...(howTo ? [howTo] : []),
    ],
  };

  const secondaryCta =
    page.ctaHref === '/esim'
      ? `<a class="cta secondary" href="/parking">주차대행도 비교하기</a>`
      : `<a class="cta secondary" href="/">홈 · 예약 조회</a>`;

  return `<!doctype html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <script src="/canonical-host.js"></script>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#3182F6" />
    <title>${esc(page.title)}</title>
    <meta name="description" content="${esc(page.description)}" />
    <meta name="keywords" content="${esc(page.keywords)}" />
    <link rel="canonical" href="${esc(url)}" />
    <meta property="og:type" content="article" />
    <meta property="og:title" content="${esc(page.h1)}" />
    <meta property="og:description" content="${esc(page.description)}" />
    <meta property="og:url" content="${esc(url)}" />
    <meta property="og:image" content="https://www.에어픽.kr/icon-512.png" />
    <meta property="og:locale" content="ko_KR" />
    <meta property="og:site_name" content="에어픽" />
    ${updated ? `<meta property="article:modified_time" content="${esc(updated)}" />` : ''}
    <link rel="icon" type="image/png" sizes="48x48" href="/favicon-48.png" />
    <link rel="stylesheet" href="/seo.css" />
    <script type="application/ld+json">
${JSON.stringify(graph, null, 2)}
    </script>
  </head>
  <body>
    <div class="wrap">
      <nav class="topnav" aria-label="사이트 메뉴">
        <a class="brand" href="/">에어픽</a>
        <a href="/parking">주차 비교</a>
        <a href="/esim">유심·eSIM</a>
        <a href="/guides/">가이드</a>
        <a href="/partners/wawa/">입점 업체</a>
        <a href="/faq/">FAQ</a>
      </nav>

      <header class="hero">
        <p class="eyebrow">${esc(page.eyebrow)}</p>
        <h1>${esc(page.h1)}</h1>
        <p>${page.lead}</p>
        ${updatedLabel ? `<p class="muted" style="font-size:0.8125rem;color:var(--muted)">마지막 업데이트: ${updatedLabel}</p>` : ''}
        <a class="cta" href="${esc(page.ctaHref)}">${esc(page.ctaLabel)}</a>
        ${secondaryCta}
      </header>

${howToHtml}

${sectionsHtml}

      <section class="section">
        <h2>자주 묻는 질문</h2>
${faqHtml}
      </section>

      <section class="section">
        <h2>관련 가이드 · 비교</h2>
        <ul>
            ${otherGuides}
            <li><a href="/parking">인천공항 주차대행 가격비교</a> — 요금·예약</li>
            <li><a href="/esim">해외여행 유심·eSIM 가격비교</a></li>
            <li><a href="/faq/">자주 묻는 질문</a></li>
        </ul>
        <p style="margin-top:1.25rem">
          <a class="cta" href="${esc(page.ctaHref)}">${esc(page.ctaLabel)}</a>
          ${secondaryCta}
        </p>
      </section>

      <p class="footer-note">에어픽은 인천공항 주차대행·유심·eSIM 비교 플랫폼입니다. 가이드는 참고용이며, 최종 요금·규정은 업체·공식 안내를 확인하세요. 표시 요금은 일정 기준 예상·참고가이며 변동될 수 있습니다.</p>
    </div>
  </body>
</html>
`;
}

function renderIndex(pages) {
  const url = 'https://www.에어픽.kr/guides/';
  const items = pages
    .map((p) => {
      const updated = formatUpdated(p.updated || p.dateModified);
      return `        <li>
          <a href="/guides/${esc(p.slug)}/"><strong>${esc(p.h1)}</strong></a>
          <p class="muted" style="margin:0.25rem 0 0;font-size:0.8125rem;color:var(--muted)">${esc(p.description)}</p>
          ${updated ? `<p class="muted" style="margin:0.15rem 0 0;font-size:0.75rem;color:var(--muted)">업데이트 ${updated}</p>` : ''}
        </li>`;
    })
    .join('\n');

  const graph = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: '인천공항 주차대행 가이드 · 에어픽',
    url,
    description:
      '인천공항 주차대행·발렛 비교, 공식 vs 사설, T1/T2·운서, 장기·단기, 해외여행 꿀팁, 유심·eSIM 초보 가이드 모음',
    isPartOf: { '@id': 'https://www.에어픽.kr/#website' },
    inLanguage: 'ko-KR',
  };

  return `<!doctype html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <script src="/canonical-host.js"></script>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#3182F6" />
    <title>인천공항 주차대행·유심 가이드 · 에어픽</title>
    <meta
      name="description"
      content="인천공항 주차대행·발렛파킹 비교, 공식 주차장 vs 사설, T1·T2·운서역, 장기·단기주차, 해외여행 꿀팁, 유심·eSIM 초보 가이드를 모았습니다."
    />
    <link rel="canonical" href="${esc(url)}" />
    <meta property="og:type" content="website" />
    <meta property="og:title" content="인천공항 주차대행·유심 가이드 · 에어픽" />
    <meta property="og:description" content="비교·사설·터미널·장단기·해외여행 꿀팁·유심 eSIM까지 가이드 모음." />
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
      <nav class="topnav" aria-label="사이트 메뉴">
        <a class="brand" href="/">에어픽</a>
        <a href="/parking">주차 비교</a>
        <a href="/esim">유심·eSIM</a>
        <a href="/guides/">가이드</a>
        <a href="/partners/wawa/">입점 업체</a>
        <a href="/faq/">FAQ</a>
      </nav>
      <header class="hero">
        <p class="eyebrow">에어픽 가이드</p>
        <h1>인천공항 주차대행·유심 가이드</h1>
        <p>
          비교·예약, 공식 vs 사설, 터미널·운서, 장기·단기, 해외여행 전 체크, 유심·eSIM 초보까지.
          읽은 뒤 <a href="/parking">주차 비교</a> 또는 <a href="/esim">유심·eSIM 비교</a>로 이어 가세요.
        </p>
        <a class="cta" href="/parking">주차 요금 비교·예약</a>
        <a class="cta secondary" href="/esim">유심·eSIM 비교</a>
      </header>
      <section class="section">
        <h2>가이드 목록</h2>
        <ul style="list-style:none;padding:0;margin:0;display:grid;gap:1rem">
${items}
        </ul>
      </section>
      <section class="section">
        <h2>바로 비교하기</h2>
        <a class="cta" href="/parking">주차대행 가격비교</a>
        <a class="cta secondary" href="/">홈 · 예약 조회</a>
      </section>
    </div>
  </body>
</html>
`;
}

async function main() {
  const raw = await readFile(dataPath, 'utf8');
  const { pages } = JSON.parse(raw);
  if (!Array.isArray(pages) || pages.length === 0) {
    throw new Error('data/guides/pages.json: pages[] 가 비어 있습니다.');
  }

  await mkdir(outRoot, { recursive: true });
  await writeFile(path.join(outRoot, 'index.html'), renderIndex(pages), 'utf8');

  for (const page of pages) {
    const dir = path.join(outRoot, page.slug);
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, 'index.html'), renderPage(page, pages), 'utf8');
    console.log(`[guides] wrote /guides/${page.slug}/`);
  }
  console.log(`[guides] wrote /guides/ index (${pages.length} pages)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
