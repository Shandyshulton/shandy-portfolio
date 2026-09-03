# Chatbot Backend (Vercel Function + Retrieval dari CMS)

Chatbot portfolio tidak lagi memanggil Groq langsung dari browser. Semua lalu
lintas chat lewat **satu Vercel Function** (`/api/chat`) yang:

1. Membaca konten terbaru dari **CMS Laravel** (`/public/settings`, `/public/projects`,
   `/public/experiences`, `/public/educations`, `/public/certifications`) dengan cache 10 menit.
2. Menyusun "dokumen pengetahuan" per entitas dalam bahasa sesuai pengunjung (`id`/`en`).
3. Melakukan **retrieval keyword** untuk memilih entitas relevan terhadap pertanyaan.
4. Memanggil **Groq** dengan konteks hasil retrieval + instruksi ketat "hanya jawab
   dari informasi yang diberikan".

## Alasan / keamanan

- **API key tidak bocor ke browser.** Sebelumnya `VITE_GROQ_API_KEY` di-inline ke
  bundle dan bisa dibaca siapa pun (DevTools). Sekarang key hanya ada di server
  (`process.env.GROQ_API_KEY`) dan tidak pernah dikirim ke klien.
- **Jawaban selalu mengikuti isi website.** Knowledge base dibangun dari CMS live,
  bukan string hardcoded yang bisa basi.
- **Groq tidak punya endpoint embeddings.** Retrieval memakai pencocokan keyword
  bilingual yang cukup akurat untuk ukuran konten saat ini, tanpa API key tambahan.
  Jika CMS tumbuh (blog/artikel), lihat "Menambahkan embeddings" di bawah.

## Alur request

```
Browser (src/components/Chatbot.jsx)
  → src/lib/chatApi.js  POST /api/chat  { message, history, locale }
      → api/chat.js (Vercel Function)
          → getCmsBundle(): fetch 5 endpoint CMS (cache 10 menit)
          → buildKnowledgeDocs(): chunk id/en per entitas + profil/skills/kontak
          → buildContextWithRetrieved(): gabung semua section + semua dokumen
            (data CMS kecil → muat di konteks model, jawaban jadi lengkap)
          → callGroq(): POST api.groq.com chat/completions
      ← { reply }
  → render balasan
```

## Env & deployment

| Variable | Di mana | Dipakai |
|---|---|---|
| `GROQ_API_KEY` | Vercel dashboard → Settings → Environment Variables (**tanpa** prefix `VITE_`) | `api/chat.js` (server) |
| `VITE_CMS_API_URL` | Vercel dashboard (untuk build frontend) | Halaman situs fetch data CMS |

Deploy: cukup push ke repo — Vercel otomatis mengenali folder `api/` sebagai
Functions. `vercel.json` hanya berisi rewrite SPA, tidak mengganggu route `/api/chat`.

### Menjalankan lokal

1. Install CLI: `npm i -g vercel`
2. `vercel dev` — menjalankan Vite + Functions sekaligus. Function membaca env dari
   akun Vercel (`vercel env pull`) atau dari `.env.local`.
3. Buka `http://localhost:3000`, buka widget chat, tanya sesuatu tentang isi website.

## Model

- Utama: `openai/gpt-oss-20b` (cepat, biaya rendah; tersedia di akun Groq).
- Fallback otomatis ke `qwen/qwen3.6-27b` bila model utama tidak tersedia
  (404 model) atau balasan kosong.
- Override via env `GROQ_MODEL` (server). Cek model yang tersedia di akun:
  `GET https://api.groq.com/openai/v1/models` dengan key akun.

## Struktur file

- `api/chat.js` — seluruh logika server (normalisasi CMS, bangun knowledge base, proxy Groq).
- `src/lib/chatApi.js` — helper `fetch('/api/chat')` dari browser.
- `src/components/Chatbot.jsx` — UI chat (tanpa logika LLM).
- `src/i18n/locales/{id,en}.json` — namespace `chat.*` untuk teks UI.

## Menambahkan embeddings (opsional, saat konten membesar)

Groq tidak menyediakan embeddings. Saat ini seluruh dokumen KB dikirim ke model
karena datanya kecil. Bila nanti CMS punya konten besar (blog/artikel) sehingga
tidak muat lagi di konteks:

1. Tambah endpoint `api/embed` (atau jalankan job) yang mem-embed semua dokumen
   KB dengan provider embeddings (mis. OpenAI `text-embedding-3-small`) dan simpan
   vektor (mis. tabel Postgres / upstash vector di Vercel).
2. Di `api/chat.js`, ganti pengiriman semua dokumen dengan hasil cosine-similarity
   top-k terhadap vektor pertanyaan (fungsi retrieval keyword dulu sempat ada,
   lalu dihapus karena seluruh konten masih muat di konteks).
3. Simpan API key embeddings sebagai env server-only tambahan.
