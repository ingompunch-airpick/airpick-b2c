/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/vanillajs" />
/// <reference types="navermaps" />

interface ImportMetaEnv {
  readonly VITE_NAVER_MAP_NCP_KEY_ID?: string;
  readonly VITE_PORTONE_ENABLED?: string;
  readonly VITE_PORTONE_STORE_ID?: string;
  readonly VITE_PORTONE_CHANNEL_KEY_INICIS?: string;
  readonly VITE_PORTONE_CHANNEL_KEY_KPN?: string;
}
