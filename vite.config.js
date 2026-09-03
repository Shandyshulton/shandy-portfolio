import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Di local, /api/chat dilayani oleh scripts/dev-api.mjs (npm run dev:api).
      // Di production, Vercel Function yang melayani path ini.
      '/api/chat': 'http://localhost:8787',
    },
  },
})
