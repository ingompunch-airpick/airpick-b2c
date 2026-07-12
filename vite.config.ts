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
      devOptions: {
        enabled: false,
      },
      includeAssets: [
        'robots.txt',
        'sitemap.xml',
        'seo.css',
        'shared/airlines.json',
        'shared/reservation-schema.json',
        'shared/submit-homepage-reservation.mjs',
        'naver1d9bbd9fd5d41de5108741bfcea9902c.html',
        'favicon-48.png',
        'favicon-32.png',
        'icon-192.png',
        'icon-512.png',
      ],
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,txt,webmanifest,xml}'],
        navigateFallbackDenylist: [
          /^\/robots\.txt$/,
          /^\/sitemap\.xml$/,
          /^\/seo\.css$/,
          /^\/about(?:\/|$)/,
          /^\/faq(?:\/|$)/,
          /^\/privacy(?:\/|$)/,
          /^\/naver[\w-]+\.html$/,
        ],
      },
      manifest: {
        name: '에어픽',
        short_name: '에어픽',
        description: '인천공항 주차대행·유심·eSIM 가격비교 — 업체 요금, 위치, 보험 한 번에',
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
    proxy: {
      '/api/receipt': {
        target: 'https://asia-northeast3-airpick-reservation.cloudfunctions.net',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/receipt/, '/getReceipt'),
      },
      '/api/reservation-lookup': {
        target: 'https://asia-northeast3-airpick-reservation.cloudfunctions.net',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/reservation-lookup/, '/lookupReservation'),
      },
      '/api/reservation-cancel': {
        target: 'https://asia-northeast3-airpick-reservation.cloudfunctions.net',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/reservation-cancel/, '/cancelReservation'),
      },
      '/api/reservation-review': {
        target: 'https://asia-northeast3-airpick-reservation.cloudfunctions.net',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/reservation-review/, '/submitReview'),
      },
    },
  },
});
