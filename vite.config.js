import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Analisis bundle opsional: `ANALYZE=1 npm run build` → tulis dist/stats.html.
// Tidak aktif pada build normal (tidak menambah overhead produksi).
const analyze = process.env.ANALYZE === '1'
const analyzePlugins = analyze
  ? [(await import('rollup-plugin-visualizer')).visualizer({ filename: 'dist/stats.html', template: 'treemap', gzipSize: true, brotliSize: true })]
  : []

export default defineConfig({
  plugins: [react(), ...analyzePlugins],
  build: {
    minify: 'oxc',
    cssMinify: true,
    target: 'es2022',
    reportCompressedSize: true,
    chunkSizeWarningLimit: 700,
    rolldownOptions: {
      output: {
        // Vendor dipisah agar ter-cache lama & tidak ikut invalidasi saat kode berubah.
        // NB: "advancedChunks" memunculkan warning deprecation di versi ini, namun
        // skema "codeSplitting" belum stabil → tetap pakai advancedChunks (berfungsi).
        advancedChunks: {
          groups: [
            { name: 'react-vendor', test: /node_modules[\\/](react|react-dom|react-router|react-router-dom|scheduler)[\\/]/ },
            { name: 'i18n-vendor', test: /node_modules[\\/](i18next|react-i18next|i18next-browser-languagedetector)[\\/]/ },
            { name: 'three-vendor', test: /node_modules[\\/]three[\\/]/ },
          ],
        },
      },
    },
  },
  server: {
    proxy: {
      '/api/chat': 'http://localhost:8787',
      '/cms-api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/cms-api/, ''),
      },
    },
  },
})
