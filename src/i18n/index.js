import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
// Locale DEFAULT (EN) di-import STATIS → selalu ikut di chunk awal. Ini jaring
// pengaman: halaman selalu bisa dirender dengan terjemahan walau chunk locale
// lain gagal diunduh (offline / request diblokir). Locale non-default (ID)
// dimuat dinamis hanya saat dipilih.
import en from './locales/en.json';

const LOADERS = {
  id: () => import('./locales/id.json'),
};
const SUPPORTED = ['en', 'id'];
const FALLBACK = 'en';
const STORAGE_KEY = 'lang';
const LOAD_TIMEOUT = 3000;

/** Deteksi bahasa awal secara sinkron: localStorage → navigator → fallback. */
function detectInitial() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && SUPPORTED.includes(saved.slice(0, 2))) return saved.slice(0, 2);
  } catch { /* abaikan */ }
  const nav = (typeof navigator !== 'undefined' && navigator.language) || FALLBACK;
  const short = nav.slice(0, 2);
  return SUPPORTED.includes(short) ? short : FALLBACK;
}

function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('locale load timeout')), ms)),
  ]);
}

const loaded = new Set(['en']); // EN selalu tersedia (statis)

/** Muat locale (selain EN) secara dinamis dengan timeout. Mengembalikan true bila
 *  berhasil (atau sudah ada), false bila gagal/timeout → pemanggil pakai EN. */
async function loadLanguage(lng) {
  const code = SUPPORTED.includes(lng) ? lng : FALLBACK;
  if (loaded.has(code)) return true;
  const loader = LOADERS[code];
  if (!loader) return false;
  try {
    const mod = await withTimeout(loader(), LOAD_TIMEOUT);
    i18n.addResourceBundle(code, 'translation', mod.default || mod, true, true);
    loaded.add(code);
    return true;
  } catch {
    return false; // biarkan EN sebagai fallback
  }
}

/** Inisialisasi i18n SINKRON dengan EN (statis, sudah ter-bundle). Tidak ada
 *  await/dynamic import di jalur ini → React bisa langsung render pada first
 *  paint tanpa menunggu i18n-vendor/locale network. Mengembalikan bahasa awal
 *  terdeteksi sehingga pemanggil bisa memuat locale non-default (ID) SETELAH
 *  render pertama (di luar jalur kritis LCP). */
export function setupI18nSync() {
  const initial = detectInitial();

  // Selalu mulai dengan EN (resource dasar statis). Bila bahasa awal = ID,
  // locale-nya dimuat setelah first paint via ensureLanguage() → render ulang
  // otomatis oleh react-i18next saat bundle ID siap. Sampai itu terjadi,
  // teks EN tampil (tidak ada key/teks kosong).
  try {
    i18n
      .use(LanguageDetector)
      .use(initReactI18next)
      .init({
        lng: FALLBACK,
        resources: { en: { translation: en } },
        fallbackLng: FALLBACK,
        supportedLngs: SUPPORTED,
        partialBundledLanguages: true,
        detection: {
          order: ['localStorage', 'navigator'],
          caches: ['localStorage'],
          lookupLocalStorage: STORAGE_KEY,
        },
        interpolation: { escapeValue: false },
        initImmediate: false, // sinkron: resource inline, tanpa backend async
      });
  } catch {
    // Init gagal (sangat jarang): paksa init minimal EN agar app tetap render.
    i18n.use(initReactI18next).init({
      lng: FALLBACK,
      resources: { en: { translation: en } },
      fallbackLng: FALLBACK,
      interpolation: { escapeValue: false },
      initImmediate: false,
    });
  }

  return { initial };
}

/** Pastikan locale bahasa awal termuat & aktif. Dipanggil SETELAH first paint.
 *  Untuk EN tidak melakukan apa-apa (sudah aktif). Untuk ID, muat bundle lalu
 *  aktifkan; bila gagal/timeout tetap EN (halaman tidak kosong). */
export async function ensureLanguage(lng) {
  const code = SUPPORTED.includes((lng || '').slice(0, 2)) ? lng.slice(0, 2) : FALLBACK;
  if (code === FALLBACK) return;
  const ok = await loadLanguage(code);
  if (ok) await i18n.changeLanguage(code);
}

/** Ganti bahasa dengan aman: muat locale DULU, baru terapkan. Bila gagal/timeout,
 *  tidak mengganti (tetap bahasa sekarang) → tidak ada flash key. */
export async function changeLanguage(lng) {
  const code = SUPPORTED.includes((lng || '').slice(0, 2)) ? lng.slice(0, 2) : FALLBACK;
  const ok = await loadLanguage(code);
  if (ok) await i18n.changeLanguage(code);
}

export default i18n;
