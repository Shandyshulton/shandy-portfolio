import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import './index.css';
import { setupI18nSync, ensureLanguage } from './i18n/index.js';
import App from './App.jsx';

// Buang splash statis dari index.html begitu React siap mengambil alih,
// supaya tidak menumpuk dengan BootLoader yang dirender React.
const bootSplash = document.getElementById('boot-splash');
if (bootSplash) bootSplash.remove();

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
