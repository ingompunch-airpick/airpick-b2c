/**
 * FAQ 한 곳 관리 — src/constants/support.ts(앱 FAQ 정본)로 웹 FAQ를 다시 만든다.
 *
 * 1) public/faq/index.html : <!-- faq:start --> ~ <!-- faq:end --> 본문 + FAQPage JSON-LD
 * 2) index.html (홈)        : <!-- home-faq:start --> ~ <!-- home-faq:end --> 프리렌더 + FAQPage JSON-LD
 *                             + WebPage.dateModified = HOME_FAQ_UPDATED
 *
 * 문구는 support.ts 에서만 고친다. 이 스크립트는 build 때 자동 실행된다 (`npm run faq`).
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runnerImport } from 'vite';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const { module: faq } = await runnerImport(resolve(ROOT, 'src/constants/support.ts'), {
  configFile: false,
  logLevel: 'error',
});
const { FAQ_CATEGORIES, HOME_FAQ_IDS, HOME_FAQ_UPDATED, faqRestAnswer, faqFullAnswer } = faq;

const esc = (s) =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

function replaceBetween(html, name, inner, file) {
  const start = `<!-- ${name}:start -->`;
  const end = `<!-- ${name}:end -->`;
  const a = html.indexOf(start);
  const b = html.indexOf(end);
  if (a < 0 || b < 0 || b < a) throw new Error(`[faq] ${file}: ${name} 마커가 없습니다`);
  return html.slice(0, a + start.length) + '\n' + inner + '\n' + html.slice(b - getIndent(html, b).length);
}

function getIndent(html, idx) {
  const lineStart = html.lastIndexOf('\n', idx) + 1;
  return html.slice(lineStart, idx);
}

/** <script type="application/ld+json"> 첫 블록의 @graph 를 고쳐 다시 쓴다 */
function updateJsonLd(html, file, mutate) {
  const re = /(<script type="application\/ld\+json">)([\s\S]*?)(<\/script>)/;
  const m = html.match(re);
  if (!m) throw new Error(`[faq] ${file}: JSON-LD 가 없습니다`);
  const indent = getIndent(html, m.index);
  const data = JSON.parse(m[2]);
  mutate(data['@graph'] || [data]);
  const body = JSON.stringify(data, null, 2)
    .split('\n')
    .map((l) => indent + '  ' + l)
    .join('\n');
  return html.replace(re, `$1\n${body}\n${indent}$3`);
}

const mainEntity = (items) =>
  items.map((i) => ({
    '@type': 'Question',
    name: i.question,
    acceptedAnswer: { '@type': 'Answer', text: faqFullAnswer(i) },
  }));

function setFaqPage(graph, items) {
  const page = graph.find((g) => g['@type'] === 'FAQPage');
  if (!page) throw new Error('[faq] FAQPage 노드가 없습니다');
  page.mainEntity = mainEntity(items);
}

// ── 1) /faq/ ───────────────────────────────────────────────
{
  const file = 'public/faq/index.html';
  const path = resolve(ROOT, file);
  let html = readFileSync(path, 'utf8');
  const I = '      ';
  const blocks = FAQ_CATEGORIES.map((cat) => {
    const items = cat.items
      .map((i) => {
        const rest = faqRestAnswer(i);
        const links = (i.links || [])
          .map((l) => `${I}  <p><a href="${esc(l.href)}">${esc(l.label)}</a></p>`)
          .join('\n');
        return [
          `${I}<details class="faq">`,
          `${I}  <summary>${esc(i.question)}</summary>`,
          `${I}  <p class="answer">${esc(i.shortAnswer)}</p>`,
          rest ? `${I}  <p>${esc(rest)}</p>` : '',
          links,
          `${I}</details>`,
        ]
          .filter(Boolean)
          .join('\n');
      })
      .join('\n');
    return `${I}<p class="cat-label">${esc(cat.label)}</p>\n${items}`;
  }).join('\n\n');
  html = replaceBetween(html, 'faq', blocks, file);
  html = updateJsonLd(html, file, (g) => setFaqPage(g, FAQ_CATEGORIES.flatMap((c) => c.items)));
  writeFileSync(path, html);
  console.log(`[faq] wrote /faq/ (${FAQ_CATEGORIES.reduce((n, c) => n + c.items.length, 0)} Q&A)`);
}

// ── 2) 홈 index.html ──────────────────────────────────────
{
  const file = 'index.html';
  const path = resolve(ROOT, file);
  let html = readFileSync(path, 'utf8');
  const all = FAQ_CATEGORIES.flatMap((c) => c.items);
  const items = HOME_FAQ_IDS.map((id) => all.find((i) => i.id === id)).filter(Boolean);
  if (items.length !== HOME_FAQ_IDS.length) throw new Error('[faq] HOME_FAQ_IDS 중 없는 id 가 있습니다');
  const I = '          ';
  const dot = HOME_FAQ_UPDATED.replace(/-/g, '.');
  const inner = [
    `${I}<h2>자주 묻는 질문</h2>`,
    ...items.flatMap((i) => {
      const rest = faqRestAnswer(i);
      return [
        `${I}<h3>${esc(i.question)}</h3>`,
        `${I}<p><strong>${esc(i.shortAnswer)}</strong>${rest ? ' ' + esc(rest) : ''}</p>`,
      ];
    }),
    `${I}<p>안내 기준일 ${dot} · <a href="/faq/">FAQ 전체 보기</a></p>`,
  ].join('\n');
  html = replaceBetween(html, 'home-faq', inner, file);
  html = updateJsonLd(html, file, (g) => {
    setFaqPage(g, items);
    const wp = g.find((n) => n['@type'] === 'WebPage');
    if (wp) wp.dateModified = HOME_FAQ_UPDATED;
  });
  writeFileSync(path, html);
  console.log(`[faq] wrote home FAQ (${items.length} Q&A, 기준일 ${dot})`);
}
