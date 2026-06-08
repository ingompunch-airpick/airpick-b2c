import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'kr.airpick.app',
  appName: '에어픽',
  webDir: 'dist',
  android: {
    allowMixedContent: true,
  },
  server: {
    // 로컬 개발 시: npm run dev 후 아래 주석 해제하고 Mac IP로 변경
    // url: 'http://192.168.0.10:5173',
    // cleartext: true,
    androidScheme: 'https',
  },
};

export default config;
