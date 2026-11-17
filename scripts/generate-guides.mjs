/**
 * 가이드 랜딩 HTML 생성
 * 소스: data/guides/pages.json
 * 출력: public/guides/{slug}/index.html
 * draft: AIRPICK_GUIDES_INCLUDE_DRAFT=1 일 때만 출력
 * 수정 후: npm run guides
 */
import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const dataPath = path.join(root, 'data/guides/pages.json');
const outRoot = path.join(root, 'public/guides');
const llmsPath = path.join(root, 'public/llms.txt');
const LLMS_START = '<!-- guides:auto:start -->';
const LLMS_END = '<!-- guides:auto:end -->';

const includeDraft =
  String(process.env.AIRPICK_GUIDES_INCLUDE_DRAFT || '').trim() === '1';

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function faqJsonLd(faqs) {
  return (faqs || []).map((f) => ({
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

function pageStatus(page) {
  return page.status === 'draft' ? 'draft' : 'published';
}

function isPublished(page) {
  return pageStatus(page) === 'published';
}

/** CTA에 ?src=guide_{slug} (기존 유입 추적) */
function withGuideSrc(href, slug) {
  const raw = String(href || '/').trim() || '/';
  const src = `guide_${slug}`.slice(0, 40);
  try {
    const base = 'https://www.에어픽.kr';
    const u = new URL(raw, base);
    u.searchParams.set('src', src);
    return `${u.pathname}${u.search}${u.hash}` || `/?src=${encodeURIComponent(src)}`;
  } catch {
    const join = raw.includes('?') ? '&' : '?';
    return `${raw}${join}src=${encodeURIComponent(src)}`;
  }
}

function pageChrome(title) {
  return `<header class="page-bar">
        <a class="page-bar-back" href="/" data-seo-back aria-label="뒤로">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg>
        </a>
        <p class="page-bar-title">${esc(title)}</p>
      </header>
      <nav class="topnav" aria-label="사이트 메뉴">
        <a class="brand" href="/">에어픽</a>
        <a href="/">주차대행 비교</a>
        <a href="/esim">이심</a>
        <a href="/guides/">가이드</a>
        <a href="/partners/">입점 업체</a>
        <a href="/faq/">FAQ</a>
      </nav>`;
}

function seoBackScript() {
  return `<script src="/seo-back.js?v=20261114b" defer></script>`;
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

function dateMetaLine(updatedLabel, verifiedLabel) {
  if (!updatedLabel && !verifiedLabel) return '';
  const parts = [];
  if (updatedLabel) parts.push(`최종 수정일: ${updatedLabel}`);
  if (verifiedLabel) parts.push(`정보 확인일: ${verifiedLabel}`);
  return `<p class="muted" style="font-size:0.8125rem;color:var(--muted)">${parts.join(' / ')}</p>`;
}

function sourcesHtml(page) {
  const sources = Array.isArray(page.sources) ? page.sources.filter((s) => s?.name) : [];
  if (sources.length === 0) return '';
  const items = sources
    .map((s) => {
      const name = esc(s.name);
      const url = String(s.url || '').trim();
      if (url) {
        return `          <li><a href="${esc(url)}" rel="noopener noreferrer">${name}</a></li>`;
      }
      return `          <li>${name}</li>`;
    })
    .join('\n');
  return `      <section class="section">
        <h2>출처</h2>
        <ul>
${items}
        </ul>
      </section>`;
}

function renderPage(page, publishedPages) {
  const url = `https://www.에어픽.kr/guides/${page.slug}/`;
  const ctaHref = withGuideSrc(page.ctaHref || '/', page.slug);
  const secondaryHref = withGuideSrc('/', page.slug);
  const otherGuides = publishedPages
    .filter((p) => p.slug !== page.slug)
    .map((p) => `<li><a href="/guides/${esc(p.slug)}/">${esc(p.h1)}</a></li>`)
    .join('\n            ');

  const sectionsHtml = (page.sections || [])
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

  const faqHtml = (page.faqs || [])
    .map(
      (f, i) => `        <details${i === 0 ? ' open' : ''}>
          <summary>${esc(f.q)}</summary>
          <p>${esc(f.a)}</p>
        </details>`
    )
    .join('\n');

  const updated = page.updated || page.dateModified || '';
  const published = page.published || page.datePublished || updated;
  const verified = String(page.verified || '').trim();
  const updatedLabel = formatUpdated(updated);
  const verifiedLabel = formatUpdated(verified);
  const howTo = howToJsonLd(page.howTo, url);
  const isDraft = pageStatus(page) === 'draft';

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
        '@type': 'Article',
        '@id': `${url}#article`,
        url,
        headline: page.h1,
        name: page.title,
        description: page.description,
        ...(published ? { datePublished: published } : {}),
        ...(updated ? { dateModified: updated } : {}),
        author: { '@type': 'Organization', name: '에어픽', url: 'https://www.에어픽.kr/' },
        publisher: { '@type': 'Organization', name: '에어픽', url: 'https://www.에어픽.kr/' },
        mainEntityOfPage: { '@type': 'WebPage', '@id': url },
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
      ? `<a class="cta secondary" href="${esc(secondaryHref)}">주차대행도 비교하기</a>`
      : `<a class="cta secondary" href="${esc(secondaryHref)}">주차대행 비교하기</a>`;

  return `<!doctype html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <script src="/canonical-host.js"></script>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#0f1a2e" />
    ${isDraft ? '<meta name="robots" content="noindex,nofollow" />\n    ' : ''}<title>${esc(page.title)}</title>
    <meta name="description" content="${esc(page.description)}" />
    <link rel="canonical" href="${esc(url)}" />
    <meta property="og:type" content="article" />
    <meta property="og:title" content="${esc(page.h1)}" />
    <meta property="og:description" content="${esc(page.description)}" />
    <meta property="og:url" content="${esc(url)}" />
    <meta property="og:image" content="https://www.에어픽.kr/brand/og-default.jpg" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:locale" content="ko_KR" />
    <meta property="og:site_name" content="에어픽" />
    ${updated ? `<meta property="article:modified_time" content="${esc(updated)}" />` : ''}
    <link rel="icon" type="image/png" sizes="48x48" href="/favicon-48.png" />
    <link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin />
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.css" />
    <link rel="stylesheet" href="/seo.css?v=20261114b" />
    <script type="application/ld+json">
${JSON.stringify(graph, null, 2)}
    </script>
  </head>
  <body>
    <div class="wrap">
      ${pageChrome(page.h1)}

      <header class="hero">
        <p class="eyebrow">${esc(page.eyebrow)}</p>
        <h1>${esc(page.h1)}</h1>
        ${page.answer ? `<p class="answer"><strong>${esc(page.answer)}</strong></p>` : ''}
        <p>${page.lead}</p>
        ${dateMetaLine(updatedLabel, verifiedLabel)}
        <a class="cta" href="${esc(ctaHref)}">${esc(page.ctaLabel)}</a>
        ${secondaryCta}
      </header>

${howToHtml}

${sectionsHtml}

      <section class="section">
        <h2>자주 묻는 질문</h2>
${faqHtml}
      </section>

${sourcesHtml(page)}

      <section class="section">
        <h2>더 알아보기</h2>
        <ul>
            ${otherGuides}
            <li><a href="/">인천공항 주차대행 비교</a></li>
            <li><a href="/partners/">입점 업체</a></li>
            <li><a href="/esim">이심(eSIM) 제휴 할인</a></li>
            <li><a href="/faq/">자주 묻는 질문</a></li>
        </ul>
        <p style="margin-top:1.25rem">
          <a class="cta" href="${esc(ctaHref)}">${esc(page.ctaLabel)}</a>
          ${secondaryCta}
        </p>
      </section>

      <p class="footer-note">가이드는 참고용이에요. 최종 요금·규정은 비교·예약 화면과 업체·제휴사 안내를 확인해 주세요.</p>
    </div>
    ${seoBackScript()}
  </body>
</html>
`;
}

function guideListItem(p) {
  const updated = formatUpdated(p.updated || p.dateModified);
  return `        <li>
          <a href="/guides/${esc(p.slug)}/"><strong>${esc(p.h1)}</strong></a>
          <p class="guide-desc">${esc(p.description)}</p>
          ${updated ? `<p class="guide-date">업데이트 ${updated}</p>` : ''}
        </li>`;
}

function renderIndex(pages) {
  const url = 'https://www.에어픽.kr/guides/';
  const byCategory = new Map();
  for (const p of pages) {
    const cat = String(p.category || '').trim() || '기타';
    if (!byCategory.has(cat)) byCategory.set(cat, []);
    byCategory.get(cat).push(p);
  }
  const categoryBlocks = [...byCategory.entries()]
    .map(([cat, list]) => {
      const items = list.map(guideListItem).join('\n');
      return `      <section class="section">
        <h2>${esc(cat)}</h2>
        <ul class="guide-list">
${items}
        </ul>
      </section>`;
    })
    .join('\n');

  const graph = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        '@id': `${url}#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: '에어픽', item: 'https://www.에어픽.kr/' },
          { '@type': 'ListItem', position: 2, name: '가이드', item: url },
        ],
      },
      {
        '@type': 'CollectionPage',
        '@id': `${url}#webpage`,
        name: '출국 전에 궁금한 것부터 · 에어픽',
        url,
        description:
          '공항주차 방식, 주차대행 비교, 터미널, 보험, 이심 준비까지 — 출국 전 자주 묻는 가이드',
        isPartOf: { '@id': 'https://www.에어픽.kr/#website' },
        breadcrumb: { '@id': `${url}#breadcrumb` },
        mainEntity: { '@id': `${url}#itemlist` },
        inLanguage: 'ko-KR',
      },
      {
        '@type': 'ItemList',
        '@id': `${url}#itemlist`,
        name: '에어픽 가이드 목록',
        numberOfItems: pages.length,
        itemListElement: pages.map((p, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: p.h1,
          url: `https://www.에어픽.kr/guides/${p.slug}/`,
        })),
      },
    ],
  };

  return `<!doctype html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <script src="/canonical-host.js"></script>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#0f1a2e" />
    <title>출국 전에 궁금한 것부터 · 에어픽</title>
    <meta
      name="description"
      content="공항주차 방식(주차대행·사설주차장·셔틀), 주차대행 비교, 터미널, 보험, 이심 준비까지 — 출국 전 자주 묻는 가이드를 모았어요."
    />
    <link rel="canonical" href="${esc(url)}" />
    <meta property="og:type" content="website" />
    <meta property="og:title" content="출국 전에 궁금한 것부터 · 에어픽" />
    <meta property="og:description" content="공항주차 방식·주차대행·터미널·보험·이심, 출국 전 궁금한 것부터." />
    <meta property="og:url" content="${esc(url)}" />
    <meta property="og:locale" content="ko_KR" />
    <meta property="og:site_name" content="에어픽" />
    <meta property="og:image" content="https://www.에어픽.kr/brand/og-default.jpg" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <link rel="icon" type="image/png" sizes="48x48" href="/favicon-48.png" />
    <link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin />
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.css" />
    <link rel="stylesheet" href="/seo.css?v=20261114b" />
    <script type="application/ld+json">
${JSON.stringify(graph, null, 2)}
    </script>
  </head>
  <body>
    <div class="wrap">
      ${pageChrome('가이드')}
      <header class="hero">
        <p class="eyebrow">에어픽 가이드</p>
        <h1>출국 전에 궁금한 것부터</h1>
        <p>
          공항주차 방식 고르기, 주차대행 비교, 터미널, 보험, 이심 준비까지 — 자주 물어보시는 내용을 짧게 모았어요.
          읽은 뒤 <a href="/">비교·예약</a>이나 <a href="/esim">이심 할인</a>으로 이어 가시면 됩니다.
        </p>
        <a class="cta" href="/">주차대행 비교·예약</a>
        <a class="cta secondary" href="/esim">이심 제휴 할인</a>
      </header>
${categoryBlocks}
      <section class="section">
        <h2>바로 비교하기</h2>
        <a class="cta" href="/">주차대행 비교하기</a>
      </section>
    </div>
    ${seoBackScript()}
  </body>
</html>
`;
}

function shortDesc(description, max = 80) {
  const t = String(description || '')
    .replace(/\s+/g, ' ')
    .trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}…`;
}

function buildLlmsGuideBlock(publishedPages) {
  const lines = publishedPages.map(
    (p) =>
      `- ${p.h1}: https://www.에어픽.kr/guides/${p.slug}/ — ${shortDesc(p.description)}`
  );
  return [
    LLMS_START,
    '## 가이드',
    ...lines,
    `- 가이드 목록: https://www.에어픽.kr/guides/`,
    LLMS_END,
  ].join('\n');
}

async function patchLlmsGuides(publishedPages) {
  let raw = await readFile(llmsPath, 'utf8');
  const block = buildLlmsGuideBlock(publishedPages);
  const start = raw.indexOf(LLMS_START);
  const end = raw.indexOf(LLMS_END);
  if (start >= 0 && end > start) {
    raw = `${raw.slice(0, start)}${block}${raw.slice(end + LLMS_END.length)}`;
  } else {
    // 마커 없으면 「## 핵심 페이지」 앞에 삽입
    const anchor = raw.indexOf('## 핵심 페이지');
    if (anchor >= 0) {
      raw = `${raw.slice(0, anchor)}${block}\n\n${raw.slice(anchor)}`;
    } else {
      raw = `${raw.trimEnd()}\n\n${block}\n`;
    }
  }
  // auto 블록 밖의 /guides/ 줄 제거 (허브·개별 URL 중복 방지)
  const s = raw.indexOf(LLMS_START);
  const e = raw.indexOf(LLMS_END);
  if (s >= 0 && e > s) {
    const before = raw.slice(0, s);
    const mid = raw.slice(s, e + LLMS_END.length);
    const after = raw.slice(e + LLMS_END.length);
    const stripGuideBullets = (chunk) =>
      chunk
        .split('\n')
        .filter((line) => !/https:\/\/www\.에어픽\.kr\/guides\//.test(line))
        .join('\n');
    raw = `${stripGuideBullets(before)}${mid}${stripGuideBullets(after)}`;
  }

  await writeFile(llmsPath, raw.replace(/\n{3,}/g, '\n\n'), 'utf8');
  console.log('[guides] patched public/llms.txt guides section');
}

async function cleanGuideDirs(keepSlugs) {
  const keep = new Set(keepSlugs);
  let entries = [];
  try {
    entries = await readdir(outRoot, { withFileTypes: true });
  } catch {
    return;
  }
  for (const ent of entries) {
    if (!ent.isDirectory()) continue;
    if (keep.has(ent.name)) continue;
    await rm(path.join(outRoot, ent.name), { recursive: true, force: true });
    console.log(`[guides] removed stale /guides/${ent.name}/`);
  }
}

async function main() {
  const raw = await readFile(dataPath, 'utf8');
  const { pages } = JSON.parse(raw);
  if (!Array.isArray(pages) || pages.length === 0) {
    throw new Error('data/guides/pages.json: pages[] 가 비어 있습니다.');
  }

  const publishedPages = pages.filter(isPublished);
  const draftPages = pages.filter((p) => pageStatus(p) === 'draft');
  const outputPages = includeDraft ? [...publishedPages, ...draftPages] : publishedPages;

  if (!includeDraft && draftPages.length > 0) {
    console.log(`[guides] skip ${draftPages.length} draft (set AIRPICK_GUIDES_INCLUDE_DRAFT=1 for preview)`);
  }

  await mkdir(outRoot, { recursive: true });
  await cleanGuideDirs(outputPages.map((p) => p.slug));
  await writeFile(path.join(outRoot, 'index.html'), renderIndex(publishedPages), 'utf8');

  for (const page of outputPages) {
    const dir = path.join(outRoot, page.slug);
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, 'index.html'), renderPage(page, publishedPages), 'utf8');
    console.log(`[guides] wrote /guides/${page.slug}/${pageStatus(page) === 'draft' ? ' (draft)' : ''}`);
  }
  console.log(`[guides] wrote /guides/ index (${publishedPages.length} published)`);

  await patchLlmsGuides(publishedPages);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
