import type { AlimtalkRuntimeConfig, AlimtalkTemplateConfig } from './config';
import { isTemplateReady } from './config';
import type { AlimtalkMessagePayload } from './templates';

export interface SendAlimtalkInput {
  phone: string;
  message: AlimtalkMessagePayload;
}

export interface SendAlimtalkResult {
  ok: boolean;
  skipped?: boolean;
  reason?: string;
  templateCode?: string;
  rawResponse?: unknown;
}

/**
 * 카카오 알림톡 REST 연동.
 * NHN Cloud · Solapi 등 사용 중인 업체 API URL/바디에 맞게 env로 맞춥니다.
 */
export async function sendAlimtalk(
  config: AlimtalkRuntimeConfig,
  input: SendAlimtalkInput
): Promise<SendAlimtalkResult> {
  if (!config.enabled) {
    return { ok: false, skipped: true, reason: 'kakao_not_configured' };
  }

  const template = config.templates[input.message.kind];
  if (!isTemplateReady(template)) {
    return {
      ok: false,
      skipped: true,
      reason: `template_not_configured:${input.message.kind}`,
    };
  }

  const body = buildProviderBody(template, input);

  const res = await fetch(config.apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json;charset=UTF-8',
      'X-Secret-Key': config.appKey,
    },
    body: JSON.stringify(body),
  });

  const rawText = await res.text();
  let rawResponse: unknown = rawText;
  try {
    rawResponse = JSON.parse(rawText);
  } catch {
    // keep text
  }

  if (!res.ok) {
    return {
      ok: false,
      reason: `http_${res.status}`,
      templateCode: template.templateCode,
      rawResponse,
    };
  }

  return {
    ok: true,
    templateCode: template.templateCode,
    rawResponse,
  };
}

function buildProviderBody(
  template: AlimtalkTemplateConfig,
  input: SendAlimtalkInput
): Record<string, unknown> {
  // NHN Cloud Alimtalk v2.3 스타일 (다른 업체면 KAKAO_ALIMTALK_API_URL·변환만 조정)
  return {
    senderKey: template.senderKey,
    templateCode: template.templateCode,
    recipientList: [
      {
        recipientNo: input.phone,
        templateParameter: input.message.templateParameter,
      },
    ],
  };
}
