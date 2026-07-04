import * as admin from 'firebase-admin';
import { onRequest } from 'firebase-functions/v2/https';
import { logger } from 'firebase-functions';

import {
  reservationPasswordMatches,
  sanitizeReservation,
} from '../reservations/publicReservation';

type LookupMode = 'carNumber' | 'phone';

function lookupNeedles(mode: LookupMode, value: string): string[] {
  const trimmed = value.trim();
  const variants =
    mode === 'phone'
      ? [trimmed, trimmed.replace(/\D/g, '')]
      : [trimmed, trimmed.replace(/\s/g, '')];
  return [...new Set(variants.filter(Boolean))];
}

/**
 * 예약 조회 — 서버에서 비밀번호를 검증하고 민감 필드를 제거한 뒤 반환.
 * 비밀번호가 틀리면 존재 여부를 숨기기 위해 빈 배열(200)을 돌려준다.
 */
export const lookupReservation = onRequest(
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
    const mode = String(body.mode ?? '') as LookupMode;
    const value = String(body.value ?? '').trim();
    const password = String(body.password ?? '').trim();

    if (mode !== 'carNumber' && mode !== 'phone') {
      res.status(400).json({ error: 'invalid_mode' });
      return;
    }
    if (!value || !/^\d{4}$/.test(password)) {
      res.status(400).json({ error: 'missing_params' });
      return;
    }

    const field = mode === 'carNumber' ? 'carNumber' : 'phone';

    try {
      const seen = new Map<string, Record<string, unknown>>();
      for (const needle of lookupNeedles(mode, value)) {
        const snap = await admin
          .firestore()
          .collection('reservations')
          .where(field, '==', needle)
          .get();
        for (const doc of snap.docs) {
          if (!seen.has(doc.id)) {
            seen.set(doc.id, doc.data() as Record<string, unknown>);
          }
        }
      }

      const reservations = [...seen.entries()]
        .filter(([, data]) => reservationPasswordMatches(data.reservationPassword, password))
        .map(([id, data]) => ({ id, data: sanitizeReservation(data) }));

      res.set('Cache-Control', 'private, no-store');
      res.json({ reservations });
    } catch (err) {
      logger.error('lookupReservation_failed', { mode, err });
      res.status(500).json({ error: 'internal' });
    }
  }
);
