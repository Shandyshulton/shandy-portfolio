// Generates a lightweight hero "facade" poster (WebP) that mimics the look of
// the live Three.js scene (dark space bg + orange core glow + blue tech nodes).
// Used as an instant, GPU-free backdrop so PageSpeed/no-GPU devices never pay
// the cost of software WebGL. Target: < 40 KB, no layout shift (object-fit:cover).
//
// Run with: node scripts/gen-hero-poster.mjs
import sharp from 'sharp';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs/promises';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.resolve(__dirname, '..', 'public', 'images');

// Ukuran poster: cukup besar untuk tampil tajam di latar, tapi kecil agar < 40KB.
// object-fit: cover akan menyesuaikan ke berbagai rasio tanpa menggeser layout.
const W = 1200;
const H = 1600;

// SVG menyerupai palette scene (lihat PALETTE.dark di Scene3D.jsx):
// bg #070816, core/glow #ff6a3d, node biru #9fb8ff, grid #1d2154.
const svg = `
<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="space" cx="62%" cy="34%" r="85%">
      <stop offset="0%" stop-color="#0d1024"/>
      <stop offset="55%" stop-color="#090a1c"/>
      <stop offset="100%" stop-color="#050610"/>
    </radialGradient>
    <radialGradient id="coreGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#ff8a5a" stop-opacity="0.95"/>
      <stop offset="35%" stop-color="#ff6a3d" stop-opacity="0.55"/>
      <stop offset="100%" stop-color="#ff6a3d" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="blueGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#9fb8ff" stop-opacity="0.5"/>
      <stop offset="100%" stop-color="#9fb8ff" stop-opacity="0"/>
    </radialGradient>
    <filter id="soft"><feGaussianBlur stdDeviation="6"/></filter>
  </defs>

  <rect width="${W}" height="${H}" fill="url(#space)"/>

  <!-- halo biru jauh -->
  <circle cx="300" cy="1180" r="420" fill="url(#blueGlow)" opacity="0.6"/>
  <circle cx="980" cy="520" r="520" fill="url(#blueGlow)" opacity="0.5"/>

  <!-- glow inti oranye (fokus visual, ~ posisi core scene) -->
  <circle cx="760" cy="560" r="520" fill="url(#coreGlow)"/>

  <!-- inti ikosahedron (disederhanakan jadi poligon) -->
  <g transform="translate(760 560)" filter="url(#soft)">
    <polygon points="0,-150 130,-75 130,75 0,150 -130,75 -130,-75"
             fill="#ff6a3d" fill-opacity="0.9"/>
    <polygon points="0,-150 130,75 -130,75" fill="#ff8a5a" fill-opacity="0.5"/>
  </g>

  <!-- node tech (titik biru metalik di cincin) -->
  ${[
    [430, 420, 16], [1040, 470, 14], [980, 760, 18], [520, 820, 15],
    [300, 600, 12], [820, 300, 13], [1080, 980, 12], [600, 300, 11],
    [410, 980, 14], [900, 1040, 13],
  ].map(([x, y, r]) =>
    `<circle cx="${x}" cy="${y}" r="${r}" fill="#9fb8ff" fill-opacity="0.9"/>` +
    `<circle cx="${x}" cy="${y}" r="${r * 2.4}" fill="#9fb8ff" fill-opacity="0.12"/>`
  ).join('\n  ')}

  <!-- sparks halus -->
  ${Array.from({ length: 40 }, () => {
    const x = Math.round(Math.random() * W);
    const y = Math.round(Math.random() * H);
    const o = (0.15 + Math.random() * 0.4).toFixed(2);
    return `<circle cx="${x}" cy="${y}" r="2" fill="#bcd0ff" fill-opacity="${o}"/>`;
  }).join('\n  ')}

  <!-- grid lantai samar -->
  <g stroke="#1d2154" stroke-opacity="0.5" stroke-width="2">
    ${Array.from({ length: 10 }, (_, i) => {
      const y = 1240 + i * 36;
      return `<line x1="0" y1="${y}" x2="${W}" y2="${y}"/>`;
    }).join('\n    ')}
  </g>
</svg>`;

async function run() {
  await fs.mkdir(outDir, { recursive: true });
  const out = path.join(outDir, 'hero-poster.webp');
  const buf = await sharp(Buffer.from(svg))
    .webp({ quality: 70, effort: 6 })
    .toBuffer();
  await fs.writeFile(out, buf);
  const kb = (buf.length / 1024).toFixed(1);
  console.log(`hero-poster.webp -> ${kb} KiB (${W}x${H})`);
  if (buf.length > 40 * 1024) {
    console.warn(`WARNING: poster > 40 KiB (${kb} KiB). Turunkan quality.`);
    process.exitCode = 1;
  }
}

run();
