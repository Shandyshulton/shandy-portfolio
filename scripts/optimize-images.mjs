// Image optimization script.
// Generates resized WebP variants + a small favicon PNG from the large source images.
// Run with: npm run optimize:images
import sharp from 'sharp';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs/promises';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.resolve(__dirname, '..', 'public');

/**
 * @type {Array<{
 *   src: string,
 *   out: string,
 *   width: number,
 *   height?: number,
 *   format: 'webp' | 'png',
 *   quality?: number,
 * }>}
 */
const jobs = [
  // Chatbot avatar: displayed at ~102px, keep 2x for retina => 256px.
  { src: 'shara.png', out: 'shara.webp', width: 256, height: 256, format: 'webp', quality: 82 },
  // Hero photo: displayed ~292x356, keep 2x => width 640.
  { src: 'images/PP.jpeg', out: 'images/PP.webp', width: 640, format: 'webp', quality: 80 },
  // Also produce an optimized JPEG fallback for og:image / older clients.
  { src: 'images/PP.jpeg', out: 'images/PP.optimized.jpeg', width: 1200, format: 'jpeg', quality: 78 },
  // Favicon: only needs to be small.
  { src: 'favicon.png', out: 'favicon-32.png', width: 32, height: 32, format: 'png' },
  { src: 'favicon.png', out: 'favicon-180.png', width: 180, height: 180, format: 'png' },
];

async function run() {
  for (const job of jobs) {
    const srcPath = path.join(publicDir, job.src);
    const outPath = path.join(publicDir, job.out);
    try {
      const before = (await fs.stat(srcPath)).size;
      let pipeline = sharp(srcPath).resize({
        width: job.width,
        height: job.height,
        fit: 'cover',
        withoutEnlargement: true,
      });

      if (job.format === 'webp') {
        pipeline = pipeline.webp({ quality: job.quality ?? 80 });
      } else if (job.format === 'jpeg') {
        pipeline = pipeline.jpeg({ quality: job.quality ?? 80, mozjpeg: true });
      } else if (job.format === 'png') {
        pipeline = pipeline.png({ compressionLevel: 9, palette: true });
      }

      await pipeline.toFile(outPath);
      const after = (await fs.stat(outPath)).size;
      const saved = before - after;
      console.log(
        `${job.src} (${(before / 1024).toFixed(1)} KiB) -> ${job.out} (${(after / 1024).toFixed(1)} KiB)` +
          `  saved ${(saved / 1024).toFixed(1)} KiB`
      );
    } catch (err) {
      console.error(`Failed: ${job.src} -> ${job.out}:`, err.message);
      process.exitCode = 1;
    }
  }
}

run();
