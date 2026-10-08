import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Locale dimuat per-bahasa sebagai chunk dinamis. Hanya bahasa AKTIF yang
// diunduh di jalur awal; bahasa lain diunduh saat pengguna menggantinya.
// (Sebelumnya en.json + id.json ~25 KB keduanya ikut di bundle awal.)
const LOADERS = {
  en: () => import('./locales/en.json'),
  id: () => import('./locales/id.json'),
};
const SUPPORTED = ['en', 'id'];
const FALLBACK = 'en';
const STORAGE_KEY = 'lang';

/** Deteksi bahasa awal secara sinkron: localStorage → navigator → fallback.
 *  Logika ini menyamai detector sebelumnya (order: localStorage, navigator). */
function detectInitial() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && SUPPORTED.includes(saved.slice(0, 2))) return saved.slice(0, 2);
  } catch { /* abaikan */ }
  const nav = (typeof navigator !== 'undefined' && navigator.language) || FALLBACK;
  const short = nav.slice(0, 2);
  return SUPPORTED.includes(short) ? short : FALLBACK;
}

const loaded = new Set();

async function loadLanguage(lng) {
  const code = SUPPORTED.includes(lng) ? lng : FALLBACK;
  if (loaded.has(code)) return;
  const mod = await LOADERS[code]();
  i18n.addResourceBundle(code, 'translation', mod.default || mod, true, true);
  loaded.add(code);
}

/** Inisialisasi i18n dengan HANYA bahasa aktif. Dipanggil & di-await di main.jsx
 *  agar resource siap sebelum render pertama (tanpa flash teks). */
export async function initI18n() {
  const initial = detectInitial();
  const mod = await LOADERS[initial]();

  await i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      lng: initial,
      resources: { [initial]: { translation: mod.default || mod } },
      fallbackLng: FALLBACK,
      supportedLngs: SUPPORTED,
      // partialBundledLanguages: izinkan init tanpa semua bahasa ter-bundle.
      partialBundledLanguages: true,
      detection: {
        order: ['localStorage', 'navigator'],
        caches: ['localStorage'],
        lookupLocalStorage: STORAGE_KEY,
      },
      interpolation: { escapeValue: false },
    });

  loaded.add(initial);

  // Fallback aman: jika suatu saat bahasa berubah tanpa lewat helper di bawah,
  // tetap pastikan locale-nya dimuat lalu re-render.
  i18n.on('languageChanged', (lng) => {
    const code = (lng || '').slice(0, 2);
    if (SUPPORTED.includes(code) && !loaded.has(code)) {
      loadLanguage(code).then(() => i18n.changeLanguage(code));
    }
  });

  return i18n;
}

/** Ganti bahasa dengan aman: muat locale (dynamic import) DULU, baru terapkan.
 *  Mencegah teks hilang sesaat saat bundle bahasa baru masih diunduh. */
export async function changeLanguage(lng) {
  const code = SUPPORTED.includes((lng || '').slice(0, 2)) ? lng.slice(0, 2) : FALLBACK;
  await loadLanguage(code);
  await i18n.changeLanguage(code);
}

export default i18n;
