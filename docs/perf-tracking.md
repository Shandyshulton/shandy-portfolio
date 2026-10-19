# Perf tracking (repo build, local preview, mobile, simulated throttling, 5-run median)

Metodologi: `npm run build` → `vite preview --port 4173` → `lighthouse --preset=perf --form-factor=mobile --screenEmulation.mobile --throttling-method=simulate` ×5 → median via `scripts/lh-report.mjs`.

Catatan: angka lab lokal lebih optimistis dari PSI lapangan (TTFB lokal ~18ms vs Slow 4G ~100ms+). Delta antar-langkah di mesin yang sama adalah yang valid. Skor PSI final tetap harus diukur setelah deploy ke Vercel.

LCP element (baseline) = `<p class="hero-bio">` (teks hero). Breakdown: TTFB ~18ms, **element render delay ~696ms** (dominan) → klasik SPA: hero nunggu JS.

| Langkah | Perf | FCP (ms) | LCP (ms) | SI (ms) | TBT (ms) | CLS | Catatan |
|---|---|---|---|---|---|---|---|
| Baseline | 85 | 1741 | 2025 | 2360 | 517 | 0.0015 | build repo ini |
| Step 2: self-host font + preload 2 | 84 | 1910 | 2648 | 2176 | 386 | 0.0001 | preload font REBUT prioritas JS → LCP naik. Preload dibuang. |
| Step 2b: self-host, tanpa preload | 85 | 1897 | 2353 | 2098 | 483 | 0.0015 | lab lokal ~flat/sedikit buruk (dalam noise). TETAP dipakai: menghapus 2 handshake cross-origin ke Google Fonts yang hanya terasa di Slow 4G (kondisi PSI). Verdict asli = PSI produksi. |

**Keputusan Step 2:** pertahankan self-host (hapus dependensi render-blocking pihak ketiga = temuan PSI #1/#2), buang preload font. Lab lokal tidak menunjukkan menang karena tak memodelkan biaya koneksi cross-origin Slow 4G. LCP tetap didominasi *element render delay* (~540ms) → akar masalah ada di Step 3 (prerender), bukan font.

## Step 3 — Static hero pre-paint (Opsi 1)

A/B adil 10-run (mesin & sesi sama), karena baseline 5-run awal ternyata cluster beruntung (LCP 2025 tidak representatif):

| Variant | LCP sim (median 10) | FCP sim | LCP observed (paint nyata) | CLS |
|---|---|---|---|---|
| Tanpa pre-paint (self-host font) | 2585ms | 2188ms | 713ms | 0.0015 |
| **Dengan pre-paint (Step 3)** | 2600ms | ~2030ms | **457ms** | **0.0001** |

**Temuan:** pre-paint memperbaiki FCP (~160ms), memangkas waktu paint NYATA (observed LCP 713→457ms), dan CLS (→0.0001). Tapi **LCP simulasi flat** karena Lighthouse me-reattribute LCP ke node `p.hero-bio` BARU yang dibuat React (React mengganti DOM pre-paint, bukan hydrate). Untuk menurunkan LCP simulasi perlu hydration (Opsi 2/full SSG) yang sengaja tidak diambil karena risiko flash.

**Keputusan Step 3:** PERTAHANKAN. Menang di FCP + paint nyata + CLS, tanpa dependency baru, risiko rendah. Verifikasi visual handoff pre-paint→React: tidak ada animasi nama dobel (flag `html[data-prepainted]` mematikan rise sekali di muat awal).



## Step 4 — Critical path (hero tidak nunggu CMS/chat)

Sudah terpenuhi oleh arsitektur + pre-paint. Urutan request (observed LCP ~457ms):
- `/` (25ms, berisi pre-paint hero) → `hero-poster.webp` (86ms, preload) → JS kritis + CSS (91–113ms) → font (210ms, display:swap).
- CMS `/public/settings` (457ms) & `/public/stats` (482ms) = **di/ setelah LCP**, tidak memblokir hero.
- Chatbot script (637ms+), Vercel insights (1054ms+) = jauh setelah LCP.

Hero memakai fallback statis (`fallbackProfile` + i18n EN ter-bundle). **Tidak ada perubahan kode di Step 4.**

Catatan kecil (tidak diubah): `PP.webp` (foto About, di bawah fold, `loading=lazy`) ter-fetch ~398ms via `<source srcset>` picture. Tidak memblokir LCP; dibiarkan agar lazy-load tidak rusak.


## Step 5 — Bundle (visualizer)

Dipasang `rollup-plugin-visualizer` (dev-only, via `ANALYZE=1 npm run build` → `dist/stats.html`; build normal tidak terpengaruh).

Initial path (modulepreload) = hanya 3 chunk kritis + entry:
- `index` entry 59 KB (App+Navbar+Footer+Home+lucide subset+react-helmet)
- `react-vendor` 225 KB (React 19 + react-router v7 + scheduler) — irreducible tanpa ganti framework
- `i18n-vendor` 53 KB — kritis karena `<Home>` pakai `useTranslation()` saat render pertama
- `rolldown-runtime` 0.7 KB

Sudah lazy (TIDAK di initial path): three-vendor (542 KB), Chatbot (156 KB), semua route, Scene3D. Sudah optimal.

**Keputusan Step 5:** tidak ada chunk yang bisa dipindah ke dynamic import tanpa merusak render hero. modulepreload sudah tepat (hanya 3 kritis). react-helmet-async dibiarkan (dipakai semua route untuk meta dinamis; melepas = risiko SEO untuk hemat ~beberapa KB). **Tidak ada perubahan bundle.**


## Step 6 — Hosting (Vercel)

- **Brotli:** aktif otomatis di edge Vercel (diverifikasi live: `Content-Encoding: br` untuk JS & CSS). Tidak perlu config. woff2 tidak di-recompress (sudah terkompresi).
- **Cache `/assets/*`:** sudah `public, max-age=31536000, immutable` di `vercel.json` repo ini. CATATAN: produksi LAMA ternyata `max-age=0, must-revalidate` (tidak immutable) → repeat-visit lambat. Begitu repo ini deploy, aset hashed ter-cache 1 tahun immutable.
- **Ditambah:** header `public, max-age=31536000, immutable` untuk `/fonts/*`, dan `fonts/` dikecualikan dari SPA rewrite (agar font 404 tidak jadi index.html).

**File diubah Step 6:** `vercel.json`.


## Hasil akhir (semua langkah, 5-run median, build repo ini, lokal, mobile, simulated)

| Metrik | Baseline (fair 10-run) | Final | Delta |
|---|---|---|---|
| Perf | ~85 | **93** | +8 |
| FCP | 2188ms | 2173ms | ~ (membaik di observed) |
| LCP (sim) | 2585ms | 2566ms | ~flat (lihat catatan) |
| LCP (observed/paint nyata) | 713ms | **454ms** | −259ms |
| SI | ~2360ms | 2173ms | −187ms |
| TBT | 517ms | **148ms** | **−369ms** |
| CLS | 0.0015 | **0.0001** | membaik |
| A11y | 100 | 100 | = |
| SEO | 100 | 100 | = |
| Best Practices | 96 | 96 | = (hanya network error backend di preview) |

**Catatan LCP simulasi flat:** elemen LCP = teks hero yang di-render React. Pre-paint mempercepat paint NYATA (observed 713→454ms) & FCP, tapi Lighthouse simulated me-reattribute LCP ke node React. Menurunkan LCP simulasi butuh hydration penuh (full SSG) yang sengaja tidak diambil (risiko flash, perintah "jangan ubah desain/layout"). TBT turun drastis (−369ms) kemungkinan efek gabungan self-host font (hapus kerja parse CSS Google Fonts) + pre-paint mengurangi kerja layout awal.

**Verdict sahih = PSI produksi setelah deploy repo ini.** Angka lokal hanya pembanding antar-langkah di mesin sama.
