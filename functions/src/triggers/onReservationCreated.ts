import { FieldValue } from 'firebase-admin/firestore';
import { randomBytes } from 'crypto';
import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { defineSecret, defineString } from 'firebase-functions/params';
import { logger } from 'firebase-functions';

import { loadAlimtalkConfig } from '../kakao/config';
import { sendAlimtalk } from '../kakao/sendAlimtalk';
import { resolveAlimtalkMessage } from '../kakao/templates';
import { parseReservationRecord } from '../reservations/types';
import { buildPublicReceiptUrl } from '../utils/receiptUrl';
import { normalizeKoreanPhone } from '../utils/phone';

const kakaoAlimtalkAppKey = defineSecret('KAKAO_ALIMTALK_APP_KEY');
const kakaoAlimtalkApiUrl = defineString('KAKAO_ALIMTALK_API_URL', { default: '' });
const publicSiteOrigin = defineString('PUBLIC_SITE_ORIGIN', {
  default: 'https://airpick-b2c.web.app',
});
const kakaoSenderKey = defineSecret('KAKAO_SENDER_KEY');
const kakaoSenderKeyPartner = defineSecret('KAKAO_SENDER_KEY_PARTNER');
const kakaoTemplateAirpick = defineSecret('KAKAO_TEMPLATE_AIRPICK_B2C');
const kakaoTemplatePartner = defineSecret('KAKAO_TEMPLATE_PARTNER_HOMEPAGE');

function applySecretsToEnv(): void {
  process.env.KAKAO_ALIMTALK_API_URL = kakaoAlimtalkApiUrl.value();
  process.env.KAKAO_ALIMTALK_APP_KEY = kakaoAlimtalkAppKey.value();
  process.env.KAKAO_SENDER_KEY = kakaoSenderKey.value();
  process.env.KAKAO_SENDER_KEY_PARTNER = kakaoSenderKeyPartner.value();
  process.env.KAKAO_TEMPLATE_AIRPICK_B2C = kakaoTemplateAirpick.value();
  process.env.KAKAO_TEMPLATE_PARTNER_HOMEPAGE = kakaoTemplatePartner.value();
}

async function markNotificationResult(
  ref: FirebaseFirestore.DocumentReference,
  patch: Record<string, unknown>
): Promise<void> {
  await ref.set(patch, { merge: true });
}

export const onReservationCreatedNotify = onDocumentCreated(
  {
    document: 'reservations/{reservationId}',
    region: 'asia-northeast3',
    secrets: [
      kakaoAlimtalkAppKey,
      kakaoSenderKey,
      kakaoSenderKeyPartner,
      kakaoTemplateAirpick,
      kakaoTemplatePartner,
    ],
  },
  async (event) => {
    const reservationId = event.params.reservationId;
    const snap = event.data;
    if (!snap) return;

    const data = parseReservationRecord(snap.data());
    const ref = snap.ref;

    if (data.kakaoSentAt || data.kakaoSendStatus === 'sent') {
      logger.info('kakao_skip_already_sent', { reservationId });
      return;
    }

    if (data.notifyOnCreate === false) {
      await markNotificationResult(ref, {
        kakaoSendStatus: 'skipped',
        kakaoSendError: 'notify_on_create_disabled',
      });
      return;
    }

    if (data.status && data.status !== 'pending') {
      await markNotificationResult(ref, {
        kakaoSendStatus: 'skipped',
        kakaoSendError: `status_${data.status}`,
      });
      return;
    }

    const phone = data.phone ? normalizeKoreanPhone(data.phone) : null;
    if (!phone) {
      await markNotificationResult(ref, {
        kakaoSendStatus: 'skipped',
        kakaoSendError: 'invalid_phone',
      });
      return;
    }

    let receiptToken = data.receiptToken?.trim();
    if (!receiptToken) {
      receiptToken = randomBytes(24).toString('hex');
      await ref.update({ receiptToken });
    }

    const receiptUrl = buildPublicReceiptUrl(
      publicSiteOrigin.value(),
      reservationId,
      receiptToken
    );

    const message = resolveAlimtalkMessage(data, { receiptUrl });
    if (!message) {
      await markNotificationResult(ref, {
        kakaoSendStatus: 'skipped',
        kakaoSendError: 'no_template_for_source',
      });
      return;
    }

    applySecretsToEnv();
    const config = loadAlimtalkConfig();
    const result = await sendAlimtalk(config, { phone, message });

    if (result.skipped) {
      await markNotificationResult(ref, {
        kakaoSendStatus: 'skipped',
        kakaoSendError: result.reason ?? 'skipped',
      });
      logger.warn('kakao_skipped', { reservationId, reason: result.reason });
      return;
    }

    if (!result.ok) {
      await markNotificationResult(ref, {
        kakaoSendStatus: 'failed',
        kakaoSendError: result.reason ?? 'send_failed',
        kakaoTemplateCode: result.templateCode,
      });
      logger.error('kakao_failed', { reservationId, result });
      return;
    }

    await markNotificationResult(ref, {
      kakaoSentAt: new Date().toISOString(),
      kakaoSendStatus: 'sent',
      kakaoTemplateCode: result.templateCode,
      kakaoSendError: FieldValue.delete(),
    });
    logger.info('kakao_sent', {
      reservationId,
      templateCode: result.templateCode,
      brand: message.brandLabel,
    });
  }
);
