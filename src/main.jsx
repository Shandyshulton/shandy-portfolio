import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import './index.css';
import { setupI18nSync, ensureLanguage } from './i18n/index.js';
import App from './App.jsx';

// Buang pre-paint hero statis (index.html) tepat sebelum React mengambil alih
// #root. Pre-paint sudah menjadi elemen LCP (paint instan). Set flag di <html>
// agar animasi "char-rise" nama hero TIDAK diputar ulang pada first paint
// (mencegah kesan nama ter-reset/animasi dobel). Navigasi berikutnya normal.
const preHero = document.getElementById('pre-hero');
if (preHero) {
  document.documentElement.dataset.prepainted = '1';
  preHero.remove();
}

// i18n di-init SINKRON dengan EN (statis). React langsung render tanpa menunggu
// network/locale → first paint tidak lagi diblokir rantai i18n (LCP/FCP lebih
// cepat). Locale bahasa awal (mis. ID) dimuat SETELAH render pertama.
const { initial } = setupI18nSync();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </StrictMode>,
);

// Muat locale non-default (ID) di luar jalur kritis. Untuk EN ini no-op. Saat
// bundle ID siap, react-i18next memicu render ulang otomatis (teks beralih dari
// EN → ID tanpa flash key). Dijadwalkan setelah first paint.
if (initial !== 'en') {
  const run = () => { ensureLanguage(initial); };
  if ('requestIdleCallback' in window) window.requestIdleCallback(run, { timeout: 1200 });
  else window.setTimeout(run, 0);
}
