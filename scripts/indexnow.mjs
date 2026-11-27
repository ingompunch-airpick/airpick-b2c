/**
 * IndexNow — 사이트맵 URL을 Bing·네이버 등 IndexNow 참여 검색엔진에 알림.
 *
 * 사용:
 *   node scripts/indexnow.mjs                      # 사이트맵 전체 전송 (수동)
 *   node scripts/indexnow.mjs --save-live <file>   # 배포 전: 지금 라이브 사이트맵을 저장
 *   node scripts/indexnow.mjs --changed <file> [--fallback-all]
 *                                                  # 배포 후: 저장본과 비교해 새로 생기거나 lastmod 가 바뀐 URL만 전송
 *
 * 키 파일: public/indexnow-key.txt + public/{key}.txt (호스팅에 배포돼 있어야 함)
 */
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const host = 'www.xn--oh5b1bw17d.kr';
const keyPath = path.join(root, 'public/indexnow-key.txt');
const sitemapPath = path.join(root, 'public/sitemap.xml');
const liveSitemapUrl = `https://${host}/sitemap.xml`;

/** 한글 호스트·퓨니코드 표기를 같은 주소로 맞춘다 */
function normalizeUrl(url) {
  try {
    return new URL(url).href;
  } catch {
    return url;
  }
}

/** sitemap XML → Map(url → lastmod) */
function parseSitemap(xml) {
  const map = new Map();
  for (const m of xml.matchAll(/<url>([\s\S]*?)<\/url>/g)) {
    const loc = m[1].match(/<loc>([^<]+)<\/loc>/)?.[1]?.trim();
    if (!loc) continue;
    const lastmod = m[1].match(/<lastmod>([^<]+)<\/lastmod>/)?.[1]?.trim() || '';
    map.set(normalizeUrl(loc), lastmod);
  }
  return map;
}

function argValue(name) {
  const i = process.argv.indexOf(name);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

async function submit(urls) {
  const key = (await readFile(keyPath, 'utf8')).trim();
  if (!/^[a-f0-9]{8,128}$/i.test(key)) {
    console.error('public/indexnow-key.txt 키가 비었거나 형식이 맞지 않습니다.');
    process.exit(1);
  }
  const urlList = urls.filter((u) => new URL(u).host === host).slice(0, 10000);
  if (!urlList.length) {
    console.log('IndexNow: 보낼 URL 없음');
    return;
  }
  const keyLocation = `https://${host}/${key}.txt`;
  const res = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ host, key, keyLocation, urlList }),
  });
  const text = await res.text().catch(() => '');
  console.log(`IndexNow ${res.status} · ${urlList.length} URLs`);
  for (const u of urlList.slice(0, 20)) console.log(`  ${u}`);
  if (urlList.length > 20) console.log(`  … 외 ${urlList.length - 20}개`);
  if (text) console.log(text.slice(0, 500));
  if (!res.ok && res.status !== 202) process.exit(1);
}

const saveLive = argValue('--save-live');
const changedFrom = argValue('--changed');

if (saveLive) {
  let entries = null;
  try {
    const res = await fetch(liveSitemapUrl, { headers: { 'cache-control': 'no-cache' } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    entries = Object.fromEntries(parseSitemap(await res.text()));
    console.log(`라이브 사이트맵 저장: ${Object.keys(entries).length} URLs`);
  } catch (err) {
    console.warn(`라이브 사이트맵을 못 읽음 (${err.message}) — 비교 없이 진행`);
  }
  await writeFile(saveLive, JSON.stringify(entries), 'utf8');
} else {
  const local = parseSitemap(await readFile(sitemapPath, 'utf8'));
  if (!local.size) {
    console.error('sitemap에 URL이 없습니다.');
    process.exit(1);
  }
  if (!changedFrom) {
    await submit([...local.keys()]);
  } else {
    let before = null;
    try {
      before = JSON.parse(await readFile(changedFrom, 'utf8'));
    } catch {
      before = null;
    }
    if (!before) {
      if (process.argv.includes('--fallback-all')) {
        console.log('비교 기준 없음 → 전체 전송');
        await submit([...local.keys()]);
      } else {
        console.log('비교 기준 없음 → 이번에는 전송 안 함');
      }
    } else {
      const changed = [...local.entries()]
        .filter(([url, lastmod]) => before[url] !== lastmod)
        .map(([url]) => url);
      await submit(changed);
    }
  }
}
