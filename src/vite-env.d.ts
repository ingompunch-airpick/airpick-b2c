/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/vanillajs" />
/// <reference types="navermaps" />

interface ImportMetaEnv {
  readonly VITE_NAVER_MAP_NCP_KEY_ID?: string;
  readonly VITE_PORTONE_ENABLED?: string;
  readonly VITE_PORTONE_STORE_ID?: string;
  /** 포트원 → 토스페이먼츠 채널키 (테스트/실연동) */
  readonly VITE_PORTONE_CHANNEL_KEY_TOSS?: string;
}
