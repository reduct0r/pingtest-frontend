import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import mkcert from 'vite-plugin-mkcert';
import fs from 'fs';
import path from 'path';

export default defineConfig({
  base: '/',
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8081',
        changeOrigin: true,
        secure: false,
      }
    },
    https: {
      key: fs.readFileSync(path.resolve(__dirname, 'cert.key')),
      cert: fs.readFileSync(path.resolve(__dirname, 'cert.crt')),
    },
  },
  plugins: [
    react(),
    mkcert(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: { enabled: false },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,svg,jpg,gif,ico}'],
      },
      manifest: {
        name: 'PINGTEST',
        short_name: 'PINGTEST',
        start_url: '/',
        display: 'standalone',
        background_color: '#fdfdfd',
        theme_color: '#db4938',
        orientation: 'portrait-primary',
        icons: [
          { src: '/logo192.png', type: 'image/png', sizes: '192x192' },
          { src: '/logo512.png', type: 'image/png', sizes: '512x512' },
        ],
      },
    }),
  ],
});