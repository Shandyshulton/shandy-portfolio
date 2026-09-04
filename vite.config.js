import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    minify: 'oxc',
    cssMinify: true,
  },
  server: {
    proxy: {
      // Di local, /api/chat dilayani oleh scripts/dev-api.mjs (npm run dev:api).
      // Di production, Vercel Function yang melayani path ini.
      '/api/chat': 'http://localhost:8787',
      // Proxy CMS lokal (Laravel di port 8000) untuk development.
      // Aktif saat VITE_CMS_API_URL=/cms-api (hindari CORS lintas-origin).
      '/cms-api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/cms-api/, ''),
      },
    },
  },
})
