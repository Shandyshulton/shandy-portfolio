// Unduh woff2 (subset latin) untuk font yang dipakai, langsung dari Google Fonts.
// Meminta CSS dengan UA modern → Google balas @font-face woff2 + unicode-range.
// Kita ambil blok "latin" saja (bukan latin-ext/vietnamese) agar file kecil.
import { mkdir, writeFile } from 'node:fs/promises';

const OUT = 'public/fonts';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36';

// family → daftar spesifikasi (axis tanpa italic) + flag italic
const FAMILIES = [
  { css: 'Syne:wght@500;700;800', slug: 'syne' },
  { css: 'Outfit:wght@400;500;600', slug: 'outfit' },
  { css: 'DM+Mono:wght@400;500', slug: 'dm-mono' },
  { css: 'Playfair+Display:ital,wght@1,700', slug: 'playfair' },
];

async function getCss(familyCss) {
  const url = `https://fonts.googleapis.com/css2?family=${familyCss}&display=swap`;
  const res = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!res.ok) throw new Error(`CSS fetch ${res.status} for ${familyCss}`);
  return res.text();
}

// Pecah CSS jadi blok @font-face, ambil hanya yang komentar/subset-nya "latin".
function latinFaces(css) {
  const faces = [];
  const re = /\/\*\s*([a-z-]+)\s*\*\/\s*@font-face\s*{([^}]+)}/g;
  let m;
  while ((m = re.exec(css))) {
    const subset = m[1];
    if (subset !== 'latin') continue;
    const body = m[2];
    const weight = (body.match(/font-weight:\s*(\d+)/) || [])[1] || '400';
    const style = /font-style:\s*italic/.test(body) ? 'italic' : 'normal';
    const src = (body.match(/url\(([^)]+\.woff2)\)/) || [])[1];
    if (src) faces.push({ subset, weight, style, src });
  }
  return faces;
}

const manifest = [];
await mkdir(OUT, { recursive: true });
for (const fam of FAMILIES) {
  const css = await getCss(fam.css);
  const faces = latinFaces(css);
  for (const f of faces) {
    const name = `${fam.slug}-${f.weight}${f.style === 'italic' ? 'i' : ''}.woff2`;
    const bin = Buffer.from(await (await fetch(f.src, { headers: { 'User-Agent': UA } })).arrayBuffer());
    await writeFile(`${OUT}/${name}`, bin);
    manifest.push({ slug: fam.slug, weight: f.weight, style: f.style, file: name, bytes: bin.length });
    console.log(`saved ${name} (${bin.length} B)`);
  }
}
console.log('\nMANIFEST:', JSON.stringify(manifest, null, 2));
