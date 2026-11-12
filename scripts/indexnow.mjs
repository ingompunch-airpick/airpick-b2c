/**
 * IndexNow — sitemap URL을 Bing 등에 알림.
 * 사용: node scripts/indexnow.mjs
 * 키 파일: public/indexnow-key.txt + public/{key}.txt (호스팅에 배포돼 있어야 함)
 */
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const host = 'www.xn--oh5b1bw17d.kr';
const keyPath = path.join(root, 'public/indexnow-key.txt');
const sitemapPath = path.join(root, 'public/sitemap.xml');

const key = (await readFile(keyPath, 'utf8')).trim();
if (!/^[a-f0-9]{8,128}$/i.test(key)) {
  console.error('public/indexnow-key.txt 키가 비었거나 형식이 맞지 않습니다.');
  process.exit(1);
}

const xml = await readFile(sitemapPath, 'utf8');
const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
if (!locs.length) {
  console.error('sitemap에 URL이 없습니다.');
  process.exit(1);
}

const keyLocation = `https://${host}/${key}.txt`;
const body = {
  host,
  key,
  keyLocation,
  urlList: locs.slice(0, 10000),
};

const res = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify(body),
});

const text = await res.text().catch(() => '');
console.log(`IndexNow ${res.status} · ${locs.length} URLs · keyLocation=${keyLocation}`);
if (text) console.log(text.slice(0, 500));
if (!res.ok && res.status !== 202) process.exit(1);
