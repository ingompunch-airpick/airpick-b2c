export type AlimtalkTemplateKind = 'airpick-b2c' | 'partner-homepage';

export interface AlimtalkTemplateConfig {
  kind: AlimtalkTemplateKind;
  /** 카카오 비즈니스에 등록한 템플릿 코드 */
  templateCode: string;
  /** 발신 프로필 키 (senderKey) */
  senderKey: string;
}

export interface AlimtalkRuntimeConfig {
  enabled: boolean;
  /** 예: https://api-alimtalk.cloud.toast.com/alimtalk/v2.3/appkeys/{appkey}/messages */
  apiUrl: string;
  appKey: string;
  templates: Record<AlimtalkTemplateKind, AlimtalkTemplateConfig>;
}

function env(name: string): string {
  return (process.env[name] ?? '').trim();
}

function readTemplate(kind: AlimtalkTemplateKind): AlimtalkTemplateConfig {
  const suffix = kind === 'airpick-b2c' ? 'AIRPICK_B2C' : 'PARTNER_HOMEPAGE';
  const templateCode = env(`KAKAO_TEMPLATE_${suffix}`);
  const senderKey =
    kind === 'partner-homepage'
      ? env('KAKAO_SENDER_KEY_PARTNER') || env('KAKAO_SENDER_KEY')
      : env('KAKAO_SENDER_KEY');

  return { kind, templateCode, senderKey };
}

export function loadAlimtalkConfig(): AlimtalkRuntimeConfig {
  const apiUrl = env('KAKAO_ALIMTALK_API_URL');
  const appKey = env('KAKAO_ALIMTALK_APP_KEY');
  const enabled = env('KAKAO_ALIMTALK_ENABLED') !== 'false' && !!apiUrl && !!appKey;

  return {
    enabled,
    apiUrl,
    appKey,
    templates: {
      'airpick-b2c': readTemplate('airpick-b2c'),
      'partner-homepage': readTemplate('partner-homepage'),
    },
  };
}

export function isTemplateReady(template: AlimtalkTemplateConfig): boolean {
  return !!template.templateCode && !!template.senderKey;
}
