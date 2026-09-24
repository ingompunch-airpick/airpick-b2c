#!/usr/bin/env node
/**
 * 9.27(또는 이후) SITE_NOTICE / SiteNoticeBanner 제거.
 * GitHub Actions 또는 로컬: node scripts/cleanup-site-notice.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const FORCE = process.argv.includes('--force');
const now = new Date();
/** KST 기준 2026-09-27 00:00 */
const cutoff = new Date('2026-09-26T15:00:00.000Z');

if (!FORCE && now < cutoff) {
  console.log('Too early — cleanup runs on/after 2026-09-27 KST. Use --force to run now.');
  process.exit(0);
}

const bannerPath = path.join(root, 'src/components/SiteNoticeBanner.tsx');
const homePath = path.join(root, 'src/pages/HomePage.tsx');
const comparePath = path.join(root, 'src/pages/ComparePage.tsx');
const marketingPath = path.join(root, 'src/constants/marketing.ts');

if (!fs.existsSync(bannerPath)) {
  console.log('SiteNoticeBanner already removed — nothing to do.');
  process.exit(0);
}

let home = fs.readFileSync(homePath, 'utf8');
home = home.replace(/\nimport SiteNoticeBanner from '\.\.\/components\/SiteNoticeBanner';\n/, '\n');
home = home.replace(
  /\n\s*<div className="flex flex-col gap-3 pt-2 md:pb-1 md:pt-6">\n\s*<SiteNoticeBanner \/>\n\s*<HomeHookCtas onGoTab=\{onGoTab\} tone="dark" showEsim=\{false\} \/>\n\s*<\/div>\n/,
  `\n          <div className="pt-2 md:pb-1 md:pt-6">
            <HomeHookCtas onGoTab={onGoTab} tone="dark" showEsim={false} />
          </div>\n`
);
fs.writeFileSync(homePath, home);

let compare = fs.readFileSync(comparePath, 'utf8');
compare = compare.replace(/\nimport SiteNoticeBanner from '\.\.\/components\/SiteNoticeBanner';\n/, '\n');
compare = compare.replace(/\n\s*<SiteNoticeBanner \/>\n/, '\n');
fs.writeFileSync(comparePath, compare);

let marketing = fs.readFileSync(marketingPath, 'utf8');
marketing = marketing.replace(
  /\n\/\*\*\n \* 홈·비교 상단 공지[\s\S]*?export const SITE_NOTICE = \{[\s\S]*?\} as const;\n/,
  '\n'
);
fs.writeFileSync(marketingPath, marketing);

fs.unlinkSync(bannerPath);

console.log('Removed SITE_NOTICE and SiteNoticeBanner.');
