import * as admin from 'firebase-admin';
import { onRequest } from 'firebase-functions/v2/https';
import { logger } from 'firebase-functions';

const MEMO_MAX = 1000;

function digitsPhone(phone: string): string {
  return phone.replace(/\D/g, '');
}

/**
 * B2B 입점 상담 신청 — Admin SDK로 partnerApplications 에 저장.
 * (클라이언트 Firestore rules 배포는 B2B 전용)
 */
export const submitPartnerApplication = onRequest(
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
    const companyName = String(body.companyName ?? '').trim().slice(0, 120);
    const contactName = String(body.contactName ?? '').trim().slice(0, 80);
    const phone = digitsPhone(String(body.phone ?? '')).slice(0, 15);
    const memo = String(body.memo ?? '')
      .trim()
      .slice(0, MEMO_MAX);

    if (!companyName || !contactName || !phone) {
      res.status(400).json({ error: 'missing_fields' });
      return;
    }
    if (phone.length < 9 || phone.length > 11) {
      res.status(400).json({ error: 'invalid_phone' });
      return;
    }

    try {
      const ref = await admin.firestore().collection('partnerApplications').add({
        companyName,
        contactName,
        phone,
        memo: memo || null,
        status: 'new',
        source: 'www.partner',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      logger.info('partner_application_created', { id: ref.id });
      res.status(200).json({ ok: true, id: ref.id });
    } catch (err) {
      logger.error('partner_application_failed', err);
      res.status(500).json({ error: 'server_error' });
    }
  }
);
