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
  // Chatbot avatar: ditampilkan ~58px, 2x retina => 128px sudah cukup.
  { src: 'shara.webp', out: 'shara.webp', width: 128, height: 128, format: 'webp', quality: 78 },
  // Hero photo: ditampilkan ~220x293, 2x retina => width 480 sudah cukup.
  { src: 'images/PP.jpeg', out: 'images/PP.webp', width: 480, format: 'webp', quality: 78 },
  // Also produce an optimized JPEG fallback for og:image / older clients.
  { src: 'images/PP.jpeg', out: 'images/PP.optimized.jpeg', width: 1200, format: 'jpeg', quality: 78 },
];

async function run() {
  for (const job of jobs) {
    const srcPath = path.join(publicDir, job.src);
    const outPath = path.join(publicDir, job.out);
    try {
      const before = (await fs.stat(srcPath)).size;
      const inputBuffer = await fs.readFile(srcPath);
      let pipeline = sharp(inputBuffer).resize({
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

      await fs.writeFile(outPath, await pipeline.toBuffer());
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
