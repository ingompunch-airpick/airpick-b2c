/**
 * 입점 업체 실후기 스냅샷 — Firestore → data/partners/reviews.generated.json
 *
 * published 후기만. 가짜 별점 금지.
 * 네트워크/권한 실패 시 기존 generated 파일을 유지하고 exit 0 (빌드 중단 없음).
 *
 * 사용: npm run partners:sync
 */
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { deleteApp, initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { collection, getDocs, getFirestore, query, where } from 'firebase/firestore';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const pagesPath = path.join(root, 'data/partners/pages.json');
const outPath = path.join(root, 'data/partners/reviews.generated.json');

const RECENT_MAX = 10;

const firebaseConfig = {
  projectId: 'airpick-reservation',
  appId: '1:417452643834:web:b42b0c3f863b3b7c370043',
  apiKey: 'AIzaSyDbZyPUwzp166aX8PzDmoIzqER8bDV8tyo',
  authDomain: 'airpick-reservation.firebaseapp.com',
  storageBucket: 'airpick-reservation.firebasestorage.app',
  messagingSenderId: '417452643834',
};

function round1(n) {
  return Math.round(n * 10) / 10;
}

function normalizeReview(id, data) {
  const rating = Number(data.rating);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) return null;
  if (String(data.status || '') !== 'published') return null;

  const photoUrls = Array.isArray(data.photoUrls)
    ? data.photoUrls.map((u) => String(u || '').trim()).filter(Boolean).slice(0, 3)
    : [];

  return {
    id,
    rating,
    body: data.body ? String(data.body).trim().slice(0, 200) : undefined,
    photoUrls: photoUrls.length ? photoUrls : undefined,
    authorMask: String(data.authorMask || '익명').trim() || '익명',
    carMask: data.carMask ? String(data.carMask).trim() : undefined,
    createdAt: String(data.createdAt || ''),
  };
}

function buildCompanySnapshot(reviews) {
  const sorted = [...reviews].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const reviewCount = sorted.length;
  if (reviewCount === 0) return null;

  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let sum = 0;
  for (const r of sorted) {
    distribution[r.rating] += 1;
    sum += r.rating;
  }

  return {
    averageRating: round1(sum / reviewCount),
    reviewCount,
    ratingDistribution: distribution,
    recent: sorted.slice(0, RECENT_MAX).map((r) => {
      const row = {
        id: r.id,
        rating: r.rating,
        authorMask: r.authorMask,
        createdAt: r.createdAt,
      };
      if (r.body) row.body = r.body;
      if (r.carMask) row.carMask = r.carMask;
      if (r.photoUrls?.length) row.photoUrls = r.photoUrls;
      return row;
    }),
  };
}

async function loadPartnerIds() {
  const raw = await readFile(pagesPath, 'utf8');
  const { partners } = JSON.parse(raw);
  if (!Array.isArray(partners)) return [];
  return partners
    .map((p) => String(p?.id || '').trim())
    .filter(Boolean);
}

async function main() {
  const partnerIds = await loadPartnerIds();
  if (partnerIds.length === 0) {
    throw new Error('data/partners/pages.json: partners[] 가 비어 있습니다.');
  }

  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  await signInAnonymously(auth);
  const db = getFirestore(app);

  const companies = {};

  for (const companyId of partnerIds) {
    const snap = await getDocs(
      query(
        collection(db, 'reviews'),
        where('companyId', '==', companyId),
        where('status', '==', 'published')
      )
    );

    const reviews = snap.docs
      .map((d) => normalizeReview(d.id, d.data()))
      .filter(Boolean);

    const built = buildCompanySnapshot(reviews);
    if (built) {
      companies[companyId] = built;
      console.log(
        `[partners:sync] ${companyId}: ★${built.averageRating} · ${built.reviewCount}건`
      );
    } else {
      console.log(`[partners:sync] ${companyId}: 실후기 없음 (별점 생략)`);
    }
  }

  const payload = {
    generatedAt: new Date().toISOString(),
    companies,
  };

  await writeFile(outPath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  console.log(
    `[partners:sync] wrote ${path.relative(root, outPath)} (${Object.keys(companies).length} company(ies))`
  );

  await deleteApp(app).catch(() => {});
  process.exit(0);
}

main().catch(async (err) => {
  console.warn(`[partners:sync] failed — keeping previous file if any: ${err?.message || err}`);
  try {
    await readFile(outPath, 'utf8');
    console.warn(`[partners:sync] existing ${path.relative(root, outPath)} retained`);
  } catch {
    const empty = {
      generatedAt: null,
      companies: {},
      note: 'sync failed; no prior snapshot',
    };
    await writeFile(outPath, `${JSON.stringify(empty, null, 2)}\n`, 'utf8');
    console.warn(`[partners:sync] wrote empty snapshot`);
  }
  process.exit(0);
});
