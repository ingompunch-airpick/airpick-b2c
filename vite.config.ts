import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.dirname(fileURLToPath(import.meta.url));

/** /parking · /esim → 전용 HTML 엔트리 (dev · preview) */
function hubHtmlRewrite() {
  const hubs: Record<string, string> = {
    '/parking': '/parking.html',
    '/esim': '/esim.html',
  };
  const rewrite = (req: { url?: string }, _res: unknown, next: () => void) => {
    const raw = req.url ?? '';
    const pathOnly = raw.split('?')[0] ?? '';
    const dest = hubs[pathOnly];
    if (dest) {
      const qs = raw.includes('?') ? raw.slice(raw.indexOf('?')) : '';
      req.url = `${dest}${qs}`;
    }
    next();
  };
  return {
    name: 'hub-html-rewrite',
    configureServer(server: { middlewares: { use: (fn: typeof rewrite) => void } }) {
      server.middlewares.use(rewrite);
    },
    configurePreviewServer(server: { middlewares: { use: (fn: typeof rewrite) => void } }) {
      server.middlewares.use(rewrite);
    },
  };
}

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    hubHtmlRewrite(),
    VitePWA({
      // 새 SW가 오면 바로 활성화 → 다음 로드부터 최신 셸
      registerType: 'autoUpdate',
      devOptions: {
        enabled: false,
      },
      // 아이콘만 precache. robots/sitemap/SEO HTML은 SW에 넣지 않음(구버전 고착 방지)
      includeAssets: ['favicon-48.png', 'favicon-32.png', 'icon-192.png', 'icon-512.png'],
      workbox: {
        cleanupOutdatedCaches: true,
        // HTML은 index.html만(폴백용). about/faq/privacy·검증·sitemap 등은 제외
        globPatterns: [
          '**/*.{js,css,ico,png,svg,webmanifest}',
          'index.html',
          'parking.html',
          'esim.html',
        ],
        globIgnores: [
          '**/about/**',
          '**/faq/**',
          '**/privacy/**',
          '**/guides/**',
          '**/robots.txt',
          '**/sitemap.xml',
          '**/seo.css',
          '**/naver*.html',
          '**/google*.html',
          '**/shared/**',
        ],
        navigateFallback: 'index.html',
        // 알려진 앱 경로만 SPA 폴백 — 그 외는 네트워크(Hosting 404)로
        navigateFallbackAllowlist: [
          /^\/$/,
          /^\/parking$/,
          /^\/esim$/,
          /^\/my$/,
          /^\/r\/[^/]+$/,
          /^\/admin\/reviews$/,
        ],
        navigateFallbackDenylist: [
          /^\/robots\.txt$/,
          /^\/sitemap\.xml$/,
          /^\/seo\.css$/,
          /^\/about(?:\/|$)/,
          /^\/faq(?:\/|$)/,
          /^\/privacy(?:\/|$)/,
          /^\/guides(?:\/|$)/,
          /^\/api(?:\/|$)/,
          /^\/naver[\w-]+\.html$/,
          /^\/google[\w-]+\.html$/,
        ],
        runtimeCaching: [
          // 해시된 빌드 에셋 — 오래 캐시 (파일명 해시로 버전 분리)
          {
            urlPattern: /\/assets\/.+\.(?:js|css)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'build-assets',
              expiration: {
                maxEntries: 64,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          // 정적 SEO·검증 파일 — SW 캐시 금지 (항상 네트워크)
          {
            urlPattern: /\/(?:robots\.txt|sitemap\.xml|seo\.css|(?:naver|google)[\w-]+\.html)$/i,
            handler: 'NetworkOnly',
          },
          // about/faq/privacy 정적 HTML — 네트워크 우선, 최대 1시간
          {
            urlPattern: /\/(?:about|faq|privacy|guides)(?:\/|$)/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'seo-html',
              networkTimeoutSeconds: 3,
              expiration: {
                maxEntries: 12,
                maxAgeSeconds: 60 * 60,
              },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
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
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(rootDir, 'index.html'),
        parking: path.resolve(rootDir, 'parking.html'),
        esim: path.resolve(rootDir, 'esim.html'),
      },
    },
  },
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
      '/api/admin/reviews': {
        target: 'https://asia-northeast3-airpick-reservation.cloudfunctions.net',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/admin\/reviews/, '/listAdminReviews'),
      },
      '/api/admin/review-moderate': {
        target: 'https://asia-northeast3-airpick-reservation.cloudfunctions.net',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/admin\/review-moderate/, '/moderateReview'),
      },
    },
  },
});
