import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      injectRegister: null,
      // Only generate manifest, no service worker
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
