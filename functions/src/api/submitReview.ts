import * as admin from 'firebase-admin';
import { onRequest } from 'firebase-functions/v2/https';
import { logger } from 'firebase-functions';

import { reservationPasswordMatches } from '../reservations/publicReservation';

const REVIEWABLE_STATUSES = new Set(['checked_out', 'completed_out']);
const BODY_MAX = 200;

function maskAuthorName(name: string): string {
  const t = name.trim();
  if (!t) return '익명';
  if (t.length === 1) return '*';
  if (t.length === 2) return `${t[0]}*`;
  return `${t[0]}*${t.slice(-1)}`;
}

async function recomputeCompanyRating(
  db: admin.firestore.Firestore,
  companyId: string
): Promise<{ rating: number; reviews_count: number }> {
  const snap = await db
    .collection('reviews')
    .where('companyId', '==', companyId)
    .where('status', '==', 'published')
    .get();

  const ratings: number[] = [];
  for (const doc of snap.docs) {
    const rating = Number(doc.data().rating);
    if (Number.isInteger(rating) && rating >= 1 && rating <= 5) {
      ratings.push(rating);
    }
  }

  const reviews_count = ratings.length;
  const rating =
    reviews_count > 0
      ? Math.round((ratings.reduce((a, b) => a + b, 0) / reviews_count) * 10) / 10
      : 0;

  await db.doc(`companies/${companyId}`).update({ rating, reviews_count });
  return { rating, reviews_count };
}

/**
 * 고객 업체 후기 작성 — 출고 완료 예약 + 비밀번호 검증 후 reviews/{reservationId} 생성.
 */
export const submitReview = onRequest(
  { region: 'asia-northeast3', cors: true },
  async (req, res) => {
    if (req.method === 'OPTIONS') {
      res.status(204).send('');
      return;
    }
    if (req.method !== 'POST') {
      res.status(405).json({ error: 'method_not_allowed' });
      return;
    }

    const body = (req.body ?? {}) as Record<string, unknown>;
    const id = String(body.id ?? '').trim();
    const password = String(body.password ?? '').trim();
    const rating = Number(body.rating);
    const rawBody = body.body != null ? String(body.body) : '';
    const reviewBody = rawBody.trim().slice(0, BODY_MAX);

    if (!id) {
      res.status(400).json({ error: 'missing_id' });
      return;
    }
    if (!/^\d{4}$/.test(password)) {
      res.status(400).json({ error: 'invalid_password' });
      return;
    }
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      res.status(400).json({ error: 'invalid_rating' });
      return;
    }

    try {
      const db = admin.firestore();
      const reservationRef = db.doc(`reservations/${id}`);
      const reviewRef = db.doc(`reviews/${id}`);

      const reservationSnap = await reservationRef.get();
      if (!reservationSnap.exists) {
        res.status(404).json({ error: 'not_found' });
        return;
      }

      const data = reservationSnap.data() as Record<string, unknown>;
      if (!reservationPasswordMatches(data.reservationPassword, password)) {
        res.status(403).json({ error: 'invalid_password' });
        return;
      }

      const status = String(data.status ?? '');
      if (!REVIEWABLE_STATUSES.has(status)) {
        res.status(409).json({ error: 'not_reviewable' });
        return;
      }

      const companyId = String(data.companyId ?? '').trim();
      if (!companyId) {
        res.status(400).json({ error: 'missing_company' });
        return;
      }

      const companySnap = await db.doc(`companies/${companyId}`).get();
      if (!companySnap.exists) {
        res.status(403).json({ error: 'not_partner' });
        return;
      }

      const existing = await reviewRef.get();
      if (existing.exists) {
        res.status(409).json({ error: 'already_reviewed' });
        return;
      }

      const companyName =
        String(data.companyName ?? '').trim() ||
        String(companySnap.data()?.name ?? '').trim() ||
        companyId;

      const createdAt = new Date().toISOString();
      await reviewRef.create({
        companyId,
        companyName,
        reservationId: id,
        rating,
        ...(reviewBody ? { body: reviewBody } : {}),
        authorMask: maskAuthorName(String(data.userName ?? '')),
        status: 'published',
        createdAt,
        createdBy: 'customer',
      });

      const aggregate = await recomputeCompanyRating(db, companyId);

      res.set('Cache-Control', 'private, no-store');
      res.json({
        ok: true,
        review: {
          id,
          companyId,
          rating,
          body: reviewBody || undefined,
          createdAt,
        },
        aggregate,
      });
    } catch (err) {
      logger.error('submitReview_failed', { id, err });
      res.status(500).json({ error: 'internal' });
    }
  }
);
