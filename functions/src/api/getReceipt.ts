import { timingSafeEqual } from 'crypto';
import * as admin from 'firebase-admin';
import { onRequest } from 'firebase-functions/v2/https';
import { logger } from 'firebase-functions';

import { toReceiptPublic } from '../reservations/receiptPublic';

function tokenMatches(stored: string, provided: string): boolean {
  const a = Buffer.from(stored);
  const b = Buffer.from(provided);
  if (a.length !== b.length || a.length === 0) return false;
  return timingSafeEqual(a, b);
}

export const getReceipt = onRequest(
  { region: 'asia-northeast3', cors: true },
  async (req, res) => {
    if (req.method === 'OPTIONS') {
      res.status(204).send('');
      return;
    }
    if (req.method !== 'GET') {
      res.status(405).json({ error: 'method_not_allowed' });
      return;
    }

    const id = String(req.query.id ?? '').trim();
    const token = String(req.query.t ?? '').trim();
    if (!id || !token) {
      res.status(400).json({ error: 'missing_params' });
      return;
    }

    try {
      const snap = await admin.firestore().doc(`reservations/${id}`).get();
      if (!snap.exists) {
        res.status(404).json({ error: 'not_found' });
        return;
      }

      const data = snap.data() as Record<string, unknown>;
      const storedToken = String(data.receiptToken ?? '');
      if (!tokenMatches(storedToken, token)) {
        res.status(403).json({ error: 'invalid_token' });
        return;
      }

      res.set('Cache-Control', 'private, no-store');
      res.json(toReceiptPublic(snap.id, data));
    } catch (err) {
      logger.error('getReceipt_failed', { id, err });
      res.status(500).json({ error: 'internal' });
    }
  }
);
