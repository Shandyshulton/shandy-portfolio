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

/** Inisialisasi i18n. EN selalu ter-bundle (resource awal). Jika bahasa awal =
 *  ID, coba muat dinamis; bila gagal/timeout, tetap render dengan EN (tidak kosong). */
export async function initI18n() {
  const initial = detectInitial();

  // EN selalu ada sebagai resource dasar.
  const resources = { en: { translation: en } };

  // Jika bahasa awal ID, coba muat sebelum init agar render pertama berbahasa ID.
  let startLng = initial;
  if (initial === 'id') {
    try {
      const mod = await withTimeout(LOADERS.id(), LOAD_TIMEOUT);
      resources.id = { translation: mod.default || mod };
      loaded.add('id');
    } catch {
      startLng = FALLBACK; // gagal → mulai dengan EN (halaman tetap tampil)
    }
  }

  try {
    await i18n
      .use(LanguageDetector)
      .use(initReactI18next)
      .init({
        lng: startLng,
        resources,
        fallbackLng: FALLBACK,
        supportedLngs: SUPPORTED,
        partialBundledLanguages: true,
        detection: {
          order: ['localStorage', 'navigator'],
          caches: ['localStorage'],
          lookupLocalStorage: STORAGE_KEY,
        },
        interpolation: { escapeValue: false },
      });
  } catch {
    // Init pun gagal (sangat jarang): paksa init minimal EN agar app render.
    await i18n.use(initReactI18next).init({
      lng: FALLBACK,
      resources: { en: { translation: en } },
      fallbackLng: FALLBACK,
      interpolation: { escapeValue: false },
    });
  }

  return i18n;
}

/** Ganti bahasa dengan aman: muat locale DULU, baru terapkan. Bila gagal/timeout,
 *  tidak mengganti (tetap bahasa sekarang) → tidak ada flash key. */
export async function changeLanguage(lng) {
  const code = SUPPORTED.includes((lng || '').slice(0, 2)) ? lng.slice(0, 2) : FALLBACK;
  const ok = await loadLanguage(code);
  if (ok) await i18n.changeLanguage(code);
}

export default i18n;
