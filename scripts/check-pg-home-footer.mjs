/**
 * PG 사전점검용 — 홈을 헤드리스로 열어 사업자·약관 키워드가 body에 남는지 확인.
 * 사용: npx playwright install chromium && node scripts/check-pg-home-footer.mjs [url]
 */
import { chromium } from 'playwright';

const url = process.argv[2] || 'http://127.0.0.1:5173/';
const NEEDLES = ['776-32-01655', '이용약관', '개인정보처리방침', '환불', '원'];

async function check(waitUntil) {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(url, { waitUntil, timeout: 60_000 });
  // React 마운트 직후 공백 구간을 넘기기 위해 짧게 대기하지 않음 — 의도적으로 즉시 읽음
  const text = await page.evaluate(() => document.body.innerText || '');
  const outside = await page.evaluate(() => {
    const el = document.getElementById('pg-legal-footer');
    return el ? el.innerText : '';
  });
  const rootLen = await page.evaluate(() => (document.getElementById('root')?.innerText || '').length);
  await browser.close();
  const missing = NEEDLES.filter((n) => !text.includes(n));
  return { waitUntil, missing, rootLen, outsideHasBiz: outside.includes('776-32-01655'), textLen: text.length };
}

const results = [];
for (const w of ['domcontentloaded', 'load']) {
  results.push(await check(w));
}

let failed = false;
for (const r of results) {
  const ok = r.missing.length === 0 && r.outsideHasBiz;
  console.log(
    `[${r.waitUntil}] ${ok ? 'PASS' : 'FAIL'} missing=${JSON.stringify(r.missing)} rootTextLen=${r.rootLen} bodyLen=${r.textLen} pgFooter=${r.outsideHasBiz}`
  );
  if (!ok) failed = true;
}
process.exit(failed ? 1 : 0);
