// Dev server kecil untuk menjalankan api/chat.js (Vercel Function) di local.
// Dipakai bersama vite (proxy /api/chat → http://localhost:8787) lewat:
//   npm run dev:api   (terminal 1)
//   npm run dev       (terminal 2)
//
// Membaca env dari .env (GROQ_API_KEY, VITE_CMS_API_URL dipakai sebagai CMS_API_URL).

import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const PORT = Number(process.env.PORT) || 8787;

// Load .env sederhana (dukung GROQ_API_KEY & CMS_API_URL)
try {
  const envRaw = readFileSync(join(root, '.env'), 'utf8');
  for (const line of envRaw.split(/\r?\n/)) {
    const m = line.match(/^([A-Z_]+)=(.*)$/);
    if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2];
  }
  // VITE_CMS_API_URL dipakai frontend; untuk function kita pakai CMS_API_URL
  if (!process.env.CMS_API_URL && process.env.VITE_CMS_API_URL) {
    process.env.CMS_API_URL = process.env.VITE_CMS_API_URL;
  }
} catch {
  // .env tidak ada — biarkan env kosong (function akan error jelas saat dipanggil)
}

const { default: handler } = await import('../api/chat.js');

const server = createServer((req, res) => {
  const chunks = [];
  req.on('data', (c) => chunks.push(c));
  req.on('end', () => {
    const rawBody = Buffer.concat(chunks).toString('utf8');
    let body = {};
    if (rawBody) {
      try {
        body = JSON.parse(rawBody);
      } catch {
        // biarkan body kosong
      }
    }

    const vercelRes = {
      statusCode: 200,
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(payload) {
        const text = JSON.stringify(payload);
        res.writeHead(this.statusCode, {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        });
        res.end(text);
      },
      setHeader(name, value) {
        res.setHeader(name, value);
      },
      end() {
        if (!res.headersSent) res.writeHead(this.statusCode ?? 200);
        res.end();
      },
    };

    const vercelReq = {
      method: req.method,
      headers: req.headers,
      body,
      query: {},
    };

    handler(vercelReq, vercelRes).catch((err) => {
      console.error('[dev:api] handler error:', err);
      if (!res.headersSent) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Internal server error' }));
      }
    });
  });
});

server.listen(PORT, () => {
  console.log(`[dev:api] api/chat.js berjalan di http://localhost:${PORT}`);
  console.log(`          Vite akan proxy /api/chat ke sini. Jalankan juga: npm run dev`);
});
