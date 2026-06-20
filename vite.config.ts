import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'favicon-32.png', 'icon-192.png', 'icon-512.png'],
      manifest: {
        name: '에어픽',
        short_name: '에어픽',
        description: '인천공항 주차대행·eSIM 가격비교 — 업체 요금, 위치, 보험 한 번에',
        theme_color: '#3182F6',
        background_color: '#EDF4FC',
        display: 'standalone',
        lang: 'ko',
        start_url: '/',
        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable',
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
    }),
  ],
  server: {
    port: 5173,
    host: true,
  },
});
