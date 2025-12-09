import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt', // Don't auto-register, let OneSignal handle it
      injectRegister: null, // Disable auto service worker registration
      // Include OneSignal workers in assets
      includeAssets: [
        'lapakbenz.png', 
        'manifest.json',
        'OneSignalSDKWorker.js',
        'OneSignalSDKUpdaterWorker.js',
        'OneSignalSDK.sw.js'
      ],
      workbox: {
        // Exclude OneSignal service workers from Workbox management
        navigateFallbackDenylist: [/^\/OneSignal/],
        // Don't precache OneSignal workers - they need to be handled separately
        globIgnores: ['**/OneSignal*.js'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/cdn\.onesignal\.com\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'onesignal-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 7 // 7 days
              }
            }
          }
        ]
      },
      manifest: {
        name: 'lapakBenz - Platform Komunitas & Event Indonesia',
        short_name: 'lapakBenz',
        description:
          'Platform komunitas terdepan untuk UMKM, otomotif, dan berbagai komunitas di Indonesia.',
        start_url: '/',
        display: 'standalone',
        background_color: '#161129',
        theme_color: '#161129',
        icons: [
          {
            src: 'lapakbenz.png',
            sizes: '192x192',
            type: 'image/png',
          },
        ],
      },
    }),
  ],
  build: {
    rollupOptions: {
      input: {
        main: './index.html',
        product: './public/product.html',
        event: './public/event.html',
        productDetail: './public/product-detail.html',
        eventDetail: './public/event-detail.html',
      },
    },
  },
});
