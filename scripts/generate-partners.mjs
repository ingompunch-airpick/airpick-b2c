/**
 * 입점 업체 공개 HTML 생성
 * 소스: data/partners/pages.json + data/partners/reviews.generated.json
 * 출력: public/partners/{id}/index.html + public/partners/index.html (허브)
 * 수정 후: npm run partners:sync && npm run partners
 */
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const dataPath = path.join(root, 'data/partners/pages.json');
const reviewsPath = path.join(root, 'data/partners/reviews.generated.json');
const outRoot = path.join(root, 'public/partners');

/** 고객 본문용 — 정의문 대신 */
const CUSTOMER_PITCH =
  '인천공항 출국 전에 나설 시각을 잡고, 확인된 주차대행만 비교·예약하세요. 이심은 제휴 할인으로 준비할 수 있어요.';

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

function pageChrome(title) {
  return `<header class="page-bar">
        <a class="page-bar-back" href="/" data-seo-back aria-label="뒤로">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg>
        </a>
        <p class="page-bar-title">${esc(title)}</p>
      </header>
      <nav class="topnav" aria-label="사이트 메뉴">
        <a class="brand" href="/">에어픽</a>
        <a href="/parking">주차대행 비교</a>
        <a href="/esim">이심</a>
        <a href="/guides/">가이드</a>
        <a href="/partners/">입점 업체</a>
        <a href="/faq/">FAQ</a>
      </nav>`;
}

function seoBackScript() {
  return `<script src="/seo-back.js" defer></script>`;
}

function formatReviewDate(iso) {
  const d = String(iso || '').slice(0, 10);
  if (d.length < 10) return d;
  return d.replace(/-/g, '.');
}

function starsLabel(rating) {
  const n = Number(rating);
  if (!Number.isFinite(n)) return '';
  return `★ ${n.toFixed(1)}`;
}

/** reviews.generated.json 의 companies[id] — 없으면 null */
function resolveReviewBundle(p, reviewsByCompany) {
  const id = String(p.id || '').trim();
  const fromSync = reviewsByCompany?.[id];
  if (
    fromSync &&
    Number(fromSync.reviewCount) > 0 &&
    Number(fromSync.averageRating) > 0 &&
    Number(fromSync.averageRating) <= 5
  ) {
    return fromSync;
  }

  // pages.json 수동 오버라이드 (실집계만 — sync 전 임시용)
  const rating = Number(p.rating);
  const reviewCount = Number(p.reviewsCount);
  if (reviewCount > 0 && rating > 0 && rating <= 5) {
    return {
      averageRating: rating,
      reviewCount,
      ratingDistribution: null,
      recent: Array.isArray(p.recentReviews) ? p.recentReviews : [],
    };
  }
  return null;
}

function distributionHtml(dist) {
  if (!dist || typeof dist !== 'object') return '';
  const rows = [5, 4, 3, 2, 1]
    .map((star) => {
      const count = Number(dist[star]) || 0;
      return `<tr><th scope="row">${star}점</th><td>${count}건</td></tr>`;
    })
    .join('');
  return `<table>
          <caption>별점 분포</caption>
          <tbody>
            ${rows}
          </tbody>
        </table>`;
}

function reviewListHtml(recent) {
  if (!Array.isArray(recent) || recent.length === 0) {
    return '<p class="note">아직 공개된 실후기가 없습니다.</p>';
  }

  const items = recent
    .map((r) => {
      const rating = Number(r.rating);
      if (!Number.isInteger(rating) || rating < 1 || rating > 5) return '';
      const date = formatReviewDate(r.createdAt);
      const author = String(r.authorMask || '익명').trim() || '익명';
      const car = r.carMask ? ` · ${esc(String(r.carMask))}` : '';
      const body = r.body ? `<p>${esc(String(r.body))}</p>` : '';
      const photos = Array.isArray(r.photoUrls)
        ? r.photoUrls
            .map((u) => String(u || '').trim())
            .filter(Boolean)
            .slice(0, 3)
            .map(
              (u) =>
                `<img src="${esc(u)}" alt="" width="160" height="120" style="max-width:30%;height:auto;border-radius:0.5rem;margin:0.25rem 0.25rem 0 0" loading="lazy" />`
            )
            .join('')
        : '';
      const photoBlock = photos ? `<p>${photos}</p>` : '';
      return `<li>
          <p><strong>${esc(starsLabel(rating))}</strong> · ${esc(date)} · ${esc(author)}${car}</p>
          ${body}
          ${photoBlock}
        </li>`;
    })
    .filter(Boolean)
    .join('\n        ');

  return `<ol>
        ${items}
      </ol>`;
}

function reviewsSectionHtml(bundle) {
  if (!bundle) return '';
  const avg = Number(bundle.averageRating);
  const count = Number(bundle.reviewCount);
  return `
      <section class="section" id="reviews">
        <h2>이용 고객 실후기</h2>
        <p class="answer"><strong>${esc(starsLabel(avg))} · ${count}건</strong> (에어픽 출고 완료 예약 고객)</p>
        ${distributionHtml(bundle.ratingDistribution)}
        ${reviewListHtml(bundle.recent)}
        <p class="note">출고 완료 예약 고객만 작성합니다. 시드·가짜 별점은 사용하지 않습니다.</p>
        <a class="cta" href="/parking">이 업체 기준으로 비교·예약</a>
      </section>`;
}

function reviewTableRowHtml(bundle) {
  if (!bundle) return '';
  return `
            <tr>
              <th scope="row">실후기</th>
              <td>${esc(starsLabel(bundle.averageRating))} · ${Number(bundle.reviewCount)}건 (에어픽 이용 고객)</td>
            </tr>`;
}

function renderPartner(p, reviewsByCompany) {
  const id = String(p.id || '').trim();
  const name = String(p.name || '').trim();
  if (!id || !name) {
    throw new Error('partners 항목에 id·name 이 필요합니다.');
  }

  const reviewBundle = resolveReviewBundle(p, reviewsByCompany);

  const url = `https://www.에어픽.kr/partners/${id}/`;
  const title = `${name} · 인천공항 주차대행 (에어픽 입점)`;
  const particle = topicParticle(name);
  const description =
    p.description?.trim() ||
    `${name}${particle} 에어픽에서 비교·예약할 수 있는 인천공항 주차대행이에요. 일정 넣고 요금·보험을 확인해 보세요.`;
  const h1 = `${name} · 인천공항 주차대행`;
  const directAnswer =
    p.answer?.trim() ||
    `${name}${particle} 에어픽 입점 업체예요. 일정 넣어 예약하면, 맡긴 뒤 위치·사진·보험을 앱에서 볼 수 있어요.`;
  const prototypeNote = p.isPrototype
    ? `<p class="note">이 페이지는 공개용 초안이에요. 입점 정보가 바뀌면 바로 반영됩니다.</p>`
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

  if (reviewBundle) {
    localBusiness.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: reviewBundle.averageRating,
      reviewCount: reviewBundle.reviewCount,
      bestRating: 5,
      worstRating: 1,
    };

    const reviewsLd = (reviewBundle.recent || [])
      .map((r) => {
        const rating = Number(r.rating);
        if (!Number.isInteger(rating) || rating < 1 || rating > 5) return null;
        const item = {
          '@type': 'Review',
          author: {
            '@type': 'Person',
            name: String(r.authorMask || '익명').trim() || '익명',
          },
          reviewRating: {
            '@type': 'Rating',
            ratingValue: rating,
            bestRating: 5,
            worstRating: 1,
          },
        };
        const date = String(r.createdAt || '').slice(0, 10);
        if (date.length === 10) item.datePublished = date;
        if (r.body?.trim()) item.reviewBody = String(r.body).trim().slice(0, 200);
        return item;
      })
      .filter(Boolean);
    if (reviewsLd.length > 0) localBusiness.review = reviewsLd;
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
    <meta name="theme-color" content="#0f1a2e" />
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
      ${pageChrome(h1)}

      <header class="hero">
        <p class="eyebrow">에어픽 입점</p>
        <h1>${esc(h1)}</h1>
        <p class="answer"><strong>${esc(directAnswer)}</strong></p>
        <p>
          ${esc(name)}${particle} 에어픽에서 예약할 수 있는 인천공항 주차대행이에요.
          요금은 출국·귀국 일정·터미널·실내/야외에 따라 달라지니,
          <strong>일정을 넣은 뒤</strong> 비교 화면에서 확인하고 예약해 주세요.
        </p>
        ${prototypeNote}
        <a class="cta" href="/parking">일정 넣고 비교·예약</a>
        <a class="cta secondary" href="/partners/">다른 입점 업체</a>
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
            </tr>${reviewTableRowHtml(reviewBundle)}
          </tbody>
        </table>
        <p class="note">이 페이지에 확정 요금은 적어 두지 않아요. 최신 요금·보장은 비교·예약 화면을 기준으로 해 주세요.</p>
      </section>
${reviewsSectionHtml(reviewBundle)}
      <section class="section">
        <h2>에어픽에서 예약하면</h2>
        <ul>
          <li>일정·터미널·실내/야외 기준으로 <strong>예상 요금</strong>을 비교할 수 있어요</li>
          <li>맡긴 뒤 <strong>주차 위치·입고 사진·보험 안내</strong>를 예약 탭에서 볼 수 있어요</li>
          <li>결제는 <strong>현장 결제</strong>예요 (앱에서 카드 결제 없음)</li>
        </ul>
        <a class="cta" href="/parking">주차대행 비교 열기</a>
      </section>

      <section class="section">
        <h2>더 알아보기</h2>
        <ul>
          <li><a href="/guides/parking-compare/">주차대행, 어떻게 비교·예약하나요?</a></li>
          <li><a href="/guides/parking-insurance/">보험, 예약 전에 뭘 확인하나요?</a></li>
          <li><a href="/guides/official-vs-private/">공식 주차장 vs 사설 대행</a></li>
          <li><a href="/parking">전체 업체 요금 비교</a></li>
          <li><a href="/faq/">자주 묻는 질문</a></li>
        </ul>
      </section>

      <p class="footer-note">현장 입고·출고·차량 문의는 예약하신 업체로, 앱·예약 조회는 에어픽 고객센터로 문의해 주세요.</p>
    </div>
    ${seoBackScript()}
  </body>
</html>
`;
}

function renderHub(partners, reviewsByCompany) {
  const url = 'https://www.에어픽.kr/partners/';
  const title = '에어픽 입점 주차대행 업체 · 인천공항';
  const description =
    '에어픽에서 예약할 수 있는 인천공항 주차대행 목록. 일정 넣어 비교하고, 맡긴 뒤 위치·사진·보험을 확인하세요.';
  const answer =
    '에어픽이 확인한 업체만 모았어요. 비교·예약하고, 맡긴 뒤에는 위치·사진·보험까지 앱에서 볼 수 있어요.';

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
      const bundle = resolveReviewBundle(p, reviewsByCompany);
      const reviewBit = bundle
        ? ` · ${starsLabel(bundle.averageRating)}(${bundle.reviewCount})`
        : '';
      return `<li>
          <a href="/partners/${esc(p.id)}/"><strong>${esc(p.name)}</strong></a>
          — ${esc(lot)} · ${esc(terminalsLabel(p))}${esc(reviewBit)}
        </li>`;
    })
    .join('\n        ');

  return `<!doctype html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <script src="/canonical-host.js"></script>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#0f1a2e" />
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
      ${pageChrome('입점 업체')}

      <header class="hero">
        <p class="eyebrow">공식 파트너</p>
        <h1>에어픽에서 예약할 수 있는 업체</h1>
        <p class="answer"><strong>${esc(answer)}</strong></p>
        <p>지금 입점한 주차대행이에요. 아래에서 고른 뒤, 출국·귀국 일정을 넣고 바로 비교해 보세요.</p>
        <a class="cta" href="/parking">일정 넣고 비교·예약</a>
        <a class="cta secondary" href="/guides/parking-insurance/">보험은 어떻게 확인하나요?</a>
      </header>

      <section class="section">
        <h2>입점 업체</h2>
        <ul>
        ${cards}
        </ul>
      </section>

      <section class="section">
        <h2>알아두면 좋아요</h2>
        <ul>
          <li>확정 요금·가짜 별점은 이 페이지에 박아 두지 않아요. 실이용 후기만 보여 드립니다.</li>
          <li>요금은 일정·터미널·실내/야외를 넣은 뒤 비교 화면에서 확인해 주세요.</li>
          <li>현장 입고·출고는 예약하신 업체, 앱·예약 조회는 에어픽 고객센터로 문의해 주세요.</li>
        </ul>
      </section>

      <section class="section">
        <h2>더 알아보기</h2>
        <ul>
          <li><a href="/parking">주차대행 요금 비교</a></li>
          <li><a href="/guides/parking-compare/">주차대행, 어떻게 비교·예약하나요?</a></li>
          <li><a href="/faq/">자주 묻는 질문</a></li>
          <li><a href="/about/">에어픽 소개 · 고객센터</a></li>
        </ul>
      </section>

      <p class="footer-note">${esc(CUSTOMER_PITCH)}</p>
    </div>
    ${seoBackScript()}
  </body>
</html>
`;
}

async function loadReviewsByCompany() {
  try {
    const raw = await readFile(reviewsPath, 'utf8');
    const data = JSON.parse(raw);
    return data?.companies && typeof data.companies === 'object' ? data.companies : {};
  } catch {
    console.warn('[partners] reviews.generated.json 없음 — 실후기 섹션 생략');
    return {};
  }
}

async function main() {
  const raw = await readFile(dataPath, 'utf8');
  const { partners } = JSON.parse(raw);
  if (!Array.isArray(partners) || partners.length === 0) {
    throw new Error('data/partners/pages.json: partners[] 가 비어 있습니다.');
  }

  const reviewsByCompany = await loadReviewsByCompany();

  await rm(outRoot, { recursive: true, force: true });
  await mkdir(outRoot, { recursive: true });

  for (const partner of partners) {
    const id = String(partner.id || '').trim();
    const dir = path.join(outRoot, id);
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, 'index.html'), renderPartner(partner, reviewsByCompany), 'utf8');
    const bundle = resolveReviewBundle(partner, reviewsByCompany);
    console.log(
      bundle
        ? `[partners] wrote /partners/${id}/ (★${bundle.averageRating} · ${bundle.reviewCount})`
        : `[partners] wrote /partners/${id}/`
    );
  }

  await writeFile(path.join(outRoot, 'index.html'), renderHub(partners, reviewsByCompany), 'utf8');
  console.log(`[partners] wrote /partners/ hub (${partners.length} page(s))`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
