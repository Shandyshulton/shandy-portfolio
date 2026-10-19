// Agregasi laporan Lighthouse: median 5-run + elemen LCP + breakdown LCP.
// Pakai: node scripts/lh-report.mjs <prefix>  (mis. base, step2)
import { readFileSync } from 'node:fs';

const prefix = process.argv[2] ?? 'base';
const med = (a) => {
  const s = [...a].sort((x, y) => x - y);
  const n = s.length;
  return n % 2 ? s[(n - 1) / 2] : Math.round((s[n / 2 - 1] + s[n / 2]) / 2);
};

const runs = [];
for (let i = 1; i <= 5; i++) {
  try { runs.push(JSON.parse(readFileSync(`./lh/${prefix}-${i}.json`, 'utf8'))); } catch { /* skip */ }
}
if (!runs.length) { console.log('no runs found for prefix', prefix); process.exit(0); }

const pick = (r, id) => Math.round(r.audits[id]?.numericValue ?? 0);
const metrics = {
  Perf: runs.map((r) => Math.round(r.categories.performance.score * 100)),
  FCP: runs.map((r) => pick(r, 'first-contentful-paint')),
  LCP: runs.map((r) => pick(r, 'largest-contentful-paint')),
  SI: runs.map((r) => pick(r, 'speed-index')),
  TBT: runs.map((r) => pick(r, 'total-blocking-time')),
  CLS: runs.map((r) => +(r.audits['cumulative-layout-shift']?.numericValue ?? 0).toFixed(4)),
};

console.log(`\n=== ${prefix}: per-run ===`);
for (const [k, v] of Object.entries(metrics)) console.log(`${k.padEnd(5)}: ${v.join(', ')}`);
console.log(`\n=== ${prefix}: MEDIAN (${runs.length} runs) ===`);
console.log(`Perf=${med(metrics.Perf)}  FCP=${med(metrics.FCP)}ms  LCP=${med(metrics.LCP)}ms  SI=${med(metrics.SI)}ms  TBT=${med(metrics.TBT)}ms  CLS=${med(metrics.CLS.map((x) => x * 10000)) / 10000}`);

// LCP element + breakdown dari run pertama (deterministik secara struktur).
const r0 = runs[0];
const bd = r0.audits['lcp-breakdown-insight'];
if (bd?.details?.items) {
  const table = bd.details.items.find((it) => it.type === 'table');
  const node = bd.details.items.find((it) => it.type === 'node');
  console.log(`\n=== LCP element ===\n${node ? node.snippet : '(n/a)'}\n  selector: ${node ? node.selector : ''}`);
  if (table) {
    console.log('=== LCP breakdown ===');
    for (const row of table.items) console.log(`  ${row.label.padEnd(22)} ${Math.round(row.duration)}ms`);
  }
}
const disc = r0.audits['lcp-discovery-insight'];
if (disc?.details?.items) {
  const chk = disc.details.items.find((it) => it.type === 'checklist');
  if (chk) { console.log('=== LCP discovery ==='); for (const [k, v] of Object.entries(chk.items)) console.log(`  ${v.value ? 'OK ' : 'XX '} ${v.label}`); }
}
